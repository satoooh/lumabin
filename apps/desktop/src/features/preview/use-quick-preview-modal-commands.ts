import {
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { AssetItem } from '../../shared/ipc';

type PresignKind = 'get' | 'put';

interface UseQuickPreviewModalCommandsOptions {
  copyPublicUrl: () => Promise<void>;
  copyToClipboard: (value: string, label: string) => Promise<void>;
  createPresigned: (kind: PresignKind) => Promise<void>;
  downloadSelectedAsset: () => Promise<void>;
  presignedGetUrl: string;
  presignedPutUrl: string;
  retryMetadata: () => void;
  selectedAsset: AssetItem | null;
  setIsQuickPreviewInfoOpen: Dispatch<SetStateAction<boolean>>;
  shareSelectedAsset: () => Promise<void>;
}

export const useQuickPreviewModalCommands = ({
  copyPublicUrl,
  copyToClipboard,
  createPresigned,
  downloadSelectedAsset,
  presignedGetUrl,
  presignedPutUrl,
  retryMetadata,
  selectedAsset,
  setIsQuickPreviewInfoOpen,
  shareSelectedAsset,
}: UseQuickPreviewModalCommandsOptions) => {
  const handleToggleInfoOpen = useCallback(() => {
    setIsQuickPreviewInfoOpen((current) => !current);
  }, [setIsQuickPreviewInfoOpen]);

  const handleCopyAssetKey = useCallback(() => {
    if (!selectedAsset) {
      return;
    }
    void copyToClipboard(selectedAsset.key, 'Asset key');
  }, [copyToClipboard, selectedAsset]);

  const sharingCommands = useMemo(
    () => ({
      onCopyPresignedGetUrl: () => {
        void copyToClipboard(presignedGetUrl, 'Presigned GET URL');
      },
      onCopyPresignedPutUrl: () => {
        void copyToClipboard(presignedPutUrl, 'Presigned PUT URL');
      },
      onCopyPublicUrl: () => {
        void copyPublicUrl();
      },
      onCreatePresignedPut: () => {
        void createPresigned('put');
      },
      onDownloadSelectedAsset: () => {
        void downloadSelectedAsset();
      },
      onShareSelectedAsset: () => {
        void shareSelectedAsset();
      },
    }),
    [
      copyPublicUrl,
      copyToClipboard,
      createPresigned,
      downloadSelectedAsset,
      presignedGetUrl,
      presignedPutUrl,
      shareSelectedAsset,
    ],
  );

  const metadataCommands = useMemo(
    () => ({
      onCopyAssetKey: handleCopyAssetKey,
      onRetryMetadata: retryMetadata,
    }),
    [handleCopyAssetKey, retryMetadata],
  );

  return {
    handleToggleInfoOpen,
    metadataCommands,
    sharingCommands,
  };
};
