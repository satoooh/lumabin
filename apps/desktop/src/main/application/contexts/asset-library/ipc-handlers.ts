import type { IpcMain } from 'electron';
import {
  ipcChannels,
  type AssetMetadata,
  type AssetPreview,
  type DeleteAssetsInput,
  type HeadAssetInput,
  type ListAssetsInput,
  type ListAssetsResult,
  type MoveAssetInput,
  type PreviewAssetInput,
  type RenameAssetInput,
} from '../../../../shared/ipc';
import type { AssetLibraryCommandService } from './command-service';
import type { AssetLibraryQueryService } from './query-service';

interface AssetLibraryQueryDependencies {
  queries: AssetLibraryQueryService;
}

interface AssetLibraryCommandDependencies {
  commands: AssetLibraryCommandService;
}

export const registerAssetLibraryQueryHandlers = (
  ipcMain: IpcMain,
  dependencies: AssetLibraryQueryDependencies,
): void => {
  ipcMain.handle(
    ipcChannels.assets.list,
    async (_event, input: ListAssetsInput): Promise<ListAssetsResult> =>
      dependencies.queries.listAssets(input),
  );

  ipcMain.handle(
    ipcChannels.assets.head,
    async (_event, input: HeadAssetInput): Promise<AssetMetadata> =>
      dependencies.queries.headAsset(input),
  );

  ipcMain.handle(
    ipcChannels.assets.preview,
    async (_event, input: PreviewAssetInput): Promise<AssetPreview> =>
      dependencies.queries.previewAsset(input),
  );
};

export const registerAssetLibraryCommandHandlers = (
  ipcMain: IpcMain,
  dependencies: AssetLibraryCommandDependencies,
): void => {
  ipcMain.handle(
    ipcChannels.assets.rename,
    async (_event, input: RenameAssetInput) =>
      dependencies.commands.renameAsset(input),
  );

  ipcMain.handle(
    ipcChannels.assets.move,
    async (_event, input: MoveAssetInput) =>
      dependencies.commands.moveAsset(input),
  );

  ipcMain.handle(
    ipcChannels.assets.remove,
    async (_event, input: DeleteAssetsInput) =>
      dependencies.commands.deleteAssets(input),
  );
};
