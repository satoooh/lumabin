import { createAppTopbarProps } from '../layout/app-topbar-props';
import { createWorkspaceCenterPaneProps } from '../layout/workspace-center-pane-props';
import {
  GALLERY_TILE_MIN_WIDTH_DEFAULT,
  GALLERY_TILE_MIN_WIDTH_MAX,
  GALLERY_TILE_MIN_WIDTH_MIN,
  GALLERY_TILE_MIN_WIDTH_SLIDER_STEP,
} from '../gallery/gallery-layout-policy';
import { basenameFromKey } from '../shared/asset-key';
import {
  formatBytes,
  formatDate,
  iconForKind,
  inferAssetKind,
  thumbnailCacheKey,
} from '../shared/asset-display';

type LayoutTopbarPresenterInput = Parameters<typeof createAppTopbarProps>[0];
type LayoutCenterPanePresenterInput = Parameters<typeof createWorkspaceCenterPaneProps>[0];

interface DesktopWorkbenchShellPresenterInput {
  dismissStatusLine: () => void;
  isDropActive: boolean;
  isTooltipWarm: boolean;
  showGuidedStart: boolean;
  showStatusStrip: boolean;
  status: string;
  statusTone: 'neutral' | 'success' | 'error';
}

export const createDesktopWorkbenchShellProps = ({
  dismissStatusLine,
  isDropActive,
  isTooltipWarm,
  showGuidedStart,
  showStatusStrip,
  status,
  statusTone,
}: DesktopWorkbenchShellPresenterInput) => ({
  appShellClassName: `app-shell app-shell--photos ${
    isDropActive ? 'app-shell--drop-active' : ''
  } ${isTooltipWarm ? 'app-shell--tooltips-warm' : ''}`,
  isWorkspaceFocused: showGuidedStart,
  isWorkspaceInert: isDropActive,
  statusStripProps: {
    isVisible: showStatusStrip,
    tone: statusTone,
    message: status,
    onDismiss: dismissStatusLine,
  },
});

interface DesktopWorkbenchTopbarPresenterInput {
  assets: LayoutTopbarPresenterInput['assets'];
  feedback: LayoutTopbarPresenterInput['feedback'];
  files: LayoutTopbarPresenterInput['files'];
  profileMenu: LayoutTopbarPresenterInput['profileMenu'];
  search: LayoutTopbarPresenterInput['search'];
  state: LayoutTopbarPresenterInput['state'];
  workspaceActions: LayoutTopbarPresenterInput['workspaceActions'];
}

interface DesktopWorkbenchTopbarAssetsInput {
  assets: LayoutTopbarPresenterInput['assets'];
}

interface DesktopWorkbenchTopbarFeedbackInput {
  feedback: LayoutTopbarPresenterInput['feedback'];
}

interface DesktopWorkbenchTopbarFilesInput {
  files: LayoutTopbarPresenterInput['files'];
}

interface DesktopWorkbenchTopbarProfileMenuInput {
  profileMenu: LayoutTopbarPresenterInput['profileMenu'];
}

interface DesktopWorkbenchTopbarSearchInput {
  search: LayoutTopbarPresenterInput['search'];
}

interface DesktopWorkbenchTopbarStateInput {
  state: LayoutTopbarPresenterInput['state'];
}

interface DesktopWorkbenchTopbarWorkspaceActionsInput {
  workspaceActions: LayoutTopbarPresenterInput['workspaceActions'];
}

interface DesktopWorkbenchCenterPanePresenterInput {
  assetList: LayoutCenterPanePresenterInput['assetList'];
  emptyState: LayoutCenterPanePresenterInput['emptyState'];
  filters: LayoutCenterPanePresenterInput['filters'];
  gallery: LayoutCenterPanePresenterInput['gallery'];
  guidedStart: LayoutCenterPanePresenterInput['guidedStart'];
  interaction: LayoutCenterPanePresenterInput['interaction'];
  selection: LayoutCenterPanePresenterInput['selection'];
  sizing: DesktopWorkbenchCenterPaneSizing;
  state: LayoutCenterPanePresenterInput['state'];
  viewModeCommands: LayoutCenterPanePresenterInput['viewModeCommands'];
}

type DesktopWorkbenchCenterPaneSizing = Omit<
  LayoutCenterPanePresenterInput['sizing'],
  | 'galleryTileMinWidthDefault'
  | 'galleryTileMinWidthMax'
  | 'galleryTileMinWidthMin'
  | 'galleryTileMinWidthStep'
>;

interface DesktopWorkbenchCenterPaneAssetListInput {
  assetList: LayoutCenterPanePresenterInput['assetList'];
}

interface DesktopWorkbenchCenterPaneEmptyStateInput {
  emptyState: LayoutCenterPanePresenterInput['emptyState'];
}

interface DesktopWorkbenchCenterPaneFiltersInput {
  filters: LayoutCenterPanePresenterInput['filters'];
}

interface DesktopWorkbenchCenterPaneGalleryInput {
  gallery: LayoutCenterPanePresenterInput['gallery'];
}

interface DesktopWorkbenchCenterPaneGuidedStartInput {
  guidedStart: LayoutCenterPanePresenterInput['guidedStart'];
}

interface DesktopWorkbenchCenterPaneInteractionInput {
  interaction: LayoutCenterPanePresenterInput['interaction'];
}

interface DesktopWorkbenchCenterPaneSelectionInput {
  selection: LayoutCenterPanePresenterInput['selection'];
}

interface DesktopWorkbenchCenterPaneSizingInput {
  sizing: DesktopWorkbenchCenterPaneSizing;
}

interface DesktopWorkbenchCenterPaneStateInput {
  state: LayoutCenterPanePresenterInput['state'];
}

interface DesktopWorkbenchCenterPaneViewModeCommandsInput {
  viewModeCommands: LayoutCenterPanePresenterInput['viewModeCommands'];
}

export const createDesktopWorkbenchTopbarProps = ({
  assets,
  feedback,
  files,
  profileMenu,
  search,
  state,
  workspaceActions,
}: DesktopWorkbenchTopbarPresenterInput) =>
  createAppTopbarProps({
    assets,
    feedback,
    files,
    profileMenu,
    search,
    state,
    workspaceActions,
  });

export const createDesktopWorkbenchTopbarAssets = ({
  assets,
}: DesktopWorkbenchTopbarAssetsInput): LayoutTopbarPresenterInput['assets'] =>
  assets;

export const createDesktopWorkbenchTopbarFeedback = ({
  feedback,
}: DesktopWorkbenchTopbarFeedbackInput): LayoutTopbarPresenterInput['feedback'] =>
  feedback;

export const createDesktopWorkbenchTopbarFiles = ({
  files,
}: DesktopWorkbenchTopbarFilesInput): LayoutTopbarPresenterInput['files'] =>
  files;

export const createDesktopWorkbenchTopbarProfileMenu = ({
  profileMenu,
}: DesktopWorkbenchTopbarProfileMenuInput): LayoutTopbarPresenterInput['profileMenu'] =>
  profileMenu;

export const createDesktopWorkbenchTopbarSearch = ({
  search,
}: DesktopWorkbenchTopbarSearchInput): LayoutTopbarPresenterInput['search'] =>
  search;

export const createDesktopWorkbenchTopbarState = ({
  state,
}: DesktopWorkbenchTopbarStateInput): LayoutTopbarPresenterInput['state'] =>
  state;

export const createDesktopWorkbenchTopbarWorkspaceActions = ({
  workspaceActions,
}: DesktopWorkbenchTopbarWorkspaceActionsInput): LayoutTopbarPresenterInput['workspaceActions'] =>
  workspaceActions;

export const createDesktopWorkbenchCenterPaneProps = ({
  assetList,
  emptyState,
  filters,
  gallery,
  guidedStart,
  interaction,
  selection,
  sizing,
  state,
  viewModeCommands,
}: DesktopWorkbenchCenterPanePresenterInput) =>
  createWorkspaceCenterPaneProps({
    assetList,
    display: {
      basenameFromKey,
      formatBytes,
      formatDate,
      iconForKind,
      inferAssetKind,
      thumbnailCacheKey,
    },
    emptyState,
    filters,
    gallery,
    guidedStart,
    interaction,
    selection,
    sizing: {
      ...sizing,
      galleryTileMinWidthDefault: GALLERY_TILE_MIN_WIDTH_DEFAULT,
      galleryTileMinWidthMax: GALLERY_TILE_MIN_WIDTH_MAX,
      galleryTileMinWidthMin: GALLERY_TILE_MIN_WIDTH_MIN,
      galleryTileMinWidthStep: GALLERY_TILE_MIN_WIDTH_SLIDER_STEP,
    },
    state,
    viewModeCommands,
  });

export const createDesktopWorkbenchCenterPaneAssetList = ({
  assetList,
}: DesktopWorkbenchCenterPaneAssetListInput): LayoutCenterPanePresenterInput['assetList'] =>
  assetList;

export const createDesktopWorkbenchCenterPaneEmptyState = ({
  emptyState,
}: DesktopWorkbenchCenterPaneEmptyStateInput): LayoutCenterPanePresenterInput['emptyState'] =>
  emptyState;

export const createDesktopWorkbenchCenterPaneFilters = ({
  filters,
}: DesktopWorkbenchCenterPaneFiltersInput): LayoutCenterPanePresenterInput['filters'] =>
  filters;

export const createDesktopWorkbenchCenterPaneGallery = ({
  gallery,
}: DesktopWorkbenchCenterPaneGalleryInput): LayoutCenterPanePresenterInput['gallery'] =>
  gallery;

export const createDesktopWorkbenchCenterPaneGuidedStart = ({
  guidedStart,
}: DesktopWorkbenchCenterPaneGuidedStartInput): LayoutCenterPanePresenterInput['guidedStart'] =>
  guidedStart;

export const createDesktopWorkbenchCenterPaneInteraction = ({
  interaction,
}: DesktopWorkbenchCenterPaneInteractionInput): LayoutCenterPanePresenterInput['interaction'] =>
  interaction;

export const createDesktopWorkbenchCenterPaneSelection = ({
  selection,
}: DesktopWorkbenchCenterPaneSelectionInput): LayoutCenterPanePresenterInput['selection'] =>
  selection;

export const createDesktopWorkbenchCenterPaneSizing = ({
  sizing,
}: DesktopWorkbenchCenterPaneSizingInput): DesktopWorkbenchCenterPaneSizing =>
  sizing;

export const createDesktopWorkbenchCenterPaneState = ({
  state,
}: DesktopWorkbenchCenterPaneStateInput): LayoutCenterPanePresenterInput['state'] =>
  state;

export const createDesktopWorkbenchCenterPaneViewModeCommands = ({
  viewModeCommands,
}: DesktopWorkbenchCenterPaneViewModeCommandsInput): LayoutCenterPanePresenterInput['viewModeCommands'] =>
  viewModeCommands;
