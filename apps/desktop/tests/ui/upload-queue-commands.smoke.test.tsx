import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  useEffect,
  useRef,
} from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUploadQueueCommands } from '../../src/features/upload/use-upload-queue-commands';
import type {
  CheckUploadConflictsResult,
  StartUploadInput,
  UploadJobStatus,
  UploadSource,
} from '../../src/shared/ipc';

const source: UploadSource = {
  path: '/tmp/image.png',
  size: 123,
};

const createUploadJobStatus = (
  overrides: Partial<UploadJobStatus> = {},
): UploadJobStatus => ({
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

interface UploadApi {
  cancelUpload: (jobId: string) => Promise<void>;
  checkUploadConflicts: (input: {
    profileId: string;
    destinationPrefix: string;
    sources: UploadSource[];
  }) => Promise<CheckUploadConflictsResult>;
  getUploadJob: (jobId: string) => Promise<UploadJobStatus>;
  upload: (input: StartUploadInput) => Promise<string>;
}

const createUploadApi = (overrides: Partial<UploadApi> = {}): UploadApi => ({
  cancelUpload: vi.fn(async () => undefined),
  checkUploadConflicts: vi.fn(async () => ({
    conflicts: [],
    totalConflicts: 0,
  })),
  getUploadJob: vi.fn(async () => createUploadJobStatus()),
  upload: vi.fn(async () => 'upload-1'),
  ...overrides,
});

interface ProbeProps {
  onInlineFeedback?: (message: string) => void;
  onStatusLine?: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  uploadApi: UploadApi;
}

const Probe = ({
  onInlineFeedback = vi.fn(),
  onStatusLine = vi.fn(),
  uploadApi,
}: ProbeProps) => {
  const didStartRef = useRef(false);
  const {
    isUploadBusy,
    startUploadFromSources,
    uploadConflictDialog,
    uploadQueue,
  } = useUploadQueueCommands({
    assetsPrefix: 'photos',
    defaultConflictPolicy: 'rename',
    initialUploadQueue: [],
    onInlineFeedback,
    onStatusLine,
    selectedProfileId: 'profile-1',
    uploadApi,
  });

  useEffect(() => {
    if (didStartRef.current) {
      return;
    }
    didStartRef.current = true;
    void startUploadFromSources([source]);
  }, [startUploadFromSources]);

  return (
    <>
      <output>busy:{String(isUploadBusy)}</output>
      <output>conflicts:{uploadConflictDialog?.totalConflicts ?? 0}</output>
      <output>queue:{uploadQueue.length}</output>
    </>
  );
};

describe('useUploadQueueCommands', () => {
  afterEach(() => {
    cleanup();
  });

  it('opens a conflict dialog instead of starting uploads when conflicts exist', async () => {
    const upload = vi.fn(async () => 'upload-1');
    const uploadApi = createUploadApi({
      checkUploadConflicts: vi.fn(async () => ({
        conflicts: [
          {
            fileName: 'image.png',
            key: 'photos/image.png',
            sourcePath: '/tmp/image.png',
          },
        ],
        totalConflicts: 1,
      })),
      upload,
    });

    render(<Probe uploadApi={uploadApi} />);

    await screen.findByText('conflicts:1');
    expect(upload).not.toHaveBeenCalled();
  });

  it('continues uploading when conflict checks fail', async () => {
    const onInlineFeedback = vi.fn();
    const onStatusLine = vi.fn();
    const upload = vi.fn(async () => 'upload-1');
    const uploadApi = createUploadApi({
      checkUploadConflicts: vi.fn(async () => {
        throw new Error('planning unavailable');
      }),
      getUploadJob: vi.fn(async () => createUploadJobStatus()),
      upload,
    });

    render(
      <Probe
        onInlineFeedback={onInlineFeedback}
        onStatusLine={onStatusLine}
        uploadApi={uploadApi}
      />,
    );

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    await screen.findByText('queue:1');
    expect(onStatusLine).toHaveBeenCalledWith(
      'Conflict check failed: planning unavailable. Continuing upload...',
      'neutral',
    );
    expect(onInlineFeedback).toHaveBeenCalledWith('Uploading 1 file');
  });
});
