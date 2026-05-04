import { basename } from 'node:path';
import {
  addStorageTransferredBytes,
  recordStorageFailure,
  recordStorageMetric,
} from '../dev-metrics';
import type {
  AssetItem,
  AssetMetadata,
  AssetPreview,
  ListAssetsInput,
  ListAssetsResult,
  PreviewAssetInput,
  SearchInput,
  SearchResult,
  StartUploadInput,
  UploadJobStatus,
  UploadSource,
} from '../../shared/ipc';

export const E2E_FIXTURE_PROFILE_ID = 'e2e-fixture-profile';
export const E2E_FIXTURE_PUBLIC_BASE_URL = 'https://cdn.lumabin-e2e.local/assets';

const E2E_FIXTURE_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l4gAAAABJRU5ErkJggg==';
const E2E_FIXTURE_SVG_PREVIEWS: Record<string, string> = {
  'photos/2026/05/editorial-workspace.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f5efe6"/>
          <stop offset="0.52" stop-color="#d9eef1"/>
          <stop offset="1" stop-color="#294358"/>
        </linearGradient>
        <linearGradient id="desk" x1="0" x2="1">
          <stop offset="0" stop-color="#c6905f"/>
          <stop offset="1" stop-color="#7c5138"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="820" fill="url(#bg)"/>
      <rect x="0" y="560" width="1200" height="260" fill="url(#desk)"/>
      <rect x="150" y="154" width="380" height="268" rx="30" fill="#fcfaf4" opacity=".92"/>
      <rect x="190" y="198" width="300" height="18" rx="9" fill="#273847"/>
      <rect x="190" y="246" width="230" height="14" rx="7" fill="#91a7b2"/>
      <rect x="190" y="286" width="270" height="14" rx="7" fill="#c1ced5"/>
      <rect x="650" y="130" width="330" height="430" rx="34" fill="#f9fbfc" opacity=".95"/>
      <circle cx="815" cy="320" r="96" fill="#56a3a6"/>
      <path d="M738 342c64-78 113-78 178 0v82H738z" fill="#1d6670"/>
      <circle cx="770" cy="268" r="34" fill="#f6d56c"/>
      <rect x="448" y="520" width="310" height="80" rx="24" fill="#101820" opacity=".92"/>
      <rect x="505" y="540" width="196" height="12" rx="6" fill="#eef2f6"/>
      <rect x="144" y="626" width="238" height="46" rx="23" fill="#253747" opacity=".22"/>
      <rect x="816" y="616" width="206" height="54" rx="27" fill="#f5f7fa" opacity=".48"/>
    </svg>
  `,
  'photos/2026/05/mountain-glass.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#eaf6ff"/>
          <stop offset="0.52" stop-color="#b7d6dd"/>
          <stop offset="1" stop-color="#47636b"/>
        </linearGradient>
        <linearGradient id="glass" x1="0" x2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".72"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity=".18"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="820" fill="url(#sky)"/>
      <circle cx="936" cy="154" r="80" fill="#f8d578"/>
      <path d="M0 600 250 330 448 562 620 290 930 600z" fill="#496a6c"/>
      <path d="M250 330 340 436 203 438zM620 290l122 182-188-52z" fill="#f7f8f6"/>
      <path d="M0 650c215-90 398-102 622-26 168 57 355 57 578-3v199H0z" fill="#213b42"/>
      <rect x="310" y="216" width="540" height="330" rx="44" fill="url(#glass)" stroke="#ffffff" stroke-width="8" opacity=".88"/>
      <rect x="352" y="260" width="188" height="24" rx="12" fill="#24434d" opacity=".68"/>
      <rect x="352" y="310" width="334" height="16" rx="8" fill="#24434d" opacity=".34"/>
      <rect x="352" y="350" width="260" height="16" rx="8" fill="#24434d" opacity=".28"/>
      <rect x="692" y="434" width="108" height="42" rx="21" fill="#ffffff" opacity=".72"/>
    </svg>
  `,
  'photos/2026/05/studio-archive.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820">
      <defs>
        <linearGradient id="wall" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f2f5f7"/>
          <stop offset="1" stop-color="#d7e1e6"/>
        </linearGradient>
        <linearGradient id="card" x1="0" x2="1">
          <stop offset="0" stop-color="#0f1720"/>
          <stop offset="1" stop-color="#304a57"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="820" fill="url(#wall)"/>
      <rect x="0" y="620" width="1200" height="200" fill="#9aa7ad"/>
      <rect x="132" y="120" width="292" height="360" rx="34" fill="#ffffff"/>
      <rect x="170" y="162" width="216" height="160" rx="24" fill="#e7b65f"/>
      <circle cx="238" cy="222" r="46" fill="#13222d"/>
      <rect x="170" y="360" width="174" height="18" rx="9" fill="#2d4150"/>
      <rect x="170" y="404" width="132" height="14" rx="7" fill="#b7c3cb"/>
      <rect x="454" y="170" width="292" height="360" rx="34" fill="url(#card)"/>
      <rect x="496" y="218" width="208" height="206" rx="28" fill="#edf5f7" opacity=".9"/>
      <path d="M524 390l66-78 48 54 32-36 34 60z" fill="#4f9da0"/>
      <rect x="776" y="104" width="292" height="360" rx="34" fill="#ffffff"/>
      <rect x="818" y="154" width="208" height="210" rx="28" fill="#dde7ec"/>
      <circle cx="922" cy="258" r="72" fill="#62aaa9"/>
      <rect x="818" y="400" width="190" height="16" rx="8" fill="#2d4150"/>
      <rect x="254" y="568" width="690" height="78" rx="39" fill="#f7fafc" opacity=".78"/>
      <rect x="332" y="596" width="220" height="18" rx="9" fill="#1f3441" opacity=".34"/>
      <rect x="604" y="596" width="270" height="18" rx="9" fill="#1f3441" opacity=".18"/>
    </svg>
  `,
};
const E2E_FIXTURE_UPLOAD_DELAY_MS = 80;
const E2E_FIXTURE_BASE_ASSET_COUNT = 3;
const E2E_FIXTURE_MAX_ASSET_COUNT = 2_000;

const e2eFixtureAssets = new Map<string, AssetMetadata>();

interface RunE2EFixtureUploadJobDependencies {
  createEtagSuffix(): string;
  getDefaultConflictPolicy(): StartUploadInput['conflictPolicy'];
  inferContentTypeFromKey(key: string): string;
  normalizeDestinationPrefix(value: string): string;
  nowIso(): string;
  sourceRelativePathOrFileName(source: UploadSource, resolvedFileName?: string): string;
  splitFileName(fileName: string): { stem: string; ext: string };
  updateUploadJob(jobId: string, updater: (job: UploadJobStatus) => UploadJobStatus): void;
}

const toAssetItem = (metadata: AssetMetadata): AssetItem => ({
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

export const isE2EFixtureProfile = (
  isFixtureMode: boolean,
  profileId: string,
): boolean => isFixtureMode && profileId === E2E_FIXTURE_PROFILE_ID;

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

export const listE2EFixtureAssets = (
  input: ListAssetsInput,
  normalizeDestinationPrefix: (value: string) => string,
): ListAssetsResult => {
  recordStorageMetric('listCalls');
  const normalizedPrefix = normalizeDestinationPrefix(input.prefix ?? '');
  const allItems = [...e2eFixtureAssets.values()]
    .filter((asset) => asset.key.startsWith(normalizedPrefix))
    .sort(
      (left, right) =>
        new Date(right.lastModified).getTime() - new Date(left.lastModified).getTime(),
    )
    .map(toAssetItem);

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
  const metadata = e2eFixtureAssets.get(input.key);
  if (!metadata) {
    recordStorageFailure();
    throw new Error(`Asset not found: ${input.key}`);
  }
  recordStorageMetric('getCalls');
  if (metadata.contentType.startsWith('image/')) {
    const dataBase64 = metadata.contentType === 'image/svg+xml'
      ? Buffer.from(
        E2E_FIXTURE_SVG_PREVIEWS[metadata.key] ?? E2E_FIXTURE_SVG_PREVIEWS['photos/2026/05/editorial-workspace.svg'],
        'utf8',
      ).toString('base64')
      : E2E_FIXTURE_IMAGE_BASE64;
    const byteLength = Buffer.from(dataBase64, 'base64').byteLength;
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
  const items = [...e2eFixtureAssets.values()]
    .map(toAssetItem)
    .filter((item) => (query ? item.key.toLowerCase().includes(query) : true))
    .slice(0, limit);
  return {
    items,
    total: items.length,
  };
};

const resolveE2EUploadDestinationKey = (
  destinationPrefix: string,
  source: UploadSource,
  conflictPolicy: StartUploadInput['conflictPolicy'],
  dependencies: RunE2EFixtureUploadJobDependencies,
  sourceFileName?: string,
): string | null => {
  const sourceRelativePath = dependencies.sourceRelativePathOrFileName(
    source,
    sourceFileName,
  );
  const fileName = basename(sourceRelativePath);
  const normalizedPrefix = dependencies.normalizeDestinationPrefix(destinationPrefix);
  const initialKey = `${normalizedPrefix}${sourceRelativePath}`;
  const policy = conflictPolicy ?? dependencies.getDefaultConflictPolicy();

  if (!e2eFixtureAssets.has(initialKey)) {
    return initialKey;
  }
  if (policy === 'overwrite') {
    return initialKey;
  }
  if (policy === 'skip') {
    return null;
  }

  const sourceDirectory =
    sourceRelativePath.lastIndexOf('/') >= 0
      ? sourceRelativePath.slice(0, sourceRelativePath.lastIndexOf('/') + 1)
      : '';
  const { stem, ext } = dependencies.splitFileName(fileName);
  for (let index = 1; index < 1_000; index += 1) {
    const renamedRelativePath = `${sourceDirectory}${stem}-${index}${ext}`;
    const renamedKey = `${normalizedPrefix}${renamedRelativePath}`;
    if (!e2eFixtureAssets.has(renamedKey)) {
      return renamedKey;
    }
  }

  throw new Error(`Unable to allocate renamed key for ${fileName}`);
};

export const runE2EFixtureUploadJob = async (
  jobId: string,
  input: StartUploadInput,
  dependencies: RunE2EFixtureUploadJobDependencies,
): Promise<void> => {
  dependencies.updateUploadJob(jobId, (job) => ({
    ...job,
    status: 'running',
    updatedAt: dependencies.nowIso(),
  }));

  for (const source of input.sources) {
    const destinationKey = resolveE2EUploadDestinationKey(
      input.destinationPrefix,
      source,
      input.conflictPolicy,
      dependencies,
    );
    if (!destinationKey) {
      dependencies.updateUploadJob(jobId, (job) => ({
        ...job,
        completedItems: job.completedItems + 1,
        updatedAt: dependencies.nowIso(),
      }));
      continue;
    }

    const now = dependencies.nowIso();
    const contentType = dependencies.inferContentTypeFromKey(destinationKey);
    e2eFixtureAssets.set(destinationKey, {
      key: destinationKey,
      size: source.size,
      contentType,
      lastModified: now,
      etag: `"e2e-upload-${dependencies.createEtagSuffix()}"`,
      metadata: {
        source: 'e2e-upload',
        uploaded_at: now,
      },
    });
    dependencies.updateUploadJob(jobId, (job) => ({
      ...job,
      completedItems: job.completedItems + 1,
      updatedAt: dependencies.nowIso(),
    }));
  }

  await new Promise((resolve) => {
    setTimeout(resolve, E2E_FIXTURE_UPLOAD_DELAY_MS);
  });

  dependencies.updateUploadJob(jobId, (job) => ({
    ...job,
    status: 'done',
    lastError: '',
    updatedAt: dependencies.nowIso(),
  }));
};
