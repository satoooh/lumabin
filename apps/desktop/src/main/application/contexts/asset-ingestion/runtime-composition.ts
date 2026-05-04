import { basename } from 'node:path';
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
import type {
  CheckUploadConflictsInput,
  CheckUploadConflictsResult,
  StartUploadInput,
  UploadJobStatus,
} from '../../../../shared/ipc';

interface AssetIngestionRuntimeDependencies {
  clearObjectMutation(profileId: string, key: string): void;
}

export interface AssetIngestionRuntime {
  dispose(): void;
}

const normalizeConflictPreviewLimit = (limit: number | undefined): number =>
  Math.max(1, Math.min(100, limit ?? 8));

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

  const createUploadJob = (input: StartUploadInput): UploadJobStatus =>
    createUploadJobStatus(input, {
      createUploadJobId: randomUUID,
      getDefaultConflictPolicy: () => getWorkspaceSettings().defaultConflictPolicy,
      normalizeDestinationPrefix,
      nowIso,
    });

  const markUploadJobFailed = (
    jobId: string,
    normalizedInput: StartUploadInput,
    error: unknown,
  ): void => {
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
  };

  const checkUploadConflictsOverride = (
    input: CheckUploadConflictsInput,
  ): CheckUploadConflictsResult | undefined => {
    if (!isE2EFixtureProfile(input.profileId)) {
      return undefined;
    }

    const limit = normalizeConflictPreviewLimit(
      input.limit ?? UPLOAD_CONFLICT_PREVIEW_DEFAULT_LIMIT,
    );
    const conflicts: CheckUploadConflictsResult['conflicts'] = [];
    let totalConflicts = 0;
    const seen = new Set<string>();
    const normalizedPrefix = normalizeDestinationPrefix(input.destinationPrefix);
    for (const source of input.sources) {
      const relativePath = sourceRelativePathOrFileName(source);
      const key = `${normalizedPrefix}${relativePath}`;
      const hasConflict = seen.has(key) || hasE2EFixtureAsset(key);
      seen.add(key);
      if (!hasConflict) {
        continue;
      }
      totalConflicts += 1;
      if (conflicts.length < limit) {
        conflicts.push({
          sourcePath: source.path,
          fileName: basename(relativePath),
          key,
        });
      }
    }
    return { conflicts, totalConflicts };
  };

  const startUploadOverride = (input: StartUploadInput): string | undefined => {
    if (!isE2EFixtureProfile(input.profileId)) {
      return undefined;
    }
    if (input.sources.length === 0) {
      throw new Error('At least one source file is required');
    }
    const normalizedInput: StartUploadInput = {
      ...input,
      sources: dedupeUploadSources(input.sources),
    };
    const job = createUploadJob(normalizedInput);
    saveUploadJob(job);
    void runE2EFixtureUploadJob(job.id, normalizedInput, {
      createEtagSuffix: () => randomUUID().slice(0, 8),
      getDefaultConflictPolicy: () => getWorkspaceSettings().defaultConflictPolicy,
      inferContentTypeFromKey,
      normalizeDestinationPrefix,
      nowIso,
      sourceRelativePathOrFileName,
      splitFileName,
      updateUploadJob,
    }).catch((error) => {
      markUploadJobFailed(job.id, normalizedInput, error);
    });
    return job.id;
  };

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
    checkUploadConflictsOverride,
    createUploadJob,
    expandUploadSources,
    getProfileSecretOrThrow,
    getUploadJob,
    markUploadJobFailed,
    normalizeClipboardFileName,
    persistClipboardBytes,
    readSystemClipboardPng,
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
    startUploadOverride,
    toClipboardBytes,
  });

  return {
    dispose: disposeUploadJobStatusEvents,
  };
};
