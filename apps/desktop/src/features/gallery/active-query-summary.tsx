interface ActiveQuerySummaryProps {
  searchQuery: string;
  activeKindLabel: string;
  activeSmartCollectionLabel: string;
  onClearSearch: () => void;
  onResetFilters: () => void;
  mode?: 'default' | 'compact';
}

export const ActiveQuerySummary = ({
  searchQuery,
  activeKindLabel,
  activeSmartCollectionLabel,
  onClearSearch,
  onResetFilters,
  mode = 'default',
}: ActiveQuerySummaryProps) => {
  const normalizedSearch = searchQuery.trim();
  const hasSearch = normalizedSearch.length > 0;
  const hasKindFilter = activeKindLabel.length > 0;
  const hasSmartCollection = activeSmartCollectionLabel.length > 0;
  const hasAnyState = hasSearch || hasKindFilter || hasSmartCollection;
  const summaryParts: string[] = [];

  if (hasSearch) {
    summaryParts.push(`Search: ${normalizedSearch}`);
  }
  if (hasKindFilter) {
    summaryParts.push(`Type: ${activeKindLabel}`);
  }
  if (hasSmartCollection) {
    summaryParts.push(`View: ${activeSmartCollectionLabel}`);
  }

  if (!hasAnyState) {
    return null;
  }

  return (
    <div
      className={`active-query-summary ${
        mode === 'compact' ? 'active-query-summary--compact' : ''
      }`.trim()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="active-query-summary-text" title={summaryParts.join(' · ')}>
        {summaryParts.join(' · ')}
      </p>
      <div className="active-query-actions" role="group" aria-label="Filter recovery actions">
        {hasSearch ? (
          <button type="button" className="active-query-action" onClick={onClearSearch}>
            Clear search
          </button>
        ) : null}
        {(hasKindFilter || hasSmartCollection) ? (
          <button type="button" className="active-query-action" onClick={onResetFilters}>
            Reset filters
          </button>
        ) : null}
      </div>
    </div>
  );
};
