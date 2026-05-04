import {
  subscribeToApplicationEvents,
  type ApplicationEvent,
} from '../../events/event-bus';
import type { AssetSearchReadModelWriter } from '../../read-models/asset-search-read-model';

interface AssetLibraryProjectionDependencies {
  clearObjectMutation(profileId: string, key: string): void;
  clearSearchSnapshotCacheForProfile(profileId: string): void;
  searchReadModelWriter: Pick<
    AssetSearchReadModelWriter,
    'removeAssets' | 'renameAsset' | 'upsertAssets'
  >;
}

const handleAssetRenamedOrMoved = (
  event: Extract<
    ApplicationEvent,
    { type: 'asset-library.asset.renamed' | 'asset-library.asset.moved' }
  >,
  dependencies: AssetLibraryProjectionDependencies,
): void => {
  const { bucket, fromKey, profileId, toKey } = event.payload;
  if (!fromKey || !toKey) {
    return;
  }

  dependencies.clearObjectMutation(profileId, fromKey);
  dependencies.clearObjectMutation(profileId, toKey);
  if (!bucket) {
    return;
  }
  dependencies.searchReadModelWriter.renameAsset({
    profileId,
    bucket,
    fromKey,
    toKey,
  });
};

const handleAssetsDeleted = (
  event: Extract<ApplicationEvent, { type: 'asset-library.assets.deleted' }>,
  dependencies: AssetLibraryProjectionDependencies,
): void => {
  const { bucket, keys, profileId } = event.payload;
  if (!keys || keys.length === 0) {
    return;
  }

  for (const key of keys) {
    dependencies.clearObjectMutation(profileId, key);
  }
  if (!bucket) {
    return;
  }
  dependencies.searchReadModelWriter.removeAssets({
    profileId,
    bucket,
    keys,
  });
};

const handleAssetsObserved = (
  event: Extract<ApplicationEvent, { type: 'asset-library.assets.observed' }>,
  dependencies: AssetLibraryProjectionDependencies,
): void => {
  const { bucket, items, profileId } = event.payload;
  dependencies.searchReadModelWriter.upsertAssets({
    profileId,
    bucket,
    items,
  });
  dependencies.clearSearchSnapshotCacheForProfile(profileId);
};

export const registerAssetLibraryProjectionSubscribers = (
  dependencies: AssetLibraryProjectionDependencies,
): (() => void) =>
  subscribeToApplicationEvents((event) => {
    if (
      event.type === 'asset-library.asset.renamed' ||
      event.type === 'asset-library.asset.moved'
    ) {
      handleAssetRenamedOrMoved(event, dependencies);
      return;
    }

    if (event.type === 'asset-library.assets.deleted') {
      handleAssetsDeleted(event, dependencies);
      return;
    }

    if (event.type === 'asset-library.assets.observed') {
      handleAssetsObserved(event, dependencies);
    }
  });
