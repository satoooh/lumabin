import type { UploadJobStatus } from '../../shared/ipc';

interface UploadPollingJob {
  id: string;
  status: UploadJobStatus['status'];
}

export const isActiveUploadJobStatus = (status: UploadJobStatus['status']): boolean =>
  status === 'queued' || status === 'running';

export const listActiveUploadJobIds = <TUploadJob extends UploadPollingJob>(
  uploadQueue: TUploadJob[],
): string[] =>
  uploadQueue
    .filter((job) => isActiveUploadJobStatus(job.status))
    .map((job) => job.id);
