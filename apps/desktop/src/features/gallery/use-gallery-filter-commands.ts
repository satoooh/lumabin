import { useCallback, type Dispatch, type SetStateAction } from 'react';
import {
  parseUnifiedFilterId,
  type KindFilter,
  type SmartCollection,
} from './use-gallery-view-model';

type StatusTone = 'neutral' | 'success' | 'error';

interface UseGalleryFilterCommandsOptions {
  setKindFilter: Dispatch<SetStateAction<KindFilter>>;
  setSmartCollection: Dispatch<SetStateAction<SmartCollection>>;
  setStatusLine: (message: string, tone?: StatusTone) => void;
}

export const useGalleryFilterCommands = ({
  setKindFilter,
  setSmartCollection,
  setStatusLine,
}: UseGalleryFilterCommandsOptions) => {
  const handleResetViewFilters = useCallback(() => {
    setKindFilter('all');
    setSmartCollection('all');
    setStatusLine('Filters reset.', 'neutral');
  }, [setKindFilter, setSmartCollection, setStatusLine]);

  const handleSelectUnifiedFilter = useCallback(
    (filterId: string) => {
      const nextFilters = parseUnifiedFilterId(filterId);
      setKindFilter(nextFilters.kindFilter);
      setSmartCollection(nextFilters.smartCollection);
    },
    [setKindFilter, setSmartCollection],
  );

  return {
    handleResetViewFilters,
    handleSelectUnifiedFilter,
  };
};
