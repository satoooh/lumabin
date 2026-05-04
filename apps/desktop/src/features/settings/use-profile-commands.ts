import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { ProfileSummary, SaveProfileInput } from '../../shared/ipc';
import type { ProfileCommandApi } from '../shared/desktop-api-gateway';
import { r2EndpointFromAccountId, sanitizeProfileForSave } from './profile-form-state';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseProfileCommandsOptions {
  focusFirstProfileValidationError: (errorMessage: string) => void;
  loadProfiles: () => Promise<void>;
  onProfileDeleted?: () => void;
  profileCommandApi: ProfileCommandApi;
  profileForm: SaveProfileInput;
  profileFormValidationErrors: string[];
  selectedProfileId: string;
  setIsConnectionSetupOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreatingProfile: Dispatch<SetStateAction<boolean>>;
  setIsProfileBusy: Dispatch<SetStateAction<boolean>>;
  setProfileForm: Dispatch<SetStateAction<SaveProfileInput>>;
  setR2AccountId: Dispatch<SetStateAction<string>>;
  setSelectedProfileId: Dispatch<SetStateAction<string>>;
  setStatusLine: (status: string, tone?: StatusTone) => void;
}

export const useProfileCommands = ({
  focusFirstProfileValidationError,
  loadProfiles,
  onProfileDeleted,
  profileCommandApi,
  profileForm,
  profileFormValidationErrors,
  selectedProfileId,
  setIsConnectionSetupOpen,
  setIsCreatingProfile,
  setIsProfileBusy,
  setProfileForm,
  setR2AccountId,
  setSelectedProfileId,
  setStatusLine,
}: UseProfileCommandsOptions) => {
  const handleSaveProfile = useCallback(async () => {
    if (profileFormValidationErrors.length > 0) {
      setStatusLine(`Profile validation failed: ${profileFormValidationErrors[0]}`, 'error');
      focusFirstProfileValidationError(profileFormValidationErrors[0]);
      return;
    }

    const sanitizedProfile = sanitizeProfileForSave(profileForm);
    setProfileForm(sanitizedProfile);
    setIsProfileBusy(true);
    setStatusLine('Saving profile…', 'neutral');
    try {
      const saved: ProfileSummary = await profileCommandApi.saveProfile(sanitizedProfile);
      await loadProfiles();
      setSelectedProfileId(saved.id);
      setIsCreatingProfile(false);
      setIsConnectionSetupOpen(false);
      setStatusLine(`Profile saved: ${saved.name}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Failed to save profile: ${message}`, 'error');
    } finally {
      setIsProfileBusy(false);
    }
  }, [
    focusFirstProfileValidationError,
    loadProfiles,
    profileCommandApi,
    profileForm,
    profileFormValidationErrors,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
    setIsProfileBusy,
    setProfileForm,
    setSelectedProfileId,
    setStatusLine,
  ]);

  const handleDeleteProfile = useCallback(async () => {
    if (!selectedProfileId) {
      return;
    }

    setIsProfileBusy(true);
    setStatusLine('Deleting profile…', 'neutral');
    try {
      await profileCommandApi.deleteProfile(selectedProfileId);
      await loadProfiles();
      onProfileDeleted?.();
      setStatusLine('Profile deleted', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Failed to delete profile: ${message}`, 'error');
    } finally {
      setIsProfileBusy(false);
    }
  }, [
    loadProfiles,
    onProfileDeleted,
    profileCommandApi,
    selectedProfileId,
    setIsProfileBusy,
    setStatusLine,
  ]);

  const handleConnectionTest = useCallback(async () => {
    if (!selectedProfileId) {
      return;
    }

    setIsProfileBusy(true);
    setStatusLine('Testing connection…', 'neutral');
    try {
      const result = await profileCommandApi.testConnection(selectedProfileId);
      if (result.ok) {
        setStatusLine('Connection OK.', 'success');
      } else {
        setStatusLine(`Connection failed: ${result.message}`, 'error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Connection test failed: ${message}`, 'error');
    } finally {
      setIsProfileBusy(false);
    }
  }, [profileCommandApi, selectedProfileId, setIsProfileBusy, setStatusLine]);

  const handleR2AccountIdChange = useCallback((value: string) => {
    const nextAccountId = value.trim();
    setR2AccountId(nextAccountId);

    if (!nextAccountId) {
      return;
    }

    setProfileForm((current) => ({
      ...current,
      endpoint: r2EndpointFromAccountId(nextAccountId),
      region: 'auto',
    }));
  }, [setProfileForm, setR2AccountId]);

  return {
    handleConnectionTest,
    handleDeleteProfile,
    handleR2AccountIdChange,
    handleSaveProfile,
  };
};
