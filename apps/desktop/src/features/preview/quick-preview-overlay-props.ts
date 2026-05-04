import type {
  AssetItem,
  AssetMetadata,
  AssetPreview,
} from '../../shared/ipc';
import type {
  QuickPreviewModalAssetManagementCommands,
  QuickPreviewModalFormatters,
  QuickPreviewModalMetadataCommands,
  QuickPreviewModalProps,
  QuickPreviewModalSharingCommands,
} from './quick-preview-modal-contracts';

export interface QuickPreviewOverlayPropsInput {
  assetManagement: {
    isAssetActionBusy: boolean;
  };
  assetManagementCommands: QuickPreviewModalAssetManagementCommands;
  animation: {
    closeQuickPreview: () => void;
    quickPreviewOrigin: { x: number; y: number } | null;
    quickPreviewSourceRect: { x: number; y: number; width: number; height: number } | null;
    resolveQuickPreviewCloseTargetRect: () => { x: number; y: number; width: number; height: number } | null;
  };
  formatters: QuickPreviewModalFormatters;
  media: {
    assetPreview: AssetPreview | null;
    assetPreviewError: string;
    handleImageDecodeError: () => void;
    handlePdfNextPage: () => void;
    handlePdfPrevPage: () => void;
    handleRetrySelectedAssetPreview: () => void;
    handleVideoDecodeError: () => void;
    isPreviewBusy: boolean;
    pdfPreviewPage: number;
    previewDataUrl: string;
  };
  metadata: {
    cameraLabel: string;
    capturedAtLabel: string;
    isAssetKeyCopied: boolean;
    isHeadBusy: boolean;
    lensLabel: string;
    selectedAssetMetadata: AssetMetadata | null;
    selectedAssetMetadataError: string;
    shootSettingsLabel: string;
  };
  metadataCommands: QuickPreviewModalMetadataCommands;
  navigation: {
    hasNextPreviewImage: boolean;
    hasPrevPreviewImage: boolean;
    isQuickPreviewInfoOpen: boolean;
    moveQuickPreviewSelection: (direction: -1 | 1) => void;
    handleToggleQuickPreviewInfoOpen: () => void;
    previewMediaItemsCount: number;
    selectedPreviewItemIndex: number;
  };
  selectedAsset: AssetItem | null;
  sharing: {
    isPresignedGetCopied: boolean;
    isPresignedPutCopied: boolean;
    isPublicUrlCopied: boolean;
    isShareUrlCopied: boolean;
    isSharingBusy: boolean;
    presignedGetUrl: string;
    presignedPutUrl: string;
    publicUrlForSelectedAsset: string;
    selectedProfileId: string;
  };
  sharingCommands: QuickPreviewModalSharingCommands;
  state: {
    isQuickPreviewOpen: boolean;
  };
}

export const createQuickPreviewOverlayProps = ({
  assetManagement,
  assetManagementCommands,
  animation,
  formatters,
  media,
  metadata,
  metadataCommands,
  navigation,
  selectedAsset,
  sharing,
  sharingCommands,
  state,
}: QuickPreviewOverlayPropsInput): QuickPreviewModalProps => ({
  isOpen: state.isQuickPreviewOpen,
  selectedAsset,
  animation: {
    onClose: animation.closeQuickPreview,
    previewOrigin: animation.quickPreviewOrigin,
    previewSourceRect: animation.quickPreviewSourceRect,
    resolveCloseTargetRect: animation.resolveQuickPreviewCloseTargetRect,
  },
  navigation: {
    hasNextPreviewImage: navigation.hasNextPreviewImage,
    hasPrevPreviewImage: navigation.hasPrevPreviewImage,
    isQuickPreviewInfoOpen: navigation.isQuickPreviewInfoOpen,
    onMoveSelection: navigation.moveQuickPreviewSelection,
    onToggleInfoOpen: navigation.handleToggleQuickPreviewInfoOpen,
    previewMediaItemsCount: navigation.previewMediaItemsCount,
    selectedPreviewItemIndex: navigation.selectedPreviewItemIndex,
  },
  media: {
    assetPreview: media.assetPreview,
    assetPreviewError: media.assetPreviewError,
    isPreviewBusy: media.isPreviewBusy,
    onImageDecodeError: media.handleImageDecodeError,
    onPdfNextPage: media.handlePdfNextPage,
    onPdfPrevPage: media.handlePdfPrevPage,
    onRetryPreview: media.handleRetrySelectedAssetPreview,
    onVideoDecodeError: media.handleVideoDecodeError,
    pdfPreviewPage: media.pdfPreviewPage,
    previewDataUrl: media.previewDataUrl,
  },
  sharing,
  sharingCommands,
  assetManagement,
  assetManagementCommands,
  metadata,
  metadataCommands,
  formatters,
});
