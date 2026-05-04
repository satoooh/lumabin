import { useMemo } from 'react';
import type { AssetItem } from '../../shared/ipc';
import {
  countKinds,
  countSmartCollections,
  filterItemsByKind,
  filterItemsByPrefix,
  isQuickPreviewKind,
  resolveVisibleItems,
  type GalleryVirtualSection,
  type KindFilter,
  type SmartCollection,
  type SortDirection,
  type SortField,
  type UnifiedFilterOption,
} from './gallery-view-model-calculations';
import {
  buildUnifiedFilterOptions,
  normalizeFilterPair,
  resolveFilterLabel,
  resolveVisibleKindFilterOptions,
  resolveVisibleSmartCollectionOptions,
  toUnifiedFilterId,
} from './gallery-filter-options';
import {
  buildGalleryDaySections,
  buildGalleryGridLocationByKey,
  buildGalleryVirtualSections,
  calculateGalleryColumnCount,
  calculateGalleryTileHeight,
  calculateGalleryTileWidth,
  calculateGalleryVirtualRange,
  calculateListVirtualRange,
} from './gallery-virtualization-calculations';

export {
  GALLERY_CARD_ASPECT_RATIO,
  GALLERY_DAY_GROUP_GAP_PX,
  GALLERY_DAY_HEADER_HEIGHT_PX,
  GALLERY_GRID_GAP_PX,
  GALLERY_VIRTUAL_OVERSCAN_PX,
  LIST_ROW_HEIGHT_PX,
  VIRTUAL_OVERSCAN_ROWS,
  isQuickPreviewKind,
} from './gallery-view-model-calculations';
export {
  normalizeFilterPair,
  parseUnifiedFilterId,
} from './gallery-filter-options';
export type {
  GalleryDaySection,
  GalleryVirtualSection,
  KindFilter,
  SmartCollection,
  SortDirection,
  SortField,
  UnifiedFilterId,
  UnifiedFilterOption,
  ViewMode,
} from './gallery-view-model-calculations';

interface UseGalleryViewModelOptions {
  activeSearchQuery: string;
  assetsItems: AssetItem[];
  assetsPrefix: string;
  formatDayLabel: (dayKey: string) => string;
  getDayKey: (isoDate: string) => string;
  galleryScrollTop: number;
  galleryTileMinWidth: number;
  galleryViewportHeight: number;
  galleryViewportWidth: number;
  inferAssetKind: (item: AssetItem) => Exclude<KindFilter, 'all'>;
  kindFilter: KindFilter;
  listScrollTop: number;
  listViewportHeight: number;
  normalizePrefix: (prefix: string) => string;
  recentViewsByKey: Record<string, number>;
  searchItems: AssetItem[];
  selectedAssetKey: string;
  selectedAssetKeys: string[];
  smartCollection: SmartCollection;
  sortBy: SortField;
  sortDirection: SortDirection;
}

export const useGalleryViewModel = ({
  activeSearchQuery,
  assetsItems,
  assetsPrefix,
  formatDayLabel,
  getDayKey,
  galleryScrollTop,
  galleryTileMinWidth,
  galleryViewportHeight,
  galleryViewportWidth,
  inferAssetKind,
  kindFilter,
  listScrollTop,
  listViewportHeight,
  normalizePrefix,
  recentViewsByKey,
  searchItems,
  selectedAssetKey,
  selectedAssetKeys,
  smartCollection,
  sortBy,
  sortDirection,
}: UseGalleryViewModelOptions) => {
  const sourceItems = useMemo(
    () => (activeSearchQuery ? searchItems : assetsItems),
    [activeSearchQuery, assetsItems, searchItems],
  );

  const prefixFilteredItems = useMemo(() => {
    return filterItemsByPrefix(sourceItems, assetsPrefix, normalizePrefix);
  }, [assetsPrefix, normalizePrefix, sourceItems]);

  const {
    kindFilter: activeKindFilter,
    smartCollection: activeSmartCollection,
  } = useMemo(
    () => normalizeFilterPair(kindFilter, smartCollection),
    [kindFilter, smartCollection],
  );

  const activeUnifiedFilterId = useMemo(
    () => toUnifiedFilterId(activeKindFilter, activeSmartCollection),
    [activeKindFilter, activeSmartCollection],
  );

  const smartCollectionCounts = useMemo(() => {
    return countSmartCollections(
      prefixFilteredItems,
      recentViewsByKey,
      Date.now(),
      inferAssetKind,
    );
  }, [inferAssetKind, prefixFilteredItems, recentViewsByKey]);

  const kindFilteredItems = useMemo(() => {
    return filterItemsByKind(prefixFilteredItems, activeKindFilter, inferAssetKind);
  }, [activeKindFilter, inferAssetKind, prefixFilteredItems]);

  const visibleItems = useMemo(() => {
    return resolveVisibleItems(
      {
        activeSmartCollection,
        inferAssetKind,
        kindFilteredItems,
        prefixFilteredItems,
        recentViewsByKey,
        sortBy,
        sortDirection,
      },
      Date.now(),
    );
  }, [
    activeSmartCollection,
    inferAssetKind,
    kindFilteredItems,
    prefixFilteredItems,
    recentViewsByKey,
    sortBy,
    sortDirection,
  ]);

  const kindCounts = useMemo(() => {
    return countKinds(prefixFilteredItems, inferAssetKind);
  }, [inferAssetKind, prefixFilteredItems]);

  const visibleKindFilterOptions = useMemo(
    () => resolveVisibleKindFilterOptions(kindCounts, activeKindFilter),
    [activeKindFilter, kindCounts],
  );

  const visibleSmartCollectionOptions = useMemo(
    () =>
      resolveVisibleSmartCollectionOptions(
        smartCollectionCounts,
        activeSmartCollection,
      ),
    [activeSmartCollection, smartCollectionCounts],
  );

  const unifiedFilterOptions = useMemo<UnifiedFilterOption[]>(() => {
    return buildUnifiedFilterOptions(
      kindCounts,
      smartCollectionCounts,
      visibleKindFilterOptions,
      visibleSmartCollectionOptions,
    );
  }, [
    kindCounts,
    smartCollectionCounts,
    visibleKindFilterOptions,
    visibleSmartCollectionOptions,
  ]);

  const activeKindLabel = useMemo(
    () => resolveFilterLabel(activeKindFilter, 'all', visibleKindFilterOptions),
    [activeKindFilter, visibleKindFilterOptions],
  );

  const activeSmartCollectionLabel = useMemo(
    () =>
      resolveFilterLabel(
        activeSmartCollection,
        'all',
        visibleSmartCollectionOptions,
      ),
    [activeSmartCollection, visibleSmartCollectionOptions],
  );

  const listVirtualRange = useMemo(() => {
    return calculateListVirtualRange(
      listScrollTop,
      listViewportHeight,
      visibleItems.length,
    );
  }, [listScrollTop, listViewportHeight, visibleItems.length]);

  const listVirtualItems = useMemo(
    () => visibleItems.slice(listVirtualRange.startIndex, listVirtualRange.endIndex),
    [listVirtualRange.endIndex, listVirtualRange.startIndex, visibleItems],
  );

  const galleryColumnCount = useMemo(() => {
    return calculateGalleryColumnCount(galleryViewportWidth, galleryTileMinWidth);
  }, [galleryTileMinWidth, galleryViewportWidth]);

  const galleryTileWidth = useMemo(() => {
    return calculateGalleryTileWidth(
      galleryViewportWidth,
      galleryTileMinWidth,
      galleryColumnCount,
    );
  }, [galleryColumnCount, galleryTileMinWidth, galleryViewportWidth]);

  const galleryTileHeight = useMemo(
    () => calculateGalleryTileHeight(galleryTileWidth),
    [galleryTileWidth],
  );

  const galleryDaySections = useMemo(() => {
    return buildGalleryDaySections(visibleItems, getDayKey, formatDayLabel);
  }, [formatDayLabel, getDayKey, visibleItems]);

  const galleryVirtualSections = useMemo<GalleryVirtualSection[]>(() => {
    return buildGalleryVirtualSections(
      galleryDaySections,
      galleryColumnCount,
      galleryTileHeight,
    );
  }, [galleryColumnCount, galleryDaySections, galleryTileHeight]);

  const galleryVirtualRange = useMemo(() => {
    return calculateGalleryVirtualRange(
      galleryVirtualSections,
      galleryScrollTop,
      galleryViewportHeight,
    );
  }, [galleryScrollTop, galleryViewportHeight, galleryVirtualSections]);

  const visibleGallerySections = useMemo(
    () =>
      galleryVirtualSections.slice(
        galleryVirtualRange.startIndex,
        galleryVirtualRange.endIndex,
      ),
    [galleryVirtualRange.endIndex, galleryVirtualRange.startIndex, galleryVirtualSections],
  );

  const galleryGridLocationByKey = useMemo(() => {
    return buildGalleryGridLocationByKey(galleryDaySections);
  }, [galleryDaySections]);

  const selectedAsset = useMemo(
    () => visibleItems.find((item) => item.key === selectedAssetKey) ?? null,
    [selectedAssetKey, visibleItems],
  );

  const selectedAssetKeySet = useMemo(() => new Set(selectedAssetKeys), [selectedAssetKeys]);
  const selectedAssetCount = selectedAssetKeys.length;

  const previewMediaItems = useMemo(
    () => visibleItems.filter((item) => isQuickPreviewKind(inferAssetKind(item))),
    [inferAssetKind, visibleItems],
  );

  const selectedPreviewItemIndex = useMemo(
    () => previewMediaItems.findIndex((item) => item.key === selectedAssetKey),
    [previewMediaItems, selectedAssetKey],
  );

  return {
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
  };
};
