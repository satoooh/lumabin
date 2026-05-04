import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  UI_STATE_STORAGE_KEY,
  type PersistedUiStateStore,
} from '../../src/features/gallery/use-persisted-ui-state';
import { useGalleryWorkspacePreferences } from '../../src/features/gallery/use-gallery-workspace-preferences';

describe('gallery workspace preferences hook', () => {
  it('restores global gallery preferences from the persisted store', () => {
    const persistedStore: PersistedUiStateStore = {
      global: {
        galleryScrollTop: 40,
        galleryTileMinWidth: 210,
        kindFilter: 'all',
        listScrollTop: 20,
        smartCollection: 'recent-views',
        sortBy: 'size',
        sortDirection: 'asc',
        viewMode: 'list',
      },
    };

    const { result } = renderHook(() =>
      useGalleryWorkspacePreferences({
        assetsPrefix: 'photos/',
        persistDebounceMs: 20,
        persistedStore,
        selectedProfileId: 'profile-1',
      }),
    );

    expect(result.current.viewMode).toBe('list');
    expect(result.current.sortBy).toBe('size');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.kindFilter).toBe('all');
    expect(result.current.smartCollection).toBe('recent-views');
    expect(result.current.galleryTileMinWidth).toBe(210);
    expect(result.current.listScrollTop).toBe(20);
    expect(result.current.galleryScrollTop).toBe(40);
  });

  it('persists updated preferences with the selected profile scope', () => {
    vi.useFakeTimers();
    const persistedStore: PersistedUiStateStore = {
      global: {
        assetsPrefix: 'existing/',
        viewMode: 'gallery',
      },
    };

    try {
      const { result } = renderHook(() =>
        useGalleryWorkspacePreferences({
          assetsPrefix: 'current/',
          persistDebounceMs: 20,
          persistedStore,
          selectedProfileId: 'profile-1',
        }),
      );

      act(() => {
        result.current.setViewMode('list');
        result.current.setSortBy('name');
        result.current.setSortDirection('asc');
        result.current.setKindFilter('pdf');
        result.current.setSmartCollection('large-files');
        result.current.setGalleryTileMinWidth(190);
        result.current.setListScrollTop(14);
        result.current.setGalleryScrollTop(28);
      });
      act(() => {
        vi.advanceTimersByTime(20);
      });

      expect(JSON.parse(window.localStorage.getItem(UI_STATE_STORAGE_KEY) ?? '{}')).toEqual({
        global: {
          assetsPrefix: 'current/',
          galleryScrollTop: 28,
          galleryTileMinWidth: 190,
          kindFilter: 'pdf',
          listScrollTop: 14,
          smartCollection: 'large-files',
          sortBy: 'name',
          sortDirection: 'asc',
          viewMode: 'list',
        },
        profiles: {
          'profile-1': {
            assetsPrefix: 'current/',
            galleryScrollTop: 28,
            galleryTileMinWidth: 190,
            kindFilter: 'pdf',
            listScrollTop: 14,
            smartCollection: 'large-files',
            sortBy: 'name',
            sortDirection: 'asc',
            viewMode: 'list',
          },
        },
      });
    } finally {
      vi.useRealTimers();
      window.localStorage.clear();
    }
  });
});
