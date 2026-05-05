import { createDesktopWorkbenchPreviewCoordinationInput } from './desktop-workbench-preview-coordination';
import type { useDesktopWorkbenchShellResources } from './use-desktop-workbench-shell-resources';
import type { useGalleryBrowsingWorkbench } from './use-gallery-browsing-workbench';
import { usePreviewWorkbench } from './use-preview-workbench';
import type { useWorkspaceStateWorkbench } from './use-workspace-state-workbench';
import type { DesktopApiGateway } from '../shared/desktop-api-gateway';

interface UseDesktopWorkbenchPreviewSurfaceOptions {
  desktopApi: DesktopApiGateway;
  feedback: ReturnType<typeof useDesktopWorkbenchShellResources>['feedback'];
  galleryBrowsing: ReturnType<typeof useGalleryBrowsingWorkbench>;
  workspaceState: ReturnType<typeof useWorkspaceStateWorkbench>;
}

export const useDesktopWorkbenchPreviewSurface = ({
  desktopApi,
  feedback,
  galleryBrowsing,
  workspaceState,
}: UseDesktopWorkbenchPreviewSurfaceOptions) =>
  usePreviewWorkbench(
    createDesktopWorkbenchPreviewCoordinationInput({
      api: {
        assetPreviewApi: desktopApi.assetLibrary,
        sharingApi: desktopApi.assetSharing,
      },
      feedback: {
        copiedLabel: feedback.copiedLabel,
        markCopied: feedback.markCopied,
        pushInlineFeedback: feedback.pushInlineFeedback,
        setStatusLine: feedback.setStatusLine,
      },
      gallery: {
        assetItemRefs: galleryBrowsing.assetItemRefs,
        focusAssetItemByKey: galleryBrowsing.focusAssetItemByKey,
        isPreviewableKind: galleryBrowsing.isPreviewableKind,
        markAssetAsRecentlyViewed: galleryBrowsing.markAssetAsRecentlyViewed,
        previewMediaItems: galleryBrowsing.previewMediaItems,
        scrollToAssetInCurrentView: galleryBrowsing.scrollToAssetInCurrentView,
        selectedPreviewItemIndex: galleryBrowsing.selectedPreviewItemIndex,
        setSelectedAssetKey: galleryBrowsing.setSelectedAssetKey,
      },
      previewState: {
        isConnectionSetupOpen: workspaceState.isConnectionSetupOpen,
        isSelectionMode: galleryBrowsing.isSelectionMode,
        selectedAsset: galleryBrowsing.selectedAsset,
        selectedAssetKey: galleryBrowsing.selectedAssetKey,
      },
      profile: {
        presignedUrlTTLSeconds: workspaceState.settings.presignedUrlTTLSeconds,
        selectedAssetMetadataPublicBaseUrl: workspaceState.selectedPublicBaseUrl,
        selectedProfileId: workspaceState.selectedProfileId,
      },
    }),
  );
