import type { UploadJobStatus } from '../../shared/ipc';
import { formatCount } from '../shared/format-count';
import type { UploadQueueItem } from './upload-queue-persistence';

export type UploadTerminalStatusMap = Record<string, UploadJobStatus['status']>;

export interface UploadCompletionRefreshPlan {
  nextTerminalStatuses: UploadTerminalStatusMap;
  uploadedItems: number;
}

const isTerminalUploadStatus = (status: UploadJobStatus['status']): boolean =>
  status === 'done' || status === 'failed' || status === 'canceled';

export const createUploadCompletionRefreshPlan = ({
  previousTerminalStatuses,
  selectedProfileId,
  uploadQueue,
}: {
  previousTerminalStatuses: UploadTerminalStatusMap;
  selectedProfileId: string;
  uploadQueue: UploadQueueItem[];
}): UploadCompletionRefreshPlan => {
  const liveJobIds = new Set(uploadQueue.map((job) => job.id));
  const nextTerminalStatuses: UploadTerminalStatusMap = {};

  for (const [jobId, status] of Object.entries(previousTerminalStatuses)) {
    if (liveJobIds.has(jobId)) {
      nextTerminalStatuses[jobId] = status;
    }
  }

  let uploadedItems = 0;

  for (const job of uploadQueue) {
    if (job.profileId !== selectedProfileId || !isTerminalUploadStatus(job.status)) {
      continue;
    }

    const previousStatus = nextTerminalStatuses[job.id];
    nextTerminalStatuses[job.id] = job.status;

    if (previousStatus !== job.status) {
      uploadedItems += Math.max(0, job.completedItems);
    }
  }

  return {
    nextTerminalStatuses,
    uploadedItems,
  };
};

export const formatUploadRefreshSuccessMessage = (uploadedItems: number): string =>
  `Uploaded ${formatCount(uploadedItems, 'item')}. Gallery refreshed.`;

export const formatUploadRefreshFailureMessage = (
  uploadedItems: number,
  errorMessage: string,
): string =>
  `Uploaded ${formatCount(uploadedItems, 'item')}, but refresh failed: ${errorMessage}`;
