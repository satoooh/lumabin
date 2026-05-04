import { useEffect, useRef, useState } from 'react';

type UploadJobStatus = 'queued' | 'running' | 'done' | 'failed' | 'canceled';

interface UploadToastLifecycleJob {
  id: string;
  status: UploadJobStatus;
}

interface UseUploadToastLifecycleOptions {
  onClearFinishedUploads: () => void;
  showUploadToast: boolean;
  uploadSummaryJob: UploadToastLifecycleJob | null;
}

const UPLOAD_TOAST_DONE_EXPAND_MS = 3200;
const UPLOAD_TOAST_DONE_AUTO_DISMISS_MS = 10000;

export const useUploadToastLifecycle = ({
  onClearFinishedUploads,
  showUploadToast,
  uploadSummaryJob,
}: UseUploadToastLifecycleOptions): boolean => {
  const [isUploadToastExpanded, setIsUploadToastExpanded] = useState<boolean>(false);
  const uploadToastCollapseTimerRef = useRef<number | null>(null);
  const uploadToastDismissTimerRef = useRef<number | null>(null);
  const uploadToastTrackedJobRef = useRef<{
    id: string;
    status: UploadJobStatus;
  } | null>(null);

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
    if (!showUploadToast || !uploadSummaryJob) {
      uploadToastTrackedJobRef.current = null;
      if (uploadToastCollapseTimerRef.current !== null) {
        window.clearTimeout(uploadToastCollapseTimerRef.current);
        uploadToastCollapseTimerRef.current = null;
      }
      if (uploadToastDismissTimerRef.current !== null) {
        window.clearTimeout(uploadToastDismissTimerRef.current);
        uploadToastDismissTimerRef.current = null;
      }
      setIsUploadToastExpanded(false);
      return;
    }

    const previousTrackedJob = uploadToastTrackedJobRef.current;
    const isNewTrackedJob = previousTrackedJob?.id !== uploadSummaryJob.id;
    const previousStatus =
      previousTrackedJob?.id === uploadSummaryJob.id ? previousTrackedJob.status : null;
    const status = uploadSummaryJob.status;
    const isActiveStatus = status === 'queued' || status === 'running';

    uploadToastTrackedJobRef.current = { id: uploadSummaryJob.id, status };

    if (isActiveStatus) {
      if (uploadToastCollapseTimerRef.current !== null) {
        window.clearTimeout(uploadToastCollapseTimerRef.current);
        uploadToastCollapseTimerRef.current = null;
      }
      if (uploadToastDismissTimerRef.current !== null) {
        window.clearTimeout(uploadToastDismissTimerRef.current);
        uploadToastDismissTimerRef.current = null;
      }
      setIsUploadToastExpanded(false);
      return;
    }

    if (status === 'failed' || status === 'canceled') {
      if (uploadToastCollapseTimerRef.current !== null) {
        window.clearTimeout(uploadToastCollapseTimerRef.current);
        uploadToastCollapseTimerRef.current = null;
      }
      if (uploadToastDismissTimerRef.current !== null) {
        window.clearTimeout(uploadToastDismissTimerRef.current);
        uploadToastDismissTimerRef.current = null;
      }
      setIsUploadToastExpanded(true);
      return;
    }

    if (status === 'done') {
      if (isNewTrackedJob || previousStatus !== 'done') {
        if (uploadToastDismissTimerRef.current !== null) {
          window.clearTimeout(uploadToastDismissTimerRef.current);
        }
        uploadToastDismissTimerRef.current = window.setTimeout(() => {
          uploadToastDismissTimerRef.current = null;
          onClearFinishedUploads();
        }, UPLOAD_TOAST_DONE_AUTO_DISMISS_MS);
      }
      if (previousStatus && previousStatus !== 'done') {
        setIsUploadToastExpanded(true);
        if (uploadToastCollapseTimerRef.current !== null) {
          window.clearTimeout(uploadToastCollapseTimerRef.current);
        }
        uploadToastCollapseTimerRef.current = window.setTimeout(() => {
          uploadToastCollapseTimerRef.current = null;
          setIsUploadToastExpanded(false);
        }, UPLOAD_TOAST_DONE_EXPAND_MS);
        return;
      }
      setIsUploadToastExpanded(false);
    }
  }, [onClearFinishedUploads, showUploadToast, uploadSummaryJob]);

  return isUploadToastExpanded;
};
