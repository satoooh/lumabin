import { cleanup, render } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProfileValidationFocus } from '../../src/features/settings/use-profile-validation-focus';

interface ProbeProps {
  errorMessage: string;
  onFocused: (id: string) => void;
}

const Probe = ({ errorMessage, onFocused }: ProbeProps) => {
  const profileNameInputRef = useRef<HTMLInputElement | null>(null);
  const profileEndpointInputRef = useRef<HTMLInputElement | null>(null);
  const profileRegionInputRef = useRef<HTMLInputElement | null>(null);
  const profileBucketInputRef = useRef<HTMLInputElement | null>(null);
  const profileAccessKeyInputRef = useRef<HTMLInputElement | null>(null);
  const profileSecretKeyInputRef = useRef<HTMLInputElement | null>(null);

  const focusFirstProfileValidationError = useProfileValidationFocus({
    profileAccessKeyInputRef,
    profileBucketInputRef,
    profileEndpointInputRef,
    profileNameInputRef,
    profileRegionInputRef,
    profileSecretKeyInputRef,
  });

  useEffect(() => {
    focusFirstProfileValidationError(errorMessage);
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLInputElement) {
      onFocused(activeElement.id);
    }
  }, [errorMessage, focusFirstProfileValidationError, onFocused]);

  return (
    <form>
      <input id="profile-name" ref={profileNameInputRef} />
      <input id="profile-endpoint" ref={profileEndpointInputRef} />
      <input id="profile-region" ref={profileRegionInputRef} />
      <input id="profile-bucket" ref={profileBucketInputRef} />
      <input id="profile-access-key" ref={profileAccessKeyInputRef} />
      <input id="profile-secret-key" ref={profileSecretKeyInputRef} />
    </form>
  );
};

describe('profile validation focus', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('focuses the matching profile input for validation errors', async () => {
    const onFocused = vi.fn();

    render(
      <Probe
        errorMessage="Secret access key is required for new profiles."
        onFocused={onFocused}
      />,
    );

    await vi.waitFor(() => {
      expect(onFocused).toHaveBeenCalledWith('profile-secret-key');
    });
  });
});
