import type { IpcMain } from 'electron';
import { randomUUID } from 'node:crypto';
import {
  hasE2EFixtureAsset,
  runE2EFixtureUploadJob,
} from '../../../adapters/e2e-fixture-storage-adapter';
import { runStorageUploadJob } from '../../../adapters/storage-upload-runner-adapter';
import {
  checkStorageUploadConflicts,
  dedupeUploadSources,
  expandUploadSources,
  normalizeDestinationPrefix,
  sourceRelativePathOrFileName,
  splitFileName,
  toUploadErrorMessage,
} from '../../../adapters/upload-planning-adapter';
import {
  createUploadJobStatus,
  inferContentTypeFromKey,
  isAbortError,
  UPLOAD_CONFLICT_PREVIEW_DEFAULT_LIMIT,
  UPLOAD_IMAGE_OPTIMIZE_MAX_WIDTH_PX,
  UPLOAD_IMAGE_OPTIMIZE_WEBP_QUALITY,
} from '../../../application-policies';
import {
  normalizeClipboardFileName,
  persistClipboardBytes,
  readSystemClipboardPng,
  toClipboardBytes,
} from '../../../clipboard-upload-adapter';
import {
  abortUploadJob,
  deleteUploadAbortController,
  getUploadAbortController,
  getUploadJob,
  saveUploadJob,
  saveUploadJobStatus,
  setUploadAbortController,
  setUploadJobStatusChangeHandler,
  updateUploadJob,
} from '../../../repositories/upload-job-repository';
import { getWorkspaceSettings } from '../../../repositories/workspace-repository';
import {
  assertProfileExists,
  getProfileSecretOrThrow,
  isE2EFixtureProfile,
  nowIso,
} from '../../composition-helpers';
import {
  createApplicationEvent,
  publishApplicationEvent,
} from '../../events/event-bus';
import { registerAssetIngestionComposition } from './composition';

interface AssetIngestionRuntimeDependencies {
  clearObjectMutation(profileId: string, key: string): void;
}

export interface AssetIngestionRuntime {
  dispose(): void;
}

export const registerAssetIngestionRuntime = (
  ipcMain: IpcMain,
  dependencies: AssetIngestionRuntimeDependencies,
): AssetIngestionRuntime => {
  const disposeUploadJobStatusEvents = setUploadJobStatusChangeHandler((change) => {
    publishApplicationEvent(
      createApplicationEvent({
        type: 'asset-ingestion.upload-job.status-changed',
        payload: change,
      }),
    );
  });

  registerAssetIngestionComposition(ipcMain, {
    abortUploadJob,
    assertProfileExists,
    checkStorageUploadConflicts: (profile, secret, input) =>
      checkStorageUploadConflicts(
        profile,
        secret,
        input,
        UPLOAD_CONFLICT_PREVIEW_DEFAULT_LIMIT,
      ),
    createUploadJob: (input) =>
      createUploadJobStatus(input, {
        createUploadJobId: randomUUID,
        getDefaultConflictPolicy: () => getWorkspaceSettings().defaultConflictPolicy,
        normalizeDestinationPrefix,
        nowIso,
      }),
    dedupeUploadSources,
    expandUploadSources,
    fixtureAssetExists: hasE2EFixtureAsset,
    getProfileSecretOrThrow,
    getUploadJob,
    isE2EFixtureProfile,
    markUploadJobFailed: (jobId, normalizedInput, error): void => {
      updateUploadJob(jobId, (current) => ({
        ...current,
        status: 'failed',
        failedItems: Math.max(current.failedItems, current.totalItems),
        failedSources:
          current.failedSources.length > 0
            ? current.failedSources
            : [...normalizedInput.sources],
        lastError: toUploadErrorMessage(error),
        updatedAt: nowIso(),
      }));
    },
    normalizeClipboardFileName,
    normalizeDestinationPrefix,
    persistClipboardBytes,
    readSystemClipboardPng,
    runE2EFixtureUploadJob: (jobId, input): Promise<void> =>
      runE2EFixtureUploadJob(jobId, input, {
        createEtagSuffix: () => randomUUID().slice(0, 8),
        getDefaultConflictPolicy: () => getWorkspaceSettings().defaultConflictPolicy,
        inferContentTypeFromKey,
        normalizeDestinationPrefix,
        nowIso,
        sourceRelativePathOrFileName,
        splitFileName,
        updateUploadJob,
      }),
    runUploadJob: (jobId, input): Promise<void> =>
      runStorageUploadJob(jobId, input, {
        assertProfileExists,
        clearObjectMutation: dependencies.clearObjectMutation,
        dedupeUploadSources,
        deleteUploadAbortController,
        getDefaultConflictPolicy: () => getWorkspaceSettings().defaultConflictPolicy,
        getProfileSecretOrThrow,
        getUploadAbortController,
        getUploadJob,
        getUploadOptimizationSettings: () => ({
          enabled: getWorkspaceSettings().uploadOptimizeImagesBeforeUpload,
          maxWidthPx: UPLOAD_IMAGE_OPTIMIZE_MAX_WIDTH_PX,
          webpQuality: UPLOAD_IMAGE_OPTIMIZE_WEBP_QUALITY,
        }),
        inferContentTypeFromKey,
        isAbortError,
        normalizeDestinationPrefix,
        nowIso,
        publishAssetObservation: ({ bucket, item, profileId }) => {
          publishApplicationEvent(
            createApplicationEvent({
              type: 'asset-library.assets.observed',
              payload: {
                profileId,
                bucket,
                items: [item],
              },
            }),
          );
        },
        setUploadAbortController,
        sourceRelativePathOrFileName,
        splitFileName,
        toUploadErrorMessage,
        updateUploadJob,
      }),
    saveUploadJob,
    saveUploadJobStatus,
    sourceRelativePathOrFileName,
    toClipboardBytes,
    uploadConflictPreviewDefaultLimit: UPLOAD_CONFLICT_PREVIEW_DEFAULT_LIMIT,
  });

  return {
    dispose: disposeUploadJobStatusEvents,
  };
};
