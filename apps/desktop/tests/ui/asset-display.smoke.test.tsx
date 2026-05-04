import { describe, expect, it } from 'vitest';
import {
  dayKeyFromIso,
  formatBytes,
  formatDate,
  formatGalleryDayLabel,
  iconForKind,
  inferAssetKind,
  thumbnailCacheKey,
} from '../../src/features/shared/asset-display';
import type { AssetItem } from '../../src/shared/ipc';

const createAsset = (overrides: Partial<AssetItem>): AssetItem => ({
  contentType: 'application/octet-stream',
  etag: 'etag-1',
  key: 'object.bin',
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 1,
  ...overrides,
});

describe('asset display policies', () => {
  it('classifies assets from content type and key fallbacks', () => {
    expect(inferAssetKind(createAsset({ contentType: 'image/png', key: 'photo.bin' }))).toBe(
      'image',
    );
    expect(
      inferAssetKind(createAsset({ contentType: 'application/octet-stream', key: 'photo.JPEG' })),
    ).toBe('image');
    expect(inferAssetKind(createAsset({ contentType: 'video/quicktime', key: 'clip.bin' }))).toBe(
      'video',
    );
    expect(
      inferAssetKind(createAsset({ contentType: 'application/octet-stream', key: 'clip.MOV' })),
    ).toBe('video');
    expect(inferAssetKind(createAsset({ contentType: 'application/pdf', key: 'doc.bin' }))).toBe(
      'pdf',
    );
    expect(inferAssetKind(createAsset({ contentType: 'text/plain', key: 'table.csv' }))).toBe(
      'csv',
    );
    expect(inferAssetKind(createAsset({ contentType: 'application/zip', key: 'archive.zip' }))).toBe(
      'other',
    );
  });

  it('formats byte sizes with stable display units', () => {
    expect(formatBytes(512)).toBe('512\u00A0B');
    expect(formatBytes(1024)).toBe('1.0\u00A0KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0\u00A0MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0\u00A0GB');
  });

  it('keeps invalid date labels visible and derives stable gallery day keys', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
    expect(dayKeyFromIso('not-a-date')).toBe('unknown');
    expect(dayKeyFromIso('2026-05-03T09:10:11.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatGalleryDayLabel('unknown')).toBe('Unknown date');
    expect(formatGalleryDayLabel('invalid-day-key')).toBe('invalid-day-key');
  });

  it('maps asset kind icons and thumbnail cache keys', () => {
    expect(iconForKind('image')).toBe('IMG');
    expect(iconForKind('video')).toBe('VID');
    expect(iconForKind('pdf')).toBe('PDF');
    expect(iconForKind('csv')).toBe('CSV');
    expect(iconForKind('other')).toBe('FILE');
    expect(thumbnailCacheKey('profile-1', 'photos/a.png')).toBe('profile-1::photos/a.png');
  });
});
