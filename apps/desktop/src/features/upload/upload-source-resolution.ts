import type { PersistClipboardFileInput, UploadSource } from '../../shared/ipc';
import type { UploadCandidate } from './upload-candidates';
import { sanitizeUploadRelativePath } from './upload-candidates';
import {
  clipboardFallbackFileName,
  isLikelyAbsolutePath,
} from './upload-input-events';

export interface UploadSourceResolutionFiles {
  getPathForFile: (file: File) => string;
  persistClipboardFile: (input: PersistClipboardFileInput) => Promise<string>;
}

export interface UploadSourceResolutionResult {
  sources: UploadSource[];
  unresolvedFiles: string[];
  persistedClipboardFileCount: number;
}

export const resolveUploadSources = async (
  candidates: UploadCandidate[],
  files: UploadSourceResolutionFiles,
): Promise<UploadSourceResolutionResult> => {
  const sources: UploadSource[] = [];
  const unresolvedFiles: string[] = [];
  let persistedClipboardFileCount = 0;

  for (const [candidateIndex, candidate] of candidates.entries()) {
    const { file } = candidate;
    const bridgedPath = files.getPathForFile(file);
    const fileWithPath = file as File & { path?: string };
    const fallbackPath = fileWithPath.path ?? '';
    let resolvedPath = isLikelyAbsolutePath(bridgedPath)
      ? bridgedPath
      : isLikelyAbsolutePath(fallbackPath)
        ? fallbackPath
        : '';

    if (!resolvedPath) {
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const persistedPath = await files.persistClipboardFile({
          fileName: clipboardFallbackFileName(file, candidateIndex),
          mimeType: file.type,
          bytes,
        });
        if (isLikelyAbsolutePath(persistedPath)) {
          resolvedPath = persistedPath;
          persistedClipboardFileCount += 1;
        }
      } catch {
        // Keep unresolved behavior and report after all candidates are inspected.
      }
    }

    if (!resolvedPath) {
      unresolvedFiles.push(file.name || `clipboard-${candidateIndex + 1}`);
      continue;
    }

    sources.push({
      path: resolvedPath,
      size: file.size,
      relativePath:
        sanitizeUploadRelativePath(
          candidate.relativePath ??
            (file as File & { webkitRelativePath?: string }).webkitRelativePath,
        ) || undefined,
    });
  }

  return {
    sources,
    unresolvedFiles,
    persistedClipboardFileCount,
  };
};
