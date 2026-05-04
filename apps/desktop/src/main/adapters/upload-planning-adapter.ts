import { readdir, stat } from 'node:fs/promises';
import { basename } from 'node:path';
import { storageObjectExists } from './storage/storage-query-adapter';
import type {
  CheckUploadConflictsInput,
  CheckUploadConflictsResult,
  ProfileSummary,
  UploadSource,
} from '../../shared/ipc';

type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

type ProfileSecret = {
  accessKeyId: string;
  secretAccessKey: string;
};

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

export const splitFileName = (fileName: string): { stem: string; ext: string } => {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return {
      stem: fileName,
      ext: '',
    };
  }

  return {
    stem: fileName.slice(0, dotIndex),
    ext: fileName.slice(dotIndex),
  };
};

export const normalizeDestinationPrefix = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
};

const normalizeUploadRelativePath = (value?: string): string => {
  if (!value) {
    return '';
  }
  const normalized = value
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .join('/');
  return normalized;
};

export const sourceRelativePathOrFileName = (
  source: UploadSource,
  resolvedFileName?: string,
): string => {
  const normalizedResolvedFileName = resolvedFileName?.trim() || basename(source.path);
  const normalizedRelativePath = normalizeUploadRelativePath(source.relativePath);
  if (normalizedRelativePath) {
    if (!resolvedFileName?.trim()) {
      return normalizedRelativePath;
    }
    const lastSeparatorIndex = normalizedRelativePath.lastIndexOf('/');
    if (lastSeparatorIndex >= 0) {
      return `${normalizedRelativePath.slice(0, lastSeparatorIndex + 1)}${normalizedResolvedFileName}`;
    }
    return normalizedResolvedFileName;
  }
  if (!normalizedResolvedFileName) {
    throw new Error(`Invalid source file name: ${source.path}`);
  }
  return normalizedResolvedFileName;
};

export const toUploadErrorMessage = (
  error: unknown,
  source?: UploadSource,
): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    const code = (error as { code: string }).code;
    if (code === 'ENOENT') {
      const label = source ? basename(source.path) : 'source file';
      return `Source file not found: ${label}. Confirm the file still exists, then retry failed files.`;
    }
    if (code === 'EACCES' || code === 'EPERM') {
      const label = source ? basename(source.path) : 'source file';
      return `Cannot read source file: ${label} (${code}). Check file permissions, then retry.`;
    }
  }

  return toErrorMessage(error);
};

export const dedupeUploadSources = (sources: UploadSource[]): UploadSource[] => {
  const seen = new Set<string>();
  const deduped: UploadSource[] = [];
  for (const source of sources) {
    const dedupeKey = `${source.path}::${normalizeUploadRelativePath(source.relativePath)}`;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    deduped.push(source);
  }
  return deduped;
};

const expandDirectorySource = async (
  sourcePath: string,
  relativePrefix: string,
): Promise<UploadSource[]> => {
  let entries: Array<{
    isDirectory: () => boolean;
    isFile: () => boolean;
    name: string;
  }> = [];
  try {
    entries = await readdir(sourcePath, { withFileTypes: true });
  } catch {
    return [];
  }
  const expanded: UploadSource[] = [];

  for (const entry of entries) {
    const childPath = `${sourcePath}/${entry.name}`;
    const childRelativePath = normalizeUploadRelativePath(`${relativePrefix}/${entry.name}`);
    if (entry.isDirectory()) {
      expanded.push(...(await expandDirectorySource(childPath, childRelativePath)));
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }

    try {
      const fileStats = await stat(childPath);
      expanded.push({
        path: childPath,
        size: fileStats.size,
        relativePath: childRelativePath,
      });
    } catch {
      continue;
    }
  }

  return expanded;
};

export const expandUploadSources = async (
  sources: UploadSource[],
): Promise<UploadSource[]> => {
  const expanded: UploadSource[] = [];

  for (const source of sources) {
    try {
      const sourceStats = await stat(source.path);
      const normalizedRelativePath = normalizeUploadRelativePath(source.relativePath);

      if (sourceStats.isDirectory()) {
        const directoryRelativePrefix = normalizedRelativePath || basename(source.path);
        expanded.push(
          ...(await expandDirectorySource(source.path, directoryRelativePrefix)),
        );
        continue;
      }

      if (!sourceStats.isFile()) {
        continue;
      }

      expanded.push({
        path: source.path,
        size: sourceStats.size,
        relativePath: normalizedRelativePath || undefined,
      });
    } catch {
      continue;
    }
  }

  return dedupeUploadSources(expanded);
};

export const checkStorageUploadConflicts = async (
  profile: StoredProfile,
  secret: ProfileSecret,
  input: CheckUploadConflictsInput,
  defaultLimit = 8,
): Promise<CheckUploadConflictsResult> => {
  const limit = Math.max(1, Math.min(100, input.limit ?? defaultLimit));
  const conflicts: CheckUploadConflictsResult['conflicts'] = [];
  let totalConflicts = 0;
  const remoteExistsByKey = new Map<string, boolean>();
  const keySeenInBatchCount = new Map<string, number>();
  const normalizedPrefix = normalizeDestinationPrefix(input.destinationPrefix);

  for (const source of input.sources) {
    const sourceRelativePath = sourceRelativePathOrFileName(source);
    const fileName = basename(sourceRelativePath);
    if (!fileName) {
      continue;
    }
    const key = `${normalizedPrefix}${sourceRelativePath}`;
    const seenCount = keySeenInBatchCount.get(key) ?? 0;
    keySeenInBatchCount.set(key, seenCount + 1);

    let hasConflict = seenCount > 0;
    if (!hasConflict) {
      const cached = remoteExistsByKey.get(key);
      if (cached !== undefined) {
        hasConflict = cached;
      } else {
        const exists = await storageObjectExists(profile, secret, key);
        remoteExistsByKey.set(key, exists);
        hasConflict = exists;
      }
    }

    if (!hasConflict) {
      continue;
    }

    totalConflicts += 1;
    if (conflicts.length < limit) {
      conflicts.push({
        sourcePath: source.path,
        fileName,
        key,
      });
    }
  }

  return {
    conflicts,
    totalConflicts,
  };
};
