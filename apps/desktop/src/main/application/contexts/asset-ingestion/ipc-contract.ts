import { ipcChannels } from '../../../../shared/ipc';
import type { IpcContractCatalogEntry } from '../../ipc/contract-types';

export const assetIngestionIpcContract = [
  {
    channel: ipcChannels.files.persistClipboardFile,
    boundedContext: 'asset-ingestion',
    kind: 'command',
    intent: 'Persist dropped or pasted clipboard bytes for later upload.',
  },
  {
    channel: ipcChannels.files.persistClipboardImageFromSystem,
    boundedContext: 'asset-ingestion',
    kind: 'command',
    intent: 'Persist the current system clipboard image for later upload.',
  },
  {
    channel: ipcChannels.assets.checkUploadConflicts,
    boundedContext: 'asset-ingestion',
    kind: 'query',
    intent: 'Detect destination key conflicts before an upload command.',
  },
  {
    channel: ipcChannels.assets.upload,
    boundedContext: 'asset-ingestion',
    kind: 'command',
    intent: 'Start an upload job and mutate storage asynchronously.',
  },
  {
    channel: ipcChannels.assets.getUploadJob,
    boundedContext: 'asset-ingestion',
    kind: 'query',
    intent: 'Read the current upload job projection.',
  },
  {
    channel: ipcChannels.assets.cancelUpload,
    boundedContext: 'asset-ingestion',
    kind: 'command',
    intent: 'Request cancellation for an active upload job.',
  },
] satisfies IpcContractCatalogEntry[];
