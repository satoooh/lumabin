import type { WorkspaceCenterPaneProps } from './workspace-center-pane';

type GalleryTopRowProps = WorkspaceCenterPaneProps['galleryTopRow'];
type GalleryPaneProps = WorkspaceCenterPaneProps['galleryPane'];
type AssetListPaneProps = WorkspaceCenterPaneProps['assetListPane'];
type AssetClickEvent = Parameters<GalleryPaneProps['onAssetClick']>[0];
type AssetClickItem = Parameters<GalleryPaneProps['onAssetClick']>[1];
type AssetClickOptions = Parameters<GalleryPaneProps['onAssetClick']>[2];

interface WorkspaceCenterPanePropsInput {
  assetList: {
    listBottomSpacerHeight: AssetListPaneProps['listBottomSpacerHeight'];
    listContainerRef: AssetListPaneProps['listContainerRef'];
    listRovingAssetKey: AssetListPaneProps['listRovingAssetKey'];
    listTopSpacerHeight: AssetListPaneProps['listTopSpacerHeight'];
    listVirtualItems: AssetListPaneProps['listVirtualItems'];
    onListScroll: AssetListPaneProps['onListScroll'];
  };
  display: {
    basenameFromKey: GalleryPaneProps['basenameFromKey'];
    formatBytes: GalleryPaneProps['formatBytes'];
    formatDate: GalleryPaneProps['formatDate'];
    iconForKind: GalleryPaneProps['iconForKind'];
    inferAssetKind: GalleryPaneProps['inferAssetKind'];
    thumbnailCacheKey: GalleryPaneProps['toThumbnailCacheKey'];
  };
  emptyState: {
    canClearSearch: WorkspaceCenterPaneProps['emptyState']['canClearSearch'];
    canResetFilters: WorkspaceCenterPaneProps['emptyState']['canResetFilters'];
    emptyStateMode: WorkspaceCenterPaneProps['emptyState']['mode'];
    handleLoadFirstPage: () => Promise<void> | void;
    handleOpenFilePicker: WorkspaceCenterPaneProps['emptyState']['onOpenFilePicker'];
    isListLoading: WorkspaceCenterPaneProps['emptyState']['isListLoading'];
    isUploadBusy: WorkspaceCenterPaneProps['emptyState']['isUploadBusy'];
  };
  filters: {
    activeKindLabel: GalleryTopRowProps['activeKindLabel'];
    activeSearchQuery: GalleryTopRowProps['activeSearchQuery'];
    activeSmartCollectionLabel: GalleryTopRowProps['activeSmartCollectionLabel'];
    activeUnifiedFilterId: GalleryTopRowProps['activeUnifiedFilterId'];
    handleSearchClear: GalleryTopRowProps['onClearSearch'];
    handleSelectUnifiedFilter: GalleryTopRowProps['onSelectUnifiedFilter'];
    handleResetViewFilters: GalleryTopRowProps['onResetFilters'];
    unifiedFilterOptions: GalleryTopRowProps['unifiedFilterOptions'];
  };
  gallery: {
    galleryColumnCount: GalleryPaneProps['galleryColumnCount'];
    galleryDaySectionCount: GalleryPaneProps['galleryDaySectionCount'];
    galleryRovingAssetKey: GalleryPaneProps['galleryRovingAssetKey'];
    galleryScrollRef: GalleryPaneProps['galleryScrollRef'];
    galleryThumbnailErrors: GalleryPaneProps['galleryThumbnailErrors'];
    galleryThumbnailLoading: GalleryPaneProps['galleryThumbnailLoading'];
    galleryThumbnails: GalleryPaneProps['galleryThumbnails'];
    galleryVirtualRange: GalleryPaneProps['galleryVirtualRange'];
    isGalleryScrolling: GalleryPaneProps['isGalleryScrolling'];
    onGalleryScroll: GalleryPaneProps['onGalleryScroll'];
    visibleGallerySections: GalleryPaneProps['visibleGallerySections'];
  };
  guidedStart: {
    handleSelectProfile: (profileId: string) => void;
    handleStartNewProfile: WorkspaceCenterPaneProps['guidedStart']['onCreateConnection'];
    profiles: Array<{ id: string }>;
  };
  interaction: {
    handleAssetItemClick: (
      event: AssetClickEvent,
      item: AssetClickItem,
      options: AssetClickOptions & { openPreviewOnSingleClick: boolean },
    ) => void;
    handleAssetItemDoubleClick: AssetListPaneProps['onAssetDoubleClick'];
    handleThumbnailDecodeError: GalleryPaneProps['onThumbnailDecodeError'];
    setAssetItemRef: GalleryPaneProps['setAssetItemRef'];
    setSelectedAssetKey: GalleryPaneProps['onAssetFocus'];
  };
  selection: {
    handleOpenBulkDeleteDialog: WorkspaceCenterPaneProps['selectionActionBar']['onOpenBulkDelete'];
    handleOpenBulkMoveDialog: WorkspaceCenterPaneProps['selectionActionBar']['onOpenBulkMove'];
    handleSelectAllVisible: WorkspaceCenterPaneProps['selectionActionBar']['onSelectAllVisible'];
    isAssetActionBusy: WorkspaceCenterPaneProps['selectionActionBar']['isAssetActionBusy'];
    isSelectionMode: WorkspaceCenterPaneProps['selectionActionBar']['isSelectionMode'];
    selectedAssetCount: WorkspaceCenterPaneProps['selectionActionBar']['selectedAssetCount'];
    selectedAssetKey: GalleryPaneProps['selectedAssetKey'];
    selectedAssetKeySet: GalleryPaneProps['selectedAssetKeySet'];
    selectedProfileId: GalleryPaneProps['selectedProfileId'];
    setSelectedAssetKeys: (keys: string[]) => void;
    toggleSelectionMode: GalleryTopRowProps['onToggleSelectionMode'];
  };
  sizing: {
    applyGalleryTileMinWidth: GalleryTopRowProps['onGalleryTileMinWidthInput'];
    commitGalleryTileMinWidth: GalleryTopRowProps['onGalleryTileMinWidthInput'];
    flushGalleryTileMinWidthCommit: GalleryTopRowProps['onGalleryTileMinWidthCommit'];
    gallerySizeSliderRef: GalleryTopRowProps['gallerySizeSliderRef'];
    galleryTileMinWidth: GalleryTopRowProps['galleryTileMinWidth'];
    galleryTileMinWidthDefault: GalleryTopRowProps['galleryTileMinWidth'];
    galleryTileMinWidthMax: GalleryTopRowProps['galleryTileMinWidthMax'];
    galleryTileMinWidthMin: GalleryTopRowProps['galleryTileMinWidthMin'];
    galleryTileMinWidthStep: GalleryTopRowProps['galleryTileMinWidthStep'];
    scheduleGalleryTileMinWidthCommit: GalleryTopRowProps['onGalleryTileMinWidthInput'];
  };
  state: {
    isQuickPreviewOpen: GalleryPaneProps['isQuickPreviewOpen'];
    showGuidedStart: WorkspaceCenterPaneProps['showGuidedStart'];
    viewMode: WorkspaceCenterPaneProps['viewMode'];
    visibleItemCount: WorkspaceCenterPaneProps['visibleItemCount'];
  };
  viewModeCommands: {
    setViewMode: GalleryTopRowProps['onSetViewMode'];
  };
}

export const createWorkspaceCenterPaneProps = ({
  assetList,
  display,
  emptyState,
  filters,
  gallery,
  guidedStart,
  interaction,
  selection,
  sizing,
  state,
  viewModeCommands,
}: WorkspaceCenterPanePropsInput): WorkspaceCenterPaneProps => ({
  showGuidedStart: state.showGuidedStart,
  guidedStart: {
    hasSavedProfile: guidedStart.profiles.length > 0,
    onCreateConnection: guidedStart.handleStartNewProfile,
    onUseSavedProfile: () => {
      const firstProfileId = guidedStart.profiles[0]?.id ?? '';
      if (!firstProfileId) {
        return;
      }
      guidedStart.handleSelectProfile(firstProfileId);
    },
  },
  viewMode: state.viewMode,
  visibleItemCount: state.visibleItemCount,
  galleryTopRow: {
    viewMode: state.viewMode,
    unifiedFilterOptions: filters.unifiedFilterOptions,
    activeUnifiedFilterId: filters.activeUnifiedFilterId,
    onSelectUnifiedFilter: filters.handleSelectUnifiedFilter,
    activeKindLabel: filters.activeKindLabel,
    activeSmartCollectionLabel: filters.activeSmartCollectionLabel,
    activeSearchQuery: filters.activeSearchQuery,
    onClearSearch: filters.handleSearchClear,
    onResetFilters: filters.handleResetViewFilters,
    gallerySizeSliderRef: sizing.gallerySizeSliderRef,
    galleryTileMinWidthMin: sizing.galleryTileMinWidthMin,
    galleryTileMinWidthMax: sizing.galleryTileMinWidthMax,
    galleryTileMinWidthStep: sizing.galleryTileMinWidthStep,
    galleryTileMinWidth: sizing.galleryTileMinWidth,
    onGalleryTileMinWidthInput: (value) => {
      sizing.applyGalleryTileMinWidth(value);
      sizing.scheduleGalleryTileMinWidthCommit(value);
    },
    onGalleryTileMinWidthCommit: sizing.flushGalleryTileMinWidthCommit,
    onGalleryTileMinWidthReset: () => {
      sizing.commitGalleryTileMinWidth(sizing.galleryTileMinWidthDefault);
    },
    onSetViewMode: viewModeCommands.setViewMode,
    isSelectionMode: selection.isSelectionMode,
    selectedAssetCount: selection.selectedAssetCount,
    onToggleSelectionMode: selection.toggleSelectionMode,
  },
  selectionActionBar: {
    isSelectionMode: selection.isSelectionMode,
    selectedAssetCount: selection.selectedAssetCount,
    visibleItemCount: state.visibleItemCount,
    isAssetActionBusy: selection.isAssetActionBusy,
    selectedProfileId: selection.selectedProfileId,
    onSelectAllVisible: selection.handleSelectAllVisible,
    onClearSelection: () => {
      selection.setSelectedAssetKeys([]);
    },
    onOpenBulkMove: selection.handleOpenBulkMoveDialog,
    onOpenBulkDelete: selection.handleOpenBulkDeleteDialog,
  },
  emptyState: {
    mode: emptyState.emptyStateMode,
    isListLoading: emptyState.isListLoading,
    isUploadBusy: emptyState.isUploadBusy,
    onLoadFirstPage: () => {
      void emptyState.handleLoadFirstPage();
    },
    onOpenFilePicker: emptyState.handleOpenFilePicker,
    canClearSearch: emptyState.canClearSearch,
    onClearSearch: filters.handleSearchClear,
    canResetFilters: emptyState.canResetFilters,
    onResetFilters: filters.handleResetViewFilters,
  },
  galleryPane: {
    galleryScrollRef: gallery.galleryScrollRef,
    onGalleryScroll: gallery.onGalleryScroll,
    isGalleryScrolling: gallery.isGalleryScrolling,
    galleryVirtualRange: gallery.galleryVirtualRange,
    visibleGallerySections: gallery.visibleGallerySections,
    galleryColumnCount: gallery.galleryColumnCount,
    galleryDaySectionCount: gallery.galleryDaySectionCount,
    selectedProfileId: selection.selectedProfileId,
    selectedAssetKey: selection.selectedAssetKey,
    selectedAssetKeySet: selection.selectedAssetKeySet,
    isQuickPreviewOpen: state.isQuickPreviewOpen,
    isSelectionMode: selection.isSelectionMode,
    galleryRovingAssetKey: gallery.galleryRovingAssetKey,
    galleryThumbnails: gallery.galleryThumbnails,
    galleryThumbnailLoading: gallery.galleryThumbnailLoading,
    galleryThumbnailErrors: gallery.galleryThumbnailErrors,
    inferAssetKind: display.inferAssetKind,
    iconForKind: display.iconForKind,
    basenameFromKey: display.basenameFromKey,
    formatBytes: display.formatBytes,
    formatDate: display.formatDate,
    toThumbnailCacheKey: display.thumbnailCacheKey,
    setAssetItemRef: interaction.setAssetItemRef,
    onAssetFocus: interaction.setSelectedAssetKey,
    onAssetClick: (event, item, options) =>
      interaction.handleAssetItemClick(event, item, {
        ...options,
        openPreviewOnSingleClick: true,
      }),
    onThumbnailDecodeError: interaction.handleThumbnailDecodeError,
  },
  assetListPane: {
    unifiedFilterOptions: filters.unifiedFilterOptions,
    activeUnifiedFilterId: filters.activeUnifiedFilterId,
    onSelectUnifiedFilter: filters.handleSelectUnifiedFilter,
    activeKindLabel: filters.activeKindLabel,
    activeSmartCollectionLabel: filters.activeSmartCollectionLabel,
    activeSearchQuery: filters.activeSearchQuery,
    onClearSearch: filters.handleSearchClear,
    onResetFilters: filters.handleResetViewFilters,
    listContainerRef: assetList.listContainerRef,
    onListScroll: assetList.onListScroll,
    listTopSpacerHeight: assetList.listTopSpacerHeight,
    listBottomSpacerHeight: assetList.listBottomSpacerHeight,
    listVirtualItems: assetList.listVirtualItems,
    inferAssetKind: display.inferAssetKind,
    isSelectionMode: selection.isSelectionMode,
    selectedAssetKeySet: selection.selectedAssetKeySet,
    selectedAssetKey: selection.selectedAssetKey,
    setAssetItemRef: interaction.setAssetItemRef,
    listRovingAssetKey: assetList.listRovingAssetKey,
    onAssetFocus: interaction.setSelectedAssetKey,
    onAssetClick: (event, item) =>
      interaction.handleAssetItemClick(event, item, {
        openPreviewOnSingleClick: false,
        hasThumbnailError: false,
      }),
    onAssetDoubleClick: interaction.handleAssetItemDoubleClick,
    formatBytes: display.formatBytes,
    formatDate: display.formatDate,
  },
});
