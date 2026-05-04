import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  collectDroppedUploadCandidates,
  type UploadCandidate,
} from './upload-candidates';
import { hasFileTransfer } from './upload-input-events';

interface UseUploadDropZoneOptions {
  collectCandidates?: (dataTransfer: DataTransfer | null) => Promise<UploadCandidate[]>;
  onUploadCandidates: (candidates: UploadCandidate[]) => Promise<void> | void;
}

export const useUploadDropZone = ({
  collectCandidates = collectDroppedUploadCandidates,
  onUploadCandidates,
}: UseUploadDropZoneOptions): boolean => {
  const dragDepthRef = useRef<number>(0);
  const [isDropActive, setIsDropActive] = useState<boolean>(false);

  useEffect(() => {
    const resetDropState = () => {
      dragDepthRef.current = 0;
      setIsDropActive(false);
    };

    const onDragEnter = (event: DragEvent) => {
      if (!hasFileTransfer(event)) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current += 1;
      setIsDropActive(true);
    };

    const onDragOver = (event: DragEvent) => {
      if (!hasFileTransfer(event)) {
        return;
      }

      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    };

    const onDragLeave = (event: DragEvent) => {
      if (!hasFileTransfer(event) && dragDepthRef.current === 0) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDropActive(false);
      }
    };

    const onDrop = (event: DragEvent) => {
      if (!hasFileTransfer(event)) {
        return;
      }

      event.preventDefault();
      resetDropState();
      const dataTransfer = event.dataTransfer;
      void (async () => {
        const candidates = await collectCandidates(dataTransfer);
        await onUploadCandidates(candidates);
      })();
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    window.addEventListener('dragend', resetDropState);
    window.addEventListener('blur', resetDropState);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('dragend', resetDropState);
      window.removeEventListener('blur', resetDropState);
    };
  }, [collectCandidates, onUploadCandidates]);

  return isDropActive;
};
