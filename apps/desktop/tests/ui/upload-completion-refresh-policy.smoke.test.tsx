import { describe, expect, it } from 'vitest';
import {
  createUploadCompletionRefreshPlan,
  formatUploadRefreshFailureMessage,
  formatUploadRefreshSuccessMessage,
} from '../../src/features/upload/upload-completion-refresh-policy';
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

describe('upload completion refresh policy', () => {
  it('plans a refresh for newly terminal selected-profile uploads', () => {
    expect(
      createUploadCompletionRefreshPlan({
        previousTerminalStatuses: {},
        selectedProfileId: 'profile-1',
        uploadQueue: [
          createUploadQueueItem({ completedItems: 2 }),
          createUploadQueueItem({
            id: 'upload-other',
            profileId: 'other-profile',
            completedItems: 9,
          }),
        ],
      }),
    ).toEqual({
      nextTerminalStatuses: {
        'upload-1': 'done',
      },
      uploadedItems: 2,
    });
  });

  it('ignores unchanged terminal statuses while retaining live status memory', () => {
    expect(
      createUploadCompletionRefreshPlan({
        previousTerminalStatuses: {
          'upload-1': 'done',
          removed: 'failed',
        },
        selectedProfileId: 'profile-1',
        uploadQueue: [createUploadQueueItem({ completedItems: 3 })],
      }),
    ).toEqual({
      nextTerminalStatuses: {
        'upload-1': 'done',
      },
      uploadedItems: 0,
    });
  });

  it('counts terminal status transitions and clamps negative completed counts', () => {
    expect(
      createUploadCompletionRefreshPlan({
        previousTerminalStatuses: {
          'upload-1': 'failed',
        },
        selectedProfileId: 'profile-1',
        uploadQueue: [
          createUploadQueueItem({
            status: 'done',
            completedItems: -2,
          }),
          createUploadQueueItem({
            id: 'upload-2',
            status: 'canceled',
            completedItems: 1,
          }),
        ],
      }),
    ).toEqual({
      nextTerminalStatuses: {
        'upload-1': 'done',
        'upload-2': 'canceled',
      },
      uploadedItems: 1,
    });
  });

  it('formats gallery refresh result messages with readable counts', () => {
    expect(formatUploadRefreshSuccessMessage(1)).toBe(
      'Uploaded 1 item. Gallery refreshed.',
    );
    expect(formatUploadRefreshFailureMessage(2, 'reload failed')).toBe(
      'Uploaded 2 items, but refresh failed: reload failed',
    );
  });
});
