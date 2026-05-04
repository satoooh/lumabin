import {
  createApplicationEvent,
  type ApplicationEvent,
} from '../../events/event-bus';
import type {
  AppSettings,
  ProfileSummary,
  SaveProfileInput,
  SaveSettingsInput,
  TestConnectionResult,
} from '../../../../shared/ipc';

type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

type ProfileSecret = {
  accessKeyId: string;
  secretAccessKey: string;
};

export interface WorkspaceApplicationService {
  deleteProfile(profileId: string): Promise<void> | void;
  getSettings(): AppSettings;
  listProfiles(): ProfileSummary[];
  saveProfile(input: SaveProfileInput): Promise<ProfileSummary> | ProfileSummary;
  saveSettings(input: SaveSettingsInput): Promise<AppSettings> | AppSettings;
  testConnection(profileId: string): Promise<TestConnectionResult>;
}

export interface WorkspaceApplicationServiceDependencies {
  clearProfileCaches(profileId: string): void;
  createProfileId(): string;
  getProfile(profileId: string): StoredProfile | undefined;
  getSettings(): AppSettings;
  hasProfileSecret(profileId: string): boolean;
  isE2EFixtureProfile(profileId: string): boolean;
  listProfiles(): StoredProfile[];
  normalizePublicBaseUrls(value: unknown): Record<string, string>;
  nowIso(): string;
  persistState(): void;
  publishApplicationEvent(event: ApplicationEvent): void;
  removeProfile(profileId: string): void;
  removeProfileSecret(profileId: string): void;
  saveProfile(profile: StoredProfile): void;
  saveProfileSecret(profileId: string, secret: ProfileSecret): void;
  saveSettings(settings: AppSettings): void;
  testConnection(profileId: string): Promise<TestConnectionResult>;
}

const toProfileSummary = (
  profile: StoredProfile,
  hasProfileSecret: (profileId: string) => boolean,
): ProfileSummary => ({
  ...profile,
  hasSecret: hasProfileSecret(profile.id),
});

const toStoredProfile = (
  input: SaveProfileInput,
  options: {
    existing?: StoredProfile;
    id: string;
    now: string;
  },
): StoredProfile => ({
  id: options.id,
  name: input.name,
  provider: input.provider,
  endpoint: input.endpoint,
  region: input.region,
  bucket: input.bucket,
  createdAt: options.existing?.createdAt ?? options.now,
  updatedAt: options.now,
});

const validateProfileInput = (
  input: SaveProfileInput,
  options: { hasStoredSecret: boolean },
): void => {
  if (!input.name.trim()) {
    throw new Error('Profile name is required');
  }

  if (!input.endpoint.trim()) {
    throw new Error('Endpoint is required');
  }

  let endpointUrl: URL;
  try {
    endpointUrl = new URL(input.endpoint);
  } catch {
    throw new Error('Endpoint must be a valid URL');
  }

  if (endpointUrl.protocol !== 'https:') {
    throw new Error('Endpoint must use HTTPS');
  }

  if (!input.region.trim()) {
    throw new Error('Region is required');
  }

  if (input.provider === 'r2' && input.region !== 'auto') {
    throw new Error('Region must be auto for Cloudflare R2');
  }

  if (!input.bucket.trim()) {
    throw new Error('Bucket is required');
  }

  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(input.bucket)) {
    throw new Error('Bucket name is invalid');
  }

  const hasAccessKey = Boolean(input.accessKeyId?.trim());
  const hasSecretKey = Boolean(input.secretAccessKey?.trim());
  if (hasAccessKey !== hasSecretKey) {
    throw new Error('Access Key ID and Secret Access Key must be provided together');
  }

  if (!options.hasStoredSecret && !hasAccessKey && !hasSecretKey) {
    throw new Error('Access Key ID and Secret Access Key are required');
  }
};

export const createWorkspaceApplicationService = (
  dependencies: WorkspaceApplicationServiceDependencies,
): WorkspaceApplicationService => ({
  listProfiles: () =>
    dependencies
      .listProfiles()
      .map((profile) => toProfileSummary(profile, dependencies.hasProfileSecret)),

  saveProfile: (input) => {
    const profileId = input.id ?? dependencies.createProfileId();
    const hasStoredSecret = input.id ? dependencies.hasProfileSecret(input.id) : false;
    validateProfileInput(input, { hasStoredSecret });

    const profile = toStoredProfile(input, {
      existing: dependencies.getProfile(profileId),
      id: profileId,
      now: dependencies.nowIso(),
    });
    if (input.accessKeyId && input.secretAccessKey) {
      dependencies.saveProfileSecret(profile.id, {
        accessKeyId: input.accessKeyId,
        secretAccessKey: input.secretAccessKey,
      });
    }

    dependencies.saveProfile(profile);
    dependencies.clearProfileCaches(profile.id);
    dependencies.persistState();
    dependencies.publishApplicationEvent(
      createApplicationEvent({
        type: 'workspace.profile.saved',
        payload: {
          profileId: profile.id,
          provider: profile.provider,
          bucket: profile.bucket,
        },
      }),
    );
    return toProfileSummary(profile, dependencies.hasProfileSecret);
  },

  testConnection: async (profileId) => {
    if (dependencies.isE2EFixtureProfile(profileId)) {
      return {
        ok: true,
        message: 'E2E fixture connection is always ready.',
        checkedAt: dependencies.nowIso(),
      };
    }
    return dependencies.testConnection(profileId);
  },

  deleteProfile: (profileId) => {
    if (dependencies.isE2EFixtureProfile(profileId)) {
      return;
    }
    dependencies.clearProfileCaches(profileId);
    dependencies.removeProfile(profileId);
    dependencies.removeProfileSecret(profileId);
    dependencies.persistState();
    dependencies.publishApplicationEvent(
      createApplicationEvent({
        type: 'workspace.profile.deleted',
        payload: { profileId },
      }),
    );
  },

  getSettings: () => dependencies.getSettings(),

  saveSettings: (input) => {
    const currentSettings = dependencies.getSettings();
    const nextPublicBaseUrls =
      input.publicBaseUrls === undefined
        ? currentSettings.publicBaseUrls
        : dependencies.normalizePublicBaseUrls(input.publicBaseUrls);

    const nextSettings = {
      ...currentSettings,
      ...input,
      publicBaseUrls: nextPublicBaseUrls,
    };
    dependencies.saveSettings(nextSettings);
    dependencies.persistState();
    dependencies.publishApplicationEvent(
      createApplicationEvent({
        type: 'workspace.settings.saved',
        payload: {
          appearance: nextSettings.appearance,
          defaultConflictPolicy: nextSettings.defaultConflictPolicy,
        },
      }),
    );
    return nextSettings;
  },
});
