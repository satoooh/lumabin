import type { ProfileSummary } from '../../shared/ipc';

interface WorkspaceConnectionPanelProps {
  isProfileBusy: boolean;
  onChangePublicBaseUrl: (value: string) => void;
  onConnectionTest: () => Promise<void> | void;
  onOpenConnectionSetup: () => void;
  selectedProfile?: ProfileSummary;
  selectedProfileId: string;
  selectedPublicBaseUrl: string;
}

export const WorkspaceConnectionPanel = ({
  isProfileBusy,
  onChangePublicBaseUrl,
  onConnectionTest,
  onOpenConnectionSetup,
  selectedProfile,
  selectedProfileId,
  selectedPublicBaseUrl,
}: WorkspaceConnectionPanelProps) => (
  <article className="panel connection-panel workspace-settings-panel workspace-settings-panel--wide">
    <div className="panel-header-row">
      <h3>Connection profile</h3>
      <span className={`pill ${selectedProfileId ? 'pill--success' : 'pill--neutral'}`}>
        {selectedProfileId ? 'Ready' : 'No profile'}
      </span>
    </div>
    <p className="minor settings-section-note">
      Manage the active bucket connection and the saved base URL used for public links.
    </p>
    <dl className="settings-summary-grid">
      <div>
        <dt>Profile</dt>
        <dd>{selectedProfile?.name ?? 'Not selected'}</dd>
      </div>
      <div>
        <dt>Provider</dt>
        <dd>{selectedProfile?.provider ?? '—'}</dd>
      </div>
      <div>
        <dt>Bucket</dt>
        <dd>{selectedProfile?.bucket ?? '—'}</dd>
      </div>
    </dl>
    <div className="row-actions connection-primary-actions">
      <button
        type="button"
        onClick={() => void onConnectionTest()}
        disabled={!selectedProfileId || isProfileBusy}
        aria-busy={isProfileBusy}
      >
        <span className="button-content">
          {isProfileBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 12 3 3 7-7" />
            <circle cx="12" cy="12" r="8.2" />
          </svg>
          <span>Test connection</span>
        </span>
      </button>
      <button type="button" onClick={onOpenConnectionSetup}>
        <span className="button-content">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v4" />
            <path d="M12 17v4" />
            <path d="M3 12h4" />
            <path d="M17 12h4" />
            <path d="m5.6 5.6 2.8 2.8" />
            <path d="m15.6 15.6 2.8 2.8" />
            <path d="m5.6 18.4 2.8-2.8" />
            <path d="m15.6 8.4 2.8-2.8" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
          <span>{selectedProfileId ? 'Manage connection' : 'Create connection'}</span>
        </span>
      </button>
    </div>
    <label className="minor-input">
      Public URL base
      <input
        name="public_base_url"
        type="url"
        inputMode="url"
        spellCheck={false}
        autoComplete="url"
        placeholder="https://assets.example.com"
        value={selectedPublicBaseUrl}
        disabled={!selectedProfileId}
        onChange={(event) => onChangePublicBaseUrl(event.target.value)}
      />
    </label>
    <p className="minor">
      Used by “Copy public URL” in asset details. Saved when you press Save changes.
    </p>
  </article>
);
