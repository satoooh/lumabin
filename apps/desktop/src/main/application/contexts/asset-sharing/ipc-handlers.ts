import type { IpcMain } from 'electron';
import {
  ipcChannels,
  type PresignInput,
  type PresignResult,
} from '../../../../shared/ipc';
import type { AssetSharingQueryService } from './query-service';

interface AssetSharingContextDependencies {
  queries: AssetSharingQueryService;
}

export const registerAssetSharingHandlers = (
  ipcMain: IpcMain,
  dependencies: AssetSharingContextDependencies,
): void => {
  ipcMain.handle(
    ipcChannels.sharing.createPresignedGet,
    async (_event, input: PresignInput): Promise<PresignResult> =>
      dependencies.queries.createPresignedGet(input),
  );

  ipcMain.handle(
    ipcChannels.sharing.createPresignedPut,
    async (_event, input: PresignInput): Promise<PresignResult> =>
      dependencies.queries.createPresignedPut(input),
  );
};
