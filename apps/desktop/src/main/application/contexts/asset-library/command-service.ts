import {
  createApplicationEvent,
  type ApplicationEvent,
} from '../../events/event-bus';
import type {
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
  deleteAssetsOverride(input: DeleteAssetsInput): Promise<DeleteResult | undefined>;
  deleteStorageObjects(
    profile: StoredProfile,
    secret: ProfileSecret,
    input: { keys: string[] },
  ): Promise<DeleteResult>;
  getProfileSecretOrThrow(profileId: string): ProfileSecret;
  moveAssetOverride(input: MoveAssetInput): Promise<MoveResult | undefined>;
  publishApplicationEvent(event: ApplicationEvent): void;
  renameAssetOverride(input: RenameAssetInput): Promise<RenameResult | undefined>;
}

const toMutationResult = (
  input: RenameAssetInput | MoveAssetInput,
): RenameResult | MoveResult => ({
  ok: true,
  fromKey: input.fromKey,
  toKey: input.toKey,
});

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
    const overrideResult = await dependencies.renameAssetOverride(input);
    if (overrideResult !== undefined) {
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
      return overrideResult;
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
    const overrideResult = await dependencies.moveAssetOverride(input);
    if (overrideResult !== undefined) {
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
      return overrideResult;
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
    const overrideResult = await dependencies.deleteAssetsOverride(input);
    if (overrideResult !== undefined) {
      dependencies.publishApplicationEvent(
        createApplicationEvent({
          type: 'asset-library.assets.deleted',
          payload: {
            profileId: input.profileId,
            keys: overrideResult.deleted,
            deletedCount: overrideResult.deleted.length,
            skippedCount: overrideResult.skipped.length,
          },
        }),
      );
      return overrideResult;
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
