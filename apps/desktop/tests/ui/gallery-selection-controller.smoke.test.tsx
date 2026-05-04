import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import {
  isAssetKeyVisible,
  toggleAssetKeySelection,
  useGallerySelectionController,
} from '../../src/features/gallery/use-gallery-selection-controller';
import type { AssetItem } from '../../src/shared/ipc';

const visibleItems: AssetItem[] = [
  {
    contentType: 'image/png',
    etag: 'etag-a',
    key: 'photos/a.png',
    lastModified: '2026-05-02T00:00:00.000Z',
    size: 100,
  },
  {
    contentType: 'text/plain',
    etag: 'etag-b',
    key: 'docs/b.txt',
    lastModified: '2026-05-02T00:00:00.000Z',
    size: 200,
  },
];

interface ProbeProps {
  isSelectionMode?: boolean;
  onControllerReady?: (controller: ReturnType<typeof useGallerySelectionController>) => void;
  openQuickPreviewForItem?: (item: AssetItem) => void;
  selectedAssetKey?: string;
  setSelectedAssetKey: (value: string) => void;
}

const Probe = ({
  isSelectionMode = false,
  onControllerReady,
  openQuickPreviewForItem = vi.fn(),
  selectedAssetKey = '',
  setSelectedAssetKey,
}: ProbeProps) => {
  const controller = useGallerySelectionController({
    inferAssetKind: (item) => (item.contentType.startsWith('image/') ? 'image' : 'other'),
    isPreviewableKind: (kind) => kind === 'image',
    isSelectionMode,
    openQuickPreviewForItem,
    requestThumbnailRetry: vi.fn(),
    setIsSelectionMode: vi.fn(),
    setSelectedAssetKey,
    setSelectedAssetKeys: vi.fn(),
    setStatusLine: vi.fn(),
    selectedAssetKey,
    visibleItems,
  });

  useEffect(() => {
    onControllerReady?.(controller);
    controller.handleSelectAllVisible();
  }, [controller, onControllerReady]);

  return null;
};

describe('gallery selection controller', () => {
  afterEach(() => {
    cleanup();
  });

  it('toggles asset keys in the current selection', () => {
    expect(toggleAssetKeySelection(['photos/a.png'], 'docs/b.txt')).toEqual([
      'photos/a.png',
      'docs/b.txt',
    ]);
    expect(toggleAssetKeySelection(['photos/a.png', 'docs/b.txt'], 'photos/a.png')).toEqual([
      'docs/b.txt',
    ]);
  });

  it('detects whether a selected key is still visible', () => {
    expect(isAssetKeyVisible('photos/a.png', visibleItems)).toBe(true);
    expect(isAssetKeyVisible('missing.png', visibleItems)).toBe(false);
  });

  it('clears the selected key when it is no longer visible', () => {
    const setSelectedAssetKey = vi.fn();

    render(<Probe selectedAssetKey="missing.png" setSelectedAssetKey={setSelectedAssetKey} />);

    expect(setSelectedAssetKey).toHaveBeenCalledWith('');
  });

  it('routes list double click to preview only for previewable assets outside selection mode', () => {
    const openQuickPreviewForItem = vi.fn();
    let controller: ReturnType<typeof useGallerySelectionController> | undefined;

    render(
      <Probe
        onControllerReady={(nextController) => {
          controller = nextController;
        }}
        openQuickPreviewForItem={openQuickPreviewForItem}
        setSelectedAssetKey={vi.fn()}
      />,
    );

    controller?.handleAssetItemDoubleClick(visibleItems[0]);
    controller?.handleAssetItemDoubleClick(visibleItems[1]);

    expect(openQuickPreviewForItem).toHaveBeenCalledTimes(1);
    expect(openQuickPreviewForItem).toHaveBeenCalledWith(visibleItems[0]);
  });

  it('does not open preview on list double click while selection mode is active', () => {
    const openQuickPreviewForItem = vi.fn();
    let controller: ReturnType<typeof useGallerySelectionController> | undefined;

    render(
      <Probe
        isSelectionMode={true}
        onControllerReady={(nextController) => {
          controller = nextController;
        }}
        openQuickPreviewForItem={openQuickPreviewForItem}
        setSelectedAssetKey={vi.fn()}
      />,
    );

    controller?.handleAssetItemDoubleClick(visibleItems[0]);

    expect(openQuickPreviewForItem).not.toHaveBeenCalled();
  });
});
