import { useEffect, useState, type Dispatch, type RefObject, type SetStateAction } from 'react';
import type { SaveProfileInput } from '../../shared/ipc';
import {
  ConnectionProfileFields,
  type ProfileFieldErrors,
} from './connection-profile-fields';
import { UnsavedChangesConfirmation } from './unsaved-changes-confirmation';

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
  isDiscardConfirming: boolean;
  onCancelDiscardChanges: () => void;
  onConfirmDiscardChanges: () => void;
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
  isDiscardConfirming,
  onCancelDiscardChanges,
  onConfirmDiscardChanges,
  profileFormValidationErrors,
  profileNameInputRef,
  profileEndpointInputRef,
  profileRegionInputRef,
  profileBucketInputRef,
  profileAccessKeyInputRef,
  profileSecretKeyInputRef,
}: ConnectionSetupModalProps) => {
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  useEffect(() => {
    setIsDeleteConfirming(false);
  }, [isOpen, selectedProfileId]);

  if (!isOpen) {
    return null;
  }

  const profileName = profileForm.name.trim() || 'this profile';

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

          <ConnectionProfileFields
            onChangeR2AccountId={onChangeR2AccountId}
            profileAccessKeyInputRef={profileAccessKeyInputRef}
            profileBucketInputRef={profileBucketInputRef}
            profileEndpointInputRef={profileEndpointInputRef}
            profileFieldErrors={profileFieldErrors}
            profileForm={profileForm}
            profileNameInputRef={profileNameInputRef}
            profileRegionInputRef={profileRegionInputRef}
            profileSecretKeyInputRef={profileSecretKeyInputRef}
            r2AccountId={r2AccountId}
            setProfileForm={setProfileForm}
          />

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
              onClick={() => setIsDeleteConfirming(true)}
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

          {isDiscardConfirming ? (
            <UnsavedChangesConfirmation
              title="Discard unsaved profile changes?"
              message="Your edits to this connection profile will be lost."
              onCancel={onCancelDiscardChanges}
              onConfirm={onConfirmDiscardChanges}
            />
          ) : null}

          {isDeleteConfirming && selectedProfileId ? (
            <div className="destructive-inline-confirmation" role="alert">
              <div className="destructive-inline-confirmation__copy">
                <strong>Delete {profileName}?</strong>
                <span>
                  This removes the connection profile and its saved secret from this Mac.
                </span>
              </div>
              <div className="row-actions row-actions--modal">
                <button
                  type="button"
                  disabled={isProfileBusy}
                  onClick={() => setIsDeleteConfirming(false)}
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
                  className="danger-action-button"
                  disabled={isProfileBusy}
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
                    <span>Delete profile</span>
                  </span>
                </button>
              </div>
            </div>
          ) : null}

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
