import type {
  ConflictPolicy,
} from '../../shared/ipc';
import type {
  UploadCommandApi,
  UploadFilesApi,
} from '../shared/desktop-api-gateway';
import { useUploadJobPolling } from './use-upload-job-polling';
import { useUploadCandidateUpload } from './use-upload-candidate-upload';
import { useUploadCompletionRefresh } from './use-upload-completion-refresh';
import { useUploadDropZone } from './use-upload-drop-zone';
import { useUploadFilePicker } from './use-upload-file-picker';
import { useUploadPaste } from './use-upload-paste';
import { useUploadQueueCommands } from './use-upload-queue-commands';
import { useUploadQueuePersistence } from './use-upload-queue-persistence';

interface UseUploadControllerOptions {
  assetsPrefix: string;
  defaultConflictPolicy: ConflictPolicy;
  filesApi: UploadFilesApi;
  isConnectionReady: boolean;
  onGalleryRefresh: () => Promise<void>;
  onInlineFeedback: (message: string) => void;
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  selectedProfileId: string;
  uploadApi: UploadCommandApi;
}

export const useUploadController = ({
  assetsPrefix,
  defaultConflictPolicy,
  filesApi,
  isConnectionReady,
  onGalleryRefresh,
  onInlineFeedback,
  onStatusLine,
  selectedProfileId,
  uploadApi,
}: UseUploadControllerOptions) => {
  const {
    handleCancelUpload,
    handleClearFinishedUploads,
    handleResolveUploadConflict,
    handleRetryUpload,
    isUploadBusy,
    mergeUploadJob,
    setUploadConflictDialog,
    startUploadFromSources,
    uploadConflictDialog,
    uploadQueue,
  } = useUploadQueueCommands({
    assetsPrefix,
    defaultConflictPolicy,
    onInlineFeedback,
    onStatusLine,
    selectedProfileId,
    uploadApi,
  });

  const handleStartUpload = useUploadCandidateUpload({
    files: filesApi,
    onInlineFeedback,
    onStatusLine,
    startUploadFromSources,
  });

  const {
    fileInputRef,
    handleFilePickerChange,
    handleOpenFilePicker,
  } = useUploadFilePicker({
    onStatusLine,
    onUploadCandidates: handleStartUpload,
    selectedProfileId,
  });

  useUploadQueuePersistence(uploadQueue);

  useUploadJobPolling({
    getUploadJob: uploadApi.getUploadJob,
    mergeUploadJob,
    uploadQueue,
  });

  useUploadCompletionRefresh({
    onGalleryRefresh,
    onStatusLine,
    selectedProfileId,
    uploadQueue,
  });

  const isDropActive = useUploadDropZone({
    onUploadCandidates: handleStartUpload,
  });

  useUploadPaste({
    handleUploadCandidates: handleStartUpload,
    isConnectionReady,
    onInlineFeedback,
    onStatusLine,
    persistClipboardImageFromSystem: filesApi.persistClipboardImageFromSystem,
    startUploadFromSources,
  });

  return {
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
  };
};
