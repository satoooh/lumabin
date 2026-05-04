import { act, renderHook } from '@testing-library/react';
import type { SetStateAction } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useGalleryFilterCommands } from '../../src/features/gallery/use-gallery-filter-commands';
import type {
  KindFilter,
  SmartCollection,
} from '../../src/features/gallery/use-gallery-view-model';

const applyStateAction = <T,>(current: T, next: SetStateAction<T>): T =>
  typeof next === 'function' ? (next as (value: T) => T)(current) : next;

describe('gallery filter commands', () => {
  it('resets kind and smart collection filters with status feedback', () => {
    let kindFilter: KindFilter = 'image';
    let smartCollection: SmartCollection = 'recent';
    const setStatusLine = vi.fn();

    const { result } = renderHook(() =>
      useGalleryFilterCommands({
        setKindFilter: (next) => {
          kindFilter = applyStateAction(kindFilter, next);
        },
        setSmartCollection: (next) => {
          smartCollection = applyStateAction(smartCollection, next);
        },
        setStatusLine,
      }),
    );

    act(() => {
      result.current.handleResetViewFilters();
    });

    expect(kindFilter).toBe('all');
    expect(smartCollection).toBe('all');
    expect(setStatusLine).toHaveBeenCalledWith('Filters reset.', 'neutral');
  });

  it('routes unified filter ids to both filter states', () => {
    let kindFilter: KindFilter = 'all';
    let smartCollection: SmartCollection = 'all';

    const { result } = renderHook(() =>
      useGalleryFilterCommands({
        setKindFilter: (next) => {
          kindFilter = applyStateAction(kindFilter, next);
        },
        setSmartCollection: (next) => {
          smartCollection = applyStateAction(smartCollection, next);
        },
        setStatusLine: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleSelectUnifiedFilter('smart:large-files');
    });
    expect(kindFilter).toBe('all');
    expect(smartCollection).toBe('large-files');

    act(() => {
      result.current.handleSelectUnifiedFilter('kind:video');
    });
    expect(kindFilter).toBe('video');
    expect(smartCollection).toBe('all');
  });
});
