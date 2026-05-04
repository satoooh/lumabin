import type { Dispatch, SetStateAction } from 'react';
import type { SavedView } from '../../shared/ipc';
import type { LoadAssetsPageOptions } from '../gallery/use-asset-browser-query-controller';
import { useSavedViewCommands } from '../gallery/use-saved-view-commands';
import type {
  KindFilter,
  SmartCollection,
  SortDirection,
  SortField,
  ViewMode,
} from '../gallery/use-gallery-view-model';
import type { DesktopApiGateway } from '../shared/desktop-api-gateway';
import type { WorkspaceSettingsOverlayPropsInput } from '../settings/workspace-settings-overlay-props';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseGallerySettingsWorkbenchOptions {
  activeKindFilter: KindFilter;
  activeSearchQuery: string;
  activeSmartCollection: SmartCollection;
  assetsPrefix: string;
  browserPrefixes: string[];
  handleLoadFirstPage: () => Promise<void> | void;
  handleLoadNextPage: () => Promise<void> | void;
  handleOpenPrefix: (prefix: string) => Promise<void> | void;
  isListLoading: boolean;
  isNextPageDisabled: boolean;
  isSearchBusy: boolean;
  loadAssetsPage: (options: LoadAssetsPageOptions) => Promise<void>;
  loadSavedViews: () => Promise<void>;
  newSavedViewName: string;
  runSearch: (query: string) => Promise<void>;
  savedViewApi: DesktopApiGateway['assetDiscovery'];
  savedViews: SavedView[];
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
  setStatusLine: (message: string, tone?: StatusTone) => void;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  sortBy: SortField;
  sortDirection: SortDirection;
  viewMode: ViewMode;
}

interface GallerySettingsWorkbench {
  browserSession: WorkspaceSettingsOverlayPropsInput['browserSession'];
  savedViews: WorkspaceSettingsOverlayPropsInput['savedViews'];
  viewDefaults: WorkspaceSettingsOverlayPropsInput['viewDefaults'];
}

export const useGallerySettingsWorkbench = ({
  activeKindFilter,
  activeSearchQuery,
  activeSmartCollection,
  assetsPrefix,
  browserPrefixes,
  handleLoadFirstPage,
  handleLoadNextPage,
  handleOpenPrefix,
  isListLoading,
  isNextPageDisabled,
  isSearchBusy,
  loadAssetsPage,
  loadSavedViews,
  newSavedViewName,
  runSearch,
  savedViewApi,
  savedViews,
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
}: UseGallerySettingsWorkbenchOptions): GallerySettingsWorkbench => {
  const {
    handleApplySavedView,
    handleDeleteSavedView,
    handleSaveCurrentView,
  } = useSavedViewCommands({
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
  });

  return {
    viewDefaults: {
      viewMode,
      setViewMode,
      sortBy,
      setSortBy,
      sortDirection,
      setSortDirection,
    },
    savedViews: {
      savedViews,
      newSavedViewName,
      setNewSavedViewName,
      isSearchBusy,
      handleSaveCurrentView,
      handleApplySavedView,
      handleDeleteSavedView,
    },
    browserSession: {
      assetsPrefix,
      setAssetsPrefix,
      handleLoadFirstPage,
      handleLoadNextPage,
      isListLoading,
      isNextPageDisabled,
      prefixes: browserPrefixes,
      handleOpenPrefix,
    },
  };
};
