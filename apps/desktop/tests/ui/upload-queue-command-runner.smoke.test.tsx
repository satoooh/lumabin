import { describe, expect, it, vi } from 'vitest';
import {
  runUploadQueueStartCommand,
  type UploadQueueCommandRunnerApi,
} from '../../src/features/upload/upload-queue-command-runner';
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

const createUploadApi = (
  overrides: Partial<UploadQueueCommandRunnerApi> = {},
): UploadQueueCommandRunnerApi => ({
  checkUploadConflicts: vi.fn(async () => ({
    conflicts: [],
    totalConflicts: 0,
  })),
  getUploadJob: vi.fn(async () => createUploadJobStatus()),
  upload: vi.fn(async () => 'upload-1'),
  ...overrides,
});

describe('upload queue command runner', () => {
  it('rejects invalid command input before calling upload APIs', async () => {
    const uploadApi = createUploadApi();

    await expect(
      runUploadQueueStartCommand({
        assetsPrefix: 'photos',
        defaultConflictPolicy: 'rename',
        selectedProfileId: '',
        sources: [source],
        uploadApi,
      }),
    ).resolves.toEqual({
      kind: 'validation-error',
      message: 'Select a profile first.',
    });
    await expect(
      runUploadQueueStartCommand({
        assetsPrefix: 'photos',
        defaultConflictPolicy: 'rename',
        selectedProfileId: 'profile-1',
        sources: [],
        uploadApi,
      }),
    ).resolves.toEqual({
      kind: 'validation-error',
      message: 'No files found.',
    });

    expect(uploadApi.checkUploadConflicts).not.toHaveBeenCalled();
    expect(uploadApi.upload).not.toHaveBeenCalled();
    expect(uploadApi.getUploadJob).not.toHaveBeenCalled();
  });

  it('returns conflicts as a query result without starting the upload command', async () => {
    const conflicts: CheckUploadConflictsResult['conflicts'] = [
      {
        fileName: 'image.png',
        key: 'photos/image.png',
        sourcePath: '/tmp/image.png',
      },
    ];
    const uploadApi = createUploadApi({
      checkUploadConflicts: vi.fn(async () => ({
        conflicts,
        totalConflicts: 1,
      })),
    });

    await expect(
      runUploadQueueStartCommand({
        assetsPrefix: 'photos',
        defaultConflictPolicy: 'rename',
        selectedProfileId: 'profile-1',
        sources: [source],
        uploadApi,
      }),
    ).resolves.toEqual({
      kind: 'conflicts-detected',
      dialog: {
        conflicts,
        destinationPrefix: 'photos/',
        sources: [source],
        totalConflicts: 1,
      },
    });

    expect(uploadApi.checkUploadConflicts).toHaveBeenCalledWith({
      destinationPrefix: 'photos/',
      profileId: 'profile-1',
      sources: [source],
    });
    expect(uploadApi.upload).not.toHaveBeenCalled();
  });

  it('starts upload commands with normalized prefix and projection lookup', async () => {
    const upload = vi.fn(async (_input: StartUploadInput) => {
      expect(_input.sources).toEqual([source]);
      return 'upload-1';
    });
    const getUploadJob = vi.fn(async () =>
      createUploadJobStatus({
        destinationPrefix: 'archive/',
        conflictPolicy: 'skip',
      }),
    );
    const uploadApi = createUploadApi({
      getUploadJob,
      upload,
    });

    await expect(
      runUploadQueueStartCommand({
        assetsPrefix: 'photos',
        defaultConflictPolicy: 'rename',
        options: {
          conflictPolicy: 'skip',
          destinationPrefix: 'archive',
        },
        selectedProfileId: 'profile-1',
        sources: [source],
        uploadApi,
      }),
    ).resolves.toEqual({
      conflictPolicy: 'skip',
      destinationPrefix: 'archive/',
      inlineFeedback: 'Uploading 1 file',
      job: createUploadJobStatus({
        destinationPrefix: 'archive/',
        conflictPolicy: 'skip',
      }),
      kind: 'started',
      statusLine: 'Upload started: 1 file to archive/',
      warnings: [],
    });

    expect(uploadApi.checkUploadConflicts).toHaveBeenCalledWith({
      destinationPrefix: 'archive/',
      profileId: 'profile-1',
      sources: [source],
    });
    expect(upload).toHaveBeenCalledWith({
      conflictPolicy: 'skip',
      destinationPrefix: 'archive/',
      profileId: 'profile-1',
      sources: [source],
    });
    expect(getUploadJob).toHaveBeenCalledWith('upload-1');
  });

  it('continues uploads when conflict query fails and reports the warning separately', async () => {
    const uploadApi = createUploadApi({
      checkUploadConflicts: vi.fn(async () => {
        throw new Error('planning unavailable');
      }),
    });

    await expect(
      runUploadQueueStartCommand({
        assetsPrefix: 'photos',
        defaultConflictPolicy: 'rename',
        selectedProfileId: 'profile-1',
        sources: [source],
        uploadApi,
      }),
    ).resolves.toMatchObject({
      kind: 'started',
      warnings: ['Conflict check failed: planning unavailable. Continuing upload...'],
    });

    expect(uploadApi.upload).toHaveBeenCalledTimes(1);
  });

  it('skips conflict queries when explicitly requested', async () => {
    const uploadApi = createUploadApi();

    await expect(
      runUploadQueueStartCommand({
        assetsPrefix: 'photos',
        defaultConflictPolicy: 'rename',
        options: {
          skipConflictCheck: true,
        },
        selectedProfileId: 'profile-1',
        sources: [source],
        uploadApi,
      }),
    ).resolves.toMatchObject({
      kind: 'started',
    });

    expect(uploadApi.checkUploadConflicts).not.toHaveBeenCalled();
    expect(uploadApi.upload).toHaveBeenCalledTimes(1);
  });
});
