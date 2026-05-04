import type { IpcMain } from 'electron';
import {
  ipcChannels,
  type SavedView,
  type SaveViewInput,
  type SearchInput,
  type SearchResult,
} from '../../../../shared/ipc';
import type { AssetDiscoveryApplicationService } from './application-service';

interface AssetDiscoveryDependencies {
  application: AssetDiscoveryApplicationService;
}

export const registerAssetDiscoveryHandlers = (
  ipcMain: IpcMain,
  dependencies: AssetDiscoveryDependencies,
): void => {
  ipcMain.handle(
    ipcChannels.search.query,
    async (_event, input: SearchInput): Promise<SearchResult> =>
      dependencies.application.queryAssets(input),
  );

  ipcMain.handle(
    ipcChannels.search.saveView,
    async (_event, input: SaveViewInput): Promise<SavedView> =>
      dependencies.application.saveView(input),
  );

  ipcMain.handle(ipcChannels.search.listViews, async (): Promise<SavedView[]> =>
    dependencies.application.listSavedViews(),
  );

  ipcMain.handle(
    ipcChannels.search.removeView,
    async (_event, viewId: string): Promise<void> => {
      await dependencies.application.deleteSavedView(viewId);
    },
  );
};
