import type { IpcMain } from 'electron';
import { randomUUID } from 'node:crypto';
import { queryE2EFixtureAssets } from '../../../adapters/e2e-fixture-storage-adapter';
import { recordCacheMetric } from '../../../dev-metrics';
import {
  getSearchSnapshotCache,
  setSearchSnapshotCache,
} from '../../../repositories/asset-projection-cache-repository';
import {
  deleteSavedView,
  listSavedViews,
  saveSavedView,
} from '../../../repositories/saved-view-repository';
import { sqliteAssetSearchReadModelRepository } from '../../../repositories/sqlite-asset-search-read-model-repository';
import { listStorageObjects } from '../../../adapters/storage/storage-query-adapter';
import {
  assertProfileExists,
  getProfileSecretOrThrow,
  isE2EFixtureProfile,
  nowIso,
} from '../../composition-helpers';
import { publishApplicationEvent } from '../../events/event-bus';
import { registerAssetDiscoveryComposition } from './composition';
import { createSearchIndexBootstrapper } from './index-bootstrapper';

const SEARCH_QUERY_CACHE_TTL_MS = 20 * 1000;

interface AssetDiscoveryRuntimeDependencies {
  persistState(): void;
}

export const registerAssetDiscoveryRuntime = (
  ipcMain: IpcMain,
  dependencies: AssetDiscoveryRuntimeDependencies,
): void => {
  const ensureSearchIndexBootstrapped = createSearchIndexBootstrapper({
    listStorageObjects,
    searchReadModelWriter: sqliteAssetSearchReadModelRepository,
  });

  registerAssetDiscoveryComposition(ipcMain, {
    assertProfileExists,
    createSavedViewId: randomUUID,
    deleteSavedView,
    ensureSearchIndexBootstrapped,
    getProfileSecretOrThrow,
    getSearchSnapshot: getSearchSnapshotCache,
    isE2EFixtureProfile,
    listSavedViews,
    nowIso,
    nowMs: Date.now,
    persistState: dependencies.persistState,
    publishApplicationEvent,
    queryFixtureAssets: queryE2EFixtureAssets,
    recordSearchSnapshotHit: (): void => {
      recordCacheMetric('searchSnapshotHit');
    },
    recordSearchSnapshotMiss: (): void => {
      recordCacheMetric('searchSnapshotMiss');
    },
    saveView: saveSavedView,
    searchReadModelReader: sqliteAssetSearchReadModelRepository,
    searchSnapshotTtlMs: SEARCH_QUERY_CACHE_TTL_MS,
    setSearchSnapshot: setSearchSnapshotCache,
  });
};
