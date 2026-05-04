import { useEffect } from 'react';

interface UnsavedChangesBeforeUnloadState {
  isConnectionSetupOpen: boolean;
  isProfileBusy: boolean;
  isProfileFormDirty: boolean;
  isSettingsBusy: boolean;
  isSettingsDirty: boolean;
  isWorkspaceSettingsOpen: boolean;
}

export const shouldBlockBeforeUnloadForUnsavedChanges = ({
  isConnectionSetupOpen,
  isProfileBusy,
  isProfileFormDirty,
  isSettingsBusy,
  isSettingsDirty,
  isWorkspaceSettingsOpen,
}: UnsavedChangesBeforeUnloadState): boolean => {
  const hasUnsavedProfileChanges =
    isConnectionSetupOpen && !isProfileBusy && isProfileFormDirty;
  const hasUnsavedSettingsChanges =
    isWorkspaceSettingsOpen && !isSettingsBusy && isSettingsDirty;

  return hasUnsavedProfileChanges || hasUnsavedSettingsChanges;
};

export const useUnsavedChangesBeforeUnload = ({
  isConnectionSetupOpen,
  isProfileBusy,
  isProfileFormDirty,
  isSettingsBusy,
  isSettingsDirty,
  isWorkspaceSettingsOpen,
}: UnsavedChangesBeforeUnloadState): void => {
  useEffect(() => {
    if (
      !shouldBlockBeforeUnloadForUnsavedChanges({
        isConnectionSetupOpen,
        isProfileBusy,
        isProfileFormDirty,
        isSettingsBusy,
        isSettingsDirty,
        isWorkspaceSettingsOpen,
      })
    ) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [
    isConnectionSetupOpen,
    isProfileBusy,
    isProfileFormDirty,
    isSettingsBusy,
    isSettingsDirty,
    isWorkspaceSettingsOpen,
  ]);
};
