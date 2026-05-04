import type { IpcMain } from 'electron';
import { randomUUID } from 'node:crypto';
import {
  deleteE2EFixtureAsset,
  getE2EFixtureAsset,
  saveE2EFixtureAsset,
} from '../../../adapters/e2e-fixture-storage-adapter';
import {
  copyStorageObject,
  deleteStorageObjects,
} from '../../../adapters/storage/storage-mutation-adapter';
import {
  assertProfileExists,
  getProfileSecretOrThrow,
  isE2EFixtureProfile,
  nowIso,
} from '../../composition-helpers';
import { publishApplicationEvent } from '../../events/event-bus';
import { registerAssetLibraryComposition } from './composition';
import { createAssetLibraryQueryRuntimeDependencies } from './query-runtime-composition';

export const registerAssetLibraryRuntime = (ipcMain: IpcMain): void => {
  registerAssetLibraryComposition(ipcMain, {
    commands: {
      assertProfileExists,
      copyStorageObject,
      createEtagSuffix: () => randomUUID().slice(0, 8),
      deleteFixtureAsset: deleteE2EFixtureAsset,
      deleteStorageObjects,
      getFixtureAsset: getE2EFixtureAsset,
      getProfileSecretOrThrow,
      isE2EFixtureProfile,
      nowIso,
      publishApplicationEvent,
      saveFixtureAsset: saveE2EFixtureAsset,
    },
    queries: {
      ...createAssetLibraryQueryRuntimeDependencies(),
    },
  });
};
