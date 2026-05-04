import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  GALLERY_TILE_MIN_WIDTH_MAX,
  GALLERY_TILE_MIN_WIDTH_MIN,
  GALLERY_TILE_MIN_WIDTH_SLIDER_STEP,
} from '../../src/features/gallery/gallery-layout-policy';
import { createDesktopWorkbenchCenterPaneCoordinationProps } from '../../src/features/workbench/desktop-workbench-center-pane-coordination';
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
    ReturnType<typeof createDesktopWorkbenchCenterPaneCoordinationProps>['galleryPane']['onAssetClick']
  >[0];

describe('desktop workbench center pane coordination', () => {
  it('builds workspace center pane props from named workbench handoffs', () => {
    const handleAssetItemClick = vi.fn();
    const handleLoadFirstPage = vi.fn();
    const handleSelectProfile = vi.fn();
    const setSelectedAssetKeys = vi.fn();

    const props = createDesktopWorkbenchCenterPaneCoordinationProps({
      assetList: {
        listBottomSpacerHeight: 20,
        listContainerRef: createRef<HTMLDivElement>(),
        listRovingAssetKey: 'photos/a.png',
        listTopSpacerHeight: 10,
        listVirtualItems: [assetItem],
        onListScroll: vi.fn(),
      },
      emptyState: {
        canClearSearch: true,
        canResetFilters: true,
        emptyStateMode: 'no-results',
        handleLoadFirstPage,
        handleOpenFilePicker: vi.fn(),
        isListLoading: false,
        isUploadBusy: false,
      },
      filters: {
        activeKindLabel: 'Images',
        activeSearchQuery: 'sunset',
        activeSmartCollectionLabel: 'Recent',
        activeUnifiedFilterId: 'images',
        handleResetViewFilters: vi.fn(),
        handleSearchClear: vi.fn(),
        handleSelectUnifiedFilter: vi.fn(),
        unifiedFilterOptions: [{ id: 'images', label: 'Images', count: 1 }],
      },
      gallery: {
        galleryColumnCount: 4,
        galleryDaySectionCount: 1,
        galleryRovingAssetKey: 'photos/a.png',
        galleryScrollRef: createRef<HTMLDivElement>(),
        galleryThumbnailErrors: {},
        galleryThumbnailLoading: {},
        galleryThumbnails: {},
        galleryVirtualRange: { bottomSpacerHeight: 0, topSpacerHeight: 0 },
        isGalleryScrolling: false,
        onGalleryScroll: vi.fn(),
        visibleGallerySections: [{ key: '2026-05-03', label: 'Today', items: [assetItem] }],
      },
      guidedStart: {
        handleSelectProfile,
        handleStartNewProfile: vi.fn(),
        profiles: [{ id: 'profile-1' }],
      },
      interaction: {
        handleAssetItemClick,
        handleAssetItemDoubleClick: vi.fn(),
        handleThumbnailDecodeError: vi.fn(),
        setAssetItemRef: vi.fn(),
        setSelectedAssetKey: vi.fn(),
      },
      selection: {
        handleOpenBulkDeleteDialog: vi.fn(),
        handleOpenBulkMoveDialog: vi.fn(),
        handleSelectAllVisible: vi.fn(),
        isAssetActionBusy: false,
        isSelectionMode: true,
        selectedAssetCount: 1,
        selectedAssetKey: 'photos/a.png',
        selectedAssetKeySet: new Set(['photos/a.png']),
        selectedProfileId: 'profile-1',
        setSelectedAssetKeys,
        toggleSelectionMode: vi.fn(),
      },
      sizing: {
        applyGalleryTileMinWidth: vi.fn(),
        commitGalleryTileMinWidth: vi.fn(),
        flushGalleryTileMinWidthCommit: vi.fn(),
        gallerySizeSliderRef: createRef<HTMLInputElement>(),
        galleryTileMinWidth: 176,
        scheduleGalleryTileMinWidthCommit: vi.fn(),
      },
      state: {
        isQuickPreviewOpen: false,
        showGuidedStart: false,
        viewMode: 'gallery',
        visibleItemCount: 1,
      },
      viewModeCommands: {
        setViewMode: vi.fn(),
      },
    });

    props.guidedStart.onUseSavedProfile();
    props.emptyState.onLoadFirstPage();
    props.selectionActionBar.onClearSelection();
    props.galleryPane.onAssetClick(createMouseEvent(), assetItem, {
      hasThumbnailError: true,
      thumbnailCacheKey: 'profile-1:photos/a.png',
    });
    props.assetListPane.onAssetClick(createMouseEvent(), assetItem);

    expect(props.visibleItemCount).toBe(1);
    expect(props.galleryTopRow.galleryTileMinWidthMin).toBe(GALLERY_TILE_MIN_WIDTH_MIN);
    expect(props.galleryTopRow.galleryTileMinWidthMax).toBe(GALLERY_TILE_MIN_WIDTH_MAX);
    expect(props.galleryTopRow.galleryTileMinWidthStep).toBe(GALLERY_TILE_MIN_WIDTH_SLIDER_STEP);
    expect(handleSelectProfile).toHaveBeenCalledWith('profile-1');
    expect(handleLoadFirstPage).toHaveBeenCalledTimes(1);
    expect(setSelectedAssetKeys).toHaveBeenCalledWith([]);
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
