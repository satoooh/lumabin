import type { IpcMain } from 'electron';
import {
  createAssetLibraryCommandService,
  type AssetLibraryCommandServiceDependencies,
} from './command-service';
import {
  registerAssetLibraryCommandHandlers,
  registerAssetLibraryQueryHandlers,
} from './ipc-handlers';
import {
  createAssetLibraryQueryService,
  type AssetLibraryQueryServiceDependencies,
} from './query-service';

interface AssetLibraryCompositionDependencies {
  commands: AssetLibraryCommandServiceDependencies;
  queries: AssetLibraryQueryServiceDependencies;
}

export const registerAssetLibraryComposition = (
  ipcMain: IpcMain,
  dependencies: AssetLibraryCompositionDependencies,
): void => {
  const queries = createAssetLibraryQueryService(dependencies.queries);
  const commands = createAssetLibraryCommandService(dependencies.commands);

  registerAssetLibraryQueryHandlers(ipcMain, {
    queries,
  });
  registerAssetLibraryCommandHandlers(ipcMain, {
    commands,
  });
};
