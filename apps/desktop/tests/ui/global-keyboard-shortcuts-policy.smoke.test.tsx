import { describe, expect, it } from 'vitest';
import {
  isGalleryNavigationKey,
  isShortcutHelpHotkey,
  resolveGalleryNavigationIndex,
  type GalleryDaySectionLite,
  type GalleryGridLocation,
} from '../../src/features/layout/global-keyboard-shortcuts-policy';
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

describe('global keyboard shortcuts policy', () => {
  it('detects shortcut help and gallery navigation keys', () => {
    expect(isShortcutHelpHotkey('?', false, false, false)).toBe(true);
    expect(isShortcutHelpHotkey('/', false, false, true)).toBe(true);
    expect(isShortcutHelpHotkey('/', true, false, true)).toBe(false);
    expect(isGalleryNavigationKey('PageDown')).toBe(true);
    expect(isGalleryNavigationKey('Enter')).toBe(false);
  });

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
});
