import {
  act,
  cleanup,
  render,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUploadJobPolling } from '../../src/features/upload/use-upload-job-polling';
import type { UploadQueueItem } from '../../src/features/upload/upload-queue-persistence';
import type { UploadJobStatus } from '../../src/shared/ipc';

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

interface ProbeProps {
  getUploadJob: (jobId: string) => Promise<UploadJobStatus>;
  mergeUploadJob: (job: UploadJobStatus) => void;
  uploadQueue: UploadQueueItem[];
}

const Probe = ({ getUploadJob, mergeUploadJob, uploadQueue }: ProbeProps) => {
  useUploadJobPolling({
    getUploadJob,
    mergeUploadJob,
    uploadQueue,
  });
  return null;
};

describe('useUploadJobPolling', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('polls active upload jobs and merges refreshed status', async () => {
    vi.useFakeTimers();
    const nextJob = createUploadQueueItem({
      completedItems: 1,
      status: 'done',
    });
    const getUploadJob = vi.fn(async () => nextJob);
    const mergeUploadJob = vi.fn();

    render(
      <Probe
        getUploadJob={getUploadJob}
        mergeUploadJob={mergeUploadJob}
        uploadQueue={[createUploadQueueItem({ id: 'upload-1' })]}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });

    expect(getUploadJob).toHaveBeenCalledWith('upload-1');
    expect(mergeUploadJob).toHaveBeenCalledWith(nextJob);
  });

  it('ignores terminal upload jobs', async () => {
    vi.useFakeTimers();
    const getUploadJob = vi.fn(async () => createUploadQueueItem());
    const mergeUploadJob = vi.fn();

    render(
      <Probe
        getUploadJob={getUploadJob}
        mergeUploadJob={mergeUploadJob}
        uploadQueue={[createUploadQueueItem({ status: 'failed' })]}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1400);
    });

    expect(getUploadJob).not.toHaveBeenCalled();
    expect(mergeUploadJob).not.toHaveBeenCalled();
  });
});
