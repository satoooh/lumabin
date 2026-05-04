import { cleanup, render, screen } from '@testing-library/react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { ComponentProps } from 'react';
import { QuickPreviewModal } from '../../src/features/preview/quick-preview-modal';
import type { AssetItem, AssetMetadata } from '../../src/shared/ipc';

const selectedAsset: AssetItem = {
  contentType: 'image/png',
  etag: 'etag-1',
  key: 'photos/sample.png',
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 1024,
};

const selectedAssetMetadata: AssetMetadata = {
  contentType: selectedAsset.contentType,
  etag: selectedAsset.etag,
  key: selectedAsset.key,
  lastModified: selectedAsset.lastModified,
  metadata: {
    camera: 'X100',
  },
  size: selectedAsset.size,
};

const createProps = (): ComponentProps<typeof QuickPreviewModal> => ({
  isOpen: true,
  selectedAsset,
  animation: {
    onClose: vi.fn(),
    previewOrigin: null,
    previewSourceRect: null,
    resolveCloseTargetRect: vi.fn(() => null),
  },
  navigation: {
    hasNextPreviewImage: true,
    hasPrevPreviewImage: true,
    isQuickPreviewInfoOpen: true,
    onMoveSelection: vi.fn(),
    onToggleInfoOpen: vi.fn(),
    previewMediaItemsCount: 3,
    selectedPreviewItemIndex: 1,
  },
  media: {
    assetPreview: null,
    assetPreviewError: '',
    isPreviewBusy: false,
    onImageDecodeError: vi.fn(),
    onPdfNextPage: vi.fn(),
    onPdfPrevPage: vi.fn(),
    onRetryPreview: vi.fn(),
    onVideoDecodeError: vi.fn(),
    pdfPreviewPage: 1,
    previewDataUrl: '',
  },
  sharing: {
    isPresignedGetCopied: false,
    isPresignedPutCopied: false,
    isPublicUrlCopied: false,
    isShareUrlCopied: false,
    isSharingBusy: false,
    presignedGetUrl: 'https://example.com/get',
    presignedPutUrl: '',
    publicUrlForSelectedAsset: 'https://cdn.example.com/photos/sample.png',
    selectedProfileId: 'profile-1',
  },
  sharingCommands: {
    onCopyPresignedGetUrl: vi.fn(),
    onCopyPresignedPutUrl: vi.fn(),
    onCopyPublicUrl: vi.fn(),
    onCreatePresignedPut: vi.fn(),
    onDownloadSelectedAsset: vi.fn(),
    onShareSelectedAsset: vi.fn(),
  },
  assetManagement: {
    isAssetActionBusy: false,
  },
  assetManagementCommands: {
    onOpenAssetDelete: vi.fn(),
    onOpenAssetMove: vi.fn(),
    onOpenAssetRename: vi.fn(),
  },
  metadata: {
    cameraLabel: 'X100',
    capturedAtLabel: 'May 3, 2026',
    isAssetKeyCopied: false,
    isHeadBusy: false,
    lensLabel: '-',
    selectedAssetMetadata,
    selectedAssetMetadataError: '',
    shootSettingsLabel: 'f/2.8',
  },
  metadataCommands: {
    onCopyAssetKey: vi.fn(),
    onRetryMetadata: vi.fn(),
  },
  formatters: {
    basenameFromKey: (key: string) => key.split('/').at(-1) ?? key,
    formatBytes: (value: number) => `${value} B`,
    formatDate: (value: string) => value,
  },
});

describe('QuickPreviewModal', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('wires grouped navigation and close commands', () => {
    const props = createProps();

    render(<QuickPreviewModal {...props} />);

    expect(screen.getByText('2 / 3')).toBeTruthy();
    screen.getByRole('button', { name: 'Previous photo' }).click();
    screen.getByRole('button', { name: 'Next photo' }).click();
    screen.getByRole('button', { name: 'Hide photo details' }).click();
    screen.getByRole('button', { name: 'Close preview' }).click();

    expect(props.navigation.onMoveSelection).toHaveBeenCalledWith(-1);
    expect(props.navigation.onMoveSelection).toHaveBeenCalledWith(1);
    expect(props.navigation.onToggleInfoOpen).toHaveBeenCalledTimes(1);
    expect(props.animation.onClose).toHaveBeenCalledTimes(1);
  });

  it('passes grouped sharing, metadata, and asset management commands to the info panel', () => {
    const props = createProps();

    render(<QuickPreviewModal {...props} />);

    screen.getByRole('button', { name: 'Share' }).click();
    screen.getByRole('button', { name: 'Copy public URL' }).click();
    screen.getByRole('button', { name: 'Copy key' }).click();
    screen.getByRole('button', { name: 'Rename asset' }).click();

    expect(props.sharingCommands.onShareSelectedAsset).toHaveBeenCalledTimes(1);
    expect(props.sharingCommands.onCopyPublicUrl).toHaveBeenCalledTimes(1);
    expect(props.metadataCommands.onCopyAssetKey).toHaveBeenCalledTimes(1);
    expect(props.assetManagementCommands.onOpenAssetRename).toHaveBeenCalledTimes(1);
  });
});
