import {
  createApplicationEvent,
  type ApplicationEvent,
} from '../../events/event-bus';
import type {
  ProfileSummary,
  SavedView,
  SaveViewInput,
  SearchInput,
  SearchResult,
} from '../../../../shared/ipc';
import type { AssetSearchReadModelReader } from '../../read-models/asset-search-read-model';

type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

type ProfileSecret = {
  accessKeyId: string;
  secretAccessKey: string;
};

export interface AssetDiscoveryApplicationService {
  deleteSavedView(viewId: string): Promise<void> | void;
  listSavedViews(): SavedView[];
  queryAssets(input: SearchInput): Promise<SearchResult>;
  saveView(input: SaveViewInput): Promise<SavedView> | SavedView;
}

export interface AssetDiscoveryApplicationServiceDependencies {
  assertProfileExists(profileId: string): StoredProfile;
  createSavedViewId(): string;
  deleteSavedView(viewId: string): void;
  ensureSearchIndexBootstrapped(profile: StoredProfile, secret: ProfileSecret): Promise<void>;
  getProfileSecretOrThrow(profileId: string): ProfileSecret;
  getSearchSnapshot(cacheKey: string): { result: SearchResult; expiresAt: number } | undefined;
  isE2EFixtureProfile(profileId: string): boolean;
  listSavedViews(): SavedView[];
  nowIso(): string;
  nowMs(): number;
  persistState(): void;
  publishApplicationEvent(event: ApplicationEvent): void;
  queryFixtureAssets(input: SearchInput): SearchResult;
  recordSearchSnapshotHit(): void;
  recordSearchSnapshotMiss(): void;
  saveView(view: SavedView): void;
  searchReadModelReader: AssetSearchReadModelReader;
  searchSnapshotTtlMs: number;
  setSearchSnapshot(cacheKey: string, snapshot: { result: SearchResult; expiresAt: number }): void;
}

const normalizeSearchQuery = (query: string): string => query.toLowerCase().trim();

const normalizeSearchLimit = (limit?: number): number =>
  Math.max(1, Math.min(limit ?? 300, 2_000));

export const createAssetDiscoveryApplicationService = (
  dependencies: AssetDiscoveryApplicationServiceDependencies,
): AssetDiscoveryApplicationService => ({
  queryAssets: async (input) => {
    if (dependencies.isE2EFixtureProfile(input.profileId)) {
      return dependencies.queryFixtureAssets(input);
    }

    const profile = dependencies.assertProfileExists(input.profileId);
    const query = normalizeSearchQuery(input.query);
    const now = dependencies.nowMs();
    const searchLimit = normalizeSearchLimit(input.limit);
    const snapshotCacheKey = `${profile.id}::${searchLimit}::${query}`;
    const snapshotCache = dependencies.getSearchSnapshot(snapshotCacheKey);
    if (snapshotCache && snapshotCache.expiresAt > now) {
      dependencies.recordSearchSnapshotHit();
      return snapshotCache.result;
    }

    dependencies.recordSearchSnapshotMiss();
    let indexedResult = dependencies.searchReadModelReader.searchAssets({
      profileId: profile.id,
      bucket: profile.bucket,
      query,
      limit: searchLimit,
    });

    if (indexedResult.indexedCount === 0) {
      const secret = dependencies.getProfileSecretOrThrow(profile.id);
      await dependencies.ensureSearchIndexBootstrapped(profile, secret);
      indexedResult = dependencies.searchReadModelReader.searchAssets({
        profileId: profile.id,
        bucket: profile.bucket,
        query,
        limit: searchLimit,
      });
    }

    const result: SearchResult = {
      items: indexedResult.items,
      total: indexedResult.total,
    };
    dependencies.setSearchSnapshot(snapshotCacheKey, {
      result,
      expiresAt: now + dependencies.searchSnapshotTtlMs,
    });
    return result;
  },

  saveView: (input) => {
    const id = input.id ?? dependencies.createSavedViewId();
    const saved: SavedView = {
      id,
      name: input.name,
      query: input.query,
      pinned: input.pinned ?? false,
      updatedAt: dependencies.nowIso(),
    };
    dependencies.saveView(saved);
    dependencies.persistState();
    dependencies.publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-discovery.saved-view.saved',
        payload: {
          viewId: saved.id,
          pinned: saved.pinned,
        },
      }),
    );
    return saved;
  },

  listSavedViews: () => dependencies.listSavedViews(),

  deleteSavedView: (viewId) => {
    dependencies.deleteSavedView(viewId);
    dependencies.persistState();
    dependencies.publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-discovery.saved-view.deleted',
        payload: { viewId },
      }),
    );
  },
});
