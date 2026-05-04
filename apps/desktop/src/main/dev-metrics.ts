import type { DevMetricsSnapshot } from '../shared/ipc';

type StorageMetricKey =
  | 'listCalls'
  | 'headCalls'
  | 'getCalls'
  | 'putCalls'
  | 'existsChecks'
  | 'testConnectionCalls';

type CacheMetricKey =
  | 'previewHit'
  | 'previewMiss'
  | 'previewInFlightHit'
  | 'headHit'
  | 'headMiss'
  | 'headInFlightHit'
  | 'searchSnapshotHit'
  | 'searchSnapshotMiss';

interface DevMetricsState {
  cache: DevMetricsSnapshot['cache'];
  storage: DevMetricsSnapshot['storage'];
}

const initialState = (): DevMetricsState => ({
  cache: {
    previewHit: 0,
    previewMiss: 0,
    previewInFlightHit: 0,
    headHit: 0,
    headMiss: 0,
    headInFlightHit: 0,
    searchSnapshotHit: 0,
    searchSnapshotMiss: 0,
  },
  storage: {
    listCalls: 0,
    headCalls: 0,
    getCalls: 0,
    putCalls: 0,
    existsChecks: 0,
    testConnectionCalls: 0,
    failures: 0,
    bytesDownloaded: 0,
    bytesUploaded: 0,
  },
});

let state: DevMetricsState = initialState();

export const recordStorageMetric = (
  key: StorageMetricKey,
): void => {
  state.storage[key] += 1;
};

export const recordStorageFailure = (): void => {
  state.storage.failures += 1;
};

export const addStorageTransferredBytes = (options: {
  bytesDownloaded?: number;
  bytesUploaded?: number;
}): void => {
  if (options.bytesDownloaded) {
    state.storage.bytesDownloaded += options.bytesDownloaded;
  }
  if (options.bytesUploaded) {
    state.storage.bytesUploaded += options.bytesUploaded;
  }
};

export const recordCacheMetric = (key: CacheMetricKey): void => {
  state.cache[key] += 1;
};

export const getDevMetricsSnapshot = (): DevMetricsSnapshot => ({
  collectedAt: new Date().toISOString(),
  cache: { ...state.cache },
  storage: { ...state.storage },
});

export const resetDevMetrics = (): DevMetricsSnapshot => {
  state = initialState();
  return getDevMetricsSnapshot();
};
