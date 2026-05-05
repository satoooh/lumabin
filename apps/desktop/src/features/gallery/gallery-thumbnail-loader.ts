import type { AssetItem } from '../../shared/ipc';
import type { AssetThumbnailApi } from '../shared/desktop-api-gateway';
import {
  ensureImageDataUrlDecodable,
  extractVideoFrameThumbnail,
  withTimeout,
} from '../shared/media-preview';
import {
  THUMBNAIL_PREVIEW_TIMEOUT_MS,
  VIDEO_THUMBNAIL_SEEK_SECONDS,
  VIDEO_THUMBNAIL_TIMEOUT_MS,
  thumbnailPreviewMaxBytesForAttempt,
  type ThumbnailAssetKind,
} from './gallery-thumbnail-policy';

type DecodeImageDataUrl = (sourceDataUrl: string) => Promise<void>;
type ExtractVideoFrame = (
  sourceDataUrl: string,
  options: {
    seekSeconds: number;
    timeoutMs: number;
  },
) => Promise<string>;

interface LoadGalleryThumbnailDataUrlDependencies {
  decodeImageDataUrl?: DecodeImageDataUrl;
  extractVideoFrame?: ExtractVideoFrame;
}

interface LoadGalleryThumbnailDataUrlOptions {
  assetPreviewApi: AssetThumbnailApi;
  attempts: number;
  dependencies?: LoadGalleryThumbnailDataUrlDependencies;
  inferAssetKind: (item: AssetItem) => ThumbnailAssetKind;
  item: AssetItem;
  profileId: string;
}

export const loadGalleryThumbnailDataUrl = async ({
  assetPreviewApi,
  attempts,
  dependencies,
  inferAssetKind,
  item,
  profileId,
}: LoadGalleryThumbnailDataUrlOptions): Promise<string | null> => {
  const itemKind = inferAssetKind(item);
  if (itemKind !== 'image' && itemKind !== 'video') {
    return null;
  }

  const maxBytes = thumbnailPreviewMaxBytesForAttempt(itemKind, attempts);
  const preview = await withTimeout(
    assetPreviewApi.previewAsset({
      profileId,
      key: item.key,
      etag: item.etag || undefined,
      maxBytes,
    }),
    THUMBNAIL_PREVIEW_TIMEOUT_MS,
    'Thumbnail preview timed out',
  );

  if (preview.kind === 'image' && preview.dataBase64) {
    const dataUrl = `data:${preview.contentType};base64,${preview.dataBase64}`;
    await withTimeout(
      (dependencies?.decodeImageDataUrl ?? ensureImageDataUrlDecodable)(dataUrl),
      2_600,
      'Image thumbnail decode timed out',
    );
    return dataUrl;
  }

  if (preview.kind === 'video' && preview.dataBase64) {
    const videoDataUrl = `data:${preview.contentType};base64,${preview.dataBase64}`;
    return withTimeout(
      (dependencies?.extractVideoFrame ?? extractVideoFrameThumbnail)(videoDataUrl, {
        seekSeconds: VIDEO_THUMBNAIL_SEEK_SECONDS,
        timeoutMs: VIDEO_THUMBNAIL_TIMEOUT_MS,
      }),
      VIDEO_THUMBNAIL_TIMEOUT_MS + 1_000,
      'Video thumbnail extraction timed out',
    );
  }

  return null;
};
