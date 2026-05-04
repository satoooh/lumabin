import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  createAssetDiscoveryApplicationService,
  type AssetDiscoveryApplicationServiceDependencies,
} from '../../src/main/application/contexts/asset-discovery/application-service';
import type { SearchResult } from '../../src/shared/ipc';

const createDependencies = (
  overrides: Partial<AssetDiscoveryApplicationServiceDependencies> = {},
): AssetDiscoveryApplicationServiceDependencies => ({
  assertProfileExists: vi.fn(() => ({
    id: 'profile-1',
    name: 'Profile',
    provider: 'r2',
    endpoint: 'https://example.invalid',
    region: 'auto',
    bucket: 'assets',
  })),
  createSavedViewId: vi.fn(() => 'saved-view-1'),
  deleteSavedView: vi.fn(),
  ensureSearchIndexBootstrapped: vi.fn(),
  getProfileSecretOrThrow: vi.fn(() => ({
    accessKeyId: 'access-key',
    secretAccessKey: 'secret-key',
  })),
  getSearchSnapshot: vi.fn(() => undefined),
  listSavedViews: vi.fn(() => []),
  nowIso: vi.fn(() => '2026-05-05T00:00:00.000Z'),
  nowMs: vi.fn(() => 1_000),
  persistState: vi.fn(),
  publishApplicationEvent: vi.fn(),
  querySearchOverride: vi.fn(() => undefined),
  recordSearchSnapshotHit: vi.fn(),
  recordSearchSnapshotMiss: vi.fn(),
  saveView: vi.fn(),
  searchReadModelReader: {
    searchAssets: vi.fn(() => ({
      indexedCount: 1,
      items: [],
      total: 0,
    })),
  },
  searchSnapshotTtlMs: 20_000,
  setSearchSnapshot: vi.fn(),
  ...overrides,
});

describe('asset discovery application service', () => {
  it('routes runtime-selected search overrides before profile-backed read models', async () => {
    const overrideResult: SearchResult = {
      items: [
        {
          key: 'fixture/photo.png',
          size: 1024,
          contentType: 'image/png',
          lastModified: '2026-05-05T00:00:00.000Z',
          etag: 'etag',
        },
      ],
      total: 1,
    };
    const dependencies = createDependencies({
      querySearchOverride: vi.fn(() => overrideResult),
    });
    const service = createAssetDiscoveryApplicationService(dependencies);

    await expect(
      service.queryAssets({
        profileId: 'runtime-selected-profile',
        query: 'photo',
        limit: 50,
      }),
    ).resolves.toBe(overrideResult);

    expect(dependencies.assertProfileExists).not.toHaveBeenCalled();
    expect(dependencies.searchReadModelReader.searchAssets).not.toHaveBeenCalled();
  });

  it('keeps fixture-specific runtime names out of the application service', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/main/application/contexts/asset-discovery/application-service.ts'),
      'utf8',
    );

    expect(source).not.toContain('E2EFixture');
    expect(source).not.toContain('Fixture');
  });
});
