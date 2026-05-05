import { describe, expect, it } from 'vitest';
import { formatCount } from '../../src/features/shared/format-count';
import {
  createUploadToastSummary,
  type UploadToastSummaryJob,
} from '../../src/features/upload/upload-toast-summary-read-model';

const createUploadJob = (
  overrides: Partial<UploadToastSummaryJob> = {},
): UploadToastSummaryJob => ({
  profileId: 'profile-1',
  status: 'running',
  totalItems: 5,
  completedItems: 2,
  failedItems: 0,
  destinationPrefix: 'photos/',
  failedSources: [],
  ...overrides,
});

describe('toast summaries', () => {
  it('formats singular and plural counts without mechanical item(s) copy', () => {
    expect(formatCount(1, 'item')).toBe('1 item');
    expect(formatCount(2, 'item')).toBe('2 items');
    expect(formatCount(1, 'file')).toBe('1 file');
    expect(formatCount(3, 'file')).toBe('3 files');
  });

  it('summarizes the active upload job for the selected profile', () => {
    const summary = createUploadToastSummary({
      uploadQueue: [
        createUploadJob({ profileId: 'profile-other', totalItems: 20 }),
        createUploadJob(),
      ],
      selectedProfileId: 'profile-1',
      showGuidedStart: false,
      isConnectionSetupOpen: false,
      mapUploadFailureMessage: (message) => message ?? '',
    });

    expect(summary).toMatchObject({
      activeUploadJobCount: 1,
      totalUploadJobs: 1,
      showUploadToast: true,
      uploadSummaryProcessed: 2,
      uploadSummaryProgress: 40,
      uploadSummaryCanRetry: false,
      uploadSummaryTitle: '3 items uploading',
      uploadSummarySubtitle: '2/5 • photos/',
      uploadSummaryCompactTitle: 'Uploading 3…',
      uploadSummaryLastError: '',
    });
  });

  it('suppresses upload toast while blocking onboarding surfaces are active', () => {
    const baseInput = {
      uploadQueue: [createUploadJob()],
      selectedProfileId: 'profile-1',
      mapUploadFailureMessage: (message?: string) => message ?? '',
    };

    expect(
      createUploadToastSummary({
        ...baseInput,
        showGuidedStart: true,
        isConnectionSetupOpen: false,
      }).showUploadToast,
    ).toBe(false);
    expect(
      createUploadToastSummary({
        ...baseInput,
        showGuidedStart: false,
        isConnectionSetupOpen: true,
      }).showUploadToast,
    ).toBe(false);
  });

  it('keeps retry and error copy available for failed uploads', () => {
    const summary = createUploadToastSummary({
      uploadQueue: [
        createUploadJob({
          status: 'failed',
          completedItems: 1,
          failedItems: 2,
          failedSources: [{ path: '/tmp/a.png' }],
          lastError: 'network unavailable',
        }),
      ],
      selectedProfileId: 'profile-1',
      showGuidedStart: false,
      isConnectionSetupOpen: false,
      mapUploadFailureMessage: (message) => `Mapped: ${message ?? 'none'}`,
    });

    expect(summary.uploadSummaryCanRetry).toBe(true);
    expect(summary.uploadSummaryTitle).toBe('2 items failed');
    expect(summary.uploadSummaryCompactTitle).toBe('Failed 2');
    expect(summary.uploadSummaryLastError).toBe('Mapped: network unavailable');
  });

  it('falls back to root path and complete progress for empty completed jobs', () => {
    const summary = createUploadToastSummary({
      uploadQueue: [
        createUploadJob({
          status: 'done',
          totalItems: 0,
          completedItems: 0,
          destinationPrefix: '',
        }),
      ],
      selectedProfileId: 'profile-1',
      showGuidedStart: false,
      isConnectionSetupOpen: false,
      mapUploadFailureMessage: (message) => message ?? '',
    });

    expect(summary.uploadSummaryProgress).toBe(100);
    expect(summary.uploadSummaryTitle).toBe('0 items uploaded');
    expect(summary.uploadSummarySubtitle).toBe('0/0 • /');
  });
});
