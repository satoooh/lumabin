import {
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type {
  AssetActionDialogState,
  BulkMoveDialogState,
} from './action-modals';
import type { PersistedUiState } from './use-persisted-ui-state';
import {
  normalizeFilterPair,
  type KindFilter,
  type SmartCollection,
  type SortDirection,
  type SortField,
  type ViewMode,
} from './use-gallery-view-model';

interface LoadAssetsPageInput {
  continuationToken?: string;
  page: number;
  prefix: string;
  profileId: string;
}

interface UseSelectedProfileGalleryBootstrapOptions {
  galleryTileMinWidthDefault: number;
  loadAssetsPage(input: LoadAssetsPageInput): Promise<void> | void;
  normalizeGalleryTileMinWidth(value: number): number;
  normalizePrefix(prefix: string): string;
  resetAssetsResult(): void;
  resetGalleryThumbnails(): void;
  resetSearchState(): void;
  resolvePersistedUiStateForProfile(profileId: string): PersistedUiState;
  selectedProfileId: string;
  setAssetActionDialog: Dispatch<SetStateAction<AssetActionDialogState | null>>;
  setAssetsPrefix(prefix: string): void;
  setBulkDeleteDialogKeys: Dispatch<SetStateAction<string[] | null>>;
  setBulkMoveDialog: Dispatch<SetStateAction<BulkMoveDialogState | null>>;
  setGalleryScrollTop(scrollTop: number): void;
  setGalleryTileMinWidth(width: number): void;
  setIsSelectionMode(isSelectionMode: boolean): void;
  setKindFilter(kindFilter: KindFilter): void;
  setListScrollTop(scrollTop: number): void;
  setSelectedAssetKey(assetKey: string): void;
  setSelectedAssetKeys: Dispatch<SetStateAction<string[]>>;
  setSmartCollection(smartCollection: SmartCollection): void;
  setSortBy(sortBy: SortField): void;
  setSortDirection(sortDirection: SortDirection): void;
  setViewMode(viewMode: ViewMode): void;
}

export const useSelectedProfileGalleryBootstrap = ({
  galleryTileMinWidthDefault,
  loadAssetsPage,
  normalizeGalleryTileMinWidth,
  normalizePrefix,
  resetAssetsResult,
  resetGalleryThumbnails,
  resetSearchState,
  resolvePersistedUiStateForProfile,
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
  setViewMode,
}: UseSelectedProfileGalleryBootstrapOptions): void => {
  useEffect(() => {
    if (!selectedProfileId) {
      resetAssetsResult();
      setKindFilter('all');
      setSmartCollection('all');
      setSelectedAssetKey('');
      setSelectedAssetKeys([]);
      setIsSelectionMode(false);
      setAssetActionDialog(null);
      setBulkMoveDialog(null);
      setBulkDeleteDialogKeys(null);
      resetGalleryThumbnails();
      return;
    }

    const persistedState = resolvePersistedUiStateForProfile(selectedProfileId);
    const nextPrefix = normalizePrefix(persistedState.assetsPrefix ?? '');
    const nextViewMode = persistedState.viewMode ?? 'gallery';
    const nextSortBy = persistedState.sortBy ?? 'modified';
    const nextSortDirection = persistedState.sortDirection ?? 'desc';
    const nextFilters = normalizeFilterPair(
      persistedState.kindFilter ?? 'all',
      persistedState.smartCollection ?? 'all',
    );
    const nextTileWidth = normalizeGalleryTileMinWidth(
      persistedState.galleryTileMinWidth ?? galleryTileMinWidthDefault,
    );
    const nextListScrollTop = persistedState.listScrollTop ?? 0;
    const nextGalleryScrollTop = persistedState.galleryScrollTop ?? 0;

    setViewMode(nextViewMode);
    setSortBy(nextSortBy);
    setSortDirection(nextSortDirection);
    setKindFilter(nextFilters.kindFilter);
    setSmartCollection(nextFilters.smartCollection);
    setGalleryTileMinWidth(nextTileWidth);
    setAssetsPrefix(nextPrefix);
    setListScrollTop(nextListScrollTop);
    setGalleryScrollTop(nextGalleryScrollTop);

    resetSearchState();
    setSelectedAssetKey('');
    setSelectedAssetKeys([]);
    setIsSelectionMode(false);
    setAssetActionDialog(null);
    setBulkMoveDialog(null);
    setBulkDeleteDialogKeys(null);
    resetGalleryThumbnails();

    void loadAssetsPage({
      profileId: selectedProfileId,
      prefix: nextPrefix,
      continuationToken: undefined,
      page: 1,
    });
  }, [
    galleryTileMinWidthDefault,
    loadAssetsPage,
    normalizeGalleryTileMinWidth,
    normalizePrefix,
    resetAssetsResult,
    resetGalleryThumbnails,
    resetSearchState,
    resolvePersistedUiStateForProfile,
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
    setViewMode,
  ]);
};
