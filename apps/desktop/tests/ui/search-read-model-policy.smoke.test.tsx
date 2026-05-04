import { describe, expect, it } from 'vitest';
import {
  escapeSearchReadModelLike,
  mapSearchReadModelRow,
  normalizeSearchReadModelLimit,
  toSqliteChangesCount,
} from '../../src/main/application/contexts/asset-discovery/search-read-model-policy';

describe('search read model policy', () => {
  it('clamps search limits to the supported query window', () => {
    expect(normalizeSearchReadModelLimit(-10)).toBe(1);
    expect(normalizeSearchReadModelLimit(50)).toBe(50);
    expect(normalizeSearchReadModelLimit(999_999)).toBe(2_000);
  });

  it('escapes SQLite LIKE wildcard characters', () => {
    expect(escapeSearchReadModelLike(String.raw`raw\100%_done`)).toBe(
      String.raw`raw\\100\%\_done`,
    );
  });

  it('maps SQLite rows to asset items with stable fallbacks', () => {
    expect(
      mapSearchReadModelRow({
        key: 'photos/a.png',
        size: 100,
        content_type: 'image/png',
        last_modified: '2026-05-03T00:00:00.000Z',
        etag: 'etag-a',
      }),
    ).toEqual({
      key: 'photos/a.png',
      size: 100,
      contentType: 'image/png',
      lastModified: '2026-05-03T00:00:00.000Z',
      etag: 'etag-a',
    });

    expect(mapSearchReadModelRow({})).toEqual({
      key: '',
      size: 0,
      contentType: 'application/octet-stream',
      lastModified: '1970-01-01T00:00:00.000Z',
      etag: '',
    });
  });

  it('extracts SQLite change counts defensively', () => {
    expect(toSqliteChangesCount({ changes: 3 })).toBe(3);
    expect(toSqliteChangesCount({ changes: '3' })).toBe(0);
    expect(toSqliteChangesCount(null)).toBe(0);
  });
});
