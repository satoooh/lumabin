import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ensureImageDataUrlDecodable,
  withTimeout,
} from '../shared/media-preview';
import type {
  AssetItem,
  AssetMetadata,
  AssetPreview,
} from '../../shared/ipc';
import type { AssetPreviewApi } from '../shared/desktop-api-gateway';

type PreviewableKind = 'image' | 'video' | 'pdf' | 'csv';
type AssetKind = PreviewableKind | 'other';

interface UseAssetPreviewControllerOptions {
  assetPreviewApi: AssetPreviewApi;
  inferAssetKind: (item: AssetItem) => AssetKind;
  onStatusLine: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  selectedAsset: AssetItem | null;
  selectedProfileId: string;
}

const PREVIEW_IMAGE_MAX_BYTES_STEPS = [5 * 1024 * 1024, 16 * 1024 * 1024, 32 * 1024 * 1024];
const PREVIEW_VIDEO_MAX_BYTES_STEPS = [8 * 1024 * 1024, 32 * 1024 * 1024, 96 * 1024 * 1024];
const PREVIEW_PDF_MAX_BYTES_STEPS = [6 * 1024 * 1024, 18 * 1024 * 1024, 48 * 1024 * 1024];
const PREVIEW_CSV_MAX_BYTES_STEPS = [1024 * 1024, 4 * 1024 * 1024];
const PREVIEW_FULL_FETCH_MAX_BYTES = 160 * 1024 * 1024;

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const buildPreviewMaxBytesSteps = (
  kind: PreviewableKind,
  totalSizeBytes: number,
): number[] => {
  const base =
    kind === 'video'
      ? PREVIEW_VIDEO_MAX_BYTES_STEPS
      : kind === 'pdf'
        ? PREVIEW_PDF_MAX_BYTES_STEPS
        : kind === 'image'
          ? PREVIEW_IMAGE_MAX_BYTES_STEPS
          : PREVIEW_CSV_MAX_BYTES_STEPS;

  const steps = [...base];
  if (isFiniteNonNegativeNumber(totalSizeBytes) && totalSizeBytes > 0) {
    const maxAdditionalStep = Math.min(totalSizeBytes, PREVIEW_FULL_FETCH_MAX_BYTES);
    if (maxAdditionalStep > steps[steps.length - 1]) {
      steps.push(maxAdditionalStep);
    }
  }

  return [...new Set(steps)].sort((left, right) => left - right);
};

const toPreviewFailureMessage = (error: unknown): string => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (/timed out/i.test(message)) {
    return 'Preview timed out. Retry preview or download the original file.';
  }
  if (/HTTP 416|InvalidRange/i.test(message)) {
    return 'Preview range request failed. Retry preview or download the original file.';
  }
  if (/decode/i.test(message)) {
    return 'Preview decode failed. Retry preview or download the original file.';
  }
  return `Preview failed: ${message}`;
};

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

  const previewDataUrl = useMemo(() => {
    if (!assetPreview?.dataBase64) {
      return '';
    }
    return `data:${assetPreview.contentType};base64,${assetPreview.dataBase64}`;
  }, [assetPreview]);

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
    handlePdfNextPage: () => setPdfPreviewPage((current) => current + 1),
    handlePdfPrevPage: () => setPdfPreviewPage((current) => Math.max(1, current - 1)),
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
