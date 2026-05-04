import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from 'react';
import type { ViewMode } from './use-gallery-view-model';

export const shouldApplyScrollTop = (
  currentScrollTop: number,
  targetScrollTop: number,
): boolean => Math.abs(currentScrollTop - targetScrollTop) > 1;

interface UseGalleryScrollEffectsOptions {
  galleryScrollPendingTopRef: MutableRefObject<number>;
  galleryScrollRef: RefObject<HTMLDivElement | null>;
  galleryScrollTop: number;
  listContainerRef: RefObject<HTMLDivElement | null>;
  listScrollPendingTopRef: MutableRefObject<number>;
  listScrollPendingViewportHeightRef: MutableRefObject<number>;
  listScrollTop: number;
  listViewportHeight: number;
  setGalleryViewportHeight: Dispatch<SetStateAction<number>>;
  setGalleryViewportWidth: Dispatch<SetStateAction<number>>;
  setListViewportHeight: Dispatch<SetStateAction<number>>;
  viewMode: ViewMode;
  visibleItemsLength: number;
}

export const useGalleryScrollEffects = ({
  galleryScrollPendingTopRef,
  galleryScrollRef,
  galleryScrollTop,
  listContainerRef,
  listScrollPendingTopRef,
  listScrollPendingViewportHeightRef,
  listScrollTop,
  listViewportHeight,
  setGalleryViewportHeight,
  setGalleryViewportWidth,
  setListViewportHeight,
  viewMode,
  visibleItemsLength,
}: UseGalleryScrollEffectsOptions): void => {
  useEffect(() => {
    galleryScrollPendingTopRef.current = galleryScrollTop;
  }, [galleryScrollPendingTopRef, galleryScrollTop]);

  useEffect(() => {
    listScrollPendingTopRef.current = listScrollTop;
  }, [listScrollPendingTopRef, listScrollTop]);

  useEffect(() => {
    listScrollPendingViewportHeightRef.current = listViewportHeight;
  }, [listScrollPendingViewportHeightRef, listViewportHeight]);

  useEffect(() => {
    if (viewMode !== 'list') {
      return;
    }
    const node = listContainerRef.current;
    if (!node) {
      return;
    }
    if (!shouldApplyScrollTop(node.scrollTop, listScrollTop)) {
      return;
    }
    node.scrollTop = listScrollTop;
  }, [listContainerRef, listScrollTop, viewMode, visibleItemsLength]);

  useEffect(() => {
    if (viewMode !== 'gallery') {
      return;
    }
    const node = galleryScrollRef.current;
    if (!node) {
      return;
    }
    if (!shouldApplyScrollTop(node.scrollTop, galleryScrollTop)) {
      return;
    }
    node.scrollTop = galleryScrollTop;
  }, [galleryScrollRef, galleryScrollTop, viewMode, visibleItemsLength]);

  useEffect(() => {
    if (viewMode !== 'gallery') {
      return;
    }

    const node = galleryScrollRef.current;
    if (!node) {
      return;
    }

    const syncViewportSize = () => {
      setGalleryViewportHeight(node.clientHeight);
      setGalleryViewportWidth(node.clientWidth);
    };
    syncViewportSize();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncViewportSize);
      return () => {
        window.removeEventListener('resize', syncViewportSize);
      };
    }

    const observer = new ResizeObserver(() => {
      syncViewportSize();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [galleryScrollRef, setGalleryViewportHeight, setGalleryViewportWidth, viewMode]);

  useEffect(() => {
    const syncViewport = () => {
      if (listContainerRef.current) {
        setListViewportHeight(listContainerRef.current.clientHeight);
      }
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => {
      window.removeEventListener('resize', syncViewport);
    };
  }, [listContainerRef, setListViewportHeight]);
};
