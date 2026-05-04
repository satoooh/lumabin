import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { SaveProfileInput } from '../../shared/ipc';

type ProfileFieldErrors = Partial<Record<
  'name' | 'endpoint' | 'region' | 'bucket' | 'accessKeyId' | 'secretAccessKey',
  string
>>;

interface ConnectionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProfileBusy: boolean;
  onSaveProfile: () => Promise<void> | void;
  isCreatingProfile: boolean;
  onStartNewProfile: () => void;
  profileForm: SaveProfileInput;
  setProfileForm: Dispatch<SetStateAction<SaveProfileInput>>;
  r2AccountId: string;
  onChangeR2AccountId: (value: string) => void;
  profileFieldErrors: ProfileFieldErrors;
  allowStoredSecret: boolean;
  canSaveProfile: boolean;
  selectedProfileId: string;
  onDeleteProfile: () => Promise<void> | void;
  profileFormValidationErrors: string[];
  profileNameInputRef: RefObject<HTMLInputElement | null>;
  profileEndpointInputRef: RefObject<HTMLInputElement | null>;
  profileRegionInputRef: RefObject<HTMLInputElement | null>;
  profileBucketInputRef: RefObject<HTMLInputElement | null>;
  profileAccessKeyInputRef: RefObject<HTMLInputElement | null>;
  profileSecretKeyInputRef: RefObject<HTMLInputElement | null>;
}

export const ConnectionSetupModal = ({
  isOpen,
  onClose,
  isProfileBusy,
  onSaveProfile,
  isCreatingProfile,
  onStartNewProfile,
  profileForm,
  setProfileForm,
  r2AccountId,
  onChangeR2AccountId,
  profileFieldErrors,
  allowStoredSecret,
  canSaveProfile,
  selectedProfileId,
  onDeleteProfile,
  profileFormValidationErrors,
  profileNameInputRef,
  profileEndpointInputRef,
  profileRegionInputRef,
  profileBucketInputRef,
  profileAccessKeyInputRef,
  profileSecretKeyInputRef,
}: ConnectionSetupModalProps) => {
  if (!isOpen) {
    return null;
  }

  const isR2Profile = profileForm.provider === 'r2';
  const profileNamePlaceholder = isR2Profile ? 'My R2 Profile…' : 'My S3 Profile…';
  const endpointPlaceholder = isR2Profile
    ? 'https://example-account.r2.cloudflarestorage.com'
    : 'https://s3.example.com';

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Connection Setup"
      onMouseDown={onClose}
    >
      <section
        className="modal-card modal-card--connection"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <form
          className="dialog-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (isProfileBusy) {
              return;
            }
            void onSaveProfile();
          }}
        >
          <div className="panel-header-row">
            <h2>Setup</h2>
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

          <div className="row-actions row-actions--meta">
            <span className="minor">{isCreatingProfile ? 'New profile' : 'Edit profile'}</span>
            <button type="button" onClick={onStartNewProfile}>
              <span className="button-content">
                <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                <span>New</span>
              </span>
            </button>
          </div>

          <div className="form-grid modal-form-grid">
            <label>
              Name
              <input
                ref={profileNameInputRef}
                name="profile_name"
                autoComplete="nickname"
                placeholder={profileNamePlaceholder}
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, name: event.target.value }))
                }
              />
              {profileFieldErrors.name ? (
                <span className="field-error">{profileFieldErrors.name}</span>
              ) : null}
            </label>
            <label>
              Provider
              <select
                name="provider"
                value={profileForm.provider}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    provider: event.target.value as SaveProfileInput['provider'],
                    region: event.target.value === 'r2' ? 'auto' : current.region,
                  }))
                }
              >
                <option value="r2">Cloudflare R2</option>
                <option value="s3">Generic S3</option>
              </select>
            </label>
            <label>
              R2 Account ID
              <input
                name="r2_account_id"
                spellCheck={false}
                autoComplete="off"
                placeholder="R2 account ID…"
                value={r2AccountId}
                disabled={!isR2Profile}
                onChange={(event) => onChangeR2AccountId(event.target.value)}
              />
            </label>
            <label>
              Endpoint
              <input
                ref={profileEndpointInputRef}
                type="url"
                name="endpoint"
                inputMode="url"
                spellCheck={false}
                autoComplete="url"
                placeholder={endpointPlaceholder}
                value={profileForm.endpoint}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, endpoint: event.target.value }))
                }
              />
              {profileFieldErrors.endpoint ? (
                <span className="field-error">{profileFieldErrors.endpoint}</span>
              ) : null}
            </label>
            <label>
              Region
              <input
                ref={profileRegionInputRef}
                name="region"
                spellCheck={false}
                autoComplete="off"
                value={profileForm.region}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, region: event.target.value }))
                }
              />
              {profileFieldErrors.region ? (
                <span className="field-error">{profileFieldErrors.region}</span>
              ) : null}
            </label>
            <label>
              Bucket
              <input
                ref={profileBucketInputRef}
                name="bucket"
                spellCheck={false}
                autoComplete="off"
                placeholder="my-assets-bucket"
                value={profileForm.bucket}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, bucket: event.target.value }))
                }
              />
              {profileFieldErrors.bucket ? (
                <span className="field-error">{profileFieldErrors.bucket}</span>
              ) : null}
            </label>
            <label>
              Access Key ID
              <input
                ref={profileAccessKeyInputRef}
                name="access_key_id"
                spellCheck={false}
                autoComplete="username"
                value={profileForm.accessKeyId ?? ''}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, accessKeyId: event.target.value }))
                }
              />
              {profileFieldErrors.accessKeyId ? (
                <span className="field-error">{profileFieldErrors.accessKeyId}</span>
              ) : null}
            </label>
            <label>
              Secret Access Key
              <input
                ref={profileSecretKeyInputRef}
                type="password"
                name="secret_access_key"
                spellCheck={false}
                autoComplete="current-password"
                value={profileForm.secretAccessKey ?? ''}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    secretAccessKey: event.target.value,
                  }))
                }
              />
              {profileFieldErrors.secretAccessKey ? (
                <span className="field-error">{profileFieldErrors.secretAccessKey}</span>
              ) : null}
            </label>
          </div>

          {allowStoredSecret ? (
            <p className="minor">Leave credentials blank to keep the saved secret.</p>
          ) : null}

          <div className="row-actions">
            <button type="submit" disabled={!canSaveProfile} aria-busy={isProfileBusy}>
              <span className="button-content">
                {isProfileBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
                <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 5h8l4 4v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
                  <path d="M8 5v6h8V7.5L13.5 5H8z" />
                  <path d="M8 16h8" />
                </svg>
                <span>Save</span>
              </span>
            </button>
            <button
              type="button"
              disabled={isProfileBusy || !selectedProfileId}
              onClick={() => void onDeleteProfile()}
              aria-busy={isProfileBusy}
            >
              <span className="button-content">
                {isProfileBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
                <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" />
                  <path d="M9 7V5h6v2" />
                  <path d="M8 9v9" />
                  <path d="M12 9v9" />
                  <path d="M16 9v9" />
                  <path d="M7 18.5h10" />
                </svg>
                <span>Delete</span>
              </span>
            </button>
          </div>

          {profileFormValidationErrors.length > 0 ? (
            <ul className="validation-errors" role="alert" aria-live="assertive">
              {profileFormValidationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </form>
      </section>
    </div>
  );
};
