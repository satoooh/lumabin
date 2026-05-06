import {
  useCallback,
  useState,
} from 'react';
import type {
  ConflictPolicy,
  UploadJobStatus,
  UploadSource,
} from '../../shared/ipc';
import type { UploadCommandApi } from '../shared/desktop-api-gateway';
import { formatCount } from '../shared/format-count';
import {
  formatResolvedUploadConflictLabel,
  mergeUploadJobIntoQueue,
  retainActiveUploadJobs,
} from './upload-queue-command-policy';
import {
  loadPersistedUploadQueue,
  type UploadQueueItem,
} from './upload-queue-persistence';
import {
  runUploadQueueStartCommand,
  type StartUploadFromSourcesOptions,
  type UploadConflictDialogState,
} from './upload-queue-command-runner';

export type {
  StartUploadFromSourcesOptions,
  UploadConflictDialogState,
} from './upload-queue-command-runner';

interface UseUploadQueueCommandsOptions {
  assetsPrefix: string;
  defaultConflictPolicy: ConflictPolicy;
  initialUploadQueue?: UploadQueueItem[];
  onInlineFeedback: (message: string) => void;
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  selectedProfileId: string;
  uploadApi: UploadCommandApi;
}

export const useUploadQueueCommands = ({
  assetsPrefix,
  defaultConflictPolicy,
  initialUploadQueue,
  onInlineFeedback,
  onStatusLine,
  selectedProfileId,
  uploadApi,
}: UseUploadQueueCommandsOptions) => {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>(
    () => initialUploadQueue ?? loadPersistedUploadQueue(),
  );
  const [uploadConflictDialog, setUploadConflictDialog] =
    useState<UploadConflictDialogState | null>(null);
  const [isUploadBusy, setIsUploadBusy] = useState<boolean>(false);

  const mergeUploadJob = useCallback(
    (
      job: UploadJobStatus,
      options?: { destinationPrefix?: string; conflictPolicy?: ConflictPolicy },
    ) => {
      setUploadQueue((current) =>
        mergeUploadJobIntoQueue({
          currentQueue: current,
          job,
          fallbackDestinationPrefix: assetsPrefix,
          fallbackConflictPolicy: defaultConflictPolicy,
          destinationPrefix: options?.destinationPrefix,
          conflictPolicy: options?.conflictPolicy,
        }),
      );
    },
    [assetsPrefix, defaultConflictPolicy],
  );

  const startUploadFromSources = useCallback(
    async (sources: UploadSource[], options?: StartUploadFromSourcesOptions) => {
      setIsUploadBusy(true);
      try {
        const result = await runUploadQueueStartCommand({
          assetsPrefix,
          defaultConflictPolicy,
          options,
          selectedProfileId,
          sources,
          uploadApi,
        });

        for (const warning of 'warnings' in result ? result.warnings : []) {
          onStatusLine(warning, 'neutral');
        }

        if (result.kind === 'validation-error') {
          onStatusLine(result.message, 'error');
        } else if (result.kind === 'conflicts-detected') {
          setUploadConflictDialog(result.dialog);
        } else if (result.kind === 'started') {
          mergeUploadJob(result.job, {
            destinationPrefix: result.destinationPrefix,
            conflictPolicy: result.conflictPolicy,
          });
          onStatusLine(result.statusLine, 'success');
          onInlineFeedback(result.inlineFeedback);
        } else {
          onStatusLine(result.message, 'error');
        }
      } finally {
        setIsUploadBusy(false);
      }
    },
    [
      assetsPrefix,
      defaultConflictPolicy,
      mergeUploadJob,
      onInlineFeedback,
      onStatusLine,
      selectedProfileId,
      uploadApi,
    ],
  );

  const handleRetryUpload = useCallback(
    async (job: UploadQueueItem) => {
      if (job.failedSources.length === 0) {
        onStatusLine('No failed files to retry in this job.', 'neutral');
        return;
      }

      await startUploadFromSources(job.failedSources, {
        destinationPrefix: job.destinationPrefix,
        conflictPolicy: job.conflictPolicy,
        label: `Retry started: ${formatCount(job.failedSources.length, 'failed file')}`,
        skipConflictCheck: true,
      });
    },
    [onStatusLine, startUploadFromSources],
  );

  const handleResolveUploadConflict = useCallback(
    async (conflictPolicy: ConflictPolicy) => {
      if (!uploadConflictDialog) {
        return;
      }
      const pending = uploadConflictDialog;
      setUploadConflictDialog(null);
      await startUploadFromSources(pending.sources, {
        destinationPrefix: pending.destinationPrefix,
        conflictPolicy,
        skipConflictCheck: true,
        label: formatResolvedUploadConflictLabel(conflictPolicy, pending.sources.length),
      });
    },
    [startUploadFromSources, uploadConflictDialog],
  );

  const handleCancelUpload = useCallback(
    async (jobId: string) => {
      try {
        await uploadApi.cancelUpload(jobId);
        const nextJob = await uploadApi.getUploadJob(jobId);
        mergeUploadJob(nextJob);
        onStatusLine(`Upload canceled: ${jobId}`, 'neutral');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        onStatusLine(`Failed to cancel upload: ${message}`, 'error');
      }
    },
    [mergeUploadJob, onStatusLine, uploadApi],
  );

  const handleClearFinishedUploads = useCallback(() => {
    setUploadQueue((current) => retainActiveUploadJobs(current));
  }, []);

  return {
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
  };
};
