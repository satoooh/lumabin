import { ipcMain } from 'electron';
import { assertIpcContractCatalogCoversChannels } from './application/ipc/contract-catalog';
import { registerDiagnosticsHandlers } from './application/contexts/diagnostics/ipc-handlers';
import { registerAssetSharingRuntime } from './application/contexts/asset-sharing/runtime-composition';
import { registerWorkspaceRuntime } from './application/contexts/workspace/runtime-composition';
import { registerAssetDiscoveryRuntime } from './application/contexts/asset-discovery/runtime-composition';
import { registerAssetIngestionRuntime } from './application/contexts/asset-ingestion/runtime-composition';
import { registerAssetLibraryProjectionRuntime } from './application/contexts/asset-library/projection-runtime-composition';
import { registerAssetLibraryRuntime } from './application/contexts/asset-library/runtime-composition';
import { bootstrapApplicationState } from './application/bootstrap-composition';

export interface ApplicationCompositionRuntime {
  dispose(): void;
}

export const registerApplicationComposition = (): ApplicationCompositionRuntime => {
  assertIpcContractCatalogCoversChannels();
  const { persistState } = bootstrapApplicationState();
  const assetProjectionRuntime = registerAssetLibraryProjectionRuntime();

  const assetIngestionRuntime = registerAssetIngestionRuntime(ipcMain, {
    clearObjectMutation: assetProjectionRuntime.clearObjectMutationProjections,
  });

  registerWorkspaceRuntime(ipcMain, {
    clearProfileCaches: assetProjectionRuntime.clearProfileProjections,
    persistState,
  });

  registerAssetLibraryRuntime(ipcMain);

  registerAssetDiscoveryRuntime(ipcMain, {
    persistState,
  });

  registerDiagnosticsHandlers(ipcMain);

  registerAssetSharingRuntime(ipcMain);

  return {
    dispose: (): void => {
      assetIngestionRuntime.dispose();
      assetProjectionRuntime.dispose();
    },
  };
};
