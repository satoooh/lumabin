import { describe, expect, it } from 'vitest';
import {
  planAssetMove,
  planAssetRename,
  planBulkAssetMove,
  planQueuedAssetDeleteSelection,
  summarizeBulkAssetMoveResult,
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

  it('plans selection after a queued single-asset delete', () => {
    expect(
      planQueuedAssetDeleteSelection(
        'photos/b.png',
        ['photos/a.png', 'photos/b.png', 'photos/c.png'],
        ['photos/a.png', 'photos/b.png'],
      ),
    ).toEqual({
      nextSelectedKey: 'photos/c.png',
      selectedKeys: ['photos/a.png'],
    });

    expect(
      planQueuedAssetDeleteSelection(
        'photos/c.png',
        ['photos/a.png', 'photos/c.png'],
        ['photos/c.png'],
      ),
    ).toEqual({
      nextSelectedKey: 'photos/a.png',
      selectedKeys: [],
    });
  });

  it('summarizes bulk move results for status and inline feedback', () => {
    expect(
      summarizeBulkAssetMoveResult({
        failedCount: 0,
        movedCount: 2,
        skippedCount: 1,
      }),
    ).toEqual({
      inlineFeedback: 'Moved 2 assets',
      statusLine: 'Moved 2 assets. Skipped 1 asset.',
      statusTone: 'success',
    });

    expect(
      summarizeBulkAssetMoveResult({
        failedCount: 1,
        movedCount: 0,
        skippedCount: 0,
      }),
    ).toEqual({
      inlineFeedback: undefined,
      statusLine: 'Moved 0 assets. Failed 1 asset.',
      statusTone: 'error',
    });
  });
});
