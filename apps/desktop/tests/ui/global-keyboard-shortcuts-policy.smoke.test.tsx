import { describe, expect, it } from 'vitest';
import {
  isGalleryNavigationKey,
  isShortcutHelpHotkey,
  isWorkspaceKeyboardBlockedByModal,
  resolveLinearNavigationIndex,
  resolveQuickPreviewKeyboardAction,
  resolveWorkspaceKeyboardShortcutIntent,
} from '../../src/features/layout/global-keyboard-shortcuts-policy';

describe('global keyboard shortcuts policy', () => {
  it('detects shortcut help and gallery navigation keys', () => {
    expect(isShortcutHelpHotkey('?', false, false, false)).toBe(true);
    expect(isShortcutHelpHotkey('/', false, false, true)).toBe(true);
    expect(isShortcutHelpHotkey('/', true, false, true)).toBe(false);
    expect(isGalleryNavigationKey('PageDown')).toBe(true);
    expect(isGalleryNavigationKey('Enter')).toBe(false);
  });

  it('resolves high-level workspace shortcut intents before command execution', () => {
    expect(
      resolveWorkspaceKeyboardShortcutIntent({
        hasAltModifier: false,
        hasCommandModifier: true,
        hasShiftModifier: false,
        isSelectionMode: false,
        isTypingElement: true,
        key: 'k',
        viewMode: 'gallery',
      }),
    ).toBe('focus-search');
    expect(
      resolveWorkspaceKeyboardShortcutIntent({
        hasAltModifier: false,
        hasCommandModifier: true,
        hasShiftModifier: false,
        isSelectionMode: true,
        isTypingElement: false,
        key: 'a',
        viewMode: 'list',
      }),
    ).toBe('select-all-visible');
    expect(
      resolveWorkspaceKeyboardShortcutIntent({
        hasAltModifier: false,
        hasCommandModifier: true,
        hasShiftModifier: false,
        isSelectionMode: false,
        isTypingElement: false,
        key: '+',
        viewMode: 'gallery',
      }),
    ).toBe('increase-gallery-tile-size');
    expect(
      resolveWorkspaceKeyboardShortcutIntent({
        hasAltModifier: false,
        hasCommandModifier: true,
        hasShiftModifier: false,
        isSelectionMode: false,
        isTypingElement: false,
        key: '-',
        viewMode: 'gallery',
      }),
    ).toBe('decrease-gallery-tile-size');
    expect(
      resolveWorkspaceKeyboardShortcutIntent({
        hasAltModifier: false,
        hasCommandModifier: true,
        hasShiftModifier: false,
        isSelectionMode: false,
        isTypingElement: false,
        key: '0',
        viewMode: 'gallery',
      }),
    ).toBe('reset-gallery-tile-size');
    expect(
      resolveWorkspaceKeyboardShortcutIntent({
        hasAltModifier: false,
        hasCommandModifier: false,
        hasShiftModifier: false,
        isSelectionMode: false,
        isTypingElement: false,
        key: '?',
        viewMode: 'gallery',
      }),
    ).toBe('toggle-shortcut-help');
    expect(
      resolveWorkspaceKeyboardShortcutIntent({
        hasAltModifier: false,
        hasCommandModifier: true,
        hasShiftModifier: false,
        isSelectionMode: false,
        isTypingElement: false,
        key: '+',
        viewMode: 'list',
      }),
    ).toBe('ignore');
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

});
