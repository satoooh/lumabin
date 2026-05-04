import { afterEach, describe, expect, it } from 'vitest';
import {
  loadPersistedUiStateStore,
  sanitizePersistedUiState,
  UI_STATE_STORAGE_KEY,
} from '../../src/features/gallery/use-persisted-ui-state';

describe('persisted UI state', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('sanitizes unsupported values without changing the persisted shape', () => {
    expect(
      sanitizePersistedUiState({
        assetsPrefix: 'photos/',
        galleryScrollTop: 20,
        galleryTileMinWidth: -1,
        kindFilter: 'exe',
        listScrollTop: 10,
        smartCollection: 'recent-views',
        sortBy: 'modified',
        sortDirection: 'desc',
        viewMode: 'gallery',
      }),
    ).toEqual({
      assetsPrefix: 'photos/',
      galleryScrollTop: 20,
      listScrollTop: 10,
      smartCollection: 'recent-views',
      sortBy: 'modified',
      sortDirection: 'desc',
      viewMode: 'gallery',
    });
  });

  it('loads current global/profile stores and legacy single-object stores', () => {
    window.localStorage.setItem(
      UI_STATE_STORAGE_KEY,
      JSON.stringify({
        global: { assetsPrefix: 'global/' },
        profiles: {
          'profile-1': { assetsPrefix: 'profile/', viewMode: 'list' },
        },
      }),
    );

    expect(loadPersistedUiStateStore()).toEqual({
      global: { assetsPrefix: 'global/' },
      profiles: {
        'profile-1': { assetsPrefix: 'profile/', viewMode: 'list' },
      },
    });

    window.localStorage.setItem(
      UI_STATE_STORAGE_KEY,
      JSON.stringify({ assetsPrefix: 'legacy/', viewMode: 'gallery' }),
    );

    expect(loadPersistedUiStateStore()).toEqual({
      global: { assetsPrefix: 'legacy/', viewMode: 'gallery' },
    });
  });
});
