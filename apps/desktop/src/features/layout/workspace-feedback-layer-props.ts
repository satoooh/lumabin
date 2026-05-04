import type { ComponentProps } from 'react';
import type { WorkspaceFeedbackLayer } from './workspace-feedback-layer';

type WorkspaceFeedbackLayerProps = ComponentProps<typeof WorkspaceFeedbackLayer>;

interface WorkspaceFeedbackLayerPropsInput {
  commands: {
    handleCancelUpload: WorkspaceFeedbackLayerProps['onCancelUpload'];
    handleClearFinishedUploads: WorkspaceFeedbackLayerProps['onDismissUpload'];
    handleRetryUpload: WorkspaceFeedbackLayerProps['onRetryUpload'];
    executePendingDelete: WorkspaceFeedbackLayerProps['onExecutePendingDelete'];
    undoPendingDelete: WorkspaceFeedbackLayerProps['onUndoPendingDelete'];
  };
  dropOverlay: {
    dropOverlayPrefixLabel: WorkspaceFeedbackLayerProps['dropOverlay']['prefixLabel'];
    isDropActive: WorkspaceFeedbackLayerProps['dropOverlay']['isActive'];
  };
  pendingDelete: {
    activePendingDeleteJob: WorkspaceFeedbackLayerProps['pendingDelete']['activeJob'];
    pendingDeleteQueuedMoreCount: WorkspaceFeedbackLayerProps['pendingDelete']['queuedMoreCount'];
    pendingDeleteRemainingSeconds: WorkspaceFeedbackLayerProps['pendingDelete']['remainingSeconds'];
    showPendingDeleteToast: WorkspaceFeedbackLayerProps['pendingDelete']['isVisible'];
  };
  upload: {
    activeUploadJobCount: WorkspaceFeedbackLayerProps['upload']['activeJobCount'];
    isUploadBusy: WorkspaceFeedbackLayerProps['upload']['isBusy'];
    isUploadToastExpanded: WorkspaceFeedbackLayerProps['upload']['isExpanded'];
    showUploadToast: WorkspaceFeedbackLayerProps['upload']['isVisible'];
    totalUploadJobs: WorkspaceFeedbackLayerProps['upload']['totalJobs'];
    uploadSummaryCanRetry: WorkspaceFeedbackLayerProps['upload']['canRetry'];
    uploadSummaryCompactTitle: WorkspaceFeedbackLayerProps['upload']['compactTitle'];
    uploadSummaryJob: WorkspaceFeedbackLayerProps['upload']['activeJob'];
    uploadSummaryLastError: WorkspaceFeedbackLayerProps['upload']['lastError'];
    uploadSummaryProgress: WorkspaceFeedbackLayerProps['upload']['progress'];
    uploadSummarySubtitle: WorkspaceFeedbackLayerProps['upload']['subtitle'];
    uploadSummaryTitle: WorkspaceFeedbackLayerProps['upload']['title'];
    uploadToastRef: WorkspaceFeedbackLayerProps['upload']['ref'];
  };
}

export const createWorkspaceFeedbackLayerProps = ({
  commands,
  dropOverlay,
  pendingDelete,
  upload,
}: WorkspaceFeedbackLayerPropsInput): WorkspaceFeedbackLayerProps => ({
  pendingDelete: {
    activeJob: pendingDelete.activePendingDeleteJob,
    isStackedWithUpload: upload.showUploadToast && Boolean(upload.uploadSummaryJob),
    isVisible: pendingDelete.showPendingDeleteToast,
    queuedMoreCount: pendingDelete.pendingDeleteQueuedMoreCount,
    remainingSeconds: pendingDelete.pendingDeleteRemainingSeconds,
  },
  upload: {
    activeJob: upload.uploadSummaryJob,
    activeJobCount: upload.activeUploadJobCount,
    canRetry: upload.uploadSummaryCanRetry,
    compactTitle: upload.uploadSummaryCompactTitle,
    isBusy: upload.isUploadBusy,
    isExpanded: upload.isUploadToastExpanded,
    isVisible: upload.showUploadToast,
    lastError: upload.uploadSummaryLastError,
    progress: upload.uploadSummaryProgress,
    ref: upload.uploadToastRef,
    status: upload.uploadSummaryJob?.status ?? 'done',
    subtitle: upload.uploadSummarySubtitle,
    title: upload.uploadSummaryTitle,
    totalJobs: upload.totalUploadJobs,
  },
  dropOverlay: {
    isActive: dropOverlay.isDropActive,
    prefixLabel: dropOverlay.dropOverlayPrefixLabel,
  },
  onUndoPendingDelete: commands.undoPendingDelete,
  onExecutePendingDelete: (jobId) => {
    void commands.executePendingDelete(jobId);
  },
  onRetryUpload: (job) => {
    void commands.handleRetryUpload(job);
  },
  onCancelUpload: (jobId) => {
    void commands.handleCancelUpload(jobId);
  },
  onDismissUpload: commands.handleClearFinishedUploads,
});
