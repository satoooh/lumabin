import type {
  ConflictPolicy,
  UploadJobStatus,
} from '../../shared/ipc';
import { normalizeAssetPrefix } from '../shared/asset-prefix';
import { formatCount } from '../shared/format-count';
import type { UploadQueueItem } from './upload-queue-persistence';

const MAX_VISIBLE_UPLOAD_QUEUE_ITEMS = 20;

interface MergeUploadJobInput {
  currentQueue: UploadQueueItem[];
  job: UploadJobStatus;
  fallbackDestinationPrefix: string;
  fallbackConflictPolicy: ConflictPolicy;
  destinationPrefix?: string;
  conflictPolicy?: ConflictPolicy;
}

export const mergeUploadJobIntoQueue = ({
  currentQueue,
  job,
  fallbackDestinationPrefix,
  fallbackConflictPolicy,
  destinationPrefix,
  conflictPolicy,
}: MergeUploadJobInput): UploadQueueItem[] => {
  const existing = currentQueue.find((item) => item.id === job.id);
  const nextItem: UploadQueueItem = {
    ...job,
    destinationPrefix:
      destinationPrefix ??
      job.destinationPrefix ??
      existing?.destinationPrefix ??
      normalizeAssetPrefix(fallbackDestinationPrefix),
    conflictPolicy:
      conflictPolicy ??
      job.conflictPolicy ??
      existing?.conflictPolicy ??
      fallbackConflictPolicy,
  };

  if (!existing) {
    return [nextItem, ...currentQueue].slice(0, MAX_VISIBLE_UPLOAD_QUEUE_ITEMS);
  }

  return currentQueue.map((item) => (item.id === job.id ? nextItem : item));
};

export const retainActiveUploadJobs = (
  uploadQueue: UploadQueueItem[],
): UploadQueueItem[] =>
  uploadQueue.filter((job) => job.status === 'queued' || job.status === 'running');

export const formatResolvedUploadConflictLabel = (
  conflictPolicy: ConflictPolicy,
  sourceCount: number,
): string => {
  const formattedCount = formatCount(sourceCount, 'file');

  if (conflictPolicy === 'overwrite') {
    return `Upload started with overwrite policy (${formattedCount})`;
  }

  if (conflictPolicy === 'skip') {
    return `Upload started with skip policy (${formattedCount})`;
  }

  return `Upload started with rename policy (${formattedCount})`;
};
