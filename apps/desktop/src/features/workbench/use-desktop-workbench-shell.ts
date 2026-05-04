import type { Dispatch, SetStateAction } from 'react';
import {
  GALLERY_TILE_MIN_WIDTH_KEYBOARD_STEP,
} from '../gallery/gallery-layout-policy';
import {
  GALLERY_DAY_HEADER_HEIGHT_PX,
  GALLERY_GRID_GAP_PX,
} from '../gallery/use-gallery-view-model';
import { useDialogEscape } from '../layout/use-dialog-escape';
import { useGlobalKeyboardShortcuts } from '../layout/use-global-keyboard-shortcuts';
import { useModalFocusTrap } from '../layout/use-modal-focus-trap';
import { useUiDerivations } from '../layout/use-ui-derivations';
import { useWorkspaceModalGuards } from '../layout/use-workspace-modal-guards';

type GlobalKeyboardShortcutsOptions = Parameters<typeof useGlobalKeyboardShortcuts>[0];
type DialogEscapeOptions = Parameters<typeof useDialogEscape>[0];
type UiDerivationsOptions = Parameters<typeof useUiDerivations>[0];

interface WorkspaceModalGuardsOptions<UploadConflictDialog> {
  isWorkspaceSettingsOpen: boolean;
  selectedProfileId: string;
  setIsWorkspaceSettingsOpen: Dispatch<SetStateAction<boolean>>;
  setUploadConflictDialog: Dispatch<SetStateAction<UploadConflictDialog | null>>;
  uploadConflictDialog: UploadConflictDialog | null;
}

interface UseDesktopWorkbenchShellOptions<UploadConflictDialog> {
  dialogEscape: DialogEscapeOptions;
  keyboardShortcuts: Omit<
    GlobalKeyboardShortcutsOptions,
    'galleryTileKeyboardStep' | 'galleryGridGapPx' | 'galleryDayHeaderHeightPx'
  >;
  uiDerivations: UiDerivationsOptions;
  workspaceModalGuards: WorkspaceModalGuardsOptions<UploadConflictDialog>;
}

export const useDesktopWorkbenchShell = <UploadConflictDialog,>({
  dialogEscape,
  keyboardShortcuts,
  uiDerivations,
  workspaceModalGuards,
}: UseDesktopWorkbenchShellOptions<UploadConflictDialog>) => {
  useWorkspaceModalGuards(workspaceModalGuards);

  useGlobalKeyboardShortcuts({
    ...keyboardShortcuts,
    galleryTileKeyboardStep: GALLERY_TILE_MIN_WIDTH_KEYBOARD_STEP,
    galleryGridGapPx: GALLERY_GRID_GAP_PX,
    galleryDayHeaderHeightPx: GALLERY_DAY_HEADER_HEIGHT_PX,
  });

  useDialogEscape(dialogEscape);

  const derivedUi = useUiDerivations(uiDerivations);
  useModalFocusTrap({ isEnabled: derivedUi.isAnyDialogOpen });

  return derivedUi;
};
