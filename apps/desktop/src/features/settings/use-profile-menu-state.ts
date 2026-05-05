import { useCallback, useMemo, useState } from 'react';
import type { ProfileSummary } from '../../shared/ipc';
import {
  buildProfileMenuOptions,
  resolveInitialProfileMenuActiveIndex,
  resolveNextProfileMenuActiveIndex,
  resolveSelectedProfileLabel,
} from './profile-menu-state-policy';

interface UseProfileMenuStateOptions {
  profiles: ProfileSummary[];
  selectedProfileId: string;
  selectedProfile?: ProfileSummary;
  newProfileOptionValue: string;
  manageProfileOptionValue: string;
}

export const useProfileMenuState = ({
  profiles,
  selectedProfileId,
  selectedProfile,
  newProfileOptionValue,
  manageProfileOptionValue,
}: UseProfileMenuStateOptions) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [profileMenuActiveIndex, setProfileMenuActiveIndex] = useState<number>(0);

  const profileMenuOptions = useMemo(
    () =>
      buildProfileMenuOptions({
        profiles,
        selectedProfileId,
        newProfileOptionValue,
        manageProfileOptionValue,
      }),
    [manageProfileOptionValue, newProfileOptionValue, profiles, selectedProfileId],
  );

  const selectedProfileLabel = resolveSelectedProfileLabel(selectedProfile);

  const closeProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(false);
  }, []);

  const openProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(true);
    setProfileMenuActiveIndex(
      resolveInitialProfileMenuActiveIndex(profileMenuOptions, selectedProfileId),
    );
  }, [profileMenuOptions, selectedProfileId]);

  const moveProfileMenuActiveIndex = useCallback(
    (direction: 1 | -1) => {
      setProfileMenuActiveIndex(
        resolveNextProfileMenuActiveIndex(
          profileMenuOptions,
          profileMenuActiveIndex,
          direction,
        ),
      );
    },
    [profileMenuActiveIndex, profileMenuOptions],
  );

  return {
    isProfileMenuOpen,
    profileMenuActiveIndex,
    setProfileMenuActiveIndex,
    profileMenuOptions,
    selectedProfileLabel,
    closeProfileMenu,
    openProfileMenu,
    moveProfileMenuActiveIndex,
  };
};
