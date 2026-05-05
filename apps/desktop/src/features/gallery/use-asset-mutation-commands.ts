import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { AssetItem } from '../../shared/ipc';
import type { AssetActionDialogState, BulkMoveDialogState } from './action-modals';
import {
  basenameFromKey,
  commonParentPrefixFromKeys,
} from '../shared/asset-key';
import type { AssetMutationApi } from '../shared/desktop-api-gateway';
import { formatCount } from '../shared/format-count';
import {
  planAssetMove,
  planAssetRename,
  planBulkAssetMove,
} from './asset-mutation-command-policy';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseAssetMutationCommandsOptions {
  assetActionDialog: AssetActionDialogState | null;
  assetMutationApi: AssetMutationApi;
  assetsPrefix: string;
  bulkDeleteDialogKeys: string[] | null;
  bulkMoveDialog: BulkMoveDialogState | null;
  isAssetActionBusy: boolean;
  normalizePrefix: (prefix: string) => string;
  pushInlineFeedback: (message: string) => void;
  reloadCurrentItems: () => Promise<void>;
  schedulePendingDelete: (profileId: string, keys: string[]) => void;
  selectedAsset?: AssetItem;
  selectedAssetKeys: string[];
  selectedProfileId: string;
  setAssetActionDialog: Dispatch<SetStateAction<AssetActionDialogState | null>>;
  setBulkDeleteDialogKeys: Dispatch<SetStateAction<string[] | null>>;
  setBulkMoveDialog: Dispatch<SetStateAction<BulkMoveDialogState | null>>;
  setIsAssetActionBusy: Dispatch<SetStateAction<boolean>>;
  setIsQuickPreviewOpen: Dispatch<SetStateAction<boolean>>;
  setIsSelectionMode: Dispatch<SetStateAction<boolean>>;
  setSelectedAssetKey: Dispatch<SetStateAction<string>>;
  setSelectedAssetKeys: Dispatch<SetStateAction<string[]>>;
  setStatusLine: (status: string, tone?: StatusTone) => void;
  visibleItems: AssetItem[];
}

export const useAssetMutationCommands = ({
  assetActionDialog,
  assetMutationApi,
  assetsPrefix,
  bulkDeleteDialogKeys,
  bulkMoveDialog,
  isAssetActionBusy,
  normalizePrefix,
  pushInlineFeedback,
  reloadCurrentItems,
  schedulePendingDelete,
  selectedAsset,
  selectedAssetKeys,
  selectedProfileId,
  setAssetActionDialog,
  setBulkDeleteDialogKeys,
  setBulkMoveDialog,
  setIsAssetActionBusy,
  setIsQuickPreviewOpen,
  setIsSelectionMode,
  setSelectedAssetKey,
  setSelectedAssetKeys,
  setStatusLine,
  visibleItems,
}: UseAssetMutationCommandsOptions) => {
  const handleOpenAssetRename = useCallback(() => {
    if (!selectedAsset) {
      return;
    }
    setAssetActionDialog({
      kind: 'rename',
      key: selectedAsset.key,
      inputValue: basenameFromKey(selectedAsset.key),
    });
  }, [selectedAsset, setAssetActionDialog]);

  const handleOpenAssetMove = useCallback(() => {
    if (!selectedAsset) {
      return;
    }
    setAssetActionDialog({
      kind: 'move',
      key: selectedAsset.key,
      inputValue: selectedAsset.key,
    });
  }, [selectedAsset, setAssetActionDialog]);

  const handleOpenAssetDelete = useCallback(() => {
    if (!selectedAsset) {
      return;
    }
    setAssetActionDialog({
      kind: 'delete',
      key: selectedAsset.key,
      inputValue: '',
    });
  }, [selectedAsset, setAssetActionDialog]);

  const handleOpenBulkDeleteDialog = useCallback(() => {
    if (selectedAssetKeys.length === 0) {
      setStatusLine('Select assets first.', 'error');
      return;
    }
    setBulkDeleteDialogKeys([...selectedAssetKeys]);
  }, [selectedAssetKeys, setBulkDeleteDialogKeys, setStatusLine]);

  const handleOpenBulkMoveDialog = useCallback(() => {
    if (selectedAssetKeys.length === 0) {
      setStatusLine('Select assets first.', 'error');
      return;
    }
    const suggestedPrefix =
      commonParentPrefixFromKeys(selectedAssetKeys) ||
      normalizePrefix(assetsPrefix);
    setBulkMoveDialog({
      keys: [...selectedAssetKeys],
      destinationPrefix: suggestedPrefix,
    });
  }, [assetsPrefix, normalizePrefix, selectedAssetKeys, setBulkMoveDialog, setStatusLine]);

  const handleCloseAssetActionDialog = useCallback(() => {
    if (isAssetActionBusy) {
      return;
    }
    setAssetActionDialog(null);
  }, [isAssetActionBusy, setAssetActionDialog]);

  const handleCloseBulkDeleteDialog = useCallback(() => {
    if (isAssetActionBusy) {
      return;
    }
    setBulkDeleteDialogKeys(null);
  }, [isAssetActionBusy, setBulkDeleteDialogKeys]);

  const handleCloseBulkMoveDialog = useCallback(() => {
    if (isAssetActionBusy) {
      return;
    }
    setBulkMoveDialog(null);
  }, [isAssetActionBusy, setBulkMoveDialog]);

  const handleChangeBulkMoveDestinationPrefix = useCallback(
    (value: string) => {
      setBulkMoveDialog((current) =>
        current
          ? {
              ...current,
              destinationPrefix: value,
            }
          : current,
      );
    },
    [setBulkMoveDialog],
  );

  const handleChangeAssetActionInputValue = useCallback(
    (value: string) => {
      setAssetActionDialog((current) =>
        current && (current.kind === 'rename' || current.kind === 'move')
          ? { ...current, inputValue: value }
          : current,
      );
    },
    [setAssetActionDialog],
  );

  const handleSubmitAssetAction = useCallback(async () => {
    if (!assetActionDialog || !selectedProfileId) {
      return;
    }

    const targetKey = assetActionDialog.key;
    setIsAssetActionBusy(true);
    try {
      if (assetActionDialog.kind === 'rename') {
        const plan = planAssetRename(targetKey, assetActionDialog.inputValue);
        if (plan.kind === 'no-change') {
          setAssetActionDialog(null);
          setStatusLine('No rename changes detected.', 'neutral');
          return;
        }

        await assetMutationApi.renameAsset({
          profileId: selectedProfileId,
          fromKey: targetKey,
          toKey: plan.destinationKey,
        });

        await reloadCurrentItems();
        setSelectedAssetKey(plan.destinationKey);
        setAssetActionDialog(null);
        pushInlineFeedback('Renamed');
        setStatusLine('Asset renamed.', 'success');
        return;
      }

      if (assetActionDialog.kind === 'move') {
        const plan = planAssetMove(targetKey, assetActionDialog.inputValue);
        if (plan.kind === 'no-change') {
          setAssetActionDialog(null);
          setStatusLine('No move changes detected.', 'neutral');
          return;
        }

        await assetMutationApi.moveAsset({
          profileId: selectedProfileId,
          fromKey: targetKey,
          toKey: plan.destinationKey,
        });

        await reloadCurrentItems();
        setSelectedAssetKey(plan.destinationKey);
        setAssetActionDialog(null);
        pushInlineFeedback('Moved');
        setStatusLine('Asset moved.', 'success');
        return;
      }

      const selectedIndex = visibleItems.findIndex((item) => item.key === targetKey);
      const nextSelectedKeyBeforeRefresh =
        visibleItems[selectedIndex + 1]?.key ?? visibleItems[selectedIndex - 1]?.key ?? '';

      setSelectedAssetKey(nextSelectedKeyBeforeRefresh === targetKey ? '' : nextSelectedKeyBeforeRefresh);
      setSelectedAssetKeys((current) => current.filter((key) => key !== targetKey));
      setIsQuickPreviewOpen(false);
      setAssetActionDialog(null);
      schedulePendingDelete(selectedProfileId, [targetKey]);
      pushInlineFeedback('Delete queued');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const action = assetActionDialog.kind === 'delete' ? 'delete' : assetActionDialog.kind;
      setStatusLine(`Failed to ${action} asset: ${message}`, 'error');
    } finally {
      setIsAssetActionBusy(false);
    }
  }, [
    assetActionDialog,
    assetMutationApi,
    pushInlineFeedback,
    reloadCurrentItems,
    schedulePendingDelete,
    selectedProfileId,
    setAssetActionDialog,
    setIsAssetActionBusy,
    setIsQuickPreviewOpen,
    setSelectedAssetKey,
    setSelectedAssetKeys,
    setStatusLine,
    visibleItems,
  ]);

  const handleSubmitBulkDelete = useCallback(async () => {
    if (!selectedProfileId || !bulkDeleteDialogKeys || bulkDeleteDialogKeys.length === 0) {
      return;
    }

    setIsAssetActionBusy(true);
    try {
      schedulePendingDelete(selectedProfileId, bulkDeleteDialogKeys);
      setBulkDeleteDialogKeys(null);
      setSelectedAssetKeys([]);
      setIsSelectionMode(false);
      setIsQuickPreviewOpen(false);
      pushInlineFeedback('Delete queued');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Failed to delete assets: ${message}`, 'error');
    } finally {
      setIsAssetActionBusy(false);
    }
  }, [
    bulkDeleteDialogKeys,
    pushInlineFeedback,
    schedulePendingDelete,
    selectedProfileId,
    setBulkDeleteDialogKeys,
    setIsAssetActionBusy,
    setIsQuickPreviewOpen,
    setIsSelectionMode,
    setSelectedAssetKeys,
    setStatusLine,
  ]);

  const handleSubmitBulkMove = useCallback(async () => {
    if (!selectedProfileId || !bulkMoveDialog || bulkMoveDialog.keys.length === 0) {
      return;
    }

    const destinationPrefix = normalizePrefix(bulkMoveDialog.destinationPrefix);
    const plan = planBulkAssetMove(bulkMoveDialog.keys, destinationPrefix);
    if (plan.kind === 'duplicate-destination') {
      setStatusLine(
        'Selected assets include duplicate file names. Move fewer items or rename first.',
        'error',
      );
      return;
    }

    setIsAssetActionBusy(true);
    try {
      let movedCount = 0;
      const failedKeys: string[] = [];

      for (const item of plan.moves) {
        try {
          await assetMutationApi.moveAsset({
            profileId: selectedProfileId,
            fromKey: item.sourceKey,
            toKey: item.destinationKey,
          });
          movedCount += 1;
        } catch {
          failedKeys.push(item.sourceKey);
        }
      }

      await reloadCurrentItems();
      setBulkMoveDialog(null);
      setIsQuickPreviewOpen(false);

      if (failedKeys.length > 0) {
        setIsSelectionMode(true);
        setSelectedAssetKeys(failedKeys);
      } else {
        setSelectedAssetKeys([]);
        setIsSelectionMode(false);
      }

      const movedMessage = `Moved ${formatCount(movedCount, 'asset')}.`;
      const skippedMessage = plan.skippedCount > 0 ? ` Skipped ${formatCount(plan.skippedCount, 'asset')}.` : '';
      const failedMessage = failedKeys.length > 0 ? ` Failed ${formatCount(failedKeys.length, 'asset')}.` : '';
      setStatusLine(
        `${movedMessage}${skippedMessage}${failedMessage}`,
        failedKeys.length > 0 ? 'error' : 'success',
      );
      if (movedCount > 0) {
        pushInlineFeedback(`Moved ${formatCount(movedCount, 'asset')}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Failed to move assets: ${message}`, 'error');
    } finally {
      setIsAssetActionBusy(false);
    }
  }, [
    bulkMoveDialog,
    assetMutationApi,
    normalizePrefix,
    pushInlineFeedback,
    reloadCurrentItems,
    selectedProfileId,
    setBulkMoveDialog,
    setIsAssetActionBusy,
    setIsQuickPreviewOpen,
    setIsSelectionMode,
    setSelectedAssetKeys,
    setStatusLine,
  ]);

  return {
    handleCloseAssetActionDialog,
    handleCloseBulkDeleteDialog,
    handleCloseBulkMoveDialog,
    handleChangeAssetActionInputValue,
    handleChangeBulkMoveDestinationPrefix,
    handleOpenAssetDelete,
    handleOpenAssetMove,
    handleOpenAssetRename,
    handleOpenBulkDeleteDialog,
    handleOpenBulkMoveDialog,
    handleSubmitAssetAction,
    handleSubmitBulkDelete,
    handleSubmitBulkMove,
  };
};
