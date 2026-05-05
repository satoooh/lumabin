import { describe, expect, it, vi } from 'vitest';
import { loadGalleryThumbnailDataUrl } from '../../src/features/gallery/gallery-thumbnail-loader';
import type { AssetItem, AssetPreview } from '../../src/shared/ipc';

const asset = (key: string, contentType: string): AssetItem => ({
  contentType,
  etag: `etag-${key}`,
  key,
  lastModified: '2026-05-05T00:00:00.000Z',
  size: 100,
});

const preview = (
  overrides: Partial<AssetPreview> & Pick<AssetPreview, 'kind' | 'contentType'>,
): AssetPreview => ({
  byteLength: 12,
  contentType: overrides.contentType,
  key: 'photos/a.png',
  kind: overrides.kind,
  truncated: false,
  ...overrides,
});

describe('gallery thumbnail loader', () => {
  it('loads and decodes image previews as data URLs', async () => {
    const previewAsset = vi.fn().mockResolvedValue(
      preview({
        contentType: 'image/png',
        dataBase64: 'aW1hZ2U=',
        kind: 'image',
      }),
    );
    const decodeImageDataUrl = vi.fn().mockResolvedValue(undefined);

    await expect(
      loadGalleryThumbnailDataUrl({
        assetPreviewApi: { previewAsset },
        attempts: 1,
        dependencies: { decodeImageDataUrl },
        inferAssetKind: () => 'image',
        item: asset('photos/a.png', 'image/png'),
        profileId: 'profile-1',
      }),
    ).resolves.toBe('data:image/png;base64,aW1hZ2U=');

    expect(previewAsset).toHaveBeenCalledWith({
      profileId: 'profile-1',
      key: 'photos/a.png',
      etag: 'etag-photos/a.png',
      maxBytes: 4 * 1024 * 1024,
    });
    expect(decodeImageDataUrl).toHaveBeenCalledWith('data:image/png;base64,aW1hZ2U=');
  });

  it('extracts a still frame for video previews', async () => {
    const previewAsset = vi.fn().mockResolvedValue(
      preview({
        contentType: 'video/mp4',
        dataBase64: 'dmlkZW8=',
        kind: 'video',
      }),
    );
    const extractVideoFrame = vi.fn().mockResolvedValue('data:image/jpeg;base64,frame');

    await expect(
      loadGalleryThumbnailDataUrl({
        assetPreviewApi: { previewAsset },
        attempts: 0,
        dependencies: { extractVideoFrame },
        inferAssetKind: () => 'video',
        item: asset('clips/a.mp4', 'video/mp4'),
        profileId: 'profile-1',
      }),
    ).resolves.toBe('data:image/jpeg;base64,frame');

    expect(previewAsset).toHaveBeenCalledWith({
      profileId: 'profile-1',
      key: 'clips/a.mp4',
      etag: 'etag-clips/a.mp4',
      maxBytes: 8 * 1024 * 1024,
    });
    expect(extractVideoFrame).toHaveBeenCalledWith('data:video/mp4;base64,dmlkZW8=', {
      seekSeconds: 0.1,
      timeoutMs: 4_500,
    });
  });

  it('skips non-thumbnail asset kinds without preview I/O', async () => {
    const previewAsset = vi.fn();

    await expect(
      loadGalleryThumbnailDataUrl({
        assetPreviewApi: { previewAsset },
        attempts: 0,
        inferAssetKind: () => 'pdf',
        item: asset('docs/a.pdf', 'application/pdf'),
        profileId: 'profile-1',
      }),
    ).resolves.toBeNull();

    expect(previewAsset).not.toHaveBeenCalled();
  });
});
