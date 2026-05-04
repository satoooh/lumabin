import { useEffect } from 'react';
import type {
  PersistSystemClipboardImageResult,
  UploadSource,
} from '../../shared/ipc';
import { formatCount } from '../shared/format-count';
import {
  collectClipboardUploadCandidates,
  type UploadCandidate,
} from './upload-candidates';
import {
  isEditableEventTarget,
  isLikelyAbsolutePath,
} from './upload-input-events';

interface UseUploadPasteOptions {
  collectCandidates?: (dataTransfer: DataTransfer | null) => UploadCandidate[];
  handleUploadCandidates: (candidates: UploadCandidate[]) => Promise<void> | void;
  isConnectionReady: boolean;
  onInlineFeedback: (message: string) => void;
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  persistClipboardImageFromSystem: () => Promise<PersistSystemClipboardImageResult | null>;
  startUploadFromSources: (sources: UploadSource[]) => Promise<void> | void;
}

export const useUploadPaste = ({
  collectCandidates = collectClipboardUploadCandidates,
  handleUploadCandidates,
  isConnectionReady,
  onInlineFeedback,
  onStatusLine,
  persistClipboardImageFromSystem,
  startUploadFromSources,
}: UseUploadPasteOptions): void => {
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      if (!isConnectionReady) {
        return;
      }
      if (isEditableEventTarget(event.target)) {
        return;
      }

      const candidates = collectCandidates(event.clipboardData);
      if (candidates.length === 0) {
        void (async () => {
          try {
            const persistedImage = await persistClipboardImageFromSystem();
            if (!persistedImage || !isLikelyAbsolutePath(persistedImage.path)) {
              return;
            }

            event.preventDefault();
            onStatusLine(`Pasted ${formatCount(1, 'file')}. Starting upload...`, 'neutral');
            onInlineFeedback(`Pasted ${formatCount(1, 'file')}`);
            await startUploadFromSources([
              {
                path: persistedImage.path,
                size: persistedImage.size,
              },
            ]);
          } catch {
            // Ignore clipboard image fallback errors.
          }
        })();
        return;
      }

      event.preventDefault();
      onStatusLine(`Pasted ${formatCount(candidates.length, 'file')}. Starting upload...`, 'neutral');
      void handleUploadCandidates(candidates);
    };

    document.addEventListener('paste', onPaste);
    return () => {
      document.removeEventListener('paste', onPaste);
    };
  }, [
    collectCandidates,
    handleUploadCandidates,
    isConnectionReady,
    onInlineFeedback,
    onStatusLine,
    persistClipboardImageFromSystem,
    startUploadFromSources,
  ]);
};
