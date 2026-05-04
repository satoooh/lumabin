import { describe, expect, it, vi } from 'vitest';
import { createWorkspaceSettingsOverlayProps } from '../../src/features/settings/workspace-settings-overlay-props';
import type {
  AppSettings,
  ProfileSummary,
  SavedView,
} from '../../src/shared/ipc';

const settings: AppSettings = {
  appearance: 'system',
  defaultConflictPolicy: 'rename',
  presignedUrlTTLSeconds: 900,
  uploadOptimizeImagesBeforeUpload: false,
  publicBaseUrls: {},
};

const selectedProfile: ProfileSummary = {
  bucket: 'lumabin-assets',
  createdAt: '2026-05-03T00:00:00.000Z',
  endpoint: 'https://example.r2.cloudflarestorage.com',
  hasSecret: true,
  id: 'profile-1',
  name: 'Production assets',
  provider: 'r2',
  region: 'auto',
  updatedAt: '2026-05-03T00:00:00.000Z',
};

const savedView: SavedView = {
  id: 'view-1',
  name: 'Images',
  pinned: false,
  query: 'kind:image',
  updatedAt: '2026-05-03T00:00:00.000Z',
};

describe('workspace settings overlay props', () => {
  it('maps workspace settings state and commands into the modal contract', () => {
    const handleCloseWorkspaceSettings = vi.fn();
    const setViewMode = vi.fn();
    const setSortBy = vi.fn();
    const setSortDirection = vi.fn();
    const setNewSavedViewName = vi.fn();
    const handleSaveCurrentView = vi.fn();
    const handleApplySavedView = vi.fn();
    const handleDeleteSavedView = vi.fn();
    const handleConnectionTest = vi.fn();
    const handleOpenConnectionSetup = vi.fn();
    const handleSelectedPublicBaseUrlChange = vi.fn();
    const setAssetsPrefix = vi.fn();
    const handleLoadFirstPage = vi.fn();
    const handleLoadNextPage = vi.fn();
    const handleOpenPrefix = vi.fn();
    const handleAppearanceChange = vi.fn();
    const handleDefaultConflictPolicyChange = vi.fn();
    const handlePresignedUrlTTLSecondsChange = vi.fn();
    const handleUploadOptimizeImagesBeforeUploadChange = vi.fn();
    const handleSaveSettings = vi.fn();
    const loadDevMetrics = vi.fn();
    const handleResetDevMetrics = vi.fn();
    const handleCopyDevMetricsSnapshot = vi.fn();

    const props = createWorkspaceSettingsOverlayProps({
      modal: {
        isWorkspaceSettingsOpen: true,
        handleCloseWorkspaceSettings,
      },
      viewDefaults: {
        viewMode: 'gallery',
        setViewMode,
        sortBy: 'modified',
        setSortBy,
        sortDirection: 'desc',
        setSortDirection,
      },
      savedViews: {
        savedViews: [savedView],
        newSavedViewName: 'Recent images',
        setNewSavedViewName,
        isSearchBusy: false,
        handleSaveCurrentView,
        handleApplySavedView,
        handleDeleteSavedView,
      },
      connection: {
        selectedProfileId: selectedProfile.id,
        selectedProfile,
        handleConnectionTest,
        isProfileBusy: false,
        handleOpenConnectionSetup,
        selectedPublicBaseUrl: 'https://cdn.example.com',
        handleSelectedPublicBaseUrlChange,
      },
      browserSession: {
        assetsPrefix: 'photos/',
        setAssetsPrefix,
        handleLoadFirstPage,
        handleLoadNextPage,
        isListLoading: false,
        isNextPageDisabled: false,
        prefixes: ['photos/2026/'],
        handleOpenPrefix,
      },
      defaults: {
        settings,
        handleAppearanceChange,
        handleDefaultConflictPolicyChange,
        handlePresignedUrlTTLSecondsChange,
        handleUploadOptimizeImagesBeforeUploadChange,
        isSettingsDirty: true,
        isSettingsBusy: false,
      },
      saveSettings: {
        handleSaveSettings,
      },
      devMetrics: {
        isDevEnv: true,
        isDevMetricsBusy: false,
        devMetrics: null,
        previewCacheHitRate: 0.5,
        headCacheHitRate: 0.25,
        searchCacheHitRate: 0.75,
        loadDevMetrics,
        handleResetDevMetrics,
        handleCopyDevMetricsSnapshot,
      },
      formatters: {
        formatBytes: (value) => `${value} B`,
        formatDate: (value) => value,
      },
    });

    props.onClose();
    props.onChangeViewMode('list');
    props.onChangeSortBy('name');
    props.onChangeSortDirection('asc');
    props.onChangeNewSavedViewName('Pinned');
    props.onSaveCurrentView();
    props.onApplySavedView(savedView);
    props.onDeleteSavedView(savedView.id);
    props.onConnectionTest();
    props.onOpenConnectionSetup();
    props.onChangePublicBaseUrl('https://cdn.example.com/new');
    props.onChangeAssetsPrefix('photos/2026/');
    props.onLoadFirstPage();
    props.onLoadNextPage();
    props.onOpenPrefix('photos/2026/');
    props.onChangeAppearance('dark');
    props.onChangeDefaultConflictPolicy('overwrite');
    props.onChangePresignedUrlTTLSeconds(1200);
    props.onChangeUploadOptimizeImagesBeforeUpload(true);
    props.onSaveSettings();
    props.onRefreshDevMetrics();
    props.onResetDevMetrics();
    props.onCopyDevMetricsSnapshot();

    expect(props.isOpen).toBe(true);
    expect(props.savedViews).toEqual([savedView]);
    expect(props.selectedProfile).toBe(selectedProfile);
    expect(props.prefixes).toEqual(['photos/2026/']);
    expect(props.settings).toBe(settings);
    expect(props.previewCacheHitRate).toBe(0.5);
    expect(handleCloseWorkspaceSettings).toHaveBeenCalledTimes(1);
    expect(setViewMode).toHaveBeenCalledWith('list');
    expect(setSortBy).toHaveBeenCalledWith('name');
    expect(setSortDirection).toHaveBeenCalledWith('asc');
    expect(setNewSavedViewName).toHaveBeenCalledWith('Pinned');
    expect(handleSaveCurrentView).toHaveBeenCalledTimes(1);
    expect(handleApplySavedView).toHaveBeenCalledWith(savedView);
    expect(handleDeleteSavedView).toHaveBeenCalledWith('view-1');
    expect(handleConnectionTest).toHaveBeenCalledTimes(1);
    expect(handleOpenConnectionSetup).toHaveBeenCalledTimes(1);
    expect(handleSelectedPublicBaseUrlChange).toHaveBeenCalledWith(
      'https://cdn.example.com/new',
    );
    expect(setAssetsPrefix).toHaveBeenCalledWith('photos/2026/');
    expect(handleLoadFirstPage).toHaveBeenCalledTimes(1);
    expect(handleLoadNextPage).toHaveBeenCalledTimes(1);
    expect(handleOpenPrefix).toHaveBeenCalledWith('photos/2026/');
    expect(handleAppearanceChange).toHaveBeenCalledWith('dark');
    expect(handleDefaultConflictPolicyChange).toHaveBeenCalledWith('overwrite');
    expect(handlePresignedUrlTTLSecondsChange).toHaveBeenCalledWith(1200);
    expect(handleUploadOptimizeImagesBeforeUploadChange).toHaveBeenCalledWith(true);
    expect(handleSaveSettings).toHaveBeenCalledTimes(1);
    expect(loadDevMetrics).toHaveBeenCalledTimes(1);
    expect(handleResetDevMetrics).toHaveBeenCalledTimes(1);
    expect(handleCopyDevMetricsSnapshot).toHaveBeenCalledTimes(1);
  });
});
