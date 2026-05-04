import { app } from 'electron';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, stat, unlink, utimes, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AssetPreview } from '../shared/ipc';

interface PreviewCacheKeyInput {
  profileId: string;
  bucket: string;
  key: string;
  etag?: string;
  maxBytes: number;
}

interface PreviewCacheEnvelope {
  cachedAt: number;
  lastAccessedAt: number;
  preview: AssetPreview;
}

const PREVIEW_CACHE_ROOT = 'preview-cache.v1';
const PREVIEW_CACHE_MAX_BYTES = 256 * 1024 * 1024;
const PREVIEW_CACHE_TRIM_TARGET_BYTES = 220 * 1024 * 1024;
const PREVIEW_CACHE_MAX_ENTRY_BYTES = 24 * 1024 * 1024;
const PREVIEW_CACHE_MAX_FILES = 1_200;
const PREVIEW_CACHE_TRIM_TARGET_FILES = 900;
const PREVIEW_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

let isPreviewCacheTrimming = false;

const ignoreCacheError = (error: unknown): void => {
  void error;
};

const getPreviewCacheRootPath = (): string =>
  join(app.getPath('userData'), PREVIEW_CACHE_ROOT);

const hashValue = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

const toProfileDirectoryName = (profileId: string): string =>
  hashValue(`profile:${profileId}`).slice(0, 20);

const toPreviewCacheKey = (input: PreviewCacheKeyInput): string =>
  hashValue(
    [
      input.profileId,
      input.bucket,
      input.key,
      input.etag ?? '',
      String(input.maxBytes),
    ].join('::'),
  );

const toPreviewCacheFilePath = (input: PreviewCacheKeyInput): string => {
  const profileDirectory = toProfileDirectoryName(input.profileId);
  const keyHash = toPreviewCacheKey(input);
  return join(getPreviewCacheRootPath(), profileDirectory, `${keyHash}.json`);
};

const maybeParsePreviewEnvelope = (raw: string): PreviewCacheEnvelope | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<PreviewCacheEnvelope>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.cachedAt !== 'number' ||
      typeof parsed.lastAccessedAt !== 'number' ||
      !parsed.preview ||
      typeof parsed.preview !== 'object'
    ) {
      return null;
    }

    return {
      cachedAt: parsed.cachedAt,
      lastAccessedAt: parsed.lastAccessedAt,
      preview: parsed.preview as AssetPreview,
    };
  } catch {
    return null;
  }
};

const cleanupPreviewCacheDirectory = async (profileDirectoryPath: string): Promise<void> => {
  try {
    const files = await readdir(profileDirectoryPath);
    if (files.length === 0) {
      await rm(profileDirectoryPath, { recursive: true, force: true });
    }
  } catch {
    // Best effort cleanup.
  }
};

interface PreviewCacheEntryMeta {
  filePath: string;
  size: number;
  lastAccessedAt: number;
}

const readPreviewCacheEntries = async (): Promise<PreviewCacheEntryMeta[]> => {
  const rootPath = getPreviewCacheRootPath();
  const entries: PreviewCacheEntryMeta[] = [];

  let profileDirectories: string[] = [];
  try {
    profileDirectories = await readdir(rootPath);
  } catch {
    return entries;
  }

  for (const profileDirectory of profileDirectories) {
    const profileDirectoryPath = join(rootPath, profileDirectory);

    let files: string[] = [];
    try {
      files = await readdir(profileDirectoryPath);
    } catch {
      continue;
    }

    for (const fileName of files) {
      const filePath = join(profileDirectoryPath, fileName);

      try {
        const currentStat = await stat(filePath);
        if (!currentStat.isFile()) {
          continue;
        }
        entries.push({
          filePath,
          size: currentStat.size,
          lastAccessedAt: currentStat.mtimeMs,
        });
      } catch {
        // Ignore race conditions while scanning cache files.
      }
    }
  }

  return entries;
};

const trimPreviewCacheIfNeeded = async (): Promise<void> => {
  if (isPreviewCacheTrimming) {
    return;
  }

  isPreviewCacheTrimming = true;
  try {
    const entries = await readPreviewCacheEntries();
    if (entries.length === 0) {
      return;
    }

    let totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);
    let totalFiles = entries.length;
    const now = Date.now();

    const expiredEntries = entries.filter(
      (entry) => now - entry.lastAccessedAt > PREVIEW_CACHE_MAX_AGE_MS,
    );
    for (const entry of expiredEntries) {
      try {
        await unlink(entry.filePath);
        totalBytes -= entry.size;
        totalFiles -= 1;
      } catch {
        // Ignore deletion failures.
      }
    }

    if (
      totalBytes <= PREVIEW_CACHE_MAX_BYTES &&
      totalFiles <= PREVIEW_CACHE_MAX_FILES
    ) {
      return;
    }

    const sortedByAge = entries
      .filter((entry) => now - entry.lastAccessedAt <= PREVIEW_CACHE_MAX_AGE_MS)
      .sort((left, right) => left.lastAccessedAt - right.lastAccessedAt);

    for (const entry of sortedByAge) {
      if (
        totalBytes <= PREVIEW_CACHE_TRIM_TARGET_BYTES &&
        totalFiles <= PREVIEW_CACHE_TRIM_TARGET_FILES
      ) {
        break;
      }

      try {
        await unlink(entry.filePath);
        totalBytes -= entry.size;
        totalFiles -= 1;
      } catch {
        // Ignore deletion failures.
      }
    }
  } finally {
    isPreviewCacheTrimming = false;
  }
};

export const readPreviewCache = async (
  input: PreviewCacheKeyInput,
): Promise<AssetPreview | null> => {
  const filePath = toPreviewCacheFilePath(input);

  try {
    const raw = await readFile(filePath, 'utf-8');
    const parsed = maybeParsePreviewEnvelope(raw);
    if (!parsed) {
      await unlink(filePath).catch(ignoreCacheError);
      return null;
    }

    if (Date.now() - parsed.cachedAt > PREVIEW_CACHE_MAX_AGE_MS) {
      await unlink(filePath).catch(ignoreCacheError);
      return null;
    }

    const nextEnvelope: PreviewCacheEnvelope = {
      ...parsed,
      lastAccessedAt: Date.now(),
    };
    void utimes(filePath, new Date(), new Date(nextEnvelope.lastAccessedAt)).catch(ignoreCacheError);

    return parsed.preview;
  } catch {
    return null;
  }
};

export const writePreviewCache = async (
  input: PreviewCacheKeyInput,
  preview: AssetPreview,
): Promise<void> => {
  const filePath = toPreviewCacheFilePath(input);
  const now = Date.now();
  const envelope: PreviewCacheEnvelope = {
    cachedAt: now,
    lastAccessedAt: now,
    preview,
  };
  const serialized = JSON.stringify(envelope);
  const serializedByteLength = Buffer.byteLength(serialized, 'utf-8');
  if (serializedByteLength > PREVIEW_CACHE_MAX_ENTRY_BYTES) {
    await unlink(filePath).catch(ignoreCacheError);
    return;
  }

  await mkdir(join(getPreviewCacheRootPath(), toProfileDirectoryName(input.profileId)), {
    recursive: true,
  });
  await writeFile(filePath, serialized, 'utf-8');

  void trimPreviewCacheIfNeeded();
};

export const removePreviewCacheForProfile = async (profileId: string): Promise<void> => {
  const profileDirectoryPath = join(
    getPreviewCacheRootPath(),
    toProfileDirectoryName(profileId),
  );
  await rm(profileDirectoryPath, { recursive: true, force: true });
  await cleanupPreviewCacheDirectory(profileDirectoryPath);
};
