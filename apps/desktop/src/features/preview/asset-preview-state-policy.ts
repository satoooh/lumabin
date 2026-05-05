import type { AssetPreview } from '../../shared/ipc';

export type PdfPreviewPageDirection = 'next' | 'previous';

export const resolveAssetPreviewDataUrl = (
  assetPreview: AssetPreview | null,
): string => {
  if (!assetPreview?.dataBase64) {
    return '';
  }
  return `data:${assetPreview.contentType};base64,${assetPreview.dataBase64}`;
};

export const resolvePdfPreviewPage = (
  currentPage: number,
  direction: PdfPreviewPageDirection,
): number => {
  const safeCurrentPage = Math.max(1, currentPage);
  if (direction === 'next') {
    return safeCurrentPage + 1;
  }
  return Math.max(1, safeCurrentPage - 1);
};
