import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import {
  WorkspaceCenterPane,
  type WorkspaceCenterPaneProps,
} from '../../src/features/layout/workspace-center-pane';

const createBaseProps = (
  overrides: Partial<WorkspaceCenterPaneProps> = {},
): WorkspaceCenterPaneProps => ({
  showGuidedStart: false,
  viewMode: 'gallery',
  visibleItemCount: 0,
  guidedStart: {
    hasSavedProfile: true,
    onCreateConnection: vi.fn(),
    onUseSavedProfile: vi.fn(),
  },
  galleryTopRow: {
    viewMode: 'gallery',
    unifiedFilterOptions: [],
    activeUnifiedFilterId: 'all',
    onSelectUnifiedFilter: vi.fn(),
    activeKindLabel: '',
    activeSmartCollectionLabel: '',
    activeSearchQuery: '',
    onClearSearch: vi.fn(),
    onResetFilters: vi.fn(),
    gallerySizeSliderRef: createRef<HTMLInputElement>(),
    galleryTileMinWidthMin: 120,
    galleryTileMinWidthMax: 260,
    galleryTileMinWidthStep: 8,
    galleryTileMinWidth: 176,
    onGalleryTileMinWidthInput: vi.fn(),
    onGalleryTileMinWidthCommit: vi.fn(),
    onGalleryTileMinWidthReset: vi.fn(),
    onSetViewMode: vi.fn(),
    isSelectionMode: false,
    selectedAssetCount: 0,
    onToggleSelectionMode: vi.fn(),
  },
  selectionActionBar: {
    isSelectionMode: false,
    selectedAssetCount: 0,
    visibleItemCount: 0,
    isAssetActionBusy: false,
    selectedProfileId: 'profile-1',
    onSelectAllVisible: vi.fn(),
    onClearSelection: vi.fn(),
    onOpenBulkMove: vi.fn(),
    onOpenBulkDelete: vi.fn(),
  },
  emptyState: {
    mode: 'no-assets',
    isListLoading: false,
    isUploadBusy: false,
    onLoadFirstPage: vi.fn(),
    onOpenFilePicker: vi.fn(),
    canClearSearch: false,
    onClearSearch: vi.fn(),
    canResetFilters: false,
    onResetFilters: vi.fn(),
  },
  galleryPane: {
    galleryScrollRef: createRef<HTMLDivElement>(),
    onGalleryScroll: vi.fn(),
    isGalleryScrolling: false,
    galleryVirtualRange: { topSpacerHeight: 0, bottomSpacerHeight: 0 },
    visibleGallerySections: [],
    galleryColumnCount: 4,
    galleryDaySectionCount: 0,
    selectedProfileId: 'profile-1',
    selectedAssetKey: '',
    selectedAssetKeySet: new Set(),
    isQuickPreviewOpen: false,
    isSelectionMode: false,
    galleryRovingAssetKey: '',
    galleryThumbnails: {},
    galleryThumbnailLoading: {},
    galleryThumbnailErrors: {},
    inferAssetKind: () => 'image',
    iconForKind: () => 'Image',
    basenameFromKey: (key) => key,
    formatBytes: (value) => `${value} B`,
    formatDate: (value) => value,
    toThumbnailCacheKey: (_, key) => key,
    setAssetItemRef: vi.fn(),
    onAssetFocus: vi.fn(),
    onAssetClick: vi.fn(),
    onThumbnailDecodeError: vi.fn(),
  },
  assetListPane: {
    unifiedFilterOptions: [],
    activeUnifiedFilterId: 'all',
    onSelectUnifiedFilter: vi.fn(),
    activeKindLabel: '',
    activeSmartCollectionLabel: '',
    activeSearchQuery: '',
    onClearSearch: vi.fn(),
    onResetFilters: vi.fn(),
    listContainerRef: createRef<HTMLDivElement>(),
    onListScroll: vi.fn(),
    listTopSpacerHeight: 0,
    listBottomSpacerHeight: 0,
    listVirtualItems: [],
    inferAssetKind: () => 'image',
    isSelectionMode: false,
    selectedAssetKeySet: new Set(),
    selectedAssetKey: '',
    setAssetItemRef: vi.fn(),
    listRovingAssetKey: '',
    onAssetFocus: vi.fn(),
    onAssetClick: vi.fn(),
    onAssetDoubleClick: vi.fn(),
    formatBytes: (value) => `${value} B`,
    formatDate: (value) => value,
  },
  ...overrides,
});

describe('workspace center pane', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the guided start instead of gallery controls during onboarding', () => {
    render(<WorkspaceCenterPane {...createBaseProps({ showGuidedStart: true })} />);

    expect(screen.getByText('Connect your bucket')).not.toBeNull();
    expect(screen.queryByRole('group', { name: 'View mode' })).toBeNull();
  });

  it('prioritizes upload in the empty bucket state', () => {
    render(<WorkspaceCenterPane {...createBaseProps()} />);

    const emptyState = screen.getByRole('region', { name: 'Add assets to this bucket' });
    const actions = within(emptyState).getAllByRole('button');

    expect(within(emptyState).getByText('Upload files or drop them here.')).not.toBeNull();
    expect(actions.map((action) => action.textContent)).toEqual(['Upload assets', 'Refresh bucket']);
  });

  it('keeps search recovery actions first in the no matches state', () => {
    render(
      <WorkspaceCenterPane
        {...createBaseProps({
          emptyState: {
            ...createBaseProps().emptyState,
            mode: 'no-matches',
            canClearSearch: true,
            canResetFilters: true,
          },
        })}
      />,
    );

    const emptyState = screen.getByRole('region', { name: 'No matches found' });
    const actions = within(emptyState).getAllByRole('button');

    expect(actions.map((action) => action.textContent)).toEqual([
      'Clear search',
      'Reset filters',
      'Upload',
    ]);
  });

  it('routes visible items to the list pane when list mode is active', () => {
    render(
      <WorkspaceCenterPane
        {...createBaseProps({
          viewMode: 'list',
          visibleItemCount: 1,
          galleryTopRow: {
            ...createBaseProps().galleryTopRow,
            viewMode: 'list',
          },
        })}
      />,
    );

    expect(screen.getByText('Name')).not.toBeNull();
    expect(screen.queryByRole('region', { name: 'Add assets to this bucket' })).toBeNull();
  });
});
