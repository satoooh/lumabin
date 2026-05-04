import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { buffer as streamToBuffer } from 'node:stream/consumers';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import {
  copyStorageObject,
  deleteStorageObjects,
  getStorageObjectPreview,
  headStorageObject,
  listStorageObjects,
  setStorageClientFactoryForTest,
  storageObjectExists,
  testStorageConnection,
  uploadStorageObject,
} from '../storage-client';

interface StoredObject {
  body: Buffer;
  contentType: string;
  etag: string;
  lastModified: Date;
}

interface MultipartUploadSession {
  key: string;
  contentType: string;
  parts: Map<number, Buffer>;
}

const toEtag = (body: Buffer): string =>
  `"${createHash('md5').update(body).digest('hex')}"`;

const toErrorWithStatus = (
  name: string,
  message: string,
  status: number,
): Error & { $metadata: { httpStatusCode: number } } => {
  const error = new Error(message) as Error & {
    $metadata: { httpStatusCode: number };
  };
  error.name = name;
  error.$metadata = { httpStatusCode: status };
  return error;
};

const toAbortError = (): Error & { code: string } => {
  const error = new Error('The operation was aborted') as Error & { code: string };
  error.name = 'AbortError';
  error.code = 'ABORT_ERR';
  return error;
};

const toBodyBuffer = async (body: unknown): Promise<Buffer> => {
  if (!body) {
    return Buffer.alloc(0);
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }
  if (typeof body === 'string') {
    return Buffer.from(body);
  }
  if (body instanceof Readable) {
    return streamToBuffer(body);
  }
  throw new Error('Unsupported body type in integration smoke');
};

const parseCopySource = (copySource: string): string => {
  const segments = copySource.split('/');
  if (segments.length <= 1) {
    throw new Error(`Invalid CopySource: ${copySource}`);
  }
  segments.shift();
  return segments.map((segment) => decodeURIComponent(segment)).join('/');
};

class FakeStorageClient {
  private readonly objects = new Map<string, StoredObject>();

  private readonly multipart = new Map<string, MultipartUploadSession>();

  private nextUploadId = 1;

  private ensureNotAborted(options?: { abortSignal?: AbortSignal }): void {
    if (options?.abortSignal?.aborted) {
      throw toAbortError();
    }
  }

  async send(command: unknown, options?: { abortSignal?: AbortSignal }): Promise<unknown> {
    this.ensureNotAborted(options);

    if (command instanceof ListObjectsV2Command) {
      const prefix = typeof command.input.Prefix === 'string' ? command.input.Prefix : '';
      const delimiter = command.input.Delimiter;
      const maxKeys = Number(command.input.MaxKeys ?? 1000);
      const matchedKeys = [...this.objects.keys()]
        .filter((key) => key.startsWith(prefix))
        .sort();

      const contents: Array<{
        Key: string;
        Size: number;
        LastModified: Date;
        ETag: string;
      }> = [];
      const commonPrefixes = new Set<string>();

      for (const key of matchedKeys) {
        const remainder = key.slice(prefix.length);
        if (delimiter === '/' && remainder.includes('/')) {
          const nextPrefix = `${prefix}${remainder.slice(0, remainder.indexOf('/') + 1)}`;
          commonPrefixes.add(nextPrefix);
          continue;
        }
        const entry = this.objects.get(key);
        if (!entry) {
          continue;
        }
        contents.push({
          Key: key,
          Size: entry.body.length,
          LastModified: entry.lastModified,
          ETag: entry.etag,
        });
      }

      return {
        Contents: contents.slice(0, maxKeys),
        CommonPrefixes: [...commonPrefixes].map((value) => ({ Prefix: value })),
      };
    }

    if (command instanceof HeadObjectCommand) {
      const key = String(command.input.Key ?? '');
      const entry = this.objects.get(key);
      if (!entry) {
        throw toErrorWithStatus('NotFound', `Object not found: ${key}`, 404);
      }
      return {
        ContentLength: entry.body.length,
        ContentType: entry.contentType,
        LastModified: entry.lastModified,
        ETag: entry.etag,
        Metadata: {},
      };
    }

    if (command instanceof PutObjectCommand) {
      const key = String(command.input.Key ?? '');
      const contentType = String(command.input.ContentType ?? 'application/octet-stream');
      const body = await toBodyBuffer(command.input.Body);
      this.objects.set(key, {
        body,
        contentType,
        etag: toEtag(body),
        lastModified: new Date(),
      });
      return {};
    }

    if (command instanceof CreateMultipartUploadCommand) {
      const uploadId = `upload-${this.nextUploadId}`;
      this.nextUploadId += 1;
      const key = String(command.input.Key ?? '');
      const contentType = String(command.input.ContentType ?? 'application/octet-stream');
      this.multipart.set(uploadId, {
        key,
        contentType,
        parts: new Map<number, Buffer>(),
      });
      return {
        UploadId: uploadId,
      };
    }

    if (command instanceof UploadPartCommand) {
      const uploadId = String(command.input.UploadId ?? '');
      const partNumber = Number(command.input.PartNumber ?? 0);
      const session = this.multipart.get(uploadId);
      if (!session || partNumber <= 0) {
        throw new Error('Multipart session not found');
      }
      const body = await toBodyBuffer(command.input.Body);
      session.parts.set(partNumber, body);
      return {
        ETag: toEtag(body),
      };
    }

    if (command instanceof CompleteMultipartUploadCommand) {
      const uploadId = String(command.input.UploadId ?? '');
      const session = this.multipart.get(uploadId);
      if (!session) {
        throw new Error('Multipart session not found');
      }
      const orderedParts = [...session.parts.entries()]
        .sort(([left], [right]) => left - right)
        .map(([, body]) => body);
      const body = Buffer.concat(orderedParts);
      this.objects.set(session.key, {
        body,
        contentType: session.contentType,
        etag: toEtag(body),
        lastModified: new Date(),
      });
      this.multipart.delete(uploadId);
      return {
        ETag: toEtag(body),
      };
    }

    if (command instanceof AbortMultipartUploadCommand) {
      const uploadId = String(command.input.UploadId ?? '');
      this.multipart.delete(uploadId);
      return {};
    }

    if (command instanceof CopyObjectCommand) {
      const sourceKey = parseCopySource(String(command.input.CopySource ?? ''));
      const destinationKey = String(command.input.Key ?? '');
      const source = this.objects.get(sourceKey);
      if (!source) {
        throw toErrorWithStatus('NoSuchKey', `Object not found: ${sourceKey}`, 404);
      }
      this.objects.set(destinationKey, {
        body: Buffer.from(source.body),
        contentType: source.contentType,
        etag: source.etag,
        lastModified: new Date(),
      });
      return {};
    }

    if (command instanceof DeleteObjectsCommand) {
      const deleted: Array<{ Key: string }> = [];
      const errors: Array<{ Key: string; Code: string }> = [];
      for (const objectEntry of command.input.Delete?.Objects ?? []) {
        const key = String(objectEntry.Key ?? '');
        if (!key) {
          continue;
        }
        if (this.objects.has(key)) {
          this.objects.delete(key);
          deleted.push({ Key: key });
          continue;
        }
        errors.push({ Key: key, Code: 'NoSuchKey' });
      }
      return {
        Deleted: deleted,
        Errors: errors,
      };
    }

    if (command instanceof GetObjectCommand) {
      const key = String(command.input.Key ?? '');
      const entry = this.objects.get(key);
      if (!entry) {
        throw toErrorWithStatus('NoSuchKey', `Object not found: ${key}`, 404);
      }

      const rangeHeader = typeof command.input.Range === 'string' ? command.input.Range : undefined;
      if (!rangeHeader) {
        return {
          Body: entry.body,
          ContentType: entry.contentType,
          ContentLength: entry.body.length,
        };
      }

      const matched = rangeHeader.match(/^bytes=(\d+)-(\d+)$/);
      if (!matched) {
        throw toErrorWithStatus('InvalidRange', `Unsupported Range: ${rangeHeader}`, 416);
      }
      const start = Number(matched[1]);
      const requestedEnd = Number(matched[2]);
      if (!Number.isFinite(start) || !Number.isFinite(requestedEnd) || start < 0) {
        throw toErrorWithStatus('InvalidRange', `Invalid Range: ${rangeHeader}`, 416);
      }
      if (entry.body.length === 0 || start >= entry.body.length) {
        throw toErrorWithStatus('InvalidRange', `Range out of bounds: ${rangeHeader}`, 416);
      }

      const end = Math.min(requestedEnd, entry.body.length - 1);
      if (end < start) {
        throw toErrorWithStatus('InvalidRange', `Invalid Range order: ${rangeHeader}`, 416);
      }

      const sliced = entry.body.subarray(start, end + 1);
      return {
        Body: sliced,
        ContentType: entry.contentType,
        ContentLength: sliced.length,
        ContentRange: `bytes ${start}-${end}/${entry.body.length}`,
      };
    }

    throw new Error(`Unsupported command in integration smoke: ${String(command)}`);
  }

  destroy(): void {
    // no-op for fake client
  }
}

const runStorageClientIntegrationSmoke = async (): Promise<void> => {
  const profile = {
    provider: 'r2' as const,
    endpoint: 'https://example.invalid',
    region: 'auto',
    bucket: 'lumabin-smoke',
  };
  const secret = {
    accessKeyId: 'smoke-access-key',
    secretAccessKey: 'smoke-secret-key',
  };

  const tempDirectory = await mkdtemp(join(tmpdir(), 'lumabin-storage-smoke-'));
  const fakeClient = new FakeStorageClient();
  setStorageClientFactoryForTest(() => fakeClient as unknown as S3Client);

  try {
    const imagePath = join(tempDirectory, 'photo.jpg');
    const csvPath = join(tempDirectory, 'table.csv');
    const zeroPath = join(tempDirectory, 'empty.jpg');

    await writeFile(imagePath, Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0xff, 0xd9]));
    await writeFile(csvPath, 'name,value\nfoo,1\nbar,2\n', 'utf-8');
    await writeFile(zeroPath, Buffer.alloc(0));

    const connection = await testStorageConnection(profile, secret);
    assert.equal(connection.ok, true);

    await uploadStorageObject(profile, secret, {
      key: 'assets/photo.jpg',
      sourcePath: imagePath,
    });
    await uploadStorageObject(profile, secret, {
      key: 'assets/table.csv',
      sourcePath: csvPath,
    });

    const listed = await listStorageObjects(profile, secret, {
      prefix: 'assets',
      recursive: true,
      limit: 100,
    });
    assert.deepEqual(
      listed.items.map((item) => item.key).sort(),
      ['assets/photo.jpg', 'assets/table.csv'],
    );

    const metadata = await headStorageObject(profile, secret, 'assets/photo.jpg');
    assert.equal(metadata.contentType, 'image/jpeg');
    assert.equal(metadata.size > 0, true);

    const imagePreview = await getStorageObjectPreview(profile, secret, {
      key: 'assets/photo.jpg',
      maxBytes: 2 * 1024 * 1024,
    });
    assert.equal(imagePreview.kind, 'image');
    assert.equal(Boolean(imagePreview.dataBase64), true);

    const csvPreview = await getStorageObjectPreview(profile, secret, {
      key: 'assets/table.csv',
      maxBytes: 2 * 1024 * 1024,
    });
    assert.equal(csvPreview.kind, 'csv');
    assert.equal(csvPreview.textPreview?.includes('name,value'), true);

    await uploadStorageObject(profile, secret, {
      key: 'assets/empty.jpg',
      sourcePath: zeroPath,
    });

    const zeroPreview = await getStorageObjectPreview(profile, secret, {
      key: 'assets/empty.jpg',
      maxBytes: 1024,
    });
    assert.equal(zeroPreview.byteLength, 0);
    assert.equal(zeroPreview.truncated, false);

    await copyStorageObject(profile, secret, {
      fromKey: 'assets/photo.jpg',
      toKey: 'archive/photo-copy.jpg',
    });
    const copiedExists = await storageObjectExists(profile, secret, 'archive/photo-copy.jpg');
    assert.equal(copiedExists, true);

    const deleted = await deleteStorageObjects(profile, secret, {
      keys: ['assets/table.csv', 'assets/missing.csv'],
    });
    assert.equal(deleted.deleted.includes('assets/table.csv'), true);
    assert.equal(deleted.skipped.includes('assets/missing.csv'), true);

    const abortController = new AbortController();
    abortController.abort();
    await assert.rejects(
      async () =>
        uploadStorageObject(profile, secret, {
          key: 'assets/aborted.jpg',
          sourcePath: imagePath,
          abortSignal: abortController.signal,
        }),
      /aborted/i,
    );
  } finally {
    setStorageClientFactoryForTest(null);
    await rm(tempDirectory, { recursive: true, force: true });
  }
};

void runStorageClientIntegrationSmoke()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('storage-client integration smoke passed');
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('storage-client integration smoke failed', error);
    process.exitCode = 1;
  });
