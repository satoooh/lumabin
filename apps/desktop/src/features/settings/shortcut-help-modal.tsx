interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutHelpModal = ({
  isOpen,
  onClose,
}: ShortcutHelpModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onMouseDown={onClose}
    >
      <section
        className="modal-card modal-card--compact shortcuts-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="panel-header-row">
          <h2>Keyboard shortcuts</h2>
          <button type="button" onClick={onClose}>
            <span className="button-content">
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
              <span>Close</span>
            </span>
          </button>
        </div>

        <div className="shortcuts-grid">
          <section className="shortcuts-group" aria-label="Search and navigation">
            <h3>Search & navigation</h3>
            <dl>
              <div><dt><kbd>Cmd/Ctrl + K</kbd></dt><dd>Focus search</dd></div>
              <div><dt><kbd>?</kbd></dt><dd>Toggle this help</dd></div>
              <div><dt><kbd>Esc</kbd></dt><dd>Close dialogs / preview</dd></div>
            </dl>
          </section>

          <section className="shortcuts-group" aria-label="Selection and actions">
            <h3>Selection & actions</h3>
            <dl>
              <div><dt><kbd>Cmd/Ctrl + Click</kbd></dt><dd>Toggle multi-select</dd></div>
              <div><dt><kbd>Cmd/Ctrl + A</kbd></dt><dd>Select all (selection mode)</dd></div>
              <div><dt><kbd>Delete</kbd></dt><dd>Open delete dialog</dd></div>
            </dl>
          </section>

          <section className="shortcuts-group" aria-label="Preview">
            <h3>Preview</h3>
            <dl>
              <div><dt><kbd>Space</kbd></dt><dd>Open/close media/PDF preview</dd></div>
              <div><dt><kbd>← / →</kbd></dt><dd>Previous / next in preview</dd></div>
              <div><dt><kbd>Enter</kbd></dt><dd>Open focused media/PDF item</dd></div>
            </dl>
          </section>

          <section className="shortcuts-group" aria-label="Gallery density">
            <h3>Gallery density</h3>
            <dl>
              <div><dt><kbd>Cmd/Ctrl + +</kbd></dt><dd>Larger tiles</dd></div>
              <div><dt><kbd>Cmd/Ctrl + -</kbd></dt><dd>Smaller tiles</dd></div>
              <div><dt><kbd>Cmd/Ctrl + 0</kbd></dt><dd>Reset tile size</dd></div>
            </dl>
          </section>
        </div>
      </section>
    </div>
  );
};
