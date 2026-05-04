import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { AssetItem } from '../../shared/ipc';
import type { AssetActionDialogState, BulkMoveDialogState } from './action-modals';

const visibleAssetKeySet = (visibleItems: AssetItem[]): Set<string> =>
  new Set(visibleItems.map((item) => item.key));

const areStringArraysEqual = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export const filterVisibleAssetKeys = (
  keys: string[],
  visibleItems: AssetItem[],
): string[] => {
  const visibleKeys = visibleAssetKeySet(visibleItems);
  return keys.filter((key) => visibleKeys.has(key));
};

export const reconcileSelectedAssetKeysForVisibleItems = (
  keys: string[],
  visibleItems: AssetItem[],
): string[] => {
  const stillVisible = filterVisibleAssetKeys(keys, visibleItems);
  return areStringArraysEqual(stillVisible, keys) ? keys : stillVisible;
};

export const isAssetActionDialogVisible = (
  dialog: AssetActionDialogState | null,
  visibleItems: AssetItem[],
): boolean => !dialog || visibleAssetKeySet(visibleItems).has(dialog.key);

export const reconcileBulkMoveDialogForVisibleItems = (
  dialog: BulkMoveDialogState | null,
  visibleItems: AssetItem[],
): BulkMoveDialogState | null => {
  if (!dialog) {
    return null;
  }
  if (dialog.keys.length === 0) {
    return null;
  }

  const stillVisible = filterVisibleAssetKeys(dialog.keys, visibleItems);
  if (stillVisible.length === dialog.keys.length) {
    return dialog;
  }

  return stillVisible.length > 0 ? { ...dialog, keys: stillVisible } : null;
};

export const reconcileBulkDeleteKeysForVisibleItems = (
  keys: string[] | null,
  visibleItems: AssetItem[],
): string[] | null => {
  if (!keys) {
    return null;
  }
  if (keys.length === 0) {
    return null;
  }

  const stillVisible = filterVisibleAssetKeys(keys, visibleItems);
  if (stillVisible.length === keys.length) {
    return keys;
  }

  return stillVisible.length > 0 ? stillVisible : null;
};

interface UseGalleryDialogGuardsOptions {
  assetActionDialog: AssetActionDialogState | null;
  bulkDeleteDialogKeys: string[] | null;
  bulkMoveDialog: BulkMoveDialogState | null;
  setAssetActionDialog: Dispatch<SetStateAction<AssetActionDialogState | null>>;
  setBulkDeleteDialogKeys: Dispatch<SetStateAction<string[] | null>>;
  setBulkMoveDialog: Dispatch<SetStateAction<BulkMoveDialogState | null>>;
  setSelectedAssetKeys: Dispatch<SetStateAction<string[]>>;
  visibleItems: AssetItem[];
}

export const useGalleryDialogGuards = ({
  assetActionDialog,
  bulkDeleteDialogKeys,
  bulkMoveDialog,
  setAssetActionDialog,
  setBulkDeleteDialogKeys,
  setBulkMoveDialog,
  setSelectedAssetKeys,
  visibleItems,
}: UseGalleryDialogGuardsOptions): void => {
  useEffect(() => {
    setSelectedAssetKeys((current) =>
      reconcileSelectedAssetKeysForVisibleItems(current, visibleItems),
    );
  }, [setSelectedAssetKeys, visibleItems]);

  useEffect(() => {
    if (!isAssetActionDialogVisible(assetActionDialog, visibleItems)) {
      setAssetActionDialog(null);
    }
  }, [assetActionDialog, setAssetActionDialog, visibleItems]);

  useEffect(() => {
    const nextDialog = reconcileBulkMoveDialogForVisibleItems(bulkMoveDialog, visibleItems);
    if (nextDialog !== bulkMoveDialog) {
      setBulkMoveDialog(nextDialog);
    }
  }, [bulkMoveDialog, setBulkMoveDialog, visibleItems]);

  useEffect(() => {
    const nextKeys = reconcileBulkDeleteKeysForVisibleItems(
      bulkDeleteDialogKeys,
      visibleItems,
    );
    if (nextKeys !== bulkDeleteDialogKeys) {
      setBulkDeleteDialogKeys(nextKeys);
    }
  }, [bulkDeleteDialogKeys, setBulkDeleteDialogKeys, visibleItems]);
};
