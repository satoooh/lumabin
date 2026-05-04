import { ipcChannels } from '../../../../shared/ipc';
import type { IpcContractCatalogEntry } from '../../ipc/contract-types';

export const assetDiscoveryIpcContract = [
  {
    channel: ipcChannels.search.query,
    boundedContext: 'asset-discovery',
    kind: 'query',
    intent: 'Read the search projection for a profile.',
  },
  {
    channel: ipcChannels.search.saveView,
    boundedContext: 'asset-discovery',
    kind: 'command',
    intent: 'Persist a reusable asset discovery view.',
  },
  {
    channel: ipcChannels.search.listViews,
    boundedContext: 'asset-discovery',
    kind: 'query',
    intent: 'Read saved discovery views.',
  },
  {
    channel: ipcChannels.search.removeView,
    boundedContext: 'asset-discovery',
    kind: 'command',
    intent: 'Delete a saved discovery view.',
  },
] satisfies IpcContractCatalogEntry[];
