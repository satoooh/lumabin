import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useProfileSelectionActions } from '../../src/features/settings/use-profile-selection-actions';
import type { ProfileSummary } from '../../src/shared/ipc';

const profile: ProfileSummary = {
  bucket: 'lumabin-assets',
  createdAt: '2026-05-03T00:00:00.000Z',
  endpoint: 'https://example.r2.cloudflarestorage.com',
  hasSecret: true,
  id: 'profile-1',
  name: 'Production assets',
  provider: 'r2',
  region: 'auto',
  updatedAt: '2026-05-03T00:00:00.000Z',
};

describe('profile selection actions', () => {
  it('routes profile selection through a semantic profile lifecycle callback', () => {
    const closeProfileMenu = vi.fn();
    const onProfileSelected = vi.fn();
    const pushInlineFeedback = vi.fn();
    const setIsCreatingProfile = vi.fn();
    const setSelectedProfileId = vi.fn();
    const setStatusLine = vi.fn();

    const { result } = renderHook(() =>
      useProfileSelectionActions({
        closeProfileMenu,
        shouldDiscardUnsavedProfileChanges: () => true,
        handleStartNewProfile: vi.fn(),
        handleOpenConnectionSetup: vi.fn(),
        profiles: [profile],
        selectedProfileId: '',
        newProfileOptionValue: '__new_profile__',
        manageProfileOptionValue: '__manage_profile__',
        setSelectedProfileId,
        setIsCreatingProfile,
        onProfileSelected,
        setStatusLine,
        pushInlineFeedback,
        profileMenuButtonRef: createRef<HTMLButtonElement>(),
      }),
    );

    act(() => {
      result.current.handleSelectProfile(profile.id);
    });

    expect(closeProfileMenu).toHaveBeenCalledTimes(1);
    expect(setSelectedProfileId).toHaveBeenCalledWith('profile-1');
    expect(setIsCreatingProfile).toHaveBeenCalledWith(false);
    expect(onProfileSelected).toHaveBeenCalledTimes(1);
    expect(setStatusLine).toHaveBeenCalledWith(
      'Profile selected: Production assets',
      'neutral',
    );
    expect(pushInlineFeedback).toHaveBeenCalledWith('Using Production assets');
  });
});
