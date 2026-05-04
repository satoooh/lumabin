import type { IpcMain } from 'electron';
import {
  ipcChannels,
  type ProfileSummary,
  type SaveProfileInput,
  type TestConnectionResult,
} from '../../../../shared/ipc';
import type { WorkspaceApplicationService } from './application-service';

interface WorkspaceContextDependencies {
  application: WorkspaceApplicationService;
}

export const registerWorkspaceHandlers = (
  ipcMain: IpcMain,
  dependencies: WorkspaceContextDependencies,
): void => {
  ipcMain.handle(ipcChannels.profiles.list, async (): Promise<ProfileSummary[]> =>
    dependencies.application.listProfiles(),
  );

  ipcMain.handle(
    ipcChannels.profiles.save,
    async (_event, input: SaveProfileInput): Promise<ProfileSummary> =>
      dependencies.application.saveProfile(input),
  );

  ipcMain.handle(
    ipcChannels.profiles.testConnection,
    async (_event, profileId: string): Promise<TestConnectionResult> =>
      dependencies.application.testConnection(profileId),
  );

  ipcMain.handle(
    ipcChannels.profiles.remove,
    async (_event, profileId: string): Promise<void> => {
      await dependencies.application.deleteProfile(profileId);
    },
  );

  ipcMain.handle(ipcChannels.settings.get, async () =>
    dependencies.application.getSettings(),
  );

  ipcMain.handle(
    ipcChannels.settings.save,
    async (_event, input) => dependencies.application.saveSettings(input),
  );
};
