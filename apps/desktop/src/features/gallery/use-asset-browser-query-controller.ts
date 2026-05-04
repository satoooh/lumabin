import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { AssetItem, ListAssetsResult } from '../../shared/ipc';

type StatusTone = 'neutral' | 'success' | 'error';

export interface LoadAssetsPageOptions {
  profileId: string;
  prefix: string;
  continuationToken?: string;
  page: number;
}

interface SearchAssetsInput {
  profileId: string;
  query: string;
  limit: number;
}

interface SearchAssetsResult {
  items: AssetItem[];
  total: number;
}

interface UseAssetBrowserQueryControllerOptions {
  initialAssetsPrefix: string;
  listAssets: (input: {
    profileId: string;
    prefix: string;
    continuationToken?: string;
  }) => Promise<ListAssetsResult>;
  searchAssets: (input: SearchAssetsInput) => Promise<SearchAssetsResult>;
  searchDebounceMs: number;
  selectedProfileId: string;
  setStatusLine: (status: string, tone?: StatusTone) => void;
}

interface RunSearchOptions {
  force?: boolean;
  silent?: boolean;
}

export const initialListAssetsResult: ListAssetsResult = {
  items: [],
  prefixes: [],
};

export const normalizeSearchQuery = (queryText: string): string => queryText.trim();

export const shouldSkipSearchRequest = (
  normalizedQuery: string,
  activeSearchQuery: string,
  force?: boolean,
): boolean => !force && normalizedQuery === activeSearchQuery;

export const useAssetBrowserQueryController = ({
  initialAssetsPrefix,
  listAssets,
  searchAssets,
  searchDebounceMs,
  selectedProfileId,
  setStatusLine,
}: UseAssetBrowserQueryControllerOptions) => {
  const [assetsPrefix, setAssetsPrefix] = useState<string>(initialAssetsPrefix);
  const [assetsPage, setAssetsPage] = useState<number>(1);
  const [nextAssetsContinuationToken, setNextAssetsContinuationToken] = useState<
    string | undefined
  >();
  const [assetsResult, setAssetsResult] = useState<ListAssetsResult>(initialListAssetsResult);
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [searchItems, setSearchItems] = useState<AssetItem[]>([]);
  const [isBrowserBusy, setIsBrowserBusy] = useState<boolean>(false);
  const [isSearchBusy, setIsSearchBusy] = useState<boolean>(false);
  const searchRequestIdRef = useRef<number>(0);

  const resetAssetsResult = useCallback(() => {
    setAssetsResult(initialListAssetsResult);
    setAssetsPage(1);
    setNextAssetsContinuationToken(undefined);
  }, []);

  const resetSearchState = useCallback(() => {
    setSearchInput('');
    setActiveSearchQuery('');
    setSearchItems([]);
  }, []);

  const loadAssetsPage = useCallback(
    async (options: LoadAssetsPageOptions) => {
      setIsBrowserBusy(true);
      try {
        const result = await listAssets({
          profileId: options.profileId,
          prefix: options.prefix,
          continuationToken: options.continuationToken,
        });

        setAssetsResult(result);
        setAssetsPage(options.page);
        setNextAssetsContinuationToken(result.nextContinuationToken);
        setAssetsPrefix(options.prefix);
        setActiveSearchQuery('');
        setSearchItems([]);

        setStatusLine(`Loaded ${result.items.length} items.`, 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setStatusLine(`Failed to load assets: ${message}`, 'error');
      } finally {
        setIsBrowserBusy(false);
      }
    },
    [listAssets, setStatusLine],
  );

  const runSearch = useCallback(
    async (queryText: string, options?: RunSearchOptions) => {
      if (!selectedProfileId) {
        return;
      }

      const normalizedQuery = normalizeSearchQuery(queryText);
      const silent = options?.silent ?? false;
      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;

      if (!normalizedQuery) {
        setIsSearchBusy(false);
        setActiveSearchQuery('');
        setSearchItems([]);
        if (!silent) {
          setStatusLine('Search cleared.', 'neutral');
        }
        return;
      }

      if (shouldSkipSearchRequest(normalizedQuery, activeSearchQuery, options?.force)) {
        return;
      }

      setIsSearchBusy(true);
      try {
        const result = await searchAssets({
          profileId: selectedProfileId,
          query: normalizedQuery,
          limit: 300,
        });

        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        setActiveSearchQuery(normalizedQuery);
        setSearchItems(result.items);
        setNextAssetsContinuationToken(undefined);
        setAssetsPage(1);

        if (!silent) {
          setStatusLine(`Found ${result.total} items.`, 'success');
        }
      } catch (error) {
        if (requestId !== searchRequestIdRef.current) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        setStatusLine(`Search failed: ${message}`, 'error');
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearchBusy(false);
        }
      }
    },
    [activeSearchQuery, searchAssets, selectedProfileId, setStatusLine],
  );

  const handleLoadFirstPage = useCallback(async () => {
    if (!selectedProfileId) {
      return;
    }

    setStatusLine('Loading assets…', 'neutral');
    await loadAssetsPage({
      profileId: selectedProfileId,
      prefix: assetsPrefix,
      continuationToken: undefined,
      page: 1,
    });
  }, [assetsPrefix, loadAssetsPage, selectedProfileId, setStatusLine]);

  const handleLoadNextPage = useCallback(async () => {
    if (!selectedProfileId || !nextAssetsContinuationToken) {
      return;
    }

    setStatusLine('Loading next page…', 'neutral');
    await loadAssetsPage({
      profileId: selectedProfileId,
      prefix: assetsPrefix,
      continuationToken: nextAssetsContinuationToken,
      page: assetsPage + 1,
    });
  }, [
    assetsPage,
    assetsPrefix,
    loadAssetsPage,
    nextAssetsContinuationToken,
    selectedProfileId,
    setStatusLine,
  ]);

  const handleSearchSubmit = useCallback(async () => {
    await runSearch(searchInput, { force: true });
  }, [runSearch, searchInput]);

  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    void runSearch('', { silent: true, force: true });
  }, [runSearch]);

  const reloadCurrentItems = useCallback(async () => {
    if (!selectedProfileId) {
      return;
    }

    if (activeSearchQuery) {
      await runSearch(activeSearchQuery, { silent: true, force: true });
      return;
    }

    await loadAssetsPage({
      profileId: selectedProfileId,
      prefix: assetsPrefix,
      continuationToken: undefined,
      page: 1,
    });
  }, [activeSearchQuery, assetsPrefix, loadAssetsPage, runSearch, selectedProfileId]);

  const handleOpenPrefix = useCallback(
    async (prefix: string) => {
      if (!selectedProfileId) {
        return;
      }

      await loadAssetsPage({
        profileId: selectedProfileId,
        prefix,
        continuationToken: undefined,
        page: 1,
      });
    },
    [loadAssetsPage, selectedProfileId],
  );

  useEffect(() => {
    if (!selectedProfileId) {
      return;
    }

    const normalizedQuery = normalizeSearchQuery(searchInput);
    if (normalizedQuery === activeSearchQuery) {
      return;
    }

    const debounceTimer = window.setTimeout(() => {
      void runSearch(searchInput, { silent: true });
    }, searchDebounceMs);

    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [activeSearchQuery, runSearch, searchDebounceMs, searchInput, selectedProfileId]);

  return {
    activeSearchQuery,
    assetsPage,
    assetsPrefix,
    assetsResult,
    handleLoadFirstPage,
    handleLoadNextPage,
    handleOpenPrefix,
    handleSearchClear,
    handleSearchSubmit,
    isBrowserBusy,
    isSearchBusy,
    loadAssetsPage,
    nextAssetsContinuationToken,
    reloadCurrentItems,
    resetAssetsResult,
    resetSearchState,
    runSearch,
    searchInput,
    searchItems,
    setActiveSearchQuery,
    setAssetsPrefix,
    setIsSearchBusy,
    setSearchInput,
    setSearchItems,
  };
};

export type AssetBrowserQueryController = ReturnType<typeof useAssetBrowserQueryController>;
export type SetSearchBusy = Dispatch<SetStateAction<boolean>>;
