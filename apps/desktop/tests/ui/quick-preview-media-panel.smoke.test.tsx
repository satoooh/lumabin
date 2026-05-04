import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuickPreviewMediaPanel } from '../../src/features/preview/quick-preview-media-panel';
import type { AssetItem, AssetPreview } from '../../src/shared/ipc';

const selectedAsset: AssetItem = {
  key: 'photos/sample.png',
  contentType: 'image/png',
  etag: 'etag',
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 100,
};

const defaultProps = {
  assetPreview: null as AssetPreview | null,
  assetPreviewError: '',
  basenameFromKey: (key: string) => key.split('/').at(-1) ?? key,
  hasNextPreviewImage: true,
  hasPrevPreviewImage: true,
  isPreviewBusy: false,
  isSharingBusy: false,
  onDownloadSelectedAsset: vi.fn(),
  onImageDecodeError: vi.fn(),
  onMoveSelection: vi.fn(),
  onPdfNextPage: vi.fn(),
  onPdfPrevPage: vi.fn(),
  onRetryPreview: vi.fn(),
  onVideoDecodeError: vi.fn(),
  pdfPreviewPage: 1,
  previewDataUrl: '',
  selectedAsset,
  selectedProfileId: 'profile-1',
};

describe('quick preview media panel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows retry and download actions for preview errors', () => {
    render(
      <QuickPreviewMediaPanel
        {...defaultProps}
        assetPreviewError="Preview failed."
      />,
    );

    screen.getByRole('button', { name: 'Retry preview' }).click();
    screen.getByRole('button', { name: 'Download original' }).click();
    expect(defaultProps.onRetryPreview).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDownloadSelectedAsset).toHaveBeenCalledTimes(1);
  });

  it('renders image previews with navigation controls', () => {
    render(
      <QuickPreviewMediaPanel
        {...defaultProps}
        assetPreview={{
          key: selectedAsset.key,
          kind: 'image',
          contentType: 'image/png',
          byteLength: 100,
          truncated: false,
          dataBase64: 'base64',
        }}
        previewDataUrl="data:image/png;base64,base64"
      />,
    );

    expect(screen.getByRole('img', { name: selectedAsset.key })).toBeTruthy();
    screen.getByRole('button', { name: 'Previous photo' }).click();
    screen.getByRole('button', { name: 'Next photo' }).click();
    expect(defaultProps.onMoveSelection).toHaveBeenCalledWith(-1);
    expect(defaultProps.onMoveSelection).toHaveBeenCalledWith(1);
  });

  it('renders pdf controls and partial preview guidance', () => {
    const pdfAsset: AssetItem = {
      ...selectedAsset,
      key: 'docs/report.pdf',
      contentType: 'application/pdf',
    };

    render(
      <QuickPreviewMediaPanel
        {...defaultProps}
        assetPreview={{
          key: 'docs/report.pdf',
          kind: 'pdf',
          contentType: 'application/pdf',
          byteLength: 100,
          truncated: true,
          dataBase64: 'base64',
        }}
        previewDataUrl="data:application/pdf;base64,base64"
        selectedAsset={pdfAsset}
      />,
    );

    expect(screen.getByText('Page 1')).toBeTruthy();
    expect(screen.getByText(/Preview is partial/)).toBeTruthy();
    expect(screen.getByTitle('report.pdf')).toBeTruthy();
  });
});
