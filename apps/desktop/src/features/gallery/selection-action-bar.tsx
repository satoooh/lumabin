interface SelectionActionBarProps {
  isSelectionMode: boolean;
  selectedAssetCount: number;
  visibleItemCount: number;
  isAssetActionBusy: boolean;
  selectedProfileId: string;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onOpenBulkMove: () => void;
  onOpenBulkDelete: () => void;
}

export const SelectionActionBar = ({
  isSelectionMode,
  selectedAssetCount,
  visibleItemCount,
  isAssetActionBusy,
  selectedProfileId,
  onSelectAllVisible,
  onClearSelection,
  onOpenBulkMove,
  onOpenBulkDelete,
}: SelectionActionBarProps) => {
  if (!isSelectionMode) {
    return null;
  }

  const hasSelection = selectedAssetCount > 0;

  return (
    <div
      className={`selection-action-bar ${hasSelection ? '' : 'selection-action-bar--idle'}`.trim()}
      role="region"
      aria-label="Selected asset actions"
    >
      <div className="selection-action-summary">
        <span className="minor">
          {hasSelection ? 'Bulk actions ready.' : 'Select items to enable bulk actions.'}
        </span>
      </div>
      <div className="selection-action-controls" role="toolbar" aria-label="Selection actions">
        <button
          type="button"
          onClick={onSelectAllVisible}
          disabled={visibleItemCount === 0}
          title="Select all visible assets (Cmd/Ctrl+A)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5h14v14H5z" />
            <path d="M8 12.5l3 3 5-6" />
          </svg>
          <span>All</span>
        </button>
        {hasSelection ? (
          <>
            <button
              type="button"
              onClick={onClearSelection}
              disabled={selectedAssetCount === 0}
              title="Clear current selection"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
              <span>Clear</span>
            </button>
            <button
              type="button"
              onClick={onOpenBulkMove}
              disabled={isAssetActionBusy || !selectedProfileId || selectedAssetCount === 0}
              title="Move selected assets…"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h12" />
                <path d="m12 8 4 4-4 4" />
                <path d="M4 6v12" />
              </svg>
              <span>Move…</span>
            </button>
            <button
              type="button"
              className="danger-action-button"
              onClick={onOpenBulkDelete}
              disabled={isAssetActionBusy || !selectedProfileId || selectedAssetCount === 0}
              title="Delete selected assets…"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7h14" />
                <path d="M9 7V5h6v2" />
                <path d="M8 9v9" />
                <path d="M12 9v9" />
                <path d="M16 9v9" />
                <path d="M7 18.5h10" />
              </svg>
              <span>Delete…</span>
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};
