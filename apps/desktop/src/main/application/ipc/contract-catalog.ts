import { ipcChannels } from '../../../shared/ipc';
import { assetDiscoveryIpcContract } from '../contexts/asset-discovery/ipc-contract';
import { assetIngestionIpcContract } from '../contexts/asset-ingestion/ipc-contract';
import { assetLibraryIpcContract } from '../contexts/asset-library/ipc-contract';
import { assetSharingIpcContract } from '../contexts/asset-sharing/ipc-contract';
import { diagnosticsIpcContract } from '../contexts/diagnostics/ipc-contract';
import type { IpcContractCatalogEntry } from './contract-types';
import { workspaceIpcContract } from '../contexts/workspace/ipc-contract';

export type {
  BoundedContextName,
  IpcContractCatalogEntry,
  IpcMessageKind,
} from './contract-types';

export const ipcContractCatalog: IpcContractCatalogEntry[] = [
  ...workspaceIpcContract,
  ...assetLibraryIpcContract,
  ...assetIngestionIpcContract,
  ...assetDiscoveryIpcContract,
  ...assetSharingIpcContract,
  ...diagnosticsIpcContract,
];

const collectChannels = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }
  if (!value || typeof value !== 'object') {
    return [];
  }
  return Object.values(value).flatMap(collectChannels);
};

export const assertIpcContractCatalogCoversChannels = (): void => {
  const declaredChannels = new Set(ipcContractCatalog.map((entry) => entry.channel));
  const actualChannels = collectChannels(ipcChannels);

  const missing = actualChannels.filter((channel) => !declaredChannels.has(channel));
  if (missing.length > 0) {
    throw new Error(`IPC contract catalog is missing channels: ${missing.join(', ')}`);
  }

  const unknown = [...declaredChannels].filter((channel) => !actualChannels.includes(channel));
  if (unknown.length > 0) {
    throw new Error(`IPC contract catalog has unknown channels: ${unknown.join(', ')}`);
  }
};
