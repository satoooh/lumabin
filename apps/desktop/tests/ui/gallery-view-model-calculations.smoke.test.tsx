import { describe, expect, it } from 'vitest';
import {
  countKinds,
  countSmartCollections,
  filterItemsByPrefix,
  resolveVisibleItems,
  type InferAssetKind,
} from '../../src/features/gallery/gallery-view-model-calculations';
import {
  buildUnifiedFilterOptions,
  normalizeFilterPair,
  parseUnifiedFilterId,
} from '../../src/features/gallery/gallery-filter-options';
import {
  buildGalleryDaySections,
  buildGalleryVirtualSections,
  calculateGalleryColumnCount,
  calculateGalleryTileWidth,
  calculateGalleryVirtualRange,
  calculateListVirtualRange,
} from '../../src/features/gallery/gallery-virtualization-calculations';
import type { AssetItem } from '../../src/shared/ipc';

const item = (
  key: string,
  options: Partial<AssetItem> = {},
): AssetItem => ({
  contentType: options.contentType ?? 'image/png',
  etag: options.etag ?? `"${key}"`,
  key,
  lastModified: options.lastModified ?? '2026-05-02T00:00:00.000Z',
  size: options.size ?? 1024,
});

const inferAssetKind: InferAssetKind = (asset) => {
  if (asset.key.endsWith('.mp4')) {
    return 'video';
  }
  if (asset.key.endsWith('.pdf')) {
    return 'pdf';
  }
  if (asset.key.endsWith('.csv')) {
    return 'csv';
  }
  if (asset.key.endsWith('.bin')) {
    return 'other';
  }
  return 'image';
};

describe('gallery view model calculations', () => {
  it('keeps unified filters mutually exclusive and falls back on invalid input', () => {
    expect(normalizeFilterPair('image', 'recent-views')).toEqual({
      kindFilter: 'image',
      smartCollection: 'all',
    });
    expect(parseUnifiedFilterId('smart:large-files')).toEqual({
      kindFilter: 'all',
      smartCollection: 'large-files',
    });
    expect(parseUnifiedFilterId('smart:unknown')).toEqual({
      kindFilter: 'all',
      smartCollection: 'all',
    });
  });

  it('filters, counts, and sorts visible gallery items without React state', () => {
    const now = new Date('2026-05-03T00:00:00.000Z').getTime();
    const recentViewTime = now - 60_000;
    const assets = [
      item('photos/b.png', { size: 2048 }),
      item('photos/a.mp4', { size: 12 * 1024 * 1024 }),
      item('docs/readme.pdf', { size: 512 }),
      item('photos/raw.bin', { size: 512 }),
    ];
    const prefixItems = filterItemsByPrefix(assets, 'photos', (prefix) => `${prefix}/`);
    const kindCounts = countKinds(prefixItems, inferAssetKind);
    const smartCounts = countSmartCollections(
      prefixItems,
      { 'photos/raw.bin': recentViewTime },
      now,
      inferAssetKind,
    );

    expect(prefixItems.map((asset) => asset.key)).toEqual([
      'photos/b.png',
      'photos/a.mp4',
      'photos/raw.bin',
    ]);
    expect(kindCounts).toMatchObject({ all: 3, image: 1, video: 1, other: 1 });
    expect(smartCounts).toMatchObject({
      all: 3,
      'large-files': 1,
      'no-preview': 1,
      'recent-views': 1,
    });

    const visibleItems = resolveVisibleItems(
      {
        activeSmartCollection: 'large-files',
        inferAssetKind,
        kindFilteredItems: prefixItems,
        prefixFilteredItems: prefixItems,
        recentViewsByKey: {},
        sortBy: 'name',
        sortDirection: 'asc',
      },
      now,
    );
    expect(visibleItems.map((asset) => asset.key)).toEqual(['photos/a.mp4']);

    const options = buildUnifiedFilterOptions(
      kindCounts,
      smartCounts,
      [
        { label: 'All', value: 'all' },
        { label: 'Images', value: 'image' },
      ],
      [
        { label: 'All', value: 'all' },
        { label: 'Large files', value: 'large-files' },
      ],
    );
    expect(options).toEqual([
      { count: 3, id: 'all', label: 'All', tone: 'default' },
      { count: 1, id: 'smart:large-files', label: 'Large files', tone: 'smart' },
      { count: 1, id: 'kind:image', label: 'Images', tone: 'kind' },
    ]);
  });

  it('calculates list and gallery virtual ranges from stable dimensions', () => {
    expect(calculateListVirtualRange(220, 132, 30)).toEqual({
      startIndex: 1,
      endIndex: 12,
      topSpacerHeight: 44,
      bottomSpacerHeight: 792,
    });

    const columnCount = calculateGalleryColumnCount(500, 160);
    const tileWidth = calculateGalleryTileWidth(500, 160, columnCount);
    const sections = buildGalleryDaySections(
      [
        item('a.png', { lastModified: '2026-05-02T00:00:00.000Z' }),
        item('b.png', { lastModified: '2026-05-02T01:00:00.000Z' }),
        item('c.png', { lastModified: '2026-05-01T00:00:00.000Z' }),
      ],
      (isoDate) => isoDate.slice(0, 10),
      (dayKey) => dayKey,
    );
    const virtualSections = buildGalleryVirtualSections(
      sections,
      columnCount,
      Math.round(tileWidth * 0.75),
    );
    const range = calculateGalleryVirtualRange(virtualSections, 0, 120);

    expect(columnCount).toBe(3);
    expect(sections.map((section) => section.items.map((asset) => asset.key))).toEqual([
      ['a.png', 'b.png'],
      ['c.png'],
    ]);
    expect(range.startIndex).toBe(0);
    expect(range.endIndex).toBeGreaterThan(0);
    expect(range.bottomSpacerHeight).toBeGreaterThanOrEqual(0);
  });
});
