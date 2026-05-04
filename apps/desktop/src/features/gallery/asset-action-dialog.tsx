export interface AssetActionDialogState {
  kind: 'rename' | 'move' | 'delete';
  key: string;
  inputValue: string;
}

interface AssetActionDialogProps {
  dialog: AssetActionDialogState;
  basenameFromKey: (key: string) => string;
  isAssetActionBusy: boolean;
  isProfileSelected: boolean;
  onChangeInputValue: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const titleForAssetAction = (kind: AssetActionDialogState['kind']): string => {
  if (kind === 'delete') {
    return 'Delete asset';
  }
  if (kind === 'move') {
    return 'Move asset';
  }
  return 'Rename asset';
};

const submitLabelForAssetAction = (kind: AssetActionDialogState['kind']): string => {
  if (kind === 'delete') {
    return 'Delete';
  }
  if (kind === 'move') {
    return 'Move';
  }
  return 'Rename';
};

export const AssetActionDialog = ({
  dialog,
  basenameFromKey,
  isAssetActionBusy,
  isProfileSelected,
  onChangeInputValue,
  onClose,
  onSubmit,
}: AssetActionDialogProps) => (
  <div
    className="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-label={titleForAssetAction(dialog.kind)}
    onMouseDown={onClose}
  >
    <section
      className="modal-card modal-card--compact"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="panel-header-row">
        <h2>{titleForAssetAction(dialog.kind)}</h2>
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
        <strong>{basenameFromKey(dialog.key)}</strong>
      </p>
      <p className="minor">
        <code>{dialog.key}</code>
      </p>

      {dialog.kind === 'rename' ? (
        <label className="minor-input">
          File name
          <input
            value={dialog.inputValue}
            disabled={isAssetActionBusy}
            onChange={(event) => onChangeInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSubmit();
              }
            }}
          />
        </label>
      ) : null}

      {dialog.kind === 'move' ? (
        <label className="minor-input">
          Destination key
          <input
            value={dialog.inputValue}
            disabled={isAssetActionBusy}
            onChange={(event) => onChangeInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSubmit();
              }
            }}
          />
        </label>
      ) : null}

      {dialog.kind === 'delete' ? (
        <p className="minor">
          Delete starts after a 5-second undo window.
        </p>
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
          className={dialog.kind === 'delete' ? 'danger-action-button' : undefined}
          onClick={onSubmit}
          disabled={isAssetActionBusy || !isProfileSelected}
          aria-busy={isAssetActionBusy}
        >
          <span className="button-content">
            {isAssetActionBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
            {dialog.kind === 'delete' ? (
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7h14" />
                <path d="M9 7V5h6v2" />
                <path d="M8 9v9" />
                <path d="M12 9v9" />
                <path d="M16 9v9" />
                <path d="M7 18.5h10" />
              </svg>
            ) : null}
            {dialog.kind === 'move' ? (
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h12" />
                <path d="m12 8 4 4-4 4" />
                <path d="M4 6v12" />
              </svg>
            ) : null}
            {dialog.kind === 'rename' ? (
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m4 20 4.5-1 10-10a1.6 1.6 0 0 0-2.2-2.2l-10 10L4 20z" />
                <path d="m13.5 6.5 4 4" />
              </svg>
            ) : null}
            <span>{submitLabelForAssetAction(dialog.kind)}</span>
          </span>
        </button>
      </div>
    </section>
  </div>
);
