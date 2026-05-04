import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatDevMetricsSnapshot,
  useDevMetricsCommands,
  useDevMetricsSnapshotCopy,
} from '../../src/features/settings/use-dev-metrics-commands';
import type { DevMetricsSnapshot } from '../../src/shared/ipc';

const metrics: DevMetricsSnapshot = {
  cache: {
    headHit: 1,
    headInFlightHit: 0,
    headMiss: 2,
    previewHit: 3,
    previewInFlightHit: 0,
    previewMiss: 4,
    searchSnapshotHit: 5,
    searchSnapshotMiss: 6,
  },
  collectedAt: '2026-05-03T00:00:00.000Z',
  storage: {
    bytesDownloaded: 10,
    bytesUploaded: 20,
    failures: 0,
    getCalls: 1,
    headCalls: 2,
    listCalls: 3,
    putCalls: 4,
    existsChecks: 5,
  },
};

interface ProbeProps {
  getMetrics?: () => Promise<DevMetricsSnapshot>;
  isDevEnv?: boolean;
  resetMetrics?: () => Promise<DevMetricsSnapshot>;
  setStatusLine?: ReturnType<typeof vi.fn>;
}

const Probe = ({
  getMetrics = vi.fn(async () => metrics),
  isDevEnv = true,
  resetMetrics = vi.fn(async () => metrics),
  setStatusLine = vi.fn(),
}: ProbeProps) => {
  const commands = useDevMetricsCommands({
    getMetrics,
    isDevEnv,
    resetMetrics,
    setStatusLine,
  });

  return (
    <div>
      <output data-testid="collected-at">{commands.devMetrics?.collectedAt ?? ''}</output>
      <output data-testid="busy">{commands.isDevMetricsBusy ? 'busy' : 'idle'}</output>
      <button type="button" onClick={() => void commands.loadDevMetrics()}>
        Load
      </button>
      <button type="button" onClick={() => void commands.handleResetDevMetrics()}>
        Reset
      </button>
    </div>
  );
};

const CopyProbe = ({
  copyToClipboard = vi.fn(async () => undefined),
  setStatusLine = vi.fn(),
}: {
  copyToClipboard?: (value: string, label: string) => Promise<void>;
  setStatusLine?: ReturnType<typeof vi.fn>;
}) => {
  const { handleCopyDevMetricsSnapshot } = useDevMetricsSnapshotCopy({
    copyToClipboard,
    devMetrics: metrics,
    nowIso: () => '2026-05-03T01:00:00.000Z',
    profileLabel: 'Production',
    setStatusLine,
  });

  return (
    <button type="button" onClick={() => void handleCopyDevMetricsSnapshot()}>
      Copy snapshot
    </button>
  );
};

describe('dev metrics commands hook', () => {
  afterEach(() => {
    cleanup();
  });

  it('loads metrics snapshots only in dev mode', async () => {
    render(<Probe />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    });

    await vi.waitFor(() => {
      expect(screen.getByTestId('collected-at').textContent).toBe(metrics.collectedAt);
    });
  });

  it('resets metrics and reports status', async () => {
    const setStatusLine = vi.fn();
    render(<Probe setStatusLine={setStatusLine} />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    });

    await vi.waitFor(() => {
      expect(setStatusLine).toHaveBeenCalledWith('Dev metrics reset.', 'neutral');
    });
    expect(screen.getByTestId('collected-at').textContent).toBe(metrics.collectedAt);
  });

  it('does nothing outside dev mode', async () => {
    const getMetrics = vi.fn(async () => metrics);
    const resetMetrics = vi.fn(async () => metrics);
    render(<Probe getMetrics={getMetrics} isDevEnv={false} resetMetrics={resetMetrics} />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Load' }));
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    });

    expect(getMetrics).not.toHaveBeenCalled();
    expect(resetMetrics).not.toHaveBeenCalled();
  });

  it('formats and copies metrics snapshots', async () => {
    const copyToClipboard = vi.fn(async () => undefined);
    render(<CopyProbe copyToClipboard={copyToClipboard} />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy snapshot' }));
    });

    await vi.waitFor(() => {
      expect(copyToClipboard).toHaveBeenCalledWith(
        formatDevMetricsSnapshot(metrics, {
          nowIso: '2026-05-03T01:00:00.000Z',
          profileLabel: 'Production',
        }),
        'Dev metrics snapshot',
      );
    });
  });
});
