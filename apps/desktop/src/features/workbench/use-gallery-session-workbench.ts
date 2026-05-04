import type { Dispatch, SetStateAction } from 'react';
import type { AssetItem } from '../../shared/ipc';
import type {
  AssetActionDialogState,
  BulkMoveDialogState,
} from '../gallery/action-modals';
import {
  GALLERY_TILE_MIN_WIDTH_DEFAULT,
  normalizeGalleryTileMinWidth,
} from '../gallery/gallery-layout-policy';
import type { LoadAssetsPageOptions } from '../gallery/use-asset-browser-query-controller';
import { useGalleryDialogGuards } from '../gallery/use-gallery-dialog-guards';
import { useGallerySelectionController } from '../gallery/use-gallery-selection-controller';
import type { PersistedUiState } from '../gallery/use-persisted-ui-state';
import { useSelectedProfileGalleryBootstrap } from '../gallery/use-selected-profile-gallery-bootstrap';
import type {
  KindFilter,
  SmartCollection,
  SortDirection,
  SortField,
  ViewMode,
} from '../gallery/use-gallery-view-model';
import { inferAssetKind } from '../shared/asset-display';
import { normalizeAssetPrefix } from '../shared/asset-prefix';

type SetStatusLine = (message: string, tone?: 'neutral' | 'success' | 'error') => void;

interface QuickPreviewOpenOptions {
  sourceRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  originPoint: {
    x: number;
    y: number;
  };
}

interface UseGallerySessionWorkbenchOptions {
  assetActionDialog: AssetActionDialogState | null;
  bulkDeleteDialogKeys: string[] | null;
  bulkMoveDialog: BulkMoveDialogState | null;
  isPreviewableKind: (kind: Exclude<KindFilter, 'all'>) => boolean;
  isSelectionMode: boolean;
  loadAssetsPage: (options: LoadAssetsPageOptions) => Promise<void> | void;
  openQuickPreviewForItem: (item: AssetItem, options?: QuickPreviewOpenOptions) => void;
  requestThumbnailRetry: (cacheKey: string) => void;
  resetAssetsResult: () => void;
  resetGalleryThumbnails: () => void;
  resetSearchState: () => void;
  resolvePersistedUiStateForProfile: (profileId: string) => PersistedUiState;
  selectedAssetKey: string;
  selectedProfileId: string;
  setAssetActionDialog: Dispatch<SetStateAction<AssetActionDialogState | null>>;
  setAssetsPrefix: Dispatch<SetStateAction<string>>;
  setBulkDeleteDialogKeys: Dispatch<SetStateAction<string[] | null>>;
  setBulkMoveDialog: Dispatch<SetStateAction<BulkMoveDialogState | null>>;
  setGalleryScrollTop: Dispatch<SetStateAction<number>>;
  setGalleryTileMinWidth: Dispatch<SetStateAction<number>>;
  setIsSelectionMode: Dispatch<SetStateAction<boolean>>;
  setKindFilter: Dispatch<SetStateAction<KindFilter>>;
  setListScrollTop: Dispatch<SetStateAction<number>>;
  setSelectedAssetKey: Dispatch<SetStateAction<string>>;
  setSelectedAssetKeys: Dispatch<SetStateAction<string[]>>;
  setSmartCollection: Dispatch<SetStateAction<SmartCollection>>;
  setSortBy: Dispatch<SetStateAction<SortField>>;
  setSortDirection: Dispatch<SetStateAction<SortDirection>>;
  setStatusLine: SetStatusLine;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  visibleItems: AssetItem[];
}

export const useGallerySessionWorkbench = ({
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
}: UseGallerySessionWorkbenchOptions) => {
  useSelectedProfileGalleryBootstrap({
    galleryTileMinWidthDefault: GALLERY_TILE_MIN_WIDTH_DEFAULT,
    loadAssetsPage,
    normalizeGalleryTileMinWidth,
    normalizePrefix: normalizeAssetPrefix,
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
  });

  const {
    handleAssetItemClick,
    handleAssetItemDoubleClick,
    handleSelectAllVisible,
    toggleAssetSelection,
    toggleSelectionMode,
  } = useGallerySelectionController({
    inferAssetKind,
    isPreviewableKind,
    isSelectionMode,
    openQuickPreviewForItem,
    requestThumbnailRetry,
    setIsSelectionMode,
    setSelectedAssetKey,
    setSelectedAssetKeys,
    setStatusLine,
    selectedAssetKey,
    visibleItems,
  });

  useGalleryDialogGuards({
    assetActionDialog,
    bulkDeleteDialogKeys,
    bulkMoveDialog,
    setAssetActionDialog,
    setBulkDeleteDialogKeys,
    setBulkMoveDialog,
    setSelectedAssetKeys,
    visibleItems,
  });

  return {
    handleAssetItemClick,
    handleAssetItemDoubleClick,
    handleSelectAllVisible,
    toggleAssetSelection,
    toggleSelectionMode,
  };
};
