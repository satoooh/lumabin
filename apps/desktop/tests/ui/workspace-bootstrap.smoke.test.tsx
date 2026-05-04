import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWorkspaceBootstrap } from '../../src/features/layout/use-workspace-bootstrap';
import type {
  AppSettings,
  ProfileSummary,
  SavedView,
} from '../../src/shared/ipc';

const settings: AppSettings = {
  appearance: 'system',
  defaultConflictPolicy: 'rename',
  presignedUrlTTLSeconds: 900,
  publicBaseUrls: {},
  uploadOptimizeImagesBeforeUpload: false,
};

const profile = (id: string): ProfileSummary => ({
  id,
  name: id,
  provider: 'r2',
  endpoint: 'https://r2.example',
  region: 'auto',
  bucket: 'assets',
  createdAt: '2026-05-03T00:00:00.000Z',
  updatedAt: '2026-05-03T00:00:00.000Z',
  hasSecret: true,
});

const savedView = (id: string, pinned: boolean, updatedAt: string): SavedView => ({
  id,
  name: id,
  query: JSON.stringify({
    prefix: '',
    search: '',
    kindFilter: 'all',
    smartCollection: 'all',
    sortBy: 'modified',
    sortDirection: 'desc',
    viewMode: 'gallery',
  }),
  pinned,
  updatedAt,
});

describe('workspace bootstrap hook', () => {
  afterEach(() => {
    cleanup();
  });

  it('loads workspace data, selects the first profile when needed, and sorts saved views', async () => {
    const setProfiles = vi.fn();
    const setSavedSettingsSnapshot = vi.fn();
    const setSavedViews = vi.fn();
    const setSelectedProfileId = vi.fn();
    const setSettings = vi.fn();
    const setStatusLine = vi.fn();

    const Probe = () => {
      useWorkspaceBootstrap({
        getSettings: vi.fn(async () => settings),
        listProfiles: vi.fn(async () => [profile('profile-1')]),
        listSavedViews: vi.fn(async () => [
          savedView('latest', false, '2026-05-03T01:00:00.000Z'),
          savedView('pinned', true, '2026-05-02T01:00:00.000Z'),
        ]),
        selectedProfileId: 'missing-profile',
        setProfiles,
        setSavedSettingsSnapshot,
        setSavedViews,
        setSelectedProfileId,
        setSettings,
        setStatusLine,
      });
      return null;
    };

    render(<Probe />);

    await vi.waitFor(() => {
      expect(setStatusLine).toHaveBeenCalledWith('Ready. Conflict policy: rename', 'success');
    });
    expect(setSettings).toHaveBeenCalledWith(settings);
    expect(setSavedSettingsSnapshot).toHaveBeenCalledWith(settings);
    expect(setProfiles).toHaveBeenCalledWith([profile('profile-1')]);
    expect(setSelectedProfileId).toHaveBeenCalledWith('profile-1');
    expect(setSavedViews).toHaveBeenCalledWith([
      savedView('pinned', true, '2026-05-02T01:00:00.000Z'),
      savedView('latest', false, '2026-05-03T01:00:00.000Z'),
    ]);
  });

  it('reports bridge failures without throwing through the app root', async () => {
    const setStatusLine = vi.fn();

    const Probe = () => {
      useWorkspaceBootstrap({
        getSettings: vi.fn(async () => {
          throw new Error('bridge failed');
        }),
        listProfiles: vi.fn(),
        listSavedViews: vi.fn(),
        selectedProfileId: '',
        setProfiles: vi.fn(),
        setSavedSettingsSnapshot: vi.fn(),
        setSavedViews: vi.fn(),
        setSelectedProfileId: vi.fn(),
        setSettings: vi.fn(),
        setStatusLine,
      });
      return null;
    };

    render(<Probe />);

    await vi.waitFor(() => {
      expect(setStatusLine).toHaveBeenCalledWith('Desktop bridge unavailable.', 'error');
    });
  });
});
