import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { AppSettings } from '../../shared/ipc';
import type { WorkspaceSettingsCommandApi } from '../shared/desktop-api-gateway';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseWorkspaceSettingsCommandsOptions {
  settings: AppSettings;
  setIsSettingsBusy: Dispatch<SetStateAction<boolean>>;
  setSavedSettingsSnapshot: Dispatch<SetStateAction<AppSettings>>;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  setStatusLine: (status: string, tone?: StatusTone) => void;
  workspaceSettingsCommandApi: WorkspaceSettingsCommandApi;
}

export const useWorkspaceSettingsCommands = ({
  settings,
  setIsSettingsBusy,
  setSavedSettingsSnapshot,
  setSettings,
  setStatusLine,
  workspaceSettingsCommandApi,
}: UseWorkspaceSettingsCommandsOptions) => {
  const handleSaveSettings = useCallback(async () => {
    setIsSettingsBusy(true);
    setStatusLine('Saving settings…', 'neutral');
    try {
      const saved = await workspaceSettingsCommandApi.saveSettings(settings);
      setSettings(saved);
      setSavedSettingsSnapshot(saved);
      setStatusLine('Settings saved', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Failed to save settings: ${message}`, 'error');
    } finally {
      setIsSettingsBusy(false);
    }
  }, [
    setIsSettingsBusy,
    setSavedSettingsSnapshot,
    setSettings,
    setStatusLine,
    settings,
    workspaceSettingsCommandApi,
  ]);

  return {
    handleSaveSettings,
  };
};
