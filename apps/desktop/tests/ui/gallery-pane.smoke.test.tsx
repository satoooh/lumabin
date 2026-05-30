import { cleanup, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GalleryPane } from '../../src/features/gallery/gallery-pane';
import type { AssetItem } from '../../src/shared/ipc';

const asset: AssetItem = {
  key: 'photos/sunset-hero.png',
  size: 2048,
  contentType: 'image/png',
  lastModified: '2026-05-03T00:00:00.000Z',
  etag: 'etag',
};

describe('gallery pane', () => {
  afterEach(() => {
    cleanup();
  });

  const renderGalleryPane = (
    overrides: Partial<Parameters<typeof GalleryPane>[0]> = {},
  ) => {
    const props: Parameters<typeof GalleryPane>[0] = {
      galleryScrollRef: createRef<HTMLDivElement>(),
      onGalleryScroll: vi.fn(),
      isGalleryScrolling: false,
      galleryVirtualRange: { topSpacerHeight: 0, bottomSpacerHeight: 0 },
      visibleGallerySections: [{ key: '2026-05-03', label: 'May 3, 2026', items: [asset] }],
      galleryColumnCount: 4,
      galleryDaySectionCount: 1,
      selectedProfileId: 'profile-1',
      selectedAssetKey: '',
      selectedAssetKeySet: new Set(),
      isQuickPreviewOpen: false,
      isSelectionMode: false,
      galleryRovingAssetKey: asset.key,
      galleryThumbnails: { 'profile-1:photos/sunset-hero.png': 'blob:thumb' },
      galleryThumbnailLoading: {},
      galleryThumbnailErrors: {},
      inferAssetKind: () => 'image',
      iconForKind: () => 'IMG',
      basenameFromKey: (key) => key.split('/').at(-1) ?? key,
      formatBytes: (value) => `${value} bytes`,
      formatDate: () => 'May 3, 2026',
      toThumbnailCacheKey: (profileId, key) => `${profileId}:${key}`,
      setAssetItemRef: vi.fn(),
      onAssetFocus: vi.fn(),
      onAssetClick: vi.fn(),
      onThumbnailDecodeError: vi.fn(),
      ...overrides,
    };

    return render(<GalleryPane {...props} />);
  };

  it('shows asset identity on gallery cards', () => {
    renderGalleryPane();

    const card = screen.getByRole('button', {
      name: 'sunset-hero.png, image, 2048 bytes',
    });

    expect(within(card).getByText('sunset-hero.png')).not.toBeNull();
    expect(within(card).getByText('IMG')).not.toBeNull();
    expect(within(card).getByText('2048 bytes')).not.toBeNull();
    expect(screen.getByText('1 items')).not.toBeNull();
  });

  it('keeps rendered thumbnails eager because the gallery already virtualizes visible cards', () => {
    const { container } = renderGalleryPane();

    expect(container.querySelector('img')?.getAttribute('loading')).toBe('eager');
  });

  it('avoids animated loading skeletons while the gallery is actively scrolling', () => {
    const { container } = renderGalleryPane({
      isGalleryScrolling: true,
      galleryThumbnails: {},
      galleryThumbnailLoading: {
        'profile-1:photos/sunset-hero.png': true,
      },
    });

    expect(container.querySelector('.gallery-card-skeleton')).toBeNull();
    expect(screen.getAllByText('IMG').length).toBeGreaterThan(0);
  });
});
