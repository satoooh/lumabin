interface DeleteUndoToastProps {
  isVisible: boolean;
  isStackedWithUpload?: boolean;
  pendingItemCount: number;
  queuedMoreCount: number;
  remainingSeconds: number;
  onUndo: () => void;
  onDeleteNow: () => void;
}

export const DeleteUndoToast = ({
  isVisible,
  isStackedWithUpload = false,
  pendingItemCount,
  queuedMoreCount,
  remainingSeconds,
  onUndo,
  onDeleteNow,
}: DeleteUndoToastProps) => {
  if (!isVisible || pendingItemCount <= 0) {
    return null;
  }

  return (
    <section
      className={`delete-undo-toast ${isStackedWithUpload ? 'delete-undo-toast--stacked' : ''}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="delete-undo-toast__header">
        <div className="delete-undo-toast__header-main">
          <span className="delete-undo-toast__state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 7h14" />
              <path d="M9 7V5h6v2" />
              <path d="M8 9v9" />
              <path d="M12 9v9" />
              <path d="M16 9v9" />
              <path d="M7 18.5h10" />
            </svg>
          </span>
          <p className="delete-undo-toast__title">
            {pendingItemCount === 1
              ? '1 item pending delete'
              : `${pendingItemCount} items pending delete`}
          </p>
        </div>
        {queuedMoreCount > 0 ? (
          <span className="pill pill--neutral">+{queuedMoreCount}</span>
        ) : null}
      </div>
      <p className="delete-undo-toast__subtitle">
        Auto delete in {remainingSeconds}s.
      </p>
      <div className="delete-undo-toast__actions">
        <button type="button" onClick={onUndo}>
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 7 5 11l4 4" />
              <path d="M5 11h8a5 5 0 0 1 0 10h-1" />
            </svg>
            <span>Undo</span>
          </span>
        </button>
        <button type="button" className="danger-action-button" onClick={onDeleteNow}>
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 7h14" />
              <path d="M9 7V5h6v2" />
              <path d="M8 9v9" />
              <path d="M12 9v9" />
              <path d="M16 9v9" />
              <path d="M7 18.5h10" />
            </svg>
            <span>Delete now</span>
          </span>
        </button>
      </div>
    </section>
  );
};
