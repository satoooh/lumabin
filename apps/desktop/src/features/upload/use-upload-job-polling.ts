import { useEffect } from 'react';
import type { UploadJobStatus } from '../../shared/ipc';
import { listActiveUploadJobIds } from './upload-job-polling-policy';
import type { UploadQueueItem } from './upload-queue-persistence';

interface UseUploadJobPollingOptions {
  getUploadJob: (jobId: string) => Promise<UploadJobStatus>;
  mergeUploadJob: (job: UploadJobStatus) => void;
  uploadQueue: UploadQueueItem[];
}

export const useUploadJobPolling = ({
  getUploadJob,
  mergeUploadJob,
  uploadQueue,
}: UseUploadJobPollingOptions): void => {
  useEffect(() => {
    const activeJobIds = listActiveUploadJobIds(uploadQueue);

    if (activeJobIds.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      void Promise.all(
        activeJobIds.map(async (jobId) => {
          try {
            const nextJob = await getUploadJob(jobId);
            mergeUploadJob(nextJob);
          } catch {
            // Keep the existing queue entry as-is when polling fails.
          }
        }),
      );
    }, 700);

    return () => {
      window.clearInterval(timer);
    };
  }, [getUploadJob, mergeUploadJob, uploadQueue]);
};
