import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { AssetItem } from '../../shared/ipc';
import { basenameFromKey } from '../shared/asset-key';
import type { PreviewSharingApi } from '../shared/desktop-api-gateway';

type StatusTone = 'neutral' | 'success' | 'error';
type PresignKind = 'get' | 'put';

interface UsePreviewSharingCommandsOptions {
  markCopied: (label: string) => void;
  presignedUrlTTLSeconds: number;
  publicUrlForSelectedAsset: string;
  pushInlineFeedback: (message: string) => void;
  selectedAsset?: AssetItem;
  selectedProfileId: string;
  sharingApi: PreviewSharingApi;
  setIsSharingBusy: Dispatch<SetStateAction<boolean>>;
  setPresignedGetUrl: Dispatch<SetStateAction<string>>;
  setPresignedPutUrl: Dispatch<SetStateAction<string>>;
  setStatusLine: (status: string, tone?: StatusTone) => void;
}

export const downloadBlobFromUrl = async (
  url: string,
  fileName: string,
): Promise<void> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
};

export const openUrlFallback = (url: string): void => {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noreferrer noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
};

export const usePreviewSharingCommands = ({
  markCopied,
  presignedUrlTTLSeconds,
  publicUrlForSelectedAsset,
  pushInlineFeedback,
  selectedAsset,
  selectedProfileId,
  sharingApi,
  setIsSharingBusy,
  setPresignedGetUrl,
  setPresignedPutUrl,
  setStatusLine,
}: UsePreviewSharingCommandsOptions) => {
  const handleCopyToClipboard = useCallback(
    async (value: string, label: string) => {
      try {
        await navigator.clipboard.writeText(value);
        markCopied(label);
        pushInlineFeedback(`${label} copied`);
        setStatusLine(`${label} copied!`, 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setStatusLine(`Failed to copy ${label}: ${message}`, 'error');
      }
    },
    [markCopied, pushInlineFeedback, setStatusLine],
  );

  const handleCopyPublicUrl = useCallback(async () => {
    if (!selectedAsset) {
      return;
    }

    if (!publicUrlForSelectedAsset) {
      setStatusLine('Set Public URL base in Settings > Connection first.', 'error');
      return;
    }

    await handleCopyToClipboard(publicUrlForSelectedAsset, 'Public URL');
  }, [handleCopyToClipboard, publicUrlForSelectedAsset, selectedAsset, setStatusLine]);

  const requestPresignedUrl = useCallback(
    async (kind: PresignKind) => {
      if (!selectedProfileId || !selectedAsset) {
        return null;
      }

      const input = {
        profileId: selectedProfileId,
        key: selectedAsset.key,
        expiresInSeconds: presignedUrlTTLSeconds,
      };
      const result =
        kind === 'get'
          ? await sharingApi.createPresignedGet(input)
          : await sharingApi.createPresignedPut(input);

      if (kind === 'get') {
        setPresignedGetUrl(result.url);
      } else {
        setPresignedPutUrl(result.url);
      }

      return result.url;
    },
    [
      presignedUrlTTLSeconds,
      selectedAsset,
      selectedProfileId,
      setPresignedGetUrl,
      setPresignedPutUrl,
      sharingApi,
    ],
  );

  const handleCreatePresigned = useCallback(
    async (kind: PresignKind) => {
      setIsSharingBusy(true);
      try {
        const url = await requestPresignedUrl(kind);
        if (!url) {
          return;
        }
        setStatusLine(`Presigned ${kind.toUpperCase()} URL generated`, 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setStatusLine(`Failed to generate presigned URL: ${message}`, 'error');
      } finally {
        setIsSharingBusy(false);
      }
    },
    [requestPresignedUrl, setIsSharingBusy, setStatusLine],
  );

  const handleShareSelectedAsset = useCallback(async () => {
    setIsSharingBusy(true);
    try {
      const url = await requestPresignedUrl('get');
      if (!url) {
        return;
      }
      await handleCopyToClipboard(url, 'Share URL');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Failed to prepare share URL: ${message}`, 'error');
    } finally {
      setIsSharingBusy(false);
    }
  }, [handleCopyToClipboard, requestPresignedUrl, setIsSharingBusy, setStatusLine]);

  const handleDownloadSelectedAsset = useCallback(async () => {
    if (!selectedAsset) {
      return;
    }

    setIsSharingBusy(true);
    try {
      const url = await requestPresignedUrl('get');
      if (!url) {
        return;
      }

      try {
        await downloadBlobFromUrl(url, basenameFromKey(selectedAsset.key));
      } catch {
        openUrlFallback(url);
      }

      setStatusLine('Download started.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatusLine(`Failed to start download: ${message}`, 'error');
    } finally {
      setIsSharingBusy(false);
    }
  }, [requestPresignedUrl, selectedAsset, setIsSharingBusy, setStatusLine]);

  return {
    handleCopyPublicUrl,
    handleCopyToClipboard,
    handleCreatePresigned,
    handleDownloadSelectedAsset,
    handleShareSelectedAsset,
    requestPresignedUrl,
  };
};
