import { useCallback } from 'react';
import type { UploadSource } from '../../shared/ipc';
import { formatCount } from '../shared/format-count';
import type { UploadCandidate } from './upload-candidates';
import {
  resolveUploadSources,
  type UploadSourceResolutionFiles,
} from './upload-source-resolution';

interface UseUploadCandidateUploadOptions {
  files: UploadSourceResolutionFiles;
  onInlineFeedback: (message: string) => void;
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  startUploadFromSources: (sources: UploadSource[]) => Promise<void> | void;
}

export const useUploadCandidateUpload = ({
  files,
  onInlineFeedback,
  onStatusLine,
  startUploadFromSources,
}: UseUploadCandidateUploadOptions) =>
  useCallback(
    async (candidates: UploadCandidate[]) => {
      const { sources, unresolvedFiles, persistedClipboardFileCount } =
        await resolveUploadSources(candidates, files);

      if (unresolvedFiles.length > 0) {
        onStatusLine(
          `Skipped ${formatCount(unresolvedFiles.length, 'file')}: local path unavailable`,
          'error',
        );
      }

      if (persistedClipboardFileCount > 0) {
        onInlineFeedback(`Pasted ${formatCount(persistedClipboardFileCount, 'file')}`);
      }

      await startUploadFromSources(sources);
    },
    [files, onInlineFeedback, onStatusLine, startUploadFromSources],
  );
