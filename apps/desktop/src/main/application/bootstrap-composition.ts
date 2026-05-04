import {
  E2E_FIXTURE_PROFILE_ID,
  E2E_FIXTURE_PUBLIC_BASE_URL,
  seedE2EFixtureAssets,
} from '../adapters/e2e-fixture-storage-adapter';
import {
  createPersistentStateBridge,
  ensureE2EFixtureState,
} from '../application-bootstrap';
import { normalizePublicBaseUrls } from '../application-policies';
import { isE2EFixtureMode } from '../e2e-runtime';
import { loadPersistentState, savePersistentState } from '../persistent-state';
import {
  exportEncodedSecrets,
  hasProfileSecret,
  replaceEncodedSecrets,
  saveProfileSecret,
} from '../profile-secret-store';
import {
  hydrateSavedViews,
  listSavedViews,
} from '../repositories/saved-view-repository';
import {
  getWorkspaceProfile,
  getWorkspaceSettings,
  hydrateWorkspaceState,
  listWorkspaceProfiles,
  saveWorkspaceProfile,
  saveWorkspaceSettings,
} from '../repositories/workspace-repository';
import { nowIso } from './composition-helpers';

export interface ApplicationStateComposition {
  persistState(): void;
}

export const bootstrapApplicationState = (): ApplicationStateComposition => {
  const persistentStateBridge = createPersistentStateBridge({
    exportEncodedSecrets,
    getSettings: getWorkspaceSettings,
    hydrateSavedViews,
    hydrateWorkspaceState,
    listProfiles: listWorkspaceProfiles,
    listSavedViews,
    loadPersistentState,
    normalizePublicBaseUrls,
    replaceEncodedSecrets,
    savePersistentState,
  });
  const { hydrateState, persistState } = persistentStateBridge;

  hydrateState();
  ensureE2EFixtureState({
    e2eFixtureProfileId: E2E_FIXTURE_PROFILE_ID,
    e2eFixturePublicBaseUrl: E2E_FIXTURE_PUBLIC_BASE_URL,
    getProfile: getWorkspaceProfile,
    getSettings: getWorkspaceSettings,
    hasProfileSecret,
    isE2EFixtureMode,
    nowIso,
    saveProfile: saveWorkspaceProfile,
    saveProfileSecret,
    saveSettings: saveWorkspaceSettings,
    seedE2EFixtureAssets,
  });

  return { persistState };
};
