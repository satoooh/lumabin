import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { serializeSavedViewQuery } from '../../src/features/gallery/saved-view-state';
import { useGallerySettingsWorkbench } from '../../src/features/workbench/use-gallery-settings-workbench';
import type { SavedView } from '../../src/shared/ipc';

describe('useGallerySettingsWorkbench', () => {
  it('owns saved view commands and browser session handoff for workspace settings', async () => {
    const savedView: SavedView = {
      id: 'view-1',
      name: 'Camera roll',
      pinned: true,
      query: serializeSavedViewQuery({
        prefix: 'photos/',
        search: 'camera',
        viewMode: 'list',
        sortBy: 'name',
        sortDirection: 'asc',
        kindFilter: 'image',
        smartCollection: 'all',
      }),
      updatedAt: '2026-05-03T00:00:00.000Z',
    };
    const savedViewApi = {
      deleteSavedView: vi.fn().mockResolvedValue(undefined),
      saveView: vi.fn().mockResolvedValue(savedView),
    };
    const loadAssetsPage = vi.fn().mockResolvedValue(undefined);
    const loadSavedViews = vi.fn().mockResolvedValue(undefined);
    const runSearch = vi.fn().mockResolvedValue(undefined);
    const setAssetsPrefix = vi.fn();
    const setIsSearchBusy = vi.fn();
    const setKindFilter = vi.fn();
    const setNewSavedViewName = vi.fn();
    const setSearchInput = vi.fn();
    const setSmartCollection = vi.fn();
    const setSortBy = vi.fn();
    const setSortDirection = vi.fn();
    const setStatusLine = vi.fn();
    const setViewMode = vi.fn();

    const { result } = renderHook(() =>
      useGallerySettingsWorkbench({
        activeKindFilter: 'all',
        activeSearchQuery: '',
        activeSmartCollection: 'all',
        assetsPrefix: 'photos/',
        browserPrefixes: ['photos/2026/'],
        handleLoadFirstPage: vi.fn(),
        handleLoadNextPage: vi.fn(),
        handleOpenPrefix: vi.fn(),
        isListLoading: false,
        isNextPageDisabled: false,
        isSearchBusy: false,
        loadAssetsPage,
        loadSavedViews,
        newSavedViewName: 'Recent cameras',
        runSearch,
        savedViewApi,
        savedViews: [savedView],
        searchInput: 'camera',
        selectedProfileId: 'profile-1',
        setAssetsPrefix,
        setIsSearchBusy,
        setKindFilter,
        setNewSavedViewName,
        setSearchInput,
        setSmartCollection,
        setSortBy,
        setSortDirection,
        setStatusLine,
        setViewMode,
        sortBy: 'modified',
        sortDirection: 'desc',
        viewMode: 'gallery',
      }),
    );

    await act(async () => {
      await result.current.savedViews.handleSaveCurrentView();
      await result.current.savedViews.handleApplySavedView(savedView);
      await result.current.savedViews.handleDeleteSavedView(savedView.id);
    });

    expect(result.current.browserSession).toMatchObject({
      assetsPrefix: 'photos/',
      prefixes: ['photos/2026/'],
    });
    expect(result.current.savedViews.savedViews).toEqual([savedView]);
    expect(result.current.viewDefaults).toMatchObject({
      sortBy: 'modified',
      sortDirection: 'desc',
      viewMode: 'gallery',
    });
    expect(savedViewApi.saveView).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Recent cameras',
        pinned: true,
      }),
    );
    expect(runSearch).toHaveBeenCalledWith('camera');
    expect(savedViewApi.deleteSavedView).toHaveBeenCalledWith('view-1');
    expect(loadSavedViews).toHaveBeenCalledTimes(2);
    expect(setAssetsPrefix).toHaveBeenCalledWith('photos/');
    expect(setSearchInput).toHaveBeenCalledWith('camera');
    expect(setViewMode).toHaveBeenCalledWith('list');
    expect(setSortBy).toHaveBeenCalledWith('name');
    expect(setSortDirection).toHaveBeenCalledWith('asc');
    expect(setKindFilter).toHaveBeenCalledWith('image');
  });
});
