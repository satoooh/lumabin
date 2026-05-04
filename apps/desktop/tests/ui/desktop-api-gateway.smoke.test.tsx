import { describe, expect, it, vi } from 'vitest';
import { createDesktopApiGateway } from '../../src/features/shared/desktop-api-gateway';
import type { LumabinAPI } from '../../src/shared/ipc';

const createApi = (): LumabinAPI => ({
  runtime: {
    getInfo: vi.fn(),
  },
  assets: {
    cancelUpload: vi.fn(),
    checkUploadConflicts: vi.fn(),
    getUploadJob: vi.fn(),
    head: vi.fn(),
    list: vi.fn(),
    move: vi.fn(),
    preview: vi.fn(),
    remove: vi.fn(),
    rename: vi.fn(),
    upload: vi.fn(),
  },
  dev: {
    getMetrics: vi.fn(),
    resetMetrics: vi.fn(),
  },
  files: {
    getPathForFile: vi.fn(),
    persistClipboardFile: vi.fn(),
    persistClipboardImageFromSystem: vi.fn(),
  },
  profiles: {
    delete: vi.fn(),
    list: vi.fn(),
    save: vi.fn(),
    testConnection: vi.fn(),
  },
  search: {
    deleteView: vi.fn(),
    listViews: vi.fn(),
    query: vi.fn(),
    saveView: vi.fn(),
  },
  settings: {
    get: vi.fn(),
    save: vi.fn(),
  },
  sharing: {
    createPresignedGet: vi.fn(),
    createPresignedPut: vi.fn(),
  },
});

describe('desktop API gateway', () => {
  it('groups preload APIs by renderer bounded context', () => {
    const api = createApi();
    const gateway = createDesktopApiGateway(api);

    expect(gateway.assetLibrary.listAssets).toBe(api.assets.list);
    expect(gateway.assetLibrary.deleteAssets).toBe(api.assets.remove);
    expect(gateway.assetLibrary.headAsset).toBe(api.assets.head);
    expect(gateway.assetLibrary.previewAsset).toBe(api.assets.preview);
    expect(gateway.assetLibrary.renameAsset).toBe(api.assets.rename);
    expect(gateway.assetLibrary.moveAsset).toBe(api.assets.move);
    expect(gateway.assetDiscovery.searchAssets).toBe(api.search.query);
    expect(gateway.assetDiscovery.listSavedViews).toBe(api.search.listViews);
    expect(gateway.assetSharing.createPresignedGet).toBe(
      api.sharing.createPresignedGet,
    );
    expect(gateway.assetUpload.upload).toBe(api.assets.upload);
    expect(gateway.assetUpload.getUploadJob).toBe(api.assets.getUploadJob);
    expect(gateway.runtime).toBe(api.runtime);
    expect(gateway.runtime.getInfo).toBe(api.runtime.getInfo);
    expect(gateway.files).toBe(api.files);
    expect(gateway.workspace.saveProfile).toBe(api.profiles.save);
    expect(gateway.workspace.deleteProfile).toBe(api.profiles.delete);
    expect(gateway.workspace.testConnection).toBe(api.profiles.testConnection);
    expect(gateway.workspace.getSettings).toBe(api.settings.get);
    expect(gateway.workspace.saveSettings).toBe(api.settings.save);
    expect(gateway.diagnostics.getMetrics).toBe(api.dev.getMetrics);
  });
});
