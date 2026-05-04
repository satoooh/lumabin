import { describe, expect, it } from 'vitest';
import { resolveQuickPreviewRectTransition } from '../../src/features/preview/quick-preview-animation-policy';

describe('quick preview animation policy', () => {
  it('resolves center delta and clamped scale for source-target rect animations', () => {
    expect(
      resolveQuickPreviewRectTransition(
        {
          x: 100,
          y: 80,
          width: 400,
          height: 300,
        },
        {
          x: 120,
          y: 110,
          width: 160,
          height: 120,
        },
      ),
    ).toEqual({
      deltaX: -100,
      deltaY: -60,
      scaleX: 0.4,
      scaleY: 0.4,
    });
  });

  it('clamps very small close targets to avoid vanishing during zoom-out', () => {
    expect(
      resolveQuickPreviewRectTransition(
        {
          x: 0,
          y: 0,
          width: 1000,
          height: 500,
        },
        {
          x: 0,
          y: 0,
          width: 1,
          height: 1,
        },
      ),
    ).toMatchObject({
      scaleX: 0.22,
      scaleY: 0.22,
    });
  });
});
