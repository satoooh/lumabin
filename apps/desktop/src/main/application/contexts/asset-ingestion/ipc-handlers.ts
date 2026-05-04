import type { IpcMain } from 'electron';
import {
  ipcChannels,
  type CheckUploadConflictsInput,
  type CheckUploadConflictsResult,
  type PersistClipboardFileInput,
  type PersistSystemClipboardImageResult,
  type StartUploadInput,
  type UploadJobStatus,
} from '../../../../shared/ipc';
import type { AssetIngestionApplicationService } from './application-service';

interface AssetIngestionDependencies {
  application: AssetIngestionApplicationService;
}

export const registerAssetIngestionHandlers = (
  ipcMain: IpcMain,
  dependencies: AssetIngestionDependencies,
): void => {
  ipcMain.handle(
    ipcChannels.files.persistClipboardFile,
    async (_event, input: PersistClipboardFileInput): Promise<string> =>
      dependencies.application.persistClipboardFile(input),
  );

  ipcMain.handle(
    ipcChannels.files.persistClipboardImageFromSystem,
    async (): Promise<PersistSystemClipboardImageResult | null> =>
      dependencies.application.persistClipboardImageFromSystem(),
  );

  ipcMain.handle(
    ipcChannels.assets.checkUploadConflicts,
    async (
      _event,
      input: CheckUploadConflictsInput,
    ): Promise<CheckUploadConflictsResult> =>
      dependencies.application.checkUploadConflicts(input),
  );

  ipcMain.handle(
    ipcChannels.assets.upload,
    async (_event, input: StartUploadInput): Promise<string> =>
      dependencies.application.startUpload(input),
  );

  ipcMain.handle(
    ipcChannels.assets.getUploadJob,
    async (_event, jobId: string): Promise<UploadJobStatus> =>
      dependencies.application.getUploadJob(jobId),
  );

  ipcMain.handle(
    ipcChannels.assets.cancelUpload,
    async (_event, jobId: string): Promise<void> => {
      await dependencies.application.cancelUpload(jobId);
    },
  );
};
