import { describe, expect, it } from 'vitest';
import {
  planAssetMove,
  planAssetRename,
  planBulkAssetMove,
} from '../../src/features/gallery/asset-mutation-command-policy';

describe('asset mutation command policy', () => {
  it('plans single-asset rename without allowing empty names or path separators', () => {
    expect(planAssetRename('photos/a.png', ' b.png ')).toEqual({
      kind: 'rename',
      destinationKey: 'photos/b.png',
    });
    expect(planAssetRename('photos/a.png', 'a.png')).toEqual({
      kind: 'no-change',
    });
    expect(() => planAssetRename('photos/a.png', '')).toThrow('File name is required.');
    expect(() => planAssetRename('photos/a.png', 'nested/b.png')).toThrow(
      'File name cannot include "/" or "\\".',
    );
  });

  it('plans single-asset moves with leading slash normalization', () => {
    expect(planAssetMove('photos/a.png', '/archive/a.png')).toEqual({
      kind: 'move',
      destinationKey: 'archive/a.png',
    });
    expect(planAssetMove('photos/a.png', 'photos/a.png')).toEqual({
      kind: 'no-change',
    });
    expect(() => planAssetMove('photos/a.png', '   ')).toThrow(
      'Destination key is required.',
    );
  });

  it('plans bulk moves and rejects duplicate destination file names', () => {
    expect(planBulkAssetMove(['photos/a.png', 'photos/b.png'], 'archive/')).toEqual({
      kind: 'ready',
      moves: [
        {
          sourceKey: 'photos/a.png',
          destinationKey: 'archive/a.png',
        },
        {
          sourceKey: 'photos/b.png',
          destinationKey: 'archive/b.png',
        },
      ],
      skippedCount: 0,
    });

    expect(planBulkAssetMove(['archive/a.png', 'photos/b.png'], 'archive/')).toEqual({
      kind: 'ready',
      moves: [
        {
          sourceKey: 'photos/b.png',
          destinationKey: 'archive/b.png',
        },
      ],
      skippedCount: 1,
    });

    expect(planBulkAssetMove(['photos/a.png', 'exports/a.png'], 'archive/')).toEqual({
      kind: 'duplicate-destination',
    });
  });
});
