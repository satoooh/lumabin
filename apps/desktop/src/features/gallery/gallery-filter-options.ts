import type {
  KindFilter,
  SmartCollection,
  UnifiedFilterId,
  UnifiedFilterOption,
} from './gallery-view-model-calculations';

const KIND_FILTER_OPTIONS: Array<{ value: KindFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'csv', label: 'CSVs' },
  { value: 'other', label: 'Other' },
];

const SMART_COLLECTION_OPTIONS: Array<{
  value: SmartCollection;
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: 'recent-uploads', label: 'Recent uploads' },
  { value: 'recent-views', label: 'Recently viewed' },
  { value: 'large-files', label: 'Large files' },
  { value: 'no-preview', label: 'No preview' },
];

export const normalizeFilterPair = (
  kindFilter: KindFilter,
  smartCollection: SmartCollection,
): {
  kindFilter: KindFilter;
  smartCollection: SmartCollection;
} => {
  if (kindFilter !== 'all') {
    return {
      kindFilter,
      smartCollection: 'all',
    };
  }

  if (smartCollection !== 'all') {
    return {
      kindFilter: 'all',
      smartCollection,
    };
  }

  return {
    kindFilter: 'all',
    smartCollection: 'all',
  };
};

export const toUnifiedFilterId = (
  kindFilter: KindFilter,
  smartCollection: SmartCollection,
): UnifiedFilterId => {
  if (kindFilter !== 'all') {
    return `kind:${kindFilter}`;
  }
  if (smartCollection !== 'all') {
    return `smart:${smartCollection}`;
  }
  return 'all';
};

export const parseUnifiedFilterId = (
  filterId: string,
): {
  kindFilter: KindFilter;
  smartCollection: SmartCollection;
} => {
  if (filterId === 'all') {
    return { kindFilter: 'all', smartCollection: 'all' };
  }

  if (filterId.startsWith('kind:')) {
    const value = filterId.slice('kind:'.length);
    if (
      value === 'image' ||
      value === 'video' ||
      value === 'pdf' ||
      value === 'csv' ||
      value === 'other'
    ) {
      return {
        kindFilter: value,
        smartCollection: 'all',
      };
    }
  }

  if (filterId.startsWith('smart:')) {
    const value = filterId.slice('smart:'.length);
    if (
      value === 'recent-uploads' ||
      value === 'recent-views' ||
      value === 'large-files' ||
      value === 'no-preview'
    ) {
      return {
        kindFilter: 'all',
        smartCollection: value,
      };
    }
  }

  return {
    kindFilter: 'all',
    smartCollection: 'all',
  };
};

export const resolveVisibleKindFilterOptions = (
  kindCounts: Record<KindFilter, number>,
  activeKindFilter: KindFilter,
): Array<{ value: KindFilter; label: string }> =>
  KIND_FILTER_OPTIONS.filter((option) => {
    if (option.value === 'all') {
      return true;
    }
    return kindCounts[option.value] > 0 || activeKindFilter === option.value;
  });

export const resolveVisibleSmartCollectionOptions = (
  smartCollectionCounts: Record<SmartCollection, number>,
  activeSmartCollection: SmartCollection,
): Array<{ value: SmartCollection; label: string }> =>
  SMART_COLLECTION_OPTIONS.filter((option) => {
    if (option.value === 'all') {
      return true;
    }
    return (
      smartCollectionCounts[option.value] > 0 ||
      activeSmartCollection === option.value
    );
  });

export const buildUnifiedFilterOptions = (
  kindCounts: Record<KindFilter, number>,
  smartCollectionCounts: Record<SmartCollection, number>,
  visibleKindFilterOptions: Array<{ value: KindFilter; label: string }>,
  visibleSmartCollectionOptions: Array<{
    value: SmartCollection;
    label: string;
  }>,
): UnifiedFilterOption[] => {
  const options: UnifiedFilterOption[] = [
    {
      id: 'all',
      label: 'All',
      count: kindCounts.all,
      tone: 'default',
    },
  ];

  for (const option of visibleSmartCollectionOptions) {
    if (option.value === 'all') {
      continue;
    }
    options.push({
      id: `smart:${option.value}`,
      label: option.label,
      count: smartCollectionCounts[option.value],
      tone: 'smart',
    });
  }

  for (const option of visibleKindFilterOptions) {
    if (option.value === 'all') {
      continue;
    }
    options.push({
      id: `kind:${option.value}`,
      label: option.label,
      count: kindCounts[option.value],
      tone: 'kind',
    });
  }

  return options;
};

export const resolveFilterLabel = <T extends string>(
  activeValue: T,
  allValue: T,
  options: Array<{ value: T; label: string }>,
): string =>
  activeValue !== allValue
    ? options.find((option) => option.value === activeValue)?.label ?? activeValue
    : '';
