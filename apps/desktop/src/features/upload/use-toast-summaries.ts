import { useMemo } from 'react';
import {
  createUploadToastSummary,
  type UploadToastSummaryJob,
} from './upload-toast-summary-read-model';

interface UseUploadToastSummaryOptions<TUploadQueueItem extends UploadToastSummaryJob> {
  uploadQueue: TUploadQueueItem[];
  selectedProfileId: string;
  showGuidedStart: boolean;
  isConnectionSetupOpen: boolean;
  mapUploadFailureMessage: (message?: string) => string;
}

export const useUploadToastSummary = <TUploadQueueItem extends UploadToastSummaryJob>({
  uploadQueue,
  selectedProfileId,
  showGuidedStart,
  isConnectionSetupOpen,
  mapUploadFailureMessage,
}: UseUploadToastSummaryOptions<TUploadQueueItem>) =>
  useMemo(() => {
    return createUploadToastSummary({
      uploadQueue,
      selectedProfileId,
      showGuidedStart,
      isConnectionSetupOpen,
      mapUploadFailureMessage,
    });
  }, [
    isConnectionSetupOpen,
    mapUploadFailureMessage,
    selectedProfileId,
    showGuidedStart,
    uploadQueue,
  ]);
