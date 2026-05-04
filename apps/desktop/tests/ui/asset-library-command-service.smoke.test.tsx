import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  createAssetLibraryCommandService,
  type AssetLibraryCommandServiceDependencies,
} from '../../src/main/application/contexts/asset-library/command-service';

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

const secret = {
  accessKeyId: 'access-key',
  secretAccessKey: 'secret-key',
};

const createDependencies = (
  overrides: Partial<AssetLibraryCommandServiceDependencies> = {},
): AssetLibraryCommandServiceDependencies => ({
  assertProfileExists: vi.fn(() => profile),
  copyStorageObject: vi.fn(async () => undefined),
  deleteAssetsOverride: vi.fn(async () => undefined),
  deleteStorageObjects: vi.fn(async (_profile, _secret, input) => ({
    deleted: input.keys,
    skipped: [],
  })),
  getProfileSecretOrThrow: vi.fn(() => secret),
  moveAssetOverride: vi.fn(async () => undefined),
  publishApplicationEvent: vi.fn(),
  renameAssetOverride: vi.fn(async () => undefined),
  ...overrides,
});

describe('asset library command service', () => {
  it('renames remote assets through storage and publishes a bucket-scoped event', async () => {
    const dependencies = createDependencies();
    const service = createAssetLibraryCommandService(dependencies);

    await expect(
      service.renameAsset({
        profileId: 'profile-1',
        fromKey: 'photos/source.png',
        toKey: 'photos/renamed.png',
      }),
    ).resolves.toEqual({
      ok: true,
      fromKey: 'photos/source.png',
      toKey: 'photos/renamed.png',
    });

    expect(dependencies.copyStorageObject).toHaveBeenCalledWith(profile, secret, {
      fromKey: 'photos/source.png',
      toKey: 'photos/renamed.png',
    });
    expect(dependencies.deleteStorageObjects).toHaveBeenCalledWith(profile, secret, {
      keys: ['photos/source.png'],
    });
    expect(dependencies.publishApplicationEvent).toHaveBeenCalledWith({
      type: 'asset-library.asset.renamed',
      occurredAt: expect.any(String),
      payload: {
        bucket: 'assets',
        profileId: 'profile-1',
        fromKey: 'photos/source.png',
        toKey: 'photos/renamed.png',
      },
    });
  });

  it('uses the runtime rename override before storage mutation', async () => {
    const overrideResult = {
      ok: true,
      fromKey: 'photos/source.png',
      toKey: 'photos/renamed.png',
    };
    const dependencies = createDependencies({
      renameAssetOverride: vi.fn(async () => overrideResult),
    });
    const service = createAssetLibraryCommandService(dependencies);

    await expect(
      service.renameAsset({
        profileId: 'runtime-override',
        fromKey: 'photos/source.png',
        toKey: 'photos/renamed.png',
      }),
    ).resolves.toBe(overrideResult);

    expect(dependencies.assertProfileExists).not.toHaveBeenCalled();
    expect(dependencies.copyStorageObject).not.toHaveBeenCalled();
    expect(dependencies.deleteStorageObjects).not.toHaveBeenCalled();
    expect(dependencies.publishApplicationEvent).toHaveBeenCalledWith({
      type: 'asset-library.asset.renamed',
      occurredAt: expect.any(String),
      payload: {
        profileId: 'runtime-override',
        fromKey: 'photos/source.png',
        toKey: 'photos/renamed.png',
      },
    });
  });

  it('uses the runtime move override before storage mutation', async () => {
    const overrideResult = {
      ok: true,
      fromKey: 'photos/source.png',
      toKey: 'archive/source.png',
    };
    const dependencies = createDependencies({
      moveAssetOverride: vi.fn(async () => overrideResult),
    });
    const service = createAssetLibraryCommandService(dependencies);

    await expect(
      service.moveAsset({
        profileId: 'runtime-override',
        fromKey: 'photos/source.png',
        toKey: 'archive/source.png',
      }),
    ).resolves.toBe(overrideResult);

    expect(dependencies.assertProfileExists).not.toHaveBeenCalled();
    expect(dependencies.copyStorageObject).not.toHaveBeenCalled();
    expect(dependencies.deleteStorageObjects).not.toHaveBeenCalled();
    expect(dependencies.publishApplicationEvent).toHaveBeenCalledWith({
      type: 'asset-library.asset.moved',
      occurredAt: expect.any(String),
      payload: {
        profileId: 'runtime-override',
        fromKey: 'photos/source.png',
        toKey: 'archive/source.png',
      },
    });
  });

  it('uses the runtime delete override before storage mutation', async () => {
    const overrideResult = {
      deleted: ['photos/remove.png'],
      skipped: ['photos/missing.png'],
    };
    const dependencies = createDependencies({
      deleteAssetsOverride: vi.fn(async () => overrideResult),
    });
    const service = createAssetLibraryCommandService(dependencies);

    await expect(
      service.deleteAssets({
        profileId: 'runtime-override',
        keys: ['photos/remove.png', 'photos/missing.png'],
      }),
    ).resolves.toBe(overrideResult);

    expect(dependencies.assertProfileExists).not.toHaveBeenCalled();
    expect(dependencies.deleteStorageObjects).not.toHaveBeenCalled();
    expect(dependencies.publishApplicationEvent).toHaveBeenCalledWith({
      type: 'asset-library.assets.deleted',
      occurredAt: expect.any(String),
      payload: {
        profileId: 'runtime-override',
        keys: ['photos/remove.png'],
        deletedCount: 1,
        skippedCount: 1,
      },
    });
  });

  it('keeps runtime-specific mutation names out of the application service', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/main/application/contexts/asset-library/command-service.ts',
      ),
      'utf8',
    );

    expect(source).not.toContain('E2EFixture');
    expect(source).not.toContain('Fixture');
  });
});
