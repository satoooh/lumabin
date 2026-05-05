export type PreviewableKind = 'image' | 'video' | 'pdf' | 'csv';

const PREVIEW_IMAGE_MAX_BYTES_STEPS = [5 * 1024 * 1024, 16 * 1024 * 1024, 32 * 1024 * 1024];
const PREVIEW_VIDEO_MAX_BYTES_STEPS = [8 * 1024 * 1024, 32 * 1024 * 1024, 96 * 1024 * 1024];
const PREVIEW_PDF_MAX_BYTES_STEPS = [6 * 1024 * 1024, 18 * 1024 * 1024, 48 * 1024 * 1024];
const PREVIEW_CSV_MAX_BYTES_STEPS = [1024 * 1024, 4 * 1024 * 1024];
const PREVIEW_FULL_FETCH_MAX_BYTES = 160 * 1024 * 1024;

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const buildPreviewMaxBytesSteps = (
  kind: PreviewableKind,
  totalSizeBytes: number,
): number[] => {
  const base =
    kind === 'video'
      ? PREVIEW_VIDEO_MAX_BYTES_STEPS
      : kind === 'pdf'
        ? PREVIEW_PDF_MAX_BYTES_STEPS
        : kind === 'image'
          ? PREVIEW_IMAGE_MAX_BYTES_STEPS
          : PREVIEW_CSV_MAX_BYTES_STEPS;

  const steps = [...base];
  if (isFiniteNonNegativeNumber(totalSizeBytes) && totalSizeBytes > 0) {
    const maxAdditionalStep = Math.min(totalSizeBytes, PREVIEW_FULL_FETCH_MAX_BYTES);
    if (maxAdditionalStep > steps[steps.length - 1]) {
      steps.push(maxAdditionalStep);
    }
  }

  return [...new Set(steps)].sort((left, right) => left - right);
};

export const toPreviewFailureMessage = (error: unknown): string => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (/timed out/i.test(message)) {
    return 'Preview timed out. Retry preview or download the original file.';
  }
  if (/HTTP 416|InvalidRange/i.test(message)) {
    return 'Preview range request failed. Retry preview or download the original file.';
  }
  if (/decode/i.test(message)) {
    return 'Preview decode failed. Retry preview or download the original file.';
  }
  return `Preview failed: ${message}`;
};
