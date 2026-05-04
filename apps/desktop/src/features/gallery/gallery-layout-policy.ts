export const GALLERY_TILE_MIN_WIDTH_MIN = 132;
export const GALLERY_TILE_MIN_WIDTH_MAX = 280;
export const GALLERY_TILE_MIN_WIDTH_SLIDER_STEP = 0.1;
export const GALLERY_TILE_MIN_WIDTH_KEYBOARD_STEP = 2;
export const GALLERY_TILE_MIN_WIDTH_DEFAULT = 176;
export const GALLERY_TILE_MIN_WIDTH_COMMIT_DEBOUNCE_MS = 90;
export const GALLERY_SCROLL_IDLE_MS = 140;
export const SCROLL_TOP_UPDATE_EPSILON_PX = 1.2;

export const clampGalleryTileMinWidth = (value: number): number =>
  Math.max(
    GALLERY_TILE_MIN_WIDTH_MIN,
    Math.min(GALLERY_TILE_MIN_WIDTH_MAX, value),
  );

export const normalizeGalleryTileMinWidth = (value: number): number =>
  Math.round(clampGalleryTileMinWidth(value) * 10) / 10;
