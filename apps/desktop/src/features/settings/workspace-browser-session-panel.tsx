type ViewMode = 'gallery' | 'list';
type SortField = 'name' | 'size' | 'modified' | 'type';
type SortDirection = 'asc' | 'desc';

interface WorkspaceBrowserSessionPanelProps {
  assetsPrefix: string;
  isInitiallyExpanded?: boolean;
  isListLoading: boolean;
  isNextPageDisabled: boolean;
  onChangeAssetsPrefix: (value: string) => void;
  onChangeSortBy: (value: SortField) => void;
  onChangeSortDirection: (value: SortDirection) => void;
  onChangeViewMode: (value: ViewMode) => void;
  onLoadFirstPage: () => Promise<void> | void;
  onLoadNextPage: () => Promise<void> | void;
  onOpenPrefix: (prefix: string) => Promise<void> | void;
  prefixes: string[];
  selectedProfileId: string;
  sortBy: SortField;
  sortDirection: SortDirection;
  viewMode: ViewMode;
}

export const WorkspaceBrowserSessionPanel = ({
  assetsPrefix,
  isInitiallyExpanded = false,
  isListLoading,
  isNextPageDisabled,
  onChangeAssetsPrefix,
  onChangeSortBy,
  onChangeSortDirection,
  onChangeViewMode,
  onLoadFirstPage,
  onLoadNextPage,
  onOpenPrefix,
  prefixes,
  selectedProfileId,
  sortBy,
  sortDirection,
  viewMode,
}: WorkspaceBrowserSessionPanelProps) => (
  <article className="panel workspace-settings-panel">
    <details className="settings-disclosure" open={isInitiallyExpanded}>
      <summary className="settings-disclosure-summary">
        <span className="settings-disclosure-title">
          <span>Browser session</span>
          <small>Live controls for this window</small>
        </span>
        <span className="pill pill--neutral">Live</span>
      </summary>
      <p className="minor settings-section-note">
        These controls update the current library view immediately in this window.
      </p>
      <div className="form-grid compact">
        <label>
          View mode
          <select
            value={viewMode}
            onChange={(event) => onChangeViewMode(event.target.value as ViewMode)}
          >
            <option value="gallery">gallery</option>
            <option value="list">list</option>
          </select>
        </label>
        <label>
          Sort
          <select
            value={sortBy}
            onChange={(event) => onChangeSortBy(event.target.value as SortField)}
          >
            <option value="modified">modified</option>
            <option value="name">name</option>
            <option value="size">size</option>
            <option value="type">type</option>
          </select>
        </label>
        <label>
          Order
          <select
            value={sortDirection}
            onChange={(event) => onChangeSortDirection(event.target.value as SortDirection)}
          >
            <option value="desc">desc</option>
            <option value="asc">asc</option>
          </select>
        </label>
        <label>
          Prefix
          <input
            name="assets_prefix"
            spellCheck={false}
            autoComplete="off"
            placeholder="blog/2026/"
            value={assetsPrefix}
            disabled={!selectedProfileId}
            onChange={(event) => onChangeAssetsPrefix(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void onLoadFirstPage();
              }
            }}
          />
        </label>
      </div>
      <div className="row-actions">
        <button
          type="button"
          onClick={() => void onLoadFirstPage()}
          disabled={!selectedProfileId || isListLoading}
          aria-busy={isListLoading}
        >
          <span className="button-content">
            {isListLoading ? <span className="button-spinner" aria-hidden="true" /> : null}
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.3-5.7" />
              <path d="M20 4v6h-6" />
            </svg>
            <span>Reload current prefix</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => void onLoadNextPage()}
          disabled={isNextPageDisabled}
          aria-busy={isListLoading}
        >
          <span className="button-content">
            {isListLoading ? <span className="button-spinner" aria-hidden="true" /> : null}
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 6l6 6-6 6" />
            </svg>
            <span>Load next page</span>
          </span>
        </button>
      </div>
      {prefixes.length > 0 ? (
        <>
          <p className="minor settings-subsection-label">Suggested prefixes</p>
          <ul className="prefix-list">
            {prefixes.map((prefix) => (
              <li key={prefix}>
                <button
                  type="button"
                  onClick={() => void onOpenPrefix(prefix)}
                >
                  {prefix}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </details>
  </article>
);
