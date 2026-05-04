import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { AppSettings, SaveProfileInput } from '../../shared/ipc';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseWorkspaceDialogActionsOptions {
  isConnectionSetupOpen: boolean;
  isProfileBusy: boolean;
  isProfileFormDirty: boolean;
  isWorkspaceSettingsOpen: boolean;
  isSettingsBusy: boolean;
  isSettingsDirty: boolean;
  selectedProfileId: string;
  savedSettingsSnapshot: AppSettings;
  initialProfileForm: SaveProfileInput;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  setIsWorkspaceSettingsOpen: Dispatch<SetStateAction<boolean>>;
  setIsShortcutHelpOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreatingProfile: Dispatch<SetStateAction<boolean>>;
  setProfileForm: Dispatch<SetStateAction<SaveProfileInput>>;
  setR2AccountId: Dispatch<SetStateAction<string>>;
  setIsConnectionSetupOpen: Dispatch<SetStateAction<boolean>>;
  setStatusLine: (status: string, tone?: StatusTone) => void;
}

export const useWorkspaceDialogActions = ({
  isConnectionSetupOpen,
  isProfileBusy,
  isProfileFormDirty,
  isWorkspaceSettingsOpen,
  isSettingsBusy,
  isSettingsDirty,
  selectedProfileId,
  savedSettingsSnapshot,
  initialProfileForm,
  setSettings,
  setIsWorkspaceSettingsOpen,
  setIsShortcutHelpOpen,
  setIsCreatingProfile,
  setProfileForm,
  setR2AccountId,
  setIsConnectionSetupOpen,
  setStatusLine,
}: UseWorkspaceDialogActionsOptions) => {
  const shouldDiscardUnsavedProfileChanges = useCallback((): boolean => {
    if (!isConnectionSetupOpen || isProfileBusy || !isProfileFormDirty) {
      return true;
    }
    return window.confirm('Discard unsaved profile changes?');
  }, [isConnectionSetupOpen, isProfileBusy, isProfileFormDirty]);

  const shouldDiscardUnsavedSettings = useCallback((): boolean => {
    if (!isWorkspaceSettingsOpen || isSettingsBusy || !isSettingsDirty) {
      return true;
    }
    return window.confirm('Discard unsaved workspace settings?');
  }, [isSettingsBusy, isSettingsDirty, isWorkspaceSettingsOpen]);

  const handleCloseWorkspaceSettings = useCallback(() => {
    if (!shouldDiscardUnsavedSettings()) {
      return;
    }
    if (isSettingsDirty) {
      setSettings(savedSettingsSnapshot);
      setStatusLine('Discarded unsaved workspace settings.', 'neutral');
    }
    setIsWorkspaceSettingsOpen(false);
  }, [
    isSettingsDirty,
    savedSettingsSnapshot,
    setSettings,
    setStatusLine,
    setIsWorkspaceSettingsOpen,
    shouldDiscardUnsavedSettings,
  ]);

  const handleToggleWorkspaceSettings = useCallback(() => {
    if (isWorkspaceSettingsOpen) {
      handleCloseWorkspaceSettings();
      return;
    }
    setIsWorkspaceSettingsOpen(true);
  }, [handleCloseWorkspaceSettings, isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen]);

  const handleCloseShortcutHelp = useCallback(() => {
    setIsShortcutHelpOpen(false);
  }, [setIsShortcutHelpOpen]);

  const handleToggleShortcutHelp = useCallback(() => {
    setIsShortcutHelpOpen((current) => !current);
  }, [setIsShortcutHelpOpen]);

  const handleStartNewProfile = useCallback(() => {
    if (!shouldDiscardUnsavedProfileChanges()) {
      return;
    }
    if (!shouldDiscardUnsavedSettings()) {
      return;
    }
    setIsCreatingProfile(true);
    setProfileForm(initialProfileForm);
    setR2AccountId('');
    setIsWorkspaceSettingsOpen(false);
    setIsConnectionSetupOpen(true);
    setStatusLine('New profile form.', 'neutral');
  }, [
    initialProfileForm,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
    setIsWorkspaceSettingsOpen,
    setProfileForm,
    setR2AccountId,
    setStatusLine,
    shouldDiscardUnsavedProfileChanges,
    shouldDiscardUnsavedSettings,
  ]);

  const handleOpenConnectionSetup = useCallback(() => {
    if (!shouldDiscardUnsavedSettings()) {
      return;
    }
    setIsCreatingProfile(!selectedProfileId);
    setIsWorkspaceSettingsOpen(false);
    setIsConnectionSetupOpen(true);
    setStatusLine('Setup opened.', 'neutral');
  }, [
    selectedProfileId,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
    setIsWorkspaceSettingsOpen,
    setStatusLine,
    shouldDiscardUnsavedSettings,
  ]);

  const handleCloseConnectionSetup = useCallback(() => {
    if (!shouldDiscardUnsavedProfileChanges()) {
      return;
    }
    setIsConnectionSetupOpen(false);
    if (selectedProfileId) {
      setIsCreatingProfile(false);
    }
  }, [
    selectedProfileId,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
    shouldDiscardUnsavedProfileChanges,
  ]);

  return {
    shouldDiscardUnsavedProfileChanges,
    handleCloseWorkspaceSettings,
    handleToggleWorkspaceSettings,
    handleCloseShortcutHelp,
    handleToggleShortcutHelp,
    handleStartNewProfile,
    handleOpenConnectionSetup,
    handleCloseConnectionSetup,
  };
};
