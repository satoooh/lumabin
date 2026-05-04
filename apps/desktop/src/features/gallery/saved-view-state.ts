import type {
  KindFilter,
  SmartCollection,
  SortDirection,
  SortField,
  ViewMode,
} from './use-gallery-view-model';

export interface SavedViewQuery {
  prefix?: string;
  search?: string;
  viewMode?: ViewMode;
  sortBy?: SortField;
  sortDirection?: SortDirection;
  kindFilter?: KindFilter;
  smartCollection?: SmartCollection;
}

export const serializeSavedViewQuery = (query: SavedViewQuery): string => {
  return JSON.stringify(query);
};

export const parseSavedViewQuery = (rawQuery: string): SavedViewQuery => {
  try {
    const parsed = JSON.parse(rawQuery) as SavedViewQuery;
    if (typeof parsed !== 'object' || parsed === null) {
      return { search: rawQuery };
    }

    const viewMode: ViewMode | undefined =
      parsed.viewMode === 'gallery' || parsed.viewMode === 'list'
        ? parsed.viewMode
        : undefined;

    const sortBy: SortField | undefined =
      parsed.sortBy === 'name' ||
      parsed.sortBy === 'size' ||
      parsed.sortBy === 'modified' ||
      parsed.sortBy === 'type'
        ? parsed.sortBy
        : undefined;

    const sortDirection: SortDirection | undefined =
      parsed.sortDirection === 'asc' || parsed.sortDirection === 'desc'
        ? parsed.sortDirection
        : undefined;

    const kindFilter: KindFilter | undefined =
      parsed.kindFilter === 'all' ||
      parsed.kindFilter === 'image' ||
      parsed.kindFilter === 'video' ||
      parsed.kindFilter === 'pdf' ||
      parsed.kindFilter === 'csv' ||
      parsed.kindFilter === 'other'
        ? parsed.kindFilter
        : undefined;

    const smartCollection: SmartCollection | undefined =
      parsed.smartCollection === 'all' ||
      parsed.smartCollection === 'recent-uploads' ||
      parsed.smartCollection === 'recent-views' ||
      parsed.smartCollection === 'large-files' ||
      parsed.smartCollection === 'no-preview'
        ? parsed.smartCollection
        : undefined;

    return {
      prefix: typeof parsed.prefix === 'string' ? parsed.prefix : undefined,
      search: typeof parsed.search === 'string' ? parsed.search : undefined,
      viewMode,
      sortBy,
      sortDirection,
      kindFilter,
      smartCollection,
    };
  } catch {
    return {
      search: rawQuery,
    };
  }
};
