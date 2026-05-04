import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  UploadPartCommand,
  type CompletedPart,
} from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import {
  addStorageTransferredBytes,
  recordStorageFailure,
  recordStorageMetric,
} from '../../dev-metrics';
import { createStorageClient } from './s3-client-factory';
import { isNotFoundError } from './s3-errors';
import { withUploadRetry } from './s3-retry';
import {
  chunkBy,
  inferContentType,
  toCopySourcePath,
} from './storage-object-policy';
import type {
  StorageDeleteResult,
  StorageProfile,
  StorageSecret,
} from './storage-contracts';

const MULTIPART_UPLOAD_THRESHOLD_BYTES = 64 * 1024 * 1024;
const MULTIPART_UPLOAD_PART_BYTES = 8 * 1024 * 1024;

export const uploadStorageObject = async (
  profile: StorageProfile,
  secret: StorageSecret,
  input: {
    key: string;
    sourcePath: string;
    sourceSize?: number;
    abortSignal?: AbortSignal;
  },
): Promise<void> => {
  const client = createStorageClient(profile, secret);
  const contentType = inferContentType(input.key);

  try {
    const sourceStats = await stat(input.sourcePath);
    const resolvedSourceSize = sourceStats.size;
    recordStorageMetric('putCalls');
    const shouldUseMultipart =
      resolvedSourceSize >= MULTIPART_UPLOAD_THRESHOLD_BYTES;

    if (!shouldUseMultipart) {
      const uploadBody = await readFile(input.sourcePath);
      await withUploadRetry(() =>
        client.send(
          new PutObjectCommand({
            Bucket: profile.bucket,
            Key: input.key,
            Body: uploadBody,
            ContentType: contentType,
            ContentLength: resolvedSourceSize,
          }),
          input.abortSignal ? { abortSignal: input.abortSignal } : undefined,
        ),
      );
      addStorageTransferredBytes({ bytesUploaded: resolvedSourceSize });
      return;
    }

    const createResult = await withUploadRetry(() =>
      client.send(
        new CreateMultipartUploadCommand({
          Bucket: profile.bucket,
          Key: input.key,
          ContentType: contentType,
        }),
        input.abortSignal ? { abortSignal: input.abortSignal } : undefined,
      ),
    );

    if (!createResult.UploadId) {
      throw new Error('Multipart upload did not return UploadId');
    }

    const uploadId = createResult.UploadId;
    const completedParts: CompletedPart[] = [];

    try {
      const partCount = Math.ceil(resolvedSourceSize / MULTIPART_UPLOAD_PART_BYTES);
      for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
        const offset = (partNumber - 1) * MULTIPART_UPLOAD_PART_BYTES;
        const partLength = Math.min(
          MULTIPART_UPLOAD_PART_BYTES,
          resolvedSourceSize - offset,
        );

        const uploadPartResult = await withUploadRetry(() =>
          client.send(
            new UploadPartCommand({
              Bucket: profile.bucket,
              Key: input.key,
              UploadId: uploadId,
              PartNumber: partNumber,
              ContentLength: partLength,
              Body: createReadStream(input.sourcePath, {
                start: offset,
                end: offset + partLength - 1,
              }),
            }),
            input.abortSignal ? { abortSignal: input.abortSignal } : undefined,
          ),
        );

        if (!uploadPartResult.ETag) {
          throw new Error(`Multipart part upload missing ETag for part ${partNumber}`);
        }

        completedParts.push({
          ETag: uploadPartResult.ETag,
          PartNumber: partNumber,
        });
      }

      await withUploadRetry(() =>
        client.send(
          new CompleteMultipartUploadCommand({
            Bucket: profile.bucket,
            Key: input.key,
            UploadId: uploadId,
            MultipartUpload: {
              Parts: completedParts,
            },
          }),
          input.abortSignal ? { abortSignal: input.abortSignal } : undefined,
        ),
      );
      addStorageTransferredBytes({ bytesUploaded: resolvedSourceSize });
    } catch (error) {
      try {
        await withUploadRetry(() =>
          client.send(
            new AbortMultipartUploadCommand({
              Bucket: profile.bucket,
              Key: input.key,
              UploadId: uploadId,
            }),
            input.abortSignal ? { abortSignal: input.abortSignal } : undefined,
          ),
        );
      } catch {
        // Best-effort cleanup only.
      }
      throw error;
    }
  } catch (error) {
    recordStorageFailure();
    throw error;
  } finally {
    client.destroy();
  }
};

export const copyStorageObject = async (
  profile: StorageProfile,
  secret: StorageSecret,
  input: {
    fromKey: string;
    toKey: string;
  },
): Promise<void> => {
  const client = createStorageClient(profile, secret);

  try {
    recordStorageMetric('putCalls');
    await client.send(
      new CopyObjectCommand({
        Bucket: profile.bucket,
        Key: input.toKey,
        CopySource: toCopySourcePath(profile.bucket, input.fromKey),
      }),
    );
  } catch (error) {
    recordStorageFailure();
    throw error;
  } finally {
    client.destroy();
  }
};

export const deleteStorageObjects = async (
  profile: StorageProfile,
  secret: StorageSecret,
  input: {
    keys: string[];
  },
): Promise<StorageDeleteResult> => {
  if (input.keys.length === 0) {
    return {
      deleted: [],
      skipped: [],
    };
  }

  const client = createStorageClient(profile, secret);
  const deleted = new Set<string>();
  const skipped = new Set<string>();

  try {
    for (const keysChunk of chunkBy(input.keys, 1000)) {
      try {
        const result = await client.send(
          new DeleteObjectsCommand({
            Bucket: profile.bucket,
            Delete: {
              Objects: keysChunk.map((key) => ({ Key: key })),
              Quiet: false,
            },
          }),
        );
        for (const entry of result.Deleted ?? []) {
          if (entry.Key) {
            deleted.add(entry.Key);
          }
        }
        for (const entry of result.Errors ?? []) {
          if (entry.Key) {
            skipped.add(entry.Key);
          }
        }
      } catch (error) {
        recordStorageFailure();
        for (const key of keysChunk) {
          skipped.add(key);
        }
        if (!isNotFoundError(error)) {
          continue;
        }
      }
    }
  } finally {
    client.destroy();
  }

  for (const key of input.keys) {
    if (!deleted.has(key) && !skipped.has(key)) {
      skipped.add(key);
    }
  }

  return {
    deleted: [...deleted],
    skipped: [...skipped],
  };
};
