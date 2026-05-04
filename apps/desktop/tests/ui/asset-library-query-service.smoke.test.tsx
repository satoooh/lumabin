import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createAssetLibraryQueryService,
  type AssetLibraryQueryServiceDependencies,
} from '../../src/main/application/contexts/asset-library/query-service';

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

const item = {
  key: 'photos/a.png',
  contentType: 'image/png',
  etag: 'etag-a',
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 100,
};

const createDependencies = (
  overrides: Partial<AssetLibraryQueryServiceDependencies> = {},
): AssetLibraryQueryServiceDependencies => ({
  assertProfileExists: vi.fn(() => profile),
  deleteHeadInFlight: vi.fn(),
  deletePreviewInFlight: vi.fn(),
  getHeadCache: vi.fn(),
  getHeadInFlight: vi.fn(),
  getProfileSecretOrThrow: vi.fn(() => secret),
  getPreviewInFlight: vi.fn(),
  getStorageObjectPreview: vi.fn(),
  headCacheTtlMs: 90_000,
  headStorageObject: vi.fn(),
  headAssetOverride: vi.fn(() => undefined),
  listAssetsOverride: vi.fn(() => undefined),
  listStorageObjects: vi.fn(async () => ({
    items: [item],
    prefixes: ['photos/'],
    nextContinuationToken: 'next-page',
  })),
  normalizePreviewMaxBytes: vi.fn((value) => value ?? 256_000),
  nowMs: vi.fn(() => 1_000),
  previewAssetOverride: vi.fn(() => undefined),
  publishApplicationEvent: vi.fn(),
  readPreviewCache: vi.fn(async () => null),
  recordHeadHit: vi.fn(),
  recordHeadInFlightHit: vi.fn(),
  recordHeadMiss: vi.fn(),
  recordPreviewHit: vi.fn(),
  recordPreviewInFlightHit: vi.fn(),
  recordPreviewMiss: vi.fn(),
  setHeadCache: vi.fn(),
  setHeadInFlight: vi.fn(),
  setPreviewInFlight: vi.fn(),
  toAssetScopeKey: vi.fn((profileId, key) => `${profileId}:${key}`),
  toPreviewInFlightKey: vi.fn((input, bucket) => `${bucket}:${input.key}`),
  writePreviewCache: vi.fn(async () => undefined),
  ...overrides,
});

describe('asset library query service', () => {
  it('publishes an observation event after listing remote assets', async () => {
    const dependencies = createDependencies();
    const service = createAssetLibraryQueryService(dependencies);

    const result = await service.listAssets({
      profileId: 'profile-1',
      prefix: 'photos/',
      limit: 100,
    });

    expect(result.items).toEqual([item]);
    expect(dependencies.listStorageObjects).toHaveBeenCalledWith(profile, secret, {
      profileId: 'profile-1',
      prefix: 'photos/',
      limit: 100,
    });
    expect(dependencies.publishApplicationEvent).toHaveBeenCalledWith({
      type: 'asset-library.assets.observed',
      occurredAt: expect.any(String),
      payload: {
        profileId: 'profile-1',
        bucket: 'assets',
        items: [item],
      },
    });
  });

  it('uses the runtime list override before storage access', async () => {
    const overrideResult = {
      items: [item],
      prefixes: [],
    };
    const dependencies = createDependencies({
      listAssetsOverride: vi.fn(() => overrideResult),
    });
    const service = createAssetLibraryQueryService(dependencies);

    await expect(
      service.listAssets({
        profileId: 'e2e-fixture',
        prefix: '',
      }),
    ).resolves.toBe(overrideResult);

    expect(dependencies.listStorageObjects).not.toHaveBeenCalled();
    expect(dependencies.publishApplicationEvent).not.toHaveBeenCalled();
  });

  it('uses the runtime head override before profile or cache access', async () => {
    const dependencies = createDependencies({
      headAssetOverride: vi.fn(() => item),
    });
    const service = createAssetLibraryQueryService(dependencies);

    await expect(
      service.headAsset({
        profileId: 'runtime-override',
        key: item.key,
      }),
    ).resolves.toBe(item);

    expect(dependencies.assertProfileExists).not.toHaveBeenCalled();
    expect(dependencies.getHeadCache).not.toHaveBeenCalled();
    expect(dependencies.headStorageObject).not.toHaveBeenCalled();
  });

  it('uses the runtime preview override before profile or cache access', async () => {
    const overridePreview = {
      dataUrl: 'data:image/png;base64,ZmFrZQ==',
      contentType: 'image/png',
      size: 4,
    };
    const dependencies = createDependencies({
      previewAssetOverride: vi.fn(() => overridePreview),
    });
    const service = createAssetLibraryQueryService(dependencies);

    await expect(
      service.previewAsset({
        profileId: 'runtime-override',
        key: item.key,
      }),
    ).resolves.toBe(overridePreview);

    expect(dependencies.assertProfileExists).not.toHaveBeenCalled();
    expect(dependencies.readPreviewCache).not.toHaveBeenCalled();
    expect(dependencies.getStorageObjectPreview).not.toHaveBeenCalled();
  });

  it('keeps runtime-specific query names out of the application service', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/main/application/contexts/asset-library/query-service.ts',
      ),
      'utf8',
    );

    expect(source).not.toContain('E2EFixture');
    expect(source).not.toContain('Fixture');
  });
});
