import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useQuickPreviewLifecycle } from '../../src/features/preview/use-quick-preview-lifecycle';
import type { AssetItem } from '../../src/shared/ipc';

const imageAsset: AssetItem = {
  contentType: 'image/png',
  etag: 'etag-image',
  key: 'photos/image.png',
  lastModified: '2026-05-02T00:00:00.000Z',
  size: 1024,
};

interface ProbeProps {
  isConnectionSetupOpen?: boolean;
  isPreviewableKind?: (kind: 'image' | 'video' | 'pdf' | 'csv' | 'other') => boolean;
  isQuickPreviewOpen?: boolean;
  isSelectionMode?: boolean;
  markAssetAsRecentlyViewed?: (profileId: string, assetKey: string) => void;
  resetQuickPreviewGeometry?: () => void;
  selectedAsset?: AssetItem;
  selectedAssetKey?: string;
  selectedProfileId?: string;
  setIsQuickPreviewInfoOpen?: (value: boolean) => void;
  setIsQuickPreviewOpen?: (value: boolean) => void;
  setPresignedGetUrl?: (value: string) => void;
  setPresignedPutUrl?: (value: string) => void;
}

const Probe = ({
  isConnectionSetupOpen = false,
  isPreviewableKind = (kind) => kind === 'image',
  isQuickPreviewOpen = true,
  isSelectionMode = false,
  markAssetAsRecentlyViewed = vi.fn(),
  resetQuickPreviewGeometry = vi.fn(),
  selectedAsset = imageAsset,
  selectedAssetKey = 'photos/image.png',
  selectedProfileId = 'profile-1',
  setIsQuickPreviewInfoOpen = vi.fn(),
  setIsQuickPreviewOpen = vi.fn(),
  setPresignedGetUrl = vi.fn(),
  setPresignedPutUrl = vi.fn(),
}: ProbeProps) => {
  useQuickPreviewLifecycle({
    inferAssetKind: () => 'image',
    isConnectionSetupOpen,
    isPreviewableKind,
    isQuickPreviewOpen,
    isSelectionMode,
    markAssetAsRecentlyViewed,
    resetQuickPreviewGeometry,
    selectedAsset,
    selectedAssetKey,
    selectedProfileId,
    setIsQuickPreviewInfoOpen,
    setIsQuickPreviewOpen,
    setPresignedGetUrl,
    setPresignedPutUrl,
  });
  return null;
};

describe('quick preview lifecycle', () => {
  afterEach(() => {
    cleanup();
  });

  it('closes the preview when the selected asset key disappears', () => {
    const setIsQuickPreviewOpen = vi.fn();

    render(
      <Probe
        selectedAssetKey=""
        setIsQuickPreviewOpen={setIsQuickPreviewOpen}
      />,
    );

    expect(setIsQuickPreviewOpen).toHaveBeenCalledWith(false);
  });

  it('resets preview geometry after the preview closes', () => {
    const resetQuickPreviewGeometry = vi.fn();

    render(
      <Probe
        isQuickPreviewOpen={false}
        resetQuickPreviewGeometry={resetQuickPreviewGeometry}
      />,
    );

    expect(resetQuickPreviewGeometry).toHaveBeenCalledTimes(1);
  });

  it('marks the selected asset as recently viewed while preview is open', () => {
    const markAssetAsRecentlyViewed = vi.fn();

    render(<Probe markAssetAsRecentlyViewed={markAssetAsRecentlyViewed} />);

    expect(markAssetAsRecentlyViewed).toHaveBeenCalledWith(
      'profile-1',
      'photos/image.png',
    );
  });

  it('shows preview details and closes invalid preview assets', () => {
    const setIsQuickPreviewInfoOpen = vi.fn();
    const setIsQuickPreviewOpen = vi.fn();

    render(
      <Probe
        isPreviewableKind={() => false}
        setIsQuickPreviewInfoOpen={setIsQuickPreviewInfoOpen}
        setIsQuickPreviewOpen={setIsQuickPreviewOpen}
      />,
    );

    expect(setIsQuickPreviewInfoOpen).toHaveBeenCalledWith(true);
    expect(setIsQuickPreviewOpen).toHaveBeenCalledWith(false);
  });

  it('closes preview during selection mode or connection setup', () => {
    const selectionClose = vi.fn();
    const setupClose = vi.fn();

    render(<Probe isSelectionMode={true} setIsQuickPreviewOpen={selectionClose} />);
    cleanup();
    render(<Probe isConnectionSetupOpen={true} setIsQuickPreviewOpen={setupClose} />);

    expect(selectionClose).toHaveBeenCalledWith(false);
    expect(setupClose).toHaveBeenCalledWith(false);
  });

  it('clears presigned URLs when the selected key changes', () => {
    const setPresignedGetUrl = vi.fn();
    const setPresignedPutUrl = vi.fn();
    const { rerender } = render(
      <Probe
        setPresignedGetUrl={setPresignedGetUrl}
        setPresignedPutUrl={setPresignedPutUrl}
      />,
    );

    rerender(
      <Probe
        selectedAssetKey="photos/next.png"
        setPresignedGetUrl={setPresignedGetUrl}
        setPresignedPutUrl={setPresignedPutUrl}
      />,
    );

    expect(setPresignedGetUrl).toHaveBeenCalledWith('');
    expect(setPresignedPutUrl).toHaveBeenCalledWith('');
    expect(setPresignedGetUrl).toHaveBeenCalledTimes(2);
    expect(setPresignedPutUrl).toHaveBeenCalledTimes(2);
  });
});
