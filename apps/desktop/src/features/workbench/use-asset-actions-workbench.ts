import { useState, type Dispatch, type SetStateAction } from 'react';
import type { AssetItem } from '../../shared/ipc';
import {
  type AssetActionDialogState,
  type BulkMoveDialogState,
} from '../gallery/action-modals';
import { useAssetMutationCommands } from '../gallery/use-asset-mutation-commands';
import { usePendingDeleteCompletion } from '../gallery/use-pending-delete-completion';
import { usePendingDeleteController } from '../gallery/use-pending-delete-controller';
import { usePendingDeleteToastSummary } from '../gallery/use-pending-delete-toast-summary';
import { normalizeAssetPrefix } from '../shared/asset-prefix';
import type {
  AssetMutationApi,
  DesktopApiGateway,
} from '../shared/desktop-api-gateway';

type StatusTone = 'neutral' | 'success' | 'error';

const DELETE_UNDO_WINDOW_MS = 5_000;

interface UseAssetActionsWorkbenchOptions {
  assetMutationApi: AssetMutationApi;
  assetsPrefix: string;
  deleteAssets: DesktopApiGateway['assetLibrary']['deleteAssets'];
  isConnectionSetupOpen: boolean;
  pushInlineFeedback: (message: string) => void;
  reloadCurrentItems: () => Promise<void>;
  selectedAsset: AssetItem | null;
  selectedAssetKey: string;
  selectedAssetKeys: string[];
  selectedProfileId: string;
  setIsQuickPreviewOpen: Dispatch<SetStateAction<boolean>>;
  setIsSelectionMode: Dispatch<SetStateAction<boolean>>;
  setSelectedAssetKey: Dispatch<SetStateAction<string>>;
  setSelectedAssetKeys: Dispatch<SetStateAction<string[]>>;
  setStatusLine: (status: string, tone?: StatusTone) => void;
  showGuidedStart: boolean;
  visibleItems: AssetItem[];
}

export const useAssetActionsWorkbench = ({
  assetMutationApi,
  assetsPrefix,
  deleteAssets,
  isConnectionSetupOpen,
  pushInlineFeedback,
  reloadCurrentItems,
  selectedAsset,
  selectedAssetKey,
  selectedAssetKeys,
  selectedProfileId,
  setIsQuickPreviewOpen,
  setIsSelectionMode,
  setSelectedAssetKey,
  setSelectedAssetKeys,
  setStatusLine,
  showGuidedStart,
  visibleItems,
}: UseAssetActionsWorkbenchOptions) => {
  const [assetActionDialog, setAssetActionDialog] =
    useState<AssetActionDialogState | null>(null);
  const [bulkMoveDialog, setBulkMoveDialog] =
    useState<BulkMoveDialogState | null>(null);
  const [bulkDeleteDialogKeys, setBulkDeleteDialogKeys] =
    useState<string[] | null>(null);
  const [isAssetActionBusy, setIsAssetActionBusy] = useState<boolean>(false);

  const handlePendingDeleteCompleted = usePendingDeleteCompletion({
    reloadCurrentItems,
    selectedAssetKey,
    selectedProfileId,
    setIsQuickPreviewOpen,
    setSelectedAssetKey,
    setSelectedAssetKeys,
  });

  const {
    executePendingDelete,
    pendingDeleteJobs,
    pendingDeleteTicker,
    schedulePendingDelete,
    undoPendingDelete,
  } = usePendingDeleteController({
    deleteAssets,
    onDeleteCompleted: handlePendingDeleteCompleted,
    onStatus: setStatusLine,
    undoWindowMs: DELETE_UNDO_WINDOW_MS,
  });

  const {
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
  } = useAssetMutationCommands({
    assetActionDialog,
    assetMutationApi,
    assetsPrefix,
    bulkDeleteDialogKeys,
    bulkMoveDialog,
    isAssetActionBusy,
    normalizePrefix: normalizeAssetPrefix,
    pushInlineFeedback,
    reloadCurrentItems,
    schedulePendingDelete,
    selectedAsset: selectedAsset ?? undefined,
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
  });

  const {
    activePendingDeleteJob,
    pendingDeleteRemainingSeconds,
    pendingDeleteQueuedMoreCount,
    showPendingDeleteToast,
  } = usePendingDeleteToastSummary({
    pendingDeleteJobs,
    pendingDeleteTicker,
    showGuidedStart,
    isConnectionSetupOpen,
  });

  return {
    activePendingDeleteJob,
    assetActionDialog,
    bulkDeleteDialogKeys,
    bulkMoveDialog,
    executePendingDelete,
    handleChangeAssetActionInputValue,
    handleChangeBulkMoveDestinationPrefix,
    handleCloseAssetActionDialog,
    handleCloseBulkDeleteDialog,
    handleCloseBulkMoveDialog,
    handleOpenAssetDelete,
    handleOpenAssetMove,
    handleOpenAssetRename,
    handleOpenBulkDeleteDialog,
    handleOpenBulkMoveDialog,
    handleSubmitAssetAction,
    handleSubmitBulkDelete,
    handleSubmitBulkMove,
    isAssetActionBusy,
    pendingDeleteQueuedMoreCount,
    pendingDeleteRemainingSeconds,
    setAssetActionDialog,
    setBulkDeleteDialogKeys,
    setBulkMoveDialog,
    showPendingDeleteToast,
    undoPendingDelete,
  };
};
