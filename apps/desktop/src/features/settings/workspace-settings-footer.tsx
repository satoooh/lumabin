interface WorkspaceSettingsFooterProps {
  isSettingsBusy: boolean;
  isSettingsDirty: boolean;
  onSaveSettings: () => Promise<void> | void;
}

export const WorkspaceSettingsFooter = ({
  isSettingsBusy,
  isSettingsDirty,
  onSaveSettings,
}: WorkspaceSettingsFooterProps) => (
  <div className="workspace-settings-footer">
    <p className="minor">
      Public URL base and workspace defaults are saved together. Browser session controls apply immediately.
    </p>
    <div className="row-actions">
      <button
        type="button"
        disabled={!isSettingsDirty || isSettingsBusy}
        onClick={() => void onSaveSettings()}
        aria-busy={isSettingsBusy}
      >
        <span className="button-content">
          {isSettingsBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h8l4 4v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
            <path d="M8 5v6h8V7.5L13.5 5H8z" />
            <path d="M8 16h8" />
          </svg>
          <span>{isSettingsBusy ? 'Saving…' : 'Save changes'}</span>
        </span>
      </button>
    </div>
  </div>
);
