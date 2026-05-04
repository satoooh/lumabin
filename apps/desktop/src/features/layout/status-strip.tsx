interface StatusStripProps {
  isVisible: boolean;
  tone: 'neutral' | 'success' | 'error';
  message: string;
  onDismiss: () => void;
}

export const StatusStrip = ({ isVisible, tone, message, onDismiss }: StatusStripProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`status-strip status-strip--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <span className="status-strip__icon" aria-hidden="true">
        {tone === 'error' ? (
          <svg viewBox="0 0 24 24">
            <path d="M12 8v5" />
            <circle cx="12" cy="16.5" r="1" />
            <path d="m12 3 9 16H3L12 3Z" />
          </svg>
        ) : tone === 'success' ? (
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5 9.5 17 19 7.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" />
            <circle cx="12" cy="16.5" r="1" />
          </svg>
        )}
      </span>
      <span className="status-strip__message">{message}</span>
      <button
        type="button"
        className="status-strip__close"
        aria-label="Dismiss status"
        onClick={onDismiss}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 7l10 10M17 7 7 17" />
        </svg>
      </button>
    </div>
  );
};
