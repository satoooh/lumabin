import { ipcChannels } from '../../../../shared/ipc';
import type { IpcContractCatalogEntry } from '../../ipc/contract-types';

export const assetLibraryIpcContract = [
  {
    channel: ipcChannels.assets.list,
    boundedContext: 'asset-library',
    kind: 'query',
    intent: 'Read asset summaries from object storage and refresh the search read model.',
  },
  {
    channel: ipcChannels.assets.head,
    boundedContext: 'asset-library',
    kind: 'query',
    intent: 'Read object metadata for preview and detail panels.',
  },
  {
    channel: ipcChannels.assets.preview,
    boundedContext: 'asset-library',
    kind: 'query',
    intent: 'Read a bounded preview representation of an asset.',
  },
  {
    channel: ipcChannels.assets.rename,
    boundedContext: 'asset-library',
    kind: 'command',
    intent: 'Rename an asset by copy-delete and update local projections.',
  },
  {
    channel: ipcChannels.assets.move,
    boundedContext: 'asset-library',
    kind: 'command',
    intent: 'Move an asset to a new key by copy-delete and update local projections.',
  },
  {
    channel: ipcChannels.assets.remove,
    boundedContext: 'asset-library',
    kind: 'command',
    intent: 'Delete one or more assets and update local projections.',
  },
] satisfies IpcContractCatalogEntry[];
