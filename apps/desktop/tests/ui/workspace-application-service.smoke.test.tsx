import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  createWorkspaceApplicationService,
  type WorkspaceApplicationServiceDependencies,
} from '../../src/main/application/contexts/workspace/application-service';

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

const settings = {
  appearance: 'system' as const,
  defaultConflictPolicy: 'rename' as const,
  presignedUrlTTLSeconds: 3600,
  uploadOptimizeImagesBeforeUpload: false,
  publicBaseUrls: {},
};

const createDependencies = (
  overrides: Partial<WorkspaceApplicationServiceDependencies> = {},
): WorkspaceApplicationServiceDependencies => ({
  clearProfileCaches: vi.fn(),
  createProfileId: vi.fn(() => 'profile-new'),
  deleteProfileOverride: vi.fn(() => false),
  getProfile: vi.fn((profileId) => (profileId === profile.id ? profile : undefined)),
  getSettings: vi.fn(() => settings),
  hasProfileSecret: vi.fn(() => true),
  listProfiles: vi.fn(() => [profile]),
  normalizePublicBaseUrls: vi.fn((value) => value as Record<string, string>),
  nowIso: vi.fn(() => '2026-05-03T00:00:00.000Z'),
  persistState: vi.fn(),
  publishApplicationEvent: vi.fn(),
  removeProfile: vi.fn(),
  removeProfileSecret: vi.fn(),
  saveProfile: vi.fn(),
  saveProfileSecret: vi.fn(),
  saveSettings: vi.fn(),
  testConnection: vi.fn(async () => ({
    ok: true,
    message: 'Storage connection is ready.',
    checkedAt: '2026-05-03T00:00:00.000Z',
  })),
  testConnectionOverride: vi.fn(() => undefined),
  ...overrides,
});

describe('workspace application service', () => {
  it('uses the runtime connection override before storage access', async () => {
    const overrideResult = {
      ok: true,
      message: 'Runtime profile is ready.',
      checkedAt: '2026-05-03T00:00:00.000Z',
    };
    const dependencies = createDependencies({
      testConnectionOverride: vi.fn(() => overrideResult),
    });
    const service = createWorkspaceApplicationService(dependencies);

    await expect(service.testConnection('runtime-profile')).resolves.toBe(overrideResult);

    expect(dependencies.testConnection).not.toHaveBeenCalled();
  });

  it('uses the runtime delete override before mutating profile storage', () => {
    const dependencies = createDependencies({
      deleteProfileOverride: vi.fn(() => true),
    });
    const service = createWorkspaceApplicationService(dependencies);

    service.deleteProfile('runtime-profile');

    expect(dependencies.clearProfileCaches).not.toHaveBeenCalled();
    expect(dependencies.removeProfile).not.toHaveBeenCalled();
    expect(dependencies.removeProfileSecret).not.toHaveBeenCalled();
    expect(dependencies.persistState).not.toHaveBeenCalled();
  });

  it('deletes a stored profile and publishes a workspace event', () => {
    const dependencies = createDependencies();
    const service = createWorkspaceApplicationService(dependencies);

    service.deleteProfile('profile-1');

    expect(dependencies.clearProfileCaches).toHaveBeenCalledWith('profile-1');
    expect(dependencies.removeProfile).toHaveBeenCalledWith('profile-1');
    expect(dependencies.removeProfileSecret).toHaveBeenCalledWith('profile-1');
    expect(dependencies.persistState).toHaveBeenCalled();
    expect(dependencies.publishApplicationEvent).toHaveBeenCalledWith({
      type: 'workspace.profile.deleted',
      occurredAt: expect.any(String),
      payload: { profileId: 'profile-1' },
    });
  });

  it('keeps runtime-specific workspace names out of the application service', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/main/application/contexts/workspace/application-service.ts',
      ),
      'utf8',
    );

    expect(source).not.toContain('E2EFixture');
    expect(source).not.toContain('Fixture');
    expect(source).not.toContain('fixture');
  });
});
