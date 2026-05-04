import { cleanup, render } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  normalizeSearchQuery,
  shouldSkipSearchRequest,
  useAssetBrowserQueryController,
} from '../../src/features/gallery/use-asset-browser-query-controller';
import type { ListAssetsResult } from '../../src/shared/ipc';

const listResult: ListAssetsResult = {
  items: [
    {
      contentType: 'image/png',
      etag: 'etag-a',
      key: 'photos/a.png',
      lastModified: '2026-05-02T00:00:00.000Z',
      size: 100,
    },
  ],
  nextContinuationToken: 'token-2',
  prefixes: ['photos/'],
};

interface ProbeProps {
  action: 'load' | 'open-prefix' | 'reload' | 'search';
  listAssets?: ReturnType<typeof vi.fn>;
  searchAssets?: ReturnType<typeof vi.fn>;
  setStatusLine?: (status: string, tone?: 'neutral' | 'success' | 'error') => void;
}

const Probe = ({
  action,
  listAssets = vi.fn(async () => listResult),
  searchAssets = vi.fn(async () => ({ items: listResult.items, total: 1 })),
  setStatusLine = vi.fn(),
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

  return null;
};

describe('asset browser query controller', () => {
  afterEach(() => {
    cleanup();
  });

  it('normalizes and skips duplicate search queries unless forced', () => {
    expect(normalizeSearchQuery('  beach  ')).toBe('beach');
    expect(shouldSkipSearchRequest('beach', 'beach')).toBe(true);
    expect(shouldSkipSearchRequest('beach', 'beach', true)).toBe(false);
  });

  it('loads the first asset page through the injected list query', async () => {
    const listAssets = vi.fn(async () => listResult);
    const setStatusLine = vi.fn();

    render(<Probe action="load" listAssets={listAssets} setStatusLine={setStatusLine} />);

    await vi.waitFor(() => {
      expect(listAssets).toHaveBeenCalledWith({
        continuationToken: undefined,
        prefix: 'photos/',
        profileId: 'profile-1',
      });
    });
    expect(setStatusLine).toHaveBeenCalledWith('Loaded 1 items.', 'success');
  });

  it('opens prefixes and reloads the current asset browser view through list queries', async () => {
    const listAssets = vi.fn(async () => listResult);

    render(<Probe action="open-prefix" listAssets={listAssets} />);

    await vi.waitFor(() => {
      expect(listAssets).toHaveBeenCalledWith({
        continuationToken: undefined,
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
