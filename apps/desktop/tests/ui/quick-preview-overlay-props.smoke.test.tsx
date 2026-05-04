import { describe, expect, it, vi } from 'vitest';
import { createQuickPreviewOverlayProps } from '../../src/features/preview/quick-preview-overlay-props';
import type { AssetItem } from '../../src/shared/ipc';

const selectedAsset: AssetItem = {
  contentType: 'image/png',
  etag: 'etag-1',
  key: 'photos/sample.png',
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 1024,
};

describe('quick preview overlay props', () => {
  it('maps preview-owned state into the modal contract without leaking JSX wiring', () => {
    const closeQuickPreview = vi.fn();
    const moveQuickPreviewSelection = vi.fn();
    const handleToggleQuickPreviewInfoOpen = vi.fn();
    const handleRetrySelectedAssetPreview = vi.fn();
    const resolveQuickPreviewCloseTargetRect = vi.fn(() => null);
    const sharingCommands = {
      onCopyPresignedGetUrl: vi.fn(),
      onCopyPresignedPutUrl: vi.fn(),
      onCopyPublicUrl: vi.fn(),
      onCreatePresignedPut: vi.fn(),
      onDownloadSelectedAsset: vi.fn(),
      onShareSelectedAsset: vi.fn(),
    };
    const assetManagementCommands = {
      onOpenAssetDelete: vi.fn(),
      onOpenAssetMove: vi.fn(),
      onOpenAssetRename: vi.fn(),
    };
    const metadataCommands = {
      onCopyAssetKey: vi.fn(),
      onRetryMetadata: vi.fn(),
    };

    const props = createQuickPreviewOverlayProps({
      state: {
        isQuickPreviewOpen: true,
      },
      selectedAsset,
      animation: {
        closeQuickPreview,
        quickPreviewOrigin: { x: 25, y: 75 },
        quickPreviewSourceRect: {
          x: 10,
          y: 20,
          width: 120,
          height: 80,
        },
        resolveQuickPreviewCloseTargetRect,
      },
      navigation: {
        hasNextPreviewImage: true,
        hasPrevPreviewImage: false,
        isQuickPreviewInfoOpen: true,
        moveQuickPreviewSelection,
        handleToggleQuickPreviewInfoOpen,
        previewMediaItemsCount: 4,
        selectedPreviewItemIndex: 2,
      },
      media: {
        assetPreview: null,
        assetPreviewError: '',
        handleImageDecodeError: vi.fn(),
        handlePdfNextPage: vi.fn(),
        handlePdfPrevPage: vi.fn(),
        handleRetrySelectedAssetPreview,
        handleVideoDecodeError: vi.fn(),
        isPreviewBusy: false,
        pdfPreviewPage: 1,
        previewDataUrl: 'data:image/png;base64,aaa',
      },
      sharing: {
        isPresignedGetCopied: false,
        isPresignedPutCopied: false,
        isPublicUrlCopied: true,
        isShareUrlCopied: false,
        isSharingBusy: false,
        presignedGetUrl: 'https://example.com/get',
        presignedPutUrl: '',
        publicUrlForSelectedAsset: 'https://cdn.example.com/photos/sample.png',
        selectedProfileId: 'profile-1',
      },
      sharingCommands,
      assetManagement: {
        isAssetActionBusy: false,
      },
      assetManagementCommands,
      metadata: {
        cameraLabel: 'X100',
        capturedAtLabel: 'May 3, 2026',
        isAssetKeyCopied: false,
        isHeadBusy: false,
        lensLabel: '-',
        selectedAssetMetadata: null,
        selectedAssetMetadataError: '',
        shootSettingsLabel: 'f/2.8',
      },
      metadataCommands,
      formatters: {
        basenameFromKey: (key) => key,
        formatBytes: (value) => `${value} B`,
        formatDate: (value) => value,
      },
    });

    expect(props.isOpen).toBe(true);
    expect(props.selectedAsset).toBe(selectedAsset);
    expect(props.animation).toMatchObject({
      onClose: closeQuickPreview,
      previewOrigin: { x: 25, y: 75 },
      resolveCloseTargetRect: resolveQuickPreviewCloseTargetRect,
    });
    expect(props.navigation).toMatchObject({
      hasNextPreviewImage: true,
      hasPrevPreviewImage: false,
      onMoveSelection: moveQuickPreviewSelection,
      onToggleInfoOpen: handleToggleQuickPreviewInfoOpen,
      previewMediaItemsCount: 4,
      selectedPreviewItemIndex: 2,
    });
    expect(props.media.onRetryPreview).toBe(handleRetrySelectedAssetPreview);
    expect(props.sharingCommands).toBe(sharingCommands);
    expect(props.assetManagementCommands).toBe(assetManagementCommands);
    expect(props.metadataCommands).toBe(metadataCommands);
  });
});
