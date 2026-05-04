import { describe, expect, it, vi } from 'vitest';
import {
  createApplicationEvent,
  publishApplicationEvent,
} from '../../src/main/application/events/event-bus';
import { registerAssetLibraryProjectionSubscribers } from '../../src/main/application/contexts/asset-library/projection-subscribers';

const item = {
  key: 'photos/a.png',
  contentType: 'image/png',
  etag: 'etag-a',
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 100,
};

const createDependencies = () => ({
  clearObjectMutation: vi.fn(),
  clearSearchSnapshotCacheForProfile: vi.fn(),
  searchReadModelWriter: {
    removeAssets: vi.fn(),
    renameAsset: vi.fn(),
    upsertAssets: vi.fn(),
  },
});

describe('asset library projection subscribers', () => {
  it('projects observed assets into the search read model', () => {
    const dependencies = createDependencies();
    const unsubscribe = registerAssetLibraryProjectionSubscribers(dependencies);

    publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-library.assets.observed',
        payload: {
          profileId: 'profile-1',
          bucket: 'assets',
          items: [item],
        },
      }),
    );
    unsubscribe();

    expect(dependencies.searchReadModelWriter.upsertAssets).toHaveBeenCalledWith({
      profileId: 'profile-1',
      bucket: 'assets',
      items: [item],
    });
    expect(dependencies.clearSearchSnapshotCacheForProfile).toHaveBeenCalledWith(
      'profile-1',
    );
    expect(dependencies.clearObjectMutation).not.toHaveBeenCalled();
  });

  it('stops projecting after unsubscribe', () => {
    const dependencies = createDependencies();
    const unsubscribe = registerAssetLibraryProjectionSubscribers(dependencies);
    unsubscribe();

    publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-library.assets.observed',
        payload: {
          profileId: 'profile-1',
          bucket: 'assets',
          items: [item],
        },
      }),
    );

    expect(dependencies.searchReadModelWriter.upsertAssets).not.toHaveBeenCalled();
    expect(dependencies.clearSearchSnapshotCacheForProfile).not.toHaveBeenCalled();
  });

  it('keeps mutation projection behavior for renamed and deleted assets', () => {
    const dependencies = createDependencies();
    const unsubscribe = registerAssetLibraryProjectionSubscribers(dependencies);

    publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-library.asset.renamed',
        payload: {
          profileId: 'profile-1',
          bucket: 'assets',
          fromKey: 'photos/a.png',
          toKey: 'photos/b.png',
        },
      }),
    );
    publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-library.assets.deleted',
        payload: {
          profileId: 'profile-1',
          bucket: 'assets',
          keys: ['photos/b.png'],
          deletedCount: 1,
          skippedCount: 0,
        },
      }),
    );
    unsubscribe();

    expect(dependencies.clearObjectMutation).toHaveBeenCalledWith(
      'profile-1',
      'photos/a.png',
    );
    expect(dependencies.clearObjectMutation).toHaveBeenCalledWith(
      'profile-1',
      'photos/b.png',
    );
    expect(dependencies.searchReadModelWriter.renameAsset).toHaveBeenCalledWith({
      profileId: 'profile-1',
      bucket: 'assets',
      fromKey: 'photos/a.png',
      toKey: 'photos/b.png',
    });
    expect(dependencies.searchReadModelWriter.removeAssets).toHaveBeenCalledWith({
      profileId: 'profile-1',
      bucket: 'assets',
      keys: ['photos/b.png'],
    });
  });
});
