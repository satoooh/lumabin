import type { RefObject } from 'react';
import { DeleteUndoToast } from '../gallery/delete-undo-toast';
import type { PendingDeleteJob } from '../gallery/use-pending-delete-controller';
import { UploadStatusToast } from '../upload/upload-status-toast';
import type { UploadQueueItem } from '../upload/upload-queue-persistence';

type UploadStatus = UploadQueueItem['status'];

interface PendingDeleteFeedbackModel {
  activeJob: PendingDeleteJob | null;
  isVisible: boolean;
  isStackedWithUpload: boolean;
  queuedMoreCount: number;
  remainingSeconds: number;
}

interface UploadFeedbackModel {
  activeJob: UploadQueueItem | null;
  activeJobCount: number;
  canRetry: boolean;
  compactTitle: string;
  isBusy: boolean;
  isExpanded: boolean;
  isVisible: boolean;
  lastError: string;
  progress: number;
  ref: RefObject<HTMLElement | null>;
  status: UploadStatus;
  subtitle: string;
  title: string;
  totalJobs: number;
}

interface DropOverlayModel {
  isActive: boolean;
  prefixLabel: string;
}

interface WorkspaceFeedbackLayerProps {
  pendingDelete: PendingDeleteFeedbackModel;
  upload: UploadFeedbackModel;
  dropOverlay: DropOverlayModel;
  onUndoPendingDelete: (jobId: string) => void;
  onExecutePendingDelete: (jobId: string) => void;
  onRetryUpload: (job: UploadQueueItem) => void;
  onCancelUpload: (jobId: string) => void;
  onDismissUpload: () => void;
}

export const WorkspaceFeedbackLayer = ({
  pendingDelete,
  upload,
  dropOverlay,
  onUndoPendingDelete,
  onExecutePendingDelete,
  onRetryUpload,
  onCancelUpload,
  onDismissUpload,
}: WorkspaceFeedbackLayerProps) => {
  return (
    <>
      <DeleteUndoToast
        isVisible={pendingDelete.isVisible && Boolean(pendingDelete.activeJob)}
        isStackedWithUpload={pendingDelete.isStackedWithUpload}
        pendingItemCount={pendingDelete.activeJob?.keys.length ?? 0}
        queuedMoreCount={pendingDelete.queuedMoreCount}
        remainingSeconds={pendingDelete.remainingSeconds}
        onUndo={() => {
          if (!pendingDelete.activeJob) {
            return;
          }
          onUndoPendingDelete(pendingDelete.activeJob.id);
        }}
        onDeleteNow={() => {
          if (!pendingDelete.activeJob) {
            return;
          }
          onExecutePendingDelete(pendingDelete.activeJob.id);
        }}
      />

      <UploadStatusToast
        ref={upload.ref}
        isVisible={upload.isVisible && Boolean(upload.activeJob)}
        isExpanded={upload.isExpanded}
        title={upload.title}
        compactTitle={upload.compactTitle}
        status={upload.status}
        subtitle={upload.subtitle}
        lastError={upload.lastError}
        progress={upload.progress}
        canRetry={upload.canRetry}
        isBusy={upload.isBusy}
        isActive={upload.status === 'queued' || upload.status === 'running'}
        activeJobCount={upload.activeJobCount}
        totalJobs={upload.totalJobs}
        onRetryFailed={() => {
          if (!upload.activeJob) {
            return;
          }
          onRetryUpload(upload.activeJob);
        }}
        onCancel={() => {
          if (!upload.activeJob) {
            return;
          }
          onCancelUpload(upload.activeJob.id);
        }}
        onDismiss={onDismissUpload}
      />

      {dropOverlay.isActive ? (
        <div className="drop-overlay">
          <div className="drop-overlay-card">
            <p>Drop files to upload</p>
            <span>Prefix: {dropOverlay.prefixLabel}</span>
          </div>
        </div>
      ) : null}
    </>
  );
};
