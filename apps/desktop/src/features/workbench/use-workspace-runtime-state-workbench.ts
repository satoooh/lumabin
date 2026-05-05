import { useMemo } from 'react';

interface UseWorkspaceRuntimeStateWorkbenchOptions {
  isBrowserBusy: boolean;
  isSearchBusy: boolean;
  selectedProfileId: string;
  nextAssetsContinuationToken?: string;
  activeSearchQuery: string;
  hasInitialized: boolean;
}

export const useWorkspaceRuntimeStateWorkbench = ({
  isBrowserBusy,
  isSearchBusy,
  selectedProfileId,
  nextAssetsContinuationToken,
  activeSearchQuery,
  hasInitialized,
}: UseWorkspaceRuntimeStateWorkbenchOptions) =>
  useMemo(() => {
    const isListLoading = isBrowserBusy || isSearchBusy;
    const isNextPageDisabled =
      isListLoading ||
      !selectedProfileId ||
      !nextAssetsContinuationToken ||
      Boolean(activeSearchQuery);
    const showGuidedStart = hasInitialized && !selectedProfileId;

    return {
      isListLoading,
      isNextPageDisabled,
      showGuidedStart,
    };
  }, [
    activeSearchQuery,
    hasInitialized,
    isBrowserBusy,
    isSearchBusy,
    nextAssetsContinuationToken,
    selectedProfileId,
  ]);
