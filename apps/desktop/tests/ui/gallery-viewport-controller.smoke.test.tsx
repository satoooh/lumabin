import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useRef, useState } from 'react';
import { useGalleryViewportController } from '../../src/features/gallery/use-gallery-viewport-controller';

const Probe = () => {
  const appShellRef = useRef<HTMLDivElement | null>(null);
  const galleryScrollRef = useRef<HTMLDivElement | null>(null);
  const gallerySizeSliderRef = useRef<HTMLInputElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const [galleryScrollTop, setGalleryScrollTop] = useState(0);
  const [galleryTileMinWidth, setGalleryTileMinWidth] = useState(188);
  const [listScrollTop, setListScrollTop] = useState(0);

  const viewport = useGalleryViewportController({
    appShellRef,
    galleryScrollRef,
    galleryScrollTop,
    gallerySizeSliderRef,
    galleryTileMinWidth,
    listContainerRef,
    listScrollTop,
    setGalleryScrollTop,
    setGalleryTileMinWidth,
    setListScrollTop,
    viewMode: 'gallery',
    visibleItemsLength: 3,
  });

  return (
    <>
      <div data-testid="shell" ref={appShellRef} />
      <div data-testid="gallery" ref={galleryScrollRef} />
      <div data-testid="list" ref={listContainerRef} />
      <input data-testid="slider" ref={gallerySizeSliderRef} />
      <output data-testid="gallery-height">{viewport.galleryViewportHeight}</output>
      <output data-testid="gallery-width">{viewport.galleryViewportWidth}</output>
      <output data-testid="list-height">{viewport.listViewportHeight}</output>
      <output data-testid="scrolling">{String(viewport.isGalleryScrolling)}</output>
    </>
  );
};

describe('gallery viewport controller', () => {
  afterEach(() => {
    cleanup();
  });

  it('owns viewport defaults and tile size DOM sync outside App', () => {
    render(<Probe />);

    expect(screen.getByTestId('gallery-height').textContent).toBe('0');
    expect(screen.getByTestId('gallery-width').textContent).toBe('0');
    expect(screen.getByTestId('list-height').textContent).toBe('0');
    expect(screen.getByTestId('scrolling').textContent).toBe('false');
    expect(screen.getByTestId('shell').style.getPropertyValue('--gallery-tile-min-width')).toBe(
      '188px',
    );
    expect((screen.getByTestId('slider') as HTMLInputElement).value).toBe('188');
  });
});
