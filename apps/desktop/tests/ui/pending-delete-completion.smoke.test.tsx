import { act, renderHook } from '@testing-library/react';
import type { SetStateAction } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  removeDeletedAssetKeys,
  usePendingDeleteCompletion,
} from '../../src/features/gallery/use-pending-delete-completion';
import type { DeleteResult } from '../../src/shared/ipc';

const deleteResult = (deleted: string[]): DeleteResult => ({
  deleted,
  skipped: [],
});

const applyStateAction = <T,>(current: T, next: SetStateAction<T>): T =>
  typeof next === 'function' ? (next as (value: T) => T)(current) : next;

describe('pending delete completion', () => {
  it('removes deleted keys from the current selection', () => {
    expect(
      removeDeletedAssetKeys(
        ['photos/a.png', 'photos/b.png', 'photos/c.png'],
        ['photos/b.png'],
      ),
    ).toEqual(['photos/a.png', 'photos/c.png']);
  });

  it('refreshes and closes preview when the selected asset was deleted', async () => {
    let selectedAssetKeys = ['photos/a.png', 'photos/b.png'];
    let selectedAssetKey = 'photos/a.png';
    let isQuickPreviewOpen = true;
    const reloadCurrentItems = vi.fn(async () => undefined);

    const { result } = renderHook(() =>
      usePendingDeleteCompletion({
        reloadCurrentItems,
        selectedAssetKey,
        selectedProfileId: 'profile-1',
        setIsQuickPreviewOpen: (next) => {
          isQuickPreviewOpen = applyStateAction(isQuickPreviewOpen, next);
        },
        setSelectedAssetKey: (next) => {
          selectedAssetKey = applyStateAction(selectedAssetKey, next);
        },
        setSelectedAssetKeys: (next) => {
          selectedAssetKeys = applyStateAction(selectedAssetKeys, next);
        },
      }),
    );

    await act(async () => {
      await result.current(
        {
          createdAt: 0,
          executeAt: 0,
          id: 'delete-1',
          keys: ['photos/a.png'],
          profileId: 'profile-1',
        },
        deleteResult(['photos/a.png']),
      );
    });

    expect(reloadCurrentItems).toHaveBeenCalledTimes(1);
    expect(selectedAssetKeys).toEqual(['photos/b.png']);
    expect(selectedAssetKey).toBe('');
    expect(isQuickPreviewOpen).toBe(false);
  });

  it('ignores completions from inactive profiles', async () => {
    let selectedAssetKeys = ['photos/a.png'];
    let selectedAssetKey = 'photos/a.png';
    let isQuickPreviewOpen = true;
    const reloadCurrentItems = vi.fn(async () => undefined);

    const { result } = renderHook(() =>
      usePendingDeleteCompletion({
        reloadCurrentItems,
        selectedAssetKey,
        selectedProfileId: 'profile-1',
        setIsQuickPreviewOpen: (next) => {
          isQuickPreviewOpen = applyStateAction(isQuickPreviewOpen, next);
        },
        setSelectedAssetKey: (next) => {
          selectedAssetKey = applyStateAction(selectedAssetKey, next);
        },
        setSelectedAssetKeys: (next) => {
          selectedAssetKeys = applyStateAction(selectedAssetKeys, next);
        },
      }),
    );

    await act(async () => {
      await result.current(
        {
          createdAt: 0,
          executeAt: 0,
          id: 'delete-1',
          keys: ['photos/a.png'],
          profileId: 'other-profile',
        },
        deleteResult(['photos/a.png']),
      );
    });

    expect(reloadCurrentItems).not.toHaveBeenCalled();
    expect(selectedAssetKeys).toEqual(['photos/a.png']);
    expect(selectedAssetKey).toBe('photos/a.png');
    expect(isQuickPreviewOpen).toBe(true);
  });
});
