import { useMemo, useState } from 'react';
import {
  GALLERY_TILE_MIN_WIDTH_DEFAULT,
  normalizeGalleryTileMinWidth,
} from './gallery-layout-policy';
import {
  loadPersistedUiStateStore,
  usePersistedUiState,
  type PersistedUiState,
  type PersistedUiStateStore,
} from './use-persisted-ui-state';
import {
  normalizeFilterPair,
  type KindFilter,
  type SmartCollection,
  type SortDirection,
  type SortField,
  type ViewMode,
} from './use-gallery-view-model';

const persistedUiStore = loadPersistedUiStateStore();

export const initialGalleryWorkspaceAssetsPrefix = persistedUiStore.global?.assetsPrefix ?? '';

interface UseGalleryWorkspacePreferencesOptions {
  assetsPrefix: string;
  persistDebounceMs: number;
  persistedStore?: PersistedUiStateStore;
  selectedProfileId: string;
}

export const useGalleryWorkspacePreferences = ({
  assetsPrefix,
  persistDebounceMs,
  persistedStore = persistedUiStore,
  selectedProfileId,
}: UseGalleryWorkspacePreferencesOptions) => {
  const persistedGlobalUiState = persistedStore.global ?? {};
  const persistedGlobalFilters = normalizeFilterPair(
    persistedGlobalUiState.kindFilter ?? 'all',
    persistedGlobalUiState.smartCollection ?? 'all',
  );

  const [viewMode, setViewMode] = useState<ViewMode>(
    persistedGlobalUiState.viewMode ?? 'gallery',
  );
  const [galleryTileMinWidth, setGalleryTileMinWidth] = useState<number>(
    normalizeGalleryTileMinWidth(
      persistedGlobalUiState.galleryTileMinWidth ?? GALLERY_TILE_MIN_WIDTH_DEFAULT,
    ),
  );
  const [sortBy, setSortBy] = useState<SortField>(persistedGlobalUiState.sortBy ?? 'modified');
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    persistedGlobalUiState.sortDirection ?? 'desc',
  );
  const [kindFilter, setKindFilter] = useState<KindFilter>(persistedGlobalFilters.kindFilter);
  const [smartCollection, setSmartCollection] = useState<SmartCollection>(
    persistedGlobalFilters.smartCollection,
  );
  const [listScrollTop, setListScrollTop] = useState<number>(
    persistedGlobalUiState.listScrollTop ?? 0,
  );
  const [galleryScrollTop, setGalleryScrollTop] = useState<number>(
    persistedGlobalUiState.galleryScrollTop ?? 0,
  );

  const currentPersistedUiState = useMemo<PersistedUiState>(
    () => ({
      viewMode,
      sortBy,
      sortDirection,
      kindFilter,
      smartCollection,
      galleryTileMinWidth,
      assetsPrefix,
      listScrollTop,
      galleryScrollTop,
    }),
    [
      assetsPrefix,
      galleryScrollTop,
      galleryTileMinWidth,
      kindFilter,
      listScrollTop,
      smartCollection,
      sortBy,
      sortDirection,
      viewMode,
    ],
  );

  const { resolvePersistedUiStateForProfile } = usePersistedUiState({
    debounceMs: persistDebounceMs,
    selectedProfileId,
    store: persistedStore,
    uiState: currentPersistedUiState,
  });

  return {
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
  };
};
