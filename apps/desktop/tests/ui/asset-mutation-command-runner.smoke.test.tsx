import { describe, expect, it, vi } from 'vitest';
import { executeBulkAssetMovePlan } from '../../src/features/gallery/asset-mutation-command-runner';

describe('asset mutation command runner', () => {
  it('executes bulk moves and reports failed source keys without stopping the batch', async () => {
    const moveAsset = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('copy failed'))
      .mockResolvedValueOnce(undefined);

    await expect(
      executeBulkAssetMovePlan({
        moveAsset,
        moves: [
          {
            sourceKey: 'photos/a.png',
            destinationKey: 'archive/a.png',
          },
          {
            sourceKey: 'photos/b.png',
            destinationKey: 'archive/b.png',
          },
          {
            sourceKey: 'photos/c.png',
            destinationKey: 'archive/c.png',
          },
        ],
        profileId: 'profile-1',
      }),
    ).resolves.toEqual({
      failedKeys: ['photos/b.png'],
      movedCount: 2,
    });

    expect(moveAsset).toHaveBeenNthCalledWith(1, {
      fromKey: 'photos/a.png',
      profileId: 'profile-1',
      toKey: 'archive/a.png',
    });
    expect(moveAsset).toHaveBeenNthCalledWith(2, {
      fromKey: 'photos/b.png',
      profileId: 'profile-1',
      toKey: 'archive/b.png',
    });
    expect(moveAsset).toHaveBeenNthCalledWith(3, {
      fromKey: 'photos/c.png',
      profileId: 'profile-1',
      toKey: 'archive/c.png',
    });
  });
});
