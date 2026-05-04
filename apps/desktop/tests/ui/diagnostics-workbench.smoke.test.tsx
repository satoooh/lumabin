import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { useDiagnosticsWorkbench } from '../../src/features/workbench/use-diagnostics-workbench';
import type { DevMetricsSnapshot } from '../../src/shared/ipc';

const metrics: DevMetricsSnapshot = {
  collectedAt: '2026-05-03T00:00:00.000Z',
  cache: {
    headHit: 0,
    headInFlightHit: 0,
    headMiss: 0,
    previewHit: 0,
    previewInFlightHit: 0,
    previewMiss: 0,
    searchSnapshotHit: 0,
    searchSnapshotMiss: 0,
  },
  storage: {
    bytesDownloaded: 0,
    bytesUploaded: 0,
    existsChecks: 0,
    failures: 0,
    getCalls: 0,
    headCalls: 0,
    listCalls: 1,
    putCalls: 0,
    testConnectionCalls: 0,
  },
};

const Probe = ({
  getInfo = vi.fn(async () => ({ isE2E: false })),
  getMetrics = vi.fn(async () => metrics),
  isDevEnv = false,
}: {
  getInfo?: () => Promise<{ isE2E: boolean }>;
  getMetrics?: () => Promise<DevMetricsSnapshot>;
  isDevEnv?: boolean;
}) => {
  const diagnostics = useDiagnosticsWorkbench({
    copyToClipboard: vi.fn(),
    diagnosticsApi: {
      getMetrics,
      resetMetrics: vi.fn(async () => metrics),
    },
    isDevEnv,
    isWorkspaceSettingsOpen: true,
    nowIso: () => '2026-05-03T00:00:00.000Z',
    profileLabel: 'E2E fixture',
    runtimeApi: {
      getInfo,
    },
    setStatusLine: vi.fn(),
  });

  return (
    <p>
      {diagnostics.isDiagnosticsEnabled ? 'enabled' : 'disabled'}
    </p>
  );
};

describe('useDiagnosticsWorkbench', () => {
  afterEach(() => {
    cleanup();
  });

  it('enables diagnostics for packaged E2E runtime outside dev builds', async () => {
    const getInfo = vi.fn(async () => ({ isE2E: true }));
    const getMetrics = vi.fn(async () => metrics);

    render(<Probe getInfo={getInfo} getMetrics={getMetrics} />);

    await waitFor(() => {
      expect(screen.getByText('enabled')).toBeTruthy();
    });
    await waitFor(() => {
      expect(getMetrics).toHaveBeenCalled();
    });
  });

  it('keeps diagnostics disabled when runtime capability is unavailable', async () => {
    const getInfo = vi.fn(async () => {
      throw new Error('runtime unavailable');
    });
    const getMetrics = vi.fn(async () => metrics);

    render(<Probe getInfo={getInfo} getMetrics={getMetrics} />);

    await waitFor(() => {
      expect(getInfo).toHaveBeenCalled();
    });
    expect(screen.getByText('disabled')).toBeTruthy();
    expect(getMetrics).not.toHaveBeenCalled();
  });
});
