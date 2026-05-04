import {
  useEffect,
  useRef,
} from 'react';
import type { UploadJobStatus } from '../../shared/ipc';
import { formatCount } from '../shared/format-count';
import type { UploadQueueItem } from './upload-queue-persistence';

interface UseUploadCompletionRefreshOptions {
  onGalleryRefresh: () => Promise<void>;
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  selectedProfileId: string;
  uploadQueue: UploadQueueItem[];
}

export const useUploadCompletionRefresh = ({
  onGalleryRefresh,
  onStatusLine,
  selectedProfileId,
  uploadQueue,
}: UseUploadCompletionRefreshOptions): void => {
  const uploadTerminalStatusRef = useRef<Record<string, UploadJobStatus['status']>>({});
  const uploadAutoReloadTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (uploadAutoReloadTimerRef.current !== null) {
        window.clearTimeout(uploadAutoReloadTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedProfileId) {
      return;
    }

    const liveJobIds = new Set(uploadQueue.map((job) => job.id));
    for (const jobId of Object.keys(uploadTerminalStatusRef.current)) {
      if (!liveJobIds.has(jobId)) {
        delete uploadTerminalStatusRef.current[jobId];
      }
    }

    const newlyTerminalJobs = uploadQueue.filter((job) => {
      if (job.profileId !== selectedProfileId) {
        return false;
      }
      if (job.status !== 'done' && job.status !== 'failed' && job.status !== 'canceled') {
        return false;
      }
      const previousStatus = uploadTerminalStatusRef.current[job.id];
      uploadTerminalStatusRef.current[job.id] = job.status;
      return previousStatus !== job.status;
    });

    const uploadedItems = newlyTerminalJobs.reduce(
      (sum, job) => sum + Math.max(0, job.completedItems),
      0,
    );
    if (uploadedItems === 0) {
      return;
    }

    if (uploadAutoReloadTimerRef.current !== null) {
      window.clearTimeout(uploadAutoReloadTimerRef.current);
    }

    uploadAutoReloadTimerRef.current = window.setTimeout(() => {
      uploadAutoReloadTimerRef.current = null;
      void (async () => {
        try {
          await onGalleryRefresh();
          onStatusLine(`Uploaded ${formatCount(uploadedItems, 'item')}. Gallery refreshed.`, 'success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          onStatusLine(
            `Uploaded ${formatCount(uploadedItems, 'item')}, but refresh failed: ${message}`,
            'error',
          );
        }
      })();
    }, 420);
  }, [onGalleryRefresh, onStatusLine, selectedProfileId, uploadQueue]);
};
