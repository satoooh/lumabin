import type { AssetItem } from '../../shared/ipc';

export type ViewMode = 'gallery' | 'list';
export type SortField = 'name' | 'size' | 'modified' | 'type';
export type SortDirection = 'asc' | 'desc';
export type KindFilter = 'all' | 'image' | 'video' | 'pdf' | 'csv' | 'other';
export type SmartCollection =
  | 'all'
  | 'recent-uploads'
  | 'recent-views'
  | 'large-files'
  | 'no-preview';
export type UnifiedFilterId =
  | 'all'
  | `kind:${Exclude<KindFilter, 'all'>}`
  | `smart:${Exclude<SmartCollection, 'all'>}`;

export interface GalleryDaySection {
  key: string;
  label: string;
  items: AssetItem[];
  startIndex: number;
}

export interface GalleryVirtualSection extends GalleryDaySection {
  estimatedHeight: number;
  topOffset: number;
  bottomOffset: number;
}

export interface UnifiedFilterOption {
  id: UnifiedFilterId;
  label: string;
  count: number;
  tone: 'default' | 'kind' | 'smart';
}

export interface GalleryVirtualRange {
  startIndex: number;
  endIndex: number;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
}

export type InferAssetKind = (item: AssetItem) => Exclude<KindFilter, 'all'>;

const RECENT_UPLOAD_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const RECENT_VIEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const LARGE_FILE_THRESHOLD_BYTES = 10 * 1024 * 1024;

export const LIST_ROW_HEIGHT_PX = 44;
export const VIRTUAL_OVERSCAN_ROWS = 4;
export const GALLERY_GRID_GAP_PX = 8;
export const GALLERY_DAY_GROUP_GAP_PX = 8;
export const GALLERY_DAY_HEADER_HEIGHT_PX = 34;
export const GALLERY_CARD_ASPECT_RATIO = 3 / 4;
export const GALLERY_VIRTUAL_OVERSCAN_PX = 540;

export const isQuickPreviewKind = (kind: Exclude<KindFilter, 'all'>): boolean =>
  kind === 'image' || kind === 'video' || kind === 'pdf';

const isSmartPreviewSupportedKind = (kind: Exclude<KindFilter, 'all'>): boolean =>
  kind === 'image' || kind === 'video' || kind === 'pdf' || kind === 'csv';

const parseAssetLastModifiedEpoch = (item: AssetItem): number => {
  const parsed = new Date(item.lastModified).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

export const matchesSmartCollection = (
  item: AssetItem,
  smartCollection: SmartCollection,
  recentViewsByKey: Record<string, number>,
  now: number,
  inferAssetKind: InferAssetKind,
): boolean => {
  if (smartCollection === 'all') {
    return true;
  }

  if (smartCollection === 'recent-uploads') {
    const modifiedAt = parseAssetLastModifiedEpoch(item);
    return modifiedAt > 0 && now - modifiedAt <= RECENT_UPLOAD_WINDOW_MS;
  }

  if (smartCollection === 'recent-views') {
    const viewedAt = recentViewsByKey[item.key] ?? 0;
    return viewedAt > 0 && now - viewedAt <= RECENT_VIEW_WINDOW_MS;
  }

  if (smartCollection === 'large-files') {
    return item.size >= LARGE_FILE_THRESHOLD_BYTES;
  }

  return !isSmartPreviewSupportedKind(inferAssetKind(item));
};

export const filterItemsByPrefix = (
  items: AssetItem[],
  prefix: string,
  normalizePrefix: (prefix: string) => string,
): AssetItem[] => {
  const normalizedPrefix = normalizePrefix(prefix);
  if (!normalizedPrefix) {
    return items;
  }
  return items.filter((item) => item.key.startsWith(normalizedPrefix));
};

export const countSmartCollections = (
  items: AssetItem[],
  recentViewsByKey: Record<string, number>,
  now: number,
  inferAssetKind: InferAssetKind,
): Record<SmartCollection, number> => {
  const counts: Record<SmartCollection, number> = {
    all: items.length,
    'recent-uploads': 0,
    'recent-views': 0,
    'large-files': 0,
    'no-preview': 0,
  };

  for (const item of items) {
    if (
      matchesSmartCollection(
        item,
        'recent-uploads',
        recentViewsByKey,
        now,
        inferAssetKind,
      )
    ) {
      counts['recent-uploads'] += 1;
    }
    if (
      matchesSmartCollection(
        item,
        'recent-views',
        recentViewsByKey,
        now,
        inferAssetKind,
      )
    ) {
      counts['recent-views'] += 1;
    }
    if (
      matchesSmartCollection(
        item,
        'large-files',
        recentViewsByKey,
        now,
        inferAssetKind,
      )
    ) {
      counts['large-files'] += 1;
    }
    if (
      matchesSmartCollection(
        item,
        'no-preview',
        recentViewsByKey,
        now,
        inferAssetKind,
      )
    ) {
      counts['no-preview'] += 1;
    }
  }

  return counts;
};

export const filterItemsByKind = (
  items: AssetItem[],
  activeKindFilter: KindFilter,
  inferAssetKind: InferAssetKind,
): AssetItem[] => {
  if (activeKindFilter === 'all') {
    return items;
  }
  return items.filter((item) => inferAssetKind(item) === activeKindFilter);
};

export const resolveVisibleItems = (
  options: {
    activeSmartCollection: SmartCollection;
    inferAssetKind: InferAssetKind;
    kindFilteredItems: AssetItem[];
    prefixFilteredItems: AssetItem[];
    recentViewsByKey: Record<string, number>;
    sortBy: SortField;
    sortDirection: SortDirection;
  },
  now: number,
): AssetItem[] => {
  const filtered =
    options.activeSmartCollection === 'all'
      ? options.kindFilteredItems
      : options.prefixFilteredItems.filter((item) =>
          matchesSmartCollection(
            item,
            options.activeSmartCollection,
            options.recentViewsByKey,
            now,
            options.inferAssetKind,
          ),
        );
  const sorted = [...filtered].sort((left, right) => {
    if (options.sortBy === 'name') {
      return left.key.localeCompare(right.key);
    }

    if (options.sortBy === 'size') {
      return left.size - right.size;
    }

    if (options.sortBy === 'modified') {
      return (
        new Date(left.lastModified).getTime() -
        new Date(right.lastModified).getTime()
      );
    }

    return options.inferAssetKind(left).localeCompare(options.inferAssetKind(right));
  });

  return options.sortDirection === 'asc' ? sorted : sorted.reverse();
};

export const countKinds = (
  items: AssetItem[],
  inferAssetKind: InferAssetKind,
): Record<KindFilter, number> => {
  const counts: Record<KindFilter, number> = {
    all: items.length,
    image: 0,
    video: 0,
    pdf: 0,
    csv: 0,
    other: 0,
  };

  for (const item of items) {
    counts[inferAssetKind(item)] += 1;
  }

  return counts;
};
