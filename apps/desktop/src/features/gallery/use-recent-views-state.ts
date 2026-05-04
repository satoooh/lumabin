import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loadRecentViewsStore,
  RECENT_VIEWS_STORAGE_KEY,
  rememberRecentAssetView,
  type RecentViewsByProfile,
} from './recent-views-state';

interface UseRecentViewsStateOptions {
  initialStore?: RecentViewsByProfile;
  selectedProfileId: string;
}

export const useRecentViewsState = ({
  initialStore = loadRecentViewsStore(),
  selectedProfileId,
}: UseRecentViewsStateOptions) => {
  const [recentViewsByProfile, setRecentViewsByProfile] = useState<RecentViewsByProfile>(
    initialStore,
  );

  const recentViewsForSelectedProfile = useMemo(
    () => (selectedProfileId ? recentViewsByProfile[selectedProfileId] ?? {} : {}),
    [recentViewsByProfile, selectedProfileId],
  );

  const markAssetAsRecentlyViewed = useCallback((profileId: string, key: string) => {
    setRecentViewsByProfile((current) => rememberRecentAssetView(current, profileId, key));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        RECENT_VIEWS_STORAGE_KEY,
        JSON.stringify(recentViewsByProfile),
      );
    } catch {
      // Ignore localStorage write failures.
    }
  }, [recentViewsByProfile]);

  return {
    markAssetAsRecentlyViewed,
    recentViewsByProfile,
    recentViewsForSelectedProfile,
  };
};
