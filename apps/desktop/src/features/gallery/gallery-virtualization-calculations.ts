import type { AssetItem } from '../../shared/ipc';
import {
  GALLERY_CARD_ASPECT_RATIO,
  GALLERY_DAY_GROUP_GAP_PX,
  GALLERY_DAY_HEADER_HEIGHT_PX,
  GALLERY_GRID_GAP_PX,
  GALLERY_VIRTUAL_OVERSCAN_PX,
  LIST_ROW_HEIGHT_PX,
  VIRTUAL_OVERSCAN_ROWS,
  type GalleryDaySection,
  type GalleryVirtualRange,
  type GalleryVirtualSection,
} from './gallery-view-model-calculations';

export const calculateListVirtualRange = (
  listScrollTop: number,
  listViewportHeight: number,
  itemCount: number,
): GalleryVirtualRange => {
  const startIndex = Math.max(
    0,
    Math.floor(listScrollTop / LIST_ROW_HEIGHT_PX) - VIRTUAL_OVERSCAN_ROWS,
  );
  const visibleCount = Math.ceil(listViewportHeight / LIST_ROW_HEIGHT_PX);
  const endIndex = Math.min(
    itemCount,
    startIndex + visibleCount + VIRTUAL_OVERSCAN_ROWS * 2,
  );

  return {
    startIndex,
    endIndex,
    topSpacerHeight: startIndex * LIST_ROW_HEIGHT_PX,
    bottomSpacerHeight: Math.max(0, (itemCount - endIndex) * LIST_ROW_HEIGHT_PX),
  };
};

export const calculateGalleryColumnCount = (
  galleryViewportWidth: number,
  galleryTileMinWidth: number,
): number => {
  const effectiveWidth = Math.max(galleryViewportWidth, galleryTileMinWidth);
  const cardMinWidthWithGap = galleryTileMinWidth + GALLERY_GRID_GAP_PX;
  return Math.max(
    1,
    Math.floor((effectiveWidth + GALLERY_GRID_GAP_PX) / cardMinWidthWithGap),
  );
};

export const calculateGalleryTileWidth = (
  galleryViewportWidth: number,
  galleryTileMinWidth: number,
  galleryColumnCount: number,
): number => {
  const effectiveWidth = Math.max(galleryViewportWidth, galleryTileMinWidth);
  if (galleryColumnCount <= 1) {
    return effectiveWidth;
  }
  const totalGap = Math.max(0, galleryColumnCount - 1) * GALLERY_GRID_GAP_PX;
  return Math.max(
    galleryTileMinWidth,
    (effectiveWidth - totalGap) / galleryColumnCount,
  );
};

export const calculateGalleryTileHeight = (galleryTileWidth: number): number =>
  Math.max(72, Math.round(galleryTileWidth * GALLERY_CARD_ASPECT_RATIO));

export const buildGalleryDaySections = (
  visibleItems: AssetItem[],
  getDayKey: (isoDate: string) => string,
  formatDayLabel: (dayKey: string) => string,
): GalleryDaySection[] => {
  const sections: GalleryDaySection[] = [];

  for (const [index, item] of visibleItems.entries()) {
    const dayKey = getDayKey(item.lastModified);
    const lastSection = sections[sections.length - 1];
    if (!lastSection || lastSection.key !== dayKey) {
      sections.push({
        key: dayKey,
        label: formatDayLabel(dayKey),
        items: [item],
        startIndex: index,
      });
      continue;
    }
    lastSection.items.push(item);
  }

  return sections;
};

export const buildGalleryVirtualSections = (
  galleryDaySections: GalleryDaySection[],
  galleryColumnCount: number,
  galleryTileHeight: number,
): GalleryVirtualSection[] => {
  let offset = 0;

  return galleryDaySections.map((section) => {
    const rowCount = Math.max(1, Math.ceil(section.items.length / galleryColumnCount));
    const gridHeight =
      rowCount * galleryTileHeight + Math.max(0, rowCount - 1) * GALLERY_GRID_GAP_PX;
    const estimatedHeight =
      GALLERY_DAY_HEADER_HEIGHT_PX + gridHeight + GALLERY_DAY_GROUP_GAP_PX;

    const nextSection: GalleryVirtualSection = {
      ...section,
      estimatedHeight,
      topOffset: offset,
      bottomOffset: offset + estimatedHeight,
    };
    offset += estimatedHeight;
    return nextSection;
  });
};

export const calculateGalleryVirtualRange = (
  galleryVirtualSections: GalleryVirtualSection[],
  galleryScrollTop: number,
  galleryViewportHeight: number,
): GalleryVirtualRange => {
  if (galleryVirtualSections.length === 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      topSpacerHeight: 0,
      bottomSpacerHeight: 0,
    };
  }

  const viewportTop = Math.max(0, galleryScrollTop - GALLERY_VIRTUAL_OVERSCAN_PX);
  const viewportBottom =
    galleryScrollTop + galleryViewportHeight + GALLERY_VIRTUAL_OVERSCAN_PX;

  let startIndex = galleryVirtualSections.findIndex(
    (section) => section.bottomOffset >= viewportTop,
  );
  if (startIndex < 0) {
    startIndex = 0;
  }

  let endIndex = startIndex;
  while (
    endIndex < galleryVirtualSections.length &&
    galleryVirtualSections[endIndex].topOffset <= viewportBottom
  ) {
    endIndex += 1;
  }
  endIndex = Math.max(startIndex + 1, Math.min(galleryVirtualSections.length, endIndex));

  const topSpacerHeight = galleryVirtualSections[startIndex]?.topOffset ?? 0;
  const bottomSpacerHeight =
    (galleryVirtualSections.at(-1)?.bottomOffset ?? 0) -
    (galleryVirtualSections[endIndex - 1]?.bottomOffset ?? 0);

  return {
    startIndex,
    endIndex,
    topSpacerHeight,
    bottomSpacerHeight: Math.max(0, bottomSpacerHeight),
  };
};

export const buildGalleryGridLocationByKey = (
  galleryDaySections: GalleryDaySection[],
): Map<string, { sectionIndex: number; localIndex: number; sectionStartIndex: number }> => {
  const next = new Map<
    string,
    { sectionIndex: number; localIndex: number; sectionStartIndex: number }
  >();

  galleryDaySections.forEach((section, sectionIndex) => {
    section.items.forEach((item, localIndex) => {
      next.set(item.key, {
        sectionIndex,
        localIndex,
        sectionStartIndex: section.startIndex,
      });
    });
  });

  return next;
};
