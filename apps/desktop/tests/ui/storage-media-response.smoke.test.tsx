import type { S3Client } from '@aws-sdk/client-s3';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createStorageMediaResponse,
} from '../../src/main/adapters/storage/storage-media-response';
import {
  setStorageClientFactoryForTest,
} from '../../src/main/adapters/storage/s3-client-factory';

describe('storage media response', () => {
  afterEach(() => {
    setStorageClientFactoryForTest(null);
    vi.clearAllMocks();
  });

  it('streams ranged media requests using the original Japanese object key', async () => {
    const sentCommands: unknown[] = [];
    const destroy = vi.fn();
    setStorageClientFactoryForTest(
      () =>
        ({
          send: vi.fn(async (command: unknown) => {
            sentCommands.push(command);
            return {
              Body: Uint8Array.from([104, 105]),
              ContentLength: 2,
              ContentRange: 'bytes 0-1/10',
              ContentType: 'video/mp4',
              ETag: '"etag"',
            };
          }),
          destroy,
        }) as unknown as S3Client,
    );

    const response = await createStorageMediaResponse(
      {
        provider: 'r2',
        endpoint: 'https://example.r2.cloudflarestorage.com',
        region: 'auto',
        bucket: 'bucket',
      },
      {
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
      },
      {
        key: 'clips/素材/東京 sample.mp4',
        rangeHeader: 'bytes=0-1',
      },
    );

    expect(response.status).toBe(206);
    expect(response.headers.get('content-type')).toBe('video/mp4');
    expect(response.headers.get('content-range')).toBe('bytes 0-1/10');
    expect(await response.text()).toBe('hi');
    expect(destroy).toHaveBeenCalledTimes(1);
    expect((sentCommands[0] as { input: unknown }).input).toMatchObject({
      Bucket: 'bucket',
      Key: 'clips/素材/東京 sample.mp4',
      Range: 'bytes=0-1',
    });
  });
});
