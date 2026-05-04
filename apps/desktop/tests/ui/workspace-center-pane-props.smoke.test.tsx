import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createWorkspaceCenterPaneProps } from '../../src/features/layout/workspace-center-pane-props';
import type { AssetItem } from '../../src/shared/ipc';

const assetItem: AssetItem = {
  key: 'photos/a.png',
  size: 1024,
  contentType: 'image/png',
  lastModified: '2026-05-03T00:00:00.000Z',
  etag: 'etag',
};

const createMouseEvent = () =>
  ({ currentTarget: document.createElement('button') }) as Parameters<
    ReturnType<typeof createWorkspaceCenterPaneProps>['galleryPane']['onAssetClick']
  >[0];

describe('workspace center pane props', () => {
  it('maps center pane state and command intent into feature panes', () => {
    const handleLoadFirstPage = vi.fn();
    const handleOpenFilePicker = vi.fn();
    const handleSelectUnifiedFilter = vi.fn();
    const handleSearchClear = vi.fn();
    const handleResetViewFilters = vi.fn();
    const applyGalleryTileMinWidth = vi.fn();
    const scheduleGalleryTileMinWidthCommit = vi.fn();
    const flushGalleryTileMinWidthCommit = vi.fn();
    const commitGalleryTileMinWidth = vi.fn();
    const setViewMode = vi.fn();
    const handleSelectProfile = vi.fn();
    const handleStartNewProfile = vi.fn();
    const handleAssetItemClick = vi.fn();
    const handleAssetItemDoubleClick = vi.fn();
    const handleThumbnailDecodeError = vi.fn();
    const setAssetItemRef = vi.fn();
    const setSelectedAssetKey = vi.fn();
    const handleOpenBulkDeleteDialog = vi.fn();
    const handleOpenBulkMoveDialog = vi.fn();
    const handleSelectAllVisible = vi.fn();
    const setSelectedAssetKeys = vi.fn();
    const toggleSelectionMode = vi.fn();
    const onGalleryScroll = vi.fn();
    const onListScroll = vi.fn();
    const selectedAssetKeySet = new Set(['photos/a.png']);

    const props = createWorkspaceCenterPaneProps({
      assetList: {
        listBottomSpacerHeight: 20,
        listContainerRef: createRef<HTMLDivElement>(),
        listRovingAssetKey: 'photos/a.png',
        listTopSpacerHeight: 10,
        listVirtualItems: [assetItem],
        onListScroll,
      },
      display: {
        basenameFromKey: (key) => key.split('/').at(-1) ?? key,
        formatBytes: (value) => `${value} B`,
        formatDate: (value) => value,
        iconForKind: (kind) => kind,
        inferAssetKind: () => 'image',
        thumbnailCacheKey: (profileId, key) => `${profileId}:${key}`,
      },
      emptyState: {
        canClearSearch: true,
        canResetFilters: true,
        emptyStateMode: 'no-results',
        handleLoadFirstPage,
        handleOpenFilePicker,
        isListLoading: false,
        isUploadBusy: false,
      },
      filters: {
        activeKindLabel: 'Images',
        activeSearchQuery: 'sunset',
        activeSmartCollectionLabel: 'Recent',
        activeUnifiedFilterId: 'images',
        handleSearchClear,
        handleSelectUnifiedFilter,
        handleResetViewFilters,
        unifiedFilterOptions: [
          {
            id: 'images',
            label: 'Images',
            count: 1,
          },
        ],
      },
      gallery: {
        galleryColumnCount: 4,
        galleryDaySectionCount: 1,
        galleryRovingAssetKey: 'photos/a.png',
        galleryScrollRef: createRef<HTMLDivElement>(),
        galleryThumbnailErrors: {},
        galleryThumbnailLoading: {},
        galleryThumbnails: {},
        galleryVirtualRange: {
          bottomSpacerHeight: 0,
          topSpacerHeight: 0,
        },
        isGalleryScrolling: false,
        onGalleryScroll,
        visibleGallerySections: [
          {
            key: '2026-05-03',
            label: 'Today',
            items: [assetItem],
          },
        ],
      },
      guidedStart: {
        handleSelectProfile,
        handleStartNewProfile,
        profiles: [{ id: 'profile-1' }],
      },
      interaction: {
        handleAssetItemClick,
        handleAssetItemDoubleClick,
        handleThumbnailDecodeError,
        setAssetItemRef,
        setSelectedAssetKey,
      },
      selection: {
        handleOpenBulkDeleteDialog,
        handleOpenBulkMoveDialog,
        handleSelectAllVisible,
        isAssetActionBusy: false,
        isSelectionMode: true,
        selectedAssetCount: 1,
        selectedAssetKey: 'photos/a.png',
        selectedAssetKeySet,
        selectedProfileId: 'profile-1',
        setSelectedAssetKeys,
        toggleSelectionMode,
      },
      sizing: {
        applyGalleryTileMinWidth,
        commitGalleryTileMinWidth,
        flushGalleryTileMinWidthCommit,
        gallerySizeSliderRef: createRef<HTMLInputElement>(),
        galleryTileMinWidth: 176,
        galleryTileMinWidthDefault: 168,
        galleryTileMinWidthMax: 260,
        galleryTileMinWidthMin: 120,
        galleryTileMinWidthStep: 8,
        scheduleGalleryTileMinWidthCommit,
      },
      state: {
        isQuickPreviewOpen: false,
        showGuidedStart: false,
        viewMode: 'gallery',
        visibleItemCount: 1,
      },
      viewModeCommands: {
        setViewMode,
      },
    });

    props.guidedStart.onUseSavedProfile();
    props.galleryTopRow.onGalleryTileMinWidthInput(184);
    props.galleryTopRow.onGalleryTileMinWidthReset();
    props.selectionActionBar.onClearSelection();
    props.emptyState.onLoadFirstPage();
    props.galleryPane.onAssetClick(createMouseEvent(), assetItem, {
      hasThumbnailError: true,
      thumbnailCacheKey: 'profile-1:photos/a.png',
    });
    props.assetListPane.onAssetClick(createMouseEvent(), assetItem);

    expect(props.guidedStart.hasSavedProfile).toBe(true);
    expect(props.visibleItemCount).toBe(1);
    expect(props.galleryTopRow.viewMode).toBe('gallery');
    expect(props.galleryPane.selectedAssetKeySet).toBe(selectedAssetKeySet);
    expect(props.assetListPane.listVirtualItems).toEqual([assetItem]);
    expect(handleSelectProfile).toHaveBeenCalledWith('profile-1');
    expect(applyGalleryTileMinWidth).toHaveBeenCalledWith(184);
    expect(scheduleGalleryTileMinWidthCommit).toHaveBeenCalledWith(184);
    expect(commitGalleryTileMinWidth).toHaveBeenCalledWith(168);
    expect(setSelectedAssetKeys).toHaveBeenCalledWith([]);
    expect(handleLoadFirstPage).toHaveBeenCalledTimes(1);
    expect(handleAssetItemClick).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      assetItem,
      {
        hasThumbnailError: true,
        openPreviewOnSingleClick: true,
        thumbnailCacheKey: 'profile-1:photos/a.png',
      },
    );
    expect(handleAssetItemClick).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      assetItem,
      {
        hasThumbnailError: false,
        openPreviewOnSingleClick: false,
      },
    );
  });
});
