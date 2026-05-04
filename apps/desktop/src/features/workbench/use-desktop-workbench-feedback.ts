import { useTransientFeedback } from '../layout/use-transient-feedback';

const STATUS_AUTO_HIDE_MS = 2200;
const COPY_FEEDBACK_AUTO_HIDE_MS = 1300;

export const useDesktopWorkbenchFeedback = () =>
  useTransientFeedback({
    copyFeedbackAutoHideMs: COPY_FEEDBACK_AUTO_HIDE_MS,
    statusAutoHideMs: STATUS_AUTO_HIDE_MS,
  });
