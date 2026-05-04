import { useEffect } from 'react';
import {
  persistUploadQueue,
  type UploadQueueItem,
} from './upload-queue-persistence';

export const useUploadQueuePersistence = (uploadQueue: UploadQueueItem[]): void => {
  useEffect(() => {
    persistUploadQueue(uploadQueue);
  }, [uploadQueue]);
};
