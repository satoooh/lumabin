import { useEffect, type RefObject } from 'react';
import type { AssetItem } from '../../shared/ipc';
import {
  resolveGalleryKeyboardScrollTop,
  resolveGalleryNavigationIndex,
  type GalleryDaySectionLite,
  type GalleryGridLocation,
  type GalleryVirtualSectionLite,
} from '../gallery/gallery-keyboard-navigation-policy';
import {
  isEditableKeyboardTarget,
  isGalleryNavigationKey,
  isWorkspaceKeyboardBlockedByModal,
  resolveLinearNavigationIndex,
  resolveQuickPreviewKeyboardAction,
  resolveWorkspaceKeyboardShortcutIntent,
} from './global-keyboard-shortcuts-policy';

interface UseGlobalKeyboardShortcutsOptions {
  searchInputRef: RefObject<HTMLInputElement | null>;
  isSelectionMode: boolean;
  onSelectAllVisible: () => void;
  viewMode: 'gallery' | 'list';
  galleryTileKeyboardStep: number;
  onAdjustGalleryTileMinWidth: (delta: number) => void;
  onResetGalleryTileMinWidth: () => void;
  onToggleShortcutHelp: () => void;
  isConnectionSetupOpen: boolean;
  isWorkspaceSettingsOpen: boolean;
  isShortcutHelpOpen: boolean;
  hasAssetActionDialog: boolean;
  hasBulkMoveDialog: boolean;
  hasBulkDeleteDialog: boolean;
  hasUploadConflictDialog: boolean;
  isQuickPreviewOpen: boolean;
  onMoveQuickPreviewSelection: (direction: -1 | 1) => void;
  onCloseQuickPreview: () => void;
  selectedAssetKey: string;
  onToggleAssetSelection: (key: string) => void;
  selectedAsset: AssetItem | null;
  visibleItems: AssetItem[];
  onOpenQuickPreviewForItem: (item: AssetItem) => boolean;
  selectedAssetCount: number;
  onOpenBulkDeleteDialog: () => void;
  onOpenAssetDelete: () => void;
  onSelectAssetKey: (key: string) => void;
  onFocusAssetItemByKey: (key: string) => void;
  assetItemRefs: RefObject<Map<string, HTMLButtonElement>>;
  galleryGridLocationByKey: Map<string, GalleryGridLocation>;
  galleryVirtualSections: GalleryVirtualSectionLite[];
  galleryDaySections: GalleryDaySectionLite[];
  galleryScrollRef: RefObject<HTMLDivElement | null>;
  galleryTileHeight: number;
  galleryColumnCount: number;
  galleryViewportHeight: number;
  galleryGridGapPx: number;
  galleryDayHeaderHeightPx: number;
}

export const useGlobalKeyboardShortcuts = ({
  searchInputRef,
  isSelectionMode,
  onSelectAllVisible,
  viewMode,
  galleryTileKeyboardStep,
  onAdjustGalleryTileMinWidth,
  onResetGalleryTileMinWidth,
  onToggleShortcutHelp,
  isConnectionSetupOpen,
  isWorkspaceSettingsOpen,
  isShortcutHelpOpen,
  hasAssetActionDialog,
  hasBulkMoveDialog,
  hasBulkDeleteDialog,
  hasUploadConflictDialog,
  isQuickPreviewOpen,
  onMoveQuickPreviewSelection,
  onCloseQuickPreview,
  selectedAssetKey,
  onToggleAssetSelection,
  selectedAsset,
  visibleItems,
  onOpenQuickPreviewForItem,
  selectedAssetCount,
  onOpenBulkDeleteDialog,
  onOpenAssetDelete,
  onSelectAssetKey,
  onFocusAssetItemByKey,
  assetItemRefs,
  galleryGridLocationByKey,
  galleryVirtualSections,
  galleryDaySections,
  galleryScrollRef,
  galleryTileHeight,
  galleryColumnCount,
  galleryViewportHeight,
  galleryGridGapPx,
  galleryDayHeaderHeightPx,
}: UseGlobalKeyboardShortcutsOptions): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target;
      const hasCommandModifier = event.metaKey || event.ctrlKey;
      const isTypingElement = isEditableKeyboardTarget(target);
      const hasBlockingDialogOpen = isWorkspaceKeyboardBlockedByModal({
        hasAssetActionDialog,
        hasBulkDeleteDialog,
        hasBulkMoveDialog,
        hasUploadConflictDialog,
        isConnectionSetupOpen,
        isShortcutHelpOpen,
        isWorkspaceSettingsOpen,
      });
      const isSpaceKey = event.key === ' ' || event.key === 'Spacebar';

      const shortcutIntent = resolveWorkspaceKeyboardShortcutIntent({
        hasAltModifier: event.altKey,
        hasCommandModifier,
        hasShiftModifier: event.shiftKey,
        isSelectionMode,
        isTypingElement,
        key: event.key,
        viewMode,
      });
      switch (shortcutIntent) {
        case 'focus-search':
          event.preventDefault();
          searchInputRef.current?.focus();
          return;
        case 'select-all-visible':
          event.preventDefault();
          onSelectAllVisible();
          return;
        case 'increase-gallery-tile-size':
          event.preventDefault();
          onAdjustGalleryTileMinWidth(galleryTileKeyboardStep);
          return;
        case 'decrease-gallery-tile-size':
          event.preventDefault();
          onAdjustGalleryTileMinWidth(-galleryTileKeyboardStep);
          return;
        case 'reset-gallery-tile-size':
          event.preventDefault();
          onResetGalleryTileMinWidth();
          return;
        case 'toggle-shortcut-help':
          event.preventDefault();
          onToggleShortcutHelp();
          return;
        case 'ignore':
          break;
      }

      if (isTypingElement) {
        return;
      }

      if (isQuickPreviewOpen) {
        const quickPreviewAction = resolveQuickPreviewKeyboardAction(event.key);
        if (quickPreviewAction === 'move-next') {
          event.preventDefault();
          onMoveQuickPreviewSelection(1);
          return;
        }

        if (quickPreviewAction === 'move-previous') {
          event.preventDefault();
          onMoveQuickPreviewSelection(-1);
          return;
        }

        if (quickPreviewAction === 'close') {
          event.preventDefault();
          onCloseQuickPreview();
          return;
        }

        return;
      }

      if (hasBlockingDialogOpen) {
        return;
      }

      if (event.key === 'Enter' || isSpaceKey) {
        if (isSelectionMode && selectedAssetKey) {
          event.preventDefault();
          onToggleAssetSelection(selectedAssetKey);
          return;
        }

        const focusedOrFirstItem = selectedAsset ?? visibleItems[0];
        if (!focusedOrFirstItem) {
          return;
        }
        if (onOpenQuickPreviewForItem(focusedOrFirstItem)) {
          event.preventDefault();
        }
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (isSelectionMode && selectedAssetCount > 0) {
          event.preventDefault();
          onOpenBulkDeleteDialog();
          return;
        }

        if (selectedAsset) {
          event.preventDefault();
          onOpenAssetDelete();
          return;
        }
      }

      if (visibleItems.length === 0) {
        return;
      }

      const selectedIndex = visibleItems.findIndex((item) => item.key === selectedAssetKey);
      const moveSelection = (nextIndex: number) => {
        const targetItem = visibleItems[nextIndex];
        if (!targetItem) {
          return;
        }
        onSelectAssetKey(targetItem.key);
        window.requestAnimationFrame(() => {
          onFocusAssetItemByKey(targetItem.key);

          if (viewMode !== 'gallery') {
            return;
          }

          if (assetItemRefs.current.has(targetItem.key)) {
            return;
          }

          const location = galleryGridLocationByKey.get(targetItem.key);
          const section = location
            ? galleryVirtualSections[location.sectionIndex]
            : undefined;
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

          window.setTimeout(() => {
            onFocusAssetItemByKey(targetItem.key);
          }, 120);
        });
      };

      if (
        viewMode === 'gallery' &&
        isGalleryNavigationKey(event.key)
      ) {
        event.preventDefault();

        const currentItem = visibleItems[selectedIndex];
        const location = currentItem
          ? galleryGridLocationByKey.get(currentItem.key)
          : undefined;
        const nextIndex = resolveGalleryNavigationIndex({
          currentLocation: location,
          galleryColumnCount,
          galleryGridGapPx,
          galleryTileHeight,
          galleryViewportHeight,
          key: event.key,
          nextSection: location ? galleryDaySections[location.sectionIndex + 1] : undefined,
          previousSection: location ? galleryDaySections[location.sectionIndex - 1] : undefined,
          selectedIndex,
          section: location ? galleryDaySections[location.sectionIndex] : undefined,
          visibleItemsLength: visibleItems.length,
        });
        moveSelection(nextIndex);
        return;
      }

      const nextLinearIndex = resolveLinearNavigationIndex({
        key: event.key,
        selectedIndex,
        visibleItemsLength: visibleItems.length,
      });
      if (nextLinearIndex !== undefined) {
        event.preventDefault();
        moveSelection(nextLinearIndex);
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    assetItemRefs,
    galleryColumnCount,
    galleryDayHeaderHeightPx,
    galleryDaySections,
    galleryGridGapPx,
    galleryGridLocationByKey,
    galleryScrollRef,
    galleryTileHeight,
    galleryTileKeyboardStep,
    galleryViewportHeight,
    galleryVirtualSections,
    hasAssetActionDialog,
    hasBulkDeleteDialog,
    hasBulkMoveDialog,
    hasUploadConflictDialog,
    isConnectionSetupOpen,
    isQuickPreviewOpen,
    isSelectionMode,
    isShortcutHelpOpen,
    isWorkspaceSettingsOpen,
    onAdjustGalleryTileMinWidth,
    onCloseQuickPreview,
    onFocusAssetItemByKey,
    onMoveQuickPreviewSelection,
    onOpenAssetDelete,
    onOpenBulkDeleteDialog,
    onOpenQuickPreviewForItem,
    onResetGalleryTileMinWidth,
    onSelectAllVisible,
    onSelectAssetKey,
    onToggleAssetSelection,
    onToggleShortcutHelp,
    searchInputRef,
    selectedAsset,
    selectedAssetCount,
    selectedAssetKey,
    viewMode,
    visibleItems,
  ]);
};
