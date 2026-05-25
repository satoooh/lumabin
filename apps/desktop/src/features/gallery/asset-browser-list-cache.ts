import type { ListAssetsResult } from '../../shared/ipc';

export const ASSET_BROWSER_LIST_CACHE_STORAGE_KEY = 'lumabin.assetBrowserListCache.v1';
export const ASSET_BROWSER_LIST_CACHE_TTL_MS = 5 * 60 * 1000;
const ASSET_BROWSER_LIST_CACHE_MAX_PERSISTED_ITEMS = 5_000;
const ASSET_BROWSER_LIST_CACHE_MAX_PERSISTED_ENTRIES = 12;

interface AssetBrowserListCacheEntry {
  cachedAt: number;
  profileId: string;
  prefix: string;
  result: ListAssetsResult;
}

type AssetBrowserListCacheStore = Record<string, AssetBrowserListCacheEntry>;

const memoryCache = new Map<string, AssetBrowserListCacheEntry>();

export const toAssetBrowserListCacheKey = (profileId: string, prefix: string): string =>
  `${profileId}\n${prefix}`;

const readPersistedStore = (): AssetBrowserListCacheStore => {
  try {
    const raw = window.localStorage.getItem(ASSET_BROWSER_LIST_CACHE_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed as AssetBrowserListCacheStore;
  } catch {
    return {};
  }
};

const writePersistedStore = (store: AssetBrowserListCacheStore): void => {
  try {
    window.localStorage.setItem(
      ASSET_BROWSER_LIST_CACHE_STORAGE_KEY,
      JSON.stringify(store),
    );
  } catch {
    // Cache writes are best-effort; quota failures must not affect browsing.
  }
};

const isValidCacheEntry = (
  entry: AssetBrowserListCacheEntry | undefined,
  profileId: string,
  prefix: string,
): entry is AssetBrowserListCacheEntry =>
  Boolean(
    entry &&
      entry.profileId === profileId &&
      entry.prefix === prefix &&
      typeof entry.cachedAt === 'number' &&
      Array.isArray(entry.result.items) &&
      Array.isArray(entry.result.prefixes),
  );

export const readAssetBrowserListCache = (
  profileId: string,
  prefix: string,
  now: number,
): { result: ListAssetsResult; isFresh: boolean } | null => {
  const cacheKey = toAssetBrowserListCacheKey(profileId, prefix);
  const memoryEntry = memoryCache.get(cacheKey);
  if (isValidCacheEntry(memoryEntry, profileId, prefix)) {
    return {
      result: memoryEntry.result,
      isFresh: now - memoryEntry.cachedAt <= ASSET_BROWSER_LIST_CACHE_TTL_MS,
    };
  }

  const persistedEntry = readPersistedStore()[cacheKey];
  if (!isValidCacheEntry(persistedEntry, profileId, prefix)) {
    return null;
  }

  memoryCache.set(cacheKey, persistedEntry);
  return {
    result: persistedEntry.result,
    isFresh: now - persistedEntry.cachedAt <= ASSET_BROWSER_LIST_CACHE_TTL_MS,
  };
};

export const writeAssetBrowserListCache = (
  profileId: string,
  prefix: string,
  result: ListAssetsResult,
  now: number,
): void => {
  if (result.nextContinuationToken) {
    return;
  }

  const cacheKey = toAssetBrowserListCacheKey(profileId, prefix);
  const entry: AssetBrowserListCacheEntry = {
    cachedAt: now,
    profileId,
    prefix,
    result,
  };
  memoryCache.set(cacheKey, entry);

  if (result.items.length > ASSET_BROWSER_LIST_CACHE_MAX_PERSISTED_ITEMS) {
    return;
  }

  const store = readPersistedStore();
  const entries = Object.entries({
    ...store,
    [cacheKey]: entry,
  }).sort(([, left], [, right]) => right.cachedAt - left.cachedAt);

  writePersistedStore(Object.fromEntries(entries.slice(0, ASSET_BROWSER_LIST_CACHE_MAX_PERSISTED_ENTRIES)));
};

export const clearAssetBrowserListCache = (profileId?: string): void => {
  if (!profileId) {
    memoryCache.clear();
    try {
      window.localStorage.removeItem(ASSET_BROWSER_LIST_CACHE_STORAGE_KEY);
    } catch {
      // Cache clears are best-effort.
    }
    return;
  }

  for (const cacheKey of memoryCache.keys()) {
    if (cacheKey.startsWith(`${profileId}\n`)) {
      memoryCache.delete(cacheKey);
    }
  }

  const store = readPersistedStore();
  for (const [cacheKey, entry] of Object.entries(store)) {
    if (entry.profileId === profileId) {
      delete store[cacheKey];
    }
  }
  writePersistedStore(store);
};
