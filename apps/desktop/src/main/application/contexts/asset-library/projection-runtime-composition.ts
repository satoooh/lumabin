import { removePreviewCacheForProfile } from '../../../asset-cache';
import {
  clearHeadAssetCacheForKey,
  clearHeadAssetCacheForProfile,
  clearSearchSnapshotCacheForProfile,
} from '../../../repositories/asset-projection-cache-repository';
import { sqliteAssetSearchReadModelRepository } from '../../../repositories/sqlite-asset-search-read-model-repository';
import {
  createAssetProjectionInvalidator,
  type AssetProjectionInvalidator,
} from './projection-invalidation-service';
import { registerAssetLibraryProjectionSubscribers } from './projection-subscribers';

export interface AssetLibraryProjectionRuntime extends AssetProjectionInvalidator {
  dispose(): void;
}

export const registerAssetLibraryProjectionRuntime =
  (): AssetLibraryProjectionRuntime => {
    const invalidator = createAssetProjectionInvalidator({
      clearHeadAssetCacheForKey,
      clearHeadAssetCacheForProfile,
      clearSearchSnapshotCacheForProfile,
      removePreviewCacheForProfile,
      searchReadModelWriter: sqliteAssetSearchReadModelRepository,
    });

    const unsubscribe = registerAssetLibraryProjectionSubscribers({
      clearObjectMutation: invalidator.clearObjectMutationProjections,
      clearSearchSnapshotCacheForProfile,
      searchReadModelWriter: sqliteAssetSearchReadModelRepository,
    });

    return {
      ...invalidator,
      dispose: unsubscribe,
    };
  };
