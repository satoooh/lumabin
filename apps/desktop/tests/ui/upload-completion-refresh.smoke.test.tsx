import {
  act,
  cleanup,
  render,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUploadCompletionRefresh } from '../../src/features/upload/use-upload-completion-refresh';
import type { UploadQueueItem } from '../../src/features/upload/upload-queue-persistence';

const createUploadQueueItem = (
  overrides: Partial<UploadQueueItem> = {},
): UploadQueueItem => ({
  id: 'upload-1',
  profileId: 'profile-1',
  status: 'done',
  destinationPrefix: 'photos/',
  conflictPolicy: 'rename',
  createdAt: '2026-05-03T00:00:00.000Z',
  updatedAt: '2026-05-03T00:00:01.000Z',
  totalItems: 2,
  completedItems: 2,
  failedItems: 0,
  failedSources: [],
  lastError: '',
  ...overrides,
});

interface ProbeProps {
  onGalleryRefresh: () => Promise<void>;
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  selectedProfileId?: string;
  uploadQueue: UploadQueueItem[];
}

const Probe = ({
  onGalleryRefresh,
  onStatusLine,
  selectedProfileId = 'profile-1',
  uploadQueue,
}: ProbeProps) => {
  useUploadCompletionRefresh({
    onGalleryRefresh,
    onStatusLine,
    selectedProfileId,
    uploadQueue,
  });
  return null;
};

describe('useUploadCompletionRefresh', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('refreshes the gallery once after selected profile uploads complete', async () => {
    vi.useFakeTimers();
    const onGalleryRefresh = vi.fn(async () => undefined);
    const onStatusLine = vi.fn();

    render(
      <Probe
        onGalleryRefresh={onGalleryRefresh}
        onStatusLine={onStatusLine}
        uploadQueue={[createUploadQueueItem()]}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(420);
    });

    expect(onGalleryRefresh).toHaveBeenCalledTimes(1);
    expect(onStatusLine).toHaveBeenCalledWith(
      'Uploaded 2 items. Gallery refreshed.',
      'success',
    );
  });

  it('ignores terminal jobs without newly uploaded items for the selected profile', async () => {
    vi.useFakeTimers();
    const onGalleryRefresh = vi.fn(async () => undefined);
    const onStatusLine = vi.fn();

    render(
      <Probe
        onGalleryRefresh={onGalleryRefresh}
        onStatusLine={onStatusLine}
        uploadQueue={[
          createUploadQueueItem({ completedItems: 0, status: 'failed' }),
          createUploadQueueItem({ id: 'upload-2', profileId: 'other-profile' }),
        ]}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(840);
    });

    expect(onGalleryRefresh).not.toHaveBeenCalled();
    expect(onStatusLine).not.toHaveBeenCalled();
  });

  it('reports refresh failures after uploads complete', async () => {
    vi.useFakeTimers();
    const onGalleryRefresh = vi.fn(async () => {
      throw new Error('reload failed');
    });
    const onStatusLine = vi.fn();

    render(
      <Probe
        onGalleryRefresh={onGalleryRefresh}
        onStatusLine={onStatusLine}
        uploadQueue={[createUploadQueueItem({ completedItems: 1 })]}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(420);
    });

    expect(onStatusLine).toHaveBeenCalledWith(
      'Uploaded 1 item, but refresh failed: reload failed',
      'error',
    );
  });
});
