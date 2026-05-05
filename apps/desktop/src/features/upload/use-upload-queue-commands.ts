import {
  useCallback,
  useState,
} from 'react';
import type {
  CheckUploadConflictsResult,
  ConflictPolicy,
  UploadJobStatus,
  UploadSource,
} from '../../shared/ipc';
import { normalizeAssetPrefix } from '../shared/asset-prefix';
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

export interface UploadConflictDialogState {
  sources: UploadSource[];
  destinationPrefix: string;
  conflicts: CheckUploadConflictsResult['conflicts'];
  totalConflicts: number;
}

interface UseUploadQueueCommandsOptions {
  assetsPrefix: string;
  defaultConflictPolicy: ConflictPolicy;
  initialUploadQueue?: UploadQueueItem[];
  onInlineFeedback: (message: string) => void;
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  selectedProfileId: string;
  uploadApi: UploadCommandApi;
}

interface StartUploadFromSourcesOptions {
  destinationPrefix?: string;
  conflictPolicy?: ConflictPolicy;
  label?: string;
  skipConflictCheck?: boolean;
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

  const executeUploadFromSources = useCallback(
    async (
      sources: UploadSource[],
      options?: {
        destinationPrefix?: string;
        conflictPolicy?: ConflictPolicy;
        label?: string;
      },
    ) => {
      if (!selectedProfileId) {
        onStatusLine('Select a profile first.', 'error');
        return;
      }

      if (sources.length === 0) {
        onStatusLine('No files found.', 'error');
        return;
      }

      const normalizedPrefix = normalizeAssetPrefix(options?.destinationPrefix ?? assetsPrefix);
      const conflictPolicy = options?.conflictPolicy ?? defaultConflictPolicy;

      setIsUploadBusy(true);
      try {
        const jobId = await uploadApi.upload({
          profileId: selectedProfileId,
          destinationPrefix: normalizedPrefix,
          conflictPolicy,
          sources,
        });

        const job = await uploadApi.getUploadJob(jobId);
        mergeUploadJob(job, {
          destinationPrefix: normalizedPrefix,
          conflictPolicy,
        });

        onStatusLine(
          options?.label ??
            `Upload started: ${formatCount(sources.length, 'file')} to ${normalizedPrefix || '(bucket root)'}`,
          'success',
        );
        onInlineFeedback(`Uploading ${formatCount(sources.length, 'file')}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        onStatusLine(`Failed to start upload: ${message}`, 'error');
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

  const startUploadFromSources = useCallback(
    async (sources: UploadSource[], options?: StartUploadFromSourcesOptions) => {
      if (!selectedProfileId) {
        onStatusLine('Select a profile first.', 'error');
        return;
      }

      if (sources.length === 0) {
        onStatusLine('No files found.', 'error');
        return;
      }

      const normalizedPrefix = normalizeAssetPrefix(options?.destinationPrefix ?? assetsPrefix);
      const conflictPolicy = options?.conflictPolicy ?? defaultConflictPolicy;

      if (!options?.skipConflictCheck) {
        try {
          const conflictCheck = await uploadApi.checkUploadConflicts({
            profileId: selectedProfileId,
            destinationPrefix: normalizedPrefix,
            sources,
          });

          if (conflictCheck.totalConflicts > 0) {
            setUploadConflictDialog({
              sources,
              destinationPrefix: normalizedPrefix,
              conflicts: conflictCheck.conflicts,
              totalConflicts: conflictCheck.totalConflicts,
            });
            return;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          onStatusLine(`Conflict check failed: ${message}. Continuing upload...`, 'neutral');
        }
      }

      await executeUploadFromSources(sources, {
        destinationPrefix: normalizedPrefix,
        conflictPolicy,
        label: options?.label,
      });
    },
    [
      assetsPrefix,
      defaultConflictPolicy,
      executeUploadFromSources,
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
