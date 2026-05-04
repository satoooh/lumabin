import type { ConflictPolicy } from '../../shared/ipc';
import {
  UploadConflictDialog,
  type UploadConflictDialogState,
} from './upload-conflict-dialog';
import {
  BulkDeleteDialog,
  BulkMoveDialog,
  type BulkMoveDialogState,
} from './bulk-action-dialogs';
import {
  AssetActionDialog,
  type AssetActionDialogState,
} from './asset-action-dialog';
export type { UploadConflictDialogState } from './upload-conflict-dialog';
export type { BulkMoveDialogState } from './bulk-action-dialogs';
export type { AssetActionDialogState } from './asset-action-dialog';

interface GalleryActionModalsProps {
  uploadConflictDialog: UploadConflictDialogState | null;
  isUploadBusy: boolean;
  onCloseUploadConflict: () => void;
  onResolveUploadConflict: (policy: ConflictPolicy) => void;
  bulkMoveDialog: BulkMoveDialogState | null;
  isAssetActionBusy: boolean;
  onCloseBulkMove: () => void;
  onChangeBulkMoveDestinationPrefix: (value: string) => void;
  onSubmitBulkMove: () => void;
  bulkDeleteDialogKeys: string[] | null;
  onCloseBulkDelete: () => void;
  onSubmitBulkDelete: () => void;
  assetActionDialog: AssetActionDialogState | null;
  selectedProfileId: string;
  basenameFromKey: (key: string) => string;
  onCloseAssetAction: () => void;
  onChangeAssetActionInputValue: (value: string) => void;
  onSubmitAssetAction: () => void;
}

export const GalleryActionModals = ({
  uploadConflictDialog,
  isUploadBusy,
  onCloseUploadConflict,
  onResolveUploadConflict,
  bulkMoveDialog,
  isAssetActionBusy,
  onCloseBulkMove,
  onChangeBulkMoveDestinationPrefix,
  onSubmitBulkMove,
  bulkDeleteDialogKeys,
  onCloseBulkDelete,
  onSubmitBulkDelete,
  assetActionDialog,
  selectedProfileId,
  basenameFromKey,
  onCloseAssetAction,
  onChangeAssetActionInputValue,
  onSubmitAssetAction,
}: GalleryActionModalsProps) => {
  return (
    <>
      {uploadConflictDialog ? (
        <UploadConflictDialog
          dialog={uploadConflictDialog}
          isUploadBusy={isUploadBusy}
          onClose={onCloseUploadConflict}
          onResolve={onResolveUploadConflict}
        />
      ) : null}

      {bulkMoveDialog ? (
        <BulkMoveDialog
          dialog={bulkMoveDialog}
          isAssetActionBusy={isAssetActionBusy}
          onChangeDestinationPrefix={onChangeBulkMoveDestinationPrefix}
          onClose={onCloseBulkMove}
          onSubmit={onSubmitBulkMove}
        />
      ) : null}

      {bulkDeleteDialogKeys ? (
        <BulkDeleteDialog
          keys={bulkDeleteDialogKeys}
          isAssetActionBusy={isAssetActionBusy}
          onClose={onCloseBulkDelete}
          onSubmit={onSubmitBulkDelete}
        />
      ) : null}

      {assetActionDialog ? (
        <AssetActionDialog
          dialog={assetActionDialog}
          basenameFromKey={basenameFromKey}
          isAssetActionBusy={isAssetActionBusy}
          isProfileSelected={Boolean(selectedProfileId)}
          onChangeInputValue={onChangeAssetActionInputValue}
          onClose={onCloseAssetAction}
          onSubmit={onSubmitAssetAction}
        />
      ) : null}
    </>
  );
};
