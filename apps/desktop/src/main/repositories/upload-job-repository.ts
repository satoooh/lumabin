import type { UploadJobStatus } from '../../shared/ipc';

const uploadJobs = new Map<string, UploadJobStatus>();
const uploadAbortControllers = new Map<string, AbortController>();

export interface UploadJobStatusChange {
  profileId: string;
  jobId: string;
  previousStatus: UploadJobStatus['status'];
  nextStatus: UploadJobStatus['status'];
  totalItems: number;
  completedItems: number;
  failedItems: number;
}

type UploadJobStatusChangeHandler = (change: UploadJobStatusChange) => void;

let uploadJobStatusChangeHandler: UploadJobStatusChangeHandler | null = null;

export const setUploadJobStatusChangeHandler = (
  handler: UploadJobStatusChangeHandler,
): (() => void) => {
  uploadJobStatusChangeHandler = handler;
  return () => {
    if (uploadJobStatusChangeHandler === handler) {
      uploadJobStatusChangeHandler = null;
    }
  };
};

export const getUploadJob = (jobId: string): UploadJobStatus | undefined =>
  uploadJobs.get(jobId);

export const saveUploadJob = (job: UploadJobStatus): void => {
  uploadJobs.set(job.id, job);
};

export const saveUploadJobStatus = (
  jobId: string,
  job: UploadJobStatus,
): void => {
  uploadJobs.set(jobId, job);
};

export const updateUploadJob = (
  jobId: string,
  updater: (job: UploadJobStatus) => UploadJobStatus,
): void => {
  const current = uploadJobs.get(jobId);
  if (!current) {
    return;
  }
  const next = updater(current);
  uploadJobs.set(jobId, next);
  if (current.status !== next.status) {
    uploadJobStatusChangeHandler?.({
      profileId: next.profileId,
      jobId: next.id,
      previousStatus: current.status,
      nextStatus: next.status,
      totalItems: next.totalItems,
      completedItems: next.completedItems,
      failedItems: next.failedItems,
    });
  }
};

export const setUploadAbortController = (
  jobId: string,
  abortController: AbortController,
): void => {
  uploadAbortControllers.set(jobId, abortController);
};

export const getUploadAbortController = (
  jobId: string,
): AbortController | undefined => uploadAbortControllers.get(jobId);

export const deleteUploadAbortController = (jobId: string): void => {
  uploadAbortControllers.delete(jobId);
};

export const abortUploadJob = (jobId: string): void => {
  const abortController = uploadAbortControllers.get(jobId);
  if (!abortController) {
    return;
  }
  abortController.abort();
  uploadAbortControllers.delete(jobId);
};
