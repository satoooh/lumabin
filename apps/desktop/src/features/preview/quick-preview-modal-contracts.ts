import type { AssetItem, AssetMetadata, AssetPreview } from '../../shared/ipc';

export interface QuickPreviewModalProps {
  isOpen: boolean;
  selectedAsset: AssetItem | null;
  animation: QuickPreviewModalAnimation;
  assetManagement: QuickPreviewModalAssetManagement;
  assetManagementCommands: QuickPreviewModalAssetManagementCommands;
  formatters: QuickPreviewModalFormatters;
  media: QuickPreviewModalMedia;
  metadata: QuickPreviewModalMetadata;
  metadataCommands: QuickPreviewModalMetadataCommands;
  navigation: QuickPreviewModalNavigation;
  sharing: QuickPreviewModalSharing;
  sharingCommands: QuickPreviewModalSharingCommands;
}

export interface QuickPreviewModalAnimation {
  previewOrigin: { x: number; y: number } | null;
  previewSourceRect: { x: number; y: number; width: number; height: number } | null;
  resolveCloseTargetRect: () => { x: number; y: number; width: number; height: number } | null;
  onClose: () => void;
}

export interface QuickPreviewModalNavigation {
  selectedPreviewItemIndex: number;
  previewMediaItemsCount: number;
  hasPrevPreviewImage: boolean;
  hasNextPreviewImage: boolean;
  isQuickPreviewInfoOpen: boolean;
  onToggleInfoOpen: () => void;
  onMoveSelection: (direction: -1 | 1) => void;
}

export interface QuickPreviewModalMedia {
  assetPreviewError: string;
  assetPreview: AssetPreview | null;
  previewDataUrl: string;
  isPreviewBusy: boolean;
  onImageDecodeError: () => void;
  onVideoDecodeError: () => void;
  onRetryPreview: () => void;
  pdfPreviewPage: number;
  onPdfPrevPage: () => void;
  onPdfNextPage: () => void;
}

export interface QuickPreviewModalSharing {
  isSharingBusy: boolean;
  selectedProfileId: string;
  isShareUrlCopied: boolean;
  publicUrlForSelectedAsset: string;
  isPublicUrlCopied: boolean;
  presignedGetUrl: string;
  isPresignedGetCopied: boolean;
  presignedPutUrl: string;
  isPresignedPutCopied: boolean;
}

export interface QuickPreviewModalSharingCommands {
  onCopyPresignedGetUrl: () => void;
  onCopyPresignedPutUrl: () => void;
  onCopyPublicUrl: () => void;
  onCreatePresignedPut: () => void;
  onDownloadSelectedAsset: () => void;
  onShareSelectedAsset: () => void;
}

export interface QuickPreviewModalAssetManagement {
  isAssetActionBusy: boolean;
}

export interface QuickPreviewModalAssetManagementCommands {
  onOpenAssetRename: () => void;
  onOpenAssetMove: () => void;
  onOpenAssetDelete: () => void;
}

export interface QuickPreviewModalMetadata {
  capturedAtLabel: string;
  cameraLabel: string;
  lensLabel: string;
  shootSettingsLabel: string;
  isAssetKeyCopied: boolean;
  isHeadBusy: boolean;
  selectedAssetMetadataError: string;
  selectedAssetMetadata: AssetMetadata | null;
}

export interface QuickPreviewModalMetadataCommands {
  onCopyAssetKey: () => void;
  onRetryMetadata: () => void;
}

export interface QuickPreviewModalFormatters {
  basenameFromKey: (key: string) => string;
  formatDate: (value: string) => string;
  formatBytes: (value: number) => string;
}
