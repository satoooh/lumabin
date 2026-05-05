import { basename } from 'node:path';
import type {
  StartUploadInput,
  UploadSource,
} from '../../shared/ipc';

interface StorageUploadDestinationPlannerDependencies {
  getDefaultConflictPolicy(): StartUploadInput['conflictPolicy'];
  normalizeDestinationPrefix(value: string): string;
  sourceRelativePathOrFileName(source: UploadSource, resolvedFileName?: string): string;
  splitFileName(fileName: string): { stem: string; ext: string };
}

interface ResolveStorageUploadDestinationKeyOptions {
  conflictPolicy: StartUploadInput['conflictPolicy'];
  dependencies: StorageUploadDestinationPlannerDependencies;
  destinationPrefix: string;
  objectExists(key: string): Promise<boolean>;
  source: UploadSource;
  sourceFileName?: string;
}

export const toInitialStorageUploadDestinationKey = (
  destinationPrefix: string,
  source: UploadSource,
  dependencies: StorageUploadDestinationPlannerDependencies,
  sourceFileName?: string,
): string => {
  const relativePath = dependencies.sourceRelativePathOrFileName(
    source,
    sourceFileName,
  );
  return `${dependencies.normalizeDestinationPrefix(destinationPrefix)}${relativePath}`;
};

export const resolveStorageUploadDestinationKey = async ({
  conflictPolicy,
  dependencies,
  destinationPrefix,
  objectExists,
  source,
  sourceFileName,
}: ResolveStorageUploadDestinationKeyOptions): Promise<string | null> => {
  const sourceRelativePath = dependencies.sourceRelativePathOrFileName(
    source,
    sourceFileName,
  );
  const fileName = basename(sourceRelativePath);
  const normalizedPrefix = dependencies.normalizeDestinationPrefix(destinationPrefix);
  const initialKey = toInitialStorageUploadDestinationKey(
    destinationPrefix,
    source,
    dependencies,
    sourceFileName,
  );
  const policy = conflictPolicy ?? dependencies.getDefaultConflictPolicy();

  const initialExists = await objectExists(initialKey);
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
  const { stem, ext } = dependencies.splitFileName(fileName);
  for (let index = 1; index < 1_000; index += 1) {
    const renamedRelativePath = `${sourceDirectory}${stem}-${index}${ext}`;
    const renamedKey = `${normalizedPrefix}${renamedRelativePath}`;
    const exists = await objectExists(renamedKey);
    if (!exists) {
      return renamedKey;
    }
  }

  throw new Error(`Unable to allocate renamed key for ${fileName}`);
};
