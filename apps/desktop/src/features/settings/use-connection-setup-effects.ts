import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react';
import type { ProfileSummary, SaveProfileInput } from '../../shared/ipc';
import { extractR2AccountId } from './profile-form-state';

interface UseConnectionSetupEffectsOptions {
  isConnectionSetupOpen: boolean;
  isCreatingProfile: boolean;
  profileNameInputRef: RefObject<HTMLInputElement | null>;
  selectedProfile?: ProfileSummary;
  setProfileForm: Dispatch<SetStateAction<SaveProfileInput>>;
  setR2AccountId: Dispatch<SetStateAction<string>>;
}

export const useConnectionSetupEffects = ({
  isConnectionSetupOpen,
  isCreatingProfile,
  profileNameInputRef,
  selectedProfile,
  setProfileForm,
  setR2AccountId,
}: UseConnectionSetupEffectsOptions): void => {
  useEffect(() => {
    if (!selectedProfile || isCreatingProfile) {
      return;
    }

    setProfileForm({
      id: selectedProfile.id,
      name: selectedProfile.name,
      provider: selectedProfile.provider,
      endpoint: selectedProfile.endpoint,
      region: selectedProfile.region,
      bucket: selectedProfile.bucket,
      accessKeyId: '',
      secretAccessKey: '',
    });

    if (selectedProfile.provider === 'r2') {
      setR2AccountId(extractR2AccountId(selectedProfile.endpoint));
    } else {
      setR2AccountId('');
    }
  }, [isCreatingProfile, selectedProfile, setProfileForm, setR2AccountId]);

  useEffect(() => {
    if (!isConnectionSetupOpen) {
      return;
    }
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const timer = window.setTimeout(() => {
      profileNameInputRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isConnectionSetupOpen, isCreatingProfile, profileNameInputRef]);
};
