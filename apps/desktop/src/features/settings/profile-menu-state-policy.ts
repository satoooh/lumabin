import type { ProfileSummary } from '../../shared/ipc';
import type { ProfileMenuOption } from '../shared/profile-menu-option';

interface BuildProfileMenuOptionsInput {
  profiles: ProfileSummary[];
  selectedProfileId: string;
  newProfileOptionValue: string;
  manageProfileOptionValue: string;
}

export const buildProfileMenuOptions = ({
  profiles,
  selectedProfileId,
  newProfileOptionValue,
  manageProfileOptionValue,
}: BuildProfileMenuOptionsInput): ProfileMenuOption[] => {
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
};

export const resolveSelectedProfileLabel = (
  selectedProfile?: ProfileSummary,
): string =>
  selectedProfile
    ? `${selectedProfile.name} (${selectedProfile.provider})`
    : 'Select…';

export const resolveInitialProfileMenuActiveIndex = (
  options: ProfileMenuOption[],
  selectedProfileId: string,
): number => {
  const selectedIndex = options.findIndex(
    (option) => option.value === selectedProfileId && !option.disabled,
  );
  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  const fallbackIndex = options.findIndex((option) => !option.disabled);
  return Math.max(0, fallbackIndex);
};

export const resolveNextProfileMenuActiveIndex = (
  options: ProfileMenuOption[],
  currentActiveIndex: number,
  direction: 1 | -1,
): number => {
  if (options.length === 0) {
    return currentActiveIndex;
  }

  const enabledIndexes = options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled)
    .map(({ index }) => index);
  if (enabledIndexes.length === 0) {
    return currentActiveIndex;
  }

  const currentEnabledPointer = Math.max(
    0,
    enabledIndexes.findIndex((index) => index === currentActiveIndex),
  );
  const nextPointer = Math.max(
    0,
    Math.min(enabledIndexes.length - 1, currentEnabledPointer + direction),
  );
  return enabledIndexes[nextPointer];
};
