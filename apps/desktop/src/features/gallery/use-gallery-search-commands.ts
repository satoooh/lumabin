import { useCallback, type RefObject } from 'react';

interface UseGallerySearchCommandsOptions {
  clearSearch: () => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export const useGallerySearchCommands = ({
  clearSearch,
  searchInputRef,
}: UseGallerySearchCommandsOptions) => {
  const handleSearchClear = useCallback(() => {
    clearSearch();
    searchInputRef.current?.focus();
  }, [clearSearch, searchInputRef]);

  return {
    handleSearchClear,
  };
};
