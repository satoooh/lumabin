import type { StartUploadInput, UploadJobStatus } from '../shared/ipc';

const PRESIGN_TTL_MIN_SECONDS = 60;
const PRESIGN_TTL_MAX_SECONDS = 7 * 24 * 60 * 60;
const PREVIEW_DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const PREVIEW_MIN_MAX_BYTES = 64 * 1024;
const PREVIEW_MAX_MAX_BYTES = 160 * 1024 * 1024;

export const UPLOAD_IMAGE_OPTIMIZE_MAX_WIDTH_PX = 2000;
export const UPLOAD_IMAGE_OPTIMIZE_WEBP_QUALITY = 82;
export const UPLOAD_CONFLICT_PREVIEW_DEFAULT_LIMIT = 8;

interface CreateUploadJobDependencies {
  createUploadJobId(): string;
  getDefaultConflictPolicy(): UploadJobStatus['conflictPolicy'];
  normalizeDestinationPrefix(destinationPrefix: string): string;
  nowIso(): string;
}

export const createUploadJobStatus = (
  input: StartUploadInput,
  dependencies: CreateUploadJobDependencies,
): UploadJobStatus => {
  const now = dependencies.nowIso();

  return {
    id: dependencies.createUploadJobId(),
    profileId: input.profileId,
    status: 'queued',
    destinationPrefix: dependencies.normalizeDestinationPrefix(input.destinationPrefix),
    conflictPolicy: input.conflictPolicy ?? dependencies.getDefaultConflictPolicy(),
    createdAt: now,
    totalItems: input.sources.length,
    completedItems: 0,
    failedItems: 0,
    failedSources: [],
    lastError: '',
    updatedAt: now,
  };
};

export const normalizePreviewMaxBytes = (value: number | undefined): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return PREVIEW_DEFAULT_MAX_BYTES;
  }
  const normalized = Math.floor(value);
  if (normalized < PREVIEW_MIN_MAX_BYTES) {
    return PREVIEW_MIN_MAX_BYTES;
  }
  if (normalized > PREVIEW_MAX_MAX_BYTES) {
    return PREVIEW_MAX_MAX_BYTES;
  }
  return normalized;
};

export const isAbortError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === 'AbortError') {
    return true;
  }
  if ('code' in error && (error as { code?: unknown }).code === 'ABORT_ERR') {
    return true;
  }
  return /aborted/i.test(error.message);
};

export const inferContentTypeFromKey = (key: string): string => {
  const normalized = key.toLowerCase();
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (normalized.endsWith('.png')) {
    return 'image/png';
  }
  if (normalized.endsWith('.gif')) {
    return 'image/gif';
  }
  if (normalized.endsWith('.webp')) {
    return 'image/webp';
  }
  if (normalized.endsWith('.mp4')) {
    return 'video/mp4';
  }
  if (normalized.endsWith('.mov')) {
    return 'video/quicktime';
  }
  if (normalized.endsWith('.pdf')) {
    return 'application/pdf';
  }
  if (normalized.endsWith('.csv')) {
    return 'text/csv';
  }
  return 'application/octet-stream';
};

export const normalizePresignTtl = (value: number): number =>
  Math.max(PRESIGN_TTL_MIN_SECONDS, Math.min(PRESIGN_TTL_MAX_SECONDS, Math.floor(value)));

export const normalizePublicBaseUrls = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const next: Record<string, string> = {};
  for (const [profileId, maybeUrl] of Object.entries(value as Record<string, unknown>)) {
    if (!profileId || typeof maybeUrl !== 'string') {
      continue;
    }

    const normalized = maybeUrl.trim();
    if (!normalized) {
      continue;
    }
    next[profileId] = normalized;
  }
  return next;
};
