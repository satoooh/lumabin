import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { AssetItem } from '../../shared/ipc';

interface UseWorkspaceGalleryLifecycleWorkbenchOptions {
  resetAssetsResult: () => void;
  setActiveSearchQuery: Dispatch<SetStateAction<string>>;
  setSearchInput: Dispatch<SetStateAction<string>>;
  setSearchItems: Dispatch<SetStateAction<AssetItem[]>>;
  setSelectedAssetKey: Dispatch<SetStateAction<string>>;
}

export const useWorkspaceGalleryLifecycleWorkbench = ({
  resetAssetsResult,
  setActiveSearchQuery,
  setSearchInput,
  setSearchItems,
  setSelectedAssetKey,
}: UseWorkspaceGalleryLifecycleWorkbenchOptions) => {
  const handleProfileSelected = useCallback(() => {
    setSearchInput('');
    setActiveSearchQuery('');
    setSearchItems([]);
  }, [setActiveSearchQuery, setSearchInput, setSearchItems]);

  const handleProfileDeleted = useCallback(() => {
    resetAssetsResult();
    setSelectedAssetKey('');
  }, [resetAssetsResult, setSelectedAssetKey]);

  return {
    handleProfileDeleted,
    handleProfileSelected,
  };
};
