import { basename } from 'node:path';
import { maybeOptimizeImageForUpload } from '../image-optimize';
import { storageObjectExists } from './storage/storage-query-adapter';
import {
  uploadStorageObject,
} from './storage/storage-mutation-adapter';
import type {
  AssetItem,
  ProfileSummary,
  StartUploadInput,
  UploadJobStatus,
  UploadSource,
} from '../../shared/ipc';

type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

type ProfileSecret = {
  accessKeyId: string;
  secretAccessKey: string;
};

interface UploadOptimizationSettings {
  enabled: boolean;
  maxWidthPx: number;
  webpQuality: number;
}

interface RunStorageUploadJobDependencies {
  assertProfileExists(profileId: string): StoredProfile;
  clearObjectMutation(profileId: string, key: string): void;
  dedupeUploadSources(sources: UploadSource[]): UploadSource[];
  deleteUploadAbortController(jobId: string): void;
  getDefaultConflictPolicy(): StartUploadInput['conflictPolicy'];
  getProfileSecretOrThrow(profileId: string): ProfileSecret;
  getUploadAbortController(jobId: string): AbortController | undefined;
  getUploadJob(jobId: string): UploadJobStatus | undefined;
  getUploadOptimizationSettings(): UploadOptimizationSettings;
  inferContentTypeFromKey(key: string): string;
  isAbortError(error: unknown): boolean;
  normalizeDestinationPrefix(value: string): string;
  nowIso(): string;
  publishAssetObservation(input: { profileId: string; bucket: string; item: AssetItem }): void;
  setUploadAbortController(jobId: string, controller: AbortController): void;
  sourceRelativePathOrFileName(source: UploadSource, resolvedFileName?: string): string;
  splitFileName(fileName: string): { stem: string; ext: string };
  toUploadErrorMessage(error: unknown, source?: UploadSource): string;
  updateUploadJob(jobId: string, updater: (job: UploadJobStatus) => UploadJobStatus): void;
}

const toInitialDestinationKey = (
  destinationPrefix: string,
  source: UploadSource,
  dependencies: RunStorageUploadJobDependencies,
  sourceFileName?: string,
): string => {
  const relativePath = dependencies.sourceRelativePathOrFileName(
    source,
    sourceFileName,
  );
  return `${dependencies.normalizeDestinationPrefix(destinationPrefix)}${relativePath}`;
};

const resolveDestinationKey = async (options: {
  profile: StoredProfile;
  secret: ProfileSecret;
  destinationPrefix: string;
  source: UploadSource;
  dependencies: RunStorageUploadJobDependencies;
  sourceFileName?: string;
  conflictPolicy: StartUploadInput['conflictPolicy'];
}): Promise<string | null> => {
  const sourceRelativePath = options.dependencies.sourceRelativePathOrFileName(
    options.source,
    options.sourceFileName,
  );
  const fileName = basename(sourceRelativePath);
  const normalizedPrefix = options.dependencies.normalizeDestinationPrefix(
    options.destinationPrefix,
  );
  const initialKey = toInitialDestinationKey(
    options.destinationPrefix,
    options.source,
    options.dependencies,
    options.sourceFileName,
  );
  const policy =
    options.conflictPolicy ?? options.dependencies.getDefaultConflictPolicy();

  const initialExists = await storageObjectExists(
    options.profile,
    options.secret,
    initialKey,
  );
  if (!initialExists) {
    return initialKey;
  }

  if (policy === 'overwrite') {
    return initialKey;
  }

  if (policy === 'skip') {
    return null;
  }

  const sourceDirectory =
    sourceRelativePath.lastIndexOf('/') >= 0
      ? sourceRelativePath.slice(0, sourceRelativePath.lastIndexOf('/') + 1)
      : '';
  const { stem, ext } = options.dependencies.splitFileName(fileName);
  for (let index = 1; index < 1_000; index += 1) {
    const renamedRelativePath = `${sourceDirectory}${stem}-${index}${ext}`;
    const renamedKey = `${normalizedPrefix}${renamedRelativePath}`;
    const exists = await storageObjectExists(options.profile, options.secret, renamedKey);
    if (!exists) {
      return renamedKey;
    }
  }

  throw new Error(`Unable to allocate renamed key for ${fileName}`);
};

export const runStorageUploadJob = async (
  jobId: string,
  input: StartUploadInput,
  dependencies: RunStorageUploadJobDependencies,
): Promise<void> => {
  try {
    const profile = dependencies.assertProfileExists(input.profileId);
    const secret = dependencies.getProfileSecretOrThrow(profile.id);

    dependencies.updateUploadJob(jobId, (job) => ({
      ...job,
      status: 'running',
      updatedAt: dependencies.nowIso(),
    }));

    for (let sourceIndex = 0; sourceIndex < input.sources.length; sourceIndex += 1) {
      const source = input.sources[sourceIndex];
      const current = dependencies.getUploadJob(jobId);
      if (!current || current.status === 'canceled') {
        if (current?.status === 'canceled') {
          const remainingSources = input.sources.slice(sourceIndex);
          if (remainingSources.length > 0) {
            dependencies.updateUploadJob(jobId, (job) => {
              if (job.status !== 'canceled') {
                return job;
              }
              return {
                ...job,
                failedSources: dependencies.dedupeUploadSources([
                  ...job.failedSources,
                  ...remainingSources,
                ]),
                updatedAt: dependencies.nowIso(),
              };
            });
          }
        }
        return;
      }

      let cleanupOptimizedSource: (() => Promise<void>) | undefined;
      try {
        const optimization = dependencies.getUploadOptimizationSettings();
        const optimizedSource = await maybeOptimizeImageForUpload({
          sourcePath: source.path,
          sourceSize: source.size,
          enabled: optimization.enabled,
          maxWidthPx: optimization.maxWidthPx,
          webpQuality: optimization.webpQuality,
        });
        cleanupOptimizedSource = optimizedSource.cleanup;

        const destinationKey = await resolveDestinationKey({
          profile,
          secret,
          destinationPrefix: input.destinationPrefix,
          source,
          dependencies,
          sourceFileName: optimizedSource.fileName,
          conflictPolicy: input.conflictPolicy,
        });

        if (!destinationKey) {
          dependencies.updateUploadJob(jobId, (job) => ({
            ...job,
            completedItems: job.completedItems + 1,
            updatedAt: dependencies.nowIso(),
          }));
          continue;
        }

        const uploadAbortController = new AbortController();
        dependencies.setUploadAbortController(jobId, uploadAbortController);
        try {
          await uploadStorageObject(profile, secret, {
            key: destinationKey,
            sourcePath: optimizedSource.sourcePath,
            sourceSize: optimizedSource.sourceSize,
            abortSignal: uploadAbortController.signal,
          });
        } finally {
          const activeController = dependencies.getUploadAbortController(jobId);
          if (activeController === uploadAbortController) {
            dependencies.deleteUploadAbortController(jobId);
          }
        }
        dependencies.clearObjectMutation(profile.id, destinationKey);
        dependencies.publishAssetObservation({
          profileId: profile.id,
          bucket: profile.bucket,
          item: {
            key: destinationKey,
            size: optimizedSource.sourceSize,
            contentType: dependencies.inferContentTypeFromKey(destinationKey),
            lastModified: dependencies.nowIso(),
            etag: '',
          },
        });

        dependencies.updateUploadJob(jobId, (job) => ({
          ...job,
          completedItems: job.completedItems + 1,
          updatedAt: dependencies.nowIso(),
        }));
      } catch (error) {
        const current = dependencies.getUploadJob(jobId);
        if (current?.status === 'canceled' || dependencies.isAbortError(error)) {
          const remainingSources = input.sources.slice(sourceIndex);
          if (remainingSources.length > 0) {
            dependencies.updateUploadJob(jobId, (job) => {
              if (job.status !== 'canceled') {
                return job;
              }
              return {
                ...job,
                failedSources: dependencies.dedupeUploadSources([
                  ...job.failedSources,
                  ...remainingSources,
                ]),
                updatedAt: dependencies.nowIso(),
              };
            });
          }
          return;
        }
        dependencies.updateUploadJob(jobId, (job) => ({
          ...job,
          failedItems: job.failedItems + 1,
          failedSources: [...job.failedSources, source],
          lastError: dependencies.toUploadErrorMessage(error, source),
          updatedAt: dependencies.nowIso(),
        }));
      } finally {
        if (cleanupOptimizedSource) {
          try {
            await cleanupOptimizedSource();
          } catch {
            // Best-effort cleanup only.
          }
        }
      }
    }

    dependencies.updateUploadJob(jobId, (job) => {
      if (job.status === 'canceled') {
        return job;
      }

      const processed = job.completedItems + job.failedItems;
      if (processed < job.totalItems) {
        return job;
      }

      return {
        ...job,
        status: job.failedItems > 0 ? 'failed' : 'done',
        lastError: job.failedItems > 0 ? job.lastError : '',
        updatedAt: dependencies.nowIso(),
      };
    });
  } catch (error) {
    dependencies.updateUploadJob(jobId, (job) => ({
      ...job,
      failedSources:
        job.failedSources.length > 0 ? job.failedSources : [...input.sources],
      status: 'failed',
      failedItems: Math.min(
        job.totalItems,
        Math.max(job.failedItems, input.sources.length),
      ),
      lastError: dependencies.toUploadErrorMessage(error),
      updatedAt: dependencies.nowIso(),
    }));
  } finally {
    dependencies.deleteUploadAbortController(jobId);
  }
};
