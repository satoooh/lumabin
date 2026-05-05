import { useEffect, useRef, useState } from 'react';
import {
  resolveUploadToastLifecycleTransition,
  UPLOAD_TOAST_DONE_AUTO_DISMISS_MS,
  UPLOAD_TOAST_DONE_EXPAND_MS,
  type UploadToastLifecycleJob,
  type UploadToastTrackedJob,
} from './upload-toast-lifecycle-policy';

interface UseUploadToastLifecycleOptions {
  onClearFinishedUploads: () => void;
  showUploadToast: boolean;
  uploadSummaryJob: UploadToastLifecycleJob | null;
}

export const useUploadToastLifecycle = ({
  onClearFinishedUploads,
  showUploadToast,
  uploadSummaryJob,
}: UseUploadToastLifecycleOptions): boolean => {
  const [isUploadToastExpanded, setIsUploadToastExpanded] = useState<boolean>(false);
  const uploadToastCollapseTimerRef = useRef<number | null>(null);
  const uploadToastDismissTimerRef = useRef<number | null>(null);
  const uploadToastTrackedJobRef = useRef<UploadToastTrackedJob | null>(null);

  useEffect(() => {
    return () => {
      if (uploadToastCollapseTimerRef.current !== null) {
        window.clearTimeout(uploadToastCollapseTimerRef.current);
      }
      if (uploadToastDismissTimerRef.current !== null) {
        window.clearTimeout(uploadToastDismissTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const transition = resolveUploadToastLifecycleTransition({
      previousTrackedJob: uploadToastTrackedJobRef.current,
      showUploadToast,
      uploadSummaryJob,
    });

    uploadToastTrackedJobRef.current = transition.nextTrackedJob;

    if (transition.collapseTimer === 'clear') {
      if (uploadToastCollapseTimerRef.current !== null) {
        window.clearTimeout(uploadToastCollapseTimerRef.current);
        uploadToastCollapseTimerRef.current = null;
      }
    } else if (transition.collapseTimer === 'schedule') {
      if (uploadToastCollapseTimerRef.current !== null) {
        window.clearTimeout(uploadToastCollapseTimerRef.current);
      }
      uploadToastCollapseTimerRef.current = window.setTimeout(() => {
        uploadToastCollapseTimerRef.current = null;
        setIsUploadToastExpanded(false);
      }, UPLOAD_TOAST_DONE_EXPAND_MS);
    }

    if (transition.dismissTimer === 'clear') {
      if (uploadToastDismissTimerRef.current !== null) {
        window.clearTimeout(uploadToastDismissTimerRef.current);
        uploadToastDismissTimerRef.current = null;
      }
    } else if (transition.dismissTimer === 'schedule') {
      if (uploadToastDismissTimerRef.current !== null) {
        window.clearTimeout(uploadToastDismissTimerRef.current);
      }
      uploadToastDismissTimerRef.current = window.setTimeout(() => {
        uploadToastDismissTimerRef.current = null;
        onClearFinishedUploads();
      }, UPLOAD_TOAST_DONE_AUTO_DISMISS_MS);
    }

    setIsUploadToastExpanded(transition.isExpanded);
  }, [onClearFinishedUploads, showUploadToast, uploadSummaryJob]);

  return isUploadToastExpanded;
};
