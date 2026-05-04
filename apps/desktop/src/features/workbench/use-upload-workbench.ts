import type { RefObject } from 'react';
import type { ConflictPolicy } from '../../shared/ipc';
import type {
  UploadCommandApi,
  UploadFilesApi,
} from '../shared/desktop-api-gateway';
import { toUploadFailureMessage } from '../upload/upload-failure-message';
import { useUploadController } from '../upload/use-upload-controller';
import { useUploadToastLifecycle } from '../upload/use-upload-toast-lifecycle';
import { useUploadToastStackHeight } from '../upload/use-upload-toast-stack-height';
import { useUploadToastSummary } from '../upload/use-toast-summaries';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseUploadWorkbenchOptions {
  appShellRef: RefObject<HTMLDivElement | null>;
  assetsPrefix: string;
  defaultConflictPolicy: ConflictPolicy;
  filesApi: UploadFilesApi;
  isConnectionReady: boolean;
  isConnectionSetupOpen: boolean;
  onGalleryRefresh: () => Promise<void>;
  onInlineFeedback: (message: string) => void;
  onStatusLine: (status: string, tone?: StatusTone) => void;
  selectedProfileId: string;
  showGuidedStart: boolean;
  uploadApi: UploadCommandApi;
  uploadToastRef: RefObject<HTMLElement | null>;
}

export const useUploadWorkbench = ({
  appShellRef,
  assetsPrefix,
  defaultConflictPolicy,
  filesApi,
  isConnectionReady,
  isConnectionSetupOpen,
  onGalleryRefresh,
  onInlineFeedback,
  onStatusLine,
  selectedProfileId,
  showGuidedStart,
  uploadApi,
  uploadToastRef,
}: UseUploadWorkbenchOptions) => {
  const {
    fileInputRef,
    handleCancelUpload,
    handleClearFinishedUploads,
    handleFilePickerChange,
    handleOpenFilePicker,
    handleResolveUploadConflict,
    handleRetryUpload,
    isDropActive,
    isUploadBusy,
    setUploadConflictDialog,
    uploadConflictDialog,
    uploadQueue,
  } = useUploadController({
    assetsPrefix,
    defaultConflictPolicy,
    filesApi,
    isConnectionReady,
    onGalleryRefresh,
    onInlineFeedback,
    onStatusLine,
    selectedProfileId,
    uploadApi,
  });

  const handleCloseUploadConflictDialog = () => {
    setUploadConflictDialog(null);
  };

  const {
    activeUploadJobCount,
    totalUploadJobs,
    uploadSummaryJob,
    showUploadToast,
    uploadSummaryProgress,
    uploadSummaryCanRetry,
    uploadSummaryTitle,
    uploadSummarySubtitle,
    uploadSummaryCompactTitle,
    uploadSummaryLastError,
  } = useUploadToastSummary({
    uploadQueue,
    selectedProfileId,
    showGuidedStart,
    isConnectionSetupOpen,
    mapUploadFailureMessage: toUploadFailureMessage,
  });

  const isUploadToastExpanded = useUploadToastLifecycle({
    onClearFinishedUploads: handleClearFinishedUploads,
    showUploadToast,
    uploadSummaryJob,
  });

  useUploadToastStackHeight({
    appShellRef,
    isUploadToastExpanded,
    showUploadToast,
    uploadSummaryProgress,
    uploadSummaryStatus: uploadSummaryJob?.status,
    uploadToastRef,
  });

  return {
    activeUploadJobCount,
    fileInputRef,
    handleCancelUpload,
    handleClearFinishedUploads,
    handleCloseUploadConflictDialog,
    handleFilePickerChange,
    handleOpenFilePicker,
    handleResolveUploadConflict,
    handleRetryUpload,
    isDropActive,
    isUploadBusy,
    isUploadToastExpanded,
    setUploadConflictDialog,
    showUploadToast,
    totalUploadJobs,
    uploadConflictDialog,
    uploadQueue,
    uploadSummaryCanRetry,
    uploadSummaryCompactTitle,
    uploadSummaryJob,
    uploadSummaryLastError,
    uploadSummaryProgress,
    uploadSummarySubtitle,
    uploadSummaryTitle,
  };
};
