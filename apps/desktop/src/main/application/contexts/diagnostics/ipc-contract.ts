import { ipcChannels } from '../../../../shared/ipc';
import type { IpcContractCatalogEntry } from '../../ipc/contract-types';

export const diagnosticsIpcContract = [
  {
    channel: ipcChannels.runtime.getInfo,
    boundedContext: 'diagnostics',
    kind: 'query',
    intent: 'Read non-secret runtime diagnostics capability flags.',
  },
  {
    channel: ipcChannels.dev.getMetrics,
    boundedContext: 'diagnostics',
    kind: 'query',
    intent: 'Read local diagnostic metrics.',
  },
  {
    channel: ipcChannels.dev.resetMetrics,
    boundedContext: 'diagnostics',
    kind: 'command',
    intent: 'Reset local diagnostic metrics.',
  },
] satisfies IpcContractCatalogEntry[];
