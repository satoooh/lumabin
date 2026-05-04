import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { AssetItem } from '../../shared/ipc';

type AssetKind = 'image' | 'video' | 'pdf' | 'csv' | 'other';

interface UseQuickPreviewLifecycleOptions {
  inferAssetKind: (item: AssetItem) => AssetKind;
  isConnectionSetupOpen: boolean;
  isPreviewableKind: (kind: AssetKind) => boolean;
  isQuickPreviewOpen: boolean;
  isSelectionMode: boolean;
  markAssetAsRecentlyViewed: (profileId: string, assetKey: string) => void;
  resetQuickPreviewGeometry: () => void;
  selectedAsset?: AssetItem;
  selectedAssetKey: string;
  selectedProfileId: string;
  setIsQuickPreviewInfoOpen: Dispatch<SetStateAction<boolean>>;
  setIsQuickPreviewOpen: Dispatch<SetStateAction<boolean>>;
  setPresignedGetUrl: Dispatch<SetStateAction<string>>;
  setPresignedPutUrl: Dispatch<SetStateAction<string>>;
}

export const useQuickPreviewLifecycle = ({
  inferAssetKind,
  isConnectionSetupOpen,
  isPreviewableKind,
  isQuickPreviewOpen,
  isSelectionMode,
  markAssetAsRecentlyViewed,
  resetQuickPreviewGeometry,
  selectedAsset,
  selectedAssetKey,
  selectedProfileId,
  setIsQuickPreviewInfoOpen,
  setIsQuickPreviewOpen,
  setPresignedGetUrl,
  setPresignedPutUrl,
}: UseQuickPreviewLifecycleOptions): void => {
  useEffect(() => {
    if (!selectedAssetKey) {
      setIsQuickPreviewOpen(false);
    }
  }, [selectedAssetKey, setIsQuickPreviewOpen]);

  useEffect(() => {
    if (isQuickPreviewOpen) {
      return;
    }
    resetQuickPreviewGeometry();
  }, [isQuickPreviewOpen, resetQuickPreviewGeometry]);

  useEffect(() => {
    if (!isSelectionMode) {
      return;
    }
    if (isQuickPreviewOpen) {
      setIsQuickPreviewOpen(false);
    }
  }, [isQuickPreviewOpen, isSelectionMode, setIsQuickPreviewOpen]);

  useEffect(() => {
    if (!isQuickPreviewOpen) {
      return;
    }

    setIsQuickPreviewInfoOpen(true);

    if (!selectedAsset || !isPreviewableKind(inferAssetKind(selectedAsset))) {
      setIsQuickPreviewOpen(false);
    }
  }, [
    inferAssetKind,
    isPreviewableKind,
    isQuickPreviewOpen,
    selectedAsset,
    setIsQuickPreviewInfoOpen,
    setIsQuickPreviewOpen,
  ]);

  useEffect(() => {
    if (!isQuickPreviewOpen || !selectedProfileId || !selectedAssetKey) {
      return;
    }
    markAssetAsRecentlyViewed(selectedProfileId, selectedAssetKey);
  }, [isQuickPreviewOpen, markAssetAsRecentlyViewed, selectedAssetKey, selectedProfileId]);

  useEffect(() => {
    if (isConnectionSetupOpen && isQuickPreviewOpen) {
      setIsQuickPreviewOpen(false);
    }
  }, [isConnectionSetupOpen, isQuickPreviewOpen, setIsQuickPreviewOpen]);

  useEffect(() => {
    setPresignedGetUrl('');
    setPresignedPutUrl('');
  }, [selectedAssetKey, setPresignedGetUrl, setPresignedPutUrl]);
};
