import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUploadToastLifecycle } from '../../src/features/upload/use-upload-toast-lifecycle';

const doneUploadJob = {
  id: 'job-1',
  status: 'done',
} as const;

describe('upload toast lifecycle', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('clears finished uploads only after the completed-toast dismiss window', async () => {
    vi.useFakeTimers();
    const handleClearFinishedUploads = vi.fn();

    render(
      <UploadToastLifecycleHarness
        onClearFinishedUploads={handleClearFinishedUploads}
        uploadSummaryJob={doneUploadJob}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(9999);
    });
    expect(handleClearFinishedUploads).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(handleClearFinishedUploads).toHaveBeenCalledTimes(1);
  });
});

interface UploadToastLifecycleHarnessProps {
  onClearFinishedUploads: () => void;
  uploadSummaryJob: typeof doneUploadJob;
}

const UploadToastLifecycleHarness = ({
  onClearFinishedUploads,
  uploadSummaryJob,
}: UploadToastLifecycleHarnessProps) => {
  useUploadToastLifecycle({
    onClearFinishedUploads,
    showUploadToast: true,
    uploadSummaryJob,
  });

  return null;
};
