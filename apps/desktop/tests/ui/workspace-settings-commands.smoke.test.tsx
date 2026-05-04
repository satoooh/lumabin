import { cleanup, render } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorkspaceSettingsCommandApi } from '../../src/features/shared/desktop-api-gateway';
import { useWorkspaceSettingsCommands } from '../../src/features/settings/use-workspace-settings-commands';
import { initialSettings } from '../../src/features/settings/workspace-settings-state';
import type { AppSettings } from '../../src/shared/ipc';

const createWorkspaceSettingsCommandApi = (): WorkspaceSettingsCommandApi => ({
  saveSettings: vi.fn(async (settings) => ({
    ...initialSettings,
    ...settings,
  })),
});

interface ProbeProps {
  setSavedSettingsSnapshot?: (value: AppSettings) => void;
  setSettings?: (value: AppSettings) => void;
  setStatusLine?: (status: string, tone?: 'neutral' | 'success' | 'error') => void;
  settings?: AppSettings;
  workspaceSettingsCommandApi?: WorkspaceSettingsCommandApi;
}

const Probe = ({
  setSavedSettingsSnapshot = vi.fn(),
  setSettings = vi.fn(),
  setStatusLine = vi.fn(),
  settings = initialSettings,
  workspaceSettingsCommandApi = createWorkspaceSettingsCommandApi(),
}: ProbeProps) => {
  const commands = useWorkspaceSettingsCommands({
    settings,
    setIsSettingsBusy: vi.fn(),
    setSavedSettingsSnapshot,
    setSettings,
    setStatusLine,
    workspaceSettingsCommandApi,
  });

  useEffect(() => {
    void commands.handleSaveSettings();
  }, [commands]);

  return null;
};

describe('workspace settings commands', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('saves workspace settings through the injected workspace port', async () => {
    const workspaceSettingsCommandApi = createWorkspaceSettingsCommandApi();
    const setSavedSettingsSnapshot = vi.fn();
    const setSettings = vi.fn();
    const setStatusLine = vi.fn();
    const settings = {
      ...initialSettings,
      presignedUrlTTLSeconds: 3600,
    };

    render(
      <Probe
        setSavedSettingsSnapshot={setSavedSettingsSnapshot}
        setSettings={setSettings}
        setStatusLine={setStatusLine}
        settings={settings}
        workspaceSettingsCommandApi={workspaceSettingsCommandApi}
      />,
    );

    await vi.waitFor(() => {
      expect(workspaceSettingsCommandApi.saveSettings).toHaveBeenCalledWith(settings);
    });
    expect(setSettings).toHaveBeenCalledWith(settings);
    expect(setSavedSettingsSnapshot).toHaveBeenCalledWith(settings);
    expect(setStatusLine).toHaveBeenCalledWith('Settings saved', 'success');
  });
});
