import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import {
  addStorageTransferredBytes,
  recordStorageFailure,
  recordStorageMetric,
} from '../../dev-metrics';
import type {
  AssetMetadata,
  AssetPreview,
  ListAssetsResult,
} from '../../../shared/ipc';
import { createStorageClient } from './s3-client-factory';
import {
  formatStorageError,
  isInvalidRangeError,
  isNotFoundError,
} from './s3-errors';
import {
  bodyToBuffer,
  inferContentType,
  inferPreviewKind,
  normalizePrefix,
  parseTotalBytes,
} from './storage-object-policy';
import { toAssetItem } from './storage-object-mappers';
import type {
  StorageConnectionResult,
  StorageListInput,
  StorageProfile,
  StorageSecret,
} from './storage-contracts';

export const testStorageConnection = async (
  profile: StorageProfile,
  secret: StorageSecret,
): Promise<StorageConnectionResult> => {
  const client = createStorageClient(profile, secret);
  const startedAt = Date.now();
  recordStorageMetric('testConnectionCalls');

  try {
    recordStorageMetric('listCalls');
    await client.send(
      new ListObjectsV2Command({
        Bucket: profile.bucket,
        MaxKeys: 1,
      }),
    );
    const elapsedMs = Date.now() - startedAt;
    return {
      ok: true,
      message: `Connection succeeded (${elapsedMs}ms)`,
    };
  } catch (error) {
    recordStorageFailure();
    return {
      ok: false,
      message: formatStorageError(error),
    };
  } finally {
    client.destroy();
  }
};

export const listStorageObjects = async (
  profile: StorageProfile,
  secret: StorageSecret,
  input: StorageListInput,
): Promise<ListAssetsResult> => {
  const client = createStorageClient(profile, secret);

  try {
    recordStorageMetric('listCalls');
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: profile.bucket,
        Prefix: normalizePrefix(input.prefix),
        Delimiter: input.recursive ? undefined : '/',
        ContinuationToken: input.continuationToken,
        MaxKeys: input.limit ?? 100,
      }),
    );

    return {
      items: (result.Contents ?? []).map(toAssetItem),
      prefixes: (result.CommonPrefixes ?? [])
        .map((prefix) => prefix.Prefix)
        .filter((prefix): prefix is string => typeof prefix === 'string'),
      nextContinuationToken: result.NextContinuationToken,
    };
  } catch (error) {
    recordStorageFailure();
    throw error;
  } finally {
    client.destroy();
  }
};

export const headStorageObject = async (
  profile: StorageProfile,
  secret: StorageSecret,
  key: string,
): Promise<AssetMetadata> => {
  const client = createStorageClient(profile, secret);

  try {
    recordStorageMetric('headCalls');
    const result = await client.send(
      new HeadObjectCommand({
        Bucket: profile.bucket,
        Key: key,
      }),
    );

    return {
      key,
      size: result.ContentLength ?? 0,
      contentType: result.ContentType ?? inferContentType(key),
      lastModified: result.LastModified?.toISOString() ?? new Date().toISOString(),
      etag: result.ETag ?? '',
      metadata: result.Metadata ?? {},
    };
  } catch (error) {
    recordStorageFailure();
    throw error;
  } finally {
    client.destroy();
  }
};

export const storageObjectExists = async (
  profile: StorageProfile,
  secret: StorageSecret,
  key: string,
): Promise<boolean> => {
  const client = createStorageClient(profile, secret);

  try {
    recordStorageMetric('existsChecks');
    recordStorageMetric('headCalls');
    await client.send(
      new HeadObjectCommand({
        Bucket: profile.bucket,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    if (isNotFoundError(error)) {
      return false;
    }
    recordStorageFailure();
    throw error;
  } finally {
    client.destroy();
  }
};

export const getStorageObjectPreview = async (
  profile: StorageProfile,
  secret: StorageSecret,
  input: {
    key: string;
    maxBytes: number;
  },
): Promise<AssetPreview> => {
  const client = createStorageClient(profile, secret);

  try {
    const sendGetObject = async (
      rangeHeader?: string,
    ) => {
      recordStorageMetric('getCalls');
      return client.send(
        new GetObjectCommand({
          Bucket: profile.bucket,
          Key: input.key,
          ...(rangeHeader ? { Range: rangeHeader } : {}),
        }),
      );
    };

    let result;
    try {
      result = await sendGetObject(`bytes=0-${Math.max(0, input.maxBytes - 1)}`);
    } catch (error) {
      if (!isInvalidRangeError(error)) {
        throw error;
      }
      // Some providers return 416 for zero-byte objects on ranged GET.
      result = await sendGetObject();
    }

    const previewBuffer = await bodyToBuffer(result.Body);
    addStorageTransferredBytes({
      bytesDownloaded: previewBuffer.length,
    });
    const contentType = result.ContentType ?? inferContentType(input.key);
    const kind = inferPreviewKind(contentType, input.key);
    const totalBytes = parseTotalBytes(result.ContentRange) ?? result.ContentLength;
    const truncated =
      typeof totalBytes === 'number' ? previewBuffer.length < totalBytes : false;

    if (kind === 'csv') {
      return {
        key: input.key,
        kind,
        contentType,
        byteLength: previewBuffer.length,
        totalBytes,
        truncated,
        textPreview: previewBuffer.toString('utf-8'),
      };
    }

    if (kind === 'image' || kind === 'video' || kind === 'pdf') {
      return {
        key: input.key,
        kind,
        contentType,
        byteLength: previewBuffer.length,
        totalBytes,
        truncated,
        dataBase64: previewBuffer.toString('base64'),
      };
    }

    return {
      key: input.key,
      kind: 'other',
      contentType,
      byteLength: previewBuffer.length,
      totalBytes,
      truncated,
    };
  } catch (error) {
    recordStorageFailure();
    throw error;
  } finally {
    client.destroy();
  }
};
