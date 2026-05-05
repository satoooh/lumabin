import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useWorkspaceDialogActions } from '../../src/features/settings/use-workspace-dialog-actions';
import type { AppSettings, SaveProfileInput } from '../../src/shared/ipc';

const savedSettingsSnapshot: AppSettings = {
  appearance: 'dark',
  defaultConflictPolicy: 'rename',
  presignedUrlTTLSeconds: 900,
  publicBaseUrls: {},
  uploadOptimizeImagesBeforeUpload: false,
};

const initialProfileForm: SaveProfileInput = {
  bucket: '',
  endpoint: '',
  name: '',
  provider: 'r2',
  region: 'auto',
};

const renderActions = (
  overrides: Partial<Parameters<typeof useWorkspaceDialogActions>[0]> = {},
) => {
  const options: Parameters<typeof useWorkspaceDialogActions>[0] = {
    initialProfileForm,
    isConnectionSetupOpen: false,
    isProfileBusy: false,
    isProfileFormDirty: false,
    isSettingsBusy: false,
    isSettingsDirty: false,
    isWorkspaceSettingsOpen: false,
    savedSettingsSnapshot,
    selectedProfileId: 'profile-1',
    setIsConnectionSetupOpen: vi.fn(),
    setIsCreatingProfile: vi.fn(),
    setIsShortcutHelpOpen: vi.fn(),
    setIsWorkspaceSettingsOpen: vi.fn(),
    setProfileForm: vi.fn(),
    setR2AccountId: vi.fn(),
    setSettings: vi.fn(),
    setStatusLine: vi.fn(),
    ...overrides,
  };

  return {
    ...renderHook(() => useWorkspaceDialogActions(options)),
    options,
  };
};

describe('workspace dialog actions', () => {
  it('uses an in-app confirmation before discarding workspace settings', () => {
    const setIsWorkspaceSettingsOpen = vi.fn();
    const setSettings = vi.fn();
    const setStatusLine = vi.fn();
    const { result } = renderActions({
      isSettingsDirty: true,
      isWorkspaceSettingsOpen: true,
      setIsWorkspaceSettingsOpen,
      setSettings,
      setStatusLine,
    });

    act(() => {
      result.current.handleCloseWorkspaceSettings();
    });

    expect(result.current.pendingDiscardConfirmation?.kind).toBe('settings');
    expect(setIsWorkspaceSettingsOpen).not.toHaveBeenCalled();

    act(() => {
      result.current.confirmDiscardChanges();
    });

    expect(setSettings).toHaveBeenCalledWith(savedSettingsSnapshot);
    expect(setStatusLine).toHaveBeenCalledWith(
      'Discarded unsaved workspace settings.',
      'neutral',
    );
    expect(setIsWorkspaceSettingsOpen).toHaveBeenCalledWith(false);
  });

  it('uses an in-app confirmation before closing a dirty connection profile', () => {
    const setIsConnectionSetupOpen = vi.fn();
    const setIsCreatingProfile = vi.fn();
    const { result } = renderActions({
      isConnectionSetupOpen: true,
      isProfileFormDirty: true,
      setIsConnectionSetupOpen,
      setIsCreatingProfile,
    });

    act(() => {
      result.current.handleCloseConnectionSetup();
    });

    expect(result.current.pendingDiscardConfirmation?.kind).toBe('profile');
    expect(setIsConnectionSetupOpen).not.toHaveBeenCalled();

    act(() => {
      result.current.confirmDiscardChanges();
    });

    expect(setIsConnectionSetupOpen).toHaveBeenCalledWith(false);
    expect(setIsCreatingProfile).toHaveBeenCalledWith(false);
  });
});
