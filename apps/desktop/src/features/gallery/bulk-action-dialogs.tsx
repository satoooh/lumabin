export interface BulkMoveDialogState {
  keys: string[];
  destinationPrefix: string;
}

interface BulkMoveDialogProps {
  dialog: BulkMoveDialogState;
  isAssetActionBusy: boolean;
  onChangeDestinationPrefix: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

interface BulkDeleteDialogProps {
  keys: string[];
  isAssetActionBusy: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const BulkMoveDialog = ({
  dialog,
  isAssetActionBusy,
  onChangeDestinationPrefix,
  onClose,
  onSubmit,
}: BulkMoveDialogProps) => (
  <div
    className="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Move selected assets"
    onMouseDown={onClose}
  >
    <section
      className="modal-card modal-card--compact"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="panel-header-row">
        <h2>Move selected assets</h2>
        <button
          type="button"
          onClick={onClose}
          disabled={isAssetActionBusy}
        >
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
            <span>Close</span>
          </span>
        </button>
      </div>

      <p className="minor">
        Move <strong>{dialog.keys.length}</strong> object(s) to a new prefix.
      </p>
      <label className="minor-input">
        Destination prefix
        <input
          placeholder="blog/2026/"
          value={dialog.destinationPrefix}
          disabled={isAssetActionBusy}
          onChange={(event) => onChangeDestinationPrefix(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSubmit();
            }
          }}
        />
      </label>
      <p className="minor">
        Filenames are preserved. Only the parent prefix changes.
      </p>

      <ul className="bulk-delete-preview-list">
        {dialog.keys.slice(0, 12).map((key) => (
          <li key={key}>
            <code>{key}</code>
          </li>
        ))}
      </ul>
      {dialog.keys.length > 12 ? (
        <p className="minor">+{dialog.keys.length - 12} more</p>
      ) : null}

      <div className="row-actions row-actions--modal">
        <button
          type="button"
          onClick={onClose}
          disabled={isAssetActionBusy}
        >
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
            <span>Cancel</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isAssetActionBusy || dialog.keys.length === 0}
          aria-busy={isAssetActionBusy}
        >
          <span className="button-content">
            {isAssetActionBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h12" />
              <path d="m12 8 4 4-4 4" />
              <path d="M4 6v12" />
            </svg>
            <span>{`Move ${dialog.keys.length} items`}</span>
          </span>
        </button>
      </div>
    </section>
  </div>
);

export const BulkDeleteDialog = ({
  keys,
  isAssetActionBusy,
  onClose,
  onSubmit,
}: BulkDeleteDialogProps) => (
  <div
    className="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Delete selected assets"
    onMouseDown={onClose}
  >
    <section
      className="modal-card modal-card--compact"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="panel-header-row">
        <h2>Delete selected assets</h2>
        <button
          type="button"
          onClick={onClose}
          disabled={isAssetActionBusy}
        >
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
            <span>Close</span>
          </span>
        </button>
      </div>

      <p className="minor">
        You are deleting <strong>{keys.length}</strong> object(s) from this bucket.
      </p>
      <p className="minor">Delete starts after a 5-second undo window.</p>

      <ul className="bulk-delete-preview-list">
        {keys.slice(0, 12).map((key) => (
          <li key={key}>
            <code>{key}</code>
          </li>
        ))}
      </ul>
      {keys.length > 12 ? (
        <p className="minor">+{keys.length - 12} more</p>
      ) : null}

      <div className="row-actions row-actions--modal">
        <button
          type="button"
          onClick={onClose}
          disabled={isAssetActionBusy}
        >
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
            <span>Cancel</span>
          </span>
        </button>
        <button
          type="button"
          className="danger-action-button"
          onClick={onSubmit}
          disabled={isAssetActionBusy || keys.length === 0}
          aria-busy={isAssetActionBusy}
        >
          <span className="button-content">
            {isAssetActionBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 7h14" />
              <path d="M9 7V5h6v2" />
              <path d="M8 9v9" />
              <path d="M12 9v9" />
              <path d="M16 9v9" />
              <path d="M7 18.5h10" />
            </svg>
            <span>{`Delete ${keys.length} items`}</span>
          </span>
        </button>
      </div>
    </section>
  </div>
);
