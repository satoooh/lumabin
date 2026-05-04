import type { RefObject } from 'react';
import { useCallback, useState } from 'react';
import {
  GALLERY_DAY_HEADER_HEIGHT_PX,
  GALLERY_GRID_GAP_PX,
  LIST_ROW_HEIGHT_PX,
  isQuickPreviewKind,
  useGalleryViewModel,
} from '../gallery/use-gallery-view-model';
import { GALLERY_TILE_MIN_WIDTH_DEFAULT } from '../gallery/gallery-layout-policy';
import { initialGalleryWorkspaceAssetsPrefix, useGalleryWorkspacePreferences } from '../gallery/use-gallery-workspace-preferences';
import { loadRecentViewsStore } from '../gallery/recent-views-state';
import { normalizeAssetPrefix } from '../shared/asset-prefix';
import type { DesktopApiGateway } from '../shared/desktop-api-gateway';
import {
  dayKeyFromIso,
  formatGalleryDayLabel,
  inferAssetKind,
  thumbnailCacheKey,
} from '../shared/asset-display';
import { useAssetBrowserQueryController } from '../gallery/use-asset-browser-query-controller';
import { useAssetFocusController } from '../gallery/use-asset-focus-controller';
import { useGalleryFilterCommands } from '../gallery/use-gallery-filter-commands';
import { useGallerySearchCommands } from '../gallery/use-gallery-search-commands';
import { useGalleryThumbnails } from '../gallery/use-gallery-thumbnails';
import { useGalleryViewportController } from '../gallery/use-gallery-viewport-controller';
import { useRecentViewsState } from '../gallery/use-recent-views-state';

const SEARCH_DEBOUNCE_MS = 260;
const UI_STATE_PERSIST_DEBOUNCE_MS = 140;
const persistedRecentViewsStore = loadRecentViewsStore();

type SetStatusLine = (message: string, tone?: 'neutral' | 'success' | 'error') => void;

interface UseGalleryBrowsingWorkbenchOptions {
  appShellRef: RefObject<HTMLDivElement | null>;
  assetDiscoveryApi: DesktopApiGateway['assetDiscovery'];
  assetLibraryApi: DesktopApiGateway['assetLibrary'];
  galleryScrollRef: RefObject<HTMLDivElement | null>;
  gallerySizeSliderRef: RefObject<HTMLInputElement | null>;
  listContainerRef: RefObject<HTMLDivElement | null>;
  searchInputRef: RefObject<HTMLInputElement | null>;
  selectedProfileId: string;
  setStatusLine: SetStatusLine;
}

export const useGalleryBrowsingWorkbench = ({
  appShellRef,
  assetDiscoveryApi,
  assetLibraryApi,
  galleryScrollRef,
  gallerySizeSliderRef,
  listContainerRef,
  searchInputRef,
  selectedProfileId,
  setStatusLine,
}: UseGalleryBrowsingWorkbenchOptions) => {
  const [selectedAssetKey, setSelectedAssetKey] = useState<string>('');
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedAssetKeys, setSelectedAssetKeys] = useState<string[]>([]);

  const {
    activeSearchQuery,
    assetsPrefix,
    assetsResult,
    handleLoadFirstPage,
    handleLoadNextPage,
    handleOpenPrefix,
    handleSearchClear: clearAssetBrowserSearch,
    handleSearchSubmit,
    isBrowserBusy,
    isSearchBusy,
    loadAssetsPage,
    nextAssetsContinuationToken,
    reloadCurrentItems,
    resetAssetsResult,
    resetSearchState,
    runSearch,
    searchInput,
    searchItems,
    setActiveSearchQuery,
    setAssetsPrefix,
    setIsSearchBusy,
    setSearchInput,
    setSearchItems,
  } = useAssetBrowserQueryController({
    initialAssetsPrefix: initialGalleryWorkspaceAssetsPrefix,
    listAssets: assetLibraryApi.listAssets,
    searchAssets: assetDiscoveryApi.searchAssets,
    searchDebounceMs: SEARCH_DEBOUNCE_MS,
    selectedProfileId,
    setStatusLine,
  });

  const {
    galleryScrollTop,
    galleryTileMinWidth,
    kindFilter,
    listScrollTop,
    resolvePersistedUiStateForProfile,
    setGalleryScrollTop,
    setGalleryTileMinWidth,
    setKindFilter,
    setListScrollTop,
    setSmartCollection,
    setSortBy,
    setSortDirection,
    setViewMode,
    smartCollection,
    sortBy,
    sortDirection,
    viewMode,
  } = useGalleryWorkspacePreferences({
    assetsPrefix,
    persistDebounceMs: UI_STATE_PERSIST_DEBOUNCE_MS,
    selectedProfileId,
  });

  const {
    markAssetAsRecentlyViewed,
    recentViewsForSelectedProfile,
  } = useRecentViewsState({
    initialStore: persistedRecentViewsStore,
    selectedProfileId,
  });

  const { handleSearchClear } = useGallerySearchCommands({
    clearSearch: clearAssetBrowserSearch,
    searchInputRef,
  });

  const {
    adjustGalleryTileMinWidth,
    applyGalleryTileMinWidth,
    commitGalleryTileMinWidth,
    flushGalleryTileMinWidthCommit,
    galleryViewportHeight,
    galleryViewportWidth,
    isGalleryScrolling,
    listViewportHeight,
    queueGalleryScrollStateUpdate,
    queueListScrollStateUpdate,
    scheduleGalleryTileMinWidthCommit,
  } = useGalleryViewportController({
    appShellRef,
    galleryScrollRef,
    galleryScrollTop,
    gallerySizeSliderRef,
    galleryTileMinWidth,
    listContainerRef,
    listScrollTop,
    setGalleryScrollTop,
    setGalleryTileMinWidth,
    setListScrollTop,
    viewMode,
    visibleItemsLength: assetsResult.items.length + searchItems.length,
  });

  const {
    activeKindFilter,
    activeKindLabel,
    activeSmartCollection,
    activeSmartCollectionLabel,
    activeUnifiedFilterId,
    galleryColumnCount,
    galleryDaySections,
    galleryGridLocationByKey,
    galleryTileHeight,
    galleryVirtualRange,
    galleryVirtualSections,
    listVirtualItems,
    listVirtualRange,
    previewMediaItems,
    selectedAsset,
    selectedAssetCount,
    selectedAssetKeySet,
    selectedPreviewItemIndex,
    unifiedFilterOptions,
    visibleGallerySections,
    visibleItems,
  } = useGalleryViewModel({
    activeSearchQuery,
    assetsItems: assetsResult.items,
    assetsPrefix,
    formatDayLabel: formatGalleryDayLabel,
    getDayKey: dayKeyFromIso,
    galleryScrollTop,
    galleryTileMinWidth,
    galleryViewportHeight,
    galleryViewportWidth,
    inferAssetKind,
    kindFilter,
    listScrollTop,
    listViewportHeight,
    normalizePrefix: normalizeAssetPrefix,
    recentViewsByKey: recentViewsForSelectedProfile,
    searchItems,
    selectedAssetKey,
    selectedAssetKeys,
    smartCollection,
    sortBy,
    sortDirection,
  });

  const {
    assetItemRefs,
    focusAssetItemByKey,
    scrollToAssetInCurrentView,
    setAssetItemRef,
  } = useAssetFocusController({
    galleryColumnCount,
    galleryDayHeaderHeightPx: GALLERY_DAY_HEADER_HEIGHT_PX,
    galleryGridGapPx: GALLERY_GRID_GAP_PX,
    galleryGridLocationByKey,
    galleryScrollRef,
    galleryTileHeight,
    galleryViewportHeight,
    galleryVirtualSections,
    listContainerRef,
    listRowHeightPx: LIST_ROW_HEIGHT_PX,
    listViewportHeight,
    viewMode,
    visibleItems,
  });

  const {
    galleryThumbnailErrors,
    galleryThumbnailLoading,
    galleryThumbnails,
    handleThumbnailDecodeError,
    requestThumbnailRetry,
    resetGalleryThumbnails,
  } = useGalleryThumbnails({
    assetPreviewApi: assetLibraryApi,
    inferAssetKind,
    isGalleryScrolling,
    selectedProfileId,
    toThumbnailCacheKey: thumbnailCacheKey,
    viewMode,
    visibleGallerySections,
  });

  const {
    handleResetViewFilters,
    handleSelectUnifiedFilter,
  } = useGalleryFilterCommands({
    setKindFilter,
    setSmartCollection,
    setStatusLine,
  });

  const resetGalleryTileMinWidth = useCallback(() => {
    commitGalleryTileMinWidth(GALLERY_TILE_MIN_WIDTH_DEFAULT);
  }, [commitGalleryTileMinWidth]);

  return {
    activeKindFilter,
    activeKindLabel,
    activeSearchQuery,
    activeSmartCollection,
    activeSmartCollectionLabel,
    activeUnifiedFilterId,
    adjustGalleryTileMinWidth,
    applyGalleryTileMinWidth,
    assetItemRefs,
    assetsPrefix,
    assetsResult,
    commitGalleryTileMinWidth,
    flushGalleryTileMinWidthCommit,
    focusAssetItemByKey,
    galleryColumnCount,
    galleryDaySections,
    galleryGridLocationByKey,
    galleryThumbnailErrors,
    galleryThumbnailLoading,
    galleryThumbnails,
    galleryTileHeight,
    galleryTileMinWidth,
    galleryVirtualRange,
    galleryVirtualSections,
    galleryViewportHeight,
    handleLoadFirstPage,
    handleLoadNextPage,
    handleOpenPrefix,
    handleResetViewFilters,
    handleSearchClear,
    handleSearchSubmit,
    handleSelectUnifiedFilter,
    handleThumbnailDecodeError,
    isBrowserBusy,
    isGalleryScrolling,
    isPreviewableKind: isQuickPreviewKind,
    isSearchBusy,
    isSelectionMode,
    listVirtualItems,
    listVirtualRange,
    loadAssetsPage,
    markAssetAsRecentlyViewed,
    nextAssetsContinuationToken,
    previewMediaItems,
    queueGalleryScrollStateUpdate,
    queueListScrollStateUpdate,
    reloadCurrentItems,
    requestThumbnailRetry,
    resetAssetsResult,
    resetGalleryThumbnails,
    resetGalleryTileMinWidth,
    resetSearchState,
    resolvePersistedUiStateForProfile,
    runSearch,
    scheduleGalleryTileMinWidthCommit,
    scrollToAssetInCurrentView,
    searchInput,
    selectedAsset,
    selectedAssetCount,
    selectedAssetKey,
    selectedAssetKeys,
    selectedAssetKeySet,
    selectedPreviewItemIndex,
    setActiveSearchQuery,
    setAssetItemRef,
    setAssetsPrefix,
    setGalleryScrollTop,
    setGalleryTileMinWidth,
    setIsSearchBusy,
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
    sortBy,
    sortDirection,
    unifiedFilterOptions,
    viewMode,
    visibleGallerySections,
    visibleItems,
  };
};
