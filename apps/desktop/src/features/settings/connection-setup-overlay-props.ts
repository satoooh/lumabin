import type { ComponentProps } from 'react';
import type { ConnectionSetupModal } from './connection-setup-modal';

type ConnectionSetupModalProps = ComponentProps<typeof ConnectionSetupModal>;

interface ConnectionSetupOverlayPropsInput {
  commands: {
    handleCloseConnectionSetup: ConnectionSetupModalProps['onClose'];
    handleDeleteProfile: ConnectionSetupModalProps['onDeleteProfile'];
    handleR2AccountIdChange: ConnectionSetupModalProps['onChangeR2AccountId'];
    handleSaveProfile: ConnectionSetupModalProps['onSaveProfile'];
    handleStartNewProfile: ConnectionSetupModalProps['onStartNewProfile'];
    cancelDiscardConfirmation: ConnectionSetupModalProps['onCancelDiscardChanges'];
    confirmDiscardChanges: ConnectionSetupModalProps['onConfirmDiscardChanges'];
  };
  form: {
    allowStoredSecret: ConnectionSetupModalProps['allowStoredSecret'];
    canSaveProfile: ConnectionSetupModalProps['canSaveProfile'];
    isCreatingProfile: ConnectionSetupModalProps['isCreatingProfile'];
    profileFieldErrors: ConnectionSetupModalProps['profileFieldErrors'];
    profileForm: ConnectionSetupModalProps['profileForm'];
    profileFormValidationErrors: ConnectionSetupModalProps['profileFormValidationErrors'];
    r2AccountId: ConnectionSetupModalProps['r2AccountId'];
    setProfileForm: ConnectionSetupModalProps['setProfileForm'];
  };
  refs: {
    profileAccessKeyInputRef: ConnectionSetupModalProps['profileAccessKeyInputRef'];
    profileBucketInputRef: ConnectionSetupModalProps['profileBucketInputRef'];
    profileEndpointInputRef: ConnectionSetupModalProps['profileEndpointInputRef'];
    profileNameInputRef: ConnectionSetupModalProps['profileNameInputRef'];
    profileRegionInputRef: ConnectionSetupModalProps['profileRegionInputRef'];
    profileSecretKeyInputRef: ConnectionSetupModalProps['profileSecretKeyInputRef'];
  };
  state: {
    isConnectionSetupOpen: ConnectionSetupModalProps['isOpen'];
    isDiscardConfirming: ConnectionSetupModalProps['isDiscardConfirming'];
    isProfileBusy: ConnectionSetupModalProps['isProfileBusy'];
    selectedProfileId: ConnectionSetupModalProps['selectedProfileId'];
  };
}

export const createConnectionSetupOverlayProps = ({
  commands,
  form,
  refs,
  state,
}: ConnectionSetupOverlayPropsInput): ConnectionSetupModalProps => ({
  isOpen: state.isConnectionSetupOpen,
  onClose: commands.handleCloseConnectionSetup,
  isProfileBusy: state.isProfileBusy,
  onSaveProfile: commands.handleSaveProfile,
  isCreatingProfile: form.isCreatingProfile,
  onStartNewProfile: commands.handleStartNewProfile,
  profileForm: form.profileForm,
  setProfileForm: form.setProfileForm,
  r2AccountId: form.r2AccountId,
  onChangeR2AccountId: commands.handleR2AccountIdChange,
  profileFieldErrors: form.profileFieldErrors,
  allowStoredSecret: form.allowStoredSecret,
  canSaveProfile: form.canSaveProfile,
  selectedProfileId: state.selectedProfileId,
  onDeleteProfile: commands.handleDeleteProfile,
  isDiscardConfirming: state.isDiscardConfirming,
  onCancelDiscardChanges: commands.cancelDiscardConfirmation,
  onConfirmDiscardChanges: commands.confirmDiscardChanges,
  profileFormValidationErrors: form.profileFormValidationErrors,
  profileNameInputRef: refs.profileNameInputRef,
  profileEndpointInputRef: refs.profileEndpointInputRef,
  profileRegionInputRef: refs.profileRegionInputRef,
  profileBucketInputRef: refs.profileBucketInputRef,
  profileAccessKeyInputRef: refs.profileAccessKeyInputRef,
  profileSecretKeyInputRef: refs.profileSecretKeyInputRef,
});
