import type { IpcMain } from 'electron';
import {
  createWorkspaceApplicationService,
  type WorkspaceApplicationServiceDependencies,
} from './application-service';
import { registerWorkspaceHandlers } from './ipc-handlers';

export const registerWorkspaceComposition = (
  ipcMain: IpcMain,
  dependencies: WorkspaceApplicationServiceDependencies,
): void => {
  const application = createWorkspaceApplicationService(dependencies);

  registerWorkspaceHandlers(ipcMain, {
    application,
  });
};
