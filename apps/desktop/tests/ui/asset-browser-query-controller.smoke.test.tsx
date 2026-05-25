import { cleanup, render } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ASSET_BROWSER_LIST_PAGE_SIZE,
  mergeListAssetsResult,
  normalizeSearchQuery,
  shouldSkipSearchRequest,
  useAssetBrowserQueryController,
} from '../../src/features/gallery/use-asset-browser-query-controller';
import {
  clearAssetBrowserListCache,
  writeAssetBrowserListCache,
} from '../../src/features/gallery/asset-browser-list-cache';
import type { ListAssetsResult } from '../../src/shared/ipc';

const assetA = {
  contentType: 'image/png',
  etag: 'etag-a',
  key: 'photos/a.png',
  lastModified: '2026-05-02T00:00:00.000Z',
  size: 100,
};

const assetB = {
  contentType: 'video/mp4',
  etag: 'etag-b',
  key: 'photos/b.mp4',
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 200,
};

const listResult: ListAssetsResult = {
  items: [
    assetA,
  ],
  prefixes: ['photos/'],
};

interface ProbeProps {
  action: 'direct-load' | 'load' | 'open-prefix' | 'reload' | 'search';
  listAssets?: ReturnType<typeof vi.fn>;
  searchAssets?: ReturnType<typeof vi.fn>;
  setStatusLine?: (status: string, tone?: 'neutral' | 'success' | 'error') => void;
  showCount?: boolean;
}

const Probe = ({
  action,
  listAssets = vi.fn(async () => listResult),
  searchAssets = vi.fn(async () => ({ items: listResult.items, total: 1 })),
  setStatusLine = vi.fn(),
  showCount = false,
}: ProbeProps) => {
  const hasRunRef = useRef(false);
  const controller = useAssetBrowserQueryController({
    initialAssetsPrefix: 'photos/',
    listAssets,
    searchAssets,
    searchDebounceMs: 1_000,
    selectedProfileId: 'profile-1',
    setStatusLine,
  });

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;

    if (action === 'load') {
      void controller.handleLoadFirstPage();
      return;
    }
    if (action === 'direct-load') {
      void controller.loadAssetsPage({
        profileId: 'profile-1',
        prefix: 'photos/',
        continuationToken: undefined,
        page: 1,
      });
      return;
    }
    if (action === 'open-prefix') {
      void controller.handleOpenPrefix('archive/');
      return;
    }
    if (action === 'reload') {
      void controller.reloadCurrentItems();
      return;
    }
    controller.setSearchInput('  beach  ');
    void controller.runSearch('  beach  ', { force: true });
  }, [action, controller]);

  if (!showCount) {
    return null;
  }

  return (
    <>
      <output data-testid="asset-count">{controller.assetsResult.items.length}</output>
      <output data-testid="next-token">{controller.nextAssetsContinuationToken ?? ''}</output>
    </>
  );
};

describe('asset browser query controller', () => {
  afterEach(() => {
    cleanup();
    clearAssetBrowserListCache();
  });

  it('normalizes and skips duplicate search queries unless forced', () => {
    expect(normalizeSearchQuery('  beach  ')).toBe('beach');
    expect(shouldSkipSearchRequest('beach', 'beach')).toBe(true);
    expect(shouldSkipSearchRequest('beach', 'beach', true)).toBe(false);
  });

  it('merges paged list results without duplicating object keys or prefixes', () => {
    expect(
      mergeListAssetsResult(
        {
          items: [assetA],
          prefixes: ['photos/'],
        },
        {
          items: [assetB],
          prefixes: ['photos/', 'videos/'],
          nextContinuationToken: 'token-3',
        },
      ),
    ).toMatchObject({
      items: [
        { key: 'photos/a.png' },
        { key: 'photos/b.mp4' },
      ],
      prefixes: ['photos/', 'videos/'],
      nextContinuationToken: 'token-3',
    });
  });

  it('loads the first asset page through the injected list query', async () => {
    const listAssets = vi.fn(async () => listResult);
    const setStatusLine = vi.fn();

    render(<Probe action="load" listAssets={listAssets} setStatusLine={setStatusLine} />);

    await vi.waitFor(() => {
      expect(listAssets).toHaveBeenCalledWith({
        continuationToken: undefined,
        limit: ASSET_BROWSER_LIST_PAGE_SIZE,
        prefix: 'photos/',
        profileId: 'profile-1',
      });
    });
    expect(setStatusLine).toHaveBeenCalledWith('Loaded 1 items.', 'success');
  });

  it('continues through continuation tokens and appends later pages', async () => {
    const listAssets = vi
      .fn()
      .mockResolvedValueOnce({
        ...listResult,
        nextContinuationToken: 'token-2',
      })
      .mockResolvedValueOnce({
        items: [assetB],
        prefixes: [],
      });
    const setStatusLine = vi.fn();

    const { getByTestId } = render(
      <Probe
        action="load"
        listAssets={listAssets}
        setStatusLine={setStatusLine}
        showCount
      />,
    );

    await vi.waitFor(() => {
      expect(listAssets).toHaveBeenNthCalledWith(2, {
        continuationToken: 'token-2',
        limit: ASSET_BROWSER_LIST_PAGE_SIZE,
        prefix: 'photos/',
        profileId: 'profile-1',
      });
    });
    await vi.waitFor(() => {
      expect(getByTestId('asset-count').textContent).toBe('2');
      expect(getByTestId('next-token').textContent).toBe('');
    });
    expect(setStatusLine).toHaveBeenCalledWith(
      'Loaded 1 items. Loading remaining assets…',
      'success',
    );
    expect(setStatusLine).toHaveBeenCalledWith('Loaded 2 items.', 'success');
  });

  it('uses a fresh cached list for profile bootstrap without hitting storage again', async () => {
    writeAssetBrowserListCache(
      'profile-1',
      'photos/',
      {
        items: [assetA, assetB],
        prefixes: ['photos/'],
      },
      Date.now(),
    );
    const listAssets = vi.fn(async () => listResult);
    const setStatusLine = vi.fn();

    const { getByTestId } = render(
      <Probe
        action="direct-load"
        listAssets={listAssets}
        setStatusLine={setStatusLine}
        showCount
      />,
    );

    await vi.waitFor(() => {
      expect(getByTestId('asset-count').textContent).toBe('2');
    });
    expect(listAssets).not.toHaveBeenCalled();
    expect(setStatusLine).toHaveBeenCalledWith('Loaded 2 cached items.', 'success');
  });

  it('opens prefixes and reloads the current asset browser view through list queries', async () => {
    const listAssets = vi.fn(async () => listResult);

    render(<Probe action="open-prefix" listAssets={listAssets} />);

    await vi.waitFor(() => {
      expect(listAssets).toHaveBeenCalledWith({
        continuationToken: undefined,
        limit: ASSET_BROWSER_LIST_PAGE_SIZE,
        prefix: 'archive/',
        profileId: 'profile-1',
      });
    });
    cleanup();
    listAssets.mockClear();

    render(<Probe action="reload" listAssets={listAssets} />);

    await vi.waitFor(() => {
      expect(listAssets).toHaveBeenCalledWith({
        continuationToken: undefined,
        limit: ASSET_BROWSER_LIST_PAGE_SIZE,
        prefix: 'photos/',
        profileId: 'profile-1',
      });
    });
  });

  it('runs searches through the injected search query', async () => {
    const searchAssets = vi.fn(async () => ({ items: listResult.items, total: 1 }));
    const setStatusLine = vi.fn();

    render(<Probe action="search" searchAssets={searchAssets} setStatusLine={setStatusLine} />);

    await vi.waitFor(() => {
      expect(searchAssets).toHaveBeenCalledWith({
        limit: 300,
        profileId: 'profile-1',
        query: 'beach',
      });
    });
    expect(setStatusLine).toHaveBeenCalledWith('Found 1 items.', 'success');
  });
});
