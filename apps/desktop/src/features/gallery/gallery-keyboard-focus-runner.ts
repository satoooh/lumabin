import {
  resolveGalleryKeyboardScrollTop,
  type GalleryGridLocation,
  type GalleryVirtualSectionLite,
} from './gallery-keyboard-navigation-policy';

interface RefLike<T> {
  current: T;
}

interface GalleryKeyboardScrollTarget {
  scrollTo: (options: ScrollToOptions) => void;
}

interface FocusGalleryKeyboardTargetOptions {
  assetItemRefs: RefLike<Map<string, HTMLButtonElement>>;
  galleryColumnCount: number;
  galleryDayHeaderHeightPx: number;
  galleryGridGapPx: number;
  galleryGridLocationByKey: Map<string, GalleryGridLocation>;
  galleryScrollRef: RefLike<GalleryKeyboardScrollTarget | null>;
  galleryTileHeight: number;
  galleryViewportHeight: number;
  galleryVirtualSections: GalleryVirtualSectionLite[];
  onFocusAssetItemByKey: (key: string) => void;
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  setTimeout?: (callback: () => void, delayMs: number) => number;
  targetKey: string;
  viewMode: 'gallery' | 'list';
}

export const focusGalleryKeyboardTarget = ({
  assetItemRefs,
  galleryColumnCount,
  galleryDayHeaderHeightPx,
  galleryGridGapPx,
  galleryGridLocationByKey,
  galleryScrollRef,
  galleryTileHeight,
  galleryViewportHeight,
  galleryVirtualSections,
  onFocusAssetItemByKey,
  requestAnimationFrame = window.requestAnimationFrame.bind(window),
  setTimeout = window.setTimeout.bind(window),
  targetKey,
  viewMode,
}: FocusGalleryKeyboardTargetOptions): void => {
  requestAnimationFrame(() => {
    onFocusAssetItemByKey(targetKey);

    if (viewMode !== 'gallery') {
      return;
    }

    if (assetItemRefs.current.has(targetKey)) {
      return;
    }

    const location = galleryGridLocationByKey.get(targetKey);
    const section = location ? galleryVirtualSections[location.sectionIndex] : undefined;
    const scroller = galleryScrollRef.current;
    if (!location || !section || !scroller) {
      return;
    }

    const scrollTop = resolveGalleryKeyboardScrollTop({
      galleryColumnCount,
      galleryDayHeaderHeightPx,
      galleryGridGapPx,
      galleryTileHeight,
      galleryViewportHeight,
      location,
      section,
    });

    if (scrollTop === undefined) {
      return;
    }

    scroller.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });

    setTimeout(() => {
      onFocusAssetItemByKey(targetKey);
    }, 120);
  });
};
