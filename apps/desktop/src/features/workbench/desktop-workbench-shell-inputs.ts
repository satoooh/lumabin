import type { useDesktopWorkbenchShell } from './use-desktop-workbench-shell';
import type { UploadConflictDialogState } from '../upload/use-upload-queue-commands';

type DesktopWorkbenchShellInput = Parameters<
  typeof useDesktopWorkbenchShell<UploadConflictDialogState>
>[0];
type KeyboardShortcutsInput = DesktopWorkbenchShellInput['keyboardShortcuts'];
type WorkspaceModalGuardsInput = DesktopWorkbenchShellInput['workspaceModalGuards'];
type DialogEscapeInput = DesktopWorkbenchShellInput['dialogEscape'];
type UiDerivationsInput = DesktopWorkbenchShellInput['uiDerivations'];

interface DesktopWorkbenchKeyboardShortcutsInput {
  keyboardShortcuts: KeyboardShortcutsInput;
}

interface DesktopWorkbenchWorkspaceModalGuardsInput {
  workspaceModalGuards: WorkspaceModalGuardsInput;
}

interface DesktopWorkbenchDialogEscapeInput {
  dialogEscape: DialogEscapeInput;
}

interface DesktopWorkbenchUiDerivationsInput {
  uiDerivations: UiDerivationsInput;
}

interface DesktopWorkbenchShellDialogState {
  hasAssetActionDialog: boolean;
  hasBulkDeleteDialog: boolean;
  hasBulkMoveDialog: boolean;
  hasUploadConflictDialog: boolean;
  isConnectionSetupOpen: boolean;
  isQuickPreviewOpen: boolean;
  isShortcutHelpOpen: boolean;
  isWorkspaceSettingsOpen: boolean;
}

interface DesktopWorkbenchShellDialogStateInput {
  dialogState: DesktopWorkbenchShellDialogState;
}

interface DesktopWorkbenchKeyboardSearchInput {
  search: Pick<KeyboardShortcutsInput, 'searchInputRef'>;
}

interface DesktopWorkbenchKeyboardSelectionInput {
  selection: Pick<
    KeyboardShortcutsInput,
    | 'isSelectionMode'
    | 'onSelectAllVisible'
    | 'selectedAssetCount'
    | 'onOpenBulkDeleteDialog'
    | 'onOpenAssetDelete'
    | 'onSelectAssetKey'
    | 'onFocusAssetItemByKey'
  >;
}

interface DesktopWorkbenchKeyboardGalleryDensityInput {
  galleryDensity: Pick<
    KeyboardShortcutsInput,
    'viewMode' | 'onAdjustGalleryTileMinWidth' | 'onResetGalleryTileMinWidth'
  >;
}

interface DesktopWorkbenchKeyboardDialogStateInput {
  dialogState: Pick<
    KeyboardShortcutsInput,
    | 'onToggleShortcutHelp'
    | 'isConnectionSetupOpen'
    | 'isWorkspaceSettingsOpen'
    | 'isShortcutHelpOpen'
    | 'hasAssetActionDialog'
    | 'hasBulkMoveDialog'
    | 'hasBulkDeleteDialog'
    | 'hasUploadConflictDialog'
  >;
}

interface DesktopWorkbenchKeyboardQuickPreviewInput {
  quickPreview: Pick<
    KeyboardShortcutsInput,
    | 'isQuickPreviewOpen'
    | 'onMoveQuickPreviewSelection'
    | 'onCloseQuickPreview'
    | 'selectedAssetKey'
    | 'onToggleAssetSelection'
    | 'selectedAsset'
    | 'visibleItems'
    | 'onOpenQuickPreviewForItem'
  >;
}

interface DesktopWorkbenchKeyboardGalleryNavigationInput {
  galleryNavigation: Pick<
    KeyboardShortcutsInput,
    | 'assetItemRefs'
    | 'galleryGridLocationByKey'
    | 'galleryVirtualSections'
    | 'galleryDaySections'
    | 'galleryScrollRef'
    | 'galleryTileHeight'
    | 'galleryColumnCount'
    | 'galleryViewportHeight'
  >;
}

interface DesktopWorkbenchDialogEscapeStateInput {
  state: Pick<
    DialogEscapeInput,
    | 'isQuickPreviewOpen'
    | 'hasAssetActionDialog'
    | 'hasBulkDeleteDialog'
    | 'hasBulkMoveDialog'
    | 'hasUploadConflictDialog'
    | 'isShortcutHelpOpen'
    | 'isConnectionSetupOpen'
    | 'isWorkspaceSettingsOpen'
  >;
}

interface DesktopWorkbenchDialogEscapeCommandsInput {
  commands: Pick<
    DialogEscapeInput,
    | 'onCloseAssetActionDialog'
    | 'onCloseBulkDeleteDialog'
    | 'onCloseBulkMoveDialog'
    | 'onCloseUploadConflictDialog'
    | 'onCloseShortcutHelp'
    | 'onCloseConnectionSetup'
    | 'onCloseWorkspaceSettings'
  >;
}

interface DesktopWorkbenchUiDerivationStatusInput {
  status: Pick<UiDerivationsInput, 'status'>;
}

interface DesktopWorkbenchUiDerivationDialogStateInput {
  dialogState: Pick<
    UiDerivationsInput,
    | 'isQuickPreviewOpen'
    | 'hasUploadConflictDialog'
    | 'hasBulkMoveDialog'
    | 'hasBulkDeleteDialog'
    | 'hasAssetActionDialog'
    | 'isWorkspaceSettingsOpen'
    | 'isShortcutHelpOpen'
    | 'isConnectionSetupOpen'
  >;
}

interface DesktopWorkbenchUiDerivationSearchStateInput {
  searchState: Pick<
    UiDerivationsInput,
    | 'activeSearchQuery'
    | 'assetsPrefix'
    | 'searchInput'
    | 'activeKindFilter'
    | 'activeSmartCollection'
    | 'normalizePrefix'
  >;
}

interface DesktopWorkbenchUiDerivationGalleryStateInput {
  galleryState: Pick<
    UiDerivationsInput,
    'selectedAssetKey' | 'visibleItems' | 'listVirtualItems'
  >;
}

interface DesktopWorkbenchUiDerivationDiagnosticsInput {
  diagnostics: Pick<UiDerivationsInput, 'devMetrics'>;
}

export const createDesktopWorkbenchKeyboardShortcutsInput = ({
  keyboardShortcuts,
}: DesktopWorkbenchKeyboardShortcutsInput): KeyboardShortcutsInput => keyboardShortcuts;

export const createDesktopWorkbenchWorkspaceModalGuardsInput = ({
  workspaceModalGuards,
}: DesktopWorkbenchWorkspaceModalGuardsInput): WorkspaceModalGuardsInput =>
  workspaceModalGuards;

export const createDesktopWorkbenchDialogEscapeInput = ({
  dialogEscape,
}: DesktopWorkbenchDialogEscapeInput): DialogEscapeInput => dialogEscape;

export const createDesktopWorkbenchUiDerivationsInput = ({
  uiDerivations,
}: DesktopWorkbenchUiDerivationsInput): UiDerivationsInput => uiDerivations;

export const createDesktopWorkbenchShellDialogState = ({
  dialogState,
}: DesktopWorkbenchShellDialogStateInput): DesktopWorkbenchShellDialogState =>
  dialogState;

export const createDesktopWorkbenchKeyboardSearchInput = ({
  search,
}: DesktopWorkbenchKeyboardSearchInput): DesktopWorkbenchKeyboardSearchInput['search'] =>
  search;

export const createDesktopWorkbenchKeyboardSelectionInput = ({
  selection,
}: DesktopWorkbenchKeyboardSelectionInput): DesktopWorkbenchKeyboardSelectionInput['selection'] =>
  selection;

export const createDesktopWorkbenchKeyboardGalleryDensityInput = ({
  galleryDensity,
}: DesktopWorkbenchKeyboardGalleryDensityInput): DesktopWorkbenchKeyboardGalleryDensityInput['galleryDensity'] =>
  galleryDensity;

export const createDesktopWorkbenchKeyboardDialogStateInput = ({
  dialogState,
}: DesktopWorkbenchKeyboardDialogStateInput): DesktopWorkbenchKeyboardDialogStateInput['dialogState'] =>
  dialogState;

export const createDesktopWorkbenchKeyboardQuickPreviewInput = ({
  quickPreview,
}: DesktopWorkbenchKeyboardQuickPreviewInput): DesktopWorkbenchKeyboardQuickPreviewInput['quickPreview'] =>
  quickPreview;

export const createDesktopWorkbenchKeyboardGalleryNavigationInput = ({
  galleryNavigation,
}: DesktopWorkbenchKeyboardGalleryNavigationInput): DesktopWorkbenchKeyboardGalleryNavigationInput['galleryNavigation'] =>
  galleryNavigation;

export const createDesktopWorkbenchDialogEscapeState = ({
  state,
}: DesktopWorkbenchDialogEscapeStateInput): DesktopWorkbenchDialogEscapeStateInput['state'] =>
  state;

export const createDesktopWorkbenchDialogEscapeCommands = ({
  commands,
}: DesktopWorkbenchDialogEscapeCommandsInput): DesktopWorkbenchDialogEscapeCommandsInput['commands'] =>
  commands;

export const createDesktopWorkbenchUiDerivationStatus = ({
  status,
}: DesktopWorkbenchUiDerivationStatusInput): DesktopWorkbenchUiDerivationStatusInput['status'] =>
  status;

export const createDesktopWorkbenchUiDerivationDialogState = ({
  dialogState,
}: DesktopWorkbenchUiDerivationDialogStateInput): DesktopWorkbenchUiDerivationDialogStateInput['dialogState'] =>
  dialogState;

export const createDesktopWorkbenchUiDerivationSearchState = ({
  searchState,
}: DesktopWorkbenchUiDerivationSearchStateInput): DesktopWorkbenchUiDerivationSearchStateInput['searchState'] =>
  searchState;

export const createDesktopWorkbenchUiDerivationGalleryState = ({
  galleryState,
}: DesktopWorkbenchUiDerivationGalleryStateInput): DesktopWorkbenchUiDerivationGalleryStateInput['galleryState'] =>
  galleryState;

export const createDesktopWorkbenchUiDerivationDiagnostics = ({
  diagnostics,
}: DesktopWorkbenchUiDerivationDiagnosticsInput): DesktopWorkbenchUiDerivationDiagnosticsInput['diagnostics'] =>
  diagnostics;
