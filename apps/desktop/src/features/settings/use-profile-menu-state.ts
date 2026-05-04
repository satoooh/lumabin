import { useCallback, useMemo, useState } from 'react';
import type { ProfileSummary } from '../../shared/ipc';
import type { ProfileMenuOption } from '../shared/profile-menu-option';

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

  const profileMenuOptions = useMemo<ProfileMenuOption[]>(() => {
    const options: ProfileMenuOption[] = profiles.map((profile) => ({
      value: profile.id,
      label: `${profile.name} (${profile.provider})`,
    }));

    if (options.length === 0) {
      options.push({
        value: '__no_profiles__',
        label: 'No connections yet',
        disabled: true,
      });
    }

    options.push({
      value: newProfileOptionValue,
      label: 'New connection…',
    });

    if (selectedProfileId) {
      options.push({
        value: manageProfileOptionValue,
        label: 'Edit selected…',
      });
    }

    return options;
  }, [manageProfileOptionValue, newProfileOptionValue, profiles, selectedProfileId]);

  const selectedProfileLabel = selectedProfile
    ? `${selectedProfile.name} (${selectedProfile.provider})`
    : 'Select…';

  const closeProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(false);
  }, []);

  const openProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(true);
    const selectedIndex = profileMenuOptions.findIndex(
      (option) => option.value === selectedProfileId && !option.disabled,
    );
    const fallbackIndex = profileMenuOptions.findIndex((option) => !option.disabled);
    setProfileMenuActiveIndex(selectedIndex >= 0 ? selectedIndex : Math.max(0, fallbackIndex));
  }, [profileMenuOptions, selectedProfileId]);

  const moveProfileMenuActiveIndex = useCallback(
    (direction: 1 | -1) => {
      if (profileMenuOptions.length === 0) {
        return;
      }
      const enabledIndexes = profileMenuOptions
        .map((option, index) => ({ option, index }))
        .filter(({ option }) => !option.disabled)
        .map(({ index }) => index);
      if (enabledIndexes.length === 0) {
        return;
      }

      const currentEnabledPointer = Math.max(
        0,
        enabledIndexes.findIndex((index) => index === profileMenuActiveIndex),
      );
      const nextPointer = Math.max(
        0,
        Math.min(enabledIndexes.length - 1, currentEnabledPointer + direction),
      );
      setProfileMenuActiveIndex(enabledIndexes[nextPointer]);
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
