import { createDesktopWorkbenchCenterPaneCoordinationInput } from './desktop-workbench-center-pane-handoffs';
import { createDesktopWorkbenchCenterPaneCoordinationProps } from './desktop-workbench-center-pane-coordination';
import { createDesktopWorkbenchOverlayCoordinationInput } from './desktop-workbench-overlay-handoffs';
import { createDesktopWorkbenchOverlayCoordinationProps } from './desktop-workbench-overlay-coordination';
import { createDesktopWorkbenchTopbarCoordinationInput } from './desktop-workbench-topbar-handoffs';
import { createDesktopWorkbenchTopbarCoordinationProps } from './desktop-workbench-topbar-coordination';
import type { useAssetCommandFlowWorkbench } from './use-asset-command-flow-workbench';
import type { useDesktopWorkbenchPreviewSurface } from './use-desktop-workbench-preview-surface';
import type { useDesktopWorkbenchShellCoordination } from './use-desktop-workbench-shell-coordination';
import type { useDesktopWorkbenchShellResources } from './use-desktop-workbench-shell-resources';
import type { useDesktopWorkbenchWorkspaceSettingsSurface } from './use-desktop-workbench-workspace-settings-surface';
import type { useGalleryBrowsingWorkbench } from './use-gallery-browsing-workbench';
import type { useGallerySessionWorkbench } from './use-gallery-session-workbench';
import type { useWorkspaceCommandsWorkbench } from './use-workspace-commands-workbench';
import type { useWorkspaceRuntimeStateWorkbench } from './use-workspace-runtime-state-workbench';
import type { useWorkspaceStateWorkbench } from './use-workspace-state-workbench';

type ShellUi = ReturnType<typeof useDesktopWorkbenchShellCoordination>['shellUi'];

interface UseDesktopWorkbenchMainSurfacesOptions {
  assetCommandFlow: ReturnType<typeof useAssetCommandFlowWorkbench>;
  galleryBrowsing: ReturnType<typeof useGalleryBrowsingWorkbench>;
  gallerySession: ReturnType<typeof useGallerySessionWorkbench>;
  logoSrc: string;
  previewSurface: ReturnType<typeof useDesktopWorkbenchPreviewSurface>;
  runtimeState: ReturnType<typeof useWorkspaceRuntimeStateWorkbench>;
  shellResources: ReturnType<typeof useDesktopWorkbenchShellResources>;
  shellUi: ShellUi;
  workspaceCommands: ReturnType<typeof useWorkspaceCommandsWorkbench>;
  workspaceSettingsOverlayProps: ReturnType<
    typeof useDesktopWorkbenchWorkspaceSettingsSurface
  >['workspaceSettingsOverlayProps'];
  workspaceState: ReturnType<typeof useWorkspaceStateWorkbench>;
}

export const useDesktopWorkbenchMainSurfaces = ({
  assetCommandFlow,
  galleryBrowsing,
  gallerySession,
  logoSrc,
  previewSurface,
  runtimeState,
  shellResources,
  shellUi,
  workspaceCommands,
  workspaceSettingsOverlayProps,
  workspaceState,
}: UseDesktopWorkbenchMainSurfacesOptions) => {
  const appOverlaysProps = createDesktopWorkbenchOverlayCoordinationProps(
    createDesktopWorkbenchOverlayCoordinationInput({
      activePendingDeleteJob: assetCommandFlow.activePendingDeleteJob,
      activeUploadJobCount: assetCommandFlow.activeUploadJobCount,
      allowStoredSecret: workspaceState.allowStoredSecret,
      assetActionDialog: assetCommandFlow.assetActionDialog,
      bulkDeleteDialogKeys: assetCommandFlow.bulkDeleteDialogKeys,
      bulkMoveDialog: assetCommandFlow.bulkMoveDialog,
      canSaveProfile: workspaceState.canSaveProfile,
      cancelDiscardConfirmation: workspaceCommands.cancelDiscardConfirmation,
      confirmDiscardChanges: workspaceCommands.confirmDiscardChanges,
      dropOverlayPrefixLabel: shellUi.dropOverlayPrefixLabel,
      executePendingDelete: assetCommandFlow.executePendingDelete,
      handleCancelUpload: assetCommandFlow.handleCancelUpload,
      handleChangeAssetActionInputValue: assetCommandFlow.handleChangeAssetActionInputValue,
      handleChangeBulkMoveDestinationPrefix: assetCommandFlow.handleChangeBulkMoveDestinationPrefix,
      handleClearFinishedUploads: assetCommandFlow.handleClearFinishedUploads,
      handleCloseAssetActionDialog: assetCommandFlow.handleCloseAssetActionDialog,
      handleCloseBulkDeleteDialog: assetCommandFlow.handleCloseBulkDeleteDialog,
      handleCloseBulkMoveDialog: assetCommandFlow.handleCloseBulkMoveDialog,
      handleCloseConnectionSetup: workspaceCommands.handleCloseConnectionSetup,
      handleCloseShortcutHelp: workspaceCommands.handleCloseShortcutHelp,
      handleCloseUploadConflictDialog: assetCommandFlow.handleCloseUploadConflictDialog,
      handleDeleteProfile: workspaceCommands.handleDeleteProfile,
      handleOpenAssetDelete: assetCommandFlow.handleOpenAssetDelete,
      handleOpenAssetMove: assetCommandFlow.handleOpenAssetMove,
      handleOpenAssetRename: assetCommandFlow.handleOpenAssetRename,
      handleR2AccountIdChange: workspaceCommands.handleR2AccountIdChange,
      handleResolveUploadConflict: assetCommandFlow.handleResolveUploadConflict,
      handleRetryUpload: assetCommandFlow.handleRetryUpload,
      handleSaveProfile: workspaceCommands.handleSaveProfile,
      handleStartNewProfile: workspaceCommands.handleStartNewProfile,
      handleSubmitAssetAction: assetCommandFlow.handleSubmitAssetAction,
      handleSubmitBulkDelete: assetCommandFlow.handleSubmitBulkDelete,
      handleSubmitBulkMove: assetCommandFlow.handleSubmitBulkMove,
      isAssetActionBusy: assetCommandFlow.isAssetActionBusy,
      isConnectionSetupOpen: workspaceState.isConnectionSetupOpen,
      isCreatingProfile: workspaceState.isCreatingProfile,
      isProfileDiscardConfirming:
        workspaceCommands.pendingDiscardConfirmation?.kind === 'profile',
      isDropActive: assetCommandFlow.isDropActive,
      isProfileBusy: workspaceState.isProfileBusy,
      isShortcutHelpOpen: workspaceState.isShortcutHelpOpen,
      isUploadBusy: assetCommandFlow.isUploadBusy,
      isUploadToastExpanded: assetCommandFlow.isUploadToastExpanded,
      pendingDeleteQueuedMoreCount: assetCommandFlow.pendingDeleteQueuedMoreCount,
      pendingDeleteRemainingSeconds: assetCommandFlow.pendingDeleteRemainingSeconds,
      profileFieldErrors: workspaceState.profileFieldErrors,
      profileForm: workspaceState.profileForm,
      profileFormRefs: shellResources.domRefs.profileFormRefs,
      profileFormValidationErrors: workspaceState.profileFormValidationErrors,
      quickPreviewOverlayInput: previewSurface.quickPreviewOverlayInput,
      r2AccountId: workspaceState.r2AccountId,
      selectedProfileId: workspaceState.selectedProfileId,
      setProfileForm: workspaceState.setProfileForm,
      showPendingDeleteToast: assetCommandFlow.showPendingDeleteToast,
      showUploadToast: assetCommandFlow.showUploadToast,
      totalUploadJobs: assetCommandFlow.totalUploadJobs,
      undoPendingDelete: assetCommandFlow.undoPendingDelete,
      uploadConflictDialog: assetCommandFlow.uploadConflictDialog,
      uploadSummaryCanRetry: assetCommandFlow.uploadSummaryCanRetry,
      uploadSummaryCompactTitle: assetCommandFlow.uploadSummaryCompactTitle,
      uploadSummaryJob: assetCommandFlow.uploadSummaryJob,
      uploadSummaryLastError: assetCommandFlow.uploadSummaryLastError,
      uploadSummaryProgress: assetCommandFlow.uploadSummaryProgress,
      uploadSummarySubtitle: assetCommandFlow.uploadSummarySubtitle,
      uploadSummaryTitle: assetCommandFlow.uploadSummaryTitle,
      uploadToastRef: shellResources.domRefs.uploadToastRef,
      workspaceSettingsOverlayProps,
    }),
  );

  const appTopbarProps = createDesktopWorkbenchTopbarCoordinationProps(
    createDesktopWorkbenchTopbarCoordinationInput({
      activeSearchQuery: galleryBrowsing.activeSearchQuery,
      closeProfileMenu: workspaceState.closeProfileMenu,
      fileInputRef: assetCommandFlow.fileInputRef,
      handleFilePickerChange: assetCommandFlow.handleFilePickerChange,
      handleOpenFilePicker: assetCommandFlow.handleOpenFilePicker,
      handleProfileMenuSelect: workspaceCommands.handleProfileMenuSelect,
      handleSearchClear: galleryBrowsing.handleSearchClear,
      handleSearchSubmit: galleryBrowsing.handleSearchSubmit,
      handleToggleShortcutHelp: workspaceCommands.handleToggleShortcutHelp,
      handleToggleWorkspaceSettings: workspaceCommands.handleToggleWorkspaceSettings,
      inlineFeedback: shellResources.feedback.inlineFeedback,
      isDropActive: assetCommandFlow.isDropActive,
      isProfileMenuOpen: workspaceState.isProfileMenuOpen,
      isSearchBusy: galleryBrowsing.isSearchBusy,
      isShortcutHelpOpen: workspaceState.isShortcutHelpOpen,
      isUploadBusy: assetCommandFlow.isUploadBusy,
      isWorkspaceSettingsOpen: workspaceState.isWorkspaceSettingsOpen,
      logoSrc,
      manageProfileOptionValue: workspaceState.manageProfileOptionValue,
      moveProfileMenuActiveIndex: workspaceState.moveProfileMenuActiveIndex,
      newProfileOptionValue: workspaceState.newProfileOptionValue,
      openProfileMenu: workspaceState.openProfileMenu,
      profileMenuActiveIndex: workspaceState.profileMenuActiveIndex,
      profileMenuButtonRef: shellResources.domRefs.profileMenuButtonRef,
      profileMenuListRef: shellResources.domRefs.profileMenuListRef,
      profileMenuOptions: workspaceState.profileMenuOptions,
      searchInput: galleryBrowsing.searchInput,
      searchInputRef: shellResources.domRefs.searchInputRef,
      selectedProfileId: workspaceState.selectedProfileId,
      selectedProfileLabel: workspaceState.selectedProfileLabel,
      setProfileMenuActiveIndex: workspaceState.setProfileMenuActiveIndex,
      setSearchInput: galleryBrowsing.setSearchInput,
      showGuidedStart: runtimeState.showGuidedStart,
    }),
  );

  const workspaceCenterPaneProps = createDesktopWorkbenchCenterPaneCoordinationProps(
    createDesktopWorkbenchCenterPaneCoordinationInput({
      activeKindLabel: galleryBrowsing.activeKindLabel,
      activeSearchQuery: galleryBrowsing.activeSearchQuery,
      activeSmartCollectionLabel: galleryBrowsing.activeSmartCollectionLabel,
      activeUnifiedFilterId: galleryBrowsing.activeUnifiedFilterId,
      applyGalleryTileMinWidth: galleryBrowsing.applyGalleryTileMinWidth,
      canClearSearch: shellUi.canClearSearch,
      canResetFilters: shellUi.canResetFilters,
      commitGalleryTileMinWidth: galleryBrowsing.commitGalleryTileMinWidth,
      emptyStateMode: shellUi.emptyStateMode,
      flushGalleryTileMinWidthCommit: galleryBrowsing.flushGalleryTileMinWidthCommit,
      galleryColumnCount: galleryBrowsing.galleryColumnCount,
      galleryDaySections: galleryBrowsing.galleryDaySections,
      galleryRovingAssetKey: shellUi.galleryRovingAssetKey,
      galleryScrollRef: shellResources.domRefs.galleryScrollRef,
      gallerySizeSliderRef: shellResources.domRefs.gallerySizeSliderRef,
      galleryThumbnailErrors: galleryBrowsing.galleryThumbnailErrors,
      galleryThumbnailLoading: galleryBrowsing.galleryThumbnailLoading,
      galleryThumbnails: galleryBrowsing.galleryThumbnails,
      galleryTileMinWidth: galleryBrowsing.galleryTileMinWidth,
      galleryVirtualRange: galleryBrowsing.galleryVirtualRange,
      handleAssetItemClick: gallerySession.handleAssetItemClick,
      handleAssetItemDoubleClick: gallerySession.handleAssetItemDoubleClick,
      handleLoadFirstPage: galleryBrowsing.handleLoadFirstPage,
      handleOpenBulkDeleteDialog: assetCommandFlow.handleOpenBulkDeleteDialog,
      handleOpenBulkMoveDialog: assetCommandFlow.handleOpenBulkMoveDialog,
      handleOpenFilePicker: assetCommandFlow.handleOpenFilePicker,
      handleResetViewFilters: galleryBrowsing.handleResetViewFilters,
      handleSearchClear: galleryBrowsing.handleSearchClear,
      handleSelectAllVisible: gallerySession.handleSelectAllVisible,
      handleSelectProfile: workspaceCommands.handleSelectProfile,
      handleSelectUnifiedFilter: galleryBrowsing.handleSelectUnifiedFilter,
      handleStartNewProfile: workspaceCommands.handleStartNewProfile,
      handleThumbnailDecodeError: galleryBrowsing.handleThumbnailDecodeError,
      isAssetActionBusy: assetCommandFlow.isAssetActionBusy,
      isGalleryScrolling: galleryBrowsing.isGalleryScrolling,
      isListLoading: runtimeState.isListLoading,
      isQuickPreviewOpen: previewSurface.isQuickPreviewOpen,
      isSelectionMode: galleryBrowsing.isSelectionMode,
      isUploadBusy: assetCommandFlow.isUploadBusy,
      listContainerRef: shellResources.domRefs.listContainerRef,
      listRovingAssetKey: shellUi.listRovingAssetKey,
      listVirtualItems: galleryBrowsing.listVirtualItems,
      listVirtualRange: {
        listBottomSpacerHeight: galleryBrowsing.listVirtualRange.bottomSpacerHeight,
        listTopSpacerHeight: galleryBrowsing.listVirtualRange.topSpacerHeight,
      },
      profiles: workspaceState.profiles,
      queueGalleryScrollStateUpdate: galleryBrowsing.queueGalleryScrollStateUpdate,
      queueListScrollStateUpdate: galleryBrowsing.queueListScrollStateUpdate,
      scheduleGalleryTileMinWidthCommit: galleryBrowsing.scheduleGalleryTileMinWidthCommit,
      selectedAssetCount: galleryBrowsing.selectedAssetCount,
      selectedAssetKey: galleryBrowsing.selectedAssetKey,
      selectedAssetKeySet: galleryBrowsing.selectedAssetKeySet,
      selectedProfileId: workspaceState.selectedProfileId,
      setAssetItemRef: galleryBrowsing.setAssetItemRef,
      setSelectedAssetKey: galleryBrowsing.setSelectedAssetKey,
      setSelectedAssetKeys: galleryBrowsing.setSelectedAssetKeys,
      setViewMode: galleryBrowsing.setViewMode,
      showGuidedStart: runtimeState.showGuidedStart,
      toggleSelectionMode: gallerySession.toggleSelectionMode,
      unifiedFilterOptions: galleryBrowsing.unifiedFilterOptions,
      viewMode: galleryBrowsing.viewMode,
      visibleGallerySections: galleryBrowsing.visibleGallerySections,
      visibleItems: galleryBrowsing.visibleItems,
    }),
  );

  return {
    appOverlaysProps,
    appTopbarProps,
    workspaceCenterPaneProps,
  };
};
