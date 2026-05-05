import { describe, expect, it, vi } from 'vitest';
import { createDesktopWorkbenchPreviewCoordinationInput } from '../../src/features/workbench/desktop-workbench-preview-coordination';
import type { AssetItem } from '../../src/shared/ipc';

const asset: AssetItem = {
  key: 'photos/sunrise.jpg',
  size: 1024,
  contentType: 'image/jpeg',
  lastModified: '2026-05-04T00:00:00.000Z',
  etag: 'etag-1',
};

describe('desktop workbench preview coordination', () => {
  it('maps grouped preview handoff state into the preview workbench contract', () => {
    const assetPreviewApi = {
      headAsset: vi.fn(),
      previewAsset: vi.fn(),
    };
    const sharingApi = {
      createPresignedGet: vi.fn(),
      createPresignedPut: vi.fn(),
    };
    const focusAssetItemByKey = vi.fn();
    const setSelectedAssetKey = vi.fn();
    const setStatusLine = vi.fn();

    const input = createDesktopWorkbenchPreviewCoordinationInput({
      api: {
        assetPreviewApi,
        sharingApi,
      },
      feedback: {
        copiedLabel: 'Public URL',
        markCopied: vi.fn(),
        pushInlineFeedback: vi.fn(),
        setStatusLine,
      },
      gallery: {
        assetItemRefs: { current: new Map() },
        focusAssetItemByKey,
        isPreviewableKind: (kind) => kind !== 'other',
        markAssetAsRecentlyViewed: vi.fn(),
        previewMediaItems: [asset],
        scrollToAssetInCurrentView: vi.fn(),
        selectedPreviewItemIndex: 0,
        setSelectedAssetKey,
      },
      previewState: {
        isConnectionSetupOpen: false,
        isSelectionMode: false,
        selectedAsset: asset,
        selectedAssetKey: asset.key,
      },
      profile: {
        presignedUrlTTLSeconds: 900,
        selectedAssetMetadataPublicBaseUrl: 'https://cdn.example.com',
        selectedProfileId: 'profile-1',
      },
    });

    expect(input.assetPreviewApi).toBe(assetPreviewApi);
    expect(input.sharingApi).toBe(sharingApi);
    expect(input.copiedLabel).toBe('Public URL');
    expect(input.focusAssetItemByKey).toBe(focusAssetItemByKey);
    expect(input.presignedUrlTTLSeconds).toBe(900);
    expect(input.previewMediaItems).toEqual([asset]);
    expect(input.selectedAsset).toBe(asset);
    expect(input.selectedAssetKey).toBe(asset.key);
    expect(input.selectedAssetMetadataPublicBaseUrl).toBe(
      'https://cdn.example.com',
    );
    expect(input.selectedProfileId).toBe('profile-1');
    expect(input.setSelectedAssetKey).toBe(setSelectedAssetKey);
    expect(input.setStatusLine).toBe(setStatusLine);
  });
});
