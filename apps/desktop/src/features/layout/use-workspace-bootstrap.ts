import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import type {
  AppSettings,
  ProfileSummary,
  SavedView,
} from '../../shared/ipc';

type StatusTone = 'neutral' | 'success' | 'error';

export interface UseWorkspaceBootstrapOptions {
  getSettings(): Promise<AppSettings>;
  listProfiles(): Promise<ProfileSummary[]>;
  listSavedViews(): Promise<SavedView[]>;
  selectedProfileId: string;
  setProfiles(profiles: ProfileSummary[]): void;
  setSavedSettingsSnapshot(settings: AppSettings): void;
  setSavedViews(savedViews: SavedView[]): void;
  setSelectedProfileId(profileId: string): void;
  setSettings(settings: AppSettings): void;
  setStatusLine(message: string, tone?: StatusTone): void;
}

const sortSavedViews = (views: SavedView[]): SavedView[] =>
  [...views].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });

export const useWorkspaceBootstrap = ({
  getSettings,
  listProfiles,
  listSavedViews,
  selectedProfileId,
  setProfiles,
  setSavedSettingsSnapshot,
  setSavedViews,
  setSelectedProfileId,
  setSettings,
  setStatusLine,
}: UseWorkspaceBootstrapOptions) => {
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  const loadProfiles = useCallback(async () => {
    const nextProfiles = await listProfiles();
    setProfiles(nextProfiles);

    if (nextProfiles.length === 0) {
      setSelectedProfileId('');
      return;
    }

    const selectedExists = nextProfiles.some((profile) => profile.id === selectedProfileId);
    if (!selectedExists) {
      setSelectedProfileId(nextProfiles[0].id);
    }
  }, [listProfiles, selectedProfileId, setProfiles, setSelectedProfileId]);

  const loadSettings = useCallback(async () => {
    const nextSettings = await getSettings();
    setSettings(nextSettings);
    setSavedSettingsSnapshot(nextSettings);
    return nextSettings;
  }, [getSettings, setSavedSettingsSnapshot, setSettings]);

  const loadSavedViews = useCallback(async () => {
    const views = await listSavedViews();
    setSavedViews(sortSavedViews(views));
  }, [listSavedViews, setSavedViews]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const loadedSettings = await loadSettings();
        await Promise.all([loadProfiles(), loadSavedViews()]);

        if (!isMounted) {
          return;
        }

        setStatusLine(`Ready. Conflict policy: ${loadedSettings.defaultConflictPolicy}`, 'success');
      } catch {
        if (!isMounted) {
          return;
        }

        setStatusLine('Desktop bridge unavailable.', 'error');
      } finally {
        if (isMounted) {
          setHasInitialized(true);
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [loadProfiles, loadSavedViews, loadSettings, setStatusLine]);

  return {
    hasInitialized,
    loadProfiles,
    loadSavedViews,
  };
};
