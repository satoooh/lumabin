interface QuickPreviewTopbarProps {
  assetName: string;
  hasNextPreviewImage: boolean;
  hasPrevPreviewImage: boolean;
  isQuickPreviewInfoOpen: boolean;
  onClose: () => void;
  onMoveSelection: (direction: -1 | 1) => void;
  onToggleInfoOpen: () => void;
  previewMediaItemsCount: number;
  selectedPreviewItemIndex: number;
}

export const QuickPreviewTopbar = ({
  assetName,
  hasNextPreviewImage,
  hasPrevPreviewImage,
  isQuickPreviewInfoOpen,
  onClose,
  onMoveSelection,
  onToggleInfoOpen,
  previewMediaItemsCount,
  selectedPreviewItemIndex,
}: QuickPreviewTopbarProps) => (
  <div className="quick-preview-topbar">
    <div className="quick-preview-topbar-title">
      <h2>{assetName}</h2>
      <span>
        {selectedPreviewItemIndex >= 0
          ? `${selectedPreviewItemIndex + 1} / ${previewMediaItemsCount}`
          : '-'}
      </span>
    </div>
    <div className="quick-preview-topbar-actions" role="toolbar" aria-label="Preview navigation">
      <button
        type="button"
        className="icon-action-button"
        aria-label="Previous asset"
        title="Previous asset (Left Arrow)"
        data-tooltip="Previous asset"
        onClick={() => onMoveSelection(-1)}
        disabled={!hasPrevPreviewImage}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        <span className="sr-only">Previous</span>
      </button>
      <button
        type="button"
        className="icon-action-button"
        aria-label="Next asset"
        title="Next asset (Right Arrow)"
        data-tooltip="Next asset"
        onClick={() => onMoveSelection(1)}
        disabled={!hasNextPreviewImage}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
        <span className="sr-only">Next</span>
      </button>
      <button
        type="button"
        className={`icon-action-button ${isQuickPreviewInfoOpen ? 'icon-action-button--active' : ''}`}
        aria-label={isQuickPreviewInfoOpen ? 'Hide asset details' : 'Show asset details'}
        title={isQuickPreviewInfoOpen ? 'Hide asset details' : 'Show asset details'}
        data-tooltip={isQuickPreviewInfoOpen ? 'Hide asset details' : 'Show asset details'}
        aria-pressed={isQuickPreviewInfoOpen}
        onClick={onToggleInfoOpen}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8.2" />
          <path d="M12 10.5v5" />
          <circle cx="12" cy="7.6" r="0.7" />
        </svg>
        <span className="sr-only">
          {isQuickPreviewInfoOpen ? 'Hide details' : 'Show details'}
        </span>
      </button>
      <button
        type="button"
        className="icon-action-button"
        aria-label="Close preview"
        title="Close"
        data-tooltip="Close"
        onClick={onClose}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12" />
          <path d="M18 6l-12 12" />
        </svg>
        <span className="sr-only">Close</span>
      </button>
    </div>
  </div>
);
