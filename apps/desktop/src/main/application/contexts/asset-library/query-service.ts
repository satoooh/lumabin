import {
  createApplicationEvent,
  type ApplicationEvent,
} from '../../events/event-bus';
import type {
  AssetMetadata,
  AssetPreview,
  ListAssetsInput,
  ListAssetsResult,
  PreviewAssetInput,
  ProfileSummary,
} from '../../../../shared/ipc';

type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

type ProfileSecret = {
  accessKeyId: string;
  secretAccessKey: string;
};

type PreviewCacheInput = {
  profileId: string;
  bucket: string;
  key: string;
  etag?: string;
  maxBytes: number;
};

export interface AssetLibraryQueryService {
  headAsset(input: { profileId: string; key: string }): Promise<AssetMetadata>;
  listAssets(input: ListAssetsInput): Promise<ListAssetsResult>;
  previewAsset(input: PreviewAssetInput): Promise<AssetPreview>;
}

export interface AssetLibraryQueryServiceDependencies {
  assertProfileExists(profileId: string): StoredProfile;
  deleteHeadInFlight(cacheKey: string): void;
  deletePreviewInFlight(inFlightKey: string): void;
  getFixtureAsset(key: string): AssetMetadata | undefined;
  getHeadCache(cacheKey: string): { value: AssetMetadata; expiresAt: number } | undefined;
  getHeadInFlight(cacheKey: string): Promise<AssetMetadata> | undefined;
  getProfileSecretOrThrow(profileId: string): ProfileSecret;
  getPreviewInFlight(inFlightKey: string): Promise<AssetPreview> | undefined;
  getStorageObjectPreview(
    profile: StoredProfile,
    secret: ProfileSecret,
    input: { key: string; maxBytes: number },
  ): Promise<AssetPreview>;
  headCacheTtlMs: number;
  headStorageObject(
    profile: StoredProfile,
    secret: ProfileSecret,
    key: string,
  ): Promise<AssetMetadata>;
  isE2EFixtureProfile(profileId: string): boolean;
  listFixtureAssets(input: ListAssetsInput): ListAssetsResult;
  listStorageObjects(
    profile: StoredProfile,
    secret: ProfileSecret,
    input: ListAssetsInput,
  ): Promise<ListAssetsResult>;
  normalizePreviewMaxBytes(value: number | undefined): number;
  nowMs(): number;
  previewFixtureAsset(input: PreviewAssetInput): AssetPreview;
  readPreviewCache(input: PreviewCacheInput): Promise<AssetPreview | null>;
  recordHeadHit(): void;
  recordHeadInFlightHit(): void;
  recordHeadMiss(): void;
  recordPreviewHit(): void;
  recordPreviewInFlightHit(): void;
  recordPreviewMiss(): void;
  setHeadCache(cacheKey: string, cache: { value: AssetMetadata; expiresAt: number }): void;
  setHeadInFlight(cacheKey: string, task: Promise<AssetMetadata>): void;
  setPreviewInFlight(inFlightKey: string, task: Promise<AssetPreview>): void;
  toAssetScopeKey(profileId: string, key: string): string;
  toPreviewInFlightKey(input: PreviewAssetInput, bucket: string): string;
  publishApplicationEvent(event: ApplicationEvent): void;
  writePreviewCache(input: PreviewCacheInput, preview: AssetPreview): Promise<void>;
}

const assertFixtureAssetExists = (
  input: { key: string },
  dependencies: AssetLibraryQueryServiceDependencies,
): AssetMetadata => {
  const metadata = dependencies.getFixtureAsset(input.key);
  if (!metadata) {
    throw new Error(`Asset not found: ${input.key}`);
  }
  return metadata;
};

export const createAssetLibraryQueryService = (
  dependencies: AssetLibraryQueryServiceDependencies,
): AssetLibraryQueryService => ({
  listAssets: async (input) => {
    if (dependencies.isE2EFixtureProfile(input.profileId)) {
      return dependencies.listFixtureAssets(input);
    }
    const profile = dependencies.assertProfileExists(input.profileId);
    const secret = dependencies.getProfileSecretOrThrow(profile.id);
    const result = await dependencies.listStorageObjects(profile, secret, input);
    dependencies.publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-library.assets.observed',
        payload: {
          profileId: profile.id,
          bucket: profile.bucket,
          items: result.items,
        },
      }),
    );
    return result;
  },

  headAsset: async (input) => {
    if (dependencies.isE2EFixtureProfile(input.profileId)) {
      return assertFixtureAssetExists(input, dependencies);
    }
    const profile = dependencies.assertProfileExists(input.profileId);
    const cacheKey = dependencies.toAssetScopeKey(profile.id, input.key);
    const now = dependencies.nowMs();
    const cached = dependencies.getHeadCache(cacheKey);
    if (cached && cached.expiresAt > now) {
      dependencies.recordHeadHit();
      return cached.value;
    }

    const pending = dependencies.getHeadInFlight(cacheKey);
    if (pending) {
      dependencies.recordHeadInFlightHit();
      return pending;
    }
    dependencies.recordHeadMiss();

    const secret = dependencies.getProfileSecretOrThrow(profile.id);
    const task = dependencies
      .headStorageObject(profile, secret, input.key)
      .then((result) => {
        dependencies.setHeadCache(cacheKey, {
          value: result,
          expiresAt: dependencies.nowMs() + dependencies.headCacheTtlMs,
        });
        return result;
      })
      .finally(() => {
        dependencies.deleteHeadInFlight(cacheKey);
      });

    dependencies.setHeadInFlight(cacheKey, task);
    return task;
  },

  previewAsset: async (input) => {
    if (dependencies.isE2EFixtureProfile(input.profileId)) {
      assertFixtureAssetExists(input, dependencies);
      return dependencies.previewFixtureAsset(input);
    }
    const profile = dependencies.assertProfileExists(input.profileId);
    const maxBytes = dependencies.normalizePreviewMaxBytes(input.maxBytes);
    const cacheInput = {
      profileId: profile.id,
      bucket: profile.bucket,
      key: input.key,
      etag: input.etag,
      maxBytes,
    };

    const cached = await dependencies.readPreviewCache(cacheInput);
    if (cached) {
      dependencies.recordPreviewHit();
      return cached;
    }

    const inFlightKey = dependencies.toPreviewInFlightKey(
      {
        ...input,
        maxBytes,
      },
      profile.bucket,
    );
    const pending = dependencies.getPreviewInFlight(inFlightKey);
    if (pending) {
      dependencies.recordPreviewInFlightHit();
      return pending;
    }
    dependencies.recordPreviewMiss();

    const secret = dependencies.getProfileSecretOrThrow(profile.id);
    const task = dependencies
      .getStorageObjectPreview(profile, secret, {
        key: input.key,
        maxBytes,
      })
      .then(async (preview) => {
        await dependencies.writePreviewCache(cacheInput, preview).catch((): void => undefined);
        return preview;
      })
      .finally(() => {
        dependencies.deletePreviewInFlight(inFlightKey);
      });

    dependencies.setPreviewInFlight(inFlightKey, task);
    return task;
  },
});
