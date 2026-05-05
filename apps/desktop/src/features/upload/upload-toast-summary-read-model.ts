import { formatCount } from '../shared/format-count';

type UploadJobStatus = 'queued' | 'running' | 'done' | 'failed' | 'canceled';

export interface UploadToastSummaryJob {
  profileId: string;
  status: UploadJobStatus;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  destinationPrefix: string;
  failedSources: unknown[];
  lastError?: string;
}

interface CreateUploadToastSummaryInput<TUploadQueueItem extends UploadToastSummaryJob> {
  uploadQueue: TUploadQueueItem[];
  selectedProfileId: string;
  showGuidedStart: boolean;
  isConnectionSetupOpen: boolean;
  mapUploadFailureMessage: (message?: string) => string;
}

export interface UploadToastSummary<TUploadQueueItem extends UploadToastSummaryJob> {
  activeUploadJobCount: number;
  totalUploadJobs: number;
  uploadSummaryJob: TUploadQueueItem | null;
  showUploadToast: boolean;
  uploadSummaryProcessed: number;
  uploadSummaryProgress: number;
  uploadSummaryCanRetry: boolean;
  uploadSummaryTitle: string;
  uploadSummarySubtitle: string;
  uploadSummaryCompactTitle: string;
  uploadSummaryLastError: string;
}

export const createUploadToastSummary = <
  TUploadQueueItem extends UploadToastSummaryJob,
>({
  uploadQueue,
  selectedProfileId,
  showGuidedStart,
  isConnectionSetupOpen,
  mapUploadFailureMessage,
}: CreateUploadToastSummaryInput<TUploadQueueItem>): UploadToastSummary<TUploadQueueItem> => {
  const uploadJobsForSelectedProfile = uploadQueue.filter(
    (job) => !selectedProfileId || job.profileId === selectedProfileId,
  );
  const activeUploadJobs = uploadJobsForSelectedProfile.filter(
    (job) => job.status === 'queued' || job.status === 'running',
  );
  const totalUploadJobs = uploadJobsForSelectedProfile.length;
  const activeUploadJobCount = activeUploadJobs.length;
  const uploadSummaryJob = activeUploadJobs[0] ?? uploadJobsForSelectedProfile[0] ?? null;
  const showUploadToast =
    !showGuidedStart && !isConnectionSetupOpen && Boolean(uploadSummaryJob);

  const uploadSummaryProcessed = uploadSummaryJob
    ? uploadSummaryJob.completedItems + uploadSummaryJob.failedItems
    : 0;
  const uploadSummaryProgress = uploadSummaryJob
    ? uploadSummaryJob.totalItems > 0
      ? Math.round((uploadSummaryProcessed / uploadSummaryJob.totalItems) * 100)
      : 100
    : 0;
  const uploadSummaryCanRetry = Boolean(
    uploadSummaryJob &&
      (uploadSummaryJob.status === 'failed' || uploadSummaryJob.status === 'canceled') &&
      uploadSummaryJob.failedSources.length > 0,
  );
  const uploadSummaryTitle = uploadSummaryJob
    ? uploadSummaryJob.status === 'queued' || uploadSummaryJob.status === 'running'
      ? `${formatCount(Math.max(1, uploadSummaryJob.totalItems - uploadSummaryProcessed), 'item')} uploading`
      : uploadSummaryJob.status === 'done'
        ? `${formatCount(uploadSummaryJob.completedItems, 'item')} uploaded`
        : uploadSummaryJob.status === 'failed'
          ? `${formatCount(uploadSummaryJob.failedItems, 'item')} failed`
          : 'Upload canceled'
    : '';
  const uploadSummarySubtitle = uploadSummaryJob
    ? `${uploadSummaryProcessed}/${uploadSummaryJob.totalItems} • ${
      uploadSummaryJob.destinationPrefix || '/'
    }`
    : '';
  const uploadSummaryCompactTitle = uploadSummaryJob
    ? uploadSummaryJob.status === 'queued' || uploadSummaryJob.status === 'running'
      ? `Uploading ${Math.max(1, uploadSummaryJob.totalItems - uploadSummaryProcessed)}…`
      : uploadSummaryJob.status === 'done'
        ? `Uploaded ${uploadSummaryJob.completedItems}`
        : uploadSummaryJob.status === 'failed'
          ? `Failed ${uploadSummaryJob.failedItems}`
          : 'Canceled'
    : '';
  const uploadSummaryLastError = mapUploadFailureMessage(uploadSummaryJob?.lastError);

  return {
    activeUploadJobCount,
    totalUploadJobs,
    uploadSummaryJob,
    showUploadToast,
    uploadSummaryProcessed,
    uploadSummaryProgress,
    uploadSummaryCanRetry,
    uploadSummaryTitle,
    uploadSummarySubtitle,
    uploadSummaryCompactTitle,
    uploadSummaryLastError,
  };
};
