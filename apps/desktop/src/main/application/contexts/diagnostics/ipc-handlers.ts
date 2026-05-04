import type { IpcMain } from 'electron';
import {
  getDevMetricsSnapshot,
  resetDevMetrics,
} from '../../../dev-metrics';
import { isE2EMode } from '../../../e2e-runtime';
import {
  ipcChannels,
  type DevMetricsSnapshot,
  type RuntimeInfo,
} from '../../../../shared/ipc';

export const registerDiagnosticsHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle(
    ipcChannels.runtime.getInfo,
    async (): Promise<RuntimeInfo> => ({
      isE2E: isE2EMode,
    }),
  );

  ipcMain.handle(
    ipcChannels.dev.getMetrics,
    async (): Promise<DevMetricsSnapshot> => getDevMetricsSnapshot(),
  );

  ipcMain.handle(
    ipcChannels.dev.resetMetrics,
    async (): Promise<DevMetricsSnapshot> => resetDevMetrics(),
  );
};
