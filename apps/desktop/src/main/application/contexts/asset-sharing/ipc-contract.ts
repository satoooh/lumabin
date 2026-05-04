import { ipcChannels } from '../../../../shared/ipc';
import type { IpcContractCatalogEntry } from '../../ipc/contract-types';

export const assetSharingIpcContract = [
  {
    channel: ipcChannels.sharing.createPresignedGet,
    boundedContext: 'asset-sharing',
    kind: 'query',
    intent: 'Create a temporary read link without changing application state.',
  },
  {
    channel: ipcChannels.sharing.createPresignedPut,
    boundedContext: 'asset-sharing',
    kind: 'query',
    intent: 'Create a temporary upload link without changing application state.',
  },
] satisfies IpcContractCatalogEntry[];
