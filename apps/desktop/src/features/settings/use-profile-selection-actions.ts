import { useCallback, type Dispatch, type RefObject, type SetStateAction } from 'react';
import type { ProfileSummary } from '../../shared/ipc';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseProfileSelectionActionsOptions {
  closeProfileMenu: () => void;
  requestDiscardUnsavedProfileChanges: (onConfirm: () => void) => boolean;
  handleStartNewProfile: () => void;
  handleOpenConnectionSetup: () => void;
  profiles: ProfileSummary[];
  selectedProfileId: string;
  newProfileOptionValue: string;
  manageProfileOptionValue: string;
  setSelectedProfileId: Dispatch<SetStateAction<string>>;
  setIsCreatingProfile: Dispatch<SetStateAction<boolean>>;
  onProfileSelected: () => void;
  setStatusLine: (status: string, tone?: StatusTone) => void;
  pushInlineFeedback: (message: string) => void;
  profileMenuButtonRef: RefObject<HTMLButtonElement | null>;
}

export const useProfileSelectionActions = ({
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
}: UseProfileSelectionActionsOptions) => {
  const handleSelectProfile = useCallback((profileId: string) => {
    closeProfileMenu();

    if (profileId === newProfileOptionValue) {
      handleStartNewProfile();
      return;
    }

    if (profileId === manageProfileOptionValue) {
      handleOpenConnectionSetup();
      return;
    }

    const selectProfile = () => {
      setSelectedProfileId(profileId);
      setIsCreatingProfile(false);
      onProfileSelected();
      const selected = profiles.find((profile) => profile.id === profileId);
      setStatusLine(
        selected ? `Profile selected: ${selected.name}` : 'Profile selected.',
        'neutral',
      );
      if (selected) {
        pushInlineFeedback(`Using ${selected.name}`);
      }
    };

    if (
      profileId !== selectedProfileId &&
      !requestDiscardUnsavedProfileChanges(selectProfile)
    ) {
      return;
    }

    selectProfile();
  }, [
    closeProfileMenu,
    handleOpenConnectionSetup,
    handleStartNewProfile,
    manageProfileOptionValue,
    newProfileOptionValue,
    onProfileSelected,
    profiles,
    pushInlineFeedback,
    selectedProfileId,
    setIsCreatingProfile,
    setSelectedProfileId,
    setStatusLine,
    requestDiscardUnsavedProfileChanges,
  ]);

  const handleProfileMenuSelect = useCallback(
    (value: string) => {
      closeProfileMenu();
      handleSelectProfile(value);
      profileMenuButtonRef.current?.focus();
    },
    [closeProfileMenu, handleSelectProfile, profileMenuButtonRef],
  );

  return {
    handleSelectProfile,
    handleProfileMenuSelect,
  };
};
