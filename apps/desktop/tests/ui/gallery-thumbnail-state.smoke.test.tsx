import { describe, expect, it } from 'vitest';
import {
  resolveFailedGalleryThumbnailState,
  resolveLoadedGalleryThumbnailState,
  resolveRequestedGalleryThumbnailRetryState,
  type GalleryThumbnailStateSnapshot,
} from '../../src/features/gallery/gallery-thumbnail-state';

const snapshot = (
  overrides: Partial<GalleryThumbnailStateSnapshot> = {},
): GalleryThumbnailStateSnapshot => ({
  attemptsByCacheKey: {},
  errorsByCacheKey: {},
  loadingByCacheKey: {},
  retryAtByCacheKey: {},
  thumbnailsByCacheKey: {},
  ...overrides,
});

describe('gallery thumbnail state', () => {
  it('schedules another retry while attempts remain', () => {
    const result = resolveFailedGalleryThumbnailState({
      cacheKey: 'profile-1::photos/a.png',
      snapshot: snapshot({
        errorsByCacheKey: {
          'profile-1::photos/a.png': true,
        },
        loadingByCacheKey: {
          'profile-1::photos/a.png': true,
        },
        thumbnailsByCacheKey: {
          'profile-1::photos/a.png': 'data:image/png;base64,stale',
        },
      }),
    });

    expect(result.action).toBe('schedule-retry');
    expect(result.attempts).toBe(1);
    expect(result.snapshot.attemptsByCacheKey['profile-1::photos/a.png']).toBe(1);
    expect(result.snapshot.errorsByCacheKey['profile-1::photos/a.png']).toBeUndefined();
    expect(result.snapshot.loadingByCacheKey['profile-1::photos/a.png']).toBeUndefined();
    expect(result.snapshot.thumbnailsByCacheKey['profile-1::photos/a.png']).toBeUndefined();
  });

  it('marks the thumbnail as failed at the retry ceiling', () => {
    const result = resolveFailedGalleryThumbnailState({
      cacheKey: 'profile-1::photos/a.png',
      snapshot: snapshot({
        attemptsByCacheKey: {
          'profile-1::photos/a.png': 2,
        },
        loadingByCacheKey: {
          'profile-1::photos/a.png': true,
        },
        retryAtByCacheKey: {
          'profile-1::photos/a.png': 10_000,
        },
      }),
    });

    expect(result.action).toBe('mark-error');
    expect(result.attempts).toBe(3);
    expect(result.snapshot.errorsByCacheKey['profile-1::photos/a.png']).toBe(true);
    expect(result.snapshot.retryAtByCacheKey['profile-1::photos/a.png']).toBeUndefined();
    expect(result.snapshot.loadingByCacheKey['profile-1::photos/a.png']).toBeUndefined();
  });

  it('stores loaded thumbnails and clears failure bookkeeping', () => {
    const result = resolveLoadedGalleryThumbnailState({
      cacheKey: 'profile-1::photos/a.png',
      snapshot: snapshot({
        attemptsByCacheKey: {
          'profile-1::photos/a.png': 2,
        },
        errorsByCacheKey: {
          'profile-1::photos/a.png': true,
        },
        retryAtByCacheKey: {
          'profile-1::photos/a.png': 10_000,
        },
      }),
      thumbnailDataUrl: 'data:image/png;base64,next',
    });

    expect(result.hasThumbnail).toBe(true);
    expect(result.snapshot.thumbnailsByCacheKey['profile-1::photos/a.png']).toBe(
      'data:image/png;base64,next',
    );
    expect(result.snapshot.attemptsByCacheKey['profile-1::photos/a.png']).toBeUndefined();
    expect(result.snapshot.errorsByCacheKey['profile-1::photos/a.png']).toBeUndefined();
    expect(result.snapshot.retryAtByCacheKey['profile-1::photos/a.png']).toBeUndefined();
  });

  it('clears retry-visible state for manual retry without dropping cached thumbnails', () => {
    const result = resolveRequestedGalleryThumbnailRetryState(
      snapshot({
        attemptsByCacheKey: {
          'profile-1::photos/a.png': 3,
        },
        errorsByCacheKey: {
          'profile-1::photos/a.png': true,
        },
        loadingByCacheKey: {
          'profile-1::photos/a.png': true,
        },
        retryAtByCacheKey: {
          'profile-1::photos/a.png': 10_000,
        },
        thumbnailsByCacheKey: {
          'profile-1::photos/a.png': 'data:image/png;base64,cached',
        },
      }),
      'profile-1::photos/a.png',
    );

    expect(result.attemptsByCacheKey['profile-1::photos/a.png']).toBeUndefined();
    expect(result.errorsByCacheKey['profile-1::photos/a.png']).toBeUndefined();
    expect(result.loadingByCacheKey['profile-1::photos/a.png']).toBeUndefined();
    expect(result.retryAtByCacheKey['profile-1::photos/a.png']).toBeUndefined();
    expect(result.thumbnailsByCacheKey['profile-1::photos/a.png']).toBe(
      'data:image/png;base64,cached',
    );
  });
});
