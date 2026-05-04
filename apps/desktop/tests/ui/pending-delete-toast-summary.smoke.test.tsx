import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePendingDeleteToastSummary } from '../../src/features/gallery/use-pending-delete-toast-summary';

describe('pending delete toast summary', () => {
  it('selects the active delete job and computes remaining seconds', () => {
    const { result } = renderHook(() =>
      usePendingDeleteToastSummary({
        pendingDeleteJobs: [
          { executeAt: 5000, id: 'delete-1' },
          { executeAt: 7000, id: 'delete-2' },
        ],
        pendingDeleteTicker: 2500,
        showGuidedStart: false,
        isConnectionSetupOpen: false,
      }),
    );

    expect(result.current.activePendingDeleteJob?.id).toBe('delete-1');
    expect(result.current.pendingDeleteRemainingSeconds).toBe(3);
    expect(result.current.pendingDeleteQueuedMoreCount).toBe(1);
    expect(result.current.showPendingDeleteToast).toBe(true);
  });

  it('suppresses delete undo feedback during blocking onboarding flows', () => {
    const { result } = renderHook(() =>
      usePendingDeleteToastSummary({
        pendingDeleteJobs: [{ executeAt: 5000 }],
        pendingDeleteTicker: 2500,
        showGuidedStart: true,
        isConnectionSetupOpen: false,
      }),
    );

    expect(result.current.showPendingDeleteToast).toBe(false);
  });
});
