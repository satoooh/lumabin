import { useMemo } from 'react';

interface PendingDeleteJobBase {
  executeAt: number;
}

interface UsePendingDeleteToastSummaryOptions<TPendingDeleteJob extends PendingDeleteJobBase> {
  pendingDeleteJobs: TPendingDeleteJob[];
  pendingDeleteTicker: number;
  showGuidedStart: boolean;
  isConnectionSetupOpen: boolean;
}

export const usePendingDeleteToastSummary = <TPendingDeleteJob extends PendingDeleteJobBase>({
  pendingDeleteJobs,
  pendingDeleteTicker,
  showGuidedStart,
  isConnectionSetupOpen,
}: UsePendingDeleteToastSummaryOptions<TPendingDeleteJob>) =>
  useMemo(() => {
    const activePendingDeleteJob = pendingDeleteJobs[0] ?? null;
    const pendingDeleteRemainingSeconds = activePendingDeleteJob
      ? Math.max(0, Math.ceil((activePendingDeleteJob.executeAt - pendingDeleteTicker) / 1000))
      : 0;
    const pendingDeleteQueuedMoreCount = pendingDeleteJobs.length > 1
      ? pendingDeleteJobs.length - 1
      : 0;
    const showPendingDeleteToast =
      !showGuidedStart && !isConnectionSetupOpen && Boolean(activePendingDeleteJob);

    return {
      activePendingDeleteJob,
      pendingDeleteRemainingSeconds,
      pendingDeleteQueuedMoreCount,
      showPendingDeleteToast,
    };
  }, [isConnectionSetupOpen, pendingDeleteJobs, pendingDeleteTicker, showGuidedStart]);
