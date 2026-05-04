import {
  useCallback,
  useRef,
  type ChangeEvent,
} from 'react';
import {
  sanitizeUploadRelativePath,
  type UploadCandidate,
} from './upload-candidates';

interface UseUploadFilePickerOptions {
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  onUploadCandidates: (candidates: UploadCandidate[]) => Promise<void> | void;
  selectedProfileId: string;
}

export const useUploadFilePicker = ({
  onStatusLine,
  onUploadCandidates,
  selectedProfileId,
}: UseUploadFilePickerOptions) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFilePicker = useCallback(() => {
    if (!selectedProfileId) {
      onStatusLine('Select a profile first.', 'error');
      return;
    }
    onStatusLine('Choose files to upload.', 'neutral');
    fileInputRef.current?.click();
  }, [onStatusLine, selectedProfileId]);

  const handleFilePickerChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const candidates: UploadCandidate[] = Array.from(event.target.files ?? []).map((file) => {
        const fileWithRelativePath = file as File & { webkitRelativePath?: string };
        const relativePath = sanitizeUploadRelativePath(fileWithRelativePath.webkitRelativePath);
        return {
          file,
          relativePath: relativePath || undefined,
        };
      });
      void onUploadCandidates(candidates);
      event.target.value = '';
    },
    [onUploadCandidates],
  );

  return {
    fileInputRef,
    handleFilePickerChange,
    handleOpenFilePicker,
  };
};
