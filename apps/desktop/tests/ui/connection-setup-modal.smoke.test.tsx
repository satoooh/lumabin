import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConnectionSetupModal } from '../../src/features/settings/connection-setup-modal';
import type { SaveProfileInput } from '../../src/shared/ipc';

const baseProfileForm: SaveProfileInput = {
  accessKeyId: 'access-key',
  bucket: 'assets',
  endpoint: 'https://example.r2.cloudflarestorage.com',
  name: 'Production assets',
  provider: 'r2',
  region: 'auto',
  secretAccessKey: 'secret-key',
};

const renderModal = (profileForm: SaveProfileInput) =>
  render(
    <ConnectionSetupModal
      allowStoredSecret={false}
      canSaveProfile={true}
      isCreatingProfile={true}
      isOpen={true}
      isProfileBusy={false}
      onChangeR2AccountId={vi.fn()}
      onClose={vi.fn()}
      onDeleteProfile={vi.fn()}
      onSaveProfile={vi.fn()}
      onStartNewProfile={vi.fn()}
      profileAccessKeyInputRef={createRef<HTMLInputElement>()}
      profileBucketInputRef={createRef<HTMLInputElement>()}
      profileEndpointInputRef={createRef<HTMLInputElement>()}
      profileFieldErrors={{}}
      profileForm={profileForm}
      profileFormValidationErrors={[]}
      profileNameInputRef={createRef<HTMLInputElement>()}
      profileRegionInputRef={createRef<HTMLInputElement>()}
      profileSecretKeyInputRef={createRef<HTMLInputElement>()}
      r2AccountId=""
      selectedProfileId=""
      setProfileForm={vi.fn()}
    />,
  );

describe('ConnectionSetupModal', () => {
  afterEach(() => {
    cleanup();
  });

  it('keeps R2-specific helpers scoped to Cloudflare R2 profiles', () => {
    renderModal(baseProfileForm);

    expect(screen.getByPlaceholderText('My R2 Profile…')).toBeTruthy();
    expect(
      screen.getByPlaceholderText('https://example-account.r2.cloudflarestorage.com'),
    ).toBeTruthy();
    expect(screen.getByLabelText('R2 Account ID')).toHaveProperty('disabled', false);
  });

  it('uses generic S3 copy when the provider is generic S3', () => {
    renderModal({
      ...baseProfileForm,
      endpoint: 'https://s3.example.com',
      name: 'Generic storage',
      provider: 's3',
      region: 'us-east-1',
    });

    expect(screen.getByPlaceholderText('My S3 Profile…')).toBeTruthy();
    expect(screen.getByPlaceholderText('https://s3.example.com')).toBeTruthy();
    expect(screen.getByLabelText('R2 Account ID')).toHaveProperty('disabled', true);
  });
});
