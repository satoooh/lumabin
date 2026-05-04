import {
  useMemo,
  useState,
} from 'react';
import { useWorkspaceDocumentEffects } from '../layout/use-workspace-document-effects';
import { useProfileMenuState } from '../settings/use-profile-menu-state';
import {
  initialProfileForm,
  useProfileFormState,
} from '../settings/profile-form-state';
import {
  initialSettings,
  useWorkspaceSettingsState,
} from '../settings/workspace-settings-state';
import type {
  AppSettings,
  ProfileSummary,
  SaveProfileInput,
  SavedView,
} from '../../shared/ipc';

const NEW_PROFILE_OPTION_VALUE = '__new_profile__';
const MANAGE_PROFILE_OPTION_VALUE = '__manage_profile__';

export const useWorkspaceStateWorkbench = () => {
  const [profileForm, setProfileForm] = useState<SaveProfileInput>(initialProfileForm);
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(true);
  const [isConnectionSetupOpen, setIsConnectionSetupOpen] = useState<boolean>(false);
  const [r2AccountId, setR2AccountId] = useState<string>('');
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  const [isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen] = useState<boolean>(false);
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState<boolean>(false);

  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [newSavedViewName, setNewSavedViewName] = useState<string>('');
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [savedSettingsSnapshot, setSavedSettingsSnapshot] =
    useState<AppSettings>(initialSettings);

  const [isProfileBusy, setIsProfileBusy] = useState<boolean>(false);
  const [isSettingsBusy, setIsSettingsBusy] = useState<boolean>(false);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId),
    [profiles, selectedProfileId],
  );

  const {
    isProfileMenuOpen,
    profileMenuActiveIndex,
    setProfileMenuActiveIndex,
    profileMenuOptions,
    selectedProfileLabel,
    closeProfileMenu,
    openProfileMenu,
    moveProfileMenuActiveIndex,
  } = useProfileMenuState({
    profiles,
    selectedProfileId,
    selectedProfile,
    newProfileOptionValue: NEW_PROFILE_OPTION_VALUE,
    manageProfileOptionValue: MANAGE_PROFILE_OPTION_VALUE,
  });

  useWorkspaceDocumentEffects({
    appearance: settings.appearance,
    selectedProfileId,
    selectedProfileName: selectedProfile?.name,
  });

  const {
    handleAppearanceChange,
    handleDefaultConflictPolicyChange,
    handlePresignedUrlTTLSecondsChange,
    handleSelectedPublicBaseUrlChange,
    handleUploadOptimizeImagesBeforeUploadChange,
    isSettingsDirty,
    selectedPublicBaseUrl,
  } = useWorkspaceSettingsState({
    savedSettingsSnapshot,
    selectedProfileId,
    setSettings,
    settings,
  });

  const {
    allowStoredSecret,
    isProfileFormDirty,
    profileFieldErrors,
    profileFormValidationErrors,
  } = useProfileFormState({
    isCreatingProfile,
    profileForm,
    profiles,
    selectedProfile,
  });

  return {
    allowStoredSecret,
    canSaveProfile: !isProfileBusy,
    closeProfileMenu,
    handleAppearanceChange,
    handleDefaultConflictPolicyChange,
    handlePresignedUrlTTLSecondsChange,
    handleSelectedPublicBaseUrlChange,
    handleUploadOptimizeImagesBeforeUploadChange,
    initialProfileForm,
    isConnectionSetupOpen,
    isCreatingProfile,
    isProfileBusy,
    isProfileFormDirty,
    isProfileMenuOpen,
    isSettingsBusy,
    isSettingsDirty,
    isShortcutHelpOpen,
    isWorkspaceSettingsOpen,
    moveProfileMenuActiveIndex,
    manageProfileOptionValue: MANAGE_PROFILE_OPTION_VALUE,
    newSavedViewName,
    newProfileOptionValue: NEW_PROFILE_OPTION_VALUE,
    openProfileMenu,
    profileFieldErrors,
    profileForm,
    profileFormValidationErrors,
    profileMenuActiveIndex,
    profileMenuOptions,
    profiles,
    r2AccountId,
    savedSettingsSnapshot,
    savedViews,
    selectedProfile,
    selectedProfileId,
    selectedProfileLabel,
    selectedPublicBaseUrl,
    setIsConnectionSetupOpen,
    setIsCreatingProfile,
    setIsProfileBusy,
    setIsSettingsBusy,
    setIsShortcutHelpOpen,
    setIsWorkspaceSettingsOpen,
    setNewSavedViewName,
    setProfileForm,
    setProfileMenuActiveIndex,
    setProfiles,
    setR2AccountId,
    setSavedSettingsSnapshot,
    setSavedViews,
    setSelectedProfileId,
    setSettings,
    settings,
  };
};
