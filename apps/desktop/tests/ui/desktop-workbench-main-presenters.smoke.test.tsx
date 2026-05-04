import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  createDesktopWorkbenchCenterPaneAssetList,
  createDesktopWorkbenchCenterPaneEmptyState,
  createDesktopWorkbenchCenterPaneFilters,
  createDesktopWorkbenchCenterPaneGallery,
  createDesktopWorkbenchCenterPaneGuidedStart,
  createDesktopWorkbenchCenterPaneInteraction,
  createDesktopWorkbenchCenterPaneProps,
  createDesktopWorkbenchCenterPaneSelection,
  createDesktopWorkbenchCenterPaneSizing,
  createDesktopWorkbenchCenterPaneState,
  createDesktopWorkbenchCenterPaneViewModeCommands,
  createDesktopWorkbenchShellProps,
  createDesktopWorkbenchTopbarAssets,
  createDesktopWorkbenchTopbarFeedback,
  createDesktopWorkbenchTopbarFiles,
  createDesktopWorkbenchTopbarProfileMenu,
  createDesktopWorkbenchTopbarProps,
  createDesktopWorkbenchTopbarSearch,
  createDesktopWorkbenchTopbarState,
  createDesktopWorkbenchTopbarWorkspaceActions,
} from '../../src/features/workbench/desktop-workbench-main-presenters';
import {
  GALLERY_TILE_MIN_WIDTH_MAX,
  GALLERY_TILE_MIN_WIDTH_MIN,
  GALLERY_TILE_MIN_WIDTH_SLIDER_STEP,
} from '../../src/features/gallery/gallery-layout-policy';
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
    ReturnType<typeof createDesktopWorkbenchCenterPaneProps>['galleryPane']['onAssetClick']
  >[0];

describe('desktop workbench main presenters', () => {
  it('maps shell state into app chrome props', () => {
    const dismissStatusLine = vi.fn();

    const props = createDesktopWorkbenchShellProps({
      dismissStatusLine,
      isDropActive: true,
      isTooltipWarm: true,
      showGuidedStart: true,
      showStatusStrip: true,
      status: 'Ready',
      statusTone: 'success',
    });

    props.statusStripProps.onDismiss();

    expect(props.appShellClassName).toContain('app-shell--drop-active');
    expect(props.appShellClassName).toContain('app-shell--tooltips-warm');
    expect(props.isWorkspaceFocused).toBe(true);
    expect(props.isWorkspaceInert).toBe(true);
    expect(props.statusStripProps).toMatchObject({
      isVisible: true,
      message: 'Ready',
      tone: 'success',
    });
    expect(dismissStatusLine).toHaveBeenCalledTimes(1);
  });

  it('maps semantic topbar input into the layout topbar contract', () => {
    const handleProfileMenuSelect = vi.fn();
    const handleSearchSubmit = vi.fn();
    const setSearchInput = vi.fn();

    const props = createDesktopWorkbenchTopbarProps({
      assets: createDesktopWorkbenchTopbarAssets({
        assets: {
          logoSrc: '/lumabin.svg',
        },
      }),
      feedback: createDesktopWorkbenchTopbarFeedback({
        feedback: {
          inlineFeedback: 'Copied',
        },
      }),
      files: createDesktopWorkbenchTopbarFiles({
        files: {
          fileInputRef: createRef<HTMLInputElement>(),
          handleFilePickerChange: vi.fn(),
          handleOpenFilePicker: vi.fn(),
          isUploadBusy: false,
        },
      }),
      profileMenu: createDesktopWorkbenchTopbarProfileMenu({
        profileMenu: {
          closeProfileMenu: vi.fn(),
          handleProfileMenuSelect,
          isProfileMenuOpen: true,
          manageProfileOptionValue: '__manage__',
          moveProfileMenuActiveIndex: vi.fn(),
          newProfileOptionValue: '__new__',
          openProfileMenu: vi.fn(),
          profileMenuActiveIndex: 0,
          profileMenuButtonRef: createRef<HTMLButtonElement>(),
          profileMenuListRef: createRef<HTMLDivElement>(),
          profileMenuOptions: [{ label: 'Production', value: 'profile-1' }],
          selectedProfileId: 'profile-1',
          selectedProfileLabel: 'Production',
          setProfileMenuActiveIndex: vi.fn(),
        },
      }),
      search: createDesktopWorkbenchTopbarSearch({
        search: {
          activeSearchQuery: 'sunset',
          handleSearchClear: vi.fn(),
          handleSearchSubmit,
          isSearchBusy: false,
          searchInput: 'sunset',
          searchInputRef: createRef<HTMLInputElement>(),
          setSearchInput,
        },
      }),
      state: createDesktopWorkbenchTopbarState({
        state: {
          isDropActive: false,
          showGuidedStart: false,
        },
      }),
      workspaceActions: createDesktopWorkbenchTopbarWorkspaceActions({
        workspaceActions: {
          handleToggleShortcutHelp: vi.fn(),
          handleToggleWorkspaceSettings: vi.fn(),
          isShortcutHelpOpen: false,
          isWorkspaceSettingsOpen: false,
        },
      }),
    });

    props.onSearchInputChange('beach');
    props.onSearchSubmit();
    props.onSelectProfileMenuValue('profile-1');

    expect(props.logoSrc).toBe('/lumabin.svg');
    expect(props.inlineFeedback).toBe('Copied');
    expect(props.profileMenuOptions).toEqual([{ label: 'Production', value: 'profile-1' }]);
    expect(setSearchInput).toHaveBeenCalledWith('beach');
    expect(handleSearchSubmit).toHaveBeenCalledTimes(1);
    expect(handleProfileMenuSelect).toHaveBeenCalledWith('profile-1');
  });

  it('maps semantic center pane input and preserves gallery/list click intent', () => {
    const handleAssetItemClick = vi.fn();
    const handleLoadFirstPage = vi.fn();
    const handleSelectProfile = vi.fn();
    const setSelectedAssetKeys = vi.fn();

    const props = createDesktopWorkbenchCenterPaneProps({
      assetList: createDesktopWorkbenchCenterPaneAssetList({
        assetList: {
          listBottomSpacerHeight: 20,
          listContainerRef: createRef<HTMLDivElement>(),
          listRovingAssetKey: 'photos/a.png',
          listTopSpacerHeight: 10,
          listVirtualItems: [assetItem],
          onListScroll: vi.fn(),
        },
      }),
      emptyState: createDesktopWorkbenchCenterPaneEmptyState({
        emptyState: {
          canClearSearch: true,
          canResetFilters: true,
          emptyStateMode: 'no-results',
          handleLoadFirstPage,
          handleOpenFilePicker: vi.fn(),
          isListLoading: false,
          isUploadBusy: false,
        },
      }),
      filters: createDesktopWorkbenchCenterPaneFilters({
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
      }),
      gallery: createDesktopWorkbenchCenterPaneGallery({
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
      }),
      guidedStart: createDesktopWorkbenchCenterPaneGuidedStart({
        guidedStart: {
          handleSelectProfile,
          handleStartNewProfile: vi.fn(),
          profiles: [{ id: 'profile-1' }],
        },
      }),
      interaction: createDesktopWorkbenchCenterPaneInteraction({
        interaction: {
          handleAssetItemClick,
          handleAssetItemDoubleClick: vi.fn(),
          handleThumbnailDecodeError: vi.fn(),
          setAssetItemRef: vi.fn(),
          setSelectedAssetKey: vi.fn(),
        },
      }),
      selection: createDesktopWorkbenchCenterPaneSelection({
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
      }),
      sizing: createDesktopWorkbenchCenterPaneSizing({
        sizing: {
          applyGalleryTileMinWidth: vi.fn(),
          commitGalleryTileMinWidth: vi.fn(),
          flushGalleryTileMinWidthCommit: vi.fn(),
          gallerySizeSliderRef: createRef<HTMLInputElement>(),
          galleryTileMinWidth: 176,
          scheduleGalleryTileMinWidthCommit: vi.fn(),
        },
      }),
      state: createDesktopWorkbenchCenterPaneState({
        state: {
          isQuickPreviewOpen: false,
          showGuidedStart: false,
          viewMode: 'gallery',
          visibleItemCount: 1,
        },
      }),
      viewModeCommands: createDesktopWorkbenchCenterPaneViewModeCommands({
        viewModeCommands: {
          setViewMode: vi.fn(),
        },
      }),
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
