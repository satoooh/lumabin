import { afterEach, describe, expect, it } from 'vitest';
import {
  getDevMetricsSnapshot,
  resetDevMetrics,
} from '../../src/main/dev-metrics';
import {
  hasE2EFixtureAsset,
  listE2EFixtureAssets,
  previewE2EFixtureAsset,
  queryE2EFixtureAssets,
  resolveE2EFixtureAssetCount,
  runE2EFixtureUploadJob,
  seedE2EFixtureAssets,
} from '../../src/main/adapters/e2e-fixture-storage-adapter';
import {
  normalizeDestinationPrefix,
  sourceRelativePathOrFileName,
  splitFileName,
} from '../../src/main/adapters/upload-planning-adapter';
import type { UploadJobStatus } from '../../src/shared/ipc';

const normalizePrefix = (value: string): string => value.replace(/^\/+/, '');

describe('e2e fixture storage adapter', () => {
  afterEach(() => {
    seedE2EFixtureAssets();
    resetDevMetrics();
  });

  it('normalizes dense fixture asset count from environment input', () => {
    expect(resolveE2EFixtureAssetCount(undefined)).toBe(3);
    expect(resolveE2EFixtureAssetCount('not-a-number')).toBe(3);
    expect(resolveE2EFixtureAssetCount('1')).toBe(3);
    expect(resolveE2EFixtureAssetCount('2500')).toBe(2000);
    expect(resolveE2EFixtureAssetCount('128')).toBe(128);
  });

  it('can seed a dense local fixture bucket without changing default assets', () => {
    seedE2EFixtureAssets({ assetCount: 12 });

    const result = listE2EFixtureAssets(
      {
        limit: 20,
        profileId: 'e2e-fixture-profile',
      },
      normalizePrefix,
    );

    expect(result.items).toHaveLength(12);
    expect(
      result.items.some((item) => item.key === 'photos/2026/05/editorial-workspace.svg'),
    ).toBe(true);
    expect(
      result.items.some((item) =>
        item.key.startsWith('photos/2026/03/dense/lumabin-fixture-'),
      ),
    ).toBe(true);
  });

  it('keeps dense fixture assets queryable for local performance walkthroughs', () => {
    seedE2EFixtureAssets({ assetCount: 20 });

    const result = queryE2EFixtureAssets({
      limit: 50,
      profileId: 'e2e-fixture-profile',
      query: 'dense',
    });

    expect(result.total).toBe(17);
    expect(result.items).toHaveLength(17);
  });

  it('records dev metrics for packaged dense fixture walkthroughs', () => {
    resetDevMetrics();
    seedE2EFixtureAssets({ assetCount: 5 });

    const result = listE2EFixtureAssets(
      {
        limit: 5,
        profileId: 'e2e-fixture-profile',
      },
      normalizePrefix,
    );
    previewE2EFixtureAsset({
      key: result.items[0].key,
      profileId: 'e2e-fixture-profile',
    });

    const metrics = getDevMetricsSnapshot();
    expect(metrics.storage.listCalls).toBe(1);
    expect(metrics.storage.getCalls).toBe(1);
    expect(metrics.storage.bytesDownloaded).toBeGreaterThan(0);
    expect(metrics.storage.failures).toBe(0);
  });

  it('keeps fixture uploads in the local bucket with rename conflict handling', async () => {
    let job: UploadJobStatus = {
      id: 'fixture-upload-1',
      profileId: 'e2e-fixture-profile',
      status: 'queued',
      destinationPrefix: 'photos/2026/05',
      conflictPolicy: 'rename',
      totalItems: 1,
      completedItems: 0,
      failedItems: 0,
      failedSources: [],
      updatedAt: '2026-05-05T00:00:00.000Z',
    };

    await runE2EFixtureUploadJob(
      job.id,
      {
        profileId: 'e2e-fixture-profile',
        destinationPrefix: 'photos/2026/05',
        conflictPolicy: 'rename',
        sources: [
          {
            path: '/tmp/editorial-workspace.svg',
            size: 12_345,
          },
        ],
      },
      {
        createEtagSuffix: () => 'test',
        getDefaultConflictPolicy: () => 'rename',
        inferContentTypeFromKey: () => 'image/svg+xml',
        normalizeDestinationPrefix,
        nowIso: () => '2026-05-05T00:00:01.000Z',
        sourceRelativePathOrFileName,
        splitFileName,
        updateUploadJob: (_jobId, updater) => {
          job = updater(job);
        },
      },
    );

    expect(hasE2EFixtureAsset('photos/2026/05/editorial-workspace.svg')).toBe(true);
    expect(hasE2EFixtureAsset('photos/2026/05/editorial-workspace-1.svg')).toBe(true);
    expect(job.status).toBe('done');
    expect(job.completedItems).toBe(1);
  });
});
