import type { AppSettings, ProfileSummary } from '../../shared/ipc';

export type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

const profiles = new Map<string, StoredProfile>();

let settings: AppSettings = {
  appearance: 'system',
  defaultConflictPolicy: 'rename',
  presignedUrlTTLSeconds: 900,
  uploadOptimizeImagesBeforeUpload: false,
  publicBaseUrls: {},
};

export const hydrateWorkspaceState = (
  nextProfiles: StoredProfile[],
  nextSettings: AppSettings,
): void => {
  profiles.clear();
  for (const profile of nextProfiles) {
    profiles.set(profile.id, profile);
  }
  settings = nextSettings;
};

export const listWorkspaceProfiles = (): StoredProfile[] => [...profiles.values()];

export const getWorkspaceProfile = (
  profileId: string,
): StoredProfile | undefined => profiles.get(profileId);

export const assertWorkspaceProfileExists = (profileId: string): StoredProfile => {
  const profile = profiles.get(profileId);
  if (!profile) {
    throw new Error(`Profile not found: ${profileId}`);
  }
  return profile;
};

export const saveWorkspaceProfile = (profile: StoredProfile): void => {
  profiles.set(profile.id, profile);
};

export const removeWorkspaceProfile = (profileId: string): void => {
  profiles.delete(profileId);
};

export const getWorkspaceSettings = (): AppSettings => settings;

export const saveWorkspaceSettings = (nextSettings: AppSettings): void => {
  settings = nextSettings;
};
