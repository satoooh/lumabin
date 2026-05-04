import { useMemo } from 'react';
import type { ProfileSummary, SaveProfileInput } from '../../shared/ipc';

type ProfileFieldKey =
  | 'name'
  | 'endpoint'
  | 'region'
  | 'bucket'
  | 'accessKeyId'
  | 'secretAccessKey';

export type ProfileFieldErrors = Partial<Record<ProfileFieldKey, string>>;

interface NormalizedProfileDraft {
  id?: string;
  name: string;
  provider: SaveProfileInput['provider'];
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface UseProfileFormStateOptions {
  isCreatingProfile: boolean;
  profileForm: SaveProfileInput;
  profiles: ProfileSummary[];
  selectedProfile?: ProfileSummary;
}

export const initialProfileForm: SaveProfileInput = {
  name: 'My R2 Profile',
  provider: 'r2',
  endpoint: '',
  region: 'auto',
  bucket: '',
  accessKeyId: '',
  secretAccessKey: '',
};

export const r2EndpointFromAccountId = (accountId: string): string =>
  `https://${accountId}.r2.cloudflarestorage.com`;

export const extractR2AccountId = (endpoint: string): string => {
  const matched = endpoint.match(
    /^https:\/\/([a-z0-9]{6,64})\.r2\.cloudflarestorage\.com\/?$/i,
  );
  return matched?.[1] ?? '';
};

const validateBucketName = (bucket: string): boolean => {
  return /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket);
};

export const normalizeProfileDraft = (form: SaveProfileInput): NormalizedProfileDraft => ({
  id: form.id,
  name: form.name.trim(),
  provider: form.provider,
  endpoint: form.endpoint.trim(),
  region: form.region.trim(),
  bucket: form.bucket.trim(),
  accessKeyId: form.accessKeyId?.trim() ?? '',
  secretAccessKey: form.secretAccessKey?.trim() ?? '',
});

export const sanitizeProfileForSave = (form: SaveProfileInput): SaveProfileInput => {
  const normalized = normalizeProfileDraft(form);
  return {
    id: normalized.id,
    name: normalized.name,
    provider: normalized.provider,
    endpoint: normalized.endpoint,
    region: normalized.region,
    bucket: normalized.bucket,
    accessKeyId: normalized.accessKeyId || undefined,
    secretAccessKey: normalized.secretAccessKey || undefined,
  };
};

export const validateProfileForm = (
  form: SaveProfileInput,
  options: { allowStoredSecret: boolean },
): string[] => {
  const errors: string[] = [];

  if (!form.name.trim()) {
    errors.push('Name is required.');
  }

  if (!form.endpoint.trim()) {
    errors.push('Endpoint is required.');
  } else {
    try {
      const endpointUrl = new URL(form.endpoint);
      if (endpointUrl.protocol !== 'https:') {
        errors.push('Endpoint must use HTTPS.');
      }
    } catch {
      errors.push('Endpoint must be a valid URL.');
    }
  }

  if (!form.region.trim()) {
    errors.push('Region is required.');
  }

  if (form.provider === 'r2' && form.region !== 'auto') {
    errors.push('Region must be "auto" for Cloudflare R2.');
  }

  if (!form.bucket.trim()) {
    errors.push('Bucket is required.');
  } else if (!validateBucketName(form.bucket)) {
    errors.push('Bucket name must be S3-compatible (lowercase letters, digits, dot, hyphen).');
  }

  const hasAccessKey = Boolean(form.accessKeyId?.trim());
  const hasSecretKey = Boolean(form.secretAccessKey?.trim());

  if (hasAccessKey !== hasSecretKey) {
    errors.push('Access Key ID and Secret Access Key must be provided together.');
  }

  if (!options.allowStoredSecret && !hasAccessKey && !hasSecretKey) {
    errors.push('Access Key ID is required.');
    errors.push('Secret Access Key is required.');
  }

  return errors;
};

export const resolveProfileValidationField = (
  errorMessage: string,
): ProfileFieldKey | undefined => {
  const normalized = errorMessage.toLowerCase();
  if (normalized.includes('endpoint')) {
    return 'endpoint';
  }
  if (normalized.includes('region')) {
    return 'region';
  }
  if (normalized.includes('bucket')) {
    return 'bucket';
  }
  if (normalized.includes('access key id')) {
    return 'accessKeyId';
  }
  if (normalized.includes('secret access key')) {
    return 'secretAccessKey';
  }
  if (normalized.includes('name')) {
    return 'name';
  }
  return undefined;
};

export const deriveProfileFieldErrors = (
  validationErrors: string[],
): ProfileFieldErrors => {
  const errors: ProfileFieldErrors = {};
  for (const errorMessage of validationErrors) {
    const field = resolveProfileValidationField(errorMessage);
    if (field) {
      errors[field] ??= errorMessage;
    }
  }
  return errors;
};

export const useProfileFormState = ({
  isCreatingProfile,
  profileForm,
  profiles,
  selectedProfile,
}: UseProfileFormStateOptions) => {
  const editingProfile = useMemo(
    () => profiles.find((profile) => profile.id === profileForm.id),
    [profiles, profileForm.id],
  );

  const allowStoredSecret = Boolean(editingProfile?.hasSecret);
  const profileFormBaseline = useMemo(
    () =>
      normalizeProfileDraft(
        isCreatingProfile || !selectedProfile
          ? initialProfileForm
          : {
              id: selectedProfile.id,
              name: selectedProfile.name,
              provider: selectedProfile.provider,
              endpoint: selectedProfile.endpoint,
              region: selectedProfile.region,
              bucket: selectedProfile.bucket,
              accessKeyId: '',
              secretAccessKey: '',
            },
      ),
    [isCreatingProfile, selectedProfile],
  );
  const normalizedProfileForm = useMemo(() => normalizeProfileDraft(profileForm), [profileForm]);
  const isProfileFormDirty = useMemo(
    () =>
      normalizedProfileForm.name !== profileFormBaseline.name ||
      normalizedProfileForm.provider !== profileFormBaseline.provider ||
      normalizedProfileForm.endpoint !== profileFormBaseline.endpoint ||
      normalizedProfileForm.region !== profileFormBaseline.region ||
      normalizedProfileForm.bucket !== profileFormBaseline.bucket ||
      normalizedProfileForm.accessKeyId !== profileFormBaseline.accessKeyId ||
      normalizedProfileForm.secretAccessKey !== profileFormBaseline.secretAccessKey,
    [normalizedProfileForm, profileFormBaseline],
  );

  const profileFormValidationErrors = useMemo(
    () => validateProfileForm(profileForm, { allowStoredSecret }),
    [allowStoredSecret, profileForm],
  );
  const profileFieldErrors = useMemo(
    () => deriveProfileFieldErrors(profileFormValidationErrors),
    [profileFormValidationErrors],
  );

  return {
    allowStoredSecret,
    isProfileFormDirty,
    profileFieldErrors,
    profileFormValidationErrors,
  };
};
