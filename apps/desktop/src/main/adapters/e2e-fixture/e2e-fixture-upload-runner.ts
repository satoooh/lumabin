import { basename } from 'node:path';
import type {
  StartUploadInput,
  UploadJobStatus,
  UploadSource,
} from '../../../shared/ipc';
import {
  getE2EFixtureAsset,
  saveE2EFixtureAsset,
} from './e2e-fixture-asset-store';

const E2E_FIXTURE_UPLOAD_DELAY_MS = 80;

interface RunE2EFixtureUploadJobDependencies {
  createEtagSuffix(): string;
  getDefaultConflictPolicy(): StartUploadInput['conflictPolicy'];
  inferContentTypeFromKey(key: string): string;
  normalizeDestinationPrefix(value: string): string;
  nowIso(): string;
  sourceRelativePathOrFileName(source: UploadSource, resolvedFileName?: string): string;
  splitFileName(fileName: string): { stem: string; ext: string };
  updateUploadJob(jobId: string, updater: (job: UploadJobStatus) => UploadJobStatus): void;
}

const resolveE2EUploadDestinationKey = (
  destinationPrefix: string,
  source: UploadSource,
  conflictPolicy: StartUploadInput['conflictPolicy'],
  dependencies: RunE2EFixtureUploadJobDependencies,
  sourceFileName?: string,
): string | null => {
  const sourceRelativePath = dependencies.sourceRelativePathOrFileName(
    source,
    sourceFileName,
  );
  const fileName = basename(sourceRelativePath);
  const normalizedPrefix = dependencies.normalizeDestinationPrefix(destinationPrefix);
  const initialKey = `${normalizedPrefix}${sourceRelativePath}`;
  const policy = conflictPolicy ?? dependencies.getDefaultConflictPolicy();

  if (!getE2EFixtureAsset(initialKey)) {
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
  const { stem, ext } = dependencies.splitFileName(fileName);
  for (let index = 1; index < 1_000; index += 1) {
    const renamedRelativePath = `${sourceDirectory}${stem}-${index}${ext}`;
    const renamedKey = `${normalizedPrefix}${renamedRelativePath}`;
    if (!getE2EFixtureAsset(renamedKey)) {
      return renamedKey;
    }
  }

  throw new Error(`Unable to allocate renamed key for ${fileName}`);
};

export const runE2EFixtureUploadJob = async (
  jobId: string,
  input: StartUploadInput,
  dependencies: RunE2EFixtureUploadJobDependencies,
): Promise<void> => {
  dependencies.updateUploadJob(jobId, (job) => ({
    ...job,
    status: 'running',
    updatedAt: dependencies.nowIso(),
  }));

  for (const source of input.sources) {
    const destinationKey = resolveE2EUploadDestinationKey(
      input.destinationPrefix,
      source,
      input.conflictPolicy,
      dependencies,
    );
    if (!destinationKey) {
      dependencies.updateUploadJob(jobId, (job) => ({
        ...job,
        completedItems: job.completedItems + 1,
        updatedAt: dependencies.nowIso(),
      }));
      continue;
    }

    const now = dependencies.nowIso();
    const contentType = dependencies.inferContentTypeFromKey(destinationKey);
    saveE2EFixtureAsset(destinationKey, {
      key: destinationKey,
      size: source.size,
      contentType,
      lastModified: now,
      etag: `"e2e-upload-${dependencies.createEtagSuffix()}"`,
      metadata: {
        source: 'e2e-upload',
        uploaded_at: now,
      },
    });
    dependencies.updateUploadJob(jobId, (job) => ({
      ...job,
      completedItems: job.completedItems + 1,
      updatedAt: dependencies.nowIso(),
    }));
  }

  await new Promise((resolve) => {
    setTimeout(resolve, E2E_FIXTURE_UPLOAD_DELAY_MS);
  });

  dependencies.updateUploadJob(jobId, (job) => ({
    ...job,
    status: 'done',
    lastError: '',
    updatedAt: dependencies.nowIso(),
  }));
};
