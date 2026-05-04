import {
  useEffect,
  useState,
} from 'react';
import type { RuntimeInfo } from '../../shared/ipc';
import {
  useDevMetricsCommands,
  useDevMetricsSnapshotCopy,
} from '../settings/use-dev-metrics-commands';
import { useDevMetricsPolling } from '../settings/use-dev-metrics-polling';
import type { DesktopApiGateway } from '../shared/desktop-api-gateway';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseDiagnosticsWorkbenchOptions {
  copyToClipboard: (value: string, label: string) => Promise<void>;
  diagnosticsApi: DesktopApiGateway['diagnostics'];
  isDevEnv: boolean;
  isWorkspaceSettingsOpen: boolean;
  nowIso: () => string;
  profileLabel: string;
  runtimeApi: DesktopApiGateway['runtime'];
  setStatusLine(message: string, tone?: StatusTone): void;
}

export const useDiagnosticsWorkbench = ({
  copyToClipboard,
  diagnosticsApi,
  isDevEnv,
  isWorkspaceSettingsOpen,
  nowIso,
  profileLabel,
  runtimeApi,
  setStatusLine,
}: UseDiagnosticsWorkbenchOptions) => {
  const [runtimeInfo, setRuntimeInfo] = useState<RuntimeInfo>({ isE2E: false });

  useEffect(() => {
    let isMounted = true;
    void runtimeApi.getInfo()
      .then((nextRuntimeInfo) => {
        if (isMounted) {
          setRuntimeInfo(nextRuntimeInfo);
        }
      })
      .catch(() => {
        // Keep production defaults if runtime diagnostics are unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, [runtimeApi]);

  const isDiagnosticsEnabled = isDevEnv || runtimeInfo.isE2E;

  const {
    devMetrics,
    handleResetDevMetrics,
    isDevMetricsBusy,
    loadDevMetrics,
  } = useDevMetricsCommands({
    getMetrics: diagnosticsApi.getMetrics,
    isDevEnv: isDiagnosticsEnabled,
    resetMetrics: diagnosticsApi.resetMetrics,
    setStatusLine,
  });

  const { handleCopyDevMetricsSnapshot } = useDevMetricsSnapshotCopy({
    copyToClipboard,
    devMetrics,
    nowIso,
    profileLabel,
    setStatusLine,
  });

  useDevMetricsPolling({
    isDevEnv: isDiagnosticsEnabled,
    isWorkspaceSettingsOpen,
    loadDevMetrics,
  });

  return {
    devMetrics,
    handleCopyDevMetricsSnapshot,
    handleResetDevMetrics,
    isDiagnosticsEnabled,
    isDevMetricsBusy,
    loadDevMetrics,
  };
};
