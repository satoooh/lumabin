import {
  createDesktopWorkbenchDialogEscapeCommands,
  createDesktopWorkbenchDialogEscapeInput,
  createDesktopWorkbenchDialogEscapeState,
  createDesktopWorkbenchKeyboardDialogStateInput,
  createDesktopWorkbenchKeyboardGalleryDensityInput,
  createDesktopWorkbenchKeyboardGalleryNavigationInput,
  createDesktopWorkbenchKeyboardQuickPreviewInput,
  createDesktopWorkbenchKeyboardSearchInput,
  createDesktopWorkbenchKeyboardSelectionInput,
  createDesktopWorkbenchKeyboardShortcutsInput,
  createDesktopWorkbenchShellDialogState,
  createDesktopWorkbenchUiDerivationDiagnostics,
  createDesktopWorkbenchUiDerivationDialogState,
  createDesktopWorkbenchUiDerivationGalleryState,
  createDesktopWorkbenchUiDerivationSearchState,
  createDesktopWorkbenchUiDerivationStatus,
  createDesktopWorkbenchUiDerivationsInput,
  createDesktopWorkbenchWorkspaceModalGuardsInput,
} from './desktop-workbench-shell-inputs';
import { normalizeAssetPrefix } from '../shared/asset-prefix';
import { createDesktopWorkbenchShellProps } from './desktop-workbench-main-presenters';
import { useDesktopWorkbenchShell } from './use-desktop-workbench-shell';

type ShellDialogState = Parameters<
  typeof createDesktopWorkbenchShellDialogState
>[0]['dialogState'];
type WorkspaceModalGuards = Parameters<
  typeof createDesktopWorkbenchWorkspaceModalGuardsInput
>[0]['workspaceModalGuards'];
type KeyboardSearch = Parameters<
  typeof createDesktopWorkbenchKeyboardSearchInput
>[0]['search'];
type KeyboardSelection = Parameters<
  typeof createDesktopWorkbenchKeyboardSelectionInput
>[0]['selection'];
type KeyboardGalleryDensity = Parameters<
  typeof createDesktopWorkbenchKeyboardGalleryDensityInput
>[0]['galleryDensity'];
type KeyboardQuickPreview = Parameters<
  typeof createDesktopWorkbenchKeyboardQuickPreviewInput
>[0]['quickPreview'];
type KeyboardGalleryNavigation = Parameters<
  typeof createDesktopWorkbenchKeyboardGalleryNavigationInput
>[0]['galleryNavigation'];
type DialogEscapeCommands = Parameters<
  typeof createDesktopWorkbenchDialogEscapeCommands
>[0]['commands'];
type UiDerivationStatus = Parameters<
  typeof createDesktopWorkbenchUiDerivationStatus
>[0]['status'];
type UiDerivationSearchState = Parameters<
  typeof createDesktopWorkbenchUiDerivationSearchState
>[0]['searchState'];
type UiDerivationSearchHandoff = Omit<UiDerivationSearchState, 'normalizePrefix'>;
type UiDerivationGalleryState = Parameters<
  typeof createDesktopWorkbenchUiDerivationGalleryState
>[0]['galleryState'];
type UiDerivationDiagnostics = Parameters<
  typeof createDesktopWorkbenchUiDerivationDiagnostics
>[0]['diagnostics'];
type ShellChrome = Omit<
  Parameters<typeof createDesktopWorkbenchShellProps>[0],
  'showStatusStrip'
>;

interface UseDesktopWorkbenchShellCoordinationOptions {
  dialogEscapeCommands: DialogEscapeCommands;
  dialogState: ShellDialogState;
  keyboardGalleryDensity: KeyboardGalleryDensity;
  keyboardGalleryNavigation: KeyboardGalleryNavigation;
  keyboardQuickPreview: KeyboardQuickPreview;
  keyboardSearch: KeyboardSearch;
  keyboardSelection: KeyboardSelection;
  onToggleShortcutHelp: () => void;
  shellChrome: ShellChrome;
  uiDerivationDiagnostics: UiDerivationDiagnostics;
  uiDerivationGalleryState: UiDerivationGalleryState;
  uiDerivationSearchState: UiDerivationSearchHandoff;
  uiDerivationStatus: UiDerivationStatus;
  workspaceModalGuards: WorkspaceModalGuards;
}

export const useDesktopWorkbenchShellCoordination = ({
  dialogEscapeCommands,
  dialogState,
  keyboardGalleryDensity,
  keyboardGalleryNavigation,
  keyboardQuickPreview,
  keyboardSearch,
  keyboardSelection,
  onToggleShortcutHelp,
  shellChrome,
  uiDerivationDiagnostics,
  uiDerivationGalleryState,
  uiDerivationSearchState,
  uiDerivationStatus,
  workspaceModalGuards,
}: UseDesktopWorkbenchShellCoordinationOptions) => {
  const shellDialogState = createDesktopWorkbenchShellDialogState({
    dialogState,
  });

  const shellUi = useDesktopWorkbenchShell({
    workspaceModalGuards: createDesktopWorkbenchWorkspaceModalGuardsInput({
      workspaceModalGuards,
    }),
    keyboardShortcuts: createDesktopWorkbenchKeyboardShortcutsInput({
      keyboardShortcuts: {
        ...createDesktopWorkbenchKeyboardSearchInput({
          search: keyboardSearch,
        }),
        ...createDesktopWorkbenchKeyboardSelectionInput({
          selection: keyboardSelection,
        }),
        ...createDesktopWorkbenchKeyboardGalleryDensityInput({
          galleryDensity: keyboardGalleryDensity,
        }),
        ...createDesktopWorkbenchKeyboardDialogStateInput({
          dialogState: {
            onToggleShortcutHelp,
            isConnectionSetupOpen: shellDialogState.isConnectionSetupOpen,
            isWorkspaceSettingsOpen: shellDialogState.isWorkspaceSettingsOpen,
            isShortcutHelpOpen: shellDialogState.isShortcutHelpOpen,
            hasAssetActionDialog: shellDialogState.hasAssetActionDialog,
            hasBulkMoveDialog: shellDialogState.hasBulkMoveDialog,
            hasBulkDeleteDialog: shellDialogState.hasBulkDeleteDialog,
            hasUploadConflictDialog: shellDialogState.hasUploadConflictDialog,
          },
        }),
        ...createDesktopWorkbenchKeyboardQuickPreviewInput({
          quickPreview: keyboardQuickPreview,
        }),
        ...createDesktopWorkbenchKeyboardGalleryNavigationInput({
          galleryNavigation: keyboardGalleryNavigation,
        }),
      },
    }),
    dialogEscape: createDesktopWorkbenchDialogEscapeInput({
      dialogEscape: {
        ...createDesktopWorkbenchDialogEscapeState({
          state: {
            isQuickPreviewOpen: shellDialogState.isQuickPreviewOpen,
            hasAssetActionDialog: shellDialogState.hasAssetActionDialog,
            hasBulkDeleteDialog: shellDialogState.hasBulkDeleteDialog,
            hasBulkMoveDialog: shellDialogState.hasBulkMoveDialog,
            hasUploadConflictDialog: shellDialogState.hasUploadConflictDialog,
            isShortcutHelpOpen: shellDialogState.isShortcutHelpOpen,
            isConnectionSetupOpen: shellDialogState.isConnectionSetupOpen,
            isWorkspaceSettingsOpen: shellDialogState.isWorkspaceSettingsOpen,
          },
        }),
        ...createDesktopWorkbenchDialogEscapeCommands({
          commands: dialogEscapeCommands,
        }),
      },
    }),
    uiDerivations: createDesktopWorkbenchUiDerivationsInput({
      uiDerivations: {
        ...createDesktopWorkbenchUiDerivationStatus({
          status: uiDerivationStatus,
        }),
        ...createDesktopWorkbenchUiDerivationDialogState({
          dialogState: {
            isQuickPreviewOpen: shellDialogState.isQuickPreviewOpen,
            hasUploadConflictDialog: shellDialogState.hasUploadConflictDialog,
            hasBulkMoveDialog: shellDialogState.hasBulkMoveDialog,
            hasBulkDeleteDialog: shellDialogState.hasBulkDeleteDialog,
            hasAssetActionDialog: shellDialogState.hasAssetActionDialog,
            isWorkspaceSettingsOpen: shellDialogState.isWorkspaceSettingsOpen,
            isShortcutHelpOpen: shellDialogState.isShortcutHelpOpen,
            isConnectionSetupOpen: shellDialogState.isConnectionSetupOpen,
          },
        }),
        ...createDesktopWorkbenchUiDerivationSearchState({
          searchState: {
            ...uiDerivationSearchState,
            normalizePrefix: normalizeAssetPrefix,
          },
        }),
        ...createDesktopWorkbenchUiDerivationGalleryState({
          galleryState: uiDerivationGalleryState,
        }),
        ...createDesktopWorkbenchUiDerivationDiagnostics({
          diagnostics: uiDerivationDiagnostics,
        }),
      },
    }),
  });

  return {
    shellDialogState,
    shellProps: createDesktopWorkbenchShellProps({
      ...shellChrome,
      showStatusStrip: shellUi.showStatusStrip,
    }),
    shellUi,
  };
};
