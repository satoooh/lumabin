import { GALLERY_THUMBNAIL_MAX_ATTEMPTS } from './gallery-thumbnail-policy';

export interface GalleryThumbnailStateSnapshot {
  attemptsByCacheKey: Record<string, number>;
  errorsByCacheKey: Record<string, boolean>;
  loadingByCacheKey: Record<string, boolean>;
  retryAtByCacheKey: Record<string, number>;
  thumbnailsByCacheKey: Record<string, string>;
}

type GalleryThumbnailFailureAction = 'mark-error' | 'schedule-retry';

interface ResolveFailedGalleryThumbnailStateOptions {
  cacheKey: string;
  snapshot: GalleryThumbnailStateSnapshot;
}

interface ResolveFailedGalleryThumbnailStateResult {
  action: GalleryThumbnailFailureAction;
  attempts: number;
  snapshot: GalleryThumbnailStateSnapshot;
}

interface ResolveLoadedGalleryThumbnailStateOptions {
  cacheKey: string;
  snapshot: GalleryThumbnailStateSnapshot;
  thumbnailDataUrl?: string | null;
}

interface ResolveLoadedGalleryThumbnailStateResult {
  hasThumbnail: boolean;
  snapshot: GalleryThumbnailStateSnapshot;
}

const removeRecordKey = <T>(
  record: Record<string, T>,
  key: string,
): Record<string, T> => {
  if (!(key in record)) {
    return record;
  }
  const nextRecord = { ...record };
  delete nextRecord[key];
  return nextRecord;
};

export const resolveFailedGalleryThumbnailState = ({
  cacheKey,
  snapshot,
}: ResolveFailedGalleryThumbnailStateOptions): ResolveFailedGalleryThumbnailStateResult => {
  const attempts = (snapshot.attemptsByCacheKey[cacheKey] ?? 0) + 1;
  const attemptsByCacheKey = {
    ...snapshot.attemptsByCacheKey,
    [cacheKey]: attempts,
  };

  if (attempts >= GALLERY_THUMBNAIL_MAX_ATTEMPTS) {
    return {
      action: 'mark-error',
      attempts,
      snapshot: {
        attemptsByCacheKey,
        errorsByCacheKey: {
          ...snapshot.errorsByCacheKey,
          [cacheKey]: true,
        },
        loadingByCacheKey: removeRecordKey(snapshot.loadingByCacheKey, cacheKey),
        retryAtByCacheKey: removeRecordKey(snapshot.retryAtByCacheKey, cacheKey),
        thumbnailsByCacheKey: removeRecordKey(snapshot.thumbnailsByCacheKey, cacheKey),
      },
    };
  }

  return {
    action: 'schedule-retry',
    attempts,
    snapshot: {
      attemptsByCacheKey,
      errorsByCacheKey: removeRecordKey(snapshot.errorsByCacheKey, cacheKey),
      loadingByCacheKey: removeRecordKey(snapshot.loadingByCacheKey, cacheKey),
      retryAtByCacheKey: snapshot.retryAtByCacheKey,
      thumbnailsByCacheKey: removeRecordKey(snapshot.thumbnailsByCacheKey, cacheKey),
    },
  };
};

export const resolveLoadedGalleryThumbnailState = ({
  cacheKey,
  snapshot,
  thumbnailDataUrl,
}: ResolveLoadedGalleryThumbnailStateOptions): ResolveLoadedGalleryThumbnailStateResult => {
  const currentThumbnail = snapshot.thumbnailsByCacheKey[cacheKey];
  const hasThumbnail = Boolean(thumbnailDataUrl || currentThumbnail);
  const thumbnailsByCacheKey =
    thumbnailDataUrl && !currentThumbnail
      ? {
          ...snapshot.thumbnailsByCacheKey,
          [cacheKey]: thumbnailDataUrl,
        }
      : snapshot.thumbnailsByCacheKey;

  return {
    hasThumbnail,
    snapshot: {
      attemptsByCacheKey: removeRecordKey(snapshot.attemptsByCacheKey, cacheKey),
      errorsByCacheKey: removeRecordKey(snapshot.errorsByCacheKey, cacheKey),
      loadingByCacheKey: snapshot.loadingByCacheKey,
      retryAtByCacheKey: removeRecordKey(snapshot.retryAtByCacheKey, cacheKey),
      thumbnailsByCacheKey,
    },
  };
};

export const resolveRequestedGalleryThumbnailRetryState = (
  snapshot: GalleryThumbnailStateSnapshot,
  cacheKey: string,
): GalleryThumbnailStateSnapshot => ({
  attemptsByCacheKey: removeRecordKey(snapshot.attemptsByCacheKey, cacheKey),
  errorsByCacheKey: removeRecordKey(snapshot.errorsByCacheKey, cacheKey),
  loadingByCacheKey: removeRecordKey(snapshot.loadingByCacheKey, cacheKey),
  retryAtByCacheKey: removeRecordKey(snapshot.retryAtByCacheKey, cacheKey),
  thumbnailsByCacheKey: snapshot.thumbnailsByCacheKey,
});
