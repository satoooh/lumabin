import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { WorkspaceSettingsModal } from '../../src/features/settings/workspace-settings-modal';
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

const renderModal = () => render(
  <WorkspaceSettingsModal
    assetsPrefix="photos/"
    devMetrics={null}
    formatBytes={(value) => `${value} B`}
    formatDate={(value) => value}
    headCacheHitRate={0}
    isDevEnv={true}
    isDevMetricsBusy={false}
    isListLoading={false}
    isNextPageDisabled={false}
    isOpen={true}
    isProfileBusy={false}
    isSearchBusy={false}
    isSettingsBusy={false}
    isSettingsDirty={false}
    newSavedViewName=""
    onApplySavedView={vi.fn()}
    onChangeAppearance={vi.fn()}
    onChangeAssetsPrefix={vi.fn()}
    onChangeDefaultConflictPolicy={vi.fn()}
    onChangeNewSavedViewName={vi.fn()}
    onChangePresignedUrlTTLSeconds={vi.fn()}
    onChangePublicBaseUrl={vi.fn()}
    onChangeSortBy={vi.fn()}
    onChangeSortDirection={vi.fn()}
    onChangeUploadOptimizeImagesBeforeUpload={vi.fn()}
    onChangeViewMode={vi.fn()}
    onClose={vi.fn()}
    onConnectionTest={vi.fn()}
    onCopyDevMetricsSnapshot={vi.fn()}
    onDeleteSavedView={vi.fn()}
    onLoadFirstPage={vi.fn()}
    onLoadNextPage={vi.fn()}
    onOpenConnectionSetup={vi.fn()}
    onOpenPrefix={vi.fn()}
    onRefreshDevMetrics={vi.fn()}
    onResetDevMetrics={vi.fn()}
    onSaveCurrentView={vi.fn()}
    onSaveSettings={vi.fn()}
    prefixes={['photos/2026/']}
    previewCacheHitRate={0}
    savedViews={[savedView]}
    searchCacheHitRate={0}
    selectedProfile={selectedProfile}
    selectedProfileId={selectedProfile.id}
    selectedPublicBaseUrl="https://cdn.example.com"
    settings={settings}
    sortBy="modified"
    sortDirection="desc"
    viewMode="gallery"
  />,
);

describe('WorkspaceSettingsModal', () => {
  afterEach(() => {
    cleanup();
  });

  it('organizes settings into purpose-based sections', async () => {
    const user = userEvent.setup();
    renderModal();

    const dialog = screen.getByRole('dialog', { name: 'Workspace Settings' });
    const sectionNav = within(dialog).getByRole('tablist', {
      name: 'Workspace settings sections',
    });

    expect(
      within(sectionNav).getByRole('tab', { name: /Connection profile/i }).getAttribute('aria-selected'),
    ).toBe('true');
    expect(within(dialog).getByRole('tabpanel', { name: 'Connection profile' })).toBeTruthy();

    await user.click(within(sectionNav).getByRole('tab', { name: /Workspace defaults/i }));
    expect(within(dialog).getByRole('tabpanel', { name: 'Workspace defaults' })).toBeTruthy();
    expect(within(dialog).getByRole('heading', { name: 'Workspace defaults' })).toBeTruthy();

    await user.click(within(sectionNav).getByRole('tab', { name: /Browser session/i }));
    expect(within(dialog).getByRole('tabpanel', { name: 'Browser session' })).toBeTruthy();
    expect(within(dialog).getByLabelText('View mode')).toBeTruthy();

    await user.click(within(sectionNav).getByRole('tab', { name: /Saved views/i }));
    expect(within(dialog).getByRole('tabpanel', { name: 'Saved views' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Save view' })).toBeTruthy();

    await user.click(within(sectionNav).getByRole('tab', { name: /Dev metrics/i }));
    expect(within(dialog).getByRole('tabpanel', { name: 'Dev metrics' })).toBeTruthy();
    expect(within(dialog).getByRole('heading', { name: 'Dev metrics (storage)' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Copy snapshot' })).toBeTruthy();
  });
});
