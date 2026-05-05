import type { AssetItem, AssetMetadata } from '../../../shared/ipc';

const E2E_FIXTURE_BASE_ASSET_COUNT = 3;
const E2E_FIXTURE_MAX_ASSET_COUNT = 2_000;

const e2eFixtureAssets = new Map<string, AssetMetadata>();

export const assetMetadataToItem = (metadata: AssetMetadata): AssetItem => ({
  key: metadata.key,
  size: metadata.size,
  contentType: metadata.contentType,
  lastModified: metadata.lastModified,
  etag: metadata.etag,
});

const createE2EFixtureAsset = (options: {
  key: string;
  contentType: string;
  size: number;
  offsetMinutes: number;
}): AssetMetadata => {
  const timestamp = new Date(Date.now() - options.offsetMinutes * 60_000).toISOString();
  return {
    key: options.key,
    size: options.size,
    contentType: options.contentType,
    lastModified: timestamp,
    etag: `"e2e-${options.key}"`,
    metadata: {
      source: 'e2e-fixture',
      captured_at: timestamp,
    },
  };
};

const createDenseE2EFixtureAsset = (index: number): AssetMetadata => {
  const assetNumber = index + 1;
  const paddedNumber = String(assetNumber).padStart(4, '0');
  const extensionByKind = ['jpg', 'png', 'webp', 'csv', 'pdf'];
  const contentTypeByKind = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'application/pdf',
  ];
  const kindIndex = index % extensionByKind.length;

  return createE2EFixtureAsset({
    key: `photos/2026/03/dense/lumabin-fixture-${paddedNumber}.${extensionByKind[kindIndex]}`,
    contentType: contentTypeByKind[kindIndex],
    size: 84_000 + (index % 37) * 3_200,
    offsetMinutes: 120 + index,
  });
};

export const resolveE2EFixtureAssetCount = (
  value = process.env.LUMABIN_E2E_FIXTURE_ASSET_COUNT,
): number => {
  if (!value) {
    return E2E_FIXTURE_BASE_ASSET_COUNT;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return E2E_FIXTURE_BASE_ASSET_COUNT;
  }

  return Math.max(
    E2E_FIXTURE_BASE_ASSET_COUNT,
    Math.min(parsed, E2E_FIXTURE_MAX_ASSET_COUNT),
  );
};

export const seedE2EFixtureAssets = (options?: { assetCount?: number }): void => {
  e2eFixtureAssets.clear();
  const seeded = [
    createE2EFixtureAsset({
      key: 'photos/2026/05/editorial-workspace.svg',
      contentType: 'image/svg+xml',
      size: 126_000,
      offsetMinutes: 4,
    }),
    createE2EFixtureAsset({
      key: 'photos/2026/05/mountain-glass.svg',
      contentType: 'image/svg+xml',
      size: 98_400,
      offsetMinutes: 35,
    }),
    createE2EFixtureAsset({
      key: 'photos/2026/05/studio-archive.svg',
      contentType: 'image/svg+xml',
      size: 138_700,
      offsetMinutes: 68,
    }),
  ];
  const targetAssetCount = options?.assetCount ?? resolveE2EFixtureAssetCount();
  const additionalAssetCount = Math.max(0, targetAssetCount - seeded.length);
  for (let index = 0; index < additionalAssetCount; index += 1) {
    seeded.push(createDenseE2EFixtureAsset(index));
  }

  for (const asset of seeded) {
    e2eFixtureAssets.set(asset.key, asset);
  }
};

export const hasE2EFixtureAsset = (key: string): boolean =>
  e2eFixtureAssets.has(key);

export const getE2EFixtureAsset = (
  key: string,
): AssetMetadata | undefined => e2eFixtureAssets.get(key);

export const saveE2EFixtureAsset = (
  key: string,
  metadata: AssetMetadata,
): void => {
  e2eFixtureAssets.set(key, metadata);
};

export const deleteE2EFixtureAsset = (key: string): boolean =>
  e2eFixtureAssets.delete(key);

export const listE2EFixtureAssetMetadata = (): AssetMetadata[] => [
  ...e2eFixtureAssets.values(),
];
