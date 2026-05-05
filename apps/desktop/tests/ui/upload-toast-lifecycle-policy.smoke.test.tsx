import { describe, expect, it } from 'vitest';
import {
  resolveUploadToastLifecycleTransition,
  type UploadToastLifecycleJob,
} from '../../src/features/upload/upload-toast-lifecycle-policy';

const createLifecycleJob = (
  overrides: Partial<UploadToastLifecycleJob> = {},
): UploadToastLifecycleJob => ({
  id: 'upload-1',
  status: 'running',
  ...overrides,
});

describe('upload toast lifecycle policy', () => {
  it('resets tracked state and timers when the toast is hidden', () => {
    expect(
      resolveUploadToastLifecycleTransition({
        previousTrackedJob: { id: 'upload-1', status: 'running' },
        showUploadToast: false,
        uploadSummaryJob: createLifecycleJob(),
      }),
    ).toEqual({
      collapseTimer: 'clear',
      dismissTimer: 'clear',
      isExpanded: false,
      nextTrackedJob: null,
    });
  });

  it('keeps active uploads compact and clears completion timers', () => {
    expect(
      resolveUploadToastLifecycleTransition({
        previousTrackedJob: { id: 'upload-1', status: 'done' },
        showUploadToast: true,
        uploadSummaryJob: createLifecycleJob({ status: 'running' }),
      }),
    ).toEqual({
      collapseTimer: 'clear',
      dismissTimer: 'clear',
      isExpanded: false,
      nextTrackedJob: { id: 'upload-1', status: 'running' },
    });
  });

  it('expands failed and canceled uploads without auto-dismiss timers', () => {
    expect(
      resolveUploadToastLifecycleTransition({
        previousTrackedJob: { id: 'upload-1', status: 'running' },
        showUploadToast: true,
        uploadSummaryJob: createLifecycleJob({ status: 'failed' }),
      }),
    ).toEqual({
      collapseTimer: 'clear',
      dismissTimer: 'clear',
      isExpanded: true,
      nextTrackedJob: { id: 'upload-1', status: 'failed' },
    });
  });

  it('schedules dismiss and temporary expansion when an active upload completes', () => {
    expect(
      resolveUploadToastLifecycleTransition({
        previousTrackedJob: { id: 'upload-1', status: 'running' },
        showUploadToast: true,
        uploadSummaryJob: createLifecycleJob({ status: 'done' }),
      }),
    ).toEqual({
      collapseTimer: 'schedule',
      dismissTimer: 'schedule',
      isExpanded: true,
      nextTrackedJob: { id: 'upload-1', status: 'done' },
    });
  });

  it('does not reschedule timers for already tracked completed uploads', () => {
    expect(
      resolveUploadToastLifecycleTransition({
        previousTrackedJob: { id: 'upload-1', status: 'done' },
        showUploadToast: true,
        uploadSummaryJob: createLifecycleJob({ status: 'done' }),
      }),
    ).toEqual({
      collapseTimer: 'keep',
      dismissTimer: 'keep',
      isExpanded: false,
      nextTrackedJob: { id: 'upload-1', status: 'done' },
    });
  });
});
