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
export type WorkspaceKeyboardShortcutIntent =
  | 'decrease-gallery-tile-size'
  | 'focus-search'
  | 'ignore'
  | 'increase-gallery-tile-size'
  | 'reset-gallery-tile-size'
  | 'select-all-visible'
  | 'toggle-shortcut-help';

interface ResolveWorkspaceKeyboardShortcutIntentOptions {
  hasAltModifier: boolean;
  hasCommandModifier: boolean;
  hasShiftModifier: boolean;
  isSelectionMode: boolean;
  isTypingElement: boolean;
  key: string;
  viewMode: 'gallery' | 'list';
}

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

export const resolveWorkspaceKeyboardShortcutIntent = ({
  hasAltModifier,
  hasCommandModifier,
  hasShiftModifier,
  isSelectionMode,
  isTypingElement,
  key,
  viewMode,
}: ResolveWorkspaceKeyboardShortcutIntentOptions): WorkspaceKeyboardShortcutIntent => {
  const normalizedKey = key.toLowerCase();

  if (hasCommandModifier && normalizedKey === 'k') {
    return 'focus-search';
  }

  if (hasCommandModifier && normalizedKey === 'a' && isSelectionMode) {
    return 'select-all-visible';
  }

  if (hasCommandModifier && viewMode === 'gallery') {
    if (key === '=' || key === '+') {
      return 'increase-gallery-tile-size';
    }
    if (key === '-' || key === '_') {
      return 'decrease-gallery-tile-size';
    }
    if (key === '0') {
      return 'reset-gallery-tile-size';
    }
  }

  if (
    isShortcutHelpHotkey(key, hasCommandModifier, hasAltModifier, hasShiftModifier) &&
    !isTypingElement
  ) {
    return 'toggle-shortcut-help';
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
