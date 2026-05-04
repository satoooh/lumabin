import type { LumabinAPI } from '../../shared/ipc';

export interface DesktopApiGateway {
  runtime: LumabinAPI['runtime'];
  assetDiscovery: {
    deleteSavedView: LumabinAPI['search']['deleteView'];
    listSavedViews: LumabinAPI['search']['listViews'];
    saveView: LumabinAPI['search']['saveView'];
    searchAssets: LumabinAPI['search']['query'];
  };
  assetLibrary: {
    deleteAssets: LumabinAPI['assets']['remove'];
    headAsset: LumabinAPI['assets']['head'];
    listAssets: LumabinAPI['assets']['list'];
    moveAsset: LumabinAPI['assets']['move'];
    previewAsset: LumabinAPI['assets']['preview'];
    renameAsset: LumabinAPI['assets']['rename'];
  };
  assetSharing: {
    createPresignedGet: LumabinAPI['sharing']['createPresignedGet'];
    createPresignedPut: LumabinAPI['sharing']['createPresignedPut'];
  };
  assetUpload: {
    cancelUpload: LumabinAPI['assets']['cancelUpload'];
    checkUploadConflicts: LumabinAPI['assets']['checkUploadConflicts'];
    getUploadJob: LumabinAPI['assets']['getUploadJob'];
    upload: LumabinAPI['assets']['upload'];
  };
  diagnostics: {
    getMetrics: LumabinAPI['dev']['getMetrics'];
    resetMetrics: LumabinAPI['dev']['resetMetrics'];
  };
  files: LumabinAPI['files'];
  workspace: {
    deleteProfile: LumabinAPI['profiles']['delete'];
    getSettings: LumabinAPI['settings']['get'];
    listProfiles: LumabinAPI['profiles']['list'];
    saveProfile: LumabinAPI['profiles']['save'];
    saveSettings: LumabinAPI['settings']['save'];
    testConnection: LumabinAPI['profiles']['testConnection'];
  };
}

export type AssetMutationApi = Pick<
  DesktopApiGateway['assetLibrary'],
  'moveAsset' | 'renameAsset'
>;

export type AssetPreviewApi = Pick<
  DesktopApiGateway['assetLibrary'],
  'headAsset' | 'previewAsset'
>;

export type AssetThumbnailApi = Pick<
  DesktopApiGateway['assetLibrary'],
  'previewAsset'
>;

export type PreviewSharingApi = DesktopApiGateway['assetSharing'];

export type ProfileCommandApi = Pick<
  DesktopApiGateway['workspace'],
  'deleteProfile' | 'saveProfile' | 'testConnection'
>;

export type WorkspaceSettingsCommandApi = Pick<
  DesktopApiGateway['workspace'],
  'saveSettings'
>;

export type SavedViewCommandApi = Pick<
  DesktopApiGateway['assetDiscovery'],
  'deleteSavedView' | 'saveView'
>;

export type UploadCommandApi = DesktopApiGateway['assetUpload'];

export type UploadFilesApi = DesktopApiGateway['files'];

export const createDesktopApiGateway = (
  api: LumabinAPI,
): DesktopApiGateway => ({
  runtime: api.runtime,
  assetDiscovery: {
    deleteSavedView: api.search.deleteView,
    listSavedViews: api.search.listViews,
    saveView: api.search.saveView,
    searchAssets: api.search.query,
  },
  assetLibrary: {
    deleteAssets: api.assets.remove,
    headAsset: api.assets.head,
    listAssets: api.assets.list,
    moveAsset: api.assets.move,
    previewAsset: api.assets.preview,
    renameAsset: api.assets.rename,
  },
  assetSharing: {
    createPresignedGet: api.sharing.createPresignedGet,
    createPresignedPut: api.sharing.createPresignedPut,
  },
  assetUpload: {
    cancelUpload: api.assets.cancelUpload,
    checkUploadConflicts: api.assets.checkUploadConflicts,
    getUploadJob: api.assets.getUploadJob,
    upload: api.assets.upload,
  },
  diagnostics: {
    getMetrics: api.dev.getMetrics,
    resetMetrics: api.dev.resetMetrics,
  },
  files: api.files,
  workspace: {
    deleteProfile: api.profiles.delete,
    getSettings: api.settings.get,
    listProfiles: api.profiles.list,
    saveProfile: api.profiles.save,
    saveSettings: api.settings.save,
    testConnection: api.profiles.testConnection,
  },
});
