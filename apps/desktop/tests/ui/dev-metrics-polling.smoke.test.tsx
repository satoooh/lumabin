import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEV_METRICS_POLL_INTERVAL_MS,
  useDevMetricsPolling,
} from '../../src/features/settings/use-dev-metrics-polling';

interface ProbeProps {
  isDevEnv?: boolean;
  isWorkspaceSettingsOpen?: boolean;
  loadDevMetrics: () => Promise<void> | void;
}

const Probe = ({
  isDevEnv = true,
  isWorkspaceSettingsOpen = true,
  loadDevMetrics,
}: ProbeProps) => {
  useDevMetricsPolling({
    isDevEnv,
    isWorkspaceSettingsOpen,
    loadDevMetrics,
  });
  return null;
};

describe('dev metrics polling', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('loads immediately and then polls while dev settings are open', () => {
    vi.useFakeTimers();
    const loadDevMetrics = vi.fn();

    render(<Probe loadDevMetrics={loadDevMetrics} />);

    expect(loadDevMetrics).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(DEV_METRICS_POLL_INTERVAL_MS);
    });
    expect(loadDevMetrics).toHaveBeenCalledTimes(2);
  });

  it('does not poll outside development mode', () => {
    vi.useFakeTimers();
    const loadDevMetrics = vi.fn();

    render(<Probe isDevEnv={false} loadDevMetrics={loadDevMetrics} />);

    act(() => {
      vi.advanceTimersByTime(DEV_METRICS_POLL_INTERVAL_MS);
    });
    expect(loadDevMetrics).not.toHaveBeenCalled();
  });

  it('clears the interval when settings close', () => {
    vi.useFakeTimers();
    const loadDevMetrics = vi.fn();
    const { rerender } = render(<Probe loadDevMetrics={loadDevMetrics} />);

    rerender(<Probe isWorkspaceSettingsOpen={false} loadDevMetrics={loadDevMetrics} />);

    act(() => {
      vi.advanceTimersByTime(DEV_METRICS_POLL_INTERVAL_MS);
    });
    expect(loadDevMetrics).toHaveBeenCalledTimes(1);
  });
});
