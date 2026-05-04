import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useGallerySearchCommands } from '../../src/features/gallery/use-gallery-search-commands';

describe('gallery search commands', () => {
  it('clears search and restores focus to the search input', () => {
    const clearSearch = vi.fn();
    const searchInputRef = createRef<HTMLInputElement>();
    const input = document.createElement('input');
    searchInputRef.current = input;
    const focus = vi.spyOn(input, 'focus');

    const { result } = renderHook(() =>
      useGallerySearchCommands({
        clearSearch,
        searchInputRef,
      }),
    );

    act(() => {
      result.current.handleSearchClear();
    });

    expect(clearSearch).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('still clears search when the input ref is not mounted', () => {
    const clearSearch = vi.fn();
    const searchInputRef = createRef<HTMLInputElement>();

    const { result } = renderHook(() =>
      useGallerySearchCommands({
        clearSearch,
        searchInputRef,
      }),
    );

    act(() => {
      result.current.handleSearchClear();
    });

    expect(clearSearch).toHaveBeenCalledTimes(1);
  });
});
