import { describe, expect, it, vi } from 'vitest';
import { createAssetProjectionInvalidator } from '../../src/main/application/contexts/asset-library/projection-invalidation-service';

describe('asset projection invalidation service', () => {
  it('clears every profile-scoped projection when a workspace profile is removed', async () => {
    const dependencies = {
      clearHeadAssetCacheForKey: vi.fn(),
      clearHeadAssetCacheForProfile: vi.fn(),
      clearSearchSnapshotCacheForProfile: vi.fn(),
      removePreviewCacheForProfile: vi.fn(async () => undefined),
      searchReadModelWriter: { clearProfile: vi.fn() },
    };
    const invalidator = createAssetProjectionInvalidator(dependencies);

    invalidator.clearProfileProjections('profile-1');
    await Promise.resolve();

    expect(dependencies.clearHeadAssetCacheForProfile).toHaveBeenCalledWith('profile-1');
    expect(dependencies.clearSearchSnapshotCacheForProfile).toHaveBeenCalledWith(
      'profile-1',
    );
    expect(dependencies.removePreviewCacheForProfile).toHaveBeenCalledWith('profile-1');
    expect(dependencies.searchReadModelWriter.clearProfile).toHaveBeenCalledWith(
      'profile-1',
    );
    expect(dependencies.clearHeadAssetCacheForKey).not.toHaveBeenCalled();
  });

  it('clears only key-scoped and search snapshot projections after object mutation', () => {
    const dependencies = {
      clearHeadAssetCacheForKey: vi.fn(),
      clearHeadAssetCacheForProfile: vi.fn(),
      clearSearchSnapshotCacheForProfile: vi.fn(),
      removePreviewCacheForProfile: vi.fn(async () => undefined),
      searchReadModelWriter: { clearProfile: vi.fn() },
    };
    const invalidator = createAssetProjectionInvalidator(dependencies);

    invalidator.clearObjectMutationProjections('profile-1', 'photos/a.png');

    expect(dependencies.clearHeadAssetCacheForKey).toHaveBeenCalledWith(
      'profile-1',
      'photos/a.png',
    );
    expect(dependencies.clearSearchSnapshotCacheForProfile).toHaveBeenCalledWith(
      'profile-1',
    );
    expect(dependencies.clearHeadAssetCacheForProfile).not.toHaveBeenCalled();
    expect(dependencies.searchReadModelWriter.clearProfile).not.toHaveBeenCalled();
    expect(dependencies.removePreviewCacheForProfile).not.toHaveBeenCalled();
  });
});
