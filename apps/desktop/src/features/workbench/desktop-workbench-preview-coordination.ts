import type { PreviewWorkbenchOptions } from './use-preview-workbench';

interface DesktopWorkbenchPreviewCoordinationInput {
  api: Pick<
    PreviewWorkbenchOptions,
    'assetPreviewApi' | 'sharingApi'
  >;
  feedback: Pick<
    PreviewWorkbenchOptions,
    | 'copiedLabel'
    | 'markCopied'
    | 'pushInlineFeedback'
    | 'setStatusLine'
  >;
  gallery: Pick<
    PreviewWorkbenchOptions,
    | 'assetItemRefs'
    | 'focusAssetItemByKey'
    | 'isPreviewableKind'
    | 'markAssetAsRecentlyViewed'
    | 'previewMediaItems'
    | 'scrollToAssetInCurrentView'
    | 'selectedPreviewItemIndex'
    | 'setSelectedAssetKey'
  >;
  previewState: Pick<
    PreviewWorkbenchOptions,
    | 'isConnectionSetupOpen'
    | 'isSelectionMode'
    | 'selectedAsset'
    | 'selectedAssetKey'
  >;
  profile: Pick<
    PreviewWorkbenchOptions,
    | 'presignedUrlTTLSeconds'
    | 'selectedAssetMetadataPublicBaseUrl'
    | 'selectedProfileId'
  >;
}

export const createDesktopWorkbenchPreviewCoordinationInput = ({
  api,
  feedback,
  gallery,
  previewState,
  profile,
}: DesktopWorkbenchPreviewCoordinationInput): PreviewWorkbenchOptions => ({
  assetItemRefs: gallery.assetItemRefs,
  assetPreviewApi: api.assetPreviewApi,
  copiedLabel: feedback.copiedLabel,
  focusAssetItemByKey: gallery.focusAssetItemByKey,
  isConnectionSetupOpen: previewState.isConnectionSetupOpen,
  isPreviewableKind: gallery.isPreviewableKind,
  isSelectionMode: previewState.isSelectionMode,
  markAssetAsRecentlyViewed: gallery.markAssetAsRecentlyViewed,
  markCopied: feedback.markCopied,
  presignedUrlTTLSeconds: profile.presignedUrlTTLSeconds,
  previewMediaItems: gallery.previewMediaItems,
  pushInlineFeedback: feedback.pushInlineFeedback,
  scrollToAssetInCurrentView: gallery.scrollToAssetInCurrentView,
  selectedAsset: previewState.selectedAsset,
  selectedAssetKey: previewState.selectedAssetKey,
  selectedAssetMetadataPublicBaseUrl: profile.selectedAssetMetadataPublicBaseUrl,
  selectedPreviewItemIndex: gallery.selectedPreviewItemIndex,
  selectedProfileId: profile.selectedProfileId,
  setSelectedAssetKey: gallery.setSelectedAssetKey,
  sharingApi: api.sharingApi,
  setStatusLine: feedback.setStatusLine,
});
