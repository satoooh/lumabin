import { createDesktopWorkbenchWorkspaceSettingsCoordinationInput } from './desktop-workbench-workspace-settings-coordination';
import type { useDesktopWorkbenchShellCoordination } from './use-desktop-workbench-shell-coordination';
import type { useDiagnosticsWorkbench } from './use-diagnostics-workbench';
import type { useGalleryBrowsingWorkbench } from './use-gallery-browsing-workbench';
import { useGallerySettingsWorkbench } from './use-gallery-settings-workbench';
import type { useWorkspaceCommandsWorkbench } from './use-workspace-commands-workbench';
import type { useWorkspaceRuntimeStateWorkbench } from './use-workspace-runtime-state-workbench';
import { useWorkspaceSettingsWorkbench } from './use-workspace-settings-workbench';
import type { useWorkspaceStateWorkbench } from './use-workspace-state-workbench';
import type { DesktopApiGateway } from '../shared/desktop-api-gateway';

type ShellUi = ReturnType<typeof useDesktopWorkbenchShellCoordination>['shellUi'];
type StatusLine = (message: string, tone?: 'neutral' | 'success' | 'error') => void;

interface UseDesktopWorkbenchWorkspaceSettingsSurfaceOptions {
  desktopApi: DesktopApiGateway;
  diagnostics: ReturnType<typeof useDiagnosticsWorkbench>;
  galleryBrowsing: ReturnType<typeof useGalleryBrowsingWorkbench>;
  runtimeState: ReturnType<typeof useWorkspaceRuntimeStateWorkbench>;
  shellUi: ShellUi;
  setStatusLine: StatusLine;
  workspaceCommands: ReturnType<typeof useWorkspaceCommandsWorkbench>;
  workspaceState: ReturnType<typeof useWorkspaceStateWorkbench>;
}

export const useDesktopWorkbenchWorkspaceSettingsSurface = ({
  desktopApi,
  diagnostics,
  galleryBrowsing,
  runtimeState,
  shellUi,
  setStatusLine,
  workspaceCommands,
  workspaceState,
}: UseDesktopWorkbenchWorkspaceSettingsSurfaceOptions) => {
  const {
    browserSession,
    savedViews,
    viewDefaults,
  } = useGallerySettingsWorkbench({
    activeKindFilter: galleryBrowsing.activeKindFilter,
    activeSearchQuery: galleryBrowsing.activeSearchQuery,
    activeSmartCollection: galleryBrowsing.activeSmartCollection,
    assetsPrefix: galleryBrowsing.assetsPrefix,
    browserPrefixes: galleryBrowsing.assetsResult.prefixes,
    handleLoadFirstPage: galleryBrowsing.handleLoadFirstPage,
    handleLoadNextPage: galleryBrowsing.handleLoadNextPage,
    handleOpenPrefix: galleryBrowsing.handleOpenPrefix,
    isListLoading: runtimeState.isListLoading,
    isNextPageDisabled: runtimeState.isNextPageDisabled,
    isSearchBusy: galleryBrowsing.isSearchBusy,
    loadAssetsPage: galleryBrowsing.loadAssetsPage,
    loadSavedViews: workspaceCommands.loadSavedViews,
    newSavedViewName: workspaceState.newSavedViewName,
    runSearch: galleryBrowsing.runSearch,
    savedViewApi: desktopApi.assetDiscovery,
    savedViews: workspaceState.savedViews,
    searchInput: galleryBrowsing.searchInput,
    selectedProfileId: workspaceState.selectedProfileId,
    setAssetsPrefix: galleryBrowsing.setAssetsPrefix,
    setIsSearchBusy: galleryBrowsing.setIsSearchBusy,
    setKindFilter: galleryBrowsing.setKindFilter,
    setNewSavedViewName: workspaceState.setNewSavedViewName,
    setSearchInput: galleryBrowsing.setSearchInput,
    setSmartCollection: galleryBrowsing.setSmartCollection,
    setSortBy: galleryBrowsing.setSortBy,
    setSortDirection: galleryBrowsing.setSortDirection,
    setStatusLine,
    setViewMode: galleryBrowsing.setViewMode,
    sortBy: galleryBrowsing.sortBy,
    sortDirection: galleryBrowsing.sortDirection,
    viewMode: galleryBrowsing.viewMode,
  });

  return useWorkspaceSettingsWorkbench(
    createDesktopWorkbenchWorkspaceSettingsCoordinationInput({
      browserSession,
      cacheMetrics: {
        headCacheHitRate: shellUi.headCacheHitRate,
        previewCacheHitRate: shellUi.previewCacheHitRate,
        searchCacheHitRate: shellUi.searchCacheHitRate,
      },
      commands: {
        handleAppearanceChange: workspaceState.handleAppearanceChange,
        handleConnectionTest: workspaceCommands.handleConnectionTest,
        handleDefaultConflictPolicyChange: workspaceState.handleDefaultConflictPolicyChange,
        handleOpenConnectionSetup: workspaceCommands.handleOpenConnectionSetup,
        handlePresignedUrlTTLSecondsChange: workspaceState.handlePresignedUrlTTLSecondsChange,
        handleSaveSettings: workspaceCommands.handleSaveSettings,
        handleSelectedPublicBaseUrlChange: workspaceState.handleSelectedPublicBaseUrlChange,
        handleUploadOptimizeImagesBeforeUploadChange:
          workspaceState.handleUploadOptimizeImagesBeforeUploadChange,
      },
      devMetrics: {
        devMetrics: diagnostics.devMetrics,
        handleCopyDevMetricsSnapshot: diagnostics.handleCopyDevMetricsSnapshot,
        handleResetDevMetrics: diagnostics.handleResetDevMetrics,
        isDevMetricsBusy: diagnostics.isDevMetricsBusy,
        isDiagnosticsEnabled: diagnostics.isDiagnosticsEnabled,
        loadDevMetrics: diagnostics.loadDevMetrics,
      },
      gallerySettings: {
        savedViews,
        viewDefaults,
      },
      modal: {
        cancelDiscardConfirmation: workspaceCommands.cancelDiscardConfirmation,
        confirmDiscardChanges: workspaceCommands.confirmDiscardChanges,
        handleCloseWorkspaceSettings: workspaceCommands.handleCloseWorkspaceSettings,
        isSettingsDiscardConfirming:
          workspaceCommands.pendingDiscardConfirmation?.kind === 'settings',
        isWorkspaceSettingsOpen: workspaceState.isWorkspaceSettingsOpen,
      },
      profile: {
        isProfileBusy: workspaceState.isProfileBusy,
        selectedProfile: workspaceState.selectedProfile,
        selectedProfileId: workspaceState.selectedProfileId,
        selectedPublicBaseUrl: workspaceState.selectedPublicBaseUrl,
      },
      settingsState: {
        isSettingsBusy: workspaceState.isSettingsBusy,
        isSettingsDirty: workspaceState.isSettingsDirty,
        settings: workspaceState.settings,
      },
    }),
  );
};
