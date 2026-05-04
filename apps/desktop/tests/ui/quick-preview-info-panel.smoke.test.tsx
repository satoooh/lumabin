import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuickPreviewInfoPanel } from '../../src/features/preview/quick-preview-info-panel';
import type { AssetItem, AssetMetadata } from '../../src/shared/ipc';

const selectedAsset: AssetItem = {
  key: 'photos/sample.png',
  contentType: 'image/png',
  etag: 'etag',
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 1024,
};

const selectedAssetMetadata: AssetMetadata = {
  key: selectedAsset.key,
  etag: 'etag',
  lastModified: selectedAsset.lastModified,
  size: 1024,
  contentType: 'image/png',
  metadata: {
    camera: 'X100',
  },
};

const defaultProps = {
  overview: {
    selectedAsset,
    assetName: 'sample.png',
    selectedProfileId: 'profile-1',
    capturedAtLabel: '2026-05-03',
    cameraLabel: 'X100',
    lensLabel: '-',
    shootSettingsLabel: 'f/2.8',
  },
  formatters: {
    formatDate: (value: string) => value,
    formatBytes: (value: number) => `${value} B`,
  },
  sharing: {
    isBusy: false,
    isShareUrlCopied: false,
    publicUrlForSelectedAsset: 'https://cdn.example.com/photos/sample.png',
    isPublicUrlCopied: false,
    presignedGetUrl: 'https://example.com/get',
    isPresignedGetCopied: false,
    presignedPutUrl: '',
    isPresignedPutCopied: false,
  },
  sharingCommands: {
    onShareSelectedAsset: vi.fn(),
    onDownloadSelectedAsset: vi.fn(),
    onCopyPublicUrl: vi.fn(),
    onCreatePresignedPut: vi.fn(),
    onCopyPresignedGetUrl: vi.fn(),
    onCopyPresignedPutUrl: vi.fn(),
  },
  assetManagement: {
    isBusy: false,
  },
  assetManagementCommands: {
    onOpenAssetRename: vi.fn(),
    onOpenAssetMove: vi.fn(),
    onOpenAssetDelete: vi.fn(),
  },
  metadata: {
    isAssetKeyCopied: false,
    isHeadBusy: false,
    selectedAssetMetadataError: '',
    selectedAssetMetadata,
  },
  metadataCommands: {
    onCopyAssetKey: vi.fn(),
    onRetryMetadata: vi.fn(),
  },
};

describe('quick preview info panel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('prioritizes share actions and keeps generated URLs discoverable', () => {
    render(<QuickPreviewInfoPanel {...defaultProps} />);

    screen.getByRole('button', { name: 'Share' }).click();
    screen.getByRole('button', { name: 'Download original' }).click();
    screen.getByRole('button', { name: 'Copy public URL' }).click();
    expect(defaultProps.sharingCommands.onShareSelectedAsset).toHaveBeenCalledTimes(1);
    expect(defaultProps.sharingCommands.onDownloadSelectedAsset).toHaveBeenCalledTimes(1);
    expect(defaultProps.sharingCommands.onCopyPublicUrl).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Temporary access')).toBeTruthy();
    expect(screen.getByText('Generated URLs')).toBeTruthy();
    expect(screen.getByDisplayValue('https://example.com/get')).toBeTruthy();
  });

  it('keeps asset management and technical copy actions accessible', () => {
    render(<QuickPreviewInfoPanel {...defaultProps} />);

    screen.getByRole('button', { name: 'Rename asset' }).click();
    screen.getByRole('button', { name: 'Move asset' }).click();
    screen.getByRole('button', { name: 'Delete asset' }).click();
    screen.getByRole('button', { name: 'Copy key' }).click();
    expect(defaultProps.assetManagementCommands.onOpenAssetRename).toHaveBeenCalledTimes(1);
    expect(defaultProps.assetManagementCommands.onOpenAssetMove).toHaveBeenCalledTimes(1);
    expect(defaultProps.assetManagementCommands.onOpenAssetDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.metadataCommands.onCopyAssetKey).toHaveBeenCalledTimes(1);
  });
});
