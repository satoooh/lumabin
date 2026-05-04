import { useEffect, type Dispatch, type SetStateAction } from 'react';

interface UseEmptyWorkspaceOnboardingOptions {
  hasInitialized: boolean;
  profileCount: number;
  setIsConnectionSetupOpen: Dispatch<SetStateAction<boolean>>;
}

export const shouldOpenConnectionSetupForEmptyWorkspace = (
  hasInitialized: boolean,
  profileCount: number,
): boolean => hasInitialized && profileCount === 0;

export const useEmptyWorkspaceOnboarding = ({
  hasInitialized,
  profileCount,
  setIsConnectionSetupOpen,
}: UseEmptyWorkspaceOnboardingOptions): void => {
  useEffect(() => {
    if (!shouldOpenConnectionSetupForEmptyWorkspace(hasInitialized, profileCount)) {
      return;
    }

    setIsConnectionSetupOpen(true);
  }, [hasInitialized, profileCount, setIsConnectionSetupOpen]);
};
