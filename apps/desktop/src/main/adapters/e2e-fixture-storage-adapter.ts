import {
  addStorageTransferredBytes,
  recordStorageFailure,
  recordStorageMetric,
} from '../dev-metrics';
import fs from 'node:fs';
import path from 'node:path';
import type {
  AssetPreview,
  ListAssetsInput,
  ListAssetsResult,
  PreviewAssetInput,
  SearchInput,
  SearchResult,
} from '../../shared/ipc';
import {
  assetMetadataToItem,
  getE2EFixtureAsset,
  listE2EFixtureAssetMetadata,
} from './e2e-fixture/e2e-fixture-asset-store';

export {
  deleteE2EFixtureAsset,
  getE2EFixtureAsset,
  hasE2EFixtureAsset,
  resolveE2EFixtureAssetCount,
  saveE2EFixtureAsset,
  seedE2EFixtureAssets,
} from './e2e-fixture/e2e-fixture-asset-store';
export { runE2EFixtureUploadJob } from './e2e-fixture/e2e-fixture-upload-runner';

export const E2E_FIXTURE_PROFILE_ID = 'e2e-fixture-profile';
export const E2E_FIXTURE_PUBLIC_BASE_URL = 'https://cdn.lumabin-e2e.local/assets';

const E2E_FIXTURE_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l4gAAAABJRU5ErkJggg==';

const E2E_FIXTURE_IMAGE_PREVIEWS: Record<string, string> = {
  'photos/2026/05/editorial-workspace.jpg': 'editorial-workspace.jpg',
  'photos/2026/05/mountain-lake.jpg': 'mountain-lake.jpg',
  'photos/2026/05/studio-archive.jpg': 'studio-archive.jpg',
};
const e2eFixtureImageCache = new Map<string, Buffer>();

const resolveE2EFixtureImagePath = (fileName: string): string => {
  if (typeof process.resourcesPath === 'string') {
    const resourcePath = path.join(process.resourcesPath, 'lumabin-e2e-assets', fileName);
    if (fs.existsSync(resourcePath)) {
      return resourcePath;
    }
  }

  return path.resolve(
    process.cwd(),
    'src/main/adapters/e2e-fixture/lumabin-e2e-assets',
    fileName,
  );
};

const readE2EFixtureImagePreview = (key: string): Buffer | null => {
  const fileName = E2E_FIXTURE_IMAGE_PREVIEWS[key];
  if (!fileName) {
    return null;
  }
  const cached = e2eFixtureImageCache.get(fileName);
  if (cached) {
    return cached;
  }
  const buffer = fs.readFileSync(resolveE2EFixtureImagePath(fileName));
  e2eFixtureImageCache.set(fileName, buffer);
  return buffer;
};

export const isE2EFixtureProfile = (
  isFixtureMode: boolean,
  profileId: string,
): boolean => isFixtureMode && profileId === E2E_FIXTURE_PROFILE_ID;

export const listE2EFixtureAssets = (
  input: ListAssetsInput,
  normalizeDestinationPrefix: (value: string) => string,
): ListAssetsResult => {
  recordStorageMetric('listCalls');
  const normalizedPrefix = normalizeDestinationPrefix(input.prefix ?? '');
  const allItems = listE2EFixtureAssetMetadata()
    .filter((asset) => asset.key.startsWith(normalizedPrefix))
    .sort(
      (left, right) =>
        new Date(right.lastModified).getTime() - new Date(left.lastModified).getTime(),
    )
    .map(assetMetadataToItem);

  const limit = Math.max(1, Math.min(input.limit ?? 300, 2_000));
  const offset = Number.parseInt(input.continuationToken ?? '0', 10);
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;
  const items = allItems.slice(safeOffset, safeOffset + limit);
  const nextOffset = safeOffset + limit;
  const nextContinuationToken =
    nextOffset < allItems.length ? String(nextOffset) : undefined;

  return {
    items,
    prefixes: [],
    nextContinuationToken,
  };
};

export const previewE2EFixtureAsset = (input: PreviewAssetInput): AssetPreview => {
  const metadata = getE2EFixtureAsset(input.key);
  if (!metadata) {
    recordStorageFailure();
    throw new Error(`Asset not found: ${input.key}`);
  }
  recordStorageMetric('getCalls');
  if (metadata.contentType.startsWith('image/')) {
    const previewBuffer = readE2EFixtureImagePreview(metadata.key);
    const dataBase64 = previewBuffer?.toString('base64') ?? E2E_FIXTURE_IMAGE_BASE64;
    const byteLength = previewBuffer?.byteLength ?? Buffer.from(dataBase64, 'base64').byteLength;
    addStorageTransferredBytes({
      bytesDownloaded: byteLength,
    });
    return {
      key: metadata.key,
      kind: 'image',
      contentType: metadata.contentType,
      byteLength,
      totalBytes: metadata.size,
      truncated: false,
      dataBase64,
    };
  }
  addStorageTransferredBytes({
    bytesDownloaded: metadata.size,
  });
  if (metadata.contentType === 'text/csv') {
    return {
      key: metadata.key,
      kind: 'csv',
      contentType: metadata.contentType,
      byteLength: metadata.size,
      totalBytes: metadata.size,
      truncated: false,
      textPreview: 'id,name\n1,fixture',
    };
  }
  if (metadata.contentType === 'application/pdf') {
    return {
      key: metadata.key,
      kind: 'pdf',
      contentType: metadata.contentType,
      byteLength: metadata.size,
      totalBytes: metadata.size,
      truncated: false,
    };
  }
  return {
    key: metadata.key,
    kind: 'other',
    contentType: metadata.contentType,
    byteLength: metadata.size,
    totalBytes: metadata.size,
    truncated: false,
  };
};

export const queryE2EFixtureAssets = (input: SearchInput): SearchResult => {
  const query = input.query.toLowerCase().trim();
  const limit = Math.max(1, Math.min(input.limit ?? 300, 2_000));
  const items = listE2EFixtureAssetMetadata()
    .map(assetMetadataToItem)
    .filter((item) => (query ? item.key.toLowerCase().includes(query) : true))
    .slice(0, limit);
  return {
    items,
    total: items.length,
  };
};
