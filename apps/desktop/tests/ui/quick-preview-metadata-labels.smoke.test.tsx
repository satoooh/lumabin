import { describe, expect, it } from 'vitest';
import { buildQuickPreviewMetadataLabels } from '../../src/features/preview/quick-preview-metadata-labels';
import type {
  AssetItem,
  AssetMetadata,
} from '../../src/shared/ipc';

const selectedAsset: AssetItem = {
  key: 'photos/sample.jpg',
  contentType: 'image/jpeg',
  etag: 'etag',
  lastModified: '2026-05-03T12:00:00.000Z',
  size: 1024,
};

describe('buildQuickPreviewMetadataLabels', () => {
  it('prefers metadata values and normalizes exposure labels', () => {
    const metadata: AssetMetadata = {
      ...selectedAsset,
      metadata: {
        'EXIF:DateTimeOriginal': '2026:05:03 11:59:00',
        'Exif:Model': 'X100V',
        'exif:lensmodel': '23mm',
        'EXIF:ISO': '400',
        'exif:fnumber': '2.8',
        'exif:exposuretime': '1/250',
      },
    };

    expect(
      buildQuickPreviewMetadataLabels({
        formatDate: (value) => `formatted:${value}`,
        selectedAsset,
        selectedAssetMetadata: metadata,
      }),
    ).toEqual({
      capturedAtLabel: '2026:05:03 11:59:00',
      cameraLabel: 'X100V',
      lensLabel: '23mm',
      shootSettingsLabel: 'ISO 400 • f/2.8 • 1/250',
    });
  });

  it('falls back to asset modified date and placeholder labels', () => {
    expect(
      buildQuickPreviewMetadataLabels({
        formatDate: (value) => `formatted:${value}`,
        selectedAsset,
        selectedAssetMetadata: null,
      }),
    ).toEqual({
      capturedAtLabel: 'formatted:2026-05-03T12:00:00.000Z',
      cameraLabel: '-',
      lensLabel: '-',
      shootSettingsLabel: '-',
    });
  });
});
