import { describe, expect, it } from 'vitest';
import {
  isGalleryNavigationKey,
  isShortcutHelpHotkey,
  isWorkspaceKeyboardBlockedByModal,
  resolveGalleryKeyboardScrollTop,
  resolveGalleryNavigationIndex,
  resolveLinearNavigationIndex,
  resolveQuickPreviewKeyboardAction,
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

  it('resolves modal blocking, quick-preview keys, and bounded linear movement', () => {
    expect(
      isWorkspaceKeyboardBlockedByModal({
        hasAssetActionDialog: false,
        hasBulkDeleteDialog: false,
        hasBulkMoveDialog: false,
        hasUploadConflictDialog: false,
        isConnectionSetupOpen: false,
        isShortcutHelpOpen: false,
        isWorkspaceSettingsOpen: false,
      }),
    ).toBe(false);
    expect(
      isWorkspaceKeyboardBlockedByModal({
        hasAssetActionDialog: false,
        hasBulkDeleteDialog: false,
        hasBulkMoveDialog: true,
        hasUploadConflictDialog: false,
        isConnectionSetupOpen: false,
        isShortcutHelpOpen: false,
        isWorkspaceSettingsOpen: false,
      }),
    ).toBe(true);

    expect(resolveQuickPreviewKeyboardAction('ArrowRight')).toBe('move-next');
    expect(resolveQuickPreviewKeyboardAction('ArrowLeft')).toBe('move-previous');
    expect(resolveQuickPreviewKeyboardAction('Enter')).toBe('close');
    expect(resolveQuickPreviewKeyboardAction('x')).toBe('ignore');

    expect(
      resolveLinearNavigationIndex({
        key: 'ArrowDown',
        selectedIndex: -1,
        visibleItemsLength: 3,
      }),
    ).toBe(0);
    expect(
      resolveLinearNavigationIndex({
        key: 'ArrowRight',
        selectedIndex: 1,
        visibleItemsLength: 3,
      }),
    ).toBe(2);
    expect(
      resolveLinearNavigationIndex({
        key: 'ArrowLeft',
        selectedIndex: 0,
        visibleItemsLength: 3,
      }),
    ).toBe(0);
    expect(
      resolveLinearNavigationIndex({
        key: 'Enter',
        selectedIndex: 1,
        visibleItemsLength: 3,
      }),
    ).toBeUndefined();
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
