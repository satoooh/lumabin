interface UnsavedChangesConfirmationProps {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export const UnsavedChangesConfirmation = ({
  message,
  onCancel,
  onConfirm,
  title,
}: UnsavedChangesConfirmationProps) => (
  <div className="destructive-inline-confirmation" role="alert">
    <div className="destructive-inline-confirmation__copy">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
    <div className="row-actions row-actions--modal">
      <button type="button" onClick={onCancel}>
        <span className="button-content">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
          <span>Keep editing</span>
        </span>
      </button>
      <button type="button" className="danger-action-button" onClick={onConfirm}>
        <span className="button-content">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16" />
            <path d="M7 7l1 12h8l1-12" />
            <path d="M9 11l6 6" />
            <path d="M15 11l-6 6" />
          </svg>
          <span>Discard changes</span>
        </span>
      </button>
    </div>
  </div>
);
