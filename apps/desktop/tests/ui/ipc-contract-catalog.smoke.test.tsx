import { describe, expect, it } from 'vitest';
import { assetDiscoveryIpcContract } from '../../src/main/application/contexts/asset-discovery/ipc-contract';
import { assetIngestionIpcContract } from '../../src/main/application/contexts/asset-ingestion/ipc-contract';
import { assetLibraryIpcContract } from '../../src/main/application/contexts/asset-library/ipc-contract';
import { assetSharingIpcContract } from '../../src/main/application/contexts/asset-sharing/ipc-contract';
import { diagnosticsIpcContract } from '../../src/main/application/contexts/diagnostics/ipc-contract';
import {
  assertIpcContractCatalogCoversChannels,
  ipcContractCatalog,
} from '../../src/main/application/ipc/contract-catalog';
import { workspaceIpcContract } from '../../src/main/application/contexts/workspace/ipc-contract';
import type {
  BoundedContextName,
  IpcContractCatalogEntry,
} from '../../src/main/application/ipc/contract-types';

const contractFragments: Array<{
  boundedContext: BoundedContextName;
  entries: IpcContractCatalogEntry[];
}> = [
  { boundedContext: 'workspace', entries: workspaceIpcContract },
  { boundedContext: 'asset-library', entries: assetLibraryIpcContract },
  { boundedContext: 'asset-ingestion', entries: assetIngestionIpcContract },
  { boundedContext: 'asset-discovery', entries: assetDiscoveryIpcContract },
  { boundedContext: 'asset-sharing', entries: assetSharingIpcContract },
  { boundedContext: 'diagnostics', entries: diagnosticsIpcContract },
];

describe('IPC contract catalog', () => {
  it('keeps every shared IPC channel classified', () => {
    expect(() => assertIpcContractCatalogCoversChannels()).not.toThrow();
  });

  it('keeps each bounded context owning only its own channel contract entries', () => {
    for (const fragment of contractFragments) {
      expect(fragment.entries.length).toBeGreaterThan(0);
      expect(
        fragment.entries.every((entry) => entry.boundedContext === fragment.boundedContext),
      ).toBe(true);
    }
  });

  it('does not register duplicate channel ownership', () => {
    const channels = ipcContractCatalog.map((entry) => entry.channel);

    expect(new Set(channels).size).toBe(channels.length);
  });
});
