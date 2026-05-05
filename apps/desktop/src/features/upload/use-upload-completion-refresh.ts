import {
  useEffect,
  useRef,
} from 'react';
import type { UploadJobStatus } from '../../shared/ipc';
import {
  createUploadCompletionRefreshPlan,
  formatUploadRefreshFailureMessage,
  formatUploadRefreshSuccessMessage,
} from './upload-completion-refresh-policy';
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

    const refreshPlan = createUploadCompletionRefreshPlan({
      previousTerminalStatuses: uploadTerminalStatusRef.current,
      selectedProfileId,
      uploadQueue,
    });
    uploadTerminalStatusRef.current = refreshPlan.nextTerminalStatuses;

    if (refreshPlan.uploadedItems === 0) {
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
          onStatusLine(formatUploadRefreshSuccessMessage(refreshPlan.uploadedItems), 'success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          onStatusLine(
            formatUploadRefreshFailureMessage(refreshPlan.uploadedItems, message),
            'error',
          );
        }
      })();
    }, 420);
  }, [onGalleryRefresh, onStatusLine, selectedProfileId, uploadQueue]);
};
