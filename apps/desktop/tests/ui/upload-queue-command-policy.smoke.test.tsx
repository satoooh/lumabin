import { describe, expect, it } from 'vitest';
import {
  formatResolvedUploadConflictLabel,
  mergeUploadJobIntoQueue,
  retainActiveUploadJobs,
} from '../../src/features/upload/upload-queue-command-policy';
import type { UploadQueueItem } from '../../src/features/upload/upload-queue-persistence';
import type { ConflictPolicy, UploadJobStatus } from '../../src/shared/ipc';

const createUploadJobStatus = (
  overrides: Partial<UploadJobStatus> = {},
): UploadJobStatus => ({
  id: 'upload-1',
  profileId: 'profile-1',
  status: 'running',
  createdAt: '2026-05-03T00:00:00.000Z',
  updatedAt: '2026-05-03T00:00:01.000Z',
  totalItems: 1,
  completedItems: 0,
  failedItems: 0,
  failedSources: [],
  lastError: '',
  ...overrides,
});

const createQueueItem = (
  overrides: Partial<UploadQueueItem> = {},
): UploadQueueItem => ({
  ...createUploadJobStatus({
    conflictPolicy: 'rename',
    destinationPrefix: 'photos/',
  }),
  conflictPolicy: 'rename',
  destinationPrefix: 'photos/',
  ...overrides,
});

describe('upload queue command policy', () => {
  it('prepends new jobs and normalizes fallback command metadata', () => {
    const nextQueue = mergeUploadJobIntoQueue({
      currentQueue: [createQueueItem({ id: 'upload-existing' })],
      job: createUploadJobStatus({ id: 'upload-new' }),
      fallbackDestinationPrefix: 'incoming',
      fallbackConflictPolicy: 'skip',
    });

    expect(nextQueue).toHaveLength(2);
    expect(nextQueue[0]).toMatchObject({
      id: 'upload-new',
      destinationPrefix: 'incoming/',
      conflictPolicy: 'skip',
    });
  });

  it('updates existing jobs without losing command metadata from the previous item', () => {
    const nextQueue = mergeUploadJobIntoQueue({
      currentQueue: [
        createQueueItem({
          id: 'upload-1',
          destinationPrefix: 'kept/',
          conflictPolicy: 'overwrite',
          status: 'queued',
        }),
      ],
      job: createUploadJobStatus({
        id: 'upload-1',
        status: 'running',
      }),
      fallbackDestinationPrefix: 'fallback',
      fallbackConflictPolicy: 'rename',
    });

    expect(nextQueue).toEqual([
      expect.objectContaining({
        id: 'upload-1',
        status: 'running',
        destinationPrefix: 'kept/',
        conflictPolicy: 'overwrite',
      }),
    ]);
  });

  it('keeps only the newest visible upload jobs', () => {
    const currentQueue = Array.from({ length: 20 }, (_, index) =>
      createQueueItem({ id: `upload-${index}` }),
    );

    const nextQueue = mergeUploadJobIntoQueue({
      currentQueue,
      job: createUploadJobStatus({ id: 'upload-new' }),
      fallbackDestinationPrefix: '',
      fallbackConflictPolicy: 'rename',
    });

    expect(nextQueue).toHaveLength(20);
    expect(nextQueue[0].id).toBe('upload-new');
    expect(nextQueue.at(-1)?.id).toBe('upload-18');
  });

  it('retains queued and running jobs when clearing finished uploads', () => {
    expect(
      retainActiveUploadJobs([
        createQueueItem({ id: 'queued', status: 'queued' }),
        createQueueItem({ id: 'running', status: 'running' }),
        createQueueItem({ id: 'done', status: 'done' }),
        createQueueItem({ id: 'failed', status: 'failed' }),
        createQueueItem({ id: 'canceled', status: 'canceled' }),
      ]),
    ).toEqual([
      expect.objectContaining({ id: 'queued' }),
      expect.objectContaining({ id: 'running' }),
    ]);
  });

  it.each<[ConflictPolicy, string]>([
    ['overwrite', 'Upload started with overwrite policy (2 files)'],
    ['skip', 'Upload started with skip policy (2 files)'],
    ['rename', 'Upload started with rename policy (2 files)'],
  ])('formats %s conflict resolution labels', (policy, label) => {
    expect(formatResolvedUploadConflictLabel(policy, 2)).toBe(label);
  });
});
