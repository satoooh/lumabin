import {
  useCallback,
  useRef,
  type RefObject,
} from 'react';
import type { AssetItem } from '../../shared/ipc';
import type {
  GalleryVirtualSection,
  ViewMode,
} from './use-gallery-view-model';

export interface GalleryGridLocation {
  localIndex: number;
  sectionIndex: number;
  sectionStartIndex: number;
}

interface UseAssetFocusControllerOptions {
  galleryColumnCount: number;
  galleryDayHeaderHeightPx: number;
  galleryGridGapPx: number;
  galleryGridLocationByKey: Map<string, GalleryGridLocation>;
  galleryScrollRef: RefObject<HTMLDivElement | null>;
  galleryTileHeight: number;
  galleryViewportHeight: number;
  galleryVirtualSections: GalleryVirtualSection[];
  listContainerRef: RefObject<HTMLDivElement | null>;
  listRowHeightPx: number;
  listViewportHeight: number;
  viewMode: ViewMode;
  visibleItems: AssetItem[];
}

export interface AssetFocusController {
  assetItemRefs: RefObject<Map<string, HTMLButtonElement>>;
  focusAssetItemByKey: (key: string) => boolean;
  scrollToAssetInCurrentView: (key: string, behavior?: ScrollBehavior) => boolean;
  setAssetItemRef: (key: string, node: HTMLButtonElement | null) => void;
}

export const calculateListAssetTargetTop = (
  listIndex: number,
  rowHeightPx: number,
  viewportHeight: number,
): number => Math.max(0, listIndex * rowHeightPx - viewportHeight * 0.35);

export const calculateGalleryAssetTargetTop = ({
  columnCount,
  dayHeaderHeightPx,
  gridGapPx,
  localIndex,
  sectionTopOffset,
  tileHeight,
  viewportHeight,
}: {
  columnCount: number;
  dayHeaderHeightPx: number;
  gridGapPx: number;
  localIndex: number;
  sectionTopOffset: number;
  tileHeight: number;
  viewportHeight: number;
}): number => {
  const rowHeight = tileHeight + gridGapPx;
  const targetRow = Math.floor(localIndex / columnCount);
  const targetTop = sectionTopOffset + dayHeaderHeightPx + targetRow * rowHeight;
  return Math.max(0, targetTop - viewportHeight * 0.35);
};

export const useAssetFocusController = ({
  galleryColumnCount,
  galleryDayHeaderHeightPx,
  galleryGridGapPx,
  galleryGridLocationByKey,
  galleryScrollRef,
  galleryTileHeight,
  galleryViewportHeight,
  galleryVirtualSections,
  listContainerRef,
  listRowHeightPx,
  listViewportHeight,
  viewMode,
  visibleItems,
}: UseAssetFocusControllerOptions): AssetFocusController => {
  const assetItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setAssetItemRef = useCallback((key: string, node: HTMLButtonElement | null) => {
    if (node) {
      assetItemRefs.current.set(key, node);
      return;
    }
    assetItemRefs.current.delete(key);
  }, []);

  const focusAssetItemByKey = useCallback((key: string): boolean => {
    const target = assetItemRefs.current.get(key);
    if (!target) {
      return false;
    }
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    return true;
  }, []);

  const scrollToAssetInCurrentView = useCallback(
    (
      key: string,
      behavior: ScrollBehavior = 'auto',
    ): boolean => {
      if (!key) {
        return false;
      }

      if (viewMode === 'list') {
        const listNode = listContainerRef.current;
        if (!listNode) {
          return false;
        }

        const listIndex = visibleItems.findIndex((item) => item.key === key);
        if (listIndex < 0) {
          return false;
        }

        const viewportHeight = Math.max(1, listNode.clientHeight || listViewportHeight);
        listNode.scrollTo({
          top: calculateListAssetTargetTop(listIndex, listRowHeightPx, viewportHeight),
          behavior,
        });
        return true;
      }

      const galleryNode = galleryScrollRef.current;
      const location = galleryGridLocationByKey.get(key);
      const section = location ? galleryVirtualSections[location.sectionIndex] : undefined;
      if (!galleryNode || !location || !section) {
        return false;
      }

      galleryNode.scrollTo({
        top: calculateGalleryAssetTargetTop({
          columnCount: galleryColumnCount,
          dayHeaderHeightPx: galleryDayHeaderHeightPx,
          gridGapPx: galleryGridGapPx,
          localIndex: location.localIndex,
          sectionTopOffset: section.topOffset,
          tileHeight: galleryTileHeight,
          viewportHeight: galleryViewportHeight,
        }),
        behavior,
      });
      return true;
    },
    [
      galleryColumnCount,
      galleryDayHeaderHeightPx,
      galleryGridGapPx,
      galleryGridLocationByKey,
      galleryScrollRef,
      galleryTileHeight,
      galleryViewportHeight,
      galleryVirtualSections,
      listContainerRef,
      listRowHeightPx,
      listViewportHeight,
      viewMode,
      visibleItems,
    ],
  );

  return {
    assetItemRefs,
    focusAssetItemByKey,
    scrollToAssetInCurrentView,
    setAssetItemRef,
  };
};
