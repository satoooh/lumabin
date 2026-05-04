import { createRef, type SetStateAction } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createConnectionSetupOverlayProps } from '../../src/features/settings/connection-setup-overlay-props';
import type { SaveProfileInput } from '../../src/shared/ipc';

const profileForm: SaveProfileInput = {
  accessKeyId: 'access-key',
  bucket: 'lumabin-assets',
  endpoint: 'https://example.r2.cloudflarestorage.com',
  name: 'Production assets',
  provider: 'r2',
  region: 'auto',
  secretAccessKey: 'secret-key',
};

describe('connection setup overlay props', () => {
  it('maps profile setup state, commands, and refs into the modal contract', () => {
    const handleCloseConnectionSetup = vi.fn();
    const handleDeleteProfile = vi.fn();
    const handleR2AccountIdChange = vi.fn();
    const handleSaveProfile = vi.fn();
    const handleStartNewProfile = vi.fn();
    const setProfileForm = vi.fn(
      (value: SetStateAction<SaveProfileInput>) => {
        void value;
      },
    );
    const profileNameInputRef = createRef<HTMLInputElement>();
    const profileEndpointInputRef = createRef<HTMLInputElement>();
    const profileRegionInputRef = createRef<HTMLInputElement>();
    const profileBucketInputRef = createRef<HTMLInputElement>();
    const profileAccessKeyInputRef = createRef<HTMLInputElement>();
    const profileSecretKeyInputRef = createRef<HTMLInputElement>();

    const props = createConnectionSetupOverlayProps({
      state: {
        isConnectionSetupOpen: true,
        isProfileBusy: false,
        selectedProfileId: 'profile-1',
      },
      commands: {
        handleCloseConnectionSetup,
        handleDeleteProfile,
        handleR2AccountIdChange,
        handleSaveProfile,
        handleStartNewProfile,
      },
      form: {
        allowStoredSecret: true,
        canSaveProfile: true,
        isCreatingProfile: false,
        profileFieldErrors: {
          bucket: 'Bucket name is invalid',
        },
        profileForm,
        profileFormValidationErrors: ['Bucket name is invalid'],
        r2AccountId: 'account-id',
        setProfileForm,
      },
      refs: {
        profileAccessKeyInputRef,
        profileBucketInputRef,
        profileEndpointInputRef,
        profileNameInputRef,
        profileRegionInputRef,
        profileSecretKeyInputRef,
      },
    });

    props.onClose();
    props.onDeleteProfile();
    props.onChangeR2AccountId('next-account');
    props.onSaveProfile();
    props.onStartNewProfile();
    props.setProfileForm((current) => current);

    expect(props.isOpen).toBe(true);
    expect(props.isProfileBusy).toBe(false);
    expect(props.profileForm).toBe(profileForm);
    expect(props.profileFieldErrors).toEqual({
      bucket: 'Bucket name is invalid',
    });
    expect(props.profileNameInputRef).toBe(profileNameInputRef);
    expect(props.profileSecretKeyInputRef).toBe(profileSecretKeyInputRef);
    expect(handleCloseConnectionSetup).toHaveBeenCalledTimes(1);
    expect(handleDeleteProfile).toHaveBeenCalledTimes(1);
    expect(handleR2AccountIdChange).toHaveBeenCalledWith('next-account');
    expect(handleSaveProfile).toHaveBeenCalledTimes(1);
    expect(handleStartNewProfile).toHaveBeenCalledTimes(1);
    expect(setProfileForm).toHaveBeenCalledTimes(1);
  });
});
