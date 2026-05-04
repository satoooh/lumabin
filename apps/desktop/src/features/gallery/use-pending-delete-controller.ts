import { useCallback, useEffect, useRef, useState } from 'react';
import type { DeleteAssetsInput, DeleteResult } from '../../shared/ipc';
import { formatCount } from '../shared/format-count';

export interface PendingDeleteJob {
  id: string;
  profileId: string;
  keys: string[];
  createdAt: number;
  executeAt: number;
}

type StatusTone = 'neutral' | 'success' | 'error';

interface UsePendingDeleteControllerOptions {
  createId?: () => string;
  deleteAssets(input: DeleteAssetsInput): Promise<DeleteResult>;
  nowMs?: () => number;
  onDeleteCompleted(job: PendingDeleteJob, result: DeleteResult): Promise<void> | void;
  onStatus(message: string, tone: StatusTone): void;
  undoWindowMs: number;
}

const createPendingDeleteId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `delete-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

export const usePendingDeleteController = ({
  createId = createPendingDeleteId,
  deleteAssets,
  nowMs = Date.now,
  onDeleteCompleted,
  onStatus,
  undoWindowMs,
}: UsePendingDeleteControllerOptions) => {
  const [pendingDeleteJobs, setPendingDeleteJobs] = useState<PendingDeleteJob[]>([]);
  const [pendingDeleteTicker, setPendingDeleteTicker] = useState<number>(nowMs());
  const pendingDeleteJobsRef = useRef<PendingDeleteJob[]>([]);
  const pendingDeleteTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    pendingDeleteJobsRef.current = pendingDeleteJobs;
  }, [pendingDeleteJobs]);

  const clearPendingDeleteTimer = useCallback((jobId: string) => {
    const timerId = pendingDeleteTimersRef.current[jobId];
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      delete pendingDeleteTimersRef.current[jobId];
    }
  }, []);

  const executePendingDelete = useCallback(
    async (jobId: string) => {
      const job = pendingDeleteJobsRef.current.find((item) => item.id === jobId);
      if (!job) {
        return;
      }

      clearPendingDeleteTimer(jobId);
      setPendingDeleteJobs((current) => current.filter((item) => item.id !== jobId));

      try {
        const result = await deleteAssets({
          profileId: job.profileId,
          keys: job.keys,
        });

        await onDeleteCompleted(job, result);

        const deletedMessage =
          result.deleted.length === 0
            ? 'No assets were deleted.'
            : `Deleted ${formatCount(result.deleted.length, 'asset')}.`;
        const skippedMessage =
          result.skipped.length > 0 ? ` Skipped ${formatCount(result.skipped.length, 'asset')}.` : '';
        onStatus(
          `${deletedMessage}${skippedMessage}`,
          result.deleted.length > 0 ? 'success' : 'neutral',
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        onStatus(`Failed to delete assets: ${message}`, 'error');
      }
    },
    [clearPendingDeleteTimer, deleteAssets, onDeleteCompleted, onStatus],
  );

  const schedulePendingDelete = useCallback(
    (profileId: string, keys: string[]) => {
      const normalizedKeys = Array.from(new Set(keys.filter((key) => key.trim().length > 0)));
      if (normalizedKeys.length === 0) {
        return;
      }

      const now = nowMs();
      const jobId = createId();
      const nextJob: PendingDeleteJob = {
        id: jobId,
        profileId,
        keys: normalizedKeys,
        createdAt: now,
        executeAt: now + undoWindowMs,
      };

      setPendingDeleteJobs((current) => [nextJob, ...current]);
      pendingDeleteTimersRef.current[jobId] = window.setTimeout(() => {
        void executePendingDelete(jobId);
      }, undoWindowMs);

      const label =
        normalizedKeys.length === 1
          ? 'Delete scheduled. Undo within 5 seconds.'
          : `Delete scheduled for ${normalizedKeys.length} assets. Undo within 5 seconds.`;
      onStatus(label, 'neutral');
    },
    [createId, executePendingDelete, nowMs, onStatus, undoWindowMs],
  );

  const undoPendingDelete = useCallback(
    (jobId: string) => {
      const job = pendingDeleteJobsRef.current.find((item) => item.id === jobId);
      if (!job) {
        return;
      }

      clearPendingDeleteTimer(jobId);
      setPendingDeleteJobs((current) => current.filter((item) => item.id !== jobId));
      const label =
        job.keys.length === 1 ? 'Delete canceled.' : `Delete canceled for ${job.keys.length} assets.`;
      onStatus(label, 'success');
    },
    [clearPendingDeleteTimer, onStatus],
  );

  useEffect(() => {
    if (pendingDeleteJobs.length === 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPendingDeleteTicker(nowMs());
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, [nowMs, pendingDeleteJobs.length]);

  useEffect(() => {
    return () => {
      for (const timerId of Object.values(pendingDeleteTimersRef.current)) {
        window.clearTimeout(timerId);
      }
      pendingDeleteTimersRef.current = {};
    };
  }, []);

  return {
    executePendingDelete,
    pendingDeleteJobs,
    pendingDeleteTicker,
    schedulePendingDelete,
    undoPendingDelete,
  };
};
