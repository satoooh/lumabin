import { useMemo } from 'react';
import type { AssetItem, DevMetricsSnapshot } from '../../shared/ipc';

interface UseUiDerivationsOptions {
  status: string;
  isQuickPreviewOpen: boolean;
  hasUploadConflictDialog: boolean;
  hasBulkMoveDialog: boolean;
  hasBulkDeleteDialog: boolean;
  hasAssetActionDialog: boolean;
  isWorkspaceSettingsOpen: boolean;
  isShortcutHelpOpen: boolean;
  isConnectionSetupOpen: boolean;
  activeSearchQuery: string;
  assetsPrefix: string;
  searchInput: string;
  activeKindFilter: string;
  activeSmartCollection: string;
  selectedAssetKey: string;
  visibleItems: AssetItem[];
  listVirtualItems: AssetItem[];
  devMetrics: DevMetricsSnapshot | null;
  normalizePrefix: (prefix: string) => string;
}

type EmptyStateMode = 'no-assets' | 'no-matches';

export const useUiDerivations = ({
  status,
  isQuickPreviewOpen,
  hasUploadConflictDialog,
  hasBulkMoveDialog,
  hasBulkDeleteDialog,
  hasAssetActionDialog,
  isWorkspaceSettingsOpen,
  isShortcutHelpOpen,
  isConnectionSetupOpen,
  activeSearchQuery,
  assetsPrefix,
  searchInput,
  activeKindFilter,
  activeSmartCollection,
  selectedAssetKey,
  visibleItems,
  listVirtualItems,
  devMetrics,
  normalizePrefix,
}: UseUiDerivationsOptions) =>
  useMemo(() => {
    const showStatusStrip = status.length > 0;
    const hasActiveSearchQuery = Boolean(activeSearchQuery || searchInput.trim());
    const hasActiveCollectionFilters =
      activeKindFilter !== 'all' || activeSmartCollection !== 'all';
    const emptyStateMode: EmptyStateMode =
      hasActiveSearchQuery || hasActiveCollectionFilters ? 'no-matches' : 'no-assets';
    const dropOverlayPrefixLabel = normalizePrefix(assetsPrefix) || '/';
    const isAnyDialogOpen =
      isQuickPreviewOpen ||
      hasUploadConflictDialog ||
      hasBulkMoveDialog ||
      hasBulkDeleteDialog ||
      hasAssetActionDialog ||
      isWorkspaceSettingsOpen ||
      isShortcutHelpOpen ||
      isConnectionSetupOpen;

    const previewCacheTotal =
      (devMetrics?.cache.previewHit ?? 0) + (devMetrics?.cache.previewMiss ?? 0);
    const headCacheTotal = (devMetrics?.cache.headHit ?? 0) + (devMetrics?.cache.headMiss ?? 0);
    const searchCacheTotal =
      (devMetrics?.cache.searchSnapshotHit ?? 0) +
      (devMetrics?.cache.searchSnapshotMiss ?? 0);

    const previewCacheHitRate =
      previewCacheTotal > 0
        ? Math.round(((devMetrics?.cache.previewHit ?? 0) / previewCacheTotal) * 100)
        : 0;
    const headCacheHitRate =
      headCacheTotal > 0
        ? Math.round(((devMetrics?.cache.headHit ?? 0) / headCacheTotal) * 100)
        : 0;
    const searchCacheHitRate =
      searchCacheTotal > 0
        ? Math.round(((devMetrics?.cache.searchSnapshotHit ?? 0) / searchCacheTotal) * 100)
        : 0;

    const galleryRovingAssetKey = selectedAssetKey || visibleItems[0]?.key || '';
    const listRovingAssetKey =
      selectedAssetKey || listVirtualItems[0]?.key || visibleItems[0]?.key || '';

    return {
      showStatusStrip,
      hasActiveSearchQuery,
      hasActiveCollectionFilters,
      canClearSearch: hasActiveSearchQuery,
      canResetFilters: hasActiveCollectionFilters,
      emptyStateMode,
      dropOverlayPrefixLabel,
      isAnyDialogOpen,
      previewCacheHitRate,
      headCacheHitRate,
      searchCacheHitRate,
      galleryRovingAssetKey,
      listRovingAssetKey,
    };
  }, [
    assetsPrefix,
    activeKindFilter,
    activeSearchQuery,
    activeSmartCollection,
    devMetrics,
    hasAssetActionDialog,
    hasBulkDeleteDialog,
    hasBulkMoveDialog,
    hasUploadConflictDialog,
    isConnectionSetupOpen,
    isQuickPreviewOpen,
    isShortcutHelpOpen,
    isWorkspaceSettingsOpen,
    listVirtualItems,
    normalizePrefix,
    searchInput,
    selectedAssetKey,
    status,
    visibleItems,
  ]);
