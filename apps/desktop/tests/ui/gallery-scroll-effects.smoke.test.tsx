import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import {
  shouldApplyScrollTop,
  useGalleryScrollEffects,
} from '../../src/features/gallery/use-gallery-scroll-effects';
import type { ViewMode } from '../../src/features/gallery/use-gallery-view-model';

interface ProbeProps {
  galleryScrollTop?: number;
  listScrollTop?: number;
  listViewportHeight?: number;
  setGalleryViewportHeight?: (value: number) => void;
  setGalleryViewportWidth?: (value: number) => void;
  setListViewportHeight?: (value: number) => void;
  viewMode?: ViewMode;
  visibleItemsLength?: number;
}

const Probe = ({
  galleryScrollTop = 0,
  listScrollTop = 0,
  listViewportHeight = 420,
  setGalleryViewportHeight = vi.fn(),
  setGalleryViewportWidth = vi.fn(),
  setListViewportHeight = vi.fn(),
  viewMode = 'list',
  visibleItemsLength = 1,
}: ProbeProps) => {
  const galleryScrollPendingTopRef = useRef<number>(0);
  const galleryScrollRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const listScrollPendingTopRef = useRef<number>(0);
  const listScrollPendingViewportHeightRef = useRef<number>(0);

  useGalleryScrollEffects({
    galleryScrollPendingTopRef,
    galleryScrollRef,
    galleryScrollTop,
    listContainerRef,
    listScrollPendingTopRef,
    listScrollPendingViewportHeightRef,
    listScrollTop,
    listViewportHeight,
    setGalleryViewportHeight,
    setGalleryViewportWidth,
    setListViewportHeight,
    viewMode,
    visibleItemsLength,
  });

  return (
    <>
      <div data-testid="list" ref={listContainerRef} />
      <div data-testid="gallery" ref={galleryScrollRef} />
      <output data-testid="pending-list-top">{listScrollPendingTopRef.current}</output>
      <output data-testid="pending-gallery-top">{galleryScrollPendingTopRef.current}</output>
      <output data-testid="pending-list-height">
        {listScrollPendingViewportHeightRef.current}
      </output>
    </>
  );
};

describe('gallery scroll effects', () => {
  afterEach(() => {
    cleanup();
  });

  it('applies scroll updates only after a meaningful delta', () => {
    expect(shouldApplyScrollTop(100, 100.5)).toBe(false);
    expect(shouldApplyScrollTop(100, 101.1)).toBe(true);
  });

  it('restores list scroll position in list mode', () => {
    const { getByTestId } = render(<Probe listScrollTop={120} />);

    expect(getByTestId('list').scrollTop).toBe(120);
    expect(getByTestId('gallery').scrollTop).toBe(0);
  });

  it('restores gallery scroll position in gallery mode', () => {
    const { getByTestId } = render(
      <Probe galleryScrollTop={240} viewMode="gallery" />,
    );

    expect(getByTestId('gallery').scrollTop).toBe(240);
    expect(getByTestId('list').scrollTop).toBe(0);
  });
});
