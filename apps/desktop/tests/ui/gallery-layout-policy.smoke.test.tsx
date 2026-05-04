import { describe, expect, it } from 'vitest';
import {
  GALLERY_TILE_MIN_WIDTH_DEFAULT,
  GALLERY_TILE_MIN_WIDTH_MAX,
  GALLERY_TILE_MIN_WIDTH_MIN,
  clampGalleryTileMinWidth,
  normalizeGalleryTileMinWidth,
} from '../../src/features/gallery/gallery-layout-policy';

describe('gallery layout policy', () => {
  it('clamps gallery tile width to the supported desktop range', () => {
    expect(clampGalleryTileMinWidth(GALLERY_TILE_MIN_WIDTH_MIN - 20)).toBe(
      GALLERY_TILE_MIN_WIDTH_MIN,
    );
    expect(clampGalleryTileMinWidth(GALLERY_TILE_MIN_WIDTH_MAX + 20)).toBe(
      GALLERY_TILE_MIN_WIDTH_MAX,
    );
    expect(clampGalleryTileMinWidth(GALLERY_TILE_MIN_WIDTH_DEFAULT)).toBe(
      GALLERY_TILE_MIN_WIDTH_DEFAULT,
    );
  });

  it('normalizes gallery tile width to one decimal place after clamping', () => {
    expect(normalizeGalleryTileMinWidth(176.04)).toBe(176);
    expect(normalizeGalleryTileMinWidth(176.05)).toBe(176.1);
    expect(normalizeGalleryTileMinWidth(GALLERY_TILE_MIN_WIDTH_MAX + 0.49)).toBe(
      GALLERY_TILE_MIN_WIDTH_MAX,
    );
  });
});
