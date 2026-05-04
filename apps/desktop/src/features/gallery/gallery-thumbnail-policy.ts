import type { AssetItem } from '../../shared/ipc';

export type ThumbnailAssetKind = 'image' | 'video' | 'pdf' | 'csv' | 'other';

export interface GalleryThumbnailSection {
  items: AssetItem[];
}

export const GALLERY_THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;
export const GALLERY_VIDEO_THUMBNAIL_MAX_BYTES = 8 * 1024 * 1024;
export const GALLERY_THUMBNAIL_CONCURRENCY = 3;
export const GALLERY_THUMBNAIL_MAX_ATTEMPTS = 3;
export const THUMBNAIL_LOADING_STALE_MS = 18_000;
export const VIDEO_THUMBNAIL_SEEK_SECONDS = 0.1;
export const VIDEO_THUMBNAIL_TIMEOUT_MS = 4_500;
export const THUMBNAIL_PREVIEW_TIMEOUT_MS = 12_000;

export const thumbnailPreviewMaxBytesForAttempt = (
  kind: 'image' | 'video',
  attempts: number,
): number => {
  const multiplier = 2 ** Math.max(0, attempts);
  if (kind === 'video') {
    return Math.min(64 * 1024 * 1024, GALLERY_VIDEO_THUMBNAIL_MAX_BYTES * multiplier);
  }
  return Math.min(24 * 1024 * 1024, GALLERY_THUMBNAIL_MAX_BYTES * multiplier);
};

export const thumbnailRetryDelayMs = (attempts: number): number =>
  Math.min(6_000, 900 * attempts * attempts);

interface ResolvePendingThumbnailItemsOptions {
  attemptsByCacheKey: Record<string, number>;
  errorsByCacheKey: Record<string, boolean>;
  inferAssetKind: (item: AssetItem) => ThumbnailAssetKind;
  loadingByCacheKey: Record<string, boolean>;
  now: number;
  retryAtByCacheKey: Record<string, number>;
  selectedProfileId: string;
  thumbnailsByCacheKey: Record<string, string>;
  toThumbnailCacheKey: (profileId: string, key: string) => string;
  visibleGallerySections: GalleryThumbnailSection[];
}

export const resolvePendingThumbnailItems = ({
  attemptsByCacheKey,
  errorsByCacheKey,
  inferAssetKind,
  loadingByCacheKey,
  now,
  retryAtByCacheKey,
  selectedProfileId,
  thumbnailsByCacheKey,
  toThumbnailCacheKey,
  visibleGallerySections,
}: ResolvePendingThumbnailItemsOptions): AssetItem[] => {
  const visibleThumbnailCandidates = visibleGallerySections.flatMap((section) => section.items);
  return visibleThumbnailCandidates.filter((item) => {
    const kind = inferAssetKind(item);
    if (kind !== 'image' && kind !== 'video') {
      return false;
    }

    const cacheKey = toThumbnailCacheKey(selectedProfileId, item.key);
    const attempts = attemptsByCacheKey[cacheKey] ?? 0;
    const retryAt = retryAtByCacheKey[cacheKey] ?? 0;
    return (
      !thumbnailsByCacheKey[cacheKey] &&
      !errorsByCacheKey[cacheKey] &&
      !loadingByCacheKey[cacheKey] &&
      attempts < GALLERY_THUMBNAIL_MAX_ATTEMPTS &&
      retryAt <= now
    );
  });
};
