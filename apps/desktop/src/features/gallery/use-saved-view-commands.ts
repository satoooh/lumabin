import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { SavedView } from '../../shared/ipc';
import type { SavedViewCommandApi } from '../shared/desktop-api-gateway';
import {
  normalizeFilterPair,
  type KindFilter,
  type SmartCollection,
  type SortDirection,
  type SortField,
  type ViewMode,
} from './use-gallery-view-model';
import { parseSavedViewQuery, serializeSavedViewQuery } from './saved-view-state';

type StatusTone = 'neutral' | 'success' | 'error';

interface LoadAssetsPageOptions {
  profileId: string;
  prefix: string;
  continuationToken?: string;
  page: number;
}

interface UseSavedViewCommandsOptions {
  activeKindFilter: KindFilter;
  activeSearchQuery: string;
  activeSmartCollection: SmartCollection;
  assetsPrefix: string;
  savedViewApi: SavedViewCommandApi;
  loadAssetsPage: (options: LoadAssetsPageOptions) => Promise<void>;
  loadSavedViews: () => Promise<void>;
  newSavedViewName: string;
  runSearch: (query: string) => Promise<void>;
  searchInput: string;
  selectedProfileId: string;
  setAssetsPrefix: Dispatch<SetStateAction<string>>;
  setIsSearchBusy: Dispatch<SetStateAction<boolean>>;
  setKindFilter: Dispatch<SetStateAction<KindFilter>>;
  setNewSavedViewName: Dispatch<SetStateAction<string>>;
  setSearchInput: Dispatch<SetStateAction<string>>;
  setSmartCollection: Dispatch<SetStateAction<SmartCollection>>;
  setSortBy: Dispatch<SetStateAction<SortField>>;
  setSortDirection: Dispatch<SetStateAction<SortDirection>>;
  setStatusLine: (status: string, tone?: StatusTone) => void;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  sortBy: SortField;
  sortDirection: SortDirection;
  viewMode: ViewMode;
}

export const useSavedViewCommands = ({
  activeKindFilter,
  activeSearchQuery,
  activeSmartCollection,
  assetsPrefix,
  savedViewApi,
  loadAssetsPage,
  loadSavedViews,
  newSavedViewName,
  runSearch,
  searchInput,
  selectedProfileId,
  setAssetsPrefix,
  setIsSearchBusy,
  setKindFilter,
  setNewSavedViewName,
  setSearchInput,
  setSmartCollection,
  setSortBy,
  setSortDirection,
  setStatusLine,
  setViewMode,
  sortBy,
  sortDirection,
  viewMode,
}: UseSavedViewCommandsOptions) => {
  const handleSaveCurrentView = useCallback(async () => {
    const name = newSavedViewName.trim();
    if (!name) {
      setStatusLine('Saved view name is required.', 'error');
      return;
    }

    const query = serializeSavedViewQuery({
      prefix: assetsPrefix,
      search: activeSearchQuery || searchInput.trim(),
      viewMode,
      sortBy,
      sortDirection,
      kindFilter: activeKindFilter,
      smartCollection: activeSmartCollection,
    });

    setIsSearchBusy(true);
    try {
      await savedViewApi.saveView({
        name,
        query,
        pinned: true,
      });
      await loadSavedViews();
      setNewSavedViewName('');
      setStatusLine(`Saved view created: ${name}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Failed to save view: ${message}`, 'error');
    } finally {
      setIsSearchBusy(false);
    }
  }, [
    activeKindFilter,
    activeSearchQuery,
    activeSmartCollection,
    assetsPrefix,
    loadSavedViews,
    newSavedViewName,
    savedViewApi,
    searchInput,
    setIsSearchBusy,
    setNewSavedViewName,
    setStatusLine,
    sortBy,
    sortDirection,
    viewMode,
  ]);

  const handleApplySavedView = useCallback(
    async (view: SavedView) => {
      const parsed = parseSavedViewQuery(view.query);

      if (parsed.viewMode) {
        setViewMode(parsed.viewMode);
      }
      if (parsed.sortBy) {
        setSortBy(parsed.sortBy);
      }
      if (parsed.sortDirection) {
        setSortDirection(parsed.sortDirection);
      }
      const nextFilters = normalizeFilterPair(
        parsed.kindFilter ?? 'all',
        parsed.smartCollection ?? 'all',
      );
      setKindFilter(nextFilters.kindFilter);
      setSmartCollection(nextFilters.smartCollection);

      const nextPrefix = parsed.prefix ?? '';
      setAssetsPrefix(nextPrefix);
      setSearchInput(parsed.search ?? '');

      if (!selectedProfileId) {
        setStatusLine('Select a profile before applying saved views.', 'error');
        return;
      }

      if (parsed.search?.trim()) {
        await runSearch(parsed.search);
      } else {
        await loadAssetsPage({
          profileId: selectedProfileId,
          prefix: nextPrefix,
          continuationToken: undefined,
          page: 1,
        });
      }

      setStatusLine(`Saved view applied: ${view.name}`, 'success');
    },
    [
      loadAssetsPage,
      runSearch,
      selectedProfileId,
      setAssetsPrefix,
      setKindFilter,
      setSearchInput,
      setSmartCollection,
      setSortBy,
      setSortDirection,
      setStatusLine,
      setViewMode,
    ],
  );

  const handleDeleteSavedView = useCallback(
    async (viewId: string) => {
      setIsSearchBusy(true);
      try {
        await savedViewApi.deleteSavedView(viewId);
        await loadSavedViews();
        setStatusLine('Saved view deleted', 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setStatusLine(`Failed to delete saved view: ${message}`, 'error');
      } finally {
        setIsSearchBusy(false);
      }
    },
    [loadSavedViews, savedViewApi, setIsSearchBusy, setStatusLine],
  );

  return {
    handleApplySavedView,
    handleDeleteSavedView,
    handleSaveCurrentView,
  };
};
