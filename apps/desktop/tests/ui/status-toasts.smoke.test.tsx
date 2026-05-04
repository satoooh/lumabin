import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeleteUndoToast } from '../../src/features/gallery/delete-undo-toast';
import { UploadStatusToast } from '../../src/features/upload/upload-status-toast';

describe('status toasts', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('keeps delete undo controls accessible with a destructive visual marker', () => {
    const onUndo = vi.fn();
    const onDeleteNow = vi.fn();
    const { container } = render(
      <DeleteUndoToast
        isVisible
        pendingItemCount={1}
        queuedMoreCount={2}
        remainingSeconds={4}
        onUndo={onUndo}
        onDeleteNow={onDeleteNow}
      />,
    );

    screen.getByRole('button', { name: 'Undo' }).click();
    screen.getByRole('button', { name: 'Delete now' }).click();
    expect(screen.getByText('1 item pending delete')).toBeTruthy();
    expect(container.querySelector('.delete-undo-toast__state-icon')).toBeTruthy();
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onDeleteNow).toHaveBeenCalledTimes(1);
  });

  it('keeps upload status in the upload visual lane', () => {
    const { container } = render(
      <UploadStatusToast
        isVisible
        isExpanded
        title="Uploading 2 files"
        compactTitle="Uploading"
        status="running"
        subtitle="1 active / 2 jobs"
        progress={50}
        canRetry={false}
        isBusy
        isActive
        activeJobCount={1}
        totalJobs={2}
        onRetryFailed={vi.fn()}
        onCancel={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText('Uploading 2 files')).toBeTruthy();
    expect(container.querySelector('.upload-toast__state-icon--neutral')).toBeTruthy();
    expect(container.querySelector('.delete-undo-toast__state-icon')).toBeNull();
  });
});
