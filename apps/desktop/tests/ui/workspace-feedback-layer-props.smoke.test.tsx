import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createWorkspaceFeedbackLayerProps } from '../../src/features/layout/workspace-feedback-layer-props';
import type { PendingDeleteJob } from '../../src/features/gallery/use-pending-delete-controller';
import type { UploadQueueItem } from '../../src/features/upload/upload-queue-persistence';

const pendingJob: PendingDeleteJob = {
  id: 'delete-1',
  profileId: 'profile-1',
  keys: ['photos/a.png'],
  createdAt: 1000,
  executeAt: 6000,
};

const uploadJob: UploadQueueItem = {
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
  failedSources: [
    {
      path: '/tmp/a.png',
      size: 1024,
    },
  ],
  lastError: 'File disappeared',
};

describe('workspace feedback layer props', () => {
  it('maps delete, upload, and drop feedback into the layout contract', () => {
    const handleCancelUpload = vi.fn();
    const handleClearFinishedUploads = vi.fn();
    const handleRetryUpload = vi.fn();
    const executePendingDelete = vi.fn();
    const undoPendingDelete = vi.fn();
    const uploadToastRef = createRef<HTMLElement>();

    const props = createWorkspaceFeedbackLayerProps({
      commands: {
        handleCancelUpload,
        handleClearFinishedUploads,
        handleRetryUpload,
        executePendingDelete,
        undoPendingDelete,
      },
      dropOverlay: {
        dropOverlayPrefixLabel: 'photos/',
        isDropActive: true,
      },
      pendingDelete: {
        activePendingDeleteJob: pendingJob,
        pendingDeleteQueuedMoreCount: 2,
        pendingDeleteRemainingSeconds: 5,
        showPendingDeleteToast: true,
      },
      upload: {
        activeUploadJobCount: 1,
        isUploadBusy: false,
        isUploadToastExpanded: true,
        showUploadToast: true,
        totalUploadJobs: 3,
        uploadSummaryCanRetry: true,
        uploadSummaryCompactTitle: '1 failed',
        uploadSummaryJob: uploadJob,
        uploadSummaryLastError: 'File disappeared',
        uploadSummaryProgress: 50,
        uploadSummarySubtitle: '1 of 2 uploaded',
        uploadSummaryTitle: 'Upload failed',
        uploadToastRef,
      },
    });

    props.onUndoPendingDelete('delete-1');
    props.onExecutePendingDelete('delete-1');
    props.onRetryUpload(uploadJob);
    props.onCancelUpload('upload-1');
    props.onDismissUpload();

    expect(props.pendingDelete).toMatchObject({
      activeJob: pendingJob,
      isStackedWithUpload: true,
      isVisible: true,
      queuedMoreCount: 2,
      remainingSeconds: 5,
    });
    expect(props.upload).toMatchObject({
      activeJob: uploadJob,
      activeJobCount: 1,
      canRetry: true,
      isVisible: true,
      status: 'failed',
      totalJobs: 3,
    });
    expect(props.upload.ref).toBe(uploadToastRef);
    expect(props.dropOverlay).toEqual({
      isActive: true,
      prefixLabel: 'photos/',
    });
    expect(undoPendingDelete).toHaveBeenCalledWith('delete-1');
    expect(executePendingDelete).toHaveBeenCalledWith('delete-1');
    expect(handleRetryUpload).toHaveBeenCalledWith(uploadJob);
    expect(handleCancelUpload).toHaveBeenCalledWith('upload-1');
    expect(handleClearFinishedUploads).toHaveBeenCalledTimes(1);
  });
});
