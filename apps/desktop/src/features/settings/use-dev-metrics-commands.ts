import {
  useCallback,
  useState,
} from 'react';
import type { DevMetricsSnapshot } from '../../shared/ipc';

type StatusTone = 'neutral' | 'success' | 'error';
type CopyToClipboard = (value: string, label: string) => Promise<void>;

interface UseDevMetricsCommandsOptions {
  getMetrics(): Promise<DevMetricsSnapshot>;
  isDevEnv: boolean;
  resetMetrics(): Promise<DevMetricsSnapshot>;
  setStatusLine(message: string, tone?: StatusTone): void;
}

export const useDevMetricsCommands = ({
  getMetrics,
  isDevEnv,
  resetMetrics,
  setStatusLine,
}: UseDevMetricsCommandsOptions) => {
  const [devMetrics, setDevMetrics] = useState<DevMetricsSnapshot | null>(null);
  const [isDevMetricsBusy, setIsDevMetricsBusy] = useState<boolean>(false);

  const loadDevMetrics = useCallback(async () => {
    if (!isDevEnv) {
      return;
    }

    setIsDevMetricsBusy(true);
    try {
      const metrics = await getMetrics();
      setDevMetrics(metrics);
    } catch {
      // Ignore dev-only metric fetch errors.
    } finally {
      setIsDevMetricsBusy(false);
    }
  }, [getMetrics, isDevEnv]);

  const handleResetDevMetrics = useCallback(async () => {
    if (!isDevEnv) {
      return;
    }

    setIsDevMetricsBusy(true);
    try {
      const metrics = await resetMetrics();
      setDevMetrics(metrics);
      setStatusLine('Dev metrics reset.', 'neutral');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Failed to reset dev metrics: ${message}`, 'error');
    } finally {
      setIsDevMetricsBusy(false);
    }
  }, [isDevEnv, resetMetrics, setStatusLine]);

  return {
    devMetrics,
    handleResetDevMetrics,
    isDevMetricsBusy,
    loadDevMetrics,
  };
};

export const formatDevMetricsSnapshot = (
  devMetrics: DevMetricsSnapshot,
  options: {
    nowIso: string;
    profileLabel: string;
  },
): string => {
  const previewCacheTotal = devMetrics.cache.previewHit + devMetrics.cache.previewMiss;
  const headCacheTotal = devMetrics.cache.headHit + devMetrics.cache.headMiss;
  const searchCacheTotal =
    devMetrics.cache.searchSnapshotHit + devMetrics.cache.searchSnapshotMiss;
  const previewHitRate =
    previewCacheTotal > 0
      ? Math.round((devMetrics.cache.previewHit / previewCacheTotal) * 100)
      : 0;
  const headHitRate =
    headCacheTotal > 0
      ? Math.round((devMetrics.cache.headHit / headCacheTotal) * 100)
      : 0;
  const searchHitRate =
    searchCacheTotal > 0
      ? Math.round((devMetrics.cache.searchSnapshotHit / searchCacheTotal) * 100)
      : 0;

  return [
    '# LumaBin Dev Metrics Snapshot',
    `Generated at: ${options.nowIso}`,
    `Profile: ${options.profileLabel}`,
    `Collected at: ${devMetrics.collectedAt}`,
    `Preview cache hit rate: ${previewHitRate}%`,
    `HEAD cache hit rate: ${headHitRate}%`,
    `Search cache hit rate: ${searchHitRate}%`,
    `List calls: ${devMetrics.storage.listCalls}`,
    `HEAD calls: ${devMetrics.storage.headCalls}`,
    `GET calls: ${devMetrics.storage.getCalls}`,
    `PUT calls: ${devMetrics.storage.putCalls}`,
    `Exists checks: ${devMetrics.storage.existsChecks}`,
    `Downloaded bytes: ${devMetrics.storage.bytesDownloaded}`,
    `Uploaded bytes: ${devMetrics.storage.bytesUploaded}`,
    `Failures: ${devMetrics.storage.failures}`,
  ].join('\n');
};

export const useDevMetricsSnapshotCopy = ({
  copyToClipboard,
  devMetrics,
  nowIso,
  profileLabel,
  setStatusLine,
}: {
  copyToClipboard: CopyToClipboard;
  devMetrics: DevMetricsSnapshot | null;
  nowIso: () => string;
  profileLabel: string;
  setStatusLine(message: string, tone?: StatusTone): void;
}) => {
  const handleCopyDevMetricsSnapshot = useCallback(async () => {
    if (!devMetrics) {
      setStatusLine('No dev metrics snapshot available yet.', 'error');
      return;
    }

    await copyToClipboard(
      formatDevMetricsSnapshot(devMetrics, {
        nowIso: nowIso(),
        profileLabel,
      }),
      'Dev metrics snapshot',
    );
  }, [copyToClipboard, devMetrics, nowIso, profileLabel, setStatusLine]);

  return {
    handleCopyDevMetricsSnapshot,
  };
};
