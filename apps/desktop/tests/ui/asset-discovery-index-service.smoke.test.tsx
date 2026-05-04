import { describe, expect, it, vi } from 'vitest';
import { createSearchIndexBootstrapper } from '../../src/main/application/contexts/asset-discovery/index-bootstrapper';

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

const item = (key: string) => ({
  key,
  contentType: 'image/png',
  etag: `etag-${key}`,
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 100,
});

describe('asset discovery index service', () => {
  it('bootstraps the search index across storage pages', async () => {
    const listStorageObjects = vi
      .fn()
      .mockResolvedValueOnce({
        items: [item('photos/a.png')],
        prefixes: [],
        nextContinuationToken: 'page-2',
      })
      .mockResolvedValueOnce({
        items: [item('photos/b.png')],
        prefixes: [],
      });
    const searchReadModelWriter = { upsertAssets: vi.fn() };
    const bootstrap = createSearchIndexBootstrapper({
      listStorageObjects,
      pageSize: 2,
      searchReadModelWriter,
    });

    await bootstrap(profile, secret);

    expect(listStorageObjects).toHaveBeenNthCalledWith(1, profile, secret, {
      prefix: '',
      continuationToken: undefined,
      limit: 2,
      recursive: true,
    });
    expect(listStorageObjects).toHaveBeenNthCalledWith(2, profile, secret, {
      prefix: '',
      continuationToken: 'page-2',
      limit: 2,
      recursive: true,
    });
    expect(searchReadModelWriter.upsertAssets).toHaveBeenCalledTimes(2);
    expect(searchReadModelWriter.upsertAssets).toHaveBeenNthCalledWith(1, {
      profileId: 'profile-1',
      bucket: 'assets',
      items: [item('photos/a.png')],
    });
    expect(searchReadModelWriter.upsertAssets).toHaveBeenNthCalledWith(2, {
      profileId: 'profile-1',
      bucket: 'assets',
      items: [item('photos/b.png')],
    });
  });

  it('skips read model writes for empty pages', async () => {
    const listStorageObjects = vi.fn(async () => ({
      items: [],
      prefixes: [],
    }));
    const searchReadModelWriter = { upsertAssets: vi.fn() };
    const bootstrap = createSearchIndexBootstrapper({
      listStorageObjects,
      searchReadModelWriter,
    });

    await bootstrap(profile, secret);

    expect(searchReadModelWriter.upsertAssets).not.toHaveBeenCalled();
  });

  it('stops bootstrapping once the configured object cap is reached', async () => {
    const listStorageObjects = vi
      .fn()
      .mockResolvedValueOnce({
        items: [item('photos/a.png'), item('photos/b.png')],
        prefixes: [],
        nextContinuationToken: 'page-2',
      })
      .mockResolvedValueOnce({
        items: [item('photos/c.png')],
        prefixes: [],
      });
    const bootstrap = createSearchIndexBootstrapper({
      listStorageObjects,
      maxObjects: 2,
      pageSize: 2,
      searchReadModelWriter: { upsertAssets: vi.fn() },
    });

    await bootstrap(profile, secret);

    expect(listStorageObjects).toHaveBeenCalledTimes(1);
  });
});
