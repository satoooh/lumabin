import type { DesktopApiGateway } from '../shared/desktop-api-gateway';
import { createDesktopWorkbenchShellCoordinationInput } from './desktop-workbench-shell-handoffs';
import { useAssetCommandFlowWorkbench } from './use-asset-command-flow-workbench';
import { useDesktopWorkbenchMainSurfaces } from './use-desktop-workbench-main-surfaces';
import { useDesktopWorkbenchPreviewSurface } from './use-desktop-workbench-preview-surface';
import { useDesktopWorkbenchWorkspaceSettingsSurface } from './use-desktop-workbench-workspace-settings-surface';
import { useDesktopWorkbenchShellResources } from './use-desktop-workbench-shell-resources';
import { useDesktopWorkbenchShellCoordination } from './use-desktop-workbench-shell-coordination';
import { useDiagnosticsWorkbench } from './use-diagnostics-workbench';
import { useGalleryBrowsingWorkbench } from './use-gallery-browsing-workbench';
import { useGallerySessionWorkbench } from './use-gallery-session-workbench';
import { useWorkspaceCommandsWorkbench } from './use-workspace-commands-workbench';
import { useWorkspaceGalleryLifecycleWorkbench } from './use-workspace-gallery-lifecycle-workbench';
import { useWorkspaceRuntimeStateWorkbench } from './use-workspace-runtime-state-workbench';
import { useWorkspaceStateWorkbench } from './use-workspace-state-workbench';

interface UseDesktopWorkbenchOptions {
  desktopApi: DesktopApiGateway;
  isDevEnv: boolean;
  logoSrc: string;
}

export const useDesktopWorkbench = ({
  desktopApi,
  isDevEnv,
  logoSrc,
}: UseDesktopWorkbenchOptions) => {
  const shellResources = useDesktopWorkbenchShellResources();
  const {
    domRefs: {
      appShellRef,
      galleryScrollRef,
      gallerySizeSliderRef,
      listContainerRef,
      profileFormRefs,
      profileMenuButtonRef,
      profileMenuListRef,
      searchInputRef,
      uploadToastRef,
    },
    feedback: {
      dismissStatusLine,
      pushInlineFeedback,
      setStatusLine,
      status,
      statusTone,
    },
    isTooltipWarm,
  } = shellResources;

  const workspaceState = useWorkspaceStateWorkbench();
  const {
    closeProfileMenu,
    initialProfileForm,
    isConnectionSetupOpen,
    isCreatingProfile,
    isProfileBusy,
    isProfileFormDirty,
    isProfileMenuOpen,
    isSettingsBusy,
    isSettingsDirty,
    isShortcutHelpOpen,
    isWorkspaceSettingsOpen,
    manageProfileOptionValue,
    newProfileOptionValue,
    profileForm,
    profileFormValidationErrors,
    profiles,
    savedSettingsSnapshot,
    selectedProfile,
    selectedProfileId,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
    setIsProfileBusy,
    setIsSettingsBusy,
    setIsShortcutHelpOpen,
    setIsWorkspaceSettingsOpen,
    setProfileForm,
    setProfiles,
    setR2AccountId,
    setSavedSettingsSnapshot,
    setSavedViews,
    setSelectedProfileId,
    setSettings,
    settings,
  } = workspaceState;

  const galleryBrowsing = useGalleryBrowsingWorkbench({
    appShellRef,
    assetDiscoveryApi: desktopApi.assetDiscovery,
    assetLibraryApi: desktopApi.assetLibrary,
    galleryScrollRef,
    gallerySizeSliderRef,
    listContainerRef,
    searchInputRef,
    selectedProfileId,
    setStatusLine,
  });
  const {
    activeKindFilter,
    activeSearchQuery,
    activeSmartCollection,
    adjustGalleryTileMinWidth,
    assetItemRefs,
    assetsPrefix,
    focusAssetItemByKey,
    galleryColumnCount,
    galleryDaySections,
    galleryGridLocationByKey,
    galleryTileHeight,
    galleryVirtualSections,
    galleryViewportHeight,
    isBrowserBusy,
    isPreviewableKind,
    isSearchBusy,
    isSelectionMode,
    listVirtualItems,
    loadAssetsPage,
    nextAssetsContinuationToken,
    reloadCurrentItems,
    requestThumbnailRetry,
    resetAssetsResult,
    resetGalleryThumbnails,
    resetGalleryTileMinWidth,
    resetSearchState,
    resolvePersistedUiStateForProfile,
    searchInput,
    selectedAsset,
    selectedAssetCount,
    selectedAssetKey,
    selectedAssetKeys,
    setActiveSearchQuery,
    setAssetsPrefix,
    setGalleryScrollTop,
    setGalleryTileMinWidth,
    setIsSelectionMode,
    setKindFilter,
    setListScrollTop,
    setSearchInput,
    setSearchItems,
    setSelectedAssetKey,
    setSelectedAssetKeys,
    setSmartCollection,
    setSortBy,
    setSortDirection,
    setViewMode,
    viewMode,
    visibleItems,
  } = galleryBrowsing;

  const previewSurface = useDesktopWorkbenchPreviewSurface({
    desktopApi,
    feedback: shellResources.feedback,
    galleryBrowsing,
    workspaceState,
  });
  const {
    closeQuickPreview,
    handleCopyToClipboard,
    isQuickPreviewOpen,
    moveQuickPreviewSelection,
    openQuickPreviewForItem,
    setIsQuickPreviewOpen,
  } = previewSurface;

  const {
    handleProfileDeleted,
    handleProfileSelected,
  } = useWorkspaceGalleryLifecycleWorkbench({
    resetAssetsResult,
    setActiveSearchQuery,
    setSearchInput,
    setSearchItems,
    setSelectedAssetKey,
  });

  const workspaceCommands = useWorkspaceCommandsWorkbench({
    assetDiscoveryApi: desktopApi.assetDiscovery,
    closeProfileMenu,
    initialProfileForm,
    isConnectionSetupOpen,
    isCreatingProfile,
    isProfileBusy,
    isProfileFormDirty,
    isProfileMenuOpen,
    isSettingsBusy,
    isSettingsDirty,
    isWorkspaceSettingsOpen,
    manageProfileOptionValue,
    newProfileOptionValue,
    profileForm,
    profileFormValidationErrors,
    profileFormRefs,
    profileMenuButtonRef,
    profileMenuListRef,
    profiles,
    onProfileDeleted: handleProfileDeleted,
    onProfileSelected: handleProfileSelected,
    pushInlineFeedback,
    savedSettingsSnapshot,
    selectedProfile,
    selectedProfileId,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
    setIsProfileBusy,
    setIsSettingsBusy,
    setIsShortcutHelpOpen,
    setIsWorkspaceSettingsOpen,
    setProfileForm,
    setProfiles,
    setR2AccountId,
    setSavedSettingsSnapshot,
    setSavedViews,
    setSelectedProfileId,
    setSettings,
    setStatusLine,
    settings,
    workspaceApi: desktopApi.workspace,
  });
  const {
    handleCloseConnectionSetup,
    handleCloseShortcutHelp,
    handleCloseWorkspaceSettings,
    handleToggleShortcutHelp,
    hasInitialized,
  } = workspaceCommands;

  const diagnostics = useDiagnosticsWorkbench({
    copyToClipboard: handleCopyToClipboard,
    diagnosticsApi: desktopApi.diagnostics,
    isDevEnv,
    isWorkspaceSettingsOpen,
    nowIso: () => new Date().toISOString(),
    profileLabel: selectedProfile?.name || selectedProfileId || '-',
    runtimeApi: desktopApi.runtime,
    setStatusLine,
  });
  const {
    devMetrics,
  } = diagnostics;

  const runtimeState = useWorkspaceRuntimeStateWorkbench({
    isBrowserBusy,
    isSearchBusy,
    selectedProfileId,
    nextAssetsContinuationToken,
    activeSearchQuery,
    hasInitialized,
  });
  const { showGuidedStart } = runtimeState;

  const assetCommandFlow = useAssetCommandFlowWorkbench({
    api: {
      assetLibrary: desktopApi.assetLibrary,
      assetUpload: desktopApi.assetUpload,
      files: desktopApi.files,
    },
    feedback: {
      pushInlineFeedback,
      setStatusLine,
    },
    gallery: {
      assetsPrefix,
      reloadCurrentItems,
      selectedAsset,
      selectedAssetKey,
      selectedAssetKeys,
      setIsSelectionMode,
      setSelectedAssetKey,
      setSelectedAssetKeys,
      visibleItems,
    },
    preview: {
      setIsQuickPreviewOpen,
    },
    surfaces: {
      appShellRef,
      uploadToastRef,
    },
    workspace: {
      defaultConflictPolicy: settings.defaultConflictPolicy,
      isConnectionSetupOpen,
      selectedProfileId,
      showGuidedStart,
    },
  });
  const {
    assetActionDialog,
    bulkDeleteDialogKeys,
    bulkMoveDialog,
    handleCloseAssetActionDialog,
    handleCloseBulkDeleteDialog,
    handleCloseBulkMoveDialog,
    handleCloseUploadConflictDialog,
    handleOpenAssetDelete,
    handleOpenBulkDeleteDialog,
    isDropActive,
    setAssetActionDialog,
    setBulkDeleteDialogKeys,
    setBulkMoveDialog,
    setUploadConflictDialog,
    uploadConflictDialog,
  } = assetCommandFlow;

  const gallerySession = useGallerySessionWorkbench({
    assetActionDialog,
    bulkDeleteDialogKeys,
    bulkMoveDialog,
    isPreviewableKind,
    isSelectionMode,
    loadAssetsPage,
    openQuickPreviewForItem,
    requestThumbnailRetry,
    resetAssetsResult,
    resetGalleryThumbnails,
    resetSearchState,
    resolvePersistedUiStateForProfile,
    selectedAssetKey,
    selectedProfileId,
    setAssetActionDialog,
    setAssetsPrefix,
    setBulkDeleteDialogKeys,
    setBulkMoveDialog,
    setGalleryScrollTop,
    setGalleryTileMinWidth,
    setIsSelectionMode,
    setKindFilter,
    setListScrollTop,
    setSelectedAssetKey,
    setSelectedAssetKeys,
    setSmartCollection,
    setSortBy,
    setSortDirection,
    setStatusLine,
    setViewMode,
    visibleItems,
  });
  const {
    handleSelectAllVisible,
    toggleAssetSelection,
  } = gallerySession;

  const { shellProps, shellUi } = useDesktopWorkbenchShellCoordination(
    createDesktopWorkbenchShellCoordinationInput({
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
      setGalleryTileMinWidth: adjustGalleryTileMinWidth,
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
    }),
  );

  const { workspaceSettingsOverlayProps } = useDesktopWorkbenchWorkspaceSettingsSurface({
    desktopApi,
    diagnostics,
    galleryBrowsing,
    runtimeState,
    shellUi,
    setStatusLine,
    workspaceCommands,
    workspaceState,
  });

  const {
    appOverlaysProps,
    appTopbarProps,
    workspaceCenterPaneProps,
  } = useDesktopWorkbenchMainSurfaces({
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
  });

  return {
    appShellClassName: shellProps.appShellClassName,
    appShellRef,
    appOverlaysProps,
    appTopbarProps,
    isWorkspaceFocused: shellProps.isWorkspaceFocused,
    isWorkspaceInert: shellProps.isWorkspaceInert,
    statusStripProps: shellProps.statusStripProps,
    workspaceCenterPaneProps,
  };
};
