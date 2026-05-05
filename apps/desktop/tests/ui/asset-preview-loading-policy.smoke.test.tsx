import { describe, expect, it } from 'vitest';
import {
  buildPreviewMaxBytesSteps,
  toPreviewFailureMessage,
} from '../../src/features/preview/asset-preview-loading-policy';

describe('asset preview loading policy', () => {
  it('builds bounded fetch size steps by previewable kind', () => {
    expect(buildPreviewMaxBytesSteps('image', 80 * 1024 * 1024)).toEqual([
      5 * 1024 * 1024,
      16 * 1024 * 1024,
      32 * 1024 * 1024,
      80 * 1024 * 1024,
    ]);
    expect(buildPreviewMaxBytesSteps('video', 500 * 1024 * 1024)).toEqual([
      8 * 1024 * 1024,
      32 * 1024 * 1024,
      96 * 1024 * 1024,
      160 * 1024 * 1024,
    ]);
    expect(buildPreviewMaxBytesSteps('pdf', 24 * 1024 * 1024)).toEqual([
      6 * 1024 * 1024,
      18 * 1024 * 1024,
      48 * 1024 * 1024,
    ]);
    expect(buildPreviewMaxBytesSteps('csv', 0)).toEqual([
      1024 * 1024,
      4 * 1024 * 1024,
    ]);
  });

  it('maps technical preview failures into user-facing recovery messages', () => {
    expect(toPreviewFailureMessage(new Error('Image preview decode timed out'))).toBe(
      'Preview timed out. Retry preview or download the original file.',
    );
    expect(toPreviewFailureMessage(new Error('HTTP 416'))).toBe(
      'Preview range request failed. Retry preview or download the original file.',
    );
    expect(toPreviewFailureMessage(new Error('decode failed'))).toBe(
      'Preview decode failed. Retry preview or download the original file.',
    );
    expect(toPreviewFailureMessage('boom')).toBe('Preview failed: Unknown error');
  });
});
