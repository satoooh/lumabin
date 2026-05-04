import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';

interface UseGalleryScrollControllerOptions {
  appShellRef: RefObject<HTMLDivElement | null>;
  commitDebounceMs: number;
  galleryScrollIdleMs: number;
  galleryScrollTop: number;
  gallerySizeSliderRef: RefObject<HTMLInputElement | null>;
  galleryTileMinWidth: number;
  listScrollTop: number;
  listViewportHeight: number;
  normalizeGalleryTileMinWidth: (value: number) => number;
  scrollUpdateEpsilonPx: number;
  setGalleryScrollTop: Dispatch<SetStateAction<number>>;
  setGalleryTileMinWidth: Dispatch<SetStateAction<number>>;
  setIsGalleryScrolling: Dispatch<SetStateAction<boolean>>;
  setListScrollTop: Dispatch<SetStateAction<number>>;
  setListViewportHeight: Dispatch<SetStateAction<number>>;
}

export const shouldUpdateNumericState = (
  current: number,
  next: number,
  epsilon: number,
): boolean => Math.abs(current - next) > epsilon;

export const useGalleryScrollController = ({
  appShellRef,
  commitDebounceMs,
  galleryScrollIdleMs,
  galleryScrollTop,
  gallerySizeSliderRef,
  galleryTileMinWidth,
  listScrollTop,
  listViewportHeight,
  normalizeGalleryTileMinWidth,
  scrollUpdateEpsilonPx,
  setGalleryScrollTop,
  setGalleryTileMinWidth,
  setIsGalleryScrolling,
  setListScrollTop,
  setListViewportHeight,
}: UseGalleryScrollControllerOptions) => {
  const listScrollRafRef = useRef<number | null>(null);
  const listScrollPendingTopRef = useRef<number>(listScrollTop);
  const listScrollPendingViewportHeightRef = useRef<number>(listViewportHeight);
  const galleryScrollRafRef = useRef<number | null>(null);
  const galleryScrollPendingTopRef = useRef<number>(galleryScrollTop);
  const galleryScrollIdleTimerRef = useRef<number | null>(null);
  const isGalleryScrollingRef = useRef<boolean>(false);
  const galleryTileLiveWidthRef = useRef<number>(galleryTileMinWidth);
  const galleryTileCommitTimerRef = useRef<number | null>(null);

  const applyGalleryTileMinWidth = useCallback((value: number) => {
    const normalized = normalizeGalleryTileMinWidth(value);
    if (appShellRef.current) {
      appShellRef.current.style.setProperty('--gallery-tile-min-width', `${normalized}px`);
    }
    galleryTileLiveWidthRef.current = normalized;
  }, [appShellRef, normalizeGalleryTileMinWidth]);

  const commitGalleryTileMinWidth = useCallback((value: number) => {
    const normalized = normalizeGalleryTileMinWidth(value);
    applyGalleryTileMinWidth(normalized);
    setGalleryTileMinWidth((current) =>
      shouldUpdateNumericState(current, normalized, 0.05) ? normalized : current,
    );
  }, [applyGalleryTileMinWidth, normalizeGalleryTileMinWidth, setGalleryTileMinWidth]);

  const clearGalleryTileCommitTimer = useCallback(() => {
    if (galleryTileCommitTimerRef.current !== null) {
      window.clearTimeout(galleryTileCommitTimerRef.current);
      galleryTileCommitTimerRef.current = null;
    }
  }, []);

  const scheduleGalleryTileMinWidthCommit = useCallback((value: number) => {
    clearGalleryTileCommitTimer();
    const normalized = normalizeGalleryTileMinWidth(value);
    galleryTileCommitTimerRef.current = window.setTimeout(() => {
      galleryTileCommitTimerRef.current = null;
      commitGalleryTileMinWidth(normalized);
    }, commitDebounceMs);
  }, [
    clearGalleryTileCommitTimer,
    commitDebounceMs,
    commitGalleryTileMinWidth,
    normalizeGalleryTileMinWidth,
  ]);

  const flushGalleryTileMinWidthCommit = useCallback(() => {
    clearGalleryTileCommitTimer();
    commitGalleryTileMinWidth(galleryTileLiveWidthRef.current);
  }, [clearGalleryTileCommitTimer, commitGalleryTileMinWidth]);

  const adjustGalleryTileMinWidth = useCallback((delta: number) => {
    const next = normalizeGalleryTileMinWidth(galleryTileLiveWidthRef.current + delta);
    if (gallerySizeSliderRef.current) {
      gallerySizeSliderRef.current.value = `${next}`;
    }
    commitGalleryTileMinWidth(next);
  }, [commitGalleryTileMinWidth, gallerySizeSliderRef, normalizeGalleryTileMinWidth]);

  const queueListScrollStateUpdate = useCallback((scrollTop: number, viewportHeight: number) => {
    listScrollPendingTopRef.current = scrollTop;
    listScrollPendingViewportHeightRef.current = viewportHeight;

    if (listScrollRafRef.current !== null) {
      return;
    }

    listScrollRafRef.current = window.requestAnimationFrame(() => {
      listScrollRafRef.current = null;

      const nextScrollTop = listScrollPendingTopRef.current;
      const nextViewportHeight = listScrollPendingViewportHeightRef.current;

      setListScrollTop((current) =>
        shouldUpdateNumericState(current, nextScrollTop, scrollUpdateEpsilonPx)
          ? nextScrollTop
          : current,
      );
      setListViewportHeight((current) =>
        shouldUpdateNumericState(current, nextViewportHeight, scrollUpdateEpsilonPx)
          ? nextViewportHeight
          : current,
      );
    });
  }, [scrollUpdateEpsilonPx, setListScrollTop, setListViewportHeight]);

  const markGalleryScrolling = useCallback(() => {
    if (!isGalleryScrollingRef.current) {
      isGalleryScrollingRef.current = true;
      setIsGalleryScrolling(true);
    }

    if (galleryScrollIdleTimerRef.current !== null) {
      window.clearTimeout(galleryScrollIdleTimerRef.current);
    }

    galleryScrollIdleTimerRef.current = window.setTimeout(() => {
      galleryScrollIdleTimerRef.current = null;
      if (!isGalleryScrollingRef.current) {
        return;
      }
      isGalleryScrollingRef.current = false;
      setIsGalleryScrolling(false);
    }, galleryScrollIdleMs);
  }, [galleryScrollIdleMs, setIsGalleryScrolling]);

  const queueGalleryScrollStateUpdate = useCallback((scrollTop: number) => {
    galleryScrollPendingTopRef.current = scrollTop;
    markGalleryScrolling();

    if (galleryScrollRafRef.current !== null) {
      return;
    }

    galleryScrollRafRef.current = window.requestAnimationFrame(() => {
      galleryScrollRafRef.current = null;
      const nextScrollTop = galleryScrollPendingTopRef.current;
      setGalleryScrollTop((current) =>
        shouldUpdateNumericState(current, nextScrollTop, scrollUpdateEpsilonPx)
          ? nextScrollTop
          : current,
      );
    });
  }, [markGalleryScrolling, scrollUpdateEpsilonPx, setGalleryScrollTop]);

  useEffect(() => {
    applyGalleryTileMinWidth(galleryTileMinWidth);
    if (gallerySizeSliderRef.current) {
      const nextValue = `${galleryTileMinWidth}`;
      if (gallerySizeSliderRef.current.value !== nextValue) {
        gallerySizeSliderRef.current.value = nextValue;
      }
    }
  }, [applyGalleryTileMinWidth, gallerySizeSliderRef, galleryTileMinWidth]);

  useEffect(() => {
    return () => {
      if (galleryTileCommitTimerRef.current !== null) {
        window.clearTimeout(galleryTileCommitTimerRef.current);
        galleryTileCommitTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (listScrollRafRef.current !== null) {
        window.cancelAnimationFrame(listScrollRafRef.current);
        listScrollRafRef.current = null;
      }
      if (galleryScrollRafRef.current !== null) {
        window.cancelAnimationFrame(galleryScrollRafRef.current);
        galleryScrollRafRef.current = null;
      }
      if (galleryScrollIdleTimerRef.current !== null) {
        window.clearTimeout(galleryScrollIdleTimerRef.current);
        galleryScrollIdleTimerRef.current = null;
      }
    };
  }, []);

  return {
    adjustGalleryTileMinWidth,
    applyGalleryTileMinWidth,
    commitGalleryTileMinWidth,
    flushGalleryTileMinWidthCommit,
    galleryScrollPendingTopRef,
    listScrollPendingTopRef,
    listScrollPendingViewportHeightRef,
    queueGalleryScrollStateUpdate,
    queueListScrollStateUpdate,
    scheduleGalleryTileMinWidthCommit,
  };
};
