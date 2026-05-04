import { describe, expect, it } from 'vitest';
import {
  filterVisibleAssetKeys,
  isAssetActionDialogVisible,
  reconcileSelectedAssetKeysForVisibleItems,
  reconcileBulkDeleteKeysForVisibleItems,
  reconcileBulkMoveDialogForVisibleItems,
} from '../../src/features/gallery/use-gallery-dialog-guards';
import type { AssetItem } from '../../src/shared/ipc';

const visibleItems: AssetItem[] = [
  {
    contentType: 'image/png',
    etag: 'etag-a',
    key: 'photos/a.png',
    lastModified: '2026-05-02T00:00:00.000Z',
    size: 100,
  },
  {
    contentType: 'image/png',
    etag: 'etag-b',
    key: 'photos/b.png',
    lastModified: '2026-05-02T00:00:00.000Z',
    size: 200,
  },
];

describe('gallery dialog guards', () => {
  it('keeps selected keys that are still visible', () => {
    expect(filterVisibleAssetKeys(['photos/a.png', 'missing.png'], visibleItems)).toEqual([
      'photos/a.png',
    ]);
  });

  it('preserves the selected key reference when no pruning is needed', () => {
    const selectedKeys = ['photos/a.png', 'photos/b.png'];

    expect(reconcileSelectedAssetKeysForVisibleItems(selectedKeys, visibleItems)).toBe(
      selectedKeys,
    );
    expect(
      reconcileSelectedAssetKeysForVisibleItems(['photos/a.png', 'missing.png'], visibleItems),
    ).toEqual(['photos/a.png']);
  });

  it('detects whether a single asset action still targets a visible asset', () => {
    expect(
      isAssetActionDialogVisible(
        { inputValue: 'a-renamed.png', key: 'photos/a.png', kind: 'rename' },
        visibleItems,
      ),
    ).toBe(true);
    expect(
      isAssetActionDialogVisible(
        { inputValue: 'missing-renamed.png', key: 'missing.png', kind: 'rename' },
        visibleItems,
      ),
    ).toBe(false);
  });

  it('prunes bulk move dialogs to visible keys', () => {
    expect(
      reconcileBulkMoveDialogForVisibleItems(
        {
          destinationPrefix: 'archive/',
          keys: ['photos/a.png', 'missing.png'],
        },
        visibleItems,
      ),
    ).toEqual({
      destinationPrefix: 'archive/',
      keys: ['photos/a.png'],
    });

    expect(
      reconcileBulkMoveDialogForVisibleItems(
        {
          destinationPrefix: 'archive/',
          keys: ['missing.png'],
        },
        visibleItems,
      ),
    ).toBeNull();
  });

  it('prunes bulk delete dialogs to visible keys', () => {
    expect(
      reconcileBulkDeleteKeysForVisibleItems(
        ['photos/b.png', 'missing.png'],
        visibleItems,
      ),
    ).toEqual(['photos/b.png']);

    expect(reconcileBulkDeleteKeysForVisibleItems(['missing.png'], visibleItems)).toBeNull();
  });
});
