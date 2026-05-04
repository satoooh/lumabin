import { ipcChannels } from '../../../../shared/ipc';
import type { IpcContractCatalogEntry } from '../../ipc/contract-types';

export const workspaceIpcContract = [
  {
    channel: ipcChannels.profiles.list,
    boundedContext: 'workspace',
    kind: 'query',
    intent: 'Read configured connection profiles without secrets.',
  },
  {
    channel: ipcChannels.profiles.save,
    boundedContext: 'workspace',
    kind: 'command',
    intent: 'Create or update a storage connection profile and its secret reference.',
  },
  {
    channel: ipcChannels.profiles.testConnection,
    boundedContext: 'workspace',
    kind: 'query',
    intent: 'Probe a configured profile without changing workspace state.',
  },
  {
    channel: ipcChannels.profiles.remove,
    boundedContext: 'workspace',
    kind: 'command',
    intent: 'Remove a connection profile and its local secret.',
  },
  {
    channel: ipcChannels.settings.get,
    boundedContext: 'workspace',
    kind: 'query',
    intent: 'Read workspace settings.',
  },
  {
    channel: ipcChannels.settings.save,
    boundedContext: 'workspace',
    kind: 'command',
    intent: 'Persist workspace settings.',
  },
] satisfies IpcContractCatalogEntry[];
