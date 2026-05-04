import type { IpcMain } from 'electron';
import { randomUUID } from 'node:crypto';
import {
  hasProfileSecret,
  removeProfileSecret,
  saveProfileSecret,
} from '../../../profile-secret-store';
import {
  getWorkspaceProfile,
  getWorkspaceSettings,
  listWorkspaceProfiles,
  removeWorkspaceProfile,
  saveWorkspaceProfile,
  saveWorkspaceSettings,
} from '../../../repositories/workspace-repository';
import { testStorageConnection } from '../../../adapters/storage/storage-query-adapter';
import { normalizePublicBaseUrls } from '../../../application-policies';
import {
  getProfileSecretOrThrow,
  isE2EFixtureProfile,
  nowIso,
} from '../../composition-helpers';
import { publishApplicationEvent } from '../../events/event-bus';
import { registerWorkspaceComposition } from './composition';
import {
  checkEndpointReachability,
  createWorkspaceConnectionTester,
} from './connection-service';

interface WorkspaceRuntimeDependencies {
  clearProfileCaches(profileId: string): void;
  persistState(): void;
}

export const registerWorkspaceRuntime = (
  ipcMain: IpcMain,
  dependencies: WorkspaceRuntimeDependencies,
): void => {
  const testConnection = createWorkspaceConnectionTester({
    checkEndpointReachability,
    getProfile: getWorkspaceProfile,
    getProfileSecretOrThrow,
    hasProfileSecret,
    nowIso,
    testStorageConnection,
  });

  registerWorkspaceComposition(ipcMain, {
    clearProfileCaches: dependencies.clearProfileCaches,
    createProfileId: randomUUID,
    getProfile: getWorkspaceProfile,
    getSettings: getWorkspaceSettings,
    hasProfileSecret,
    isE2EFixtureProfile,
    listProfiles: listWorkspaceProfiles,
    normalizePublicBaseUrls,
    nowIso,
    persistState: dependencies.persistState,
    publishApplicationEvent,
    removeProfile: removeWorkspaceProfile,
    removeProfileSecret,
    saveProfile: saveWorkspaceProfile,
    saveProfileSecret,
    saveSettings: saveWorkspaceSettings,
    testConnection,
  });
};
