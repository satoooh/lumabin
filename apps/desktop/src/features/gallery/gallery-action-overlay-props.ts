import type { ComponentProps } from 'react';
import type { ConflictPolicy } from '../../shared/ipc';
import type {
  AssetActionDialogState,
  BulkMoveDialogState,
  GalleryActionModals,
} from './action-modals';
import { basenameFromKey } from '../shared/asset-key';
import type { UploadConflictDialogState as UploadQueueConflictDialogState } from '../upload/use-upload-queue-commands';

type GalleryActionModalsProps = ComponentProps<typeof GalleryActionModals>;

interface GalleryActionOverlayPropsInput {
  assetAction: {
    assetActionDialog: AssetActionDialogState | null;
    handleChangeAssetActionInputValue: (value: string) => void;
    handleCloseAssetActionDialog: () => void;
    handleSubmitAssetAction: () => Promise<void> | void;
    isAssetActionBusy: boolean;
    selectedProfileId: string;
  };
  bulkDelete: {
    bulkDeleteDialogKeys: string[] | null;
    handleCloseBulkDeleteDialog: () => void;
    handleSubmitBulkDelete: () => Promise<void> | void;
  };
  bulkMove: {
    bulkMoveDialog: BulkMoveDialogState | null;
    handleChangeBulkMoveDestinationPrefix: (value: string) => void;
    handleCloseBulkMoveDialog: () => void;
    handleSubmitBulkMove: () => Promise<void> | void;
  };
  uploadConflict: {
    handleCloseUploadConflictDialog: () => void;
    handleResolveUploadConflict: (policy: ConflictPolicy) => Promise<void> | void;
    isUploadBusy: boolean;
    uploadConflictDialog: UploadQueueConflictDialogState | null;
  };
}

export const createGalleryActionOverlayProps = ({
  assetAction,
  bulkDelete,
  bulkMove,
  uploadConflict,
}: GalleryActionOverlayPropsInput): GalleryActionModalsProps => ({
  uploadConflictDialog: uploadConflict.uploadConflictDialog,
  isUploadBusy: uploadConflict.isUploadBusy,
  onCloseUploadConflict: uploadConflict.handleCloseUploadConflictDialog,
  onResolveUploadConflict: (policy) => {
    void uploadConflict.handleResolveUploadConflict(policy);
  },
  bulkMoveDialog: bulkMove.bulkMoveDialog,
  isAssetActionBusy: assetAction.isAssetActionBusy,
  onCloseBulkMove: bulkMove.handleCloseBulkMoveDialog,
  onChangeBulkMoveDestinationPrefix: bulkMove.handleChangeBulkMoveDestinationPrefix,
  onSubmitBulkMove: () => {
    void bulkMove.handleSubmitBulkMove();
  },
  bulkDeleteDialogKeys: bulkDelete.bulkDeleteDialogKeys,
  onCloseBulkDelete: bulkDelete.handleCloseBulkDeleteDialog,
  onSubmitBulkDelete: () => {
    void bulkDelete.handleSubmitBulkDelete();
  },
  assetActionDialog: assetAction.assetActionDialog,
  selectedProfileId: assetAction.selectedProfileId,
  basenameFromKey,
  onCloseAssetAction: assetAction.handleCloseAssetActionDialog,
  onChangeAssetActionInputValue: assetAction.handleChangeAssetActionInputValue,
  onSubmitAssetAction: () => {
    void assetAction.handleSubmitAssetAction();
  },
});
