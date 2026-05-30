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
  const title = isNoMatchesMode ? 'No matches found' : 'Drop files into your gallery';
  const uploadButton = (label: string, className?: string) => (
    <button
      type="button"
      className={className}
      onClick={onOpenFilePicker}
      disabled={isUploadBusy}
      aria-busy={isUploadBusy}
    >
      <span className="button-content">
        {isUploadBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
        <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        <span>{label}</span>
      </span>
    </button>
  );
  const refreshButton = (
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
        <span>Refresh bucket</span>
      </span>
    </button>
  );

  return (
    <div className="empty-state" role="region" aria-label={title}>
      <div className="empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 5v10" />
          <path d="m8 9 4-4 4 4" />
          <path d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16" />
        </svg>
      </div>
      <h2>{title}</h2>
      <p className="minor">
        {isNoMatchesMode
          ? 'Clear the current query or start a new upload.'
          : 'Drag images, videos, PDFs, or CSV files here.'}
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
          uploadButton('Upload assets', 'primary-action-button')
        )}
        {isNoMatchesMode ? uploadButton('Upload') : refreshButton}
      </div>
    </div>
  );
};
