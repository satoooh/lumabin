import type { AppSettings, SavedView } from '../shared/ipc';
import type { StoredProfile } from './repositories/workspace-repository';

interface PersistentState {
  profiles: StoredProfile[];
  savedViews: SavedView[];
  settings: AppSettings;
  encodedSecrets: Record<string, string>;
}

interface PersistentStateBridgeDependencies {
  exportEncodedSecrets(): Record<string, string>;
  getSettings(): AppSettings;
  hydrateSavedViews(savedViews: SavedView[]): void;
  hydrateWorkspaceState(profiles: StoredProfile[], settings: AppSettings): void;
  listProfiles(): StoredProfile[];
  listSavedViews(): SavedView[];
  loadPersistentState(): PersistentState;
  normalizePublicBaseUrls(value: unknown): Record<string, string>;
  replaceEncodedSecrets(encodedSecrets: Record<string, string>): void;
  savePersistentState(state: PersistentState): void;
}

interface PersistentStateBridge {
  hydrateState(): void;
  persistState(): void;
}

export const createPersistentStateBridge = (
  dependencies: PersistentStateBridgeDependencies,
): PersistentStateBridge => ({
  persistState: (): void => {
    dependencies.savePersistentState({
      profiles: dependencies.listProfiles(),
      savedViews: dependencies.listSavedViews(),
      settings: dependencies.getSettings(),
      encodedSecrets: dependencies.exportEncodedSecrets(),
    });
  },
  hydrateState: (): void => {
    const persisted = dependencies.loadPersistentState();

    dependencies.hydrateSavedViews(persisted.savedViews);
    dependencies.hydrateWorkspaceState(persisted.profiles, {
      ...dependencies.getSettings(),
      ...persisted.settings,
      publicBaseUrls: dependencies.normalizePublicBaseUrls(
        persisted.settings.publicBaseUrls,
      ),
    });

    dependencies.replaceEncodedSecrets(persisted.encodedSecrets);
  },
});

interface E2EFixtureStateDependencies {
  e2eFixtureProfileId: string;
  e2eFixturePublicBaseUrl: string;
  getProfile(profileId: string): StoredProfile | undefined;
  getSettings(): AppSettings;
  hasProfileSecret(profileId: string): boolean;
  isE2EFixtureMode: boolean;
  nowIso(): string;
  saveProfile(profile: StoredProfile): void;
  saveProfileSecret(
    profileId: string,
    secret: { accessKeyId: string; secretAccessKey: string },
  ): void;
  saveSettings(settings: AppSettings): void;
  seedE2EFixtureAssets(): void;
}

export const ensureE2EFixtureState = (
  dependencies: E2EFixtureStateDependencies,
): void => {
  if (!dependencies.isE2EFixtureMode) {
    return;
  }

  dependencies.seedE2EFixtureAssets();
  const now = dependencies.nowIso();
  const profile = dependencies.getProfile(dependencies.e2eFixtureProfileId);
  dependencies.saveProfile({
    id: dependencies.e2eFixtureProfileId,
    name: 'E2E Fixture',
    provider: 'r2',
    endpoint: 'https://e2e-fixture.r2.cloudflarestorage.com',
    region: 'auto',
    bucket: 'e2e-fixture-bucket',
    createdAt: profile?.createdAt ?? now,
    updatedAt: now,
  });

  if (!dependencies.hasProfileSecret(dependencies.e2eFixtureProfileId)) {
    dependencies.saveProfileSecret(dependencies.e2eFixtureProfileId, {
      accessKeyId: 'e2e-access-key',
      secretAccessKey: 'e2e-secret-key',
    });
  }

  const currentSettings = dependencies.getSettings();
  dependencies.saveSettings({
    ...currentSettings,
    publicBaseUrls: {
      ...currentSettings.publicBaseUrls,
      [dependencies.e2eFixtureProfileId]: dependencies.e2eFixturePublicBaseUrl,
    },
  });
};
