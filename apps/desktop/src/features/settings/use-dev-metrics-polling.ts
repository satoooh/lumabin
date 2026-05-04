import { useEffect } from 'react';

export const DEV_METRICS_POLL_INTERVAL_MS = 1500;

interface UseDevMetricsPollingOptions {
  isDevEnv: boolean;
  isWorkspaceSettingsOpen: boolean;
  loadDevMetrics: () => Promise<void> | void;
}

export const useDevMetricsPolling = ({
  isDevEnv,
  isWorkspaceSettingsOpen,
  loadDevMetrics,
}: UseDevMetricsPollingOptions): void => {
  useEffect(() => {
    if (!isDevEnv || !isWorkspaceSettingsOpen) {
      return;
    }

    void loadDevMetrics();
    const timer = window.setInterval(() => {
      void loadDevMetrics();
    }, DEV_METRICS_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isDevEnv, isWorkspaceSettingsOpen, loadDevMetrics]);
};
