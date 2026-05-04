import { describe, expect, it } from 'vitest';
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
} from '../../src/features/workbench/desktop-workbench-shell-inputs';

describe('desktop workbench shell inputs', () => {
  it('keeps shell handoff groups named before shell orchestration', () => {
    const keyboardShortcuts = {
      marker: 'keyboard-shortcuts',
    } as unknown as Parameters<typeof createDesktopWorkbenchKeyboardShortcutsInput>[0]['keyboardShortcuts'];
    const workspaceModalGuards = {
      marker: 'workspace-modal-guards',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchWorkspaceModalGuardsInput
    >[0]['workspaceModalGuards'];
    const dialogEscape = {
      marker: 'dialog-escape',
    } as unknown as Parameters<typeof createDesktopWorkbenchDialogEscapeInput>[0]['dialogEscape'];
    const uiDerivations = {
      marker: 'ui-derivations',
    } as unknown as Parameters<typeof createDesktopWorkbenchUiDerivationsInput>[0]['uiDerivations'];

    expect(
      createDesktopWorkbenchKeyboardShortcutsInput({
        keyboardShortcuts,
      }),
    ).toBe(keyboardShortcuts);
    expect(
      createDesktopWorkbenchWorkspaceModalGuardsInput({
        workspaceModalGuards,
      }),
    ).toBe(workspaceModalGuards);
    expect(
      createDesktopWorkbenchDialogEscapeInput({
        dialogEscape,
      }),
    ).toBe(dialogEscape);
    expect(
      createDesktopWorkbenchUiDerivationsInput({
        uiDerivations,
      }),
    ).toBe(uiDerivations);
  });

  it('keeps shell handoff subgroups named by responsibility', () => {
    const keyboardSearch = {
      marker: 'keyboard-search',
    } as unknown as Parameters<typeof createDesktopWorkbenchKeyboardSearchInput>[0]['search'];
    const shellDialogState = {
      marker: 'shell-dialog-state',
    } as unknown as Parameters<typeof createDesktopWorkbenchShellDialogState>[0]['dialogState'];
    const keyboardSelection = {
      marker: 'keyboard-selection',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchKeyboardSelectionInput
    >[0]['selection'];
    const keyboardGalleryDensity = {
      marker: 'keyboard-gallery-density',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchKeyboardGalleryDensityInput
    >[0]['galleryDensity'];
    const keyboardDialogState = {
      marker: 'keyboard-dialog-state',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchKeyboardDialogStateInput
    >[0]['dialogState'];
    const keyboardQuickPreview = {
      marker: 'keyboard-quick-preview',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchKeyboardQuickPreviewInput
    >[0]['quickPreview'];
    const keyboardGalleryNavigation = {
      marker: 'keyboard-gallery-navigation',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchKeyboardGalleryNavigationInput
    >[0]['galleryNavigation'];
    const dialogEscapeState = {
      marker: 'dialog-escape-state',
    } as unknown as Parameters<typeof createDesktopWorkbenchDialogEscapeState>[0]['state'];
    const dialogEscapeCommands = {
      marker: 'dialog-escape-commands',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchDialogEscapeCommands
    >[0]['commands'];
    const uiDerivationStatus = {
      marker: 'ui-derivation-status',
    } as unknown as Parameters<typeof createDesktopWorkbenchUiDerivationStatus>[0]['status'];
    const uiDerivationDialogState = {
      marker: 'ui-derivation-dialog-state',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchUiDerivationDialogState
    >[0]['dialogState'];
    const uiDerivationSearchState = {
      marker: 'ui-derivation-search-state',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchUiDerivationSearchState
    >[0]['searchState'];
    const uiDerivationGalleryState = {
      marker: 'ui-derivation-gallery-state',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchUiDerivationGalleryState
    >[0]['galleryState'];
    const uiDerivationDiagnostics = {
      marker: 'ui-derivation-diagnostics',
    } as unknown as Parameters<
      typeof createDesktopWorkbenchUiDerivationDiagnostics
    >[0]['diagnostics'];

    expect(createDesktopWorkbenchKeyboardSearchInput({ search: keyboardSearch })).toBe(
      keyboardSearch,
    );
    expect(
      createDesktopWorkbenchShellDialogState({
        dialogState: shellDialogState,
      }),
    ).toBe(shellDialogState);
    expect(
      createDesktopWorkbenchKeyboardSelectionInput({
        selection: keyboardSelection,
      }),
    ).toBe(keyboardSelection);
    expect(
      createDesktopWorkbenchKeyboardGalleryDensityInput({
        galleryDensity: keyboardGalleryDensity,
      }),
    ).toBe(keyboardGalleryDensity);
    expect(
      createDesktopWorkbenchKeyboardDialogStateInput({
        dialogState: keyboardDialogState,
      }),
    ).toBe(keyboardDialogState);
    expect(
      createDesktopWorkbenchKeyboardQuickPreviewInput({
        quickPreview: keyboardQuickPreview,
      }),
    ).toBe(keyboardQuickPreview);
    expect(
      createDesktopWorkbenchKeyboardGalleryNavigationInput({
        galleryNavigation: keyboardGalleryNavigation,
      }),
    ).toBe(keyboardGalleryNavigation);
    expect(createDesktopWorkbenchDialogEscapeState({ state: dialogEscapeState })).toBe(
      dialogEscapeState,
    );
    expect(
      createDesktopWorkbenchDialogEscapeCommands({
        commands: dialogEscapeCommands,
      }),
    ).toBe(dialogEscapeCommands);
    expect(
      createDesktopWorkbenchUiDerivationStatus({
        status: uiDerivationStatus,
      }),
    ).toBe(uiDerivationStatus);
    expect(
      createDesktopWorkbenchUiDerivationDialogState({
        dialogState: uiDerivationDialogState,
      }),
    ).toBe(uiDerivationDialogState);
    expect(
      createDesktopWorkbenchUiDerivationSearchState({
        searchState: uiDerivationSearchState,
      }),
    ).toBe(uiDerivationSearchState);
    expect(
      createDesktopWorkbenchUiDerivationGalleryState({
        galleryState: uiDerivationGalleryState,
      }),
    ).toBe(uiDerivationGalleryState);
    expect(
      createDesktopWorkbenchUiDerivationDiagnostics({
        diagnostics: uiDerivationDiagnostics,
      }),
    ).toBe(uiDerivationDiagnostics);
  });
});
