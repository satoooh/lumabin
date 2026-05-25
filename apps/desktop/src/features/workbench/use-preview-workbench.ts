import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { useAssetPreviewController } from '../preview/use-asset-preview-controller';
import { useQuickPreviewFocusRestore } from '../preview/use-quick-preview-focus-restore';
import { useQuickPreviewLifecycle } from '../preview/use-quick-preview-lifecycle';
import { useQuickPreviewModalCommands } from '../preview/use-quick-preview-modal-commands';
import { useQuickPreviewNavigation } from '../preview/use-quick-preview-navigation';
import { useQuickPreviewReadModel } from '../preview/quick-preview-read-model';
import { usePreviewSharingCommands } from '../preview/use-preview-sharing-commands';
import { basenameFromKey } from '../shared/asset-key';
import type {
  AssetPreviewApi,
  PreviewSharingApi,
} from '../shared/desktop-api-gateway';
import {
  formatBytes,
  formatDate,
  inferAssetKind,
} from '../shared/asset-display';
import type { AssetItem } from '../../shared/ipc';
import type { QuickPreviewOverlayPropsInput } from '../preview/quick-preview-overlay-props';

type PreviewableKind = 'image' | 'video' | 'pdf' | 'csv';
type AssetKind = PreviewableKind | 'other';
type StatusTone = 'neutral' | 'success' | 'error';
type PreviewOwnedOverlayInput = Omit<
  QuickPreviewOverlayPropsInput,
  'assetManagement' | 'assetManagementCommands'
>;

export interface PreviewWorkbenchOptions {
  assetItemRefs: RefObject<Map<string, HTMLButtonElement>>;
  assetPreviewApi: AssetPreviewApi;
  copiedLabel: string;
  focusAssetItemByKey: (key: string) => boolean;
  isConnectionSetupOpen: boolean;
  isPreviewableKind: (kind: AssetKind) => boolean;
  isSelectionMode: boolean;
  markAssetAsRecentlyViewed: (profileId: string, assetKey: string) => void;
  markCopied: (label: string) => void;
  presignedUrlTTLSeconds: number;
  previewMediaItems: AssetItem[];
  pushInlineFeedback: (message: string) => void;
  scrollToAssetInCurrentView: (key: string, behavior?: ScrollBehavior) => boolean;
  selectedAsset: AssetItem | null;
  selectedAssetKey: string;
  selectedAssetMetadataPublicBaseUrl: string;
  selectedPreviewItemIndex: number;
  selectedProfileId: string;
  setSelectedAssetKey: (key: string) => void;
  sharingApi: PreviewSharingApi;
  setStatusLine: (status: string, tone?: StatusTone) => void;
}

export const usePreviewWorkbench = ({
  assetItemRefs,
  assetPreviewApi,
  copiedLabel,
  focusAssetItemByKey,
  isConnectionSetupOpen,
  isPreviewableKind,
  isSelectionMode,
  markAssetAsRecentlyViewed,
  markCopied,
  presignedUrlTTLSeconds,
  previewMediaItems,
  pushInlineFeedback,
  scrollToAssetInCurrentView,
  selectedAsset,
  selectedAssetKey,
  selectedAssetMetadataPublicBaseUrl,
  selectedPreviewItemIndex,
  selectedProfileId,
  setSelectedAssetKey,
  sharingApi,
  setStatusLine,
}: PreviewWorkbenchOptions) => {
  const [presignedGetUrl, setPresignedGetUrl] = useState<string>('');
  const [presignedPutUrl, setPresignedPutUrl] = useState<string>('');
  const [isSharingBusy, setIsSharingBusy] = useState<boolean>(false);
  const videoPlaybackRequestIdRef = useRef<number>(0);
  const [videoPlaybackUrl, setVideoPlaybackUrl] = useState<string>('');
  const [videoPlaybackError, setVideoPlaybackError] = useState<string>('');
  const [isVideoPlaybackBusy, setIsVideoPlaybackBusy] = useState<boolean>(false);

  const {
    closeQuickPreview,
    isQuickPreviewInfoOpen,
    isQuickPreviewOpen,
    moveQuickPreviewSelection,
    openQuickPreviewForItem,
    quickPreviewOrigin,
    quickPreviewSourceRect,
    resetQuickPreviewGeometry,
    resolveQuickPreviewCloseTargetRect,
    setIsQuickPreviewInfoOpen,
    setIsQuickPreviewOpen,
  } = useQuickPreviewNavigation({
    assetItemRefs,
    inferAssetKind,
    isPreviewableKind,
    previewMediaItems,
    selectedAssetKey,
    selectedPreviewItemIndex,
    setSelectedAssetKey,
  });

  const {
    assetPreview,
    assetPreviewError,
    handleImageDecodeError,
    handlePdfNextPage,
    handlePdfPrevPage,
    handleRetrySelectedAssetMetadata,
    handleRetrySelectedAssetPreview,
    handleVideoDecodeError,
    isHeadBusy,
    isPreviewBusy,
    pdfPreviewPage,
    previewDataUrl,
    selectedAssetMetadata,
    selectedAssetMetadataError,
  } = useAssetPreviewController({
    assetPreviewApi,
    inferAssetKind,
    onStatusLine: setStatusLine,
    selectedAsset,
    selectedProfileId,
  });

  const loadSelectedVideoPlaybackUrl = useCallback(
    async (profileId: string, asset: AssetItem) => {
      const requestId = videoPlaybackRequestIdRef.current + 1;
      videoPlaybackRequestIdRef.current = requestId;

      if (inferAssetKind(asset) !== 'video') {
        setIsVideoPlaybackBusy(false);
        setVideoPlaybackUrl('');
        setVideoPlaybackError('');
        return;
      }

      setIsVideoPlaybackBusy(true);
      setVideoPlaybackError('');
      try {
        const result = await sharingApi.createPresignedGet({
          profileId,
          key: asset.key,
          expiresInSeconds: presignedUrlTTLSeconds,
        });
        if (requestId !== videoPlaybackRequestIdRef.current) {
          return;
        }
        setVideoPlaybackUrl(result.url);
      } catch (error) {
        if (requestId !== videoPlaybackRequestIdRef.current) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        setVideoPlaybackUrl('');
        setVideoPlaybackError(`Video playback URL could not be prepared: ${message}`);
      } finally {
        if (requestId === videoPlaybackRequestIdRef.current) {
          setIsVideoPlaybackBusy(false);
        }
      }
    },
    [presignedUrlTTLSeconds, sharingApi],
  );

  useEffect(() => {
    videoPlaybackRequestIdRef.current += 1;
    setVideoPlaybackUrl('');
    setVideoPlaybackError('');
    setIsVideoPlaybackBusy(false);

    if (!selectedProfileId || !selectedAsset || inferAssetKind(selectedAsset) !== 'video') {
      return;
    }

    void loadSelectedVideoPlaybackUrl(selectedProfileId, selectedAsset);
  }, [loadSelectedVideoPlaybackUrl, selectedAsset, selectedProfileId]);

  const handleRetrySelectedAssetMediaPreview = useCallback(() => {
    if (selectedProfileId && selectedAsset && inferAssetKind(selectedAsset) === 'video') {
      handleRetrySelectedAssetPreview();
      void loadSelectedVideoPlaybackUrl(selectedProfileId, selectedAsset);
      return;
    }

    handleRetrySelectedAssetPreview();
  }, [
    handleRetrySelectedAssetPreview,
    loadSelectedVideoPlaybackUrl,
    selectedAsset,
    selectedProfileId,
  ]);

  const {
    capturedAtLabel,
    cameraLabel,
    lensLabel,
    publicUrlForSelectedAsset,
    shootSettingsLabel,
  } = useQuickPreviewReadModel({
    formatDate,
    selectedAsset,
    selectedAssetMetadata,
    selectedPublicBaseUrl: selectedAssetMetadataPublicBaseUrl,
  });

  const {
    handleCopyPublicUrl,
    handleCopyToClipboard,
    handleCreatePresigned,
    handleDownloadSelectedAsset,
    handleShareSelectedAsset,
  } = usePreviewSharingCommands({
    markCopied,
    presignedUrlTTLSeconds,
    publicUrlForSelectedAsset,
    pushInlineFeedback,
    selectedAsset: selectedAsset ?? undefined,
    selectedProfileId,
    sharingApi,
    setIsSharingBusy,
    setPresignedGetUrl,
    setPresignedPutUrl,
    setStatusLine,
  });

  const {
    handleToggleInfoOpen: handleToggleQuickPreviewInfoOpen,
    metadataCommands: quickPreviewMetadataCommands,
    sharingCommands: quickPreviewSharingCommands,
  } = useQuickPreviewModalCommands({
    copyPublicUrl: handleCopyPublicUrl,
    copyToClipboard: handleCopyToClipboard,
    createPresigned: handleCreatePresigned,
    downloadSelectedAsset: handleDownloadSelectedAsset,
    presignedGetUrl,
    presignedPutUrl,
    retryMetadata: handleRetrySelectedAssetMetadata,
    selectedAsset,
    setIsQuickPreviewInfoOpen,
    shareSelectedAsset: handleShareSelectedAsset,
  });

  useQuickPreviewLifecycle({
    inferAssetKind,
    isConnectionSetupOpen,
    isPreviewableKind,
    isQuickPreviewOpen,
    isSelectionMode,
    markAssetAsRecentlyViewed,
    resetQuickPreviewGeometry,
    selectedAsset: selectedAsset ?? undefined,
    selectedAssetKey,
    selectedProfileId,
    setIsQuickPreviewInfoOpen,
    setIsQuickPreviewOpen,
    setPresignedGetUrl,
    setPresignedPutUrl,
  });

  useQuickPreviewFocusRestore({
    isQuickPreviewOpen,
    selectedAssetKey,
    focusAssetItemByKey,
    scrollToAssetInCurrentView,
  });

  const hasPrevPreviewImage = selectedPreviewItemIndex > 0;
  const hasNextPreviewImage =
    selectedPreviewItemIndex >= 0 &&
    selectedPreviewItemIndex < previewMediaItems.length - 1;

  const quickPreviewOverlayInput: PreviewOwnedOverlayInput = {
    state: {
      isQuickPreviewOpen,
    },
    selectedAsset,
    animation: {
      closeQuickPreview,
      quickPreviewOrigin,
      quickPreviewSourceRect,
      resolveQuickPreviewCloseTargetRect,
    },
    navigation: {
      hasNextPreviewImage,
      hasPrevPreviewImage,
      isQuickPreviewInfoOpen,
      moveQuickPreviewSelection,
      handleToggleQuickPreviewInfoOpen,
      previewMediaItemsCount: previewMediaItems.length,
      selectedPreviewItemIndex,
    },
    media: {
      assetPreview,
      assetPreviewError,
      handleImageDecodeError,
      handlePdfNextPage,
      handlePdfPrevPage,
      handleRetrySelectedAssetPreview: handleRetrySelectedAssetMediaPreview,
      handleVideoDecodeError,
      isPreviewBusy,
      isVideoPlaybackBusy,
      pdfPreviewPage,
      previewDataUrl,
      videoPlaybackError,
      videoPlaybackUrl,
    },
    sharing: {
      isPresignedGetCopied: copiedLabel === 'Presigned GET URL',
      isPresignedPutCopied: copiedLabel === 'Presigned PUT URL',
      isPublicUrlCopied: copiedLabel === 'Public URL',
      isShareUrlCopied: copiedLabel === 'Share URL',
      isSharingBusy,
      presignedGetUrl,
      presignedPutUrl,
      publicUrlForSelectedAsset,
      selectedProfileId,
    },
    sharingCommands: quickPreviewSharingCommands,
    metadata: {
      cameraLabel,
      capturedAtLabel,
      isAssetKeyCopied: copiedLabel === 'Asset key',
      isHeadBusy,
      lensLabel,
      selectedAssetMetadata,
      selectedAssetMetadataError,
      shootSettingsLabel,
    },
    metadataCommands: quickPreviewMetadataCommands,
    formatters: {
      basenameFromKey,
      formatBytes,
      formatDate,
    },
  };

  return {
    closeQuickPreview,
    handleCopyToClipboard,
    isQuickPreviewOpen,
    moveQuickPreviewSelection,
    openQuickPreviewForItem,
    quickPreviewOverlayInput,
    setIsQuickPreviewOpen,
  };
};
