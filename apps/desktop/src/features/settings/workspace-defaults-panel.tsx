import type { AppSettings } from '../../shared/ipc';

interface WorkspaceDefaultsPanelProps {
  isSettingsDirty: boolean;
  onChangeAppearance: (value: AppSettings['appearance']) => void;
  onChangeDefaultConflictPolicy: (value: AppSettings['defaultConflictPolicy']) => void;
  onChangePresignedUrlTTLSeconds: (value: number) => void;
  onChangeUploadOptimizeImagesBeforeUpload: (value: boolean) => void;
  settings: AppSettings;
}

export const WorkspaceDefaultsPanel = ({
  isSettingsDirty,
  onChangeAppearance,
  onChangeDefaultConflictPolicy,
  onChangePresignedUrlTTLSeconds,
  onChangeUploadOptimizeImagesBeforeUpload,
  settings,
}: WorkspaceDefaultsPanelProps) => (
  <article className="panel workspace-settings-panel">
    <div className="panel-header-row">
      <h3>Workspace defaults</h3>
      <span className={`pill ${isSettingsDirty ? 'pill--warning' : 'pill--neutral'}`}>
        {isSettingsDirty ? 'Needs save' : 'Saved'}
      </span>
    </div>
    <p className="minor settings-section-note">
      Persistent defaults for appearance, uploads, and sharing. Saved when you press Save changes.
    </p>
    <div className="form-grid compact">
      <label>
        Appearance
        <select
          name="appearance"
          value={settings.appearance}
          onChange={(event) =>
            onChangeAppearance(event.target.value as AppSettings['appearance'])
          }
        >
          <option value="system">system</option>
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select>
      </label>
      <label>
        Default conflict
        <select
          name="default_conflict_policy"
          value={settings.defaultConflictPolicy}
          onChange={(event) =>
            onChangeDefaultConflictPolicy(
              event.target.value as AppSettings['defaultConflictPolicy'],
            )
          }
        >
          <option value="rename">rename</option>
          <option value="overwrite">overwrite</option>
          <option value="skip">skip</option>
        </select>
      </label>
      <label>
        URL TTL (sec)
        <input
          name="presigned_url_ttl_seconds"
          type="number"
          inputMode="numeric"
          min={60}
          max={86400}
          value={settings.presignedUrlTTLSeconds}
          onChange={(event) =>
            onChangePresignedUrlTTLSeconds(Number(event.target.value) || 900)
          }
        />
      </label>
      <label className="toggle-input">
        <input
          name="upload_optimize_images"
          type="checkbox"
          checked={settings.uploadOptimizeImagesBeforeUpload}
          onChange={(event) =>
            onChangeUploadOptimizeImagesBeforeUpload(event.target.checked)
          }
        />
        <span className="toggle-input-copy">
          <strong>Optimize image uploads</strong>
          <small>Resize to 2000px max width and convert to WebP before upload.</small>
        </span>
      </label>
    </div>
    <p className="minor settings-inline-summary">
      Optimized uploads keep aspect ratio, export WebP, and target web delivery by default.
    </p>
  </article>
);
