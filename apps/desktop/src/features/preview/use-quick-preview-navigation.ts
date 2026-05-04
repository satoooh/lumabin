import {
  useCallback,
  useState,
  type RefObject,
} from 'react';
import type { AssetItem } from '../../shared/ipc';

type PreviewableKind = 'image' | 'video' | 'pdf';
type AssetKind = PreviewableKind | 'csv' | 'other';

interface QuickPreviewGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseQuickPreviewNavigationOptions {
  assetItemRefs: RefObject<Map<string, HTMLButtonElement>>;
  inferAssetKind: (item: AssetItem) => AssetKind;
  isPreviewableKind: (kind: AssetKind) => boolean;
  previewMediaItems: AssetItem[];
  selectedAssetKey: string;
  selectedPreviewItemIndex: number;
  setSelectedAssetKey: (key: string) => void;
}

export const useQuickPreviewNavigation = ({
  assetItemRefs,
  inferAssetKind,
  isPreviewableKind,
  previewMediaItems,
  selectedAssetKey,
  selectedPreviewItemIndex,
  setSelectedAssetKey,
}: UseQuickPreviewNavigationOptions) => {
  const [isQuickPreviewOpen, setIsQuickPreviewOpen] = useState<boolean>(false);
  const [isQuickPreviewInfoOpen, setIsQuickPreviewInfoOpen] = useState<boolean>(true);
  const [quickPreviewOrigin, setQuickPreviewOrigin] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [quickPreviewSourceRect, setQuickPreviewSourceRect] =
    useState<QuickPreviewGeometry | null>(null);

  const resetQuickPreviewGeometry = useCallback(() => {
    setQuickPreviewOrigin(null);
    setQuickPreviewSourceRect(null);
  }, []);

  const closeQuickPreview = useCallback(() => {
    setIsQuickPreviewOpen(false);
  }, []);

  const openQuickPreviewForItem = useCallback(
    (
      item: AssetItem,
      options?: {
        sourceRect?: QuickPreviewGeometry;
        originPoint?: { x: number; y: number };
      },
    ): boolean => {
      if (!isPreviewableKind(inferAssetKind(item))) {
        return false;
      }

      const fallbackNode = assetItemRefs.current.get(item.key);
      const fallbackRect =
        fallbackNode && fallbackNode.isConnected
          ? fallbackNode.getBoundingClientRect()
          : null;
      const sourceRect = options?.sourceRect
        ? options.sourceRect
        : fallbackRect
          ? {
              x: fallbackRect.left,
              y: fallbackRect.top,
              width: fallbackRect.width,
              height: fallbackRect.height,
            }
          : null;

      if (sourceRect && sourceRect.width >= 2 && sourceRect.height >= 2) {
        const originX = options?.originPoint?.x ?? sourceRect.x + sourceRect.width / 2;
        const originY = options?.originPoint?.y ?? sourceRect.y + sourceRect.height / 2;
        setQuickPreviewOrigin({
          x: Math.max(8, Math.min(92, (originX / Math.max(1, window.innerWidth)) * 100)),
          y: Math.max(8, Math.min(92, (originY / Math.max(1, window.innerHeight)) * 100)),
        });
        setQuickPreviewSourceRect({
          x: sourceRect.x,
          y: sourceRect.y,
          width: sourceRect.width,
          height: sourceRect.height,
        });
      } else {
        resetQuickPreviewGeometry();
      }

      setSelectedAssetKey(item.key);
      setIsQuickPreviewInfoOpen(true);
      setIsQuickPreviewOpen(true);
      return true;
    },
    [
      assetItemRefs,
      inferAssetKind,
      isPreviewableKind,
      resetQuickPreviewGeometry,
      setSelectedAssetKey,
    ],
  );

  const moveQuickPreviewSelection = useCallback(
    (direction: -1 | 1) => {
      if (previewMediaItems.length === 0) {
        return;
      }

      const safeCurrentIndex = selectedPreviewItemIndex < 0 ? 0 : selectedPreviewItemIndex;
      const nextIndex = Math.min(
        previewMediaItems.length - 1,
        Math.max(0, safeCurrentIndex + direction),
      );

      const nextItem = previewMediaItems[nextIndex];
      if (!nextItem) {
        return;
      }

      setSelectedAssetKey(nextItem.key);
      resetQuickPreviewGeometry();
      setIsQuickPreviewOpen(true);
    },
    [
      previewMediaItems,
      resetQuickPreviewGeometry,
      selectedPreviewItemIndex,
      setSelectedAssetKey,
    ],
  );

  const resolveQuickPreviewCloseTargetRect = useCallback(() => {
    if (!selectedAssetKey) {
      return null;
    }

    const sourceNode = assetItemRefs.current.get(selectedAssetKey);
    if (!sourceNode || !sourceNode.isConnected) {
      return null;
    }

    const rect = sourceNode.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      return null;
    }

    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, [assetItemRefs, selectedAssetKey]);

  return {
    closeQuickPreview,
    isQuickPreviewInfoOpen,
    isQuickPreviewOpen,
    moveQuickPreviewSelection,
    openQuickPreviewForItem,
    quickPreviewOrigin,
    quickPreviewSourceRect,
    resetQuickPreviewGeometry,
    resolveQuickPreviewCloseTargetRect,
    setIsQuickPreviewInfoOpen,
    setIsQuickPreviewOpen,
  };
};
