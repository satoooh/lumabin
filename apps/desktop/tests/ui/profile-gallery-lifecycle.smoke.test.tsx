import { act, renderHook } from '@testing-library/react';
import type { SetStateAction } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useWorkspaceGalleryLifecycleWorkbench } from '../../src/features/workbench/use-workspace-gallery-lifecycle-workbench';
import type { AssetItem } from '../../src/shared/ipc';

const applyStateAction = <T,>(current: T, next: SetStateAction<T>): T =>
  typeof next === 'function' ? (next as (value: T) => T)(current) : next;

describe('workspace gallery lifecycle workbench', () => {
  it('exposes semantic gallery cleanup commands for profile lifecycle events', () => {
    let activeSearchQuery = 'camera';
    let searchInput = 'camera';
    let searchItems: AssetItem[] = [
      {
        contentType: 'image/png',
        etag: '"etag"',
        key: 'photos/a.png',
        lastModified: '2026-05-03T00:00:00.000Z',
        size: 123,
      },
    ];
    let selectedAssetKey = 'photos/a.png';
    const resetAssetsResult = vi.fn();

    const { result } = renderHook(() =>
      useWorkspaceGalleryLifecycleWorkbench({
        resetAssetsResult,
        setActiveSearchQuery: (next) => {
          activeSearchQuery = applyStateAction(activeSearchQuery, next);
        },
        setSearchInput: (next) => {
          searchInput = applyStateAction(searchInput, next);
        },
        setSearchItems: (next) => {
          searchItems = applyStateAction(searchItems, next);
        },
        setSelectedAssetKey: (next) => {
          selectedAssetKey = applyStateAction(selectedAssetKey, next);
        },
      }),
    );

    act(() => {
      result.current.handleProfileSelected();
    });

    expect(activeSearchQuery).toBe('');
    expect(searchInput).toBe('');
    expect(searchItems).toEqual([]);

    act(() => {
      result.current.handleProfileDeleted();
    });

    expect(resetAssetsResult).toHaveBeenCalledTimes(1);
    expect(selectedAssetKey).toBe('');
  });
});
