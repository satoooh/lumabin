import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ensureImageDataUrlDecodable,
  withTimeout,
} from '../shared/media-preview';
import {
  buildPreviewMaxBytesSteps,
  toPreviewFailureMessage,
  type PreviewableKind,
} from './asset-preview-loading-policy';
import {
  resolveAssetPreviewDataUrl,
  resolvePdfPreviewPage,
} from './asset-preview-state-policy';
import type {
  AssetItem,
  AssetMetadata,
  AssetPreview,
} from '../../shared/ipc';
import type { AssetPreviewApi } from '../shared/desktop-api-gateway';

type AssetKind = PreviewableKind | 'other';

interface UseAssetPreviewControllerOptions {
  assetPreviewApi: AssetPreviewApi;
  inferAssetKind: (item: AssetItem) => AssetKind;
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  selectedAsset: AssetItem | null;
  selectedProfileId: string;
}

export const useAssetPreviewController = ({
  assetPreviewApi,
  inferAssetKind,
  onStatusLine,
  selectedAsset,
  selectedProfileId,
}: UseAssetPreviewControllerOptions) => {
  const metadataRequestIdRef = useRef<number>(0);
  const previewRequestIdRef = useRef<number>(0);
  const [pdfPreviewPage, setPdfPreviewPage] = useState<number>(1);
  const [selectedAssetMetadata, setSelectedAssetMetadata] = useState<AssetMetadata | null>(null);
  const [selectedAssetMetadataError, setSelectedAssetMetadataError] = useState<string>('');
  const [assetPreview, setAssetPreview] = useState<AssetPreview | null>(null);
  const [assetPreviewError, setAssetPreviewError] = useState<string>('');
  const [isHeadBusy, setIsHeadBusy] = useState<boolean>(false);
  const [isPreviewBusy, setIsPreviewBusy] = useState<boolean>(false);

  const previewDataUrl = useMemo(
    () => resolveAssetPreviewDataUrl(assetPreview),
    [assetPreview],
  );

  const loadSelectedAssetMetadata = useCallback(
    async (profileId: string, key: string) => {
      const requestId = metadataRequestIdRef.current + 1;
      metadataRequestIdRef.current = requestId;
      setIsHeadBusy(true);
      try {
        const metadata = await assetPreviewApi.headAsset({ profileId, key });
        if (requestId !== metadataRequestIdRef.current) {
          return;
        }
        setSelectedAssetMetadata(metadata);
        setSelectedAssetMetadataError('');
      } catch (error) {
        if (requestId !== metadataRequestIdRef.current) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        setSelectedAssetMetadata(null);
        setSelectedAssetMetadataError(message);
      } finally {
        if (requestId === metadataRequestIdRef.current) {
          setIsHeadBusy(false);
        }
      }
    },
    [assetPreviewApi],
  );

  const loadSelectedAssetPreview = useCallback(
    async (profileId: string, asset: AssetItem) => {
      const requestId = previewRequestIdRef.current + 1;
      previewRequestIdRef.current = requestId;
      const kind = inferAssetKind(asset);
      if (kind !== 'image' && kind !== 'video' && kind !== 'pdf' && kind !== 'csv') {
        if (requestId !== previewRequestIdRef.current) {
          return;
        }
        setAssetPreview(null);
        setAssetPreviewError('Preview is not supported for this file type yet.');
        return;
      }

      const maxBytesSteps = buildPreviewMaxBytesSteps(kind, asset.size);

      setIsPreviewBusy(true);
      try {
        let resolvedPreview: AssetPreview | null = null;
        for (let index = 0; index < maxBytesSteps.length; index += 1) {
          const maxBytes = maxBytesSteps[index];
          const preview = await assetPreviewApi.previewAsset({
            profileId,
            key: asset.key,
            etag: asset.etag || undefined,
            maxBytes,
          });
          if (requestId !== previewRequestIdRef.current) {
            return;
          }

          if (kind === 'image' && preview.kind === 'image' && preview.dataBase64) {
            const dataUrl = `data:${preview.contentType};base64,${preview.dataBase64}`;
            try {
              await withTimeout(
                ensureImageDataUrlDecodable(dataUrl),
                2_600,
                'Image preview decode timed out',
              );
            } catch (decodeError) {
              if (index < maxBytesSteps.length - 1) {
                continue;
              }
              throw decodeError;
            }
          }

          resolvedPreview = preview;
          const shouldRetryWithMoreBytes =
            preview.truncated &&
            index < maxBytesSteps.length - 1 &&
            (kind === 'image' || kind === 'video' || kind === 'pdf');
          if (!shouldRetryWithMoreBytes) {
            break;
          }
        }

        if (requestId !== previewRequestIdRef.current) {
          return;
        }
        setAssetPreview(resolvedPreview);
        setAssetPreviewError('');
      } catch (error) {
        if (requestId !== previewRequestIdRef.current) {
          return;
        }
        setAssetPreview(null);
        setAssetPreviewError(toPreviewFailureMessage(error));
      } finally {
        if (requestId === previewRequestIdRef.current) {
          setIsPreviewBusy(false);
        }
      }
    },
    [assetPreviewApi, inferAssetKind],
  );

  const handleRetrySelectedAssetPreview = useCallback(() => {
    if (!selectedProfileId || !selectedAsset) {
      return;
    }
    onStatusLine('Retrying preview...', 'neutral');
    void loadSelectedAssetPreview(selectedProfileId, selectedAsset);
  }, [loadSelectedAssetPreview, onStatusLine, selectedAsset, selectedProfileId]);

  const handleRetrySelectedAssetMetadata = useCallback(() => {
    if (!selectedProfileId || !selectedAsset) {
      return;
    }
    onStatusLine('Retrying metadata...', 'neutral');
    void loadSelectedAssetMetadata(selectedProfileId, selectedAsset.key);
  }, [loadSelectedAssetMetadata, onStatusLine, selectedAsset, selectedProfileId]);

  useEffect(() => {
    metadataRequestIdRef.current += 1;
    previewRequestIdRef.current += 1;
    setAssetPreview(null);
    setAssetPreviewError('');
    setPdfPreviewPage(1);
  }, [selectedAsset?.key]);

  useEffect(() => {
    if (!selectedProfileId || !selectedAsset) {
      setSelectedAssetMetadata(null);
      setSelectedAssetMetadataError('');
      return;
    }

    let canceled = false;

    const load = async () => {
      await loadSelectedAssetMetadata(selectedProfileId, selectedAsset.key);
      if (canceled) {
        return;
      }
    };

    void load();

    return () => {
      canceled = true;
    };
  }, [loadSelectedAssetMetadata, selectedAsset, selectedProfileId]);

  useEffect(() => {
    if (!selectedProfileId || !selectedAsset) {
      return;
    }

    void loadSelectedAssetPreview(selectedProfileId, selectedAsset);
  }, [loadSelectedAssetPreview, selectedAsset, selectedProfileId]);

  return {
    assetPreview,
    assetPreviewError,
    handleImageDecodeError: () => {
      setAssetPreviewError('Image preview failed to decode. Try another item or download.');
    },
    handlePdfNextPage: () =>
      setPdfPreviewPage((current) => resolvePdfPreviewPage(current, 'next')),
    handlePdfPrevPage: () =>
      setPdfPreviewPage((current) => resolvePdfPreviewPage(current, 'previous')),
    handleRetrySelectedAssetMetadata,
    handleRetrySelectedAssetPreview,
    handleVideoDecodeError: () => {
      setAssetPreviewError(
        'Video preview failed to decode. Try download or open the original.',
      );
    },
    isHeadBusy,
    isPreviewBusy,
    pdfPreviewPage,
    previewDataUrl,
    selectedAssetMetadata,
    selectedAssetMetadataError,
  };
};
