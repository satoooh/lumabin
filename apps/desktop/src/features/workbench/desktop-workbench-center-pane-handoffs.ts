import type { createDesktopWorkbenchCenterPaneCoordinationProps } from './desktop-workbench-center-pane-coordination';

type CenterPaneCoordinationInput = Parameters<
  typeof createDesktopWorkbenchCenterPaneCoordinationProps
>[0];
type CenterPaneAssetList = CenterPaneCoordinationInput['assetList'];
type CenterPaneEmptyState = CenterPaneCoordinationInput['emptyState'];
type CenterPaneFilters = CenterPaneCoordinationInput['filters'];
type CenterPaneGallery = CenterPaneCoordinationInput['gallery'];
type CenterPaneGuidedStart = CenterPaneCoordinationInput['guidedStart'];
type CenterPaneInteraction = CenterPaneCoordinationInput['interaction'];
type CenterPaneSelection = CenterPaneCoordinationInput['selection'];
type CenterPaneSizing = CenterPaneCoordinationInput['sizing'];
type CenterPaneState = CenterPaneCoordinationInput['state'];
type CenterPaneViewModeCommands = CenterPaneCoordinationInput['viewModeCommands'];

interface DesktopWorkbenchCenterPaneHandoffInput {
  activeKindLabel: CenterPaneFilters['activeKindLabel'];
  activeSearchQuery: CenterPaneFilters['activeSearchQuery'];
  activeSmartCollectionLabel: CenterPaneFilters['activeSmartCollectionLabel'];
  activeUnifiedFilterId: CenterPaneFilters['activeUnifiedFilterId'];
  applyGalleryTileMinWidth: CenterPaneSizing['applyGalleryTileMinWidth'];
  canClearSearch: CenterPaneEmptyState['canClearSearch'];
  canResetFilters: CenterPaneEmptyState['canResetFilters'];
  commitGalleryTileMinWidth: CenterPaneSizing['commitGalleryTileMinWidth'];
  emptyStateMode: CenterPaneEmptyState['emptyStateMode'];
  flushGalleryTileMinWidthCommit: CenterPaneSizing['flushGalleryTileMinWidthCommit'];
  galleryColumnCount: CenterPaneGallery['galleryColumnCount'];
  galleryDaySections: { length: CenterPaneGallery['galleryDaySectionCount'] };
  galleryRovingAssetKey: CenterPaneGallery['galleryRovingAssetKey'];
  galleryScrollRef: CenterPaneGallery['galleryScrollRef'];
  gallerySizeSliderRef: CenterPaneSizing['gallerySizeSliderRef'];
  galleryThumbnailErrors: CenterPaneGallery['galleryThumbnailErrors'];
  galleryThumbnailLoading: CenterPaneGallery['galleryThumbnailLoading'];
  galleryThumbnails: CenterPaneGallery['galleryThumbnails'];
  galleryTileMinWidth: CenterPaneSizing['galleryTileMinWidth'];
  galleryVirtualRange: CenterPaneGallery['galleryVirtualRange'];
  handleAssetItemClick: CenterPaneInteraction['handleAssetItemClick'];
  handleAssetItemDoubleClick: CenterPaneInteraction['handleAssetItemDoubleClick'];
  handleLoadFirstPage: CenterPaneEmptyState['handleLoadFirstPage'];
  handleOpenBulkDeleteDialog: CenterPaneSelection['handleOpenBulkDeleteDialog'];
  handleOpenBulkMoveDialog: CenterPaneSelection['handleOpenBulkMoveDialog'];
  handleOpenFilePicker: CenterPaneEmptyState['handleOpenFilePicker'];
  handleResetViewFilters: CenterPaneFilters['handleResetViewFilters'];
  handleSearchClear: CenterPaneFilters['handleSearchClear'];
  handleSelectAllVisible: CenterPaneSelection['handleSelectAllVisible'];
  handleSelectProfile: CenterPaneGuidedStart['handleSelectProfile'];
  handleSelectUnifiedFilter: CenterPaneFilters['handleSelectUnifiedFilter'];
  handleStartNewProfile: CenterPaneGuidedStart['handleStartNewProfile'];
  handleThumbnailDecodeError: CenterPaneInteraction['handleThumbnailDecodeError'];
  isAssetActionBusy: CenterPaneSelection['isAssetActionBusy'];
  isGalleryScrolling: CenterPaneGallery['isGalleryScrolling'];
  isListLoading: CenterPaneEmptyState['isListLoading'];
  isQuickPreviewOpen: CenterPaneState['isQuickPreviewOpen'];
  isSelectionMode: CenterPaneSelection['isSelectionMode'];
  isUploadBusy: CenterPaneEmptyState['isUploadBusy'];
  listContainerRef: CenterPaneAssetList['listContainerRef'];
  listRovingAssetKey: CenterPaneAssetList['listRovingAssetKey'];
  listVirtualItems: CenterPaneAssetList['listVirtualItems'];
  listVirtualRange: Pick<
    CenterPaneAssetList,
    'listBottomSpacerHeight' | 'listTopSpacerHeight'
  >;
  profiles: CenterPaneGuidedStart['profiles'];
  queueGalleryScrollStateUpdate: CenterPaneGallery['onGalleryScroll'];
  queueListScrollStateUpdate: CenterPaneAssetList['onListScroll'];
  scheduleGalleryTileMinWidthCommit: CenterPaneSizing['scheduleGalleryTileMinWidthCommit'];
  selectedAssetCount: CenterPaneSelection['selectedAssetCount'];
  selectedAssetKey: CenterPaneSelection['selectedAssetKey'];
  selectedAssetKeySet: CenterPaneSelection['selectedAssetKeySet'];
  selectedProfileId: CenterPaneSelection['selectedProfileId'];
  setAssetItemRef: CenterPaneInteraction['setAssetItemRef'];
  setSelectedAssetKey: CenterPaneInteraction['setSelectedAssetKey'];
  setSelectedAssetKeys: CenterPaneSelection['setSelectedAssetKeys'];
  setViewMode: CenterPaneViewModeCommands['setViewMode'];
  showGuidedStart: CenterPaneState['showGuidedStart'];
  toggleSelectionMode: CenterPaneSelection['toggleSelectionMode'];
  unifiedFilterOptions: CenterPaneFilters['unifiedFilterOptions'];
  viewMode: CenterPaneState['viewMode'];
  visibleGallerySections: CenterPaneGallery['visibleGallerySections'];
  visibleItems: { length: CenterPaneState['visibleItemCount'] };
}

export const createDesktopWorkbenchCenterPaneCoordinationInput = ({
  activeKindLabel,
  activeSearchQuery,
  activeSmartCollectionLabel,
  activeUnifiedFilterId,
  applyGalleryTileMinWidth,
  canClearSearch,
  canResetFilters,
  commitGalleryTileMinWidth,
  emptyStateMode,
  flushGalleryTileMinWidthCommit,
  galleryColumnCount,
  galleryDaySections,
  galleryRovingAssetKey,
  galleryScrollRef,
  gallerySizeSliderRef,
  galleryThumbnailErrors,
  galleryThumbnailLoading,
  galleryThumbnails,
  galleryTileMinWidth,
  galleryVirtualRange,
  handleAssetItemClick,
  handleAssetItemDoubleClick,
  handleLoadFirstPage,
  handleOpenBulkDeleteDialog,
  handleOpenBulkMoveDialog,
  handleOpenFilePicker,
  handleResetViewFilters,
  handleSearchClear,
  handleSelectAllVisible,
  handleSelectProfile,
  handleSelectUnifiedFilter,
  handleStartNewProfile,
  handleThumbnailDecodeError,
  isAssetActionBusy,
  isGalleryScrolling,
  isListLoading,
  isQuickPreviewOpen,
  isSelectionMode,
  isUploadBusy,
  listContainerRef,
  listRovingAssetKey,
  listVirtualItems,
  listVirtualRange,
  profiles,
  queueGalleryScrollStateUpdate,
  queueListScrollStateUpdate,
  scheduleGalleryTileMinWidthCommit,
  selectedAssetCount,
  selectedAssetKey,
  selectedAssetKeySet,
  selectedProfileId,
  setAssetItemRef,
  setSelectedAssetKey,
  setSelectedAssetKeys,
  setViewMode,
  showGuidedStart,
  toggleSelectionMode,
  unifiedFilterOptions,
  viewMode,
  visibleGallerySections,
  visibleItems,
}: DesktopWorkbenchCenterPaneHandoffInput): CenterPaneCoordinationInput => ({
  assetList: {
    listBottomSpacerHeight: listVirtualRange.listBottomSpacerHeight,
    listContainerRef,
    listRovingAssetKey,
    listTopSpacerHeight: listVirtualRange.listTopSpacerHeight,
    listVirtualItems,
    onListScroll: queueListScrollStateUpdate,
  },
  emptyState: {
    canClearSearch,
    canResetFilters,
    emptyStateMode,
    handleLoadFirstPage,
    handleOpenFilePicker,
    isListLoading,
    isUploadBusy,
  },
  filters: {
    activeKindLabel,
    activeSearchQuery,
    activeSmartCollectionLabel,
    activeUnifiedFilterId,
    handleSearchClear,
    handleSelectUnifiedFilter,
    handleResetViewFilters,
    unifiedFilterOptions,
  },
  gallery: {
    galleryColumnCount,
    galleryDaySectionCount: galleryDaySections.length,
    galleryRovingAssetKey,
    galleryScrollRef,
    galleryThumbnailErrors,
    galleryThumbnailLoading,
    galleryThumbnails,
    galleryVirtualRange,
    isGalleryScrolling,
    onGalleryScroll: queueGalleryScrollStateUpdate,
    visibleGallerySections,
  },
  guidedStart: {
    handleSelectProfile,
    handleStartNewProfile,
    profiles,
  },
  interaction: {
    handleAssetItemClick,
    handleAssetItemDoubleClick,
    handleThumbnailDecodeError,
    setAssetItemRef,
    setSelectedAssetKey,
  },
  selection: {
    handleOpenBulkDeleteDialog,
    handleOpenBulkMoveDialog,
    handleSelectAllVisible,
    isAssetActionBusy,
    isSelectionMode,
    selectedAssetCount,
    selectedAssetKey,
    selectedAssetKeySet,
    selectedProfileId,
    setSelectedAssetKeys,
    toggleSelectionMode,
  },
  sizing: {
    applyGalleryTileMinWidth,
    commitGalleryTileMinWidth,
    flushGalleryTileMinWidthCommit,
    gallerySizeSliderRef,
    galleryTileMinWidth,
    scheduleGalleryTileMinWidthCommit,
  },
  state: {
    isQuickPreviewOpen,
    showGuidedStart,
    viewMode,
    visibleItemCount: visibleItems.length,
  },
  viewModeCommands: {
    setViewMode,
  },
});
