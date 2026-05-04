import type { IpcMain } from 'electron';
import {
  createAssetIngestionApplicationService,
  type AssetIngestionApplicationServiceDependencies,
} from './application-service';
import { registerAssetIngestionHandlers } from './ipc-handlers';

export const registerAssetIngestionComposition = (
  ipcMain: IpcMain,
  dependencies: AssetIngestionApplicationServiceDependencies,
): void => {
  const application = createAssetIngestionApplicationService(dependencies);

  registerAssetIngestionHandlers(ipcMain, {
    application,
  });
};
