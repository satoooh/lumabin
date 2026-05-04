import { describe, expect, it } from 'vitest';
import {
  createUploadJobStatus,
  inferContentTypeFromKey,
  isAbortError,
  normalizePresignTtl,
  normalizePreviewMaxBytes,
  normalizePublicBaseUrls,
} from '../../src/main/application-policies';

describe('application policies', () => {
  it('normalizes upload job defaults', () => {
    expect(
      createUploadJobStatus(
        {
          profileId: 'profile-1',
          destinationPrefix: 'photos',
          sources: [
            {
              path: '/tmp/a.png',
              size: 100,
            },
          ],
        },
        {
          createUploadJobId: () => 'upload-1',
          getDefaultConflictPolicy: () => 'skip',
          normalizeDestinationPrefix: (value) => `${value}/`,
          nowIso: () => '2026-05-03T00:00:00.000Z',
        },
      ),
    ).toMatchObject({
      id: 'upload-1',
      profileId: 'profile-1',
      status: 'queued',
      destinationPrefix: 'photos/',
      conflictPolicy: 'skip',
      totalItems: 1,
      failedItems: 0,
      failedSources: [],
    });
  });

  it('keeps bounded URL and preview policies stable', () => {
    expect(normalizePresignTtl(10)).toBe(60);
    expect(normalizePresignTtl(90.9)).toBe(90);
    expect(normalizePreviewMaxBytes(undefined)).toBe(2 * 1024 * 1024);
    expect(normalizePreviewMaxBytes(1024)).toBe(64 * 1024);
  });

  it('infers content types and abort errors', () => {
    expect(inferContentTypeFromKey('photo.JPG')).toBe('image/jpeg');
    expect(inferContentTypeFromKey('clip.mov')).toBe('video/quicktime');
    expect(inferContentTypeFromKey('archive.bin')).toBe('application/octet-stream');
    expect(isAbortError(Object.assign(new Error('request aborted'), { code: 'ABORT_ERR' }))).toBe(
      true,
    );
    expect(isAbortError(new Error('other'))).toBe(false);
  });

  it('normalizes public base URL maps', () => {
    expect(
      normalizePublicBaseUrls({
        'profile-1': ' https://cdn.example ',
        'profile-2': '',
        'profile-3': 42,
      }),
    ).toEqual({
      'profile-1': 'https://cdn.example',
    });
  });
});
