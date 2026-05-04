import {
  useEffect,
  type RefObject,
} from 'react';

interface UseUploadToastStackHeightOptions {
  appShellRef: RefObject<HTMLElement | null>;
  isUploadToastExpanded: boolean;
  showUploadToast: boolean;
  uploadSummaryProgress: number;
  uploadSummaryStatus?: string;
  uploadToastRef: RefObject<HTMLElement | null>;
}

export const useUploadToastStackHeight = ({
  appShellRef,
  isUploadToastExpanded,
  showUploadToast,
  uploadSummaryProgress,
  uploadSummaryStatus,
  uploadToastRef,
}: UseUploadToastStackHeightOptions): void => {
  useEffect(() => {
    const appShell = appShellRef.current;
    if (!appShell) {
      return;
    }

    const applyStackHeight = () => {
      const measured = uploadToastRef.current?.offsetHeight ?? 0;
      appShell.style.setProperty(
        '--upload-toast-stack-height',
        `${Math.max(0, Math.round(measured))}px`,
      );
    };

    applyStackHeight();

    if (typeof ResizeObserver === 'undefined' || !uploadToastRef.current) {
      return () => {
        appShell.style.removeProperty('--upload-toast-stack-height');
      };
    }

    const observer = new ResizeObserver(() => {
      applyStackHeight();
    });
    observer.observe(uploadToastRef.current);

    return () => {
      observer.disconnect();
      appShell.style.removeProperty('--upload-toast-stack-height');
    };
  }, [
    appShellRef,
    isUploadToastExpanded,
    showUploadToast,
    uploadSummaryProgress,
    uploadSummaryStatus,
    uploadToastRef,
  ]);
};
