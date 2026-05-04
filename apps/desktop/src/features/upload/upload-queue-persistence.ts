import type {
  ConflictPolicy,
  UploadJobStatus,
  UploadSource,
} from '../../shared/ipc';
import { sanitizeUploadRelativePath } from './upload-candidates';

export const UPLOAD_QUEUE_STORAGE_KEY = 'lumabin.uploadQueue.v1';
const MAX_PERSISTED_UPLOAD_QUEUE_ITEMS = 20;

type UploadQueueStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface UploadQueueItem extends UploadJobStatus {
  destinationPrefix: string;
  conflictPolicy: ConflictPolicy;
}

const getBrowserLocalStorage = (): UploadQueueStorage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const sanitizePersistedUploadJob = (input: unknown): UploadQueueItem | null => {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const parsed = input as Partial<UploadQueueItem>;
  if (!parsed.id || !parsed.profileId || !parsed.updatedAt) {
    return null;
  }
  if (
    parsed.status !== 'queued' &&
    parsed.status !== 'running' &&
    parsed.status !== 'done' &&
    parsed.status !== 'failed' &&
    parsed.status !== 'canceled'
  ) {
    return null;
  }

  const rawFailedSources = Array.isArray(parsed.failedSources)
    ? parsed.failedSources
    : [];
  const failedSources: UploadSource[] = rawFailedSources
    .map((source) => {
      if (!source || typeof source !== 'object') {
        return null;
      }
      const candidate = source as Partial<UploadSource>;
      if (!candidate.path || !isFiniteNonNegativeNumber(candidate.size)) {
        return null;
      }
      const relativePath = sanitizeUploadRelativePath(candidate.relativePath);
      return {
        path: candidate.path,
        size: candidate.size,
        ...(relativePath ? { relativePath } : {}),
      } as UploadSource;
    })
    .filter((source): source is UploadSource => source !== null);

  const normalizedStatus =
    parsed.status === 'queued' || parsed.status === 'running'
      ? 'failed'
      : parsed.status;
  const lastError =
    parsed.status === 'queued' || parsed.status === 'running'
      ? 'Upload interrupted after restart'
      : typeof parsed.lastError === 'string'
        ? parsed.lastError
        : '';

  return {
    id: parsed.id,
    profileId: parsed.profileId,
    status: normalizedStatus,
    destinationPrefix: typeof parsed.destinationPrefix === 'string' ? parsed.destinationPrefix : '',
    conflictPolicy:
      parsed.conflictPolicy === 'overwrite' ||
      parsed.conflictPolicy === 'rename' ||
      parsed.conflictPolicy === 'skip'
        ? parsed.conflictPolicy
        : 'rename',
    createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : parsed.updatedAt,
    updatedAt: parsed.updatedAt,
    totalItems: isFiniteNonNegativeNumber(parsed.totalItems) ? parsed.totalItems : 0,
    completedItems: isFiniteNonNegativeNumber(parsed.completedItems) ? parsed.completedItems : 0,
    failedItems: isFiniteNonNegativeNumber(parsed.failedItems)
      ? parsed.failedItems
      : failedSources.length,
    failedSources,
    lastError,
  };
};

export const loadPersistedUploadQueue = (
  storage: UploadQueueStorage | null = getBrowserLocalStorage(),
): UploadQueueItem[] => {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(UPLOAD_QUEUE_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => sanitizePersistedUploadJob(item))
      .filter((item): item is UploadQueueItem => Boolean(item))
      .slice(0, MAX_PERSISTED_UPLOAD_QUEUE_ITEMS);
  } catch {
    return [];
  }
};

export const persistUploadQueue = (
  uploadQueue: UploadQueueItem[],
  storage: UploadQueueStorage | null = getBrowserLocalStorage(),
): void => {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      UPLOAD_QUEUE_STORAGE_KEY,
      JSON.stringify(uploadQueue.slice(0, MAX_PERSISTED_UPLOAD_QUEUE_ITEMS)),
    );
  } catch {
    // Ignore localStorage write failures.
  }
};
