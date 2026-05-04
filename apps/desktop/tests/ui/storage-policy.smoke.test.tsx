import { describe, expect, it } from 'vitest';
import {
  chunkBy,
  inferContentType,
  inferPreviewKind,
  normalizePrefix,
  normalizePresignTtl,
  parseTotalBytes,
  toCopySourcePath,
} from '../../src/main/adapters/storage/storage-object-policy';
import {
  formatStorageError,
  isNotFoundError,
} from '../../src/main/adapters/storage/s3-errors';
import { isRetryableUploadError } from '../../src/main/adapters/storage/s3-retry';

describe('storage policy', () => {
  it('normalizes prefixes and classifies storage objects', () => {
    expect(normalizePrefix()).toBeUndefined();
    expect(normalizePrefix('photos')).toBe('photos/');
    expect(normalizePrefix('photos/')).toBe('photos/');
    expect(inferContentType('image.JPG')).toBe('image/jpeg');
    expect(inferContentType('clip.mov')).toBe('video/quicktime');
    expect(inferPreviewKind('application/octet-stream', 'report.pdf')).toBe('pdf');
    expect(inferPreviewKind('text/plain', 'table.csv')).toBe('csv');
  });

  it('keeps provider URL and presign policies bounded', () => {
    expect(toCopySourcePath('bucket', 'raw files/東京/image 1.png')).toBe(
      'bucket/raw%20files/%E6%9D%B1%E4%BA%AC/image%201.png',
    );
    expect(normalizePresignTtl(1)).toBe(60);
    expect(normalizePresignTtl(999_999_999)).toBe(7 * 24 * 60 * 60);
    expect(normalizePresignTtl(90.9)).toBe(90);
  });

  it('parses range totals and chunks bulk delete input', () => {
    expect(parseTotalBytes('bytes 0-9/128')).toBe(128);
    expect(parseTotalBytes('bytes */0')).toBe(0);
    expect(parseTotalBytes('invalid')).toBeUndefined();
    expect(chunkBy([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkBy([1, 2], 0)).toEqual([[1, 2]]);
  });

  it('formats and classifies S3-compatible errors', () => {
    const notFound = Object.assign(new Error('missing'), {
      name: 'NoSuchKey',
      $metadata: { httpStatusCode: 404 },
    });
    expect(isNotFoundError(notFound)).toBe(true);
    expect(formatStorageError(notFound)).toBe('NoSuchKey (HTTP 404): missing');

    const accessDenied = Object.assign(new Error('signature mismatch'), {
      name: 'SignatureDoesNotMatch',
      $metadata: { httpStatusCode: 403 },
    });
    expect(formatStorageError(accessDenied)).toBe(
      'SignatureDoesNotMatch (HTTP 403): Authorization failed. Check the access key, secret, bucket permissions, and R2/S3 endpoint. signature mismatch',
    );

    const missingBucket = Object.assign(new Error('bucket does not exist'), {
      name: 'NoSuchBucket',
      $metadata: { httpStatusCode: 404 },
    });
    expect(formatStorageError(missingBucket)).toBe(
      'NoSuchBucket (HTTP 404): Bucket not found. Check the bucket name and account endpoint. bucket does not exist',
    );

    const redirectedBucket = Object.assign(new Error('use a different endpoint'), {
      name: 'PermanentRedirect',
      $metadata: { httpStatusCode: 301 },
    });
    expect(formatStorageError(redirectedBucket)).toBe(
      'PermanentRedirect (HTTP 301): Bucket endpoint mismatch. Check the endpoint URL and region for this provider. use a different endpoint',
    );

    const timeout = Object.assign(new Error('timeout'), {
      name: 'RequestTimeout',
    });
    expect(isRetryableUploadError(timeout)).toBe(true);

    const validationError = Object.assign(new Error('bad input'), {
      name: 'ValidationError',
      $metadata: { httpStatusCode: 400 },
    });
    expect(isRetryableUploadError(validationError)).toBe(false);
  });
});
