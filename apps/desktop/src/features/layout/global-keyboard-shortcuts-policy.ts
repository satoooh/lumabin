import type { AssetItem } from '../../shared/ipc';

export interface GalleryGridLocation {
  sectionIndex: number;
  localIndex: number;
  sectionStartIndex: number;
}

export interface GalleryDaySectionLite {
  startIndex: number;
  items: AssetItem[];
}

export interface GalleryVirtualSectionLite {
  topOffset: number;
}

interface ResolveGalleryKeyboardScrollTopOptions {
  galleryColumnCount: number;
  galleryDayHeaderHeightPx: number;
  galleryGridGapPx: number;
  galleryTileHeight: number;
  galleryViewportHeight: number;
  location?: GalleryGridLocation;
  section?: GalleryVirtualSectionLite;
}

interface ResolveLinearNavigationIndexOptions {
  key: string;
  selectedIndex: number;
  visibleItemsLength: number;
}

interface WorkspaceKeyboardModalState {
  hasAssetActionDialog: boolean;
  hasBulkDeleteDialog: boolean;
  hasBulkMoveDialog: boolean;
  hasUploadConflictDialog: boolean;
  isConnectionSetupOpen: boolean;
  isShortcutHelpOpen: boolean;
  isWorkspaceSettingsOpen: boolean;
}

export type QuickPreviewKeyboardAction = 'close' | 'move-next' | 'move-previous' | 'ignore';

export const isEditableKeyboardTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable);

export const isShortcutHelpHotkey = (
  key: string,
  hasCommandModifier: boolean,
  hasAltModifier: boolean,
  hasShiftModifier: boolean,
): boolean =>
  (key === '?' || (key === '/' && hasShiftModifier)) &&
  !hasCommandModifier &&
  !hasAltModifier;

export const isGalleryNavigationKey = (key: string): boolean =>
  key === 'ArrowDown' ||
  key === 'ArrowUp' ||
  key === 'ArrowLeft' ||
  key === 'ArrowRight' ||
  key === 'Home' ||
  key === 'End' ||
  key === 'PageDown' ||
  key === 'PageUp';

export const isWorkspaceKeyboardBlockedByModal = ({
  hasAssetActionDialog,
  hasBulkDeleteDialog,
  hasBulkMoveDialog,
  hasUploadConflictDialog,
  isConnectionSetupOpen,
  isShortcutHelpOpen,
  isWorkspaceSettingsOpen,
}: WorkspaceKeyboardModalState): boolean =>
  isConnectionSetupOpen ||
  isWorkspaceSettingsOpen ||
  isShortcutHelpOpen ||
  hasAssetActionDialog ||
  hasBulkMoveDialog ||
  hasBulkDeleteDialog ||
  hasUploadConflictDialog;

export const resolveQuickPreviewKeyboardAction = (
  key: string,
): QuickPreviewKeyboardAction => {
  if (key === 'ArrowRight') {
    return 'move-next';
  }
  if (key === 'ArrowLeft') {
    return 'move-previous';
  }
  if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
    return 'close';
  }
  return 'ignore';
};

export const resolveLinearNavigationIndex = ({
  key,
  selectedIndex,
  visibleItemsLength,
}: ResolveLinearNavigationIndexOptions): number | undefined => {
  if (visibleItemsLength <= 0) {
    return undefined;
  }
  if (key === 'ArrowDown' || key === 'ArrowRight') {
    return Math.min(visibleItemsLength - 1, selectedIndex < 0 ? 0 : selectedIndex + 1);
  }
  if (key === 'ArrowUp' || key === 'ArrowLeft') {
    return Math.max(0, selectedIndex <= 0 ? 0 : selectedIndex - 1);
  }
  return undefined;
};

interface ResolveGalleryNavigationIndexOptions {
  currentLocation?: GalleryGridLocation;
  galleryColumnCount: number;
  galleryGridGapPx: number;
  galleryTileHeight: number;
  galleryViewportHeight: number;
  key: string;
  nextSection?: GalleryDaySectionLite;
  previousSection?: GalleryDaySectionLite;
  selectedIndex: number;
  section?: GalleryDaySectionLite;
  visibleItemsLength: number;
}

export const resolveGalleryNavigationIndex = ({
  currentLocation,
  galleryColumnCount,
  galleryGridGapPx,
  galleryTileHeight,
  galleryViewportHeight,
  key,
  nextSection,
  previousSection,
  selectedIndex,
  section,
  visibleItemsLength,
}: ResolveGalleryNavigationIndexOptions): number => {
  if (visibleItemsLength <= 0) {
    return -1;
  }

  if (selectedIndex < 0) {
    return 0;
  }

  if (key === 'Home') {
    return 0;
  }

  if (key === 'End') {
    return visibleItemsLength - 1;
  }

  if (!currentLocation || !section) {
    const fallbackDelta = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
    return Math.max(0, Math.min(visibleItemsLength - 1, selectedIndex + fallbackDelta));
  }

  const columnOffset = currentLocation.localIndex % galleryColumnCount;
  const rowJumpCount = Math.max(
    1,
    Math.floor(galleryViewportHeight / Math.max(1, galleryTileHeight + galleryGridGapPx)),
  );
  const verticalJump =
    key === 'PageDown' || key === 'PageUp'
      ? galleryColumnCount * rowJumpCount
      : galleryColumnCount;
  const isMovingDown = key === 'ArrowDown' || key === 'PageDown';
  const isMovingUp = key === 'ArrowUp' || key === 'PageUp';

  if (key === 'ArrowRight') {
    return Math.min(visibleItemsLength - 1, selectedIndex + 1);
  }

  if (key === 'ArrowLeft') {
    return Math.max(0, selectedIndex - 1);
  }

  if (isMovingDown) {
    const nextLocalIndex = currentLocation.localIndex + verticalJump;
    if (nextLocalIndex < section.items.length) {
      return section.startIndex + nextLocalIndex;
    }
    if (!nextSection) {
      return visibleItemsLength - 1;
    }
    return (
      nextSection.startIndex +
      Math.min(columnOffset, Math.max(0, nextSection.items.length - 1))
    );
  }

  if (isMovingUp) {
    const previousLocalIndex = currentLocation.localIndex - verticalJump;
    if (previousLocalIndex >= 0) {
      return section.startIndex + previousLocalIndex;
    }
    if (!previousSection) {
      return 0;
    }
    const previousRowCount = Math.max(
      1,
      Math.ceil(previousSection.items.length / galleryColumnCount),
    );
    const previousLastRowStart = (previousRowCount - 1) * galleryColumnCount;
    const previousLocalTarget = Math.min(
      previousLastRowStart + columnOffset,
      Math.max(0, previousSection.items.length - 1),
    );
    return previousSection.startIndex + previousLocalTarget;
  }

  return selectedIndex;
};

export const resolveGalleryKeyboardScrollTop = ({
  galleryColumnCount,
  galleryDayHeaderHeightPx,
  galleryGridGapPx,
  galleryTileHeight,
  galleryViewportHeight,
  location,
  section,
}: ResolveGalleryKeyboardScrollTopOptions): number | undefined => {
  if (!location || !section) {
    return undefined;
  }

  const safeColumnCount = Math.max(1, galleryColumnCount);
  const rowHeight = galleryTileHeight + galleryGridGapPx;
  const targetRow = Math.floor(location.localIndex / safeColumnCount);
  const targetTop =
    section.topOffset + galleryDayHeaderHeightPx + targetRow * rowHeight;

  return Math.max(0, targetTop - galleryViewportHeight * 0.35);
};
