import { describe, expect, it } from 'vitest';
import {
  resolvePendingThumbnailItems,
  thumbnailPreviewMaxBytesForAttempt,
  thumbnailRetryDelayMs,
} from '../../src/features/gallery/gallery-thumbnail-policy';
import type { AssetItem } from '../../src/shared/ipc';

const asset = (key: string, contentType: string): AssetItem => ({
  contentType,
  etag: `etag-${key}`,
  key,
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 100,
});

describe('gallery thumbnail policy', () => {
  it('increases preview byte limits per attempt within bounded caps', () => {
    expect(thumbnailPreviewMaxBytesForAttempt('image', 0)).toBe(2 * 1024 * 1024);
    expect(thumbnailPreviewMaxBytesForAttempt('image', 10)).toBe(24 * 1024 * 1024);
    expect(thumbnailPreviewMaxBytesForAttempt('video', 0)).toBe(8 * 1024 * 1024);
    expect(thumbnailPreviewMaxBytesForAttempt('video', 10)).toBe(64 * 1024 * 1024);
  });

  it('uses quadratic retry backoff with an upper bound', () => {
    expect(thumbnailRetryDelayMs(1)).toBe(900);
    expect(thumbnailRetryDelayMs(2)).toBe(3_600);
    expect(thumbnailRetryDelayMs(10)).toBe(6_000);
  });

  it('selects only visible image/video items that are ready for thumbnail loading', () => {
    const image = asset('photos/a.png', 'image/png');
    const video = asset('photos/b.mp4', 'video/mp4');
    const pdf = asset('docs/c.pdf', 'application/pdf');

    expect(
      resolvePendingThumbnailItems({
        attemptsByCacheKey: {
          'profile-1:photos/b.mp4': 1,
        },
        errorsByCacheKey: {},
        inferAssetKind: (item) => {
          if (item.contentType.startsWith('image/')) {
            return 'image';
          }
          if (item.contentType.startsWith('video/')) {
            return 'video';
          }
          return 'pdf';
        },
        loadingByCacheKey: {},
        now: 1_000,
        retryAtByCacheKey: {
          'profile-1:photos/b.mp4': 900,
        },
        selectedProfileId: 'profile-1',
        thumbnailsByCacheKey: {},
        toThumbnailCacheKey: (profileId, key) => `${profileId}:${key}`,
        visibleGallerySections: [
          {
            items: [image, video, pdf],
          },
        ],
      }),
    ).toEqual([image, video]);
  });
});
