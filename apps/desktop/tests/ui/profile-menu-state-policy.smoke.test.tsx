import { describe, expect, it } from 'vitest';
import {
  buildProfileMenuOptions,
  resolveInitialProfileMenuActiveIndex,
  resolveNextProfileMenuActiveIndex,
  resolveSelectedProfileLabel,
} from '../../src/features/settings/profile-menu-state-policy';
import type { ProfileSummary } from '../../src/shared/ipc';

const createProfile = (overrides: Partial<ProfileSummary> = {}): ProfileSummary => ({
  bucket: 'lumabin-assets',
  createdAt: '2026-05-03T00:00:00.000Z',
  endpoint: 'https://example.r2.cloudflarestorage.com',
  hasSecret: true,
  id: 'profile-1',
  name: 'Production assets',
  provider: 'r2',
  region: 'auto',
  updatedAt: '2026-05-03T00:00:00.000Z',
  ...overrides,
});

describe('profile menu state policy', () => {
  it('builds actionable profile options with empty-state and management affordances', () => {
    expect(
      buildProfileMenuOptions({
        profiles: [],
        selectedProfileId: '',
        newProfileOptionValue: '__new_profile__',
        manageProfileOptionValue: '__manage_profile__',
      }),
    ).toEqual([
      {
        value: '__no_profiles__',
        label: 'No connections yet',
        disabled: true,
      },
      {
        value: '__new_profile__',
        label: 'New connection…',
      },
    ]);

    expect(
      buildProfileMenuOptions({
        profiles: [createProfile()],
        selectedProfileId: 'profile-1',
        newProfileOptionValue: '__new_profile__',
        manageProfileOptionValue: '__manage_profile__',
      }),
    ).toEqual([
      {
        value: 'profile-1',
        label: 'Production assets (r2)',
      },
      {
        value: '__new_profile__',
        label: 'New connection…',
      },
      {
        value: '__manage_profile__',
        label: 'Edit selected…',
      },
    ]);
  });

  it('keeps the selected profile label semantic and provider-aware', () => {
    expect(resolveSelectedProfileLabel()).toBe('Select…');
    expect(resolveSelectedProfileLabel(createProfile({ provider: 's3' }))).toBe(
      'Production assets (s3)',
    );
  });

  it('opens on the selected profile or the first enabled action', () => {
    const options = [
      { value: '__no_profiles__', label: 'No connections yet', disabled: true },
      { value: '__new_profile__', label: 'New connection…' },
      { value: '__manage_profile__', label: 'Edit selected…' },
    ];

    expect(resolveInitialProfileMenuActiveIndex(options, 'missing-profile')).toBe(1);
    expect(
      resolveInitialProfileMenuActiveIndex(
        [{ value: 'profile-1', label: 'Production assets (r2)' }, ...options],
        'profile-1',
      ),
    ).toBe(0);
  });

  it('moves only through enabled options and clamps at menu edges', () => {
    const options = [
      { value: '__no_profiles__', label: 'No connections yet', disabled: true },
      { value: 'profile-1', label: 'Production assets (r2)' },
      { value: 'profile-2', label: 'Marketing assets (s3)' },
      { value: '__new_profile__', label: 'New connection…' },
    ];

    expect(resolveNextProfileMenuActiveIndex(options, 0, 1)).toBe(2);
    expect(resolveNextProfileMenuActiveIndex(options, 1, 1)).toBe(2);
    expect(resolveNextProfileMenuActiveIndex(options, 2, -1)).toBe(1);
    expect(resolveNextProfileMenuActiveIndex(options, 3, 1)).toBe(3);
    expect(resolveNextProfileMenuActiveIndex(options, 1, -1)).toBe(1);
  });
});
