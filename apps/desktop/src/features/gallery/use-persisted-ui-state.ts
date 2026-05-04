import { useCallback, useEffect, useRef } from 'react';
import type {
  KindFilter,
  SmartCollection,
  SortDirection,
  SortField,
  ViewMode,
} from './use-gallery-view-model';

export interface PersistedUiState {
  viewMode?: ViewMode;
  sortBy?: SortField;
  sortDirection?: SortDirection;
  kindFilter?: KindFilter;
  smartCollection?: SmartCollection;
  galleryTileMinWidth?: number;
  assetsPrefix?: string;
  listScrollTop?: number;
  galleryScrollTop?: number;
}

export interface PersistedUiStateStore {
  global?: PersistedUiState;
  profiles?: Record<string, PersistedUiState>;
}

export const UI_STATE_STORAGE_KEY = 'lumabin.uiState.v1';

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const sanitizePersistedUiState = (input: unknown): PersistedUiState => {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const parsed = input as PersistedUiState;
  const next: PersistedUiState = {};
  if (parsed.viewMode === 'gallery' || parsed.viewMode === 'list') {
    next.viewMode = parsed.viewMode;
  }
  if (['name', 'size', 'modified', 'type'].includes(String(parsed.sortBy))) {
    next.sortBy = parsed.sortBy as SortField;
  }
  if (parsed.sortDirection === 'asc' || parsed.sortDirection === 'desc') {
    next.sortDirection = parsed.sortDirection;
  }
  if (['all', 'image', 'video', 'pdf', 'csv', 'other'].includes(String(parsed.kindFilter))) {
    next.kindFilter = parsed.kindFilter as KindFilter;
  }
  if (
    [
      'all',
      'recent-uploads',
      'recent-views',
      'large-files',
      'no-preview',
    ].includes(String(parsed.smartCollection))
  ) {
    next.smartCollection = parsed.smartCollection as SmartCollection;
  }
  if (isFiniteNonNegativeNumber(parsed.galleryTileMinWidth)) {
    next.galleryTileMinWidth = parsed.galleryTileMinWidth;
  }
  if (typeof parsed.assetsPrefix === 'string') {
    next.assetsPrefix = parsed.assetsPrefix;
  }
  if (isFiniteNonNegativeNumber(parsed.listScrollTop)) {
    next.listScrollTop = parsed.listScrollTop;
  }
  if (isFiniteNonNegativeNumber(parsed.galleryScrollTop)) {
    next.galleryScrollTop = parsed.galleryScrollTop;
  }
  return next;
};

export const loadPersistedUiStateStore = (): PersistedUiStateStore => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(UI_STATE_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    const maybeStore = parsed as {
      global?: unknown;
      profiles?: Record<string, unknown>;
    };

    if ('global' in maybeStore || 'profiles' in maybeStore) {
      const nextStore: PersistedUiStateStore = {};
      if (maybeStore.global) {
        nextStore.global = sanitizePersistedUiState(maybeStore.global);
      }
      if (maybeStore.profiles && typeof maybeStore.profiles === 'object') {
        const sanitizedProfiles: Record<string, PersistedUiState> = {};
        for (const [profileId, profileState] of Object.entries(maybeStore.profiles)) {
          if (!profileId) {
            continue;
          }
          sanitizedProfiles[profileId] = sanitizePersistedUiState(profileState);
        }
        if (Object.keys(sanitizedProfiles).length > 0) {
          nextStore.profiles = sanitizedProfiles;
        }
      }
      return nextStore;
    }

    return {
      global: sanitizePersistedUiState(parsed),
    };
  } catch {
    return {};
  }
};

interface UsePersistedUiStateOptions {
  debounceMs: number;
  selectedProfileId: string;
  store: PersistedUiStateStore;
  uiState: PersistedUiState;
}

export const usePersistedUiState = ({
  debounceMs,
  selectedProfileId,
  store,
  uiState,
}: UsePersistedUiStateOptions) => {
  const storeRef = useRef<PersistedUiStateStore>(store);
  const timerRef = useRef<number | null>(null);

  const resolvePersistedUiStateForProfile = useCallback(
    (profileId: string | null | undefined): PersistedUiState => {
      const globalState = storeRef.current.global ?? {};
      if (!profileId) {
        return globalState;
      }
      const profileState = storeRef.current.profiles?.[profileId];
      return {
        ...globalState,
        ...(profileState ?? {}),
      };
    },
    [],
  );

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = window.setTimeout(() => {
      try {
        const currentStore = storeRef.current ?? {};
        const nextStore: PersistedUiStateStore = {
          ...currentStore,
          global: {
            ...(currentStore.global ?? {}),
            ...uiState,
          },
        };

        if (selectedProfileId) {
          nextStore.profiles = {
            ...(currentStore.profiles ?? {}),
            [selectedProfileId]: uiState,
          };
        }

        storeRef.current = nextStore;
        window.localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify(nextStore));
      } catch {
        // Ignore localStorage write failures.
      } finally {
        timerRef.current = null;
      }
    }, debounceMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [debounceMs, selectedProfileId, uiState]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    resolvePersistedUiStateForProfile,
  };
};
