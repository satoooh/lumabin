import type { IpcMain } from 'electron';
import {
  createAssetDiscoveryApplicationService,
  type AssetDiscoveryApplicationServiceDependencies,
} from './application-service';
import { registerAssetDiscoveryHandlers } from './ipc-handlers';

export const registerAssetDiscoveryComposition = (
  ipcMain: IpcMain,
  dependencies: AssetDiscoveryApplicationServiceDependencies,
): void => {
  const application = createAssetDiscoveryApplicationService(dependencies);

  registerAssetDiscoveryHandlers(ipcMain, {
    application,
  });
};
