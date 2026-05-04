import { describe, expect, it, vi } from 'vitest';
import type { UploadJobStatus } from '../../src/shared/ipc';
import {
  saveUploadJob,
  setUploadJobStatusChangeHandler,
  updateUploadJob,
} from '../../src/main/repositories/upload-job-repository';

const createUploadJob = (
  id: string,
  overrides: Partial<UploadJobStatus> = {},
): UploadJobStatus => ({
  id,
  profileId: 'profile-1',
  status: 'queued',
  destinationPrefix: 'photos/',
  totalItems: 2,
  completedItems: 0,
  failedItems: 0,
  failedSources: [],
  updatedAt: '2026-05-03T00:00:00.000Z',
  ...overrides,
});

describe('upload job repository', () => {
  it('notifies status changes without owning application event publishing', () => {
    const handler = vi.fn();
    const dispose = setUploadJobStatusChangeHandler(handler);
    saveUploadJob(createUploadJob('upload-repository-smoke-1'));

    updateUploadJob('upload-repository-smoke-1', (job) => ({
      ...job,
      status: 'running',
      completedItems: 1,
      updatedAt: '2026-05-03T00:00:01.000Z',
    }));
    updateUploadJob('upload-repository-smoke-1', (job) => ({
      ...job,
      completedItems: 2,
      updatedAt: '2026-05-03T00:00:02.000Z',
    }));

    dispose();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      profileId: 'profile-1',
      jobId: 'upload-repository-smoke-1',
      previousStatus: 'queued',
      nextStatus: 'running',
      totalItems: 2,
      completedItems: 1,
      failedItems: 0,
    });
  });

  it('disposes the status change handler', () => {
    const handler = vi.fn();
    const dispose = setUploadJobStatusChangeHandler(handler);
    saveUploadJob(createUploadJob('upload-repository-smoke-2'));
    dispose();

    updateUploadJob('upload-repository-smoke-2', (job) => ({
      ...job,
      status: 'canceled',
      updatedAt: '2026-05-03T00:00:01.000Z',
    }));

    expect(handler).not.toHaveBeenCalled();
  });
});
