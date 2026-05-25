import { afterEach, describe, expect, it } from 'vitest';
import {
  ASSET_BROWSER_LIST_CACHE_STORAGE_KEY,
  ASSET_BROWSER_LIST_CACHE_TTL_MS,
  clearAssetBrowserListCache,
  readAssetBrowserListCache,
  writeAssetBrowserListCache,
} from '../../src/features/gallery/asset-browser-list-cache';
import type { ListAssetsResult } from '../../src/shared/ipc';

const result: ListAssetsResult = {
  items: [
    {
      contentType: 'video/mp4',
      etag: 'etag',
      key: 'clips/東京 sample.mp4',
      lastModified: '2026-05-25T00:00:00.000Z',
      size: 100,
    },
  ],
  prefixes: ['clips/'],
};

describe('asset browser list cache', () => {
  afterEach(() => {
    clearAssetBrowserListCache();
  });

  it('stores completed list results and reports freshness by TTL', () => {
    writeAssetBrowserListCache('profile-1', 'clips/', result, 1_000);

    expect(readAssetBrowserListCache('profile-1', 'clips/', 1_000)).toEqual({
      result,
      isFresh: true,
    });
    expect(
      readAssetBrowserListCache(
        'profile-1',
        'clips/',
        1_000 + ASSET_BROWSER_LIST_CACHE_TTL_MS + 1,
      ),
    ).toEqual({
      result,
      isFresh: false,
    });
  });

  it('does not persist partial continuation pages as complete cache entries', () => {
    writeAssetBrowserListCache(
      'profile-1',
      'clips/',
      {
        ...result,
        nextContinuationToken: 'next-page',
      },
      1_000,
    );

    expect(readAssetBrowserListCache('profile-1', 'clips/', 1_000)).toBeNull();
    expect(window.localStorage.getItem(ASSET_BROWSER_LIST_CACHE_STORAGE_KEY)).toBeNull();
  });
});
