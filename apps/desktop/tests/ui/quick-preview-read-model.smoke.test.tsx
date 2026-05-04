import { describe, expect, it } from 'vitest';
import { buildQuickPreviewReadModel } from '../../src/features/preview/quick-preview-read-model';
import type {
  AssetItem,
  AssetMetadata,
} from '../../src/shared/ipc';

const selectedAsset: AssetItem = {
  key: 'raw files/東京/image 1.png',
  contentType: 'image/png',
  etag: 'etag',
  lastModified: '2026-05-03T12:00:00.000Z',
  size: 2048,
};

describe('quick preview read model', () => {
  it('combines public URL and metadata labels for the selected asset', () => {
    const metadata: AssetMetadata = {
      ...selectedAsset,
      metadata: {
        'EXIF:DateTimeOriginal': '2026:05:03 11:59:00',
        'Exif:Model': 'X100V',
        'EXIF:ISO': '400',
      },
    };

    expect(
      buildQuickPreviewReadModel({
        formatDate: (value) => `formatted:${value}`,
        selectedAsset,
        selectedAssetMetadata: metadata,
        selectedPublicBaseUrl: 'https://cdn.example.com/',
      }),
    ).toEqual({
      capturedAtLabel: '2026:05:03 11:59:00',
      cameraLabel: 'X100V',
      lensLabel: '-',
      publicUrlForSelectedAsset:
        'https://cdn.example.com/raw%20files/%E6%9D%B1%E4%BA%AC/image%201.png',
      shootSettingsLabel: 'ISO 400',
    });
  });

  it('keeps public URL empty until both asset and base URL are available', () => {
    expect(
      buildQuickPreviewReadModel({
        formatDate: (value) => `formatted:${value}`,
        selectedAsset,
        selectedAssetMetadata: null,
        selectedPublicBaseUrl: '',
      }).publicUrlForSelectedAsset,
    ).toBe('');

    expect(
      buildQuickPreviewReadModel({
        formatDate: (value) => `formatted:${value}`,
        selectedAsset: null,
        selectedAssetMetadata: null,
        selectedPublicBaseUrl: 'https://cdn.example.com',
      }).publicUrlForSelectedAsset,
    ).toBe('');
  });
});
