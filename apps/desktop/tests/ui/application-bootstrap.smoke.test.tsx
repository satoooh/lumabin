import { describe, expect, it, vi } from 'vitest';
import {
  createPersistentStateBridge,
  ensureE2EFixtureState,
} from '../../src/main/application-bootstrap';
import type { AppSettings } from '../../src/shared/ipc';

const settings: AppSettings = {
  appearance: 'system',
  defaultConflictPolicy: 'rename',
  presignedUrlTTLSeconds: 900,
  uploadOptimizeImagesBeforeUpload: false,
  publicBaseUrls: {},
};

describe('application bootstrap', () => {
  it('hydrates and persists workspace state through injected repositories', () => {
    const hydrateSavedViews = vi.fn();
    const hydrateWorkspaceState = vi.fn();
    const replaceEncodedSecrets = vi.fn();
    const savePersistentState = vi.fn();
    const bridge = createPersistentStateBridge({
      exportEncodedSecrets: () => ({ 'profile-1': 'encoded' }),
      getSettings: () => settings,
      hydrateSavedViews,
      hydrateWorkspaceState,
      listProfiles: () => [
        {
          id: 'profile-1',
          name: 'Production',
          provider: 'r2',
          endpoint: 'https://r2.example',
          region: 'auto',
          bucket: 'assets',
          createdAt: '2026-05-03T00:00:00.000Z',
          updatedAt: '2026-05-03T00:00:00.000Z',
        },
      ],
      listSavedViews: () => [],
      loadPersistentState: () => ({
        profiles: [],
        savedViews: [],
        settings: {
          ...settings,
          publicBaseUrls: { 'profile-1': ' https://cdn.example ' },
        },
        encodedSecrets: { 'profile-1': 'encoded' },
      }),
      normalizePublicBaseUrls: () => ({ 'profile-1': 'https://cdn.example' }),
      replaceEncodedSecrets,
      savePersistentState,
    });

    bridge.hydrateState();
    expect(hydrateSavedViews).toHaveBeenCalledWith([]);
    expect(hydrateWorkspaceState).toHaveBeenCalledWith([], {
      ...settings,
      publicBaseUrls: { 'profile-1': 'https://cdn.example' },
    });
    expect(replaceEncodedSecrets).toHaveBeenCalledWith({ 'profile-1': 'encoded' });

    bridge.persistState();
    expect(savePersistentState).toHaveBeenCalledWith({
      profiles: expect.arrayContaining([expect.objectContaining({ id: 'profile-1' })]),
      savedViews: [],
      settings,
      encodedSecrets: { 'profile-1': 'encoded' },
    });
  });

  it('seeds fixture profile state only in E2E mode', () => {
    const saveProfile = vi.fn();
    const saveProfileSecret = vi.fn();
    const saveSettings = vi.fn();

    ensureE2EFixtureState({
      e2eFixtureProfileId: 'fixture-profile',
      e2eFixturePublicBaseUrl: 'https://fixture.example/assets',
      getProfile: () => undefined,
      getSettings: () => settings,
      hasProfileSecret: () => false,
      isE2EFixtureMode: true,
      nowIso: () => '2026-05-03T00:00:00.000Z',
      saveProfile,
      saveProfileSecret,
      saveSettings,
      seedE2EFixtureAssets: vi.fn(),
    });

    expect(saveProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'fixture-profile',
        name: 'E2E Fixture',
      }),
    );
    expect(saveProfileSecret).toHaveBeenCalledWith('fixture-profile', {
      accessKeyId: 'e2e-access-key',
      secretAccessKey: 'e2e-secret-key',
    });
    expect(saveSettings).toHaveBeenCalledWith({
      ...settings,
      publicBaseUrls: {
        'fixture-profile': 'https://fixture.example/assets',
      },
    });
  });
});
