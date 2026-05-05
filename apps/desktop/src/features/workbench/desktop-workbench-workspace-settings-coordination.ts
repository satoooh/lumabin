import type { WorkspaceSettingsWorkbenchOptions } from './use-workspace-settings-workbench';

interface DesktopWorkbenchWorkspaceSettingsCoordinationInput {
  browserSession: WorkspaceSettingsWorkbenchOptions['browserSession'];
  cacheMetrics: Pick<
    WorkspaceSettingsWorkbenchOptions,
    'headCacheHitRate' | 'previewCacheHitRate' | 'searchCacheHitRate'
  >;
  commands: Pick<
    WorkspaceSettingsWorkbenchOptions,
    | 'handleAppearanceChange'
    | 'handleConnectionTest'
    | 'handleDefaultConflictPolicyChange'
    | 'handleOpenConnectionSetup'
    | 'handlePresignedUrlTTLSecondsChange'
    | 'handleSaveSettings'
    | 'handleSelectedPublicBaseUrlChange'
    | 'handleUploadOptimizeImagesBeforeUploadChange'
  >;
  devMetrics: Pick<
    WorkspaceSettingsWorkbenchOptions,
    | 'devMetrics'
    | 'handleCopyDevMetricsSnapshot'
    | 'handleResetDevMetrics'
    | 'isDevMetricsBusy'
    | 'loadDevMetrics'
  > & {
    isDiagnosticsEnabled: WorkspaceSettingsWorkbenchOptions['isDevEnv'];
  };
  gallerySettings: Pick<
    WorkspaceSettingsWorkbenchOptions,
    'savedViews' | 'viewDefaults'
  >;
  modal: Pick<
    WorkspaceSettingsWorkbenchOptions,
    | 'cancelDiscardConfirmation'
    | 'confirmDiscardChanges'
    | 'handleCloseWorkspaceSettings'
    | 'isSettingsDiscardConfirming'
    | 'isWorkspaceSettingsOpen'
  >;
  profile: Pick<
    WorkspaceSettingsWorkbenchOptions,
    | 'isProfileBusy'
    | 'selectedProfile'
    | 'selectedProfileId'
    | 'selectedPublicBaseUrl'
  >;
  settingsState: Pick<
    WorkspaceSettingsWorkbenchOptions,
    'isSettingsBusy' | 'isSettingsDirty' | 'settings'
  >;
}

export const createDesktopWorkbenchWorkspaceSettingsCoordinationInput = ({
  browserSession,
  cacheMetrics,
  commands,
  devMetrics,
  gallerySettings,
  modal,
  profile,
  settingsState,
}: DesktopWorkbenchWorkspaceSettingsCoordinationInput): WorkspaceSettingsWorkbenchOptions => ({
  browserSession,
  devMetrics: devMetrics.devMetrics,
  handleAppearanceChange: commands.handleAppearanceChange,
  cancelDiscardConfirmation: modal.cancelDiscardConfirmation,
  confirmDiscardChanges: modal.confirmDiscardChanges,
  handleCloseWorkspaceSettings: modal.handleCloseWorkspaceSettings,
  handleConnectionTest: commands.handleConnectionTest,
  handleCopyDevMetricsSnapshot: devMetrics.handleCopyDevMetricsSnapshot,
  handleDefaultConflictPolicyChange: commands.handleDefaultConflictPolicyChange,
  handleOpenConnectionSetup: commands.handleOpenConnectionSetup,
  handlePresignedUrlTTLSecondsChange: commands.handlePresignedUrlTTLSecondsChange,
  handleResetDevMetrics: devMetrics.handleResetDevMetrics,
  handleSaveSettings: commands.handleSaveSettings,
  handleSelectedPublicBaseUrlChange: commands.handleSelectedPublicBaseUrlChange,
  handleUploadOptimizeImagesBeforeUploadChange:
    commands.handleUploadOptimizeImagesBeforeUploadChange,
  headCacheHitRate: cacheMetrics.headCacheHitRate,
  isDevEnv: devMetrics.isDiagnosticsEnabled,
  isDevMetricsBusy: devMetrics.isDevMetricsBusy,
  isProfileBusy: profile.isProfileBusy,
  isSettingsDiscardConfirming: modal.isSettingsDiscardConfirming,
  isSettingsBusy: settingsState.isSettingsBusy,
  isSettingsDirty: settingsState.isSettingsDirty,
  isWorkspaceSettingsOpen: modal.isWorkspaceSettingsOpen,
  loadDevMetrics: devMetrics.loadDevMetrics,
  previewCacheHitRate: cacheMetrics.previewCacheHitRate,
  savedViews: gallerySettings.savedViews,
  searchCacheHitRate: cacheMetrics.searchCacheHitRate,
  selectedProfile: profile.selectedProfile,
  selectedProfileId: profile.selectedProfileId,
  selectedPublicBaseUrl: profile.selectedPublicBaseUrl,
  settings: settingsState.settings,
  viewDefaults: gallerySettings.viewDefaults,
});
