import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/App';
import type {
  AppSettings,
  AssetItem,
  AssetMetadata,
  AssetPreview,
  CheckUploadConflictsResult,
  DeleteResult,
  ListAssetsResult,
  LumabinAPI,
  ProfileSummary,
  SavedView,
  SearchResult,
  StartUploadInput,
  UploadJobStatus,
} from '../../src/shared/ipc';

const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7+2f8AAAAASUVORK5CYII=';
const APP_UI_INTEGRATION_TIMEOUT_MS = 10_000;

interface MockLumabinApi extends LumabinAPI {
  __spies: {
    upload: ReturnType<typeof vi.fn>;
    persistClipboardFile: ReturnType<typeof vi.fn>;
    persistClipboardImageFromSystem: ReturnType<typeof vi.fn>;
    saveProfile: ReturnType<typeof vi.fn>;
    saveSettings: ReturnType<typeof vi.fn>;
    head: ReturnType<typeof vi.fn>;
    preview: ReturnType<typeof vi.fn>;
    getUploadJob: ReturnType<typeof vi.fn>;
    move: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    createPresignedGet: ReturnType<typeof vi.fn>;
  };
}

const nowIso = (): string => new Date('2026-03-03T12:00:00.000Z').toISOString();
const waitForKindAllFilter = async (): Promise<HTMLElement> => {
  const filterBar = await screen.findByLabelText('Filters');
  const allButton = within(filterBar).getByRole('button', { name: /^All/i });
  return allButton;
};

const basenameFromPath = (value: string): string => {
  const normalized = value.replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);
  return segments.at(-1) ?? value;
};

const toImageAsset = (key: string): AssetItem => ({
  key,
  size: 1024,
  contentType: 'image/png',
  lastModified: nowIso(),
  etag: `"etag-${key}"`,
});

const initialSettings: AppSettings = {
  appearance: 'dark',
  defaultConflictPolicy: 'rename',
  presignedUrlTTLSeconds: 900,
  uploadOptimizeImagesBeforeUpload: false,
  publicBaseUrls: {},
};

const createMockLumabinApi = (): MockLumabinApi => {
  const profiles = new Map<string, ProfileSummary>();
  const assetsByProfile = new Map<string, AssetItem[]>();
  const savedViews = new Map<string, SavedView>();
  const uploadJobs = new Map<string, UploadJobStatus>();
  let settings = { ...initialSettings };
  let profileSequence = 1;
  let uploadSequence = 1;

  const listProfiles = vi.fn(async () => [...profiles.values()]);
  const saveProfile = vi.fn(async (input: Parameters<LumabinAPI['profiles']['save']>[0]) => {
    const id = input.id ?? `profile-${profileSequence}`;
    if (!input.id) {
      profileSequence += 1;
    }
    const profile: ProfileSummary = {
      id,
      name: input.name.trim(),
      provider: input.provider,
      endpoint: input.endpoint.trim(),
      region: input.region.trim(),
      bucket: input.bucket.trim(),
      hasSecret: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    profiles.set(id, profile);
    if (!assetsByProfile.has(id)) {
      assetsByProfile.set(id, [toImageAsset('photos/sample-1.png')]);
    }
    return profile;
  });
  const testConnection = vi.fn(async () => ({
    ok: true,
    message: 'Connection succeeded (0ms)',
    checkedAt: nowIso(),
  }));
  const deleteProfile = vi.fn(async (profileId: string) => {
    profiles.delete(profileId);
    assetsByProfile.delete(profileId);
  });

  const listAssets = vi.fn(async (input: Parameters<LumabinAPI['assets']['list']>[0]) => {
    const items = [...(assetsByProfile.get(input.profileId) ?? [])];
    const prefix = (input.prefix ?? '').trim();
    const filteredItems = prefix ? items.filter((item) => item.key.startsWith(prefix)) : items;
    const result: ListAssetsResult = {
      items: filteredItems,
      prefixes: [],
      nextContinuationToken: undefined,
    };
    return result;
  });

  const headAsset = vi.fn(async (input: Parameters<LumabinAPI['assets']['head']>[0]) => {
    const item = (assetsByProfile.get(input.profileId) ?? []).find((candidate) => candidate.key === input.key);
    const metadata: AssetMetadata = {
      key: input.key,
      size: item?.size ?? 0,
      contentType: item?.contentType ?? 'application/octet-stream',
      lastModified: item?.lastModified ?? nowIso(),
      etag: item?.etag ?? '',
      metadata: {
        width: '1024',
        height: '768',
      },
    };
    return metadata;
  });

  const previewAsset = vi.fn(async (input: Parameters<LumabinAPI['assets']['preview']>[0]) => {
    const item = (assetsByProfile.get(input.profileId) ?? []).find((candidate) => candidate.key === input.key);
    const preview: AssetPreview = {
      key: input.key,
      kind: item?.contentType.startsWith('image/') ? 'image' : 'other',
      contentType: item?.contentType ?? 'application/octet-stream',
      byteLength: 128,
      truncated: false,
      dataBase64: TINY_PNG_BASE64,
    };
    return preview;
  });

  const checkUploadConflicts = vi.fn(async () => {
    const result: CheckUploadConflictsResult = {
      conflicts: [],
      totalConflicts: 0,
    };
    return result;
  });

  const upload = vi.fn(async (input: StartUploadInput) => {
    const currentItems = assetsByProfile.get(input.profileId) ?? [];
    const normalizedPrefix = input.destinationPrefix ?? '';
    for (const source of input.sources) {
      const fileName = basenameFromPath(source.path);
      const nextKey = `${normalizedPrefix}${fileName}`;
      currentItems.unshift({
        ...toImageAsset(nextKey),
        size: source.size,
      });
    }
    assetsByProfile.set(input.profileId, currentItems);

    const jobId = `job-${uploadSequence}`;
    uploadSequence += 1;
    uploadJobs.set(jobId, {
      id: jobId,
      profileId: input.profileId,
      status: 'done',
      destinationPrefix: input.destinationPrefix,
      conflictPolicy: input.conflictPolicy,
      totalItems: input.sources.length,
      completedItems: input.sources.length,
      failedItems: 0,
      failedSources: [],
      updatedAt: nowIso(),
    });
    return jobId;
  });

  const getUploadJob = vi.fn(async (jobId: string) => {
    const job = uploadJobs.get(jobId);
    if (!job) {
      throw new Error(`Upload job not found: ${jobId}`);
    }
    return job;
  });

  const cancelUpload = vi.fn(async (jobId: string) => {
    const existing = uploadJobs.get(jobId);
    if (!existing) {
      throw new Error(`Upload job not found: ${jobId}`);
    }
    uploadJobs.set(jobId, {
      ...existing,
      status: 'canceled',
      updatedAt: nowIso(),
    });
  });

  const renameAsset = vi.fn(async (input: Parameters<LumabinAPI['assets']['rename']>[0]) => {
    const items = assetsByProfile.get(input.profileId) ?? [];
    const target = items.find((item) => item.key === input.fromKey);
    if (target) {
      target.key = input.toKey;
      target.etag = `"etag-${input.toKey}"`;
    }
    return {
      ok: true,
      fromKey: input.fromKey,
      toKey: input.toKey,
    };
  });

  const moveAsset = vi.fn(async (input: Parameters<LumabinAPI['assets']['move']>[0]) => {
    const items = assetsByProfile.get(input.profileId) ?? [];
    const target = items.find((item) => item.key === input.fromKey);
    if (target) {
      target.key = input.toKey;
      target.etag = `"etag-${input.toKey}"`;
    }
    return {
      ok: true,
      fromKey: input.fromKey,
      toKey: input.toKey,
    };
  });

  const removeAssets = vi.fn(async (input: Parameters<LumabinAPI['assets']['remove']>[0]) => {
    const items = assetsByProfile.get(input.profileId) ?? [];
    const toDelete = new Set(input.keys);
    const remaining = items.filter((item) => !toDelete.has(item.key));
    assetsByProfile.set(input.profileId, remaining);
    const result: DeleteResult = {
      deleted: input.keys,
      skipped: [],
    };
    return result;
  });

  const searchQuery = vi.fn(async (input: Parameters<LumabinAPI['search']['query']>[0]) => {
    const lowerQuery = input.query.toLowerCase();
    const items = (assetsByProfile.get(input.profileId) ?? []).filter((item) =>
      item.key.toLowerCase().includes(lowerQuery),
    );
    const result: SearchResult = {
      items,
      total: items.length,
    };
    return result;
  });

  const saveView = vi.fn(async (input: Parameters<LumabinAPI['search']['saveView']>[0]) => {
    const id = input.id ?? `view-${savedViews.size + 1}`;
    const nextView: SavedView = {
      id,
      name: input.name,
      query: input.query,
      pinned: Boolean(input.pinned),
      updatedAt: nowIso(),
    };
    savedViews.set(id, nextView);
    return nextView;
  });

  const listViews = vi.fn(async () => [...savedViews.values()]);
  const deleteView = vi.fn(async (viewId: string) => {
    savedViews.delete(viewId);
  });

  const createPresignedGet = vi.fn(async (input: Parameters<LumabinAPI['sharing']['createPresignedGet']>[0]) => ({
    url: `https://example.invalid/get/${encodeURIComponent(input.key)}`,
    expiresAt: nowIso(),
  }));
  const createPresignedPut = vi.fn(async (input: Parameters<LumabinAPI['sharing']['createPresignedPut']>[0]) => ({
    url: `https://example.invalid/put/${encodeURIComponent(input.key)}`,
    expiresAt: nowIso(),
  }));

  const getSettings = vi.fn(async () => settings);
  const saveSettings = vi.fn(async (input: Parameters<LumabinAPI['settings']['save']>[0]) => {
    settings = {
      ...settings,
      ...input,
    };
    return settings;
  });

  const getMetrics = vi.fn(async () => ({
    collectedAt: nowIso(),
    cache: {
      previewHit: 3,
      previewMiss: 1,
      previewInFlightHit: 0,
      headHit: 2,
      headMiss: 1,
      headInFlightHit: 0,
      searchSnapshotHit: 1,
      searchSnapshotMiss: 1,
    },
    storage: {
      listCalls: 1,
      headCalls: 1,
      getCalls: 1,
      putCalls: 0,
      existsChecks: 0,
      testConnectionCalls: 0,
      failures: 0,
      bytesDownloaded: 1024,
      bytesUploaded: 0,
    },
  }));
  const resetMetrics = vi.fn(async () => getMetrics());
  const persistClipboardFile = vi.fn(
    async (input: Parameters<LumabinAPI['files']['persistClipboardFile']>[0]) => {
      const normalizedName = input.fileName?.trim() || 'clipboard.bin';
      return `/tmp/${normalizedName}`;
    },
  );
  const persistClipboardImageFromSystem = vi.fn(async () => ({
    path: '/tmp/clipboard-system.png',
    size: 1024,
    fileName: 'clipboard.png',
    mimeType: 'image/png',
  }));

  const initialProfile: ProfileSummary = {
    id: 'profile-initial',
    name: 'Smoke Profile',
    provider: 'r2',
    endpoint: 'https://demoaccount.r2.cloudflarestorage.com',
    region: 'auto',
    bucket: 'smoke-bucket',
    hasSecret: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  profiles.set(initialProfile.id, initialProfile);
  assetsByProfile.set(initialProfile.id, [toImageAsset('photos/sample-1.png')]);

  const api: MockLumabinApi = {
    runtime: {
      getInfo: vi.fn(async () => ({ isE2E: false })),
    },
    files: {
      getPathForFile: (file: File) => (file.name ? `/tmp/${file.name}` : ''),
      persistClipboardFile,
      persistClipboardImageFromSystem,
    },
    profiles: {
      list: listProfiles,
      save: saveProfile,
      testConnection,
      delete: deleteProfile,
    },
    assets: {
      list: listAssets,
      head: headAsset,
      preview: previewAsset,
      checkUploadConflicts,
      upload,
      getUploadJob,
      cancelUpload,
      rename: renameAsset,
      move: moveAsset,
      remove: removeAssets,
    },
    search: {
      query: searchQuery,
      saveView,
      listViews,
      deleteView,
    },
    sharing: {
      createPresignedGet,
      createPresignedPut,
    },
    settings: {
      get: getSettings,
      save: saveSettings,
    },
    dev: {
      getMetrics,
      resetMetrics,
    },
    __spies: {
      upload,
      persistClipboardFile,
      persistClipboardImageFromSystem,
      saveProfile,
      saveSettings,
      head: headAsset,
      preview: previewAsset,
      getUploadJob,
      move: moveAsset,
      remove: removeAssets,
      createPresignedGet,
    },
  };

  return api;
};

describe('App UI smoke', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('covers gallery preview and upload start/end flows', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    window.lumabin = api;

    const { container } = render(<App />);

    expect(await screen.findByPlaceholderText('Search in this bucket… (Cmd/Ctrl+K)')).toBeTruthy();
    expect(await waitForKindAllFilter()).toBeTruthy();

    const firstCardButton = await waitFor(() => {
      const candidate = container.querySelector<HTMLButtonElement>('.gallery-card');
      expect(candidate).toBeTruthy();
      return candidate;
    });
    if (!firstCardButton) {
      throw new Error('Expected first gallery card button');
    }
    await user.click(firstCardButton);

    await waitFor(() => {
      expect(api.__spies.preview).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'photos/sample-1.png',
        }),
      );
    });
    const previewDialog = await screen.findByRole('dialog', { name: 'Asset Preview' });
    expect(previewDialog).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Close preview' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Asset Preview' })).toBeNull();
    });

    const hiddenFileInput = container.querySelector<HTMLInputElement>('input.hidden-file-input[type="file"]');
    expect(hiddenFileInput).toBeTruthy();
    if (!hiddenFileInput) {
      throw new Error('Expected hidden file input');
    }
    const uploadFile = new File(['ui smoke upload'], 'uploaded-smoke.png', { type: 'image/png' });
    await user.upload(hiddenFileInput, uploadFile);

    await waitFor(() => {
      expect(api.__spies.upload).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(api.__spies.getUploadJob).toHaveBeenCalled();
    });
    expect(await waitForKindAllFilter()).toBeTruthy();
  }, APP_UI_INTEGRATION_TIMEOUT_MS);

  it('shows a completed upload toast after upload completion', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    window.lumabin = api;

    const { container } = render(<App />);
    expect(await waitForKindAllFilter()).toBeTruthy();

    const hiddenFileInput = container.querySelector<HTMLInputElement>('input.hidden-file-input[type="file"]');
    expect(hiddenFileInput).toBeTruthy();
    if (!hiddenFileInput) {
      throw new Error('Expected hidden file input');
    }

    const uploadFile = new File(['ui smoke upload'], 'uploaded-auto-dismiss.png', {
      type: 'image/png',
    });
    await user.upload(hiddenFileInput, uploadFile);

    await waitFor(() => {
      expect(container.querySelector('.upload-toast')).toBeTruthy();
    });
  });

  it('persists unresolved upload files before queueing upload', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    api.files.getPathForFile = () => '';
    window.lumabin = api;

    const { container } = render(<App />);
    expect(await waitForKindAllFilter()).toBeTruthy();

    const pathlessImage = new File(['clipboard-image'], 'clipboard.png', { type: 'image/png' });
    Object.defineProperty(pathlessImage, 'arrayBuffer', {
      value: async () => new Uint8Array([1, 2, 3, 4]).buffer,
      configurable: true,
    });
    const hiddenFileInput = container.querySelector<HTMLInputElement>('input.hidden-file-input[type="file"]');
    expect(hiddenFileInput).toBeTruthy();
    if (!hiddenFileInput) {
      throw new Error('Expected hidden file input');
    }

    await user.upload(hiddenFileInput, pathlessImage);

    await waitFor(() => {
      expect(api.__spies.persistClipboardFile).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(api.__spies.upload).toHaveBeenCalledTimes(1);
    });
  });

  it('covers retry recovery paths for preview/metadata and upload error feedback', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    window.lumabin = api;

    const defaultPreviewImplementation = api.__spies.preview.getMockImplementation();
    let hasInjectedPreviewFailure = false;
    api.__spies.preview.mockImplementation(async (input: Parameters<LumabinAPI['assets']['preview']>[0]) => {
      const isQuickPreviewRequest = (input.maxBytes ?? 0) >= 5 * 1024 * 1024;
      if (!hasInjectedPreviewFailure && isQuickPreviewRequest) {
        hasInjectedPreviewFailure = true;
        throw new Error('preview temporary failure');
      }
      if (!defaultPreviewImplementation) {
        throw new Error('Missing preview mock implementation');
      }
      return defaultPreviewImplementation(input);
    });
    api.__spies.head.mockRejectedValueOnce(new Error('metadata temporary failure'));

    const { container } = render(<App />);
    expect(await waitForKindAllFilter()).toBeTruthy();

    const firstCardButton = await waitFor(() => {
      const candidate = container.querySelector<HTMLButtonElement>('.gallery-card');
      expect(candidate).toBeTruthy();
      return candidate;
    });
    if (!firstCardButton) {
      throw new Error('Expected first gallery card button');
    }
    await user.click(firstCardButton);

    const previewDialog = await screen.findByRole('dialog', { name: 'Asset Preview' });
    expect(previewDialog).toBeTruthy();
    expect(await within(previewDialog).findByText(/Preview failed:/i)).toBeTruthy();
    expect(await within(previewDialog).findByText('metadata temporary failure')).toBeTruthy();
    expect(await within(previewDialog).findByRole('button', { name: 'Retry preview' })).toBeTruthy();
    expect(await within(previewDialog).findByRole('button', { name: 'Retry metadata' })).toBeTruthy();

    await user.click(within(previewDialog).getByRole('button', { name: 'Retry preview' }));
    await waitFor(() => {
      const quickPreviewCallCount = api.__spies.preview.mock.calls.filter(([input]) => {
        const params = input as Parameters<LumabinAPI['assets']['preview']>[0];
        return params.maxBytes >= 5 * 1024 * 1024;
      }).length;
      expect(quickPreviewCallCount).toBeGreaterThanOrEqual(2);
    });

    await user.click(within(previewDialog).getByRole('button', { name: 'Retry metadata' }));
    await waitFor(() => {
      expect(api.__spies.head).toHaveBeenCalledTimes(2);
    });
    expect(await within(previewDialog).findByText('Reported Size')).toBeTruthy();

    const failedJob: UploadJobStatus = {
      id: 'job-failed-enoent',
      profileId: 'profile-initial',
      status: 'failed',
      destinationPrefix: '',
      conflictPolicy: 'rename',
      totalItems: 1,
      completedItems: 0,
      failedItems: 1,
      failedSources: [
        {
          path: '/tmp/missing.png',
          size: 32,
        },
      ],
      lastError: 'ENOENT: no such file or directory, open missing.png',
      updatedAt: nowIso(),
    };
    api.__spies.upload.mockResolvedValueOnce(failedJob.id);
    api.__spies.getUploadJob.mockResolvedValueOnce(failedJob);

    const hiddenFileInput = container.querySelector<HTMLInputElement>('input.hidden-file-input[type="file"]');
    expect(hiddenFileInput).toBeTruthy();
    if (!hiddenFileInput) {
      throw new Error('Expected hidden file input');
    }
    const uploadFile = new File(['missing asset'], 'missing.png', { type: 'image/png' });
    await user.upload(hiddenFileInput, uploadFile);

    expect(await screen.findByText(/Source file is missing on disk\./i)).toBeTruthy();
  }, APP_UI_INTEGRATION_TIMEOUT_MS);

  it('covers no-matches empty state recovery actions', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    window.lumabin = api;

    render(<App />);

    const searchInput = await screen.findByPlaceholderText('Search in this bucket… (Cmd/Ctrl+K)');
    await user.type(searchInput, 'not-found-query{enter}');

    const emptyState = await screen.findByRole('region', { name: 'No matches found' });

    await user.click(within(emptyState).getByRole('button', { name: 'Clear search' }));

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'No matches found' })).toBeNull();
    });
    expect(await waitForKindAllFilter()).toBeTruthy();
  });

  it('covers workspace settings and sharing flows', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    window.lumabin = api;

    const { container } = render(<App />);

    expect(await waitForKindAllFilter()).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Open workspace settings' }));
    const settingsDialog = await screen.findByRole('dialog', { name: 'Workspace Settings' });
    expect(settingsDialog).toBeTruthy();
    expect(within(settingsDialog).getByRole('tab', { name: /Workspace defaults/i })).toBeTruthy();
    expect(within(settingsDialog).getByRole('tab', { name: /Browser session/i })).toBeTruthy();
    expect(within(settingsDialog).getByRole('tab', { name: /Connection profile/i })).toBeTruthy();

    await user.click(within(settingsDialog).getByRole('tab', { name: /Workspace defaults/i }));
    const optimizeUploadsCheckbox = within(settingsDialog).getByRole('checkbox', {
      name: /Optimize image uploads/i,
    });
    expect(optimizeUploadsCheckbox).toBeTruthy();
    await user.click(optimizeUploadsCheckbox);

    const saveChangesButton = within(settingsDialog).getByRole('button', { name: 'Save changes' });
    await user.click(saveChangesButton);
    await waitFor(() => {
      expect(api.__spies.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          uploadOptimizeImagesBeforeUpload: true,
        }),
      );
    });

    await user.click(within(settingsDialog).getByRole('tab', { name: /Connection profile/i }));
    const publicUrlBaseInput = within(settingsDialog).getByLabelText('Public URL base');
    await user.clear(publicUrlBaseInput);
    await user.type(publicUrlBaseInput, 'https://cdn.example.com/assets/');
    await user.click(within(settingsDialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => {
      expect(api.__spies.saveSettings).toHaveBeenLastCalledWith(
        expect.objectContaining({
          publicBaseUrls: expect.objectContaining({
            'profile-initial': 'https://cdn.example.com/assets/',
          }),
        }),
      );
    });

    await user.click(within(settingsDialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Workspace Settings' })).toBeNull();
    });

    const firstCardButton = await waitFor(() => {
      const candidate = container.querySelector<HTMLButtonElement>('.gallery-card');
      expect(candidate).toBeTruthy();
      return candidate;
    });
    if (!firstCardButton) {
      throw new Error('Expected first gallery card button');
    }
    await user.click(firstCardButton);

    const previewDialog = await screen.findByRole('dialog', { name: 'Asset Preview' });
    expect(previewDialog).toBeTruthy();

    const copyPublicUrlButton = within(previewDialog).getByRole('button', { name: 'Copy public URL' });
    await user.click(copyPublicUrlButton);
    expect(await within(previewDialog).findByRole('button', { name: 'Copied!' })).toBeTruthy();

    const shareButton = within(previewDialog).getByRole('button', { name: 'Share' });
    await user.click(shareButton);

    await waitFor(() => {
      expect(api.__spies.createPresignedGet).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'photos/sample-1.png',
        }),
      );
    });
    await waitFor(() => {
      expect(shareButton.textContent).toContain('Copied!');
    });
    expect(within(previewDialog).getByText('Generated URLs')).toBeTruthy();
  });

  it('discards unsaved workspace settings when closing the modal', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    window.lumabin = api;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<App />);
    await waitForKindAllFilter();

    await user.click(screen.getByRole('button', { name: 'Open workspace settings' }));
    const settingsDialog = await screen.findByRole('dialog', { name: 'Workspace Settings' });
    await user.click(within(settingsDialog).getByRole('tab', { name: /Workspace defaults/i }));
    const appearanceSelect = within(settingsDialog).getByLabelText('Appearance') as HTMLSelectElement;
    expect(appearanceSelect.value).toBe('dark');
    await user.selectOptions(appearanceSelect, 'light');

    await user.click(within(settingsDialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Discard unsaved workspace settings?');
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Workspace Settings' })).toBeNull();
    });

    await user.click(screen.getByRole('button', { name: 'Open workspace settings' }));
    const reopenedDialog = await screen.findByRole('dialog', { name: 'Workspace Settings' });
    await user.click(within(reopenedDialog).getByRole('tab', { name: /Workspace defaults/i }));
    const reopenedAppearanceSelect = within(reopenedDialog).getByLabelText('Appearance') as HTMLSelectElement;
    expect(reopenedAppearanceSelect.value).toBe('dark');

    confirmSpy.mockRestore();
  });

  it('covers selection mode bulk action dialogs', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    window.lumabin = api;

    expect(render(<App />)).toBeTruthy();
    expect(await waitForKindAllFilter()).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Select' }));
    const selectionActions = screen.getByRole('toolbar', { name: 'Selection actions' });
    await user.click(within(selectionActions).getByRole('button', { name: 'All' }));

    await user.click(within(selectionActions).getByRole('button', { name: 'Move…' }));
    const bulkMoveDialog = await screen.findByRole('dialog', { name: 'Move selected assets' });
    expect(bulkMoveDialog).toBeTruthy();

    const destinationPrefixInput = within(bulkMoveDialog).getByPlaceholderText('blog/2026/');
    await user.clear(destinationPrefixInput);
    await user.type(destinationPrefixInput, 'archive/');
    await user.click(within(bulkMoveDialog).getByRole('button', { name: 'Move 1 items' }));

    await waitFor(() => {
      expect(api.__spies.move).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole('button', { name: 'Select' }));
    const latestSelectionActions = await screen.findByRole('toolbar', { name: 'Selection actions' });
    await user.click(within(latestSelectionActions).getByRole('button', { name: 'All' }));
    await user.click(within(latestSelectionActions).getByRole('button', { name: 'Delete…' }));
    const bulkDeleteDialog = await screen.findByRole('dialog', { name: 'Delete selected assets' });
    expect(bulkDeleteDialog).toBeTruthy();
    await user.click(within(bulkDeleteDialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Delete selected assets' })).toBeNull();
    });
  });

  it('covers keyboard shortcut help open/close flow', async () => {
    const api = createMockLumabinApi();
    window.lumabin = api;

    expect(render(<App />)).toBeTruthy();
    expect(await waitForKindAllFilter()).toBeTruthy();

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(await screen.findByRole('dialog', { name: 'Keyboard shortcuts' })).toBeTruthy();

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).toBeNull();
    });
  });

  it('supports Enter/Space keyboard flows for preview and selection mode', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    window.lumabin = api;

    const { container } = render(<App />);
    expect(await waitForKindAllFilter()).toBeTruthy();

    const firstCardButton = await waitFor(() => {
      const candidate = container.querySelector<HTMLButtonElement>('.gallery-card');
      expect(candidate).toBeTruthy();
      return candidate;
    });
    if (!firstCardButton) {
      throw new Error('Expected first gallery card button');
    }

    await user.click(firstCardButton);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(await screen.findByRole('dialog', { name: 'Asset Preview' })).toBeTruthy();

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Asset Preview' })).toBeNull();
    });
    await waitFor(() => {
      const activeCard = container.querySelector<HTMLButtonElement>('.gallery-card.gallery-card--selected');
      expect(activeCard).toBeTruthy();
      expect(activeCard?.tabIndex).toBe(0);
    });

    await user.click(screen.getByRole('button', { name: 'Select' }));
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    const selectionActions = await screen.findByRole('toolbar', { name: 'Selection actions' });
    expect(within(selectionActions).getByRole('button', { name: 'Move…' })).toBeTruthy();
  });

  it('covers delete queue undo and immediate execution flows', async () => {
    const user = userEvent.setup();
    const api = createMockLumabinApi();
    window.lumabin = api;

    expect(render(<App />)).toBeTruthy();
    expect(await waitForKindAllFilter()).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Select' }));
    let selectionActions = screen.getByRole('toolbar', { name: 'Selection actions' });
    await user.click(within(selectionActions).getByRole('button', { name: 'All' }));
    await user.click(within(selectionActions).getByRole('button', { name: 'Delete…' }));

    let bulkDeleteDialog = await screen.findByRole('dialog', { name: 'Delete selected assets' });
    await user.click(within(bulkDeleteDialog).getByRole('button', { name: 'Delete 1 items' }));

    expect(await screen.findByText('1 item pending delete')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => {
      expect(screen.queryByText('1 item pending delete')).toBeNull();
    });
    expect(api.__spies.remove).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Select' }));
    selectionActions = await screen.findByRole('toolbar', { name: 'Selection actions' });
    await user.click(within(selectionActions).getByRole('button', { name: 'All' }));
    await user.click(within(selectionActions).getByRole('button', { name: 'Delete…' }));

    bulkDeleteDialog = await screen.findByRole('dialog', { name: 'Delete selected assets' });
    await user.click(within(bulkDeleteDialog).getByRole('button', { name: 'Delete 1 items' }));
    expect(await screen.findByText('1 item pending delete')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Delete now' }));

    await waitFor(() => {
      expect(api.__spies.remove).toHaveBeenCalledWith(
        expect.objectContaining({
          profileId: 'profile-initial',
          keys: ['photos/sample-1.png'],
        }),
      );
    });
  });
});
