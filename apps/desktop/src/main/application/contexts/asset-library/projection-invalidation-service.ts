import type { AssetSearchReadModelWriter } from '../../read-models/asset-search-read-model';

export interface AssetProjectionInvalidator {
  clearObjectMutationProjections(profileId: string, key: string): void;
  clearProfileProjections(profileId: string): void;
}

export interface AssetProjectionInvalidatorDependencies {
  clearHeadAssetCacheForKey(profileId: string, key: string): void;
  clearHeadAssetCacheForProfile(profileId: string): void;
  clearSearchSnapshotCacheForProfile(profileId: string): void;
  removePreviewCacheForProfile(profileId: string): Promise<void>;
  searchReadModelWriter: Pick<AssetSearchReadModelWriter, 'clearProfile'>;
}

const ignoreCacheError = (error: unknown): void => {
  void error;
};

export const createAssetProjectionInvalidator = (
  dependencies: AssetProjectionInvalidatorDependencies,
): AssetProjectionInvalidator => ({
  clearProfileProjections: (profileId) => {
    dependencies.clearHeadAssetCacheForProfile(profileId);
    dependencies.clearSearchSnapshotCacheForProfile(profileId);
    void dependencies.removePreviewCacheForProfile(profileId).catch(ignoreCacheError);
    dependencies.searchReadModelWriter.clearProfile(profileId);
  },
  clearObjectMutationProjections: (profileId, key) => {
    dependencies.clearHeadAssetCacheForKey(profileId, key);
    dependencies.clearSearchSnapshotCacheForProfile(profileId);
  },
});
