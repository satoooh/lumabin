import {
  createApplicationEvent,
  type ApplicationEvent,
} from '../../events/event-bus';
import type {
  AssetMetadata,
  DeleteAssetsInput,
  DeleteResult,
  MoveAssetInput,
  MoveResult,
  ProfileSummary,
  RenameAssetInput,
  RenameResult,
} from '../../../../shared/ipc';

type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

type ProfileSecret = {
  accessKeyId: string;
  secretAccessKey: string;
};

export interface AssetLibraryCommandService {
  deleteAssets(input: DeleteAssetsInput): Promise<DeleteResult>;
  moveAsset(input: MoveAssetInput): Promise<MoveResult>;
  renameAsset(input: RenameAssetInput): Promise<RenameResult>;
}

export interface AssetLibraryCommandServiceDependencies {
  assertProfileExists(profileId: string): StoredProfile;
  copyStorageObject(
    profile: StoredProfile,
    secret: ProfileSecret,
    input: { fromKey: string; toKey: string },
  ): Promise<void>;
  createEtagSuffix(): string;
  deleteFixtureAsset(key: string): boolean;
  deleteStorageObjects(
    profile: StoredProfile,
    secret: ProfileSecret,
    input: { keys: string[] },
  ): Promise<DeleteResult>;
  getFixtureAsset(key: string): AssetMetadata | undefined;
  getProfileSecretOrThrow(profileId: string): ProfileSecret;
  isE2EFixtureProfile(profileId: string): boolean;
  nowIso(): string;
  publishApplicationEvent(event: ApplicationEvent): void;
  saveFixtureAsset(key: string, metadata: AssetMetadata): void;
}

const toMutationResult = (
  input: RenameAssetInput | MoveAssetInput,
): RenameResult | MoveResult => ({
  ok: true,
  fromKey: input.fromKey,
  toKey: input.toKey,
});

const mutateFixtureAsset = (
  input: RenameAssetInput | MoveAssetInput,
  options: { etagPrefix: string },
  dependencies: AssetLibraryCommandServiceDependencies,
): void => {
  const source = dependencies.getFixtureAsset(input.fromKey);
  if (!source) {
    throw new Error(`Asset not found: ${input.fromKey}`);
  }

  const next: AssetMetadata = {
    ...source,
    key: input.toKey,
    lastModified: dependencies.nowIso(),
    etag: `"${options.etagPrefix}-${dependencies.createEtagSuffix()}"`,
  };
  dependencies.saveFixtureAsset(input.toKey, next);
  dependencies.deleteFixtureAsset(input.fromKey);
};

const copyThenRemoveOriginal = async (
  input: RenameAssetInput | MoveAssetInput,
  options: { failureLabel: string },
  dependencies: AssetLibraryCommandServiceDependencies,
): Promise<StoredProfile> => {
  const profile = dependencies.assertProfileExists(input.profileId);
  const secret = dependencies.getProfileSecretOrThrow(profile.id);
  await dependencies.copyStorageObject(profile, secret, {
    fromKey: input.fromKey,
    toKey: input.toKey,
  });
  const deleteResult = await dependencies.deleteStorageObjects(profile, secret, {
    keys: [input.fromKey],
  });
  if (!deleteResult.deleted.includes(input.fromKey)) {
    throw new Error(`Failed to remove original key after ${options.failureLabel}: ${input.fromKey}`);
  }
  return profile;
};

export const createAssetLibraryCommandService = (
  dependencies: AssetLibraryCommandServiceDependencies,
): AssetLibraryCommandService => ({
  renameAsset: async (input) => {
    if (dependencies.isE2EFixtureProfile(input.profileId)) {
      mutateFixtureAsset(input, { etagPrefix: 'e2e-rename' }, dependencies);
      dependencies.publishApplicationEvent(
        createApplicationEvent({
          type: 'asset-library.asset.renamed',
          payload: {
            profileId: input.profileId,
            fromKey: input.fromKey,
            toKey: input.toKey,
          },
        }),
      );
      return toMutationResult(input);
    }

    const profile = await copyThenRemoveOriginal(
      input,
      { failureLabel: 'rename' },
      dependencies,
    );
    dependencies.publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-library.asset.renamed',
        payload: {
          bucket: profile.bucket,
          profileId: input.profileId,
          fromKey: input.fromKey,
          toKey: input.toKey,
        },
      }),
    );
    return toMutationResult(input);
  },

  moveAsset: async (input) => {
    if (dependencies.isE2EFixtureProfile(input.profileId)) {
      mutateFixtureAsset(input, { etagPrefix: 'e2e-move' }, dependencies);
      dependencies.publishApplicationEvent(
        createApplicationEvent({
          type: 'asset-library.asset.moved',
          payload: {
            profileId: input.profileId,
            fromKey: input.fromKey,
            toKey: input.toKey,
          },
        }),
      );
      return toMutationResult(input);
    }

    const profile = await copyThenRemoveOriginal(
      input,
      { failureLabel: 'move' },
      dependencies,
    );
    dependencies.publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-library.asset.moved',
        payload: {
          bucket: profile.bucket,
          profileId: input.profileId,
          fromKey: input.fromKey,
          toKey: input.toKey,
        },
      }),
    );
    return toMutationResult(input);
  },

  deleteAssets: async (input) => {
    if (dependencies.isE2EFixtureProfile(input.profileId)) {
      const deleted: string[] = [];
      const skipped: string[] = [];
      for (const key of input.keys) {
        if (dependencies.deleteFixtureAsset(key)) {
          deleted.push(key);
        } else {
          skipped.push(key);
        }
      }
      dependencies.publishApplicationEvent(
        createApplicationEvent({
          type: 'asset-library.assets.deleted',
          payload: {
            profileId: input.profileId,
            keys: deleted,
            deletedCount: deleted.length,
            skippedCount: skipped.length,
          },
        }),
      );
      return { deleted, skipped };
    }

    const profile = dependencies.assertProfileExists(input.profileId);
    const secret = dependencies.getProfileSecretOrThrow(profile.id);
    const result = await dependencies.deleteStorageObjects(profile, secret, {
      keys: input.keys,
    });
    dependencies.publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-library.assets.deleted',
        payload: {
          bucket: profile.bucket,
          profileId: input.profileId,
          keys: result.deleted,
          deletedCount: result.deleted.length,
          skippedCount: result.skipped.length,
        },
      }),
    );
    return result;
  },
});
