import { describe, expect, it } from 'vitest';
import {
  resolveAssetPreviewDataUrl,
  resolvePdfPreviewPage,
} from '../../src/features/preview/asset-preview-state-policy';
import type { AssetPreview } from '../../src/shared/ipc';

const preview = (overrides: Partial<AssetPreview> = {}): AssetPreview => ({
  byteLength: 12,
  contentType: 'image/png',
  dataBase64: 'aW1hZ2U=',
  key: 'photos/a.png',
  kind: 'image',
  truncated: false,
  ...overrides,
});

describe('asset preview state policy', () => {
  it('resolves preview data URL only when base64 payload is available', () => {
    expect(resolveAssetPreviewDataUrl(preview())).toBe('data:image/png;base64,aW1hZ2U=');
    expect(resolveAssetPreviewDataUrl(preview({ dataBase64: undefined }))).toBe('');
    expect(resolveAssetPreviewDataUrl(null)).toBe('');
  });

  it('keeps PDF page navigation bounded at page one', () => {
    expect(resolvePdfPreviewPage(1, 'next')).toBe(2);
    expect(resolvePdfPreviewPage(2, 'previous')).toBe(1);
    expect(resolvePdfPreviewPage(1, 'previous')).toBe(1);
    expect(resolvePdfPreviewPage(-4, 'next')).toBe(2);
  });
});
