import { describe, expect, it } from 'vitest';
import {
  parseSavedViewQuery,
  serializeSavedViewQuery,
} from '../../src/features/gallery/saved-view-state';

describe('saved view state', () => {
  it('round-trips a structured saved view query', () => {
    const query = {
      prefix: 'photos/2026/',
      search: 'tokyo',
      viewMode: 'gallery' as const,
      sortBy: 'modified' as const,
      sortDirection: 'desc' as const,
      kindFilter: 'image' as const,
      smartCollection: 'recent-views' as const,
    };

    expect(parseSavedViewQuery(serializeSavedViewQuery(query))).toEqual(query);
  });

  it('drops unknown enum values while preserving free text query fields', () => {
    expect(
      parseSavedViewQuery(JSON.stringify({
        prefix: 'raw/',
        search: 'draft',
        viewMode: 'table',
        sortBy: 'created',
        sortDirection: 'sideways',
        kindFilter: 'audio',
        smartCollection: 'favorites',
      })),
    ).toEqual({
      prefix: 'raw/',
      search: 'draft',
      viewMode: undefined,
      sortBy: undefined,
      sortDirection: undefined,
      kindFilter: undefined,
      smartCollection: undefined,
    });
  });

  it('keeps legacy raw saved view queries as search text', () => {
    expect(parseSavedViewQuery('unstructured query')).toEqual({
      search: 'unstructured query',
    });
  });
});
