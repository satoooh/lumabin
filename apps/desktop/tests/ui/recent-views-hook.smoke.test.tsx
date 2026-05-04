import { cleanup, render } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { RECENT_VIEWS_STORAGE_KEY } from '../../src/features/gallery/recent-views-state';
import { useRecentViewsState } from '../../src/features/gallery/use-recent-views-state';

const Probe = () => {
  const { markAssetAsRecentlyViewed, recentViewsForSelectedProfile } = useRecentViewsState({
    initialStore: {},
    selectedProfileId: 'profile-1',
  });

  useEffect(() => {
    markAssetAsRecentlyViewed('profile-1', 'photos/a.png');
  }, [markAssetAsRecentlyViewed]);

  return (
    <output data-testid="recent-count">
      {Object.keys(recentViewsForSelectedProfile).length}
    </output>
  );
};

describe('recent views hook', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('tracks selected profile recent views and persists the store', async () => {
    const { findByText } = render(<Probe />);

    await findByText('1');
    expect(JSON.parse(window.localStorage.getItem(RECENT_VIEWS_STORAGE_KEY) ?? '{}')).toMatchObject({
      'profile-1': {
        'photos/a.png': expect.any(Number),
      },
    });
  });
});
