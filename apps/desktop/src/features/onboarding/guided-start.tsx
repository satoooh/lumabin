interface GuidedStartProps {
  hasSavedProfile: boolean;
  onCreateConnection: () => void;
  onUseSavedProfile: () => void;
}

export const GuidedStart = ({
  hasSavedProfile,
  onCreateConnection,
  onUseSavedProfile,
}: GuidedStartProps) => {
  return (
    <section className="guided-start">
      <div className="guided-step">
        <div className="guided-step-header">
          <strong>Connect your bucket</strong>
          <span className="pill pill--neutral">Step 1</span>
        </div>
        <p className="minor">Start by creating a connection profile.</p>
        <div className="row-actions">
          <button type="button" onClick={onCreateConnection}>
            <span className="button-content">
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              <span>New connection</span>
            </span>
          </button>
          {hasSavedProfile ? (
            <button type="button" onClick={onUseSavedProfile}>
              <span className="button-content">
                <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h8" />
                  <path d="m11 8 4 4-4 4" />
                  <path d="M17 5h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2" />
                </svg>
                <span>Use saved profile</span>
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
};
