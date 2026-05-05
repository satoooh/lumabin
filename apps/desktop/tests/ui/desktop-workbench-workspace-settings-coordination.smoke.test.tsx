import { describe, expect, it, vi } from 'vitest';
import { createDesktopWorkbenchWorkspaceSettingsCoordinationInput } from '../../src/features/workbench/desktop-workbench-workspace-settings-coordination';
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

describe('desktop workbench workspace settings coordination', () => {
  it('maps grouped renderer handoff state into the workspace settings workbench contract', () => {
    const handleSaveSettings = vi.fn();
    const handleConnectionTest = vi.fn();
    const loadDevMetrics = vi.fn();

    const input = createDesktopWorkbenchWorkspaceSettingsCoordinationInput({
      browserSession: {
        assetsPrefix: 'photos/',
        handleLoadFirstPage: vi.fn(),
        handleLoadNextPage: vi.fn(),
        handleOpenPrefix: vi.fn(),
        isListLoading: false,
        isNextPageDisabled: false,
        prefixes: ['photos/2026/'],
        setAssetsPrefix: vi.fn(),
      },
      cacheMetrics: {
        headCacheHitRate: 0.25,
        previewCacheHitRate: 0.5,
        searchCacheHitRate: 0.75,
      },
      commands: {
        handleAppearanceChange: vi.fn(),
        handleConnectionTest,
        handleDefaultConflictPolicyChange: vi.fn(),
        handleOpenConnectionSetup: vi.fn(),
        handlePresignedUrlTTLSecondsChange: vi.fn(),
        handleSaveSettings,
        handleSelectedPublicBaseUrlChange: vi.fn(),
        handleUploadOptimizeImagesBeforeUploadChange: vi.fn(),
      },
      devMetrics: {
        devMetrics: null,
        handleCopyDevMetricsSnapshot: vi.fn(),
        handleResetDevMetrics: vi.fn(),
        isDevMetricsBusy: false,
        isDiagnosticsEnabled: true,
        loadDevMetrics,
      },
      gallerySettings: {
        savedViews: {
          handleApplySavedView: vi.fn(),
          handleDeleteSavedView: vi.fn(),
          handleSaveCurrentView: vi.fn(),
          isSearchBusy: false,
          newSavedViewName: 'Recent images',
          savedViews: [savedView],
          setNewSavedViewName: vi.fn(),
        },
        viewDefaults: {
          setSortBy: vi.fn(),
          setSortDirection: vi.fn(),
          setViewMode: vi.fn(),
          sortBy: 'modified',
          sortDirection: 'desc',
          viewMode: 'gallery',
        },
      },
      modal: {
        handleCloseWorkspaceSettings: vi.fn(),
        isWorkspaceSettingsOpen: true,
      },
      profile: {
        isProfileBusy: false,
        selectedProfile,
        selectedProfileId: selectedProfile.id,
        selectedPublicBaseUrl: 'https://cdn.example.com',
      },
      settingsState: {
        isSettingsBusy: false,
        isSettingsDirty: true,
        settings,
      },
    });

    expect(input.savedViews.savedViews).toEqual([savedView]);
    expect(input.viewDefaults.viewMode).toBe('gallery');
    expect(input.headCacheHitRate).toBe(0.25);
    expect(input.previewCacheHitRate).toBe(0.5);
    expect(input.searchCacheHitRate).toBe(0.75);
    expect(input.isDevEnv).toBe(true);
    expect(input.selectedProfile).toBe(selectedProfile);
    expect(input.settings).toBe(settings);
    expect(input.handleSaveSettings).toBe(handleSaveSettings);
    expect(input.handleConnectionTest).toBe(handleConnectionTest);
    expect(input.loadDevMetrics).toBe(loadDevMetrics);
  });
});
