import { describe, expect, it } from 'vitest';
import {
  deriveProfileFieldErrors,
  r2EndpointFromAccountId,
  sanitizeProfileForSave,
  validateProfileForm,
} from '../../src/features/settings/profile-form-state';
import type { SaveProfileInput } from '../../src/shared/ipc';

const validProfile: SaveProfileInput = {
  name: 'My R2 Profile',
  provider: 'r2',
  endpoint: 'https://example.r2.cloudflarestorage.com',
  region: 'auto',
  bucket: 'my-bucket',
  accessKeyId: 'access-key',
  secretAccessKey: 'secret-key',
};

describe('profile form state', () => {
  it('builds Cloudflare R2 endpoints from account ids', () => {
    expect(r2EndpointFromAccountId('abc123def456')).toBe(
      'https://abc123def456.r2.cloudflarestorage.com',
    );
  });

  it('normalizes optional credentials before saving', () => {
    expect(
      sanitizeProfileForSave({
        ...validProfile,
        id: 'profile-1',
        name: '  Production Assets  ',
        endpoint: '  https://example.r2.cloudflarestorage.com  ',
        region: ' auto ',
        bucket: ' media-bucket ',
        accessKeyId: '   ',
        secretAccessKey: '',
      }),
    ).toEqual({
      id: 'profile-1',
      name: 'Production Assets',
      provider: 'r2',
      endpoint: 'https://example.r2.cloudflarestorage.com',
      region: 'auto',
      bucket: 'media-bucket',
      accessKeyId: undefined,
      secretAccessKey: undefined,
    });
  });

  it('allows stored credentials for an existing profile', () => {
    expect(
      validateProfileForm(
        {
          ...validProfile,
          accessKeyId: '',
          secretAccessKey: '',
        },
        { allowStoredSecret: true },
      ),
    ).toEqual([]);
  });

  it('maps validation errors to the first relevant profile field', () => {
    const errors = validateProfileForm(
      {
        ...validProfile,
        endpoint: 'http://insecure.example.com',
        bucket: 'Invalid_Bucket',
        secretAccessKey: '',
      },
      { allowStoredSecret: false },
    );

    expect(deriveProfileFieldErrors(errors)).toEqual({
      endpoint: 'Endpoint must use HTTPS.',
      bucket: 'Bucket name must be S3-compatible (lowercase letters, digits, dot, hyphen).',
      accessKeyId: 'Access Key ID and Secret Access Key must be provided together.',
    });
  });
});
