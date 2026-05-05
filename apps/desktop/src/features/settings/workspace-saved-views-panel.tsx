import { useEffect, useState } from 'react';
import type { SavedView } from '../../shared/ipc';

interface WorkspaceSavedViewsPanelProps {
  formatDate: (value: string) => string;
  isSearchBusy: boolean;
  newSavedViewName: string;
  onApplySavedView: (view: SavedView) => Promise<void> | void;
  onChangeNewSavedViewName: (value: string) => void;
  onDeleteSavedView: (viewId: string) => Promise<void> | void;
  onSaveCurrentView: () => Promise<void> | void;
  savedViews: SavedView[];
}

export const WorkspaceSavedViewsPanel = ({
  formatDate,
  isSearchBusy,
  newSavedViewName,
  onApplySavedView,
  onChangeNewSavedViewName,
  onDeleteSavedView,
  onSaveCurrentView,
  savedViews,
}: WorkspaceSavedViewsPanelProps) => {
  const [confirmingDeleteViewId, setConfirmingDeleteViewId] = useState<string | null>(null);

  useEffect(() => {
    if (
      confirmingDeleteViewId &&
      !savedViews.some((view) => view.id === confirmingDeleteViewId)
    ) {
      setConfirmingDeleteViewId(null);
    }
  }, [confirmingDeleteViewId, savedViews]);

  return (
    <article className="panel workspace-settings-panel">
      <div className="panel-header-row">
        <h3>Saved views</h3>
        <span className="pill pill--neutral">{savedViews.length}</span>
      </div>
      <p className="minor settings-section-note">
        Save the current search and filters so you can reopen the same browsing context later.
      </p>
      <div className="saved-view-inputs">
        <input
          placeholder="View name…"
          value={newSavedViewName}
          onChange={(event) => onChangeNewSavedViewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void onSaveCurrentView();
            }
          }}
        />
        <button
          type="button"
          onClick={() => void onSaveCurrentView()}
          disabled={isSearchBusy}
          aria-busy={isSearchBusy}
        >
          <span className="button-content">
            {isSearchBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5h8l4 4v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
              <path d="M8 5v6h8V7.5L13.5 5H8z" />
              <path d="M8 16h8" />
            </svg>
            <span>Save view</span>
          </span>
        </button>
      </div>
      <ul className="saved-view-list">
        {savedViews.length > 0 ? (
          savedViews.map((view) => {
            const isDeleteConfirming = confirmingDeleteViewId === view.id;

            return (
              <li key={view.id} className="saved-view-row">
                <div className="saved-view-row__main">
                  <button
                    type="button"
                    className="saved-view-item"
                    onClick={() => void onApplySavedView(view)}
                  >
                    <strong>{view.name}</strong>
                    <span>{formatDate(view.updatedAt)}</span>
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() => setConfirmingDeleteViewId(view.id)}
                    disabled={isSearchBusy}
                    aria-label="Delete saved view"
                    title="Delete saved view"
                    data-tooltip="Delete saved view"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 7h14" />
                      <path d="M9 7V5h6v2" />
                      <path d="M8 9v9" />
                      <path d="M12 9v9" />
                      <path d="M16 9v9" />
                      <path d="M7 18.5h10" />
                    </svg>
                  </button>
                </div>

                {isDeleteConfirming ? (
                  <div className="saved-view-delete-confirmation" role="alert">
                    <div className="saved-view-delete-confirmation__copy">
                      <strong>Delete {view.name}?</strong>
                      <span>This removes the saved search and filters. Assets stay in the bucket.</span>
                    </div>
                    <div className="saved-view-delete-confirmation__actions">
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteViewId(null)}
                        disabled={isSearchBusy}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="danger-action-button"
                        onClick={() => void onDeleteSavedView(view.id)}
                        disabled={isSearchBusy}
                      >
                        Delete view
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })
        ) : (
          <li className="empty">No saved views.</li>
        )}
      </ul>
    </article>
  );
};
