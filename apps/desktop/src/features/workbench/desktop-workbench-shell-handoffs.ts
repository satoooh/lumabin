import type { useDesktopWorkbenchShellCoordination } from './use-desktop-workbench-shell-coordination';

type ShellCoordinationInput = Parameters<typeof useDesktopWorkbenchShellCoordination>[0];
type DialogEscapeCommands = ShellCoordinationInput['dialogEscapeCommands'];
type KeyboardGalleryDensity = ShellCoordinationInput['keyboardGalleryDensity'];
type KeyboardGalleryNavigation = ShellCoordinationInput['keyboardGalleryNavigation'];
type KeyboardQuickPreview = ShellCoordinationInput['keyboardQuickPreview'];
type KeyboardSearch = ShellCoordinationInput['keyboardSearch'];
type KeyboardSelection = ShellCoordinationInput['keyboardSelection'];
type ShellChrome = ShellCoordinationInput['shellChrome'];
type UiDerivationDiagnostics = ShellCoordinationInput['uiDerivationDiagnostics'];
type UiDerivationGalleryState = ShellCoordinationInput['uiDerivationGalleryState'];
type UiDerivationSearchState = ShellCoordinationInput['uiDerivationSearchState'];
type UiDerivationStatus = ShellCoordinationInput['uiDerivationStatus'];
type WorkspaceModalGuards = ShellCoordinationInput['workspaceModalGuards'];

interface DesktopWorkbenchShellHandoffInput {
  activeKindFilter: UiDerivationSearchState['activeKindFilter'];
  activeSearchQuery: UiDerivationSearchState['activeSearchQuery'];
  activeSmartCollection: UiDerivationSearchState['activeSmartCollection'];
  assetActionDialog: unknown;
  assetItemRefs: KeyboardGalleryNavigation['assetItemRefs'];
  assetsPrefix: UiDerivationSearchState['assetsPrefix'];
  bulkDeleteDialogKeys: unknown;
  bulkMoveDialog: unknown;
  closeQuickPreview: KeyboardQuickPreview['onCloseQuickPreview'];
  devMetrics: UiDerivationDiagnostics['devMetrics'];
  dismissStatusLine: ShellChrome['dismissStatusLine'];
  focusAssetItemByKey: KeyboardSelection['onFocusAssetItemByKey'];
  galleryColumnCount: KeyboardGalleryNavigation['galleryColumnCount'];
  galleryDaySections: KeyboardGalleryNavigation['galleryDaySections'];
  galleryGridLocationByKey: KeyboardGalleryNavigation['galleryGridLocationByKey'];
  galleryScrollRef: KeyboardGalleryNavigation['galleryScrollRef'];
  galleryTileHeight: KeyboardGalleryNavigation['galleryTileHeight'];
  galleryViewportHeight: KeyboardGalleryNavigation['galleryViewportHeight'];
  galleryVirtualSections: KeyboardGalleryNavigation['galleryVirtualSections'];
  handleCloseAssetActionDialog: DialogEscapeCommands['onCloseAssetActionDialog'];
  handleCloseBulkDeleteDialog: DialogEscapeCommands['onCloseBulkDeleteDialog'];
  handleCloseBulkMoveDialog: DialogEscapeCommands['onCloseBulkMoveDialog'];
  handleCloseConnectionSetup: DialogEscapeCommands['onCloseConnectionSetup'];
  handleCloseShortcutHelp: DialogEscapeCommands['onCloseShortcutHelp'];
  handleCloseUploadConflictDialog: DialogEscapeCommands['onCloseUploadConflictDialog'];
  handleCloseWorkspaceSettings: DialogEscapeCommands['onCloseWorkspaceSettings'];
  handleOpenAssetDelete: KeyboardSelection['onOpenAssetDelete'];
  handleOpenBulkDeleteDialog: KeyboardSelection['onOpenBulkDeleteDialog'];
  handleSelectAllVisible: KeyboardSelection['onSelectAllVisible'];
  handleToggleShortcutHelp: ShellCoordinationInput['onToggleShortcutHelp'];
  isConnectionSetupOpen: ShellCoordinationInput['dialogState']['isConnectionSetupOpen'];
  isDropActive: ShellChrome['isDropActive'];
  isQuickPreviewOpen: ShellCoordinationInput['dialogState']['isQuickPreviewOpen'];
  isSelectionMode: KeyboardSelection['isSelectionMode'];
  isShortcutHelpOpen: ShellCoordinationInput['dialogState']['isShortcutHelpOpen'];
  isTooltipWarm: ShellChrome['isTooltipWarm'];
  isWorkspaceSettingsOpen: ShellCoordinationInput['dialogState']['isWorkspaceSettingsOpen'];
  listVirtualItems: UiDerivationGalleryState['listVirtualItems'];
  moveQuickPreviewSelection: KeyboardQuickPreview['onMoveQuickPreviewSelection'];
  openQuickPreviewForItem: KeyboardQuickPreview['onOpenQuickPreviewForItem'];
  resetGalleryTileMinWidth: KeyboardGalleryDensity['onResetGalleryTileMinWidth'];
  searchInput: UiDerivationSearchState['searchInput'];
  searchInputRef: KeyboardSearch['searchInputRef'];
  selectedAsset: KeyboardQuickPreview['selectedAsset'];
  selectedAssetCount: KeyboardSelection['selectedAssetCount'];
  selectedAssetKey: KeyboardQuickPreview['selectedAssetKey'];
  selectedProfileId: WorkspaceModalGuards['selectedProfileId'];
  setGalleryTileMinWidth: KeyboardGalleryDensity['onAdjustGalleryTileMinWidth'];
  setIsWorkspaceSettingsOpen: WorkspaceModalGuards['setIsWorkspaceSettingsOpen'];
  setSelectedAssetKey: KeyboardSelection['onSelectAssetKey'];
  setUploadConflictDialog: WorkspaceModalGuards['setUploadConflictDialog'];
  showGuidedStart: ShellChrome['showGuidedStart'];
  status: UiDerivationStatus['status'];
  statusTone: ShellChrome['statusTone'];
  toggleAssetSelection: KeyboardQuickPreview['onToggleAssetSelection'];
  uploadConflictDialog: WorkspaceModalGuards['uploadConflictDialog'];
  viewMode: KeyboardGalleryDensity['viewMode'];
  visibleItems: KeyboardQuickPreview['visibleItems'];
}

export const createDesktopWorkbenchShellCoordinationInput = ({
  activeKindFilter,
  activeSearchQuery,
  activeSmartCollection,
  assetActionDialog,
  assetItemRefs,
  assetsPrefix,
  bulkDeleteDialogKeys,
  bulkMoveDialog,
  closeQuickPreview,
  devMetrics,
  dismissStatusLine,
  focusAssetItemByKey,
  galleryColumnCount,
  galleryDaySections,
  galleryGridLocationByKey,
  galleryScrollRef,
  galleryTileHeight,
  galleryViewportHeight,
  galleryVirtualSections,
  handleCloseAssetActionDialog,
  handleCloseBulkDeleteDialog,
  handleCloseBulkMoveDialog,
  handleCloseConnectionSetup,
  handleCloseShortcutHelp,
  handleCloseUploadConflictDialog,
  handleCloseWorkspaceSettings,
  handleOpenAssetDelete,
  handleOpenBulkDeleteDialog,
  handleSelectAllVisible,
  handleToggleShortcutHelp,
  isConnectionSetupOpen,
  isDropActive,
  isQuickPreviewOpen,
  isSelectionMode,
  isShortcutHelpOpen,
  isTooltipWarm,
  isWorkspaceSettingsOpen,
  listVirtualItems,
  moveQuickPreviewSelection,
  openQuickPreviewForItem,
  resetGalleryTileMinWidth,
  searchInput,
  searchInputRef,
  selectedAsset,
  selectedAssetCount,
  selectedAssetKey,
  selectedProfileId,
  setGalleryTileMinWidth,
  setIsWorkspaceSettingsOpen,
  setSelectedAssetKey,
  setUploadConflictDialog,
  showGuidedStart,
  status,
  statusTone,
  toggleAssetSelection,
  uploadConflictDialog,
  viewMode,
  visibleItems,
}: DesktopWorkbenchShellHandoffInput): ShellCoordinationInput => ({
  dialogState: {
    hasAssetActionDialog: Boolean(assetActionDialog),
    hasBulkDeleteDialog: Boolean(bulkDeleteDialogKeys),
    hasBulkMoveDialog: Boolean(bulkMoveDialog),
    hasUploadConflictDialog: Boolean(uploadConflictDialog),
    isConnectionSetupOpen,
    isQuickPreviewOpen,
    isShortcutHelpOpen,
    isWorkspaceSettingsOpen,
  },
  workspaceModalGuards: {
    isWorkspaceSettingsOpen,
    selectedProfileId,
    setIsWorkspaceSettingsOpen,
    setUploadConflictDialog,
    uploadConflictDialog,
  },
  keyboardSearch: {
    searchInputRef,
  },
  keyboardSelection: {
    isSelectionMode,
    onSelectAllVisible: handleSelectAllVisible,
    selectedAssetCount,
    onOpenBulkDeleteDialog: handleOpenBulkDeleteDialog,
    onOpenAssetDelete: handleOpenAssetDelete,
    onSelectAssetKey: setSelectedAssetKey,
    onFocusAssetItemByKey: focusAssetItemByKey,
  },
  keyboardGalleryDensity: {
    viewMode,
    onAdjustGalleryTileMinWidth: setGalleryTileMinWidth,
    onResetGalleryTileMinWidth: resetGalleryTileMinWidth,
  },
  onToggleShortcutHelp: handleToggleShortcutHelp,
  shellChrome: {
    dismissStatusLine,
    isDropActive,
    isTooltipWarm,
    showGuidedStart,
    status,
    statusTone,
  },
  keyboardQuickPreview: {
    isQuickPreviewOpen,
    onMoveQuickPreviewSelection: moveQuickPreviewSelection,
    onCloseQuickPreview: closeQuickPreview,
    selectedAssetKey,
    onToggleAssetSelection: toggleAssetSelection,
    selectedAsset,
    visibleItems,
    onOpenQuickPreviewForItem: openQuickPreviewForItem,
  },
  keyboardGalleryNavigation: {
    assetItemRefs,
    galleryGridLocationByKey,
    galleryVirtualSections,
    galleryDaySections,
    galleryScrollRef,
    galleryTileHeight,
    galleryColumnCount,
    galleryViewportHeight,
  },
  dialogEscapeCommands: {
    onCloseAssetActionDialog: handleCloseAssetActionDialog,
    onCloseBulkDeleteDialog: handleCloseBulkDeleteDialog,
    onCloseBulkMoveDialog: handleCloseBulkMoveDialog,
    onCloseUploadConflictDialog: handleCloseUploadConflictDialog,
    onCloseShortcutHelp: handleCloseShortcutHelp,
    onCloseConnectionSetup: handleCloseConnectionSetup,
    onCloseWorkspaceSettings: handleCloseWorkspaceSettings,
  },
  uiDerivationStatus: {
    status,
  },
  uiDerivationSearchState: {
    activeSearchQuery,
    assetsPrefix,
    searchInput,
    activeKindFilter,
    activeSmartCollection,
  },
  uiDerivationGalleryState: {
    selectedAssetKey,
    visibleItems,
    listVirtualItems,
  },
  uiDerivationDiagnostics: {
    devMetrics,
  },
});
