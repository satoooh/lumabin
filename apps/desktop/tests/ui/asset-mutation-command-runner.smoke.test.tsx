import { describe, expect, it, vi } from 'vitest';
import {
  executeAssetMovePlan,
  executeAssetRenamePlan,
  executeBulkAssetMovePlan,
} from '../../src/features/gallery/asset-mutation-command-runner';

describe('asset mutation command runner', () => {
  it('executes single rename and move plans with bounded API payloads', async () => {
    const renameAsset = vi.fn().mockResolvedValue(undefined);
    const moveAsset = vi.fn().mockResolvedValue(undefined);

    await executeAssetRenamePlan({
      fromKey: 'photos/a.png',
      plan: {
        kind: 'rename',
        destinationKey: 'photos/b.png',
      },
      profileId: 'profile-1',
      renameAsset,
    });
    await executeAssetMovePlan({
      fromKey: 'photos/b.png',
      moveAsset,
      plan: {
        kind: 'move',
        destinationKey: 'archive/b.png',
      },
      profileId: 'profile-1',
    });

    expect(renameAsset).toHaveBeenCalledWith({
      fromKey: 'photos/a.png',
      profileId: 'profile-1',
      toKey: 'photos/b.png',
    });
    expect(moveAsset).toHaveBeenCalledWith({
      fromKey: 'photos/b.png',
      profileId: 'profile-1',
      toKey: 'archive/b.png',
    });
  });

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
