export type RecentViewsByProfile = Record<string, Record<string, number>>;

export const RECENT_VIEWS_STORAGE_KEY = 'lumabin.recentViews.v1';

const RECENT_VIEW_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const RECENT_VIEW_MAX_ITEMS_PER_PROFILE = 600;

export const sanitizeRecentViewsStore = (
  input: unknown,
  now = Date.now(),
): RecentViewsByProfile => {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const nextStore: RecentViewsByProfile = {};
  const parsed = input as Record<string, unknown>;
  const minTimestamp = now - RECENT_VIEW_RETENTION_MS;

  for (const [profileId, rawEntries] of Object.entries(parsed)) {
    if (!profileId || !rawEntries || typeof rawEntries !== 'object') {
      continue;
    }

    const entries: Array<[string, number]> = [];
    for (const [key, value] of Object.entries(rawEntries as Record<string, unknown>)) {
      if (key.trim().length === 0) {
        continue;
      }
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        continue;
      }
      if (value < minTimestamp || value > now + 60 * 1000) {
        continue;
      }
      entries.push([key, value]);
    }

    entries.sort((left, right) => right[1] - left[1]);
    const trimmedEntries = entries.slice(0, RECENT_VIEW_MAX_ITEMS_PER_PROFILE);

    if (trimmedEntries.length === 0) {
      continue;
    }

    nextStore[profileId] = Object.fromEntries(trimmedEntries);
  }

  return nextStore;
};

export const loadRecentViewsStore = (): RecentViewsByProfile => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(RECENT_VIEWS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeRecentViewsStore(parsed);
  } catch {
    return {};
  }
};

export const rememberRecentAssetView = (
  current: RecentViewsByProfile,
  profileId: string,
  key: string,
  now = Date.now(),
): RecentViewsByProfile => {
  const normalizedProfileId = profileId.trim();
  const normalizedKey = key.trim();
  if (!normalizedProfileId || !normalizedKey) {
    return current;
  }

  const currentProfileViews = current[normalizedProfileId] ?? {};
  const currentTimestamp = currentProfileViews[normalizedKey] ?? 0;
  if (currentTimestamp > 0 && Math.abs(now - currentTimestamp) < 1_000) {
    return current;
  }

  const minTimestamp = now - RECENT_VIEW_RETENTION_MS;
  const entries = Object.entries({
    ...currentProfileViews,
    [normalizedKey]: now,
  })
    .filter(([, timestamp]) => timestamp >= minTimestamp)
    .sort((left, right) => right[1] - left[1])
    .slice(0, RECENT_VIEW_MAX_ITEMS_PER_PROFILE);

  const nextProfileViews = Object.fromEntries(entries);
  return {
    ...current,
    [normalizedProfileId]: nextProfileViews,
  };
};
