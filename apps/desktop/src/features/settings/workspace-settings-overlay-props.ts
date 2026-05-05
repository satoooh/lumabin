import type { ComponentProps } from 'react';
import type {
  AppSettings,
  DevMetricsSnapshot,
  ProfileSummary,
  SavedView,
} from '../../shared/ipc';
import type { WorkspaceSettingsModal } from './workspace-settings-modal';

type WorkspaceSettingsModalProps = ComponentProps<typeof WorkspaceSettingsModal>;
type ViewMode = 'gallery' | 'list';
type SortField = 'name' | 'size' | 'modified' | 'type';
type SortDirection = 'asc' | 'desc';

export interface WorkspaceSettingsOverlayPropsInput {
  browserSession: {
    assetsPrefix: string;
    handleLoadFirstPage: () => Promise<void> | void;
    handleLoadNextPage: () => Promise<void> | void;
    handleOpenPrefix: (prefix: string) => Promise<void> | void;
    isListLoading: boolean;
    isNextPageDisabled: boolean;
    prefixes: string[];
    setAssetsPrefix: (value: string) => void;
  };
  connection: {
    handleConnectionTest: () => Promise<void> | void;
    handleOpenConnectionSetup: () => void;
    handleSelectedPublicBaseUrlChange: (value: string) => void;
    isProfileBusy: boolean;
    selectedProfile?: ProfileSummary;
    selectedProfileId: string;
    selectedPublicBaseUrl: string;
  };
  defaults: {
    handleAppearanceChange: (value: AppSettings['appearance']) => void;
    handleDefaultConflictPolicyChange: (value: AppSettings['defaultConflictPolicy']) => void;
    handlePresignedUrlTTLSecondsChange: (value: number) => void;
    handleUploadOptimizeImagesBeforeUploadChange: (value: boolean) => void;
    isSettingsBusy: boolean;
    isSettingsDirty: boolean;
    settings: AppSettings;
  };
  devMetrics: {
    devMetrics: DevMetricsSnapshot | null;
    handleCopyDevMetricsSnapshot: () => Promise<void> | void;
    handleResetDevMetrics: () => Promise<void> | void;
    headCacheHitRate: number;
    isDevEnv: boolean;
    isDevMetricsBusy: boolean;
    loadDevMetrics: () => Promise<void> | void;
    previewCacheHitRate: number;
    searchCacheHitRate: number;
  };
  formatters: {
    formatBytes: (value: number) => string;
    formatDate: (value: string) => string;
  };
  modal: {
    cancelDiscardConfirmation: WorkspaceSettingsModalProps['onCancelDiscardChanges'];
    confirmDiscardChanges: WorkspaceSettingsModalProps['onConfirmDiscardChanges'];
    handleCloseWorkspaceSettings: () => void;
    isDiscardConfirming: WorkspaceSettingsModalProps['isDiscardConfirming'];
    isWorkspaceSettingsOpen: boolean;
  };
  savedViews: {
    handleApplySavedView: (view: SavedView) => Promise<void> | void;
    handleDeleteSavedView: (viewId: string) => Promise<void> | void;
    handleSaveCurrentView: () => Promise<void> | void;
    isSearchBusy: boolean;
    newSavedViewName: string;
    savedViews: SavedView[];
    setNewSavedViewName: (value: string) => void;
  };
  saveSettings: {
    handleSaveSettings: () => Promise<void> | void;
  };
  viewDefaults: {
    setSortBy: (value: SortField) => void;
    setSortDirection: (value: SortDirection) => void;
    setViewMode: (value: ViewMode) => void;
    sortBy: SortField;
    sortDirection: SortDirection;
    viewMode: ViewMode;
  };
}

export const createWorkspaceSettingsOverlayProps = ({
  browserSession,
  connection,
  defaults,
  devMetrics,
  formatters,
  modal,
  savedViews,
  saveSettings,
  viewDefaults,
}: WorkspaceSettingsOverlayPropsInput): WorkspaceSettingsModalProps => ({
  isOpen: modal.isWorkspaceSettingsOpen,
  onClose: modal.handleCloseWorkspaceSettings,
  isDiscardConfirming: modal.isDiscardConfirming,
  onCancelDiscardChanges: modal.cancelDiscardConfirmation,
  onConfirmDiscardChanges: modal.confirmDiscardChanges,
  viewMode: viewDefaults.viewMode,
  onChangeViewMode: viewDefaults.setViewMode,
  sortBy: viewDefaults.sortBy,
  onChangeSortBy: viewDefaults.setSortBy,
  sortDirection: viewDefaults.sortDirection,
  onChangeSortDirection: viewDefaults.setSortDirection,
  savedViews: savedViews.savedViews,
  newSavedViewName: savedViews.newSavedViewName,
  onChangeNewSavedViewName: savedViews.setNewSavedViewName,
  isSearchBusy: savedViews.isSearchBusy,
  onSaveCurrentView: savedViews.handleSaveCurrentView,
  onApplySavedView: savedViews.handleApplySavedView,
  onDeleteSavedView: savedViews.handleDeleteSavedView,
  formatDate: formatters.formatDate,
  selectedProfileId: connection.selectedProfileId,
  selectedProfile: connection.selectedProfile,
  onConnectionTest: connection.handleConnectionTest,
  isProfileBusy: connection.isProfileBusy,
  onOpenConnectionSetup: connection.handleOpenConnectionSetup,
  selectedPublicBaseUrl: connection.selectedPublicBaseUrl,
  onChangePublicBaseUrl: connection.handleSelectedPublicBaseUrlChange,
  assetsPrefix: browserSession.assetsPrefix,
  onChangeAssetsPrefix: browserSession.setAssetsPrefix,
  onLoadFirstPage: browserSession.handleLoadFirstPage,
  onLoadNextPage: browserSession.handleLoadNextPage,
  isListLoading: browserSession.isListLoading,
  isNextPageDisabled: browserSession.isNextPageDisabled,
  prefixes: browserSession.prefixes,
  onOpenPrefix: browserSession.handleOpenPrefix,
  settings: defaults.settings,
  onChangeAppearance: defaults.handleAppearanceChange,
  onChangeDefaultConflictPolicy: defaults.handleDefaultConflictPolicyChange,
  onChangePresignedUrlTTLSeconds: defaults.handlePresignedUrlTTLSecondsChange,
  onChangeUploadOptimizeImagesBeforeUpload:
    defaults.handleUploadOptimizeImagesBeforeUploadChange,
  isSettingsDirty: defaults.isSettingsDirty,
  isSettingsBusy: defaults.isSettingsBusy,
  onSaveSettings: saveSettings.handleSaveSettings,
  isDevEnv: devMetrics.isDevEnv,
  isDevMetricsBusy: devMetrics.isDevMetricsBusy,
  devMetrics: devMetrics.devMetrics,
  previewCacheHitRate: devMetrics.previewCacheHitRate,
  headCacheHitRate: devMetrics.headCacheHitRate,
  searchCacheHitRate: devMetrics.searchCacheHitRate,
  formatBytes: formatters.formatBytes,
  onRefreshDevMetrics: devMetrics.loadDevMetrics,
  onResetDevMetrics: devMetrics.handleResetDevMetrics,
  onCopyDevMetricsSnapshot: devMetrics.handleCopyDevMetricsSnapshot,
});
