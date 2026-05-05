import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { AssetItem } from '../../shared/ipc';
import type { AssetThumbnailApi } from '../shared/desktop-api-gateway';
import {
  GALLERY_THUMBNAIL_CONCURRENCY,
  THUMBNAIL_LOADING_STALE_MS,
  resolvePendingThumbnailItems,
  thumbnailRetryDelayMs,
  type GalleryThumbnailSection,
  type ThumbnailAssetKind,
} from './gallery-thumbnail-policy';
import { loadGalleryThumbnailDataUrl } from './gallery-thumbnail-loader';
import {
  resolveFailedGalleryThumbnailState,
  resolveLoadedGalleryThumbnailState,
  resolveRequestedGalleryThumbnailRetryState,
  type GalleryThumbnailStateSnapshot,
} from './gallery-thumbnail-state';
import type { ViewMode } from './use-gallery-view-model';

interface UseGalleryThumbnailsOptions {
  assetPreviewApi: AssetThumbnailApi;
  inferAssetKind: (item: AssetItem) => ThumbnailAssetKind;
  isGalleryScrolling: boolean;
  selectedProfileId: string;
  toThumbnailCacheKey: (profileId: string, key: string) => string;
  viewMode: ViewMode;
  visibleGallerySections: GalleryThumbnailSection[];
}

export const useGalleryThumbnails = ({
  assetPreviewApi,
  inferAssetKind,
  isGalleryScrolling,
  selectedProfileId,
  toThumbnailCacheKey,
  viewMode,
  visibleGallerySections,
}: UseGalleryThumbnailsOptions) => {
  const [galleryThumbnails, setGalleryThumbnails] = useState<Record<string, string>>({});
  const [galleryThumbnailErrors, setGalleryThumbnailErrors] = useState<Record<string, boolean>>(
    {},
  );
  const [galleryThumbnailLoading, setGalleryThumbnailLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [thumbnailRetryTick, setThumbnailRetryTick] = useState<number>(0);

  const activeProfileIdRef = useRef<string>('');
  const galleryThumbnailsRef = useRef<Record<string, string>>({});
  const galleryThumbnailErrorsRef = useRef<Record<string, boolean>>({});
  const galleryThumbnailLoadingRef = useRef<Record<string, boolean>>({});
  const galleryThumbnailAttemptsRef = useRef<Record<string, number>>({});
  const galleryThumbnailRetryAtRef = useRef<Record<string, number>>({});
  const galleryThumbnailRetryTimersRef = useRef<Record<string, number>>({});
  const galleryThumbnailLoadingStartedAtRef = useRef<Record<string, number>>({});
  const galleryThumbnailLoadWatchdogsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    activeProfileIdRef.current = selectedProfileId;
  }, [selectedProfileId]);

  useEffect(() => {
    galleryThumbnailsRef.current = galleryThumbnails;
  }, [galleryThumbnails]);

  useEffect(() => {
    galleryThumbnailErrorsRef.current = galleryThumbnailErrors;
  }, [galleryThumbnailErrors]);

  useEffect(() => {
    galleryThumbnailLoadingRef.current = galleryThumbnailLoading;
  }, [galleryThumbnailLoading]);

  const clearThumbnailRetryTimer = useCallback((cacheKey: string) => {
    const timerId = galleryThumbnailRetryTimersRef.current[cacheKey];
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      delete galleryThumbnailRetryTimersRef.current[cacheKey];
    }
  }, []);

  const clearAllThumbnailRetryTimers = useCallback(() => {
    for (const timerId of Object.values(galleryThumbnailRetryTimersRef.current)) {
      window.clearTimeout(timerId);
    }
    galleryThumbnailRetryTimersRef.current = {};
  }, []);

  const clearThumbnailLoadWatchdog = useCallback((cacheKey: string) => {
    const timerId = galleryThumbnailLoadWatchdogsRef.current[cacheKey];
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      delete galleryThumbnailLoadWatchdogsRef.current[cacheKey];
    }
    delete galleryThumbnailLoadingStartedAtRef.current[cacheKey];
  }, []);

  const clearAllThumbnailLoadWatchdogs = useCallback(() => {
    for (const timerId of Object.values(galleryThumbnailLoadWatchdogsRef.current)) {
      window.clearTimeout(timerId);
    }
    galleryThumbnailLoadWatchdogsRef.current = {};
    galleryThumbnailLoadingStartedAtRef.current = {};
  }, []);

  const readThumbnailStateSnapshot = useCallback((): GalleryThumbnailStateSnapshot => ({
    attemptsByCacheKey: galleryThumbnailAttemptsRef.current,
    errorsByCacheKey: galleryThumbnailErrorsRef.current,
    loadingByCacheKey: galleryThumbnailLoadingRef.current,
    retryAtByCacheKey: galleryThumbnailRetryAtRef.current,
    thumbnailsByCacheKey: galleryThumbnailsRef.current,
  }), []);

  const applyThumbnailStateSnapshot = useCallback((snapshot: GalleryThumbnailStateSnapshot) => {
    galleryThumbnailAttemptsRef.current = snapshot.attemptsByCacheKey;
    galleryThumbnailRetryAtRef.current = snapshot.retryAtByCacheKey;

    if (galleryThumbnailsRef.current !== snapshot.thumbnailsByCacheKey) {
      galleryThumbnailsRef.current = snapshot.thumbnailsByCacheKey;
      setGalleryThumbnails(snapshot.thumbnailsByCacheKey);
    }

    if (galleryThumbnailErrorsRef.current !== snapshot.errorsByCacheKey) {
      galleryThumbnailErrorsRef.current = snapshot.errorsByCacheKey;
      setGalleryThumbnailErrors(snapshot.errorsByCacheKey);
    }

    if (galleryThumbnailLoadingRef.current !== snapshot.loadingByCacheKey) {
      galleryThumbnailLoadingRef.current = snapshot.loadingByCacheKey;
      setGalleryThumbnailLoading(snapshot.loadingByCacheKey);
    }
  }, []);

  const resetGalleryThumbnails = useCallback(() => {
    clearAllThumbnailRetryTimers();
    clearAllThumbnailLoadWatchdogs();
    galleryThumbnailsRef.current = {};
    galleryThumbnailErrorsRef.current = {};
    galleryThumbnailLoadingRef.current = {};
    galleryThumbnailAttemptsRef.current = {};
    galleryThumbnailRetryAtRef.current = {};
    setGalleryThumbnails({});
    setGalleryThumbnailErrors({});
    setGalleryThumbnailLoading({});
    setThumbnailRetryTick((current) => current + 1);
  }, [clearAllThumbnailLoadWatchdogs, clearAllThumbnailRetryTimers]);

  const scheduleThumbnailRetry = useCallback((cacheKey: string, attempts: number) => {
    clearThumbnailRetryTimer(cacheKey);
    const retryDelayMs = thumbnailRetryDelayMs(attempts);
    galleryThumbnailRetryAtRef.current[cacheKey] = Date.now() + retryDelayMs;
    const timerId = window.setTimeout(() => {
      delete galleryThumbnailRetryTimersRef.current[cacheKey];
      setThumbnailRetryTick((current) => current + 1);
    }, retryDelayMs + 24);
    galleryThumbnailRetryTimersRef.current[cacheKey] = timerId;
  }, [clearThumbnailRetryTimer]);

  const requestThumbnailRetry = useCallback((cacheKey: string) => {
    clearThumbnailRetryTimer(cacheKey);
    clearThumbnailLoadWatchdog(cacheKey);
    applyThumbnailStateSnapshot(
      resolveRequestedGalleryThumbnailRetryState(readThumbnailStateSnapshot(), cacheKey),
    );

    setThumbnailRetryTick((current) => current + 1);
  }, [
    applyThumbnailStateSnapshot,
    clearThumbnailLoadWatchdog,
    clearThumbnailRetryTimer,
    readThumbnailStateSnapshot,
  ]);

  const handleThumbnailDecodeError = useCallback((cacheKey: string) => {
    clearThumbnailRetryTimer(cacheKey);
    clearThumbnailLoadWatchdog(cacheKey);

    const result = resolveFailedGalleryThumbnailState({
      cacheKey,
      snapshot: readThumbnailStateSnapshot(),
    });
    applyThumbnailStateSnapshot(result.snapshot);

    if (result.action === 'schedule-retry') {
      scheduleThumbnailRetry(cacheKey, result.attempts);
    }

    setThumbnailRetryTick((current) => current + 1);
  }, [
    applyThumbnailStateSnapshot,
    clearThumbnailLoadWatchdog,
    clearThumbnailRetryTimer,
    readThumbnailStateSnapshot,
    scheduleThumbnailRetry,
  ]);

  useEffect(() => {
    return () => {
      clearAllThumbnailRetryTimers();
      clearAllThumbnailLoadWatchdogs();
    };
  }, [clearAllThumbnailLoadWatchdogs, clearAllThumbnailRetryTimers]);

  useEffect(() => {
    resetGalleryThumbnails();
  }, [resetGalleryThumbnails, selectedProfileId]);

  useEffect(() => {
    if (!selectedProfileId || viewMode !== 'gallery' || isGalleryScrolling) {
      return;
    }

    const now = Date.now();
    const pendingItems = resolvePendingThumbnailItems({
      attemptsByCacheKey: galleryThumbnailAttemptsRef.current,
      errorsByCacheKey: galleryThumbnailErrorsRef.current,
      inferAssetKind,
      loadingByCacheKey: galleryThumbnailLoadingRef.current,
      now,
      retryAtByCacheKey: galleryThumbnailRetryAtRef.current,
      selectedProfileId,
      thumbnailsByCacheKey: galleryThumbnailsRef.current,
      toThumbnailCacheKey,
      visibleGallerySections,
    });

    if (pendingItems.length === 0) {
      return;
    }

    const load = async () => {
      for (
        let index = 0;
        index < pendingItems.length;
        index += GALLERY_THUMBNAIL_CONCURRENCY
      ) {
        const batch = pendingItems.slice(index, index + GALLERY_THUMBNAIL_CONCURRENCY);

        const batchKeys = batch.map((item) => toThumbnailCacheKey(selectedProfileId, item.key));
        const nextLoading = { ...galleryThumbnailLoadingRef.current };
        let hasLoadingChanged = false;
        for (const cacheKey of batchKeys) {
          if (!nextLoading[cacheKey]) {
            nextLoading[cacheKey] = true;
            galleryThumbnailLoadingStartedAtRef.current[cacheKey] = Date.now();
            const existingWatchdog = galleryThumbnailLoadWatchdogsRef.current[cacheKey];
            if (existingWatchdog !== undefined) {
              window.clearTimeout(existingWatchdog);
              delete galleryThumbnailLoadWatchdogsRef.current[cacheKey];
            }
            galleryThumbnailLoadWatchdogsRef.current[cacheKey] = window.setTimeout(() => {
              delete galleryThumbnailLoadWatchdogsRef.current[cacheKey];
              delete galleryThumbnailLoadingStartedAtRef.current[cacheKey];
              if (!galleryThumbnailLoadingRef.current[cacheKey]) {
                return;
              }

              const result = resolveFailedGalleryThumbnailState({
                cacheKey,
                snapshot: readThumbnailStateSnapshot(),
              });
              applyThumbnailStateSnapshot(result.snapshot);

              if (result.action === 'mark-error') {
                clearThumbnailRetryTimer(cacheKey);
              } else {
                scheduleThumbnailRetry(cacheKey, result.attempts);
              }
            }, THUMBNAIL_LOADING_STALE_MS);
            hasLoadingChanged = true;
          }
        }
        if (hasLoadingChanged) {
          galleryThumbnailLoadingRef.current = nextLoading;
          setGalleryThumbnailLoading(nextLoading);
        }

        await Promise.all(
          batch.map(async (item) => {
            const cacheKey = toThumbnailCacheKey(selectedProfileId, item.key);
            let thumbnailDataUrl: string | null = null;
            try {
              const attempts = galleryThumbnailAttemptsRef.current[cacheKey] ?? 0;
              thumbnailDataUrl = await loadGalleryThumbnailDataUrl({
                assetPreviewApi,
                attempts,
                inferAssetKind,
                item,
                profileId: selectedProfileId,
              });

              if (activeProfileIdRef.current !== selectedProfileId) {
                return;
              }
            } catch {
              if (activeProfileIdRef.current !== selectedProfileId) {
                return;
              }
            }

            if (activeProfileIdRef.current === selectedProfileId) {
              const loadedResult = resolveLoadedGalleryThumbnailState({
                cacheKey,
                snapshot: readThumbnailStateSnapshot(),
                thumbnailDataUrl,
              });

              if (loadedResult.hasThumbnail) {
                applyThumbnailStateSnapshot(loadedResult.snapshot);
                clearThumbnailRetryTimer(cacheKey);
              } else {
                const failedResult = resolveFailedGalleryThumbnailState({
                  cacheKey,
                  snapshot: readThumbnailStateSnapshot(),
                });
                applyThumbnailStateSnapshot(failedResult.snapshot);

                if (failedResult.action === 'mark-error') {
                  clearThumbnailRetryTimer(cacheKey);
                } else {
                  scheduleThumbnailRetry(cacheKey, failedResult.attempts);
                }
              }
              clearThumbnailLoadWatchdog(cacheKey);
            }
          }),
        );

        const nextLoadingAfterBatch = { ...galleryThumbnailLoadingRef.current };
        let hasLoadingCleared = false;
        for (const cacheKey of batchKeys) {
          if (nextLoadingAfterBatch[cacheKey]) {
            delete nextLoadingAfterBatch[cacheKey];
            hasLoadingCleared = true;
          }
        }
        if (hasLoadingCleared) {
          galleryThumbnailLoadingRef.current = nextLoadingAfterBatch;
          setGalleryThumbnailLoading(nextLoadingAfterBatch);
        }
      }
    };

    void load();
  }, [
    assetPreviewApi,
    applyThumbnailStateSnapshot,
    clearThumbnailLoadWatchdog,
    clearThumbnailRetryTimer,
    inferAssetKind,
    isGalleryScrolling,
    readThumbnailStateSnapshot,
    scheduleThumbnailRetry,
    selectedProfileId,
    thumbnailRetryTick,
    toThumbnailCacheKey,
    viewMode,
    visibleGallerySections,
  ]);

  return {
    galleryThumbnailErrors,
    galleryThumbnailLoading,
    galleryThumbnails,
    handleThumbnailDecodeError,
    requestThumbnailRetry,
    resetGalleryThumbnails,
  };
};
