import type { IpcMain } from 'electron';
import {
  createAssetSharingQueryService,
  type AssetSharingQueryServiceDependencies,
} from './query-service';
import { registerAssetSharingHandlers } from './ipc-handlers';

export const registerAssetSharingComposition = (
  ipcMain: IpcMain,
  dependencies: AssetSharingQueryServiceDependencies,
): void => {
  const queries = createAssetSharingQueryService(dependencies);

  registerAssetSharingHandlers(ipcMain, {
    queries,
  });
};
