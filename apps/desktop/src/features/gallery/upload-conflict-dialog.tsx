import type { CheckUploadConflictsResult, ConflictPolicy } from '../../shared/ipc';
import { formatCount } from '../shared/format-count';

export interface UploadConflictDialogState {
  conflicts: CheckUploadConflictsResult['conflicts'];
  totalConflicts: number;
}

interface UploadConflictDialogProps {
  dialog: UploadConflictDialogState;
  isUploadBusy: boolean;
  onClose: () => void;
  onResolve: (policy: ConflictPolicy) => void;
}

export const UploadConflictDialog = ({
  dialog,
  isUploadBusy,
  onClose,
  onResolve,
}: UploadConflictDialogProps) => (
  <div
    className="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Resolve upload conflicts"
    onMouseDown={onClose}
  >
    <section
      className="modal-card modal-card--compact"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="panel-header-row">
        <h2>Resolve upload conflicts</h2>
        <button
          type="button"
          onClick={onClose}
          disabled={isUploadBusy}
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
        <strong>{formatCount(dialog.totalConflicts, 'conflicting file')}</strong>{' '}
        detected.
      </p>
      <p className="minor">
        Choose one policy. This selection is applied to all conflicts in this upload.
      </p>

      <ul className="bulk-delete-preview-list">
        {dialog.conflicts.map((conflict) => (
          <li key={`${conflict.sourcePath}::${conflict.key}`}>
            <strong>{conflict.fileName}</strong>
            <br />
            <code>{conflict.key}</code>
          </li>
        ))}
      </ul>
      {dialog.totalConflicts > dialog.conflicts.length ? (
        <p className="minor">
          +{dialog.totalConflicts - dialog.conflicts.length} more
        </p>
      ) : null}

      <div className="row-actions">
        <button
          type="button"
          onClick={onClose}
          disabled={isUploadBusy}
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
          onClick={() => onResolve('rename')}
          disabled={isUploadBusy}
        >
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m4 20 4.5-1 10-10a1.6 1.6 0 0 0-2.2-2.2l-10 10L4 20z" />
              <path d="m13.5 6.5 4 4" />
            </svg>
            <span>Rename all</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onResolve('skip')}
          disabled={isUploadBusy}
        >
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8.2" />
              <path d="M9 12h6" />
            </svg>
            <span>Skip all</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onResolve('overwrite')}
          disabled={isUploadBusy}
        >
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h12" />
              <path d="m12 8 4 4-4 4" />
              <path d="M4 6v12" />
            </svg>
            <span>Overwrite all</span>
          </span>
        </button>
      </div>
    </section>
  </div>
);
