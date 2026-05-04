import { cleanup, render, waitFor } from '@testing-library/react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  calculateGalleryAssetTargetTop,
  calculateListAssetTargetTop,
  useAssetFocusController,
  type AssetFocusController,
  type GalleryGridLocation,
} from '../../src/features/gallery/use-asset-focus-controller';
import type { GalleryVirtualSection } from '../../src/features/gallery/use-gallery-view-model';
import type { AssetItem } from '../../src/shared/ipc';

const createAsset = (key: string): AssetItem => ({
  contentType: 'image/png',
  etag: `${key}-etag`,
  key,
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 1,
});

const createScrollNode = (clientHeight: number): HTMLDivElement => {
  const node = document.createElement('div');
  Object.defineProperty(node, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  });
  node.scrollTo = vi.fn();
  return node;
};

const createSection = (overrides: Partial<GalleryVirtualSection>): GalleryVirtualSection => ({
  bottomOffset: 0,
  estimatedHeight: 0,
  items: [],
  key: '2026-05-03',
  label: 'May 3, 2026',
  startIndex: 0,
  topOffset: 0,
  ...overrides,
});

interface ProbeProps {
  galleryColumnCount?: number;
  galleryGridLocationByKey?: Map<string, GalleryGridLocation>;
  galleryNode?: HTMLDivElement | null;
  galleryTileHeight?: number;
  galleryViewportHeight?: number;
  galleryVirtualSections?: GalleryVirtualSection[];
  listNode?: HTMLDivElement | null;
  listViewportHeight?: number;
  onReady: (controller: AssetFocusController) => void;
  viewMode?: 'gallery' | 'list';
  visibleItems?: AssetItem[];
}

const Probe = ({
  galleryColumnCount = 3,
  galleryGridLocationByKey = new Map(),
  galleryNode = null,
  galleryTileHeight = 120,
  galleryViewportHeight = 200,
  galleryVirtualSections = [],
  listNode = null,
  listViewportHeight = 400,
  onReady,
  viewMode = 'gallery',
  visibleItems = [],
}: ProbeProps) => {
  const controller = useAssetFocusController({
    galleryColumnCount,
    galleryDayHeaderHeightPx: 32,
    galleryGridGapPx: 12,
    galleryGridLocationByKey,
    galleryScrollRef: { current: galleryNode },
    galleryTileHeight,
    galleryViewportHeight,
    galleryVirtualSections,
    listContainerRef: { current: listNode },
    listRowHeightPx: 40,
    listViewportHeight,
    viewMode,
    visibleItems,
  });

  onReady(controller);
  return null;
};

describe('useAssetFocusController', () => {
  afterEach(() => {
    cleanup();
  });

  it('tracks asset item refs and restores focus without scrolling the page', async () => {
    let controller: AssetFocusController | undefined;
    render(<Probe onReady={(next) => {
      controller = next;
    }} />);

    await waitFor(() => expect(controller).toBeDefined());

    const button = document.createElement('button');
    const focus = vi.spyOn(button, 'focus').mockImplementation(() => undefined);
    button.scrollIntoView = vi.fn();

    controller?.setAssetItemRef('photos/a.png', button);
    expect(controller?.focusAssetItemByKey('photos/a.png')).toBe(true);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(button.scrollIntoView).toHaveBeenCalledWith({
      block: 'nearest',
      inline: 'nearest',
    });

    controller?.setAssetItemRef('photos/a.png', null);
    expect(controller?.focusAssetItemByKey('photos/a.png')).toBe(false);
  });

  it('scrolls list mode to the selected asset row', async () => {
    let controller: AssetFocusController | undefined;
    const listNode = createScrollNode(400);
    const visibleItems = Array.from({ length: 8 }, (_, index) => createAsset(`asset-${index}`));

    render(
      <Probe
        listNode={listNode}
        onReady={(next) => {
          controller = next;
        }}
        viewMode="list"
        visibleItems={visibleItems}
      />,
    );

    await waitFor(() => expect(controller).toBeDefined());

    expect(controller?.scrollToAssetInCurrentView('asset-5', 'smooth')).toBe(true);
    expect(listNode.scrollTo).toHaveBeenCalledWith({
      top: calculateListAssetTargetTop(5, 40, 400),
      behavior: 'smooth',
    });
    expect(controller?.scrollToAssetInCurrentView('missing')).toBe(false);
  });

  it('scrolls gallery mode to the selected asset tile row', async () => {
    let controller: AssetFocusController | undefined;
    const galleryNode = createScrollNode(200);
    const locationByKey = new Map<string, GalleryGridLocation>([
      ['photos/target.png', { localIndex: 7, sectionIndex: 0, sectionStartIndex: 0 }],
    ]);

    render(
      <Probe
        galleryGridLocationByKey={locationByKey}
        galleryNode={galleryNode}
        galleryVirtualSections={[createSection({ topOffset: 100 })]}
        onReady={(next) => {
          controller = next;
        }}
        viewMode="gallery"
      />,
    );

    await waitFor(() => expect(controller).toBeDefined());

    expect(controller?.scrollToAssetInCurrentView('photos/target.png')).toBe(true);
    expect(galleryNode.scrollTo).toHaveBeenCalledWith({
      top: calculateGalleryAssetTargetTop({
        columnCount: 3,
        dayHeaderHeightPx: 32,
        gridGapPx: 12,
        localIndex: 7,
        sectionTopOffset: 100,
        tileHeight: 120,
        viewportHeight: 200,
      }),
      behavior: 'auto',
    });
    expect(controller?.scrollToAssetInCurrentView('missing.png')).toBe(false);
  });
});
