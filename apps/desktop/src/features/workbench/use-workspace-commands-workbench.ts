import type {
  Dispatch,
  RefObject,
  SetStateAction,
} from 'react';
import { useUnsavedChangesBeforeUnload } from '../layout/use-unsaved-changes-before-unload';
import { useWorkspaceBootstrap } from '../layout/use-workspace-bootstrap';
import { useConnectionSetupEffects } from '../settings/use-connection-setup-effects';
import { useEmptyWorkspaceOnboarding } from '../settings/use-empty-workspace-onboarding';
import { useLegacyPublicBaseUrlMigration } from '../settings/use-legacy-public-base-url-migration';
import { useProfileCommands } from '../settings/use-profile-commands';
import { useProfileMenuEffects } from '../settings/use-profile-menu-effects';
import { useProfileSelectionActions } from '../settings/use-profile-selection-actions';
import { useProfileValidationFocus } from '../settings/use-profile-validation-focus';
import { useWorkspaceDialogActions } from '../settings/use-workspace-dialog-actions';
import { useWorkspaceSettingsCommands } from '../settings/use-workspace-settings-commands';
import type {
  AppSettings,
  ProfileSummary,
  SaveProfileInput,
  SavedView,
} from '../../shared/ipc';
import type { DesktopApiGateway } from '../shared/desktop-api-gateway';

type StatusTone = 'neutral' | 'success' | 'error';

interface ProfileFormRefs {
  profileAccessKeyInputRef: RefObject<HTMLInputElement | null>;
  profileBucketInputRef: RefObject<HTMLInputElement | null>;
  profileEndpointInputRef: RefObject<HTMLInputElement | null>;
  profileNameInputRef: RefObject<HTMLInputElement | null>;
  profileRegionInputRef: RefObject<HTMLInputElement | null>;
  profileSecretKeyInputRef: RefObject<HTMLInputElement | null>;
}

interface UseWorkspaceCommandsWorkbenchOptions {
  closeProfileMenu: () => void;
  initialProfileForm: SaveProfileInput;
  isConnectionSetupOpen: boolean;
  isCreatingProfile: boolean;
  isProfileBusy: boolean;
  isProfileFormDirty: boolean;
  isProfileMenuOpen: boolean;
  isSettingsBusy: boolean;
  isSettingsDirty: boolean;
  isWorkspaceSettingsOpen: boolean;
  manageProfileOptionValue: string;
  newProfileOptionValue: string;
  profileForm: SaveProfileInput;
  profileFormValidationErrors: string[];
  profileFormRefs: ProfileFormRefs;
  profileMenuButtonRef: RefObject<HTMLButtonElement | null>;
  profileMenuListRef: RefObject<HTMLDivElement | null>;
  profiles: ProfileSummary[];
  pushInlineFeedback: (message: string) => void;
  onProfileDeleted: () => void;
  onProfileSelected: () => void;
  savedSettingsSnapshot: AppSettings;
  selectedProfile?: ProfileSummary;
  selectedProfileId: string;
  setIsConnectionSetupOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreatingProfile: Dispatch<SetStateAction<boolean>>;
  setIsProfileBusy: Dispatch<SetStateAction<boolean>>;
  setIsSettingsBusy: Dispatch<SetStateAction<boolean>>;
  setIsShortcutHelpOpen: Dispatch<SetStateAction<boolean>>;
  setIsWorkspaceSettingsOpen: Dispatch<SetStateAction<boolean>>;
  setProfileForm: Dispatch<SetStateAction<SaveProfileInput>>;
  setProfiles: Dispatch<SetStateAction<ProfileSummary[]>>;
  setR2AccountId: Dispatch<SetStateAction<string>>;
  setSavedSettingsSnapshot: Dispatch<SetStateAction<AppSettings>>;
  setSavedViews: Dispatch<SetStateAction<SavedView[]>>;
  setSelectedProfileId: Dispatch<SetStateAction<string>>;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  setStatusLine: (status: string, tone?: StatusTone) => void;
  settings: AppSettings;
  workspaceApi: DesktopApiGateway['workspace'];
  assetDiscoveryApi: Pick<DesktopApiGateway['assetDiscovery'], 'listSavedViews'>;
}

export const useWorkspaceCommandsWorkbench = ({
  closeProfileMenu,
  initialProfileForm,
  isConnectionSetupOpen,
  isCreatingProfile,
  isProfileBusy,
  isProfileFormDirty,
  isProfileMenuOpen,
  isSettingsBusy,
  isSettingsDirty,
  isWorkspaceSettingsOpen,
  manageProfileOptionValue,
  newProfileOptionValue,
  profileForm,
  profileFormValidationErrors,
  profileFormRefs,
  profileMenuButtonRef,
  profileMenuListRef,
  profiles,
  pushInlineFeedback,
  onProfileDeleted,
  onProfileSelected,
  savedSettingsSnapshot,
  selectedProfile,
  selectedProfileId,
  setIsConnectionSetupOpen,
  setIsCreatingProfile,
  setIsProfileBusy,
  setIsSettingsBusy,
  setIsShortcutHelpOpen,
  setIsWorkspaceSettingsOpen,
  setProfileForm,
  setProfiles,
  setR2AccountId,
  setSavedSettingsSnapshot,
  setSavedViews,
  setSelectedProfileId,
  setSettings,
  setStatusLine,
  settings,
  workspaceApi,
  assetDiscoveryApi,
}: UseWorkspaceCommandsWorkbenchOptions) => {
  const focusFirstProfileValidationError = useProfileValidationFocus({
    ...profileFormRefs,
  });

  const { hasInitialized, loadProfiles, loadSavedViews } = useWorkspaceBootstrap({
    getSettings: workspaceApi.getSettings,
    listProfiles: workspaceApi.listProfiles,
    listSavedViews: assetDiscoveryApi.listSavedViews,
    selectedProfileId,
    setProfiles,
    setSavedSettingsSnapshot,
    setSavedViews,
    setSelectedProfileId,
    setSettings,
    setStatusLine,
  });

  const {
    handleConnectionTest,
    handleDeleteProfile,
    handleR2AccountIdChange,
    handleSaveProfile,
  } = useProfileCommands({
    focusFirstProfileValidationError,
    loadProfiles,
    onProfileDeleted,
    profileCommandApi: workspaceApi,
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
  });

  const { handleSaveSettings } = useWorkspaceSettingsCommands({
    settings,
    setIsSettingsBusy,
    setSavedSettingsSnapshot,
    setSettings,
    setStatusLine,
    workspaceSettingsCommandApi: workspaceApi,
  });

  const {
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
  } = useWorkspaceDialogActions({
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
  });

  const { handleSelectProfile, handleProfileMenuSelect } = useProfileSelectionActions({
    closeProfileMenu,
    requestDiscardUnsavedProfileChanges,
    handleStartNewProfile,
    handleOpenConnectionSetup,
    profiles,
    selectedProfileId,
    newProfileOptionValue,
    manageProfileOptionValue,
    setSelectedProfileId,
    setIsCreatingProfile,
    onProfileSelected,
    setStatusLine,
    pushInlineFeedback,
    profileMenuButtonRef,
  });

  useLegacyPublicBaseUrlMigration({
    hasInitialized,
    publicBaseUrls: settings.publicBaseUrls,
    saveSettings: workspaceApi.saveSettings,
    setSavedSettingsSnapshot,
    setSettings,
  });

  useConnectionSetupEffects({
    isConnectionSetupOpen,
    isCreatingProfile,
    profileNameInputRef: profileFormRefs.profileNameInputRef,
    selectedProfile,
    setProfileForm,
    setR2AccountId,
  });

  useUnsavedChangesBeforeUnload({
    isConnectionSetupOpen,
    isProfileBusy,
    isProfileFormDirty,
    isSettingsBusy,
    isSettingsDirty,
    isWorkspaceSettingsOpen,
  });

  useProfileMenuEffects({
    closeProfileMenu,
    hasInitialized,
    isProfileMenuOpen,
    profileMenuButtonRef,
    profileMenuListRef,
    selectedProfileId,
  });

  useEmptyWorkspaceOnboarding({
    hasInitialized,
    profileCount: profiles.length,
    setIsConnectionSetupOpen,
  });

  return {
    handleCloseConnectionSetup,
    handleCloseShortcutHelp,
    handleCloseWorkspaceSettings,
    handleConnectionTest,
    handleDeleteProfile,
    handleOpenConnectionSetup,
    handleProfileMenuSelect,
    handleR2AccountIdChange,
    handleSaveProfile,
    handleSaveSettings,
    handleSelectProfile,
    handleStartNewProfile,
    handleToggleShortcutHelp,
    handleToggleWorkspaceSettings,
    hasInitialized,
    loadSavedViews,
    pendingDiscardConfirmation,
    cancelDiscardConfirmation,
    confirmDiscardChanges,
  };
};
