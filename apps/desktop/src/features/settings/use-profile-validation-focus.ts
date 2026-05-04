import { useCallback, type RefObject } from 'react';
import { resolveProfileValidationField } from './profile-form-state';

interface UseProfileValidationFocusOptions {
  profileAccessKeyInputRef: RefObject<HTMLInputElement | null>;
  profileBucketInputRef: RefObject<HTMLInputElement | null>;
  profileEndpointInputRef: RefObject<HTMLInputElement | null>;
  profileNameInputRef: RefObject<HTMLInputElement | null>;
  profileRegionInputRef: RefObject<HTMLInputElement | null>;
  profileSecretKeyInputRef: RefObject<HTMLInputElement | null>;
}

export const useProfileValidationFocus = ({
  profileAccessKeyInputRef,
  profileBucketInputRef,
  profileEndpointInputRef,
  profileNameInputRef,
  profileRegionInputRef,
  profileSecretKeyInputRef,
}: UseProfileValidationFocusOptions) =>
  useCallback((errorMessage: string) => {
    const field = resolveProfileValidationField(errorMessage);
    if (field === 'name') {
      profileNameInputRef.current?.focus();
    } else if (field === 'endpoint') {
      profileEndpointInputRef.current?.focus();
    } else if (field === 'region') {
      profileRegionInputRef.current?.focus();
    } else if (field === 'bucket') {
      profileBucketInputRef.current?.focus();
    } else if (field === 'accessKeyId') {
      profileAccessKeyInputRef.current?.focus();
    } else if (field === 'secretAccessKey') {
      profileSecretKeyInputRef.current?.focus();
    }
  }, [
    profileAccessKeyInputRef,
    profileBucketInputRef,
    profileEndpointInputRef,
    profileNameInputRef,
    profileRegionInputRef,
    profileSecretKeyInputRef,
  ]);
