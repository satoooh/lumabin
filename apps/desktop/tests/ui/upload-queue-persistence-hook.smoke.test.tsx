import {
  cleanup,
  render,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useUploadQueuePersistence } from '../../src/features/upload/use-upload-queue-persistence';
import {
  UPLOAD_QUEUE_STORAGE_KEY,
  type UploadQueueItem,
} from '../../src/features/upload/upload-queue-persistence';

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

const Probe = ({ uploadQueue }: { uploadQueue: UploadQueueItem[] }) => {
  useUploadQueuePersistence(uploadQueue);
  return null;
};

describe('useUploadQueuePersistence', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('persists upload queue snapshots', async () => {
    render(<Probe uploadQueue={[createUploadQueueItem()]} />);

    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem(UPLOAD_QUEUE_STORAGE_KEY) ?? '[]')).toEqual([
        expect.objectContaining({
          id: 'upload-1',
          status: 'running',
        }),
      ]),
    );
  });
});
