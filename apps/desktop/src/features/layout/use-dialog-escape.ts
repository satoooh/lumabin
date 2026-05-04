import { useEffect } from 'react';

interface UseDialogEscapeOptions {
  isQuickPreviewOpen: boolean;
  hasAssetActionDialog: boolean;
  hasBulkDeleteDialog: boolean;
  hasBulkMoveDialog: boolean;
  hasUploadConflictDialog: boolean;
  isShortcutHelpOpen: boolean;
  isConnectionSetupOpen: boolean;
  isWorkspaceSettingsOpen: boolean;
  onCloseAssetActionDialog: () => void;
  onCloseBulkDeleteDialog: () => void;
  onCloseBulkMoveDialog: () => void;
  onCloseUploadConflictDialog: () => void;
  onCloseShortcutHelp: () => void;
  onCloseConnectionSetup: () => void;
  onCloseWorkspaceSettings: () => void;
}

export const useDialogEscape = ({
  isQuickPreviewOpen,
  hasAssetActionDialog,
  hasBulkDeleteDialog,
  hasBulkMoveDialog,
  hasUploadConflictDialog,
  isShortcutHelpOpen,
  isConnectionSetupOpen,
  isWorkspaceSettingsOpen,
  onCloseAssetActionDialog,
  onCloseBulkDeleteDialog,
  onCloseBulkMoveDialog,
  onCloseUploadConflictDialog,
  onCloseShortcutHelp,
  onCloseConnectionSetup,
  onCloseWorkspaceSettings,
}: UseDialogEscapeOptions): void => {
  useEffect(() => {
    const onEscapeForDialogs = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isQuickPreviewOpen) {
        return;
      }

      if (hasAssetActionDialog) {
        event.preventDefault();
        onCloseAssetActionDialog();
        return;
      }

      if (hasBulkDeleteDialog) {
        event.preventDefault();
        onCloseBulkDeleteDialog();
        return;
      }

      if (hasBulkMoveDialog) {
        event.preventDefault();
        onCloseBulkMoveDialog();
        return;
      }

      if (hasUploadConflictDialog) {
        event.preventDefault();
        onCloseUploadConflictDialog();
        return;
      }

      if (isShortcutHelpOpen) {
        event.preventDefault();
        onCloseShortcutHelp();
        return;
      }

      if (isConnectionSetupOpen) {
        event.preventDefault();
        onCloseConnectionSetup();
        return;
      }

      if (isWorkspaceSettingsOpen) {
        event.preventDefault();
        onCloseWorkspaceSettings();
      }
    };

    window.addEventListener('keydown', onEscapeForDialogs);
    return () => {
      window.removeEventListener('keydown', onEscapeForDialogs);
    };
  }, [
    hasAssetActionDialog,
    hasBulkDeleteDialog,
    hasBulkMoveDialog,
    hasUploadConflictDialog,
    isConnectionSetupOpen,
    isQuickPreviewOpen,
    isShortcutHelpOpen,
    isWorkspaceSettingsOpen,
    onCloseAssetActionDialog,
    onCloseBulkDeleteDialog,
    onCloseBulkMoveDialog,
    onCloseConnectionSetup,
    onCloseShortcutHelp,
    onCloseUploadConflictDialog,
    onCloseWorkspaceSettings,
  ]);
};
