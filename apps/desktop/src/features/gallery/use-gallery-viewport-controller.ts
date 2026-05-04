import {
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import {
  GALLERY_SCROLL_IDLE_MS,
  GALLERY_TILE_MIN_WIDTH_COMMIT_DEBOUNCE_MS,
  SCROLL_TOP_UPDATE_EPSILON_PX,
  normalizeGalleryTileMinWidth,
} from './gallery-layout-policy';
import { useGalleryScrollController } from './use-gallery-scroll-controller';
import { useGalleryScrollEffects } from './use-gallery-scroll-effects';
import type { ViewMode } from './use-gallery-view-model';

interface UseGalleryViewportControllerOptions {
  appShellRef: RefObject<HTMLDivElement | null>;
  galleryScrollRef: RefObject<HTMLDivElement | null>;
  galleryScrollTop: number;
  gallerySizeSliderRef: RefObject<HTMLInputElement | null>;
  galleryTileMinWidth: number;
  listContainerRef: RefObject<HTMLDivElement | null>;
  listScrollTop: number;
  setGalleryScrollTop: Dispatch<SetStateAction<number>>;
  setGalleryTileMinWidth: Dispatch<SetStateAction<number>>;
  setListScrollTop: Dispatch<SetStateAction<number>>;
  viewMode: ViewMode;
  visibleItemsLength: number;
}

export const useGalleryViewportController = ({
  appShellRef,
  galleryScrollRef,
  galleryScrollTop,
  gallerySizeSliderRef,
  galleryTileMinWidth,
  listContainerRef,
  listScrollTop,
  setGalleryScrollTop,
  setGalleryTileMinWidth,
  setListScrollTop,
  viewMode,
  visibleItemsLength,
}: UseGalleryViewportControllerOptions) => {
  const [isGalleryScrolling, setIsGalleryScrolling] = useState<boolean>(false);
  const [galleryViewportHeight, setGalleryViewportHeight] = useState<number>(720);
  const [galleryViewportWidth, setGalleryViewportWidth] = useState<number>(960);
  const [listViewportHeight, setListViewportHeight] = useState<number>(420);

  const scrollController = useGalleryScrollController({
    appShellRef,
    commitDebounceMs: GALLERY_TILE_MIN_WIDTH_COMMIT_DEBOUNCE_MS,
    galleryScrollIdleMs: GALLERY_SCROLL_IDLE_MS,
    galleryScrollTop,
    gallerySizeSliderRef,
    galleryTileMinWidth,
    listScrollTop,
    listViewportHeight,
    normalizeGalleryTileMinWidth,
    scrollUpdateEpsilonPx: SCROLL_TOP_UPDATE_EPSILON_PX,
    setGalleryScrollTop,
    setGalleryTileMinWidth,
    setIsGalleryScrolling,
    setListScrollTop,
    setListViewportHeight,
  });

  useGalleryScrollEffects({
    galleryScrollPendingTopRef: scrollController.galleryScrollPendingTopRef,
    galleryScrollRef,
    galleryScrollTop,
    listContainerRef,
    listScrollPendingTopRef: scrollController.listScrollPendingTopRef,
    listScrollPendingViewportHeightRef:
      scrollController.listScrollPendingViewportHeightRef,
    listScrollTop,
    listViewportHeight,
    setGalleryViewportHeight,
    setGalleryViewportWidth,
    setListViewportHeight,
    viewMode,
    visibleItemsLength,
  });

  return {
    ...scrollController,
    galleryViewportHeight,
    galleryViewportWidth,
    isGalleryScrolling,
    listViewportHeight,
  };
};
