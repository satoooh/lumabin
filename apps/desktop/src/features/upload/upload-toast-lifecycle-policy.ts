import type { UploadJobStatus } from '../../shared/ipc';

export type UploadToastLifecycleStatus = UploadJobStatus['status'];

export interface UploadToastLifecycleJob {
  id: string;
  status: UploadToastLifecycleStatus;
}

export interface UploadToastTrackedJob {
  id: string;
  status: UploadToastLifecycleStatus;
}

export type UploadToastTimerCommand = 'clear' | 'keep' | 'schedule';

export interface UploadToastLifecycleTransition {
  collapseTimer: UploadToastTimerCommand;
  dismissTimer: UploadToastTimerCommand;
  isExpanded: boolean;
  nextTrackedJob: UploadToastTrackedJob | null;
}

export const UPLOAD_TOAST_DONE_EXPAND_MS = 3200;
export const UPLOAD_TOAST_DONE_AUTO_DISMISS_MS = 10000;

const isActiveUploadStatus = (status: UploadToastLifecycleStatus): boolean =>
  status === 'queued' || status === 'running';

export const resolveUploadToastLifecycleTransition = ({
  previousTrackedJob,
  showUploadToast,
  uploadSummaryJob,
}: {
  previousTrackedJob: UploadToastTrackedJob | null;
  showUploadToast: boolean;
  uploadSummaryJob: UploadToastLifecycleJob | null;
}): UploadToastLifecycleTransition => {
  if (!showUploadToast || !uploadSummaryJob) {
    return {
      collapseTimer: 'clear',
      dismissTimer: 'clear',
      isExpanded: false,
      nextTrackedJob: null,
    };
  }

  const isNewTrackedJob = previousTrackedJob?.id !== uploadSummaryJob.id;
  const previousStatus =
    previousTrackedJob?.id === uploadSummaryJob.id ? previousTrackedJob.status : null;
  const nextTrackedJob = {
    id: uploadSummaryJob.id,
    status: uploadSummaryJob.status,
  };

  if (isActiveUploadStatus(uploadSummaryJob.status)) {
    return {
      collapseTimer: 'clear',
      dismissTimer: 'clear',
      isExpanded: false,
      nextTrackedJob,
    };
  }

  if (uploadSummaryJob.status === 'failed' || uploadSummaryJob.status === 'canceled') {
    return {
      collapseTimer: 'clear',
      dismissTimer: 'clear',
      isExpanded: true,
      nextTrackedJob,
    };
  }

  if (isNewTrackedJob || previousStatus !== 'done') {
    return {
      collapseTimer: previousStatus && previousStatus !== 'done' ? 'schedule' : 'keep',
      dismissTimer: 'schedule',
      isExpanded: Boolean(previousStatus && previousStatus !== 'done'),
      nextTrackedJob,
    };
  }

  return {
    collapseTimer: 'keep',
    dismissTimer: 'keep',
    isExpanded: false,
    nextTrackedJob,
  };
};
