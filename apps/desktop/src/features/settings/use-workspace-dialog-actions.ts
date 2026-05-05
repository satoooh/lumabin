import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import type { AppSettings, SaveProfileInput } from '../../shared/ipc';

type StatusTone = 'neutral' | 'success' | 'error';
type DiscardConfirmationKind = 'profile' | 'settings';

interface PendingDiscardConfirmation {
  kind: DiscardConfirmationKind;
  onConfirm: () => void;
}

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
  const [pendingDiscardConfirmation, setPendingDiscardConfirmation] =
    useState<PendingDiscardConfirmation | null>(null);

  const cancelDiscardConfirmation = useCallback(() => {
    setPendingDiscardConfirmation(null);
  }, []);

  const confirmDiscardChanges = useCallback(() => {
    const action = pendingDiscardConfirmation?.onConfirm;
    setPendingDiscardConfirmation(null);
    action?.();
  }, [pendingDiscardConfirmation]);

  const requestDiscardUnsavedProfileChanges = useCallback((onConfirm: () => void): boolean => {
    if (!isConnectionSetupOpen || isProfileBusy || !isProfileFormDirty) {
      return true;
    }
    setPendingDiscardConfirmation({
      kind: 'profile',
      onConfirm,
    });
    return false;
  }, [isConnectionSetupOpen, isProfileBusy, isProfileFormDirty]);

  const requestDiscardUnsavedSettings = useCallback((onConfirm: () => void): boolean => {
    if (!isWorkspaceSettingsOpen || isSettingsBusy || !isSettingsDirty) {
      return true;
    }
    setPendingDiscardConfirmation({
      kind: 'settings',
      onConfirm,
    });
    return false;
  }, [isSettingsBusy, isSettingsDirty, isWorkspaceSettingsOpen]);

  const discardWorkspaceSettings = useCallback(() => {
    if (!isSettingsDirty) {
      return;
    }
    setSettings(savedSettingsSnapshot);
    setStatusLine('Discarded unsaved workspace settings.', 'neutral');
  }, [isSettingsDirty, savedSettingsSnapshot, setSettings, setStatusLine]);

  const handleCloseWorkspaceSettings = useCallback(() => {
    const closeWorkspaceSettings = () => {
      discardWorkspaceSettings();
      setIsWorkspaceSettingsOpen(false);
    };

    if (!requestDiscardUnsavedSettings(closeWorkspaceSettings)) {
      return;
    }
    closeWorkspaceSettings();
  }, [
    discardWorkspaceSettings,
    requestDiscardUnsavedSettings,
    setIsWorkspaceSettingsOpen,
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
    const startNewProfile = () => {
      discardWorkspaceSettings();
      setIsCreatingProfile(true);
      setProfileForm(initialProfileForm);
      setR2AccountId('');
      setIsWorkspaceSettingsOpen(false);
      setIsConnectionSetupOpen(true);
      setStatusLine('New profile form.', 'neutral');
    };

    const discardSettingsThenStartNewProfile = () => {
      if (!requestDiscardUnsavedSettings(startNewProfile)) {
        return;
      }
      startNewProfile();
    };

    if (!requestDiscardUnsavedProfileChanges(discardSettingsThenStartNewProfile)) {
      return;
    }
    if (!requestDiscardUnsavedSettings(startNewProfile)) {
      return;
    }
    startNewProfile();
  }, [
    initialProfileForm,
    discardWorkspaceSettings,
    requestDiscardUnsavedProfileChanges,
    requestDiscardUnsavedSettings,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
    setIsWorkspaceSettingsOpen,
    setProfileForm,
    setR2AccountId,
    setStatusLine,
  ]);

  const handleOpenConnectionSetup = useCallback(() => {
    const openConnectionSetup = () => {
      discardWorkspaceSettings();
      setIsCreatingProfile(!selectedProfileId);
      setIsWorkspaceSettingsOpen(false);
      setIsConnectionSetupOpen(true);
      setStatusLine('Setup opened.', 'neutral');
    };

    if (!requestDiscardUnsavedSettings(openConnectionSetup)) {
      return;
    }
    openConnectionSetup();
  }, [
    discardWorkspaceSettings,
    requestDiscardUnsavedSettings,
    selectedProfileId,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
    setIsWorkspaceSettingsOpen,
    setStatusLine,
  ]);

  const handleCloseConnectionSetup = useCallback(() => {
    const closeConnectionSetup = () => {
      setIsConnectionSetupOpen(false);
      if (selectedProfileId) {
        setIsCreatingProfile(false);
      }
    };

    if (!requestDiscardUnsavedProfileChanges(closeConnectionSetup)) {
      return;
    }
    closeConnectionSetup();
  }, [
    requestDiscardUnsavedProfileChanges,
    selectedProfileId,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
  ]);

  return {
    pendingDiscardConfirmation,
    cancelDiscardConfirmation,
    confirmDiscardChanges,
    requestDiscardUnsavedProfileChanges,
    handleCloseWorkspaceSettings,
    handleToggleWorkspaceSettings,
    handleCloseShortcutHelp,
    handleToggleShortcutHelp,
    handleStartNewProfile,
    handleOpenConnectionSetup,
    handleCloseConnectionSetup,
  };
};
