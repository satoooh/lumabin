import {
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react';

interface UseWorkspaceModalGuardsOptions<UploadConflictDialog> {
  isWorkspaceSettingsOpen: boolean;
  selectedProfileId: string;
  setIsWorkspaceSettingsOpen: Dispatch<SetStateAction<boolean>>;
  setUploadConflictDialog: Dispatch<SetStateAction<UploadConflictDialog | null>>;
  uploadConflictDialog: UploadConflictDialog | null;
}

export const useWorkspaceModalGuards = <UploadConflictDialog>({
  isWorkspaceSettingsOpen,
  selectedProfileId,
  setIsWorkspaceSettingsOpen,
  setUploadConflictDialog,
  uploadConflictDialog,
}: UseWorkspaceModalGuardsOptions<UploadConflictDialog>): void => {
  useEffect(() => {
    if (!uploadConflictDialog) {
      return;
    }
    if (!selectedProfileId) {
      setUploadConflictDialog(null);
    }
  }, [selectedProfileId, setUploadConflictDialog, uploadConflictDialog]);

  useEffect(() => {
    if (!selectedProfileId && isWorkspaceSettingsOpen) {
      setIsWorkspaceSettingsOpen(false);
    }
  }, [isWorkspaceSettingsOpen, selectedProfileId, setIsWorkspaceSettingsOpen]);
};
