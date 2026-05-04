import { useEffect, useRef } from 'react';

interface UseQuickPreviewFocusRestoreOptions {
  isQuickPreviewOpen: boolean;
  selectedAssetKey: string;
  focusAssetItemByKey: (key: string) => boolean;
  scrollToAssetInCurrentView: (key: string, behavior?: ScrollBehavior) => boolean;
}

export const useQuickPreviewFocusRestore = ({
  isQuickPreviewOpen,
  selectedAssetKey,
  focusAssetItemByKey,
  scrollToAssetInCurrentView,
}: UseQuickPreviewFocusRestoreOptions): void => {
  const wasQuickPreviewOpenRef = useRef<boolean>(false);

  useEffect(() => {
    const wasOpen = wasQuickPreviewOpenRef.current;
    wasQuickPreviewOpenRef.current = isQuickPreviewOpen;

    if (!wasOpen || isQuickPreviewOpen || !selectedAssetKey) {
      return;
    }

    let isDisposed = false;
    let restoreTimeoutId: number | null = null;
    const restoreFrameId = window.requestAnimationFrame(() => {
      if (isDisposed) {
        return;
      }

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const maxFocusAttempts = prefersReducedMotion ? 4 : 10;
      const retryDelayMs = prefersReducedMotion ? 24 : 48;

      const attemptRestoreFocus = (attemptIndex: number) => {
        if (isDisposed) {
          return;
        }

        if (focusAssetItemByKey(selectedAssetKey)) {
          return;
        }

        if (attemptIndex === 0) {
          scrollToAssetInCurrentView(selectedAssetKey, prefersReducedMotion ? 'auto' : 'smooth');
        }

        if (attemptIndex >= maxFocusAttempts) {
          return;
        }

        restoreTimeoutId = window.setTimeout(() => {
          attemptRestoreFocus(attemptIndex + 1);
        }, retryDelayMs);
      };

      attemptRestoreFocus(0);
    });

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(restoreFrameId);
      if (restoreTimeoutId !== null) {
        window.clearTimeout(restoreTimeoutId);
      }
    };
  }, [focusAssetItemByKey, isQuickPreviewOpen, scrollToAssetInCurrentView, selectedAssetKey]);
};
