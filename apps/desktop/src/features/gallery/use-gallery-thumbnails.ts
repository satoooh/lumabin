import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ensureImageDataUrlDecodable,
  extractVideoFrameThumbnail,
  withTimeout,
} from '../shared/media-preview';
import type { AssetItem } from '../../shared/ipc';
import type { AssetThumbnailApi } from '../shared/desktop-api-gateway';
import {
  GALLERY_THUMBNAIL_CONCURRENCY,
  GALLERY_THUMBNAIL_MAX_ATTEMPTS,
  THUMBNAIL_LOADING_STALE_MS,
  THUMBNAIL_PREVIEW_TIMEOUT_MS,
  VIDEO_THUMBNAIL_SEEK_SECONDS,
  VIDEO_THUMBNAIL_TIMEOUT_MS,
  resolvePendingThumbnailItems,
  thumbnailPreviewMaxBytesForAttempt,
  thumbnailRetryDelayMs,
  type GalleryThumbnailSection,
  type ThumbnailAssetKind,
} from './gallery-thumbnail-policy';
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
    delete galleryThumbnailAttemptsRef.current[cacheKey];
    delete galleryThumbnailRetryAtRef.current[cacheKey];

    if (galleryThumbnailErrorsRef.current[cacheKey]) {
      const nextErrors = { ...galleryThumbnailErrorsRef.current };
      delete nextErrors[cacheKey];
      galleryThumbnailErrorsRef.current = nextErrors;
      setGalleryThumbnailErrors(nextErrors);
    }

    if (galleryThumbnailLoadingRef.current[cacheKey]) {
      const nextLoading = { ...galleryThumbnailLoadingRef.current };
      delete nextLoading[cacheKey];
      galleryThumbnailLoadingRef.current = nextLoading;
      setGalleryThumbnailLoading(nextLoading);
    }

    setThumbnailRetryTick((current) => current + 1);
  }, [clearThumbnailLoadWatchdog, clearThumbnailRetryTimer]);

  const handleThumbnailDecodeError = useCallback((cacheKey: string) => {
    clearThumbnailRetryTimer(cacheKey);
    clearThumbnailLoadWatchdog(cacheKey);

    if (galleryThumbnailsRef.current[cacheKey]) {
      const nextThumbnails = { ...galleryThumbnailsRef.current };
      delete nextThumbnails[cacheKey];
      galleryThumbnailsRef.current = nextThumbnails;
      setGalleryThumbnails(nextThumbnails);
    }

    if (galleryThumbnailLoadingRef.current[cacheKey]) {
      const nextLoading = { ...galleryThumbnailLoadingRef.current };
      delete nextLoading[cacheKey];
      galleryThumbnailLoadingRef.current = nextLoading;
      setGalleryThumbnailLoading(nextLoading);
    }

    const attempts = (galleryThumbnailAttemptsRef.current[cacheKey] ?? 0) + 1;
    galleryThumbnailAttemptsRef.current[cacheKey] = attempts;

    if (attempts >= GALLERY_THUMBNAIL_MAX_ATTEMPTS) {
      delete galleryThumbnailRetryAtRef.current[cacheKey];
      const nextErrors = {
        ...galleryThumbnailErrorsRef.current,
        [cacheKey]: true,
      };
      galleryThumbnailErrorsRef.current = nextErrors;
      setGalleryThumbnailErrors(nextErrors);
    } else {
      if (galleryThumbnailErrorsRef.current[cacheKey]) {
        const nextErrors = { ...galleryThumbnailErrorsRef.current };
        delete nextErrors[cacheKey];
        galleryThumbnailErrorsRef.current = nextErrors;
        setGalleryThumbnailErrors(nextErrors);
      }
      scheduleThumbnailRetry(cacheKey, attempts);
    }

    setThumbnailRetryTick((current) => current + 1);
  }, [clearThumbnailLoadWatchdog, clearThumbnailRetryTimer, scheduleThumbnailRetry]);

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

              const nextLoadingAfterTimeout = { ...galleryThumbnailLoadingRef.current };
              delete nextLoadingAfterTimeout[cacheKey];
              galleryThumbnailLoadingRef.current = nextLoadingAfterTimeout;
              setGalleryThumbnailLoading(nextLoadingAfterTimeout);

              const attempts = (galleryThumbnailAttemptsRef.current[cacheKey] ?? 0) + 1;
              galleryThumbnailAttemptsRef.current[cacheKey] = attempts;
              if (attempts >= GALLERY_THUMBNAIL_MAX_ATTEMPTS) {
                clearThumbnailRetryTimer(cacheKey);
                delete galleryThumbnailRetryAtRef.current[cacheKey];
                const nextErrors = {
                  ...galleryThumbnailErrorsRef.current,
                  [cacheKey]: true,
                };
                galleryThumbnailErrorsRef.current = nextErrors;
                setGalleryThumbnailErrors(nextErrors);
              } else {
                scheduleThumbnailRetry(cacheKey, attempts);
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
            let hasThumbnail = false;
            try {
              const itemKind = inferAssetKind(item);
              const attempts = galleryThumbnailAttemptsRef.current[cacheKey] ?? 0;
              const maxBytes =
                itemKind === 'video'
                  ? thumbnailPreviewMaxBytesForAttempt('video', attempts)
                  : thumbnailPreviewMaxBytesForAttempt('image', attempts);
              const preview = await withTimeout(
                assetPreviewApi.previewAsset({
                  profileId: selectedProfileId,
                  key: item.key,
                  etag: item.etag || undefined,
                  maxBytes,
                }),
                THUMBNAIL_PREVIEW_TIMEOUT_MS,
                'Thumbnail preview timed out',
              );

              if (activeProfileIdRef.current !== selectedProfileId) {
                return;
              }

              if (preview.kind === 'image' && preview.dataBase64) {
                const dataUrl = `data:${preview.contentType};base64,${preview.dataBase64}`;
                await withTimeout(
                  ensureImageDataUrlDecodable(dataUrl),
                  2_600,
                  'Image thumbnail decode timed out',
                );
                if (!galleryThumbnailsRef.current[cacheKey]) {
                  const nextThumbnails = {
                    ...galleryThumbnailsRef.current,
                    [cacheKey]: dataUrl,
                  };
                  galleryThumbnailsRef.current = nextThumbnails;
                  setGalleryThumbnails(nextThumbnails);
                }
                hasThumbnail = true;
              }

              if (preview.kind === 'video' && preview.dataBase64) {
                const videoDataUrl = `data:${preview.contentType};base64,${preview.dataBase64}`;
                const frameDataUrl = await withTimeout(
                  extractVideoFrameThumbnail(videoDataUrl, {
                    seekSeconds: VIDEO_THUMBNAIL_SEEK_SECONDS,
                    timeoutMs: VIDEO_THUMBNAIL_TIMEOUT_MS,
                  }),
                  VIDEO_THUMBNAIL_TIMEOUT_MS + 1_000,
                  'Video thumbnail extraction timed out',
                );
                if (activeProfileIdRef.current !== selectedProfileId) {
                  return;
                }

                if (!galleryThumbnailsRef.current[cacheKey]) {
                  const nextThumbnails = {
                    ...galleryThumbnailsRef.current,
                    [cacheKey]: frameDataUrl,
                  };
                  galleryThumbnailsRef.current = nextThumbnails;
                  setGalleryThumbnails(nextThumbnails);
                }
                hasThumbnail = true;
              }
            } catch {
              if (activeProfileIdRef.current !== selectedProfileId) {
                return;
              }
            }

            if (activeProfileIdRef.current === selectedProfileId) {
              if (hasThumbnail || Boolean(galleryThumbnailsRef.current[cacheKey])) {
                delete galleryThumbnailAttemptsRef.current[cacheKey];
                delete galleryThumbnailRetryAtRef.current[cacheKey];
                clearThumbnailRetryTimer(cacheKey);
                if (galleryThumbnailErrorsRef.current[cacheKey]) {
                  const nextErrors = { ...galleryThumbnailErrorsRef.current };
                  delete nextErrors[cacheKey];
                  galleryThumbnailErrorsRef.current = nextErrors;
                  setGalleryThumbnailErrors(nextErrors);
                }
              } else {
                const attempts = (galleryThumbnailAttemptsRef.current[cacheKey] ?? 0) + 1;
                galleryThumbnailAttemptsRef.current[cacheKey] = attempts;
                if (attempts >= GALLERY_THUMBNAIL_MAX_ATTEMPTS) {
                  clearThumbnailRetryTimer(cacheKey);
                  delete galleryThumbnailRetryAtRef.current[cacheKey];
                  const nextErrors = {
                    ...galleryThumbnailErrorsRef.current,
                    [cacheKey]: true,
                  };
                  galleryThumbnailErrorsRef.current = nextErrors;
                  setGalleryThumbnailErrors(nextErrors);
                } else {
                  scheduleThumbnailRetry(cacheKey, attempts);
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
    clearThumbnailLoadWatchdog,
    clearThumbnailRetryTimer,
    inferAssetKind,
    isGalleryScrolling,
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
