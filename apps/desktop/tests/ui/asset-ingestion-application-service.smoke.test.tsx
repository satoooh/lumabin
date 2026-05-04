import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  createAssetIngestionApplicationService,
  type AssetIngestionApplicationServiceDependencies,
} from '../../src/main/application/contexts/asset-ingestion/application-service';
import type {
  CheckUploadConflictsResult,
  StartUploadInput,
  UploadJobStatus,
  UploadSource,
} from '../../src/shared/ipc';

const profile = {
  id: 'profile-1',
  name: 'Production',
  provider: 'r2' as const,
  endpoint: 'https://r2.example',
  region: 'auto',
  bucket: 'assets',
  createdAt: '2026-05-03T00:00:00.000Z',
  updatedAt: '2026-05-03T00:00:00.000Z',
};

const secret = {
  accessKeyId: 'access-key',
  secretAccessKey: 'secret-key',
};

const source: UploadSource = {
  path: '/tmp/source.png',
  relativePath: 'source.png',
  size: 128,
};

const createJob = (input: StartUploadInput): UploadJobStatus => ({
  id: 'upload-1',
  profileId: input.profileId,
  status: 'queued',
  destinationPrefix: input.destinationPrefix,
  conflictPolicy: input.conflictPolicy,
  totalItems: input.sources.length,
  completedItems: 0,
  failedItems: 0,
  failedSources: [],
  updatedAt: '2026-05-03T00:00:00.000Z',
});

const createDependencies = (
  overrides: Partial<AssetIngestionApplicationServiceDependencies> = {},
): AssetIngestionApplicationServiceDependencies => ({
  abortUploadJob: vi.fn(),
  assertProfileExists: vi.fn(() => profile),
  checkStorageUploadConflicts: vi.fn(async () => ({
    conflicts: [],
    totalConflicts: 0,
  })),
  checkUploadConflictsOverride: vi.fn(() => undefined),
  createUploadJob: vi.fn(createJob),
  expandUploadSources: vi.fn(async (sources) => sources),
  getProfileSecretOrThrow: vi.fn(() => secret),
  getUploadJob: vi.fn(),
  markUploadJobFailed: vi.fn(),
  normalizeClipboardFileName: vi.fn((fileName) => fileName ?? 'clipboard.bin'),
  persistClipboardBytes: vi.fn(async () => '/tmp/clipboard.bin'),
  readSystemClipboardPng: vi.fn(() => null),
  runUploadJob: vi.fn(async () => undefined),
  saveUploadJob: vi.fn(),
  saveUploadJobStatus: vi.fn(),
  startUploadOverride: vi.fn(() => undefined),
  toClipboardBytes: vi.fn((bytes) => bytes ?? null),
  ...overrides,
});

describe('asset ingestion application service', () => {
  it('uses the runtime conflict override before profile or storage access', async () => {
    const overrideResult: CheckUploadConflictsResult = {
      conflicts: [
        {
          sourcePath: source.path,
          fileName: 'source.png',
          key: 'uploads/source.png',
        },
      ],
      totalConflicts: 1,
    };
    const dependencies = createDependencies({
      checkUploadConflictsOverride: vi.fn(() => overrideResult),
    });
    const service = createAssetIngestionApplicationService(dependencies);

    await expect(
      service.checkUploadConflicts({
        profileId: 'runtime-override',
        destinationPrefix: 'uploads/',
        sources: [source],
      }),
    ).resolves.toBe(overrideResult);

    expect(dependencies.assertProfileExists).not.toHaveBeenCalled();
    expect(dependencies.expandUploadSources).not.toHaveBeenCalled();
    expect(dependencies.checkStorageUploadConflicts).not.toHaveBeenCalled();
  });

  it('uses the runtime upload override before profile or storage access', async () => {
    const dependencies = createDependencies({
      startUploadOverride: vi.fn(() => 'runtime-upload-1'),
    });
    const service = createAssetIngestionApplicationService(dependencies);

    await expect(
      service.startUpload({
        profileId: 'runtime-override',
        destinationPrefix: 'uploads/',
        sources: [source],
      }),
    ).resolves.toBe('runtime-upload-1');

    expect(dependencies.assertProfileExists).not.toHaveBeenCalled();
    expect(dependencies.expandUploadSources).not.toHaveBeenCalled();
    expect(dependencies.createUploadJob).not.toHaveBeenCalled();
    expect(dependencies.runUploadJob).not.toHaveBeenCalled();
  });

  it('expands sources and starts a storage-backed upload job', async () => {
    const expandedSource: UploadSource = {
      path: '/tmp/folder/source.png',
      relativePath: 'folder/source.png',
      size: 128,
    };
    const dependencies = createDependencies({
      expandUploadSources: vi.fn(async () => [expandedSource]),
    });
    const service = createAssetIngestionApplicationService(dependencies);

    await expect(
      service.startUpload({
        profileId: 'profile-1',
        destinationPrefix: 'uploads/',
        sources: [source],
      }),
    ).resolves.toBe('upload-1');

    const normalizedInput = {
      profileId: 'profile-1',
      destinationPrefix: 'uploads/',
      sources: [expandedSource],
    };
    expect(dependencies.assertProfileExists).toHaveBeenCalledWith('profile-1');
    expect(dependencies.expandUploadSources).toHaveBeenCalledWith([source]);
    expect(dependencies.createUploadJob).toHaveBeenCalledWith(normalizedInput);
    expect(dependencies.saveUploadJob).toHaveBeenCalledWith(createJob(normalizedInput));
    expect(dependencies.runUploadJob).toHaveBeenCalledWith('upload-1', normalizedInput);
  });

  it('keeps runtime-specific upload names out of the application service', () => {
    const sourceText = readFileSync(
      resolve(
        process.cwd(),
        'src/main/application/contexts/asset-ingestion/application-service.ts',
      ),
      'utf8',
    );

    expect(sourceText).not.toContain('E2EFixture');
    expect(sourceText).not.toContain('Fixture');
    expect(sourceText).not.toContain('fixture');
  });
});
