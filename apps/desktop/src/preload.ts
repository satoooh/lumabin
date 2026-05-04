import { contextBridge, ipcRenderer, webUtils } from 'electron';
import {
  ipcChannels,
  type DeleteAssetsInput,
  type CheckUploadConflictsInput,
  type HeadAssetInput,
  type ListAssetsInput,
  type LumabinAPI,
  type MoveAssetInput,
  type PersistClipboardFileInput,
  type PresignInput,
  type PreviewAssetInput,
  type RenameAssetInput,
  type SaveProfileInput,
  type SaveSettingsInput,
  type SaveViewInput,
  type SearchInput,
  type StartUploadInput,
} from './shared/ipc';

const lumabinApi: LumabinAPI = {
  runtime: {
    getInfo: () => ipcRenderer.invoke(ipcChannels.runtime.getInfo),
  },
  files: {
    getPathForFile: (file: File) => {
      try {
        return webUtils.getPathForFile(file) || '';
      } catch {
        return '';
      }
    },
    persistClipboardFile: (input: PersistClipboardFileInput) =>
      ipcRenderer.invoke(ipcChannels.files.persistClipboardFile, input),
    persistClipboardImageFromSystem: () =>
      ipcRenderer.invoke(ipcChannels.files.persistClipboardImageFromSystem),
  },
  profiles: {
    list: () => ipcRenderer.invoke(ipcChannels.profiles.list),
    save: (input: SaveProfileInput) => ipcRenderer.invoke(ipcChannels.profiles.save, input),
    testConnection: (profileId: string) =>
      ipcRenderer.invoke(ipcChannels.profiles.testConnection, profileId),
    delete: (profileId: string) => ipcRenderer.invoke(ipcChannels.profiles.remove, profileId),
  },
  assets: {
    list: (input: ListAssetsInput) => ipcRenderer.invoke(ipcChannels.assets.list, input),
    head: (input: HeadAssetInput) => ipcRenderer.invoke(ipcChannels.assets.head, input),
    preview: (input: PreviewAssetInput) =>
      ipcRenderer.invoke(ipcChannels.assets.preview, input),
    checkUploadConflicts: (input: CheckUploadConflictsInput) =>
      ipcRenderer.invoke(ipcChannels.assets.checkUploadConflicts, input),
    upload: (input: StartUploadInput) => ipcRenderer.invoke(ipcChannels.assets.upload, input),
    getUploadJob: (jobId: string) => ipcRenderer.invoke(ipcChannels.assets.getUploadJob, jobId),
    cancelUpload: (jobId: string) => ipcRenderer.invoke(ipcChannels.assets.cancelUpload, jobId),
    rename: (input: RenameAssetInput) => ipcRenderer.invoke(ipcChannels.assets.rename, input),
    move: (input: MoveAssetInput) => ipcRenderer.invoke(ipcChannels.assets.move, input),
    remove: (input: DeleteAssetsInput) => ipcRenderer.invoke(ipcChannels.assets.remove, input),
  },
  search: {
    query: (input: SearchInput) => ipcRenderer.invoke(ipcChannels.search.query, input),
    saveView: (input: SaveViewInput) => ipcRenderer.invoke(ipcChannels.search.saveView, input),
    listViews: () => ipcRenderer.invoke(ipcChannels.search.listViews),
    deleteView: (viewId: string) => ipcRenderer.invoke(ipcChannels.search.removeView, viewId),
  },
  sharing: {
    createPresignedGet: (input: PresignInput) =>
      ipcRenderer.invoke(ipcChannels.sharing.createPresignedGet, input),
    createPresignedPut: (input: PresignInput) =>
      ipcRenderer.invoke(ipcChannels.sharing.createPresignedPut, input),
  },
  settings: {
    get: () => ipcRenderer.invoke(ipcChannels.settings.get),
    save: (input: SaveSettingsInput) => ipcRenderer.invoke(ipcChannels.settings.save, input),
  },
  dev: {
    getMetrics: () => ipcRenderer.invoke(ipcChannels.dev.getMetrics),
    resetMetrics: () => ipcRenderer.invoke(ipcChannels.dev.resetMetrics),
  },
};

contextBridge.exposeInMainWorld('lumabin', lumabinApi);
