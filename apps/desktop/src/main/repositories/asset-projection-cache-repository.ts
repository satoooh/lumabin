import type { AssetMetadata, AssetPreview, PreviewAssetInput, SearchResult } from '../../shared/ipc';

type HeadAssetCacheEntry = {
  value: AssetMetadata;
  expiresAt: number;
};

type SearchSnapshotCacheEntry = {
  result: SearchResult;
  expiresAt: number;
};

const PREVIEW_DEFAULT_MAX_BYTES = 2 * 1024 * 1024;

const headAssetCache = new Map<string, HeadAssetCacheEntry>();
const headAssetInFlight = new Map<string, Promise<AssetMetadata>>();
const previewInFlight = new Map<string, Promise<AssetPreview>>();
const searchSnapshotCache = new Map<string, SearchSnapshotCacheEntry>();

export const toAssetScopeKey = (profileId: string, key: string): string =>
  `${profileId}::${key}`;

export const toPreviewInFlightKey = (
  input: PreviewAssetInput,
  bucket: string,
): string =>
  [
    input.profileId,
    bucket,
    input.key,
    input.etag ?? '',
    String(input.maxBytes ?? PREVIEW_DEFAULT_MAX_BYTES),
  ].join('::');

export const getHeadAssetCache = (
  cacheKey: string,
): HeadAssetCacheEntry | undefined => headAssetCache.get(cacheKey);

export const setHeadAssetCache = (
  cacheKey: string,
  cache: HeadAssetCacheEntry,
): void => {
  headAssetCache.set(cacheKey, cache);
};

export const getHeadAssetInFlight = (
  cacheKey: string,
): Promise<AssetMetadata> | undefined => headAssetInFlight.get(cacheKey);

export const setHeadAssetInFlight = (
  cacheKey: string,
  task: Promise<AssetMetadata>,
): void => {
  headAssetInFlight.set(cacheKey, task);
};

export const deleteHeadAssetInFlight = (cacheKey: string): void => {
  headAssetInFlight.delete(cacheKey);
};

export const getPreviewInFlight = (
  inFlightKey: string,
): Promise<AssetPreview> | undefined => previewInFlight.get(inFlightKey);

export const setPreviewInFlight = (
  inFlightKey: string,
  task: Promise<AssetPreview>,
): void => {
  previewInFlight.set(inFlightKey, task);
};

export const deletePreviewInFlight = (inFlightKey: string): void => {
  previewInFlight.delete(inFlightKey);
};

export const getSearchSnapshotCache = (
  cacheKey: string,
): SearchSnapshotCacheEntry | undefined => searchSnapshotCache.get(cacheKey);

export const setSearchSnapshotCache = (
  cacheKey: string,
  snapshot: SearchSnapshotCacheEntry,
): void => {
  searchSnapshotCache.set(cacheKey, snapshot);
};

export const clearHeadAssetCacheForProfile = (profileId: string): void => {
  for (const key of headAssetCache.keys()) {
    if (key.startsWith(`${profileId}::`)) {
      headAssetCache.delete(key);
    }
  }
  for (const key of headAssetInFlight.keys()) {
    if (key.startsWith(`${profileId}::`)) {
      headAssetInFlight.delete(key);
    }
  }
};

export const clearHeadAssetCacheForKey = (profileId: string, key: string): void => {
  const scopedKey = toAssetScopeKey(profileId, key);
  headAssetCache.delete(scopedKey);
  headAssetInFlight.delete(scopedKey);
};

export const clearSearchSnapshotCacheForProfile = (profileId: string): void => {
  for (const key of searchSnapshotCache.keys()) {
    if (key.startsWith(`${profileId}::`)) {
      searchSnapshotCache.delete(key);
    }
  }
};
