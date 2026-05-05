import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { AssetItem, ConflictPolicy } from '../../shared/ipc';
import type { DesktopApiGateway } from '../shared/desktop-api-gateway';
import { useAssetActionsWorkbench } from './use-asset-actions-workbench';
import { useUploadWorkbench } from './use-upload-workbench';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseAssetCommandFlowWorkbenchOptions {
  api: {
    assetLibrary: DesktopApiGateway['assetLibrary'];
    assetUpload: DesktopApiGateway['assetUpload'];
    files: DesktopApiGateway['files'];
  };
  feedback: {
    pushInlineFeedback(message: string): void;
    setStatusLine(status: string, tone?: StatusTone): void;
  };
  gallery: {
    assetsPrefix: string;
    reloadCurrentItems(): Promise<void>;
    selectedAsset: AssetItem | null;
    selectedAssetKey: string;
    selectedAssetKeys: string[];
    setIsSelectionMode: Dispatch<SetStateAction<boolean>>;
    setSelectedAssetKey: Dispatch<SetStateAction<string>>;
    setSelectedAssetKeys: Dispatch<SetStateAction<string[]>>;
    visibleItems: AssetItem[];
  };
  preview: {
    setIsQuickPreviewOpen: Dispatch<SetStateAction<boolean>>;
  };
  surfaces: {
    appShellRef: RefObject<HTMLDivElement | null>;
    uploadToastRef: RefObject<HTMLElement | null>;
  };
  workspace: {
    defaultConflictPolicy: ConflictPolicy;
    isConnectionSetupOpen: boolean;
    selectedProfileId: string;
    showGuidedStart: boolean;
  };
}

export const useAssetCommandFlowWorkbench = ({
  api,
  feedback,
  gallery,
  preview,
  surfaces,
  workspace,
}: UseAssetCommandFlowWorkbenchOptions) => {
  const assetActions = useAssetActionsWorkbench({
    assetMutationApi: api.assetLibrary,
    assetsPrefix: gallery.assetsPrefix,
    deleteAssets: api.assetLibrary.deleteAssets,
    isConnectionSetupOpen: workspace.isConnectionSetupOpen,
    pushInlineFeedback: feedback.pushInlineFeedback,
    reloadCurrentItems: gallery.reloadCurrentItems,
    selectedAsset: gallery.selectedAsset,
    selectedAssetKey: gallery.selectedAssetKey,
    selectedAssetKeys: gallery.selectedAssetKeys,
    selectedProfileId: workspace.selectedProfileId,
    setIsQuickPreviewOpen: preview.setIsQuickPreviewOpen,
    setIsSelectionMode: gallery.setIsSelectionMode,
    setSelectedAssetKey: gallery.setSelectedAssetKey,
    setSelectedAssetKeys: gallery.setSelectedAssetKeys,
    setStatusLine: feedback.setStatusLine,
    showGuidedStart: workspace.showGuidedStart,
    visibleItems: gallery.visibleItems,
  });

  const upload = useUploadWorkbench({
    appShellRef: surfaces.appShellRef,
    assetsPrefix: gallery.assetsPrefix,
    defaultConflictPolicy: workspace.defaultConflictPolicy,
    filesApi: api.files,
    isConnectionReady: Boolean(workspace.selectedProfileId),
    isConnectionSetupOpen: workspace.isConnectionSetupOpen,
    onGalleryRefresh: gallery.reloadCurrentItems,
    onInlineFeedback: feedback.pushInlineFeedback,
    onStatusLine: feedback.setStatusLine,
    selectedProfileId: workspace.selectedProfileId,
    showGuidedStart: workspace.showGuidedStart,
    uploadApi: api.assetUpload,
    uploadToastRef: surfaces.uploadToastRef,
  });

  return {
    ...assetActions,
    ...upload,
  };
};
