import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { DeleteResult } from '../../shared/ipc';
import type { PendingDeleteJob } from './use-pending-delete-controller';

interface UsePendingDeleteCompletionOptions {
  reloadCurrentItems: () => Promise<void>;
  selectedAssetKey: string;
  selectedProfileId: string;
  setIsQuickPreviewOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedAssetKey: Dispatch<SetStateAction<string>>;
  setSelectedAssetKeys: Dispatch<SetStateAction<string[]>>;
}

export const removeDeletedAssetKeys = (
  selectedAssetKeys: string[],
  deletedKeys: Iterable<string>,
): string[] => {
  const deletedSet = new Set(deletedKeys);
  return selectedAssetKeys.filter((key) => !deletedSet.has(key));
};

export const usePendingDeleteCompletion = ({
  reloadCurrentItems,
  selectedAssetKey,
  selectedProfileId,
  setIsQuickPreviewOpen,
  setSelectedAssetKey,
  setSelectedAssetKeys,
}: UsePendingDeleteCompletionOptions) =>
  useCallback(
    async (job: PendingDeleteJob, result: DeleteResult) => {
      if (selectedProfileId !== job.profileId) {
        return;
      }

      await reloadCurrentItems();
      const deletedSet = new Set(result.deleted);
      setSelectedAssetKeys((current) => removeDeletedAssetKeys(current, deletedSet));
      if (selectedAssetKey && deletedSet.has(selectedAssetKey)) {
        setSelectedAssetKey('');
        setIsQuickPreviewOpen(false);
      }
    },
    [
      reloadCurrentItems,
      selectedAssetKey,
      selectedProfileId,
      setIsQuickPreviewOpen,
      setSelectedAssetKey,
      setSelectedAssetKeys,
    ],
  );
