import {
  readPreviewCache,
  writePreviewCache,
} from '../../../asset-cache';
import {
  listE2EFixtureAssets,
  previewE2EFixtureAsset,
  getE2EFixtureAsset,
} from '../../../adapters/e2e-fixture-storage-adapter';
import { normalizeDestinationPrefix } from '../../../adapters/upload-planning-adapter';
import {
  normalizePreviewMaxBytes,
} from '../../../application-policies';
import {
  deleteHeadAssetInFlight,
  deletePreviewInFlight,
  getHeadAssetCache,
  getHeadAssetInFlight,
  getPreviewInFlight,
  setHeadAssetCache,
  setHeadAssetInFlight,
  setPreviewInFlight,
  toAssetScopeKey,
  toPreviewInFlightKey,
} from '../../../repositories/asset-projection-cache-repository';
import {
  getStorageObjectPreview,
  headStorageObject,
  listStorageObjects,
} from '../../../adapters/storage/storage-query-adapter';
import {
  assertProfileExists,
  getProfileSecretOrThrow,
  isE2EFixtureProfile,
} from '../../composition-helpers';
import { publishApplicationEvent } from '../../events/event-bus';
import type { AssetLibraryQueryServiceDependencies } from './query-service';
import { recordCacheMetric } from '../../../dev-metrics';

const HEAD_CACHE_TTL_MS = 90 * 1000;

export const createAssetLibraryQueryRuntimeDependencies =
  (): AssetLibraryQueryServiceDependencies => ({
    assertProfileExists,
    deleteHeadInFlight: deleteHeadAssetInFlight,
    deletePreviewInFlight,
    getFixtureAsset: getE2EFixtureAsset,
    getHeadCache: getHeadAssetCache,
    getHeadInFlight: getHeadAssetInFlight,
    getProfileSecretOrThrow,
    getPreviewInFlight,
    getStorageObjectPreview,
    headCacheTtlMs: HEAD_CACHE_TTL_MS,
    headStorageObject,
    isE2EFixtureProfile,
    listFixtureAssets: (input) =>
      listE2EFixtureAssets(input, normalizeDestinationPrefix),
    listStorageObjects,
    normalizePreviewMaxBytes,
    nowMs: Date.now,
    previewFixtureAsset: previewE2EFixtureAsset,
    readPreviewCache,
    recordHeadHit: (): void => {
      recordCacheMetric('headHit');
    },
    recordHeadInFlightHit: (): void => {
      recordCacheMetric('headInFlightHit');
    },
    recordHeadMiss: (): void => {
      recordCacheMetric('headMiss');
    },
    recordPreviewHit: (): void => {
      recordCacheMetric('previewHit');
    },
    recordPreviewInFlightHit: (): void => {
      recordCacheMetric('previewInFlightHit');
    },
    recordPreviewMiss: (): void => {
      recordCacheMetric('previewMiss');
    },
    setHeadCache: setHeadAssetCache,
    setHeadInFlight: setHeadAssetInFlight,
    setPreviewInFlight,
    publishApplicationEvent,
    toAssetScopeKey,
    toPreviewInFlightKey,
    writePreviewCache,
  });
