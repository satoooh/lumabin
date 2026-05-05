import { describe, expect, it, vi } from 'vitest';
import { focusGalleryKeyboardTarget } from '../../src/features/gallery/gallery-keyboard-focus-runner';

describe('gallery keyboard focus runner', () => {
  it('focuses immediately without gallery scrolling when the target is rendered', () => {
    const onFocusAssetItemByKey = vi.fn();
    const scrollTo = vi.fn();
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const setTimeout = vi.fn((callback: () => void) => {
      callback();
      return 1;
    });

    focusGalleryKeyboardTarget({
      assetItemRefs: {
        current: new Map([['photos/a.png', document.createElement('button')]]),
      },
      galleryColumnCount: 3,
      galleryDayHeaderHeightPx: 36,
      galleryGridGapPx: 12,
      galleryGridLocationByKey: new Map(),
      galleryScrollRef: {
        current: {
          scrollTo,
        },
      },
      galleryTileHeight: 100,
      galleryViewportHeight: 400,
      galleryVirtualSections: [],
      onFocusAssetItemByKey,
      requestAnimationFrame,
      setTimeout,
      targetKey: 'photos/a.png',
      viewMode: 'gallery',
    });

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(onFocusAssetItemByKey).toHaveBeenCalledTimes(1);
    expect(onFocusAssetItemByKey).toHaveBeenCalledWith('photos/a.png');
    expect(scrollTo).not.toHaveBeenCalled();
    expect(setTimeout).not.toHaveBeenCalled();
  });

  it('scrolls and refocuses virtualized gallery targets that are not rendered yet', () => {
    const onFocusAssetItemByKey = vi.fn();
    const scrollTo = vi.fn();
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const setTimeout = vi.fn((callback: () => void) => {
      callback();
      return 1;
    });

    focusGalleryKeyboardTarget({
      assetItemRefs: {
        current: new Map(),
      },
      galleryColumnCount: 3,
      galleryDayHeaderHeightPx: 36,
      galleryGridGapPx: 12,
      galleryGridLocationByKey: new Map([
        [
          'photos/a.png',
          {
            sectionIndex: 1,
            localIndex: 7,
            sectionStartIndex: 20,
          },
        ],
      ]),
      galleryScrollRef: {
        current: {
          scrollTo,
        },
      },
      galleryTileHeight: 100,
      galleryViewportHeight: 400,
      galleryVirtualSections: [
        {
          topOffset: 0,
        },
        {
          topOffset: 1_000,
        },
      ],
      onFocusAssetItemByKey,
      requestAnimationFrame,
      setTimeout,
      targetKey: 'photos/a.png',
      viewMode: 'gallery',
    });

    expect(scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: 1_120,
    });
    expect(onFocusAssetItemByKey).toHaveBeenCalledTimes(2);
    expect(onFocusAssetItemByKey).toHaveBeenNthCalledWith(1, 'photos/a.png');
    expect(onFocusAssetItemByKey).toHaveBeenNthCalledWith(2, 'photos/a.png');
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 120);
  });
});
