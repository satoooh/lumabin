import type {
  Dispatch,
  RefObject,
  SetStateAction,
} from 'react';
import type { SaveProfileInput } from '../../shared/ipc';

export type ProfileFieldErrors = Partial<Record<
  'name' | 'endpoint' | 'region' | 'bucket' | 'accessKeyId' | 'secretAccessKey',
  string
>>;

interface ConnectionProfileFieldsProps {
  onChangeR2AccountId: (value: string) => void;
  profileAccessKeyInputRef: RefObject<HTMLInputElement | null>;
  profileBucketInputRef: RefObject<HTMLInputElement | null>;
  profileEndpointInputRef: RefObject<HTMLInputElement | null>;
  profileFieldErrors: ProfileFieldErrors;
  profileForm: SaveProfileInput;
  profileNameInputRef: RefObject<HTMLInputElement | null>;
  profileRegionInputRef: RefObject<HTMLInputElement | null>;
  profileSecretKeyInputRef: RefObject<HTMLInputElement | null>;
  r2AccountId: string;
  setProfileForm: Dispatch<SetStateAction<SaveProfileInput>>;
}

export const ConnectionProfileFields = ({
  onChangeR2AccountId,
  profileAccessKeyInputRef,
  profileBucketInputRef,
  profileEndpointInputRef,
  profileFieldErrors,
  profileForm,
  profileNameInputRef,
  profileRegionInputRef,
  profileSecretKeyInputRef,
  r2AccountId,
  setProfileForm,
}: ConnectionProfileFieldsProps) => {
  const isR2Profile = profileForm.provider === 'r2';
  const profileNamePlaceholder = isR2Profile ? 'My R2 Profile…' : 'My S3 Profile…';
  const endpointPlaceholder = isR2Profile
    ? 'https://example-account.r2.cloudflarestorage.com'
    : 'https://s3.example.com';

  return (
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
  );
};
