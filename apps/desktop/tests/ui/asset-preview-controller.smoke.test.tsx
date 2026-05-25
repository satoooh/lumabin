import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAssetPreviewController } from '../../src/features/preview/use-asset-preview-controller';
import type { AssetItem } from '../../src/shared/ipc';

const videoAsset: AssetItem = {
  contentType: 'video/mp4',
  etag: 'etag-video',
  key: 'clips/東京 sample.mp4',
  lastModified: '2026-05-25T00:00:00.000Z',
  size: 320 * 1024 * 1024,
};

describe('asset preview controller', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('does not fetch partial object bytes for video previews', async () => {
    const previewAsset = vi.fn();
    const headAsset = vi.fn(async () => ({
      ...videoAsset,
      metadata: {},
    }));
    const assetPreviewApi = {
      headAsset,
      previewAsset,
    };
    const inferAssetKind = vi.fn(() => 'video' as const);
    const onStatusLine = vi.fn();

    const { result } = renderHook(() =>
      useAssetPreviewController({
        assetPreviewApi,
        inferAssetKind,
        onStatusLine,
        selectedAsset: videoAsset,
        selectedProfileId: 'profile-1',
      }),
    );

    await waitFor(() => {
      expect(result.current.assetPreview).toMatchObject({
        key: videoAsset.key,
        kind: 'video',
        totalBytes: videoAsset.size,
        truncated: false,
      });
    });
    expect(previewAsset).not.toHaveBeenCalled();
  });
});
