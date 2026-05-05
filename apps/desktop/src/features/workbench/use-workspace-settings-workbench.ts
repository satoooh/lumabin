import type {
  AppSettings,
  DevMetricsSnapshot,
  ProfileSummary,
} from '../../shared/ipc';
import type {
  WorkspaceSettingsOverlayPropsInput,
} from '../settings/workspace-settings-overlay-props';
import { createWorkspaceSettingsOverlayProps } from '../settings/workspace-settings-overlay-props';
import {
  formatBytes,
  formatDate,
} from '../shared/asset-display';

export interface WorkspaceSettingsWorkbenchOptions {
  browserSession: WorkspaceSettingsOverlayPropsInput['browserSession'];
  devMetrics: DevMetricsSnapshot | null;
  handleAppearanceChange: (value: AppSettings['appearance']) => void;
  handleCloseWorkspaceSettings: () => void;
  handleConnectionTest: () => Promise<void> | void;
  handleCopyDevMetricsSnapshot: () => Promise<void> | void;
  handleDefaultConflictPolicyChange: (value: AppSettings['defaultConflictPolicy']) => void;
  handleOpenConnectionSetup: () => void;
  handlePresignedUrlTTLSecondsChange: (value: number) => void;
  handleResetDevMetrics: () => Promise<void> | void;
  handleSaveSettings: () => Promise<void> | void;
  handleSelectedPublicBaseUrlChange: (value: string) => void;
  handleUploadOptimizeImagesBeforeUploadChange: (value: boolean) => void;
  headCacheHitRate: number;
  isDevEnv: boolean;
  isDevMetricsBusy: boolean;
  isProfileBusy: boolean;
  isSettingsBusy: boolean;
  isSettingsDirty: boolean;
  isWorkspaceSettingsOpen: boolean;
  loadDevMetrics: () => Promise<void> | void;
  previewCacheHitRate: number;
  savedViews: WorkspaceSettingsOverlayPropsInput['savedViews'];
  searchCacheHitRate: number;
  selectedProfile?: ProfileSummary;
  selectedProfileId: string;
  selectedPublicBaseUrl: string;
  settings: AppSettings;
  viewDefaults: WorkspaceSettingsOverlayPropsInput['viewDefaults'];
}

export const useWorkspaceSettingsWorkbench = ({
  browserSession,
  devMetrics,
  handleAppearanceChange,
  handleCloseWorkspaceSettings,
  handleConnectionTest,
  handleCopyDevMetricsSnapshot,
  handleDefaultConflictPolicyChange,
  handleOpenConnectionSetup,
  handlePresignedUrlTTLSecondsChange,
  handleResetDevMetrics,
  handleSaveSettings,
  handleSelectedPublicBaseUrlChange,
  handleUploadOptimizeImagesBeforeUploadChange,
  headCacheHitRate,
  isDevEnv,
  isDevMetricsBusy,
  isProfileBusy,
  isSettingsBusy,
  isSettingsDirty,
  isWorkspaceSettingsOpen,
  loadDevMetrics,
  previewCacheHitRate,
  savedViews,
  searchCacheHitRate,
  selectedProfile,
  selectedProfileId,
  selectedPublicBaseUrl,
  settings,
  viewDefaults,
}: WorkspaceSettingsWorkbenchOptions) => {
  const workspaceSettingsOverlayProps = createWorkspaceSettingsOverlayProps({
    modal: {
      isWorkspaceSettingsOpen,
      handleCloseWorkspaceSettings,
    },
    viewDefaults,
    savedViews,
    connection: {
      selectedProfileId,
      selectedProfile,
      handleConnectionTest,
      isProfileBusy,
      handleOpenConnectionSetup,
      selectedPublicBaseUrl,
      handleSelectedPublicBaseUrlChange,
    },
    browserSession,
    defaults: {
      settings,
      handleAppearanceChange,
      handleDefaultConflictPolicyChange,
      handlePresignedUrlTTLSecondsChange,
      handleUploadOptimizeImagesBeforeUploadChange,
      isSettingsDirty,
      isSettingsBusy,
    },
    saveSettings: {
      handleSaveSettings,
    },
    devMetrics: {
      isDevEnv,
      isDevMetricsBusy,
      devMetrics,
      previewCacheHitRate,
      headCacheHitRate,
      searchCacheHitRate,
      loadDevMetrics,
      handleResetDevMetrics,
      handleCopyDevMetricsSnapshot,
    },
    formatters: {
      formatBytes,
      formatDate,
    },
  });

  return {
    workspaceSettingsOverlayProps,
  };
};
