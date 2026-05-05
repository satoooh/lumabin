import { describe, expect, it } from 'vitest';
import {
  isActiveUploadJobStatus,
  listActiveUploadJobIds,
} from '../../src/features/upload/upload-job-polling-policy';
import type { UploadQueueItem } from '../../src/features/upload/upload-queue-persistence';

const createUploadQueueItem = (
  overrides: Partial<UploadQueueItem> = {},
): UploadQueueItem => ({
  id: 'upload-1',
  profileId: 'profile-1',
  status: 'running',
  destinationPrefix: 'photos/',
  conflictPolicy: 'rename',
  createdAt: '2026-05-03T00:00:00.000Z',
  updatedAt: '2026-05-03T00:00:01.000Z',
  totalItems: 1,
  completedItems: 0,
  failedItems: 0,
  failedSources: [],
  lastError: '',
  ...overrides,
});

describe('upload job polling policy', () => {
  it('treats only queued and running uploads as active', () => {
    expect(isActiveUploadJobStatus('queued')).toBe(true);
    expect(isActiveUploadJobStatus('running')).toBe(true);
    expect(isActiveUploadJobStatus('done')).toBe(false);
    expect(isActiveUploadJobStatus('failed')).toBe(false);
    expect(isActiveUploadJobStatus('canceled')).toBe(false);
  });

  it('lists polling targets in queue order while skipping terminal jobs', () => {
    expect(
      listActiveUploadJobIds([
        createUploadQueueItem({ id: 'queued', status: 'queued' }),
        createUploadQueueItem({ id: 'done', status: 'done' }),
        createUploadQueueItem({ id: 'running', status: 'running' }),
        createUploadQueueItem({ id: 'failed', status: 'failed' }),
        createUploadQueueItem({ id: 'canceled', status: 'canceled' }),
      ]),
    ).toEqual(['queued', 'running']);
  });
});
