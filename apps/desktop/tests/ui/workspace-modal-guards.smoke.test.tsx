import { cleanup, render, waitFor } from '@testing-library/react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { useWorkspaceModalGuards } from '../../src/features/layout/use-workspace-modal-guards';

interface UploadConflictDialogFixture {
  destinationPrefix: string;
}

interface ProbeProps {
  isWorkspaceSettingsOpen: boolean;
  selectedProfileId: string;
  setIsWorkspaceSettingsOpen: (isOpen: boolean) => void;
  setUploadConflictDialog: (dialog: UploadConflictDialogFixture | null) => void;
  uploadConflictDialog: UploadConflictDialogFixture | null;
}

const conflictDialogFixture: UploadConflictDialogFixture = {
  destinationPrefix: 'photos/',
};

const Probe = ({
  isWorkspaceSettingsOpen,
  selectedProfileId,
  setIsWorkspaceSettingsOpen,
  setUploadConflictDialog,
  uploadConflictDialog,
}: ProbeProps) => {
  useWorkspaceModalGuards({
    isWorkspaceSettingsOpen,
    selectedProfileId,
    setIsWorkspaceSettingsOpen,
    setUploadConflictDialog,
    uploadConflictDialog,
  });
  return null;
};

describe('useWorkspaceModalGuards', () => {
  afterEach(() => {
    cleanup();
  });

  it('closes profile-scoped dialogs when no workspace profile is selected', async () => {
    const setIsWorkspaceSettingsOpen = vi.fn();
    const setUploadConflictDialog = vi.fn();

    render(
      <Probe
        isWorkspaceSettingsOpen={true}
        selectedProfileId=""
        setIsWorkspaceSettingsOpen={setIsWorkspaceSettingsOpen}
        setUploadConflictDialog={setUploadConflictDialog}
        uploadConflictDialog={conflictDialogFixture}
      />,
    );

    await waitFor(() => {
      expect(setUploadConflictDialog).toHaveBeenCalledWith(null);
      expect(setIsWorkspaceSettingsOpen).toHaveBeenCalledWith(false);
    });
  });

  it('keeps dialogs open while a workspace profile is selected', async () => {
    const setIsWorkspaceSettingsOpen = vi.fn();
    const setUploadConflictDialog = vi.fn();

    render(
      <Probe
        isWorkspaceSettingsOpen={true}
        selectedProfileId="profile-1"
        setIsWorkspaceSettingsOpen={setIsWorkspaceSettingsOpen}
        setUploadConflictDialog={setUploadConflictDialog}
        uploadConflictDialog={conflictDialogFixture}
      />,
    );

    await waitFor(() => {
      expect(setUploadConflictDialog).not.toHaveBeenCalled();
      expect(setIsWorkspaceSettingsOpen).not.toHaveBeenCalled();
    });
  });
});
