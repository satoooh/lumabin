import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createDesktopWorkbenchCenterPaneCoordinationProps } from '../../src/features/workbench/desktop-workbench-center-pane-coordination';
import { createDesktopWorkbenchCenterPaneCoordinationInput } from '../../src/features/workbench/desktop-workbench-center-pane-handoffs';
import type { AssetItem } from '../../src/shared/ipc';

type CenterPaneCoordinationInput = Parameters<
  typeof createDesktopWorkbenchCenterPaneCoordinationProps
>[0];

const assetItem: AssetItem = {
  key: 'photos/a.png',
  size: 1024,
  contentType: 'image/png',
  lastModified: '2026-05-03T00:00:00.000Z',
  etag: 'etag',
};

describe('desktop workbench center pane handoffs', () => {
  it('maps flat root values to the center pane coordination contract', () => {
    const handleAssetItemClick = vi.fn();
    const handleLoadFirstPage = vi.fn();
    const handleSelectProfile = vi.fn();
    const setSelectedAssetKeys = vi.fn();
    const listVirtualItems = [assetItem];
    const visibleGallerySections: CenterPaneCoordinationInput['gallery']['visibleGallerySections'] = [
      { key: '2026-05-03', label: 'Today', items: [assetItem] },
    ];
    const visibleItems = [assetItem, { ...assetItem, key: 'photos/b.png' }];

    const input = createDesktopWorkbenchCenterPaneCoordinationInput({
      activeKindLabel: 'Images',
      activeSearchQuery: 'sunset',
      activeSmartCollectionLabel: 'Recent',
      activeUnifiedFilterId: 'images',
      applyGalleryTileMinWidth: vi.fn(),
      canClearSearch: true,
      canResetFilters: true,
      commitGalleryTileMinWidth: vi.fn(),
      emptyStateMode: 'no-results',
      flushGalleryTileMinWidthCommit: vi.fn(),
      galleryColumnCount: 4,
      galleryDaySections: [{ key: '2026-05-03' }],
      galleryRovingAssetKey: assetItem.key,
      galleryScrollRef: createRef<HTMLDivElement>(),
      gallerySizeSliderRef: createRef<HTMLInputElement>(),
      galleryThumbnailErrors: {},
      galleryThumbnailLoading: {},
      galleryThumbnails: {},
      galleryTileMinWidth: 176,
      galleryVirtualRange: { bottomSpacerHeight: 0, topSpacerHeight: 0 },
      handleAssetItemClick,
      handleAssetItemDoubleClick: vi.fn(),
      handleLoadFirstPage,
      handleOpenBulkDeleteDialog: vi.fn(),
      handleOpenBulkMoveDialog: vi.fn(),
      handleOpenFilePicker: vi.fn(),
      handleResetViewFilters: vi.fn(),
      handleSearchClear: vi.fn(),
      handleSelectAllVisible: vi.fn(),
      handleSelectProfile,
      handleSelectUnifiedFilter: vi.fn(),
      handleStartNewProfile: vi.fn(),
      handleThumbnailDecodeError: vi.fn(),
      isAssetActionBusy: false,
      isGalleryScrolling: false,
      isListLoading: false,
      isQuickPreviewOpen: false,
      isSelectionMode: true,
      isUploadBusy: false,
      listContainerRef: createRef<HTMLDivElement>(),
      listRovingAssetKey: assetItem.key,
      listVirtualItems,
      listVirtualRange: {
        listBottomSpacerHeight: 20,
        listTopSpacerHeight: 10,
      },
      profiles: [{ id: 'profile-1' }],
      queueGalleryScrollStateUpdate: vi.fn(),
      queueListScrollStateUpdate: vi.fn(),
      scheduleGalleryTileMinWidthCommit: vi.fn(),
      selectedAssetCount: 1,
      selectedAssetKey: assetItem.key,
      selectedAssetKeySet: new Set([assetItem.key]),
      selectedProfileId: 'profile-1',
      setAssetItemRef: vi.fn(),
      setSelectedAssetKey: vi.fn(),
      setSelectedAssetKeys,
      setViewMode: vi.fn(),
      showGuidedStart: false,
      toggleSelectionMode: vi.fn(),
      unifiedFilterOptions: [{ id: 'images', label: 'Images', count: 1 }],
      viewMode: 'gallery',
      visibleGallerySections,
      visibleItems,
    });

    expect(input.assetList).toMatchObject({
      listBottomSpacerHeight: 20,
      listRovingAssetKey: assetItem.key,
      listTopSpacerHeight: 10,
    });
    expect(input.assetList.listVirtualItems).toBe(listVirtualItems);
    expect(input.emptyState.handleLoadFirstPage).toBe(handleLoadFirstPage);
    expect(input.filters.activeSearchQuery).toBe('sunset');
    expect(input.gallery.galleryDaySectionCount).toBe(1);
    expect(input.gallery.visibleGallerySections).toBe(visibleGallerySections);
    expect(input.guidedStart.handleSelectProfile).toBe(handleSelectProfile);
    expect(input.interaction.handleAssetItemClick).toBe(handleAssetItemClick);
    expect(input.selection.setSelectedAssetKeys).toBe(setSelectedAssetKeys);
    expect(input.state.visibleItemCount).toBe(2);
  });
});
