interface EmptyBrowserStateProps {
  mode: 'no-assets' | 'no-matches';
  isListLoading: boolean;
  isUploadBusy: boolean;
  onLoadFirstPage: () => void;
  onOpenFilePicker: () => void;
  canClearSearch: boolean;
  onClearSearch: () => void;
  canResetFilters: boolean;
  onResetFilters: () => void;
}

export const EmptyBrowserState = ({
  mode,
  isListLoading,
  isUploadBusy,
  onLoadFirstPage,
  onOpenFilePicker,
  canClearSearch,
  onClearSearch,
  canResetFilters,
  onResetFilters,
}: EmptyBrowserStateProps) => {
  const isNoMatchesMode = mode === 'no-matches';

  return (
    <div className="empty-state">
      <p>{isNoMatchesMode ? 'No matches found.' : 'No assets yet.'}</p>
      <p className="minor">
        {isNoMatchesMode
          ? 'Try clearing search or filters.'
          : 'Load or upload to start.'}
      </p>
      <div className="row-actions center-actions">
        {isNoMatchesMode ? (
          <>
            {canClearSearch ? (
              <button type="button" onClick={onClearSearch}>
                <span className="button-content">
                  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10.5 18a7.5 7.5 0 1 1 5.3-2.2" />
                    <path d="m16 16 4 4" />
                    <path d="M3 10.5h5" />
                  </svg>
                  <span>Clear search</span>
                </span>
              </button>
            ) : null}
            {canResetFilters ? (
              <button type="button" onClick={onResetFilters}>
                <span className="button-content">
                  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 12a8 8 0 1 1-2.3-5.7" />
                    <path d="M20 4v6h-6" />
                  </svg>
                  <span>Reset filters</span>
                </span>
              </button>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={onLoadFirstPage}
            disabled={isListLoading}
            aria-busy={isListLoading}
          >
            <span className="button-content">
              {isListLoading ? <span className="button-spinner" aria-hidden="true" /> : null}
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 12a8 8 0 1 1-2.3-5.7" />
                <path d="M20 4v6h-6" />
              </svg>
              <span>Load</span>
            </span>
          </button>
        )}
        <button type="button" onClick={onOpenFilePicker} disabled={isUploadBusy} aria-busy={isUploadBusy}>
          <span className="button-content">
            {isUploadBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            <span>Upload</span>
          </span>
        </button>
      </div>
    </div>
  );
};
