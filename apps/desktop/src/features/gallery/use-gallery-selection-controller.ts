import {
  useCallback,
  useEffect,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from 'react';
import type { AssetItem } from '../../shared/ipc';
import type { KindFilter } from './use-gallery-view-model';

type StatusTone = 'neutral' | 'success' | 'error';

interface QuickPreviewOpenOptions {
  sourceRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  originPoint: {
    x: number;
    y: number;
  };
}

interface AssetItemClickOptions {
  openPreviewOnSingleClick?: boolean;
  thumbnailCacheKey?: string;
  hasThumbnailError?: boolean;
}

interface UseGallerySelectionControllerOptions {
  inferAssetKind: (item: AssetItem) => Exclude<KindFilter, 'all'>;
  isPreviewableKind: (kind: Exclude<KindFilter, 'all'>) => boolean;
  isSelectionMode: boolean;
  openQuickPreviewForItem: (item: AssetItem, options?: QuickPreviewOpenOptions) => void;
  requestThumbnailRetry: (cacheKey: string) => void;
  setIsSelectionMode: Dispatch<SetStateAction<boolean>>;
  setSelectedAssetKey: Dispatch<SetStateAction<string>>;
  setSelectedAssetKeys: Dispatch<SetStateAction<string[]>>;
  setStatusLine: (status: string, tone?: StatusTone) => void;
  selectedAssetKey: string;
  visibleItems: AssetItem[];
}

export const toggleAssetKeySelection = (current: string[], key: string): string[] => {
  if (current.includes(key)) {
    return current.filter((value) => value !== key);
  }
  return [...current, key];
};

export const isAssetKeyVisible = (key: string, visibleItems: AssetItem[]): boolean =>
  visibleItems.some((item) => item.key === key);

export const useGallerySelectionController = ({
  inferAssetKind,
  isPreviewableKind,
  isSelectionMode,
  openQuickPreviewForItem,
  requestThumbnailRetry,
  setIsSelectionMode,
  setSelectedAssetKey,
  setSelectedAssetKeys,
  setStatusLine,
  selectedAssetKey,
  visibleItems,
}: UseGallerySelectionControllerOptions) => {
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((current) => {
      if (current) {
        setSelectedAssetKeys([]);
        setStatusLine('Selection mode off.', 'neutral');
        return false;
      }

      setSelectedAssetKeys([]);
      setStatusLine('Selection mode on.', 'neutral');
      return true;
    });
  }, [setIsSelectionMode, setSelectedAssetKeys, setStatusLine]);

  const toggleAssetSelection = useCallback(
    (key: string) => {
      setSelectedAssetKey(key);
      setSelectedAssetKeys((current) => toggleAssetKeySelection(current, key));
    },
    [setSelectedAssetKey, setSelectedAssetKeys],
  );

  const handleSelectAllVisible = useCallback(() => {
    setIsSelectionMode(true);
    setSelectedAssetKeys(visibleItems.map((item) => item.key));
  }, [setIsSelectionMode, setSelectedAssetKeys, visibleItems]);

  const handleAssetItemClick = useCallback(
    (
      event: ReactMouseEvent<HTMLButtonElement>,
      item: AssetItem,
      options?: AssetItemClickOptions,
    ) => {
      const openPreviewOnSingleClick = options?.openPreviewOnSingleClick ?? true;
      const useMultiSelectModifier = event.metaKey || event.ctrlKey;

      if (useMultiSelectModifier) {
        event.preventDefault();
        setIsSelectionMode(true);
        toggleAssetSelection(item.key);
        return;
      }

      if (isSelectionMode) {
        toggleAssetSelection(item.key);
        return;
      }

      if (options?.thumbnailCacheKey && options.hasThumbnailError) {
        requestThumbnailRetry(options.thumbnailCacheKey);
        return;
      }

      setSelectedAssetKey(item.key);
      if (openPreviewOnSingleClick && isPreviewableKind(inferAssetKind(item))) {
        const sourceRect = event.currentTarget.getBoundingClientRect();
        openQuickPreviewForItem(item, {
          sourceRect: {
            x: sourceRect.left,
            y: sourceRect.top,
            width: sourceRect.width,
            height: sourceRect.height,
          },
          originPoint: { x: event.clientX, y: event.clientY },
        });
      }
    },
    [
      inferAssetKind,
      isPreviewableKind,
      isSelectionMode,
      openQuickPreviewForItem,
      requestThumbnailRetry,
      setIsSelectionMode,
      setSelectedAssetKey,
      toggleAssetSelection,
    ],
  );

  const handleAssetItemDoubleClick = useCallback(
    (item: AssetItem) => {
      if (isSelectionMode) {
        return;
      }
      if (!isPreviewableKind(inferAssetKind(item))) {
        return;
      }
      openQuickPreviewForItem(item);
    },
    [
      inferAssetKind,
      isPreviewableKind,
      isSelectionMode,
      openQuickPreviewForItem,
    ],
  );

  useEffect(() => {
    if (!selectedAssetKey) {
      return;
    }
    if (!isAssetKeyVisible(selectedAssetKey, visibleItems)) {
      setSelectedAssetKey('');
    }
  }, [selectedAssetKey, setSelectedAssetKey, visibleItems]);

  return {
    handleAssetItemClick,
    handleAssetItemDoubleClick,
    handleSelectAllVisible,
    toggleAssetSelection,
    toggleSelectionMode,
  };
};
