import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDesktopWorkbenchShellCoordination } from '../../src/features/workbench/use-desktop-workbench-shell-coordination';
import type { AssetItem } from '../../src/shared/ipc';

const asset: AssetItem = {
  key: 'photos/sunrise.jpg',
  size: 1024,
  contentType: 'image/jpeg',
  lastModified: '2026-05-04T00:00:00.000Z',
  etag: 'etag-1',
};

describe('useDesktopWorkbenchShellCoordination', () => {
  it('owns shell dialog state and derived UI handoff assembly', () => {
    const { result } = renderHook(() =>
      useDesktopWorkbenchShellCoordination({
        dialogState: {
          hasAssetActionDialog: false,
          hasBulkDeleteDialog: false,
          hasBulkMoveDialog: false,
          hasUploadConflictDialog: false,
          isConnectionSetupOpen: false,
          isQuickPreviewOpen: true,
          isShortcutHelpOpen: false,
          isWorkspaceSettingsOpen: false,
        },
        workspaceModalGuards: {
          isWorkspaceSettingsOpen: false,
          selectedProfileId: 'profile-1',
          setIsWorkspaceSettingsOpen: vi.fn(),
          setUploadConflictDialog: vi.fn(),
          uploadConflictDialog: null,
        },
        keyboardSearch: {
          searchInputRef: { current: null },
        },
        keyboardSelection: {
          isSelectionMode: false,
          onSelectAllVisible: vi.fn(),
          selectedAssetCount: 1,
          onOpenBulkDeleteDialog: vi.fn(),
          onOpenAssetDelete: vi.fn(),
          onSelectAssetKey: vi.fn(),
          onFocusAssetItemByKey: vi.fn(),
        },
        keyboardGalleryDensity: {
          viewMode: 'gallery',
          onAdjustGalleryTileMinWidth: vi.fn(),
          onResetGalleryTileMinWidth: vi.fn(),
        },
        onToggleShortcutHelp: vi.fn(),
        keyboardQuickPreview: {
          isQuickPreviewOpen: true,
          onMoveQuickPreviewSelection: vi.fn(),
          onCloseQuickPreview: vi.fn(),
          selectedAssetKey: asset.key,
          onToggleAssetSelection: vi.fn(),
          selectedAsset: asset,
          visibleItems: [asset],
          onOpenQuickPreviewForItem: vi.fn(),
        },
        keyboardGalleryNavigation: {
          assetItemRefs: { current: new Map() },
          galleryGridLocationByKey: new Map(),
          galleryVirtualSections: [],
          galleryDaySections: [],
          galleryScrollRef: { current: null },
          galleryTileHeight: 180,
          galleryColumnCount: 1,
          galleryViewportHeight: 400,
        },
        dialogEscapeCommands: {
          onCloseAssetActionDialog: vi.fn(),
          onCloseBulkDeleteDialog: vi.fn(),
          onCloseBulkMoveDialog: vi.fn(),
          onCloseUploadConflictDialog: vi.fn(),
          onCloseShortcutHelp: vi.fn(),
          onCloseConnectionSetup: vi.fn(),
          onCloseWorkspaceSettings: vi.fn(),
        },
        uiDerivationStatus: {
          status: 'Ready',
        },
        uiDerivationSearchState: {
          activeSearchQuery: 'sunrise',
          assetsPrefix: 'photos',
          searchInput: '',
          activeKindFilter: 'all',
          activeSmartCollection: 'all',
          normalizePrefix: (prefix) => (prefix ? `${prefix.replace(/\/+$/, '')}/` : ''),
        },
        uiDerivationGalleryState: {
          selectedAssetKey: asset.key,
          visibleItems: [asset],
          listVirtualItems: [],
        },
        uiDerivationDiagnostics: {
          devMetrics: null,
        },
      }),
    );

    expect(result.current.shellDialogState.isQuickPreviewOpen).toBe(true);
    expect(result.current.shellUi.isAnyDialogOpen).toBe(true);
    expect(result.current.shellUi.showStatusStrip).toBe(true);
    expect(result.current.shellUi.dropOverlayPrefixLabel).toBe('photos/');
    expect(result.current.shellUi.galleryRovingAssetKey).toBe(asset.key);
  });
});
