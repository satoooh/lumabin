import { describe, expect, it, vi } from 'vitest';
import {
  createWorkspaceConnectionTester,
} from '../../src/main/application/contexts/workspace/connection-service';

const profile = {
  id: 'profile-1',
  name: 'Production',
  provider: 'r2' as const,
  endpoint: 'https://r2.example',
  region: 'auto',
  bucket: 'assets',
  createdAt: '2026-05-03T00:00:00.000Z',
  updatedAt: '2026-05-03T00:00:00.000Z',
};

describe('workspace connection service', () => {
  it('returns a bounded failure when the profile is missing', async () => {
    const testConnection = createWorkspaceConnectionTester({
      checkEndpointReachability: vi.fn(),
      getProfile: () => undefined,
      getProfileSecretOrThrow: vi.fn(),
      hasProfileSecret: vi.fn(),
      nowIso: () => '2026-05-03T00:00:00.000Z',
      testStorageConnection: vi.fn(),
    });

    await expect(testConnection('missing-profile')).resolves.toEqual({
      ok: false,
      message: 'Profile not found',
      checkedAt: '2026-05-03T00:00:00.000Z',
    });
  });

  it('does not reach the endpoint when the stored secret is missing', async () => {
    const checkEndpointReachability = vi.fn();
    const testStorageConnection = vi.fn();
    const testConnection = createWorkspaceConnectionTester({
      checkEndpointReachability,
      getProfile: () => profile,
      getProfileSecretOrThrow: vi.fn(),
      hasProfileSecret: () => false,
      nowIso: () => '2026-05-03T00:00:00.000Z',
      testStorageConnection,
    });

    await expect(testConnection('profile-1')).resolves.toEqual({
      ok: false,
      message: 'Profile secret is missing',
      checkedAt: '2026-05-03T00:00:00.000Z',
    });
    expect(checkEndpointReachability).not.toHaveBeenCalled();
    expect(testStorageConnection).not.toHaveBeenCalled();
  });

  it('combines endpoint and storage success messages', async () => {
    const secret = {
      accessKeyId: 'access-key',
      secretAccessKey: 'secret-key',
    };
    const getProfileSecretOrThrow = vi.fn(() => secret);
    const testStorageConnection = vi.fn(async () => ({
      ok: true,
      message: 'Storage connection verified',
    }));
    const testConnection = createWorkspaceConnectionTester({
      checkEndpointReachability: vi.fn(async () => ({
        ok: true,
        message: 'Endpoint reachable (status 200)',
      })),
      getProfile: () => profile,
      getProfileSecretOrThrow,
      hasProfileSecret: () => true,
      nowIso: () => '2026-05-03T00:00:00.000Z',
      testStorageConnection,
    });

    await expect(testConnection('profile-1')).resolves.toEqual({
      ok: true,
      message: 'Endpoint reachable (status 200); Storage connection verified',
      checkedAt: '2026-05-03T00:00:00.000Z',
    });
    expect(getProfileSecretOrThrow).toHaveBeenCalledWith('profile-1');
    expect(testStorageConnection).toHaveBeenCalledWith(profile, secret);
  });
});
