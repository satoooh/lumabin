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
import type {
  AssetMetadata,
  DeleteAssetsInput,
  DeleteResult,
  MoveAssetInput,
  MoveResult,
  RenameAssetInput,
  RenameResult,
} from '../../../../shared/ipc';

const toRenameResult = (input: RenameAssetInput): RenameResult => ({
  ok: true,
  fromKey: input.fromKey,
  toKey: input.toKey,
});

const toMoveResult = (input: MoveAssetInput): MoveResult => ({
  ok: true,
  fromKey: input.fromKey,
  toKey: input.toKey,
});

const createRuntimeEtagSuffix = (): string => randomUUID().slice(0, 8);

const mutateRuntimeAsset = (
  input: RenameAssetInput | MoveAssetInput,
  options: { etagPrefix: string },
): void => {
  const source = getE2EFixtureAsset(input.fromKey);
  if (!source) {
    throw new Error(`Asset not found: ${input.fromKey}`);
  }

  const next: AssetMetadata = {
    ...source,
    key: input.toKey,
    lastModified: nowIso(),
    etag: `"${options.etagPrefix}-${createRuntimeEtagSuffix()}"`,
  };
  saveE2EFixtureAsset(input.toKey, next);
  deleteE2EFixtureAsset(input.fromKey);
};

const deleteRuntimeAssets = (input: DeleteAssetsInput): DeleteResult => {
  const deleted: string[] = [];
  const skipped: string[] = [];
  for (const key of input.keys) {
    if (deleteE2EFixtureAsset(key)) {
      deleted.push(key);
    } else {
      skipped.push(key);
    }
  }
  return { deleted, skipped };
};

export const registerAssetLibraryRuntime = (ipcMain: IpcMain): void => {
  registerAssetLibraryComposition(ipcMain, {
    commands: {
      assertProfileExists,
      copyStorageObject,
      deleteAssetsOverride: async (input) =>
        isE2EFixtureProfile(input.profileId) ? deleteRuntimeAssets(input) : undefined,
      deleteStorageObjects,
      getProfileSecretOrThrow,
      moveAssetOverride: async (input) => {
        if (!isE2EFixtureProfile(input.profileId)) {
          return undefined;
        }
        mutateRuntimeAsset(input, { etagPrefix: 'e2e-move' });
        return toMoveResult(input);
      },
      publishApplicationEvent,
      renameAssetOverride: async (input) => {
        if (!isE2EFixtureProfile(input.profileId)) {
          return undefined;
        }
        mutateRuntimeAsset(input, { etagPrefix: 'e2e-rename' });
        return toRenameResult(input);
      },
    },
    queries: {
      ...createAssetLibraryQueryRuntimeDependencies(),
    },
  });
};
