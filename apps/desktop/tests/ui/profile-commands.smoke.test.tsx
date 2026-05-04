import { cleanup, render } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProfileCommands } from '../../src/features/settings/use-profile-commands';
import type { ProfileCommandApi } from '../../src/features/shared/desktop-api-gateway';
import type { ProfileSummary, SaveProfileInput } from '../../src/shared/ipc';

const profileForm: SaveProfileInput = {
  name: '  Production  ',
  provider: 'r2',
  endpoint: '  https://account.r2.cloudflarestorage.com  ',
  region: ' auto ',
  bucket: ' lumabin-assets ',
  accessKeyId: ' access-key ',
  secretAccessKey: ' secret-key ',
};

const savedProfile: ProfileSummary = {
  id: 'profile-1',
  name: 'Production',
  provider: 'r2',
  endpoint: 'https://account.r2.cloudflarestorage.com',
  region: 'auto',
  bucket: 'lumabin-assets',
  hasSecret: true,
  createdAt: '2026-05-03T00:00:00.000Z',
  updatedAt: '2026-05-03T00:00:00.000Z',
};

const createProfileCommandApi = (): ProfileCommandApi => ({
  deleteProfile: vi.fn(async () => undefined),
  saveProfile: vi.fn(async () => savedProfile),
  testConnection: vi.fn(async () => ({
    checkedAt: '2026-05-03T00:00:00.000Z',
    ok: true,
    message: 'ok',
  })),
});

type ProfileCommandAction =
  | 'saveProfile'
  | 'deleteProfile'
  | 'testConnection';

interface ProbeProps {
  action: ProfileCommandAction;
  loadProfiles?: () => Promise<void>;
  onProfileDeleted?: () => void;
  profileCommandApi?: ReturnType<typeof createProfileCommandApi>;
  profileFormValidationErrors?: string[];
  selectedProfileId?: string;
  setSelectedProfileId?: (value: string) => void;
  setStatusLine?: (status: string, tone?: 'neutral' | 'success' | 'error') => void;
}

const Probe = ({
  action,
  loadProfiles = vi.fn(async () => undefined),
  onProfileDeleted = vi.fn(),
  profileCommandApi = createProfileCommandApi(),
  profileFormValidationErrors = [],
  selectedProfileId = 'profile-1',
  setSelectedProfileId = vi.fn(),
  setStatusLine = vi.fn(),
}: ProbeProps) => {
  const commands = useProfileCommands({
    focusFirstProfileValidationError: vi.fn(),
    loadProfiles,
    onProfileDeleted,
    profileCommandApi,
    profileForm,
    profileFormValidationErrors,
    selectedProfileId,
    setIsConnectionSetupOpen: vi.fn(),
    setIsCreatingProfile: vi.fn(),
    setIsProfileBusy: vi.fn(),
    setProfileForm: vi.fn(),
    setR2AccountId: vi.fn(),
    setSelectedProfileId,
    setStatusLine,
  });

  useEffect(() => {
    if (action === 'saveProfile') {
      void commands.handleSaveProfile();
      return;
    }
    if (action === 'deleteProfile') {
      void commands.handleDeleteProfile();
      return;
    }
    if (action === 'testConnection') {
      void commands.handleConnectionTest();
    }
  }, [action, commands]);

  return null;
};

describe('profile commands', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('saves a sanitized profile through the injected workspace port', async () => {
    const profileCommandApi = createProfileCommandApi();
    const setSelectedProfileId = vi.fn();
    const setStatusLine = vi.fn();

    render(
      <Probe
        action="saveProfile"
        profileCommandApi={profileCommandApi}
        setSelectedProfileId={setSelectedProfileId}
        setStatusLine={setStatusLine}
      />,
    );

    await vi.waitFor(() => {
      expect(profileCommandApi.saveProfile).toHaveBeenCalledWith({
        name: 'Production',
        provider: 'r2',
        endpoint: 'https://account.r2.cloudflarestorage.com',
        region: 'auto',
        bucket: 'lumabin-assets',
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
      });
    });
    await vi.waitFor(() => {
      expect(setSelectedProfileId).toHaveBeenCalledWith('profile-1');
      expect(setStatusLine).toHaveBeenCalledWith('Profile saved: Production', 'success');
    });
  });

  it('deletes the selected profile through the injected workspace port', async () => {
    const profileCommandApi = createProfileCommandApi();
    const loadProfiles = vi.fn(async () => undefined);
    const onProfileDeleted = vi.fn();
    const setStatusLine = vi.fn();

    render(
      <Probe
        action="deleteProfile"
        loadProfiles={loadProfiles}
        onProfileDeleted={onProfileDeleted}
        profileCommandApi={profileCommandApi}
        selectedProfileId="profile-1"
        setStatusLine={setStatusLine}
      />,
    );

    await vi.waitFor(() => {
      expect(profileCommandApi.deleteProfile).toHaveBeenCalledWith('profile-1');
    });
    await vi.waitFor(() => {
      expect(loadProfiles).toHaveBeenCalled();
      expect(onProfileDeleted).toHaveBeenCalled();
      expect(setStatusLine).toHaveBeenCalledWith('Profile deleted', 'success');
    });
  });

  it('runs connection test through the injected workspace port', async () => {
    const profileCommandApi = createProfileCommandApi();
    const setStatusLine = vi.fn();

    render(
      <Probe
        action="testConnection"
        profileCommandApi={profileCommandApi}
        selectedProfileId="profile-1"
        setStatusLine={setStatusLine}
      />,
    );

    await vi.waitFor(() => {
      expect(profileCommandApi.testConnection).toHaveBeenCalledWith('profile-1');
    });
    expect(setStatusLine).toHaveBeenCalledWith('Connection OK.', 'success');
  });
});
