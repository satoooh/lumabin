import { describe, expect, it, vi } from 'vitest';
import {
  UPLOAD_QUEUE_STORAGE_KEY,
  loadPersistedUploadQueue,
  persistUploadQueue,
  sanitizePersistedUploadJob,
  type UploadQueueItem,
} from '../../src/features/upload/upload-queue-persistence';

const createUploadQueueItem = (
  overrides: Partial<UploadQueueItem> = {},
): UploadQueueItem => ({
  id: 'upload-1',
  profileId: 'profile-1',
  status: 'failed',
  destinationPrefix: 'photos/',
  conflictPolicy: 'rename',
  createdAt: '2026-05-03T00:00:00.000Z',
  updatedAt: '2026-05-03T00:01:00.000Z',
  totalItems: 2,
  completedItems: 1,
  failedItems: 1,
  failedSources: [{ path: '/tmp/a.png', size: 123, relativePath: 'album/a.png' }],
  lastError: 'Network error',
  ...overrides,
});

describe('upload queue persistence', () => {
  it('marks interrupted active jobs as failed after restart', () => {
    const sanitized = sanitizePersistedUploadJob(
      createUploadQueueItem({
        status: 'running',
        lastError: '',
      }),
    );

    expect(sanitized?.status).toBe('failed');
    expect(sanitized?.lastError).toBe('Upload interrupted after restart');
  });

  it('normalizes failed sources and drops malformed persisted entries', () => {
    const sanitized = sanitizePersistedUploadJob({
      ...createUploadQueueItem({ failedItems: undefined }),
      failedSources: [
        { path: '/tmp/a.png', size: 123, relativePath: '/album//a.png' },
        { path: '', size: 456 },
        { path: '/tmp/b.png', size: -1 },
      ],
    });

    expect(sanitized?.failedItems).toBe(1);
    expect(sanitized?.failedSources).toEqual([
      { path: '/tmp/a.png', size: 123, relativePath: 'album/a.png' },
    ]);
  });

  it('loads only sanitized queue items from storage', () => {
    const storage = {
      getItem: vi.fn(() =>
        JSON.stringify([
          createUploadQueueItem({ id: 'valid' }),
          { id: 'missing-profile', status: 'failed', updatedAt: '2026-05-03T00:00:00.000Z' },
          { ...createUploadQueueItem({ id: 'bad-status' }), status: 'unknown' },
        ]),
      ),
      setItem: vi.fn(),
    };

    const loaded = loadPersistedUploadQueue(storage);

    expect(storage.getItem).toHaveBeenCalledWith(UPLOAD_QUEUE_STORAGE_KEY);
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe('valid');
  });

  it('caps persisted queue snapshots and ignores storage write failures', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new Error('quota exceeded');
      }),
    };
    const queue = Array.from({ length: 25 }, (_, index) =>
      createUploadQueueItem({ id: `upload-${index}` }),
    );

    expect(() => persistUploadQueue(queue, storage)).not.toThrow();

    const writableStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
    persistUploadQueue(queue, writableStorage);
    const [, rawValue] = writableStorage.setItem.mock.calls[0] ?? [];
    expect(JSON.parse(rawValue as string)).toHaveLength(20);
  });
});
