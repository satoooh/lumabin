import { describe, expect, it } from 'vitest';
import {
  resolveGalleryKeyboardScrollTop,
  resolveGalleryNavigationIndex,
  type GalleryDaySectionLite,
  type GalleryGridLocation,
} from '../../src/features/gallery/gallery-keyboard-navigation-policy';
import type { AssetItem } from '../../src/shared/ipc';

const item = (key: string): AssetItem => ({
  contentType: 'image/png',
  etag: `etag-${key}`,
  key,
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 100,
});

const section = (startIndex: number, keys: string[]): GalleryDaySectionLite => ({
  startIndex,
  items: keys.map(item),
});

describe('gallery keyboard navigation policy', () => {
  it('resolves gallery movement within and across date sections', () => {
    const currentLocation: GalleryGridLocation = {
      sectionIndex: 0,
      localIndex: 3,
      sectionStartIndex: 0,
    };
    const currentSection = section(0, ['a', 'b', 'c', 'd']);
    const nextSection = section(4, ['e', 'f']);

    expect(
      resolveGalleryNavigationIndex({
        currentLocation,
        galleryColumnCount: 2,
        galleryGridGapPx: 12,
        galleryTileHeight: 100,
        galleryViewportHeight: 240,
        key: 'ArrowDown',
        nextSection,
        selectedIndex: 3,
        section: currentSection,
        visibleItemsLength: 6,
      }),
    ).toBe(5);
  });

  it('falls back to bounded linear movement when the current item is not in the grid map', () => {
    expect(
      resolveGalleryNavigationIndex({
        galleryColumnCount: 3,
        galleryGridGapPx: 12,
        galleryTileHeight: 100,
        galleryViewportHeight: 240,
        key: 'ArrowLeft',
        selectedIndex: 2,
        visibleItemsLength: 5,
      }),
    ).toBe(1);
  });

  it('resolves the virtualized gallery scroll target for keyboard focus movement', () => {
    expect(
      resolveGalleryKeyboardScrollTop({
        galleryColumnCount: 3,
        galleryDayHeaderHeightPx: 36,
        galleryGridGapPx: 12,
        galleryTileHeight: 100,
        galleryViewportHeight: 400,
        location: {
          sectionIndex: 1,
          localIndex: 7,
          sectionStartIndex: 20,
        },
        section: {
          topOffset: 1_000,
        },
      }),
    ).toBe(1_120);

    expect(
      resolveGalleryKeyboardScrollTop({
        galleryColumnCount: 3,
        galleryDayHeaderHeightPx: 36,
        galleryGridGapPx: 12,
        galleryTileHeight: 100,
        galleryViewportHeight: 2_000,
        location: {
          sectionIndex: 0,
          localIndex: 0,
          sectionStartIndex: 0,
        },
        section: {
          topOffset: 100,
        },
      }),
    ).toBe(0);
  });
});
