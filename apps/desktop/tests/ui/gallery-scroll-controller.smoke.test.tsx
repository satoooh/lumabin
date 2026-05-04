import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import {
  shouldUpdateNumericState,
  useGalleryScrollController,
} from '../../src/features/gallery/use-gallery-scroll-controller';

const normalizeTileWidth = (value: number): number => Math.round(value * 10) / 10;

interface ProbeProps {
  galleryTileMinWidth?: number;
}

const Probe = ({ galleryTileMinWidth = 176 }: ProbeProps) => {
  const appShellRef = useRef<HTMLDivElement | null>(null);
  const gallerySizeSliderRef = useRef<HTMLInputElement | null>(null);

  useGalleryScrollController({
    appShellRef,
    commitDebounceMs: 90,
    galleryScrollIdleMs: 140,
    galleryScrollTop: 0,
    gallerySizeSliderRef,
    galleryTileMinWidth,
    listScrollTop: 0,
    listViewportHeight: 420,
    normalizeGalleryTileMinWidth: normalizeTileWidth,
    scrollUpdateEpsilonPx: 1.2,
    setGalleryScrollTop: vi.fn(),
    setGalleryTileMinWidth: vi.fn(),
    setIsGalleryScrolling: vi.fn(),
    setListScrollTop: vi.fn(),
    setListViewportHeight: vi.fn(),
  });

  return (
    <>
      <div data-testid="shell" ref={appShellRef} />
      <input data-testid="slider" ref={gallerySizeSliderRef} />
    </>
  );
};

describe('gallery scroll controller', () => {
  afterEach(() => {
    cleanup();
  });

  it('updates numeric state only after the configured epsilon', () => {
    expect(shouldUpdateNumericState(100, 100.5, 1.2)).toBe(false);
    expect(shouldUpdateNumericState(100, 101.3, 1.2)).toBe(true);
  });

  it('syncs gallery tile width to shell CSS and slider value', () => {
    const { getByTestId } = render(<Probe galleryTileMinWidth={188.4} />);

    expect(getByTestId('shell').style.getPropertyValue('--gallery-tile-min-width')).toBe(
      '188.4px',
    );
    expect((getByTestId('slider') as HTMLInputElement).value).toBe('188.4');
  });
});
