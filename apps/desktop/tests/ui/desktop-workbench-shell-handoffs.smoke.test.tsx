import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createDesktopWorkbenchShellCoordinationInput } from '../../src/features/workbench/desktop-workbench-shell-handoffs';
import { useDesktopWorkbenchShellCoordination } from '../../src/features/workbench/use-desktop-workbench-shell-coordination';
import type { AssetItem } from '../../src/shared/ipc';

type ShellCoordinationInput = Parameters<typeof useDesktopWorkbenchShellCoordination>[0];

const asset: AssetItem = {
  key: 'photos/sunrise.jpg',
  size: 1024,
  contentType: 'image/jpeg',
  lastModified: '2026-05-04T00:00:00.000Z',
  etag: 'etag-1',
};

describe('desktop workbench shell handoffs', () => {
  it('maps flat root values into the shell coordination contract', () => {
    const handleCloseAssetActionDialog = vi.fn();
    const handleOpenBulkDeleteDialog = vi.fn();
    const moveQuickPreviewSelection = vi.fn();
    const resetGalleryTileMinWidth = vi.fn();
    const status = 'Ready';
    const visibleItems = [asset];
    const listVirtualItems =
      [] as unknown as ShellCoordinationInput['uiDerivationGalleryState']['listVirtualItems'];
    const devMetrics = null;

    const input = createDesktopWorkbenchShellCoordinationInput({
      activeKindFilter: 'all',
      activeSearchQuery: 'sunrise',
      activeSmartCollection: 'all',
      assetActionDialog: { mode: 'rename' },
      assetItemRefs: { current: new Map() },
      assetsPrefix: 'photos',
      bulkDeleteDialogKeys: null,
      bulkMoveDialog: { keys: [asset.key] },
      closeQuickPreview: vi.fn(),
      devMetrics,
      dismissStatusLine: vi.fn(),
      focusAssetItemByKey: vi.fn(),
      galleryColumnCount: 2,
      galleryDaySections: [],
      galleryGridLocationByKey: new Map(),
      galleryScrollRef: createRef<HTMLDivElement>(),
      galleryTileHeight: 180,
      galleryViewportHeight: 480,
      galleryVirtualSections: [],
      handleCloseAssetActionDialog,
      handleCloseBulkDeleteDialog: vi.fn(),
      handleCloseBulkMoveDialog: vi.fn(),
      handleCloseConnectionSetup: vi.fn(),
      handleCloseShortcutHelp: vi.fn(),
      handleCloseUploadConflictDialog: vi.fn(),
      handleCloseWorkspaceSettings: vi.fn(),
      handleOpenAssetDelete: vi.fn(),
      handleOpenBulkDeleteDialog,
      handleSelectAllVisible: vi.fn(),
      handleToggleShortcutHelp: vi.fn(),
      isConnectionSetupOpen: false,
      isDropActive: false,
      isQuickPreviewOpen: true,
      isSelectionMode: false,
      isShortcutHelpOpen: false,
      isTooltipWarm: true,
      isWorkspaceSettingsOpen: false,
      listVirtualItems,
      moveQuickPreviewSelection,
      openQuickPreviewForItem: vi.fn(),
      resetGalleryTileMinWidth,
      searchInput: '',
      searchInputRef: createRef<HTMLInputElement>(),
      selectedAsset: asset,
      selectedAssetCount: 1,
      selectedAssetKey: asset.key,
      selectedProfileId: 'profile-1',
      setGalleryTileMinWidth: vi.fn(),
      setIsWorkspaceSettingsOpen: vi.fn(),
      setSelectedAssetKey: vi.fn(),
      setUploadConflictDialog: vi.fn(),
      showGuidedStart: false,
      status,
      statusTone: 'success',
      toggleAssetSelection: vi.fn(),
      uploadConflictDialog: null,
      viewMode: 'gallery',
      visibleItems,
    });

    expect(input.dialogState).toMatchObject({
      hasAssetActionDialog: true,
      hasBulkDeleteDialog: false,
      hasBulkMoveDialog: true,
      hasUploadConflictDialog: false,
      isQuickPreviewOpen: true,
    });
    expect(input.dialogEscapeCommands.onCloseAssetActionDialog).toBe(
      handleCloseAssetActionDialog,
    );
    expect(input.keyboardSelection.onOpenBulkDeleteDialog).toBe(handleOpenBulkDeleteDialog);
    expect(input.keyboardGalleryDensity.onResetGalleryTileMinWidth).toBe(
      resetGalleryTileMinWidth,
    );
    expect(input.keyboardQuickPreview.onMoveQuickPreviewSelection).toBe(
      moveQuickPreviewSelection,
    );
    expect(input.uiDerivationSearchState).toMatchObject({
      activeSearchQuery: 'sunrise',
      assetsPrefix: 'photos',
    });
    expect(input.uiDerivationGalleryState.visibleItems).toBe(visibleItems);
    expect(input.uiDerivationGalleryState.listVirtualItems).toBe(listVirtualItems);
    expect(input.uiDerivationDiagnostics.devMetrics).toBe(devMetrics);
    expect(input.shellChrome.status).toBe(status);
  });
});
