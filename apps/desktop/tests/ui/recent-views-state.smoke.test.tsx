import { describe, expect, it } from 'vitest';
import {
  rememberRecentAssetView,
  sanitizeRecentViewsStore,
} from '../../src/features/gallery/recent-views-state';

describe('recent views state', () => {
  it('sanitizes recent view stores by profile and recency', () => {
    const now = Date.UTC(2026, 4, 2);
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

    expect(
      sanitizeRecentViewsStore(
        {
          profileA: {
            'current.png': now - 1000,
            'future.png': now + 120_000,
            'old.png': ninetyDaysAgo - 1,
            '': now,
            invalid: Number.NaN,
          },
          profileB: 'not-a-record',
        },
        now,
      ),
    ).toEqual({
      profileA: {
        'current.png': now - 1000,
      },
    });
  });

  it('records a viewed asset without churning duplicate events', () => {
    const now = Date.UTC(2026, 4, 2);
    const initial = {
      profileA: {
        'image-a.png': now - 300,
      },
    };

    expect(rememberRecentAssetView(initial, ' profileA ', ' image-a.png ', now)).toBe(initial);

    expect(rememberRecentAssetView(initial, ' profileA ', ' image-b.png ', now)).toEqual({
      profileA: {
        'image-b.png': now,
        'image-a.png': now - 300,
      },
    });
  });
});
