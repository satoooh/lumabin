import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSelectedProfileGalleryBootstrap } from '../../src/features/gallery/use-selected-profile-gallery-bootstrap';

const defaultOptions = {
  galleryTileMinWidthDefault: 176,
  loadAssetsPage: vi.fn(),
  normalizeGalleryTileMinWidth: (value: number) => value,
  normalizePrefix: (value: string) => (value.endsWith('/') || !value ? value : `${value}/`),
  resetAssetsResult: vi.fn(),
  resetGalleryThumbnails: vi.fn(),
  resetSearchState: vi.fn(),
  resolvePersistedUiStateForProfile: vi.fn(() => ({
    assetsPrefix: 'photos',
    galleryScrollTop: 20,
    galleryTileMinWidth: 210,
    kindFilter: 'image',
    listScrollTop: 10,
    smartCollection: 'all',
    sortBy: 'size',
    sortDirection: 'asc',
    viewMode: 'list',
  })),
  selectedProfileId: 'profile-1',
  setAssetActionDialog: vi.fn(),
  setAssetsPrefix: vi.fn(),
  setBulkDeleteDialogKeys: vi.fn(),
  setBulkMoveDialog: vi.fn(),
  setGalleryScrollTop: vi.fn(),
  setGalleryTileMinWidth: vi.fn(),
  setIsSelectionMode: vi.fn(),
  setKindFilter: vi.fn(),
  setListScrollTop: vi.fn(),
  setSelectedAssetKey: vi.fn(),
  setSelectedAssetKeys: vi.fn(),
  setSmartCollection: vi.fn(),
  setSortBy: vi.fn(),
  setSortDirection: vi.fn(),
  setViewMode: vi.fn(),
};

describe('selected profile gallery bootstrap hook', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('restores persisted profile UI state and loads the first asset page', () => {
    const Probe = () => {
      useSelectedProfileGalleryBootstrap(defaultOptions);
      return null;
    };

    render(<Probe />);

    expect(defaultOptions.setViewMode).toHaveBeenCalledWith('list');
    expect(defaultOptions.setSortBy).toHaveBeenCalledWith('size');
    expect(defaultOptions.setSortDirection).toHaveBeenCalledWith('asc');
    expect(defaultOptions.setKindFilter).toHaveBeenCalledWith('image');
    expect(defaultOptions.setSmartCollection).toHaveBeenCalledWith('all');
    expect(defaultOptions.setGalleryTileMinWidth).toHaveBeenCalledWith(210);
    expect(defaultOptions.setAssetsPrefix).toHaveBeenCalledWith('photos/');
    expect(defaultOptions.setListScrollTop).toHaveBeenCalledWith(10);
    expect(defaultOptions.setGalleryScrollTop).toHaveBeenCalledWith(20);
    expect(defaultOptions.loadAssetsPage).toHaveBeenCalledWith({
      profileId: 'profile-1',
      prefix: 'photos/',
      continuationToken: undefined,
      page: 1,
    });
  });

  it('clears gallery state when no profile is selected', () => {
    const Probe = () => {
      useSelectedProfileGalleryBootstrap({
        ...defaultOptions,
        selectedProfileId: '',
      });
      return null;
    };

    render(<Probe />);

    expect(defaultOptions.resetAssetsResult).toHaveBeenCalled();
    expect(defaultOptions.setKindFilter).toHaveBeenCalledWith('all');
    expect(defaultOptions.setSmartCollection).toHaveBeenCalledWith('all');
    expect(defaultOptions.setSelectedAssetKey).toHaveBeenCalledWith('');
    expect(defaultOptions.setSelectedAssetKeys).toHaveBeenCalledWith([]);
    expect(defaultOptions.setIsSelectionMode).toHaveBeenCalledWith(false);
    expect(defaultOptions.setAssetActionDialog).toHaveBeenCalledWith(null);
    expect(defaultOptions.setBulkMoveDialog).toHaveBeenCalledWith(null);
    expect(defaultOptions.setBulkDeleteDialogKeys).toHaveBeenCalledWith(null);
    expect(defaultOptions.resetGalleryThumbnails).toHaveBeenCalled();
    expect(defaultOptions.loadAssetsPage).not.toHaveBeenCalled();
  });
});
