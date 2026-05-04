import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';
import type { AssetItem } from '../../shared/ipc';

type AssetKind = 'image' | 'video' | 'pdf' | 'csv' | 'other';

interface GallerySection {
  key: string;
  label: string;
  items: AssetItem[];
}

interface GalleryVirtualRange {
  topSpacerHeight: number;
  bottomSpacerHeight: number;
}

interface GalleryPaneProps {
  galleryScrollRef: RefObject<HTMLDivElement | null>;
  onGalleryScroll: (scrollTop: number) => void;
  isGalleryScrolling: boolean;
  galleryVirtualRange: GalleryVirtualRange;
  visibleGallerySections: GallerySection[];
  galleryColumnCount: number;
  galleryDaySectionCount: number;
  selectedProfileId: string;
  selectedAssetKey: string;
  selectedAssetKeySet: Set<string>;
  isQuickPreviewOpen: boolean;
  isSelectionMode: boolean;
  galleryRovingAssetKey: string;
  galleryThumbnails: Record<string, string>;
  galleryThumbnailLoading: Record<string, boolean>;
  galleryThumbnailErrors: Record<string, boolean>;
  inferAssetKind: (item: AssetItem) => AssetKind;
  iconForKind: (kind: AssetKind) => string;
  basenameFromKey: (key: string) => string;
  toThumbnailCacheKey: (profileId: string, key: string) => string;
  setAssetItemRef: (key: string, node: HTMLButtonElement | null) => void;
  onAssetFocus: (key: string) => void;
  onAssetClick: (
    event: ReactMouseEvent<HTMLButtonElement>,
    item: AssetItem,
    options: { thumbnailCacheKey?: string; hasThumbnailError: boolean },
  ) => void;
  onThumbnailDecodeError: (cacheKey: string) => void;
}

export const GalleryPane = ({
  galleryScrollRef,
  onGalleryScroll,
  isGalleryScrolling,
  galleryVirtualRange,
  visibleGallerySections,
  galleryColumnCount,
  galleryDaySectionCount,
  selectedProfileId,
  selectedAssetKey,
  selectedAssetKeySet,
  isQuickPreviewOpen,
  isSelectionMode,
  galleryRovingAssetKey,
  galleryThumbnails,
  galleryThumbnailLoading,
  galleryThumbnailErrors,
  inferAssetKind,
  iconForKind,
  basenameFromKey,
  toThumbnailCacheKey,
  setAssetItemRef,
  onAssetFocus,
  onAssetClick,
  onThumbnailDecodeError,
}: GalleryPaneProps) => {
  return (
    <div className={`gallery-pane ${isGalleryScrolling ? 'gallery-pane--scrolling' : ''}`.trim()}>
      <div
        className={`gallery-scroll ${isGalleryScrolling ? 'gallery-scroll--active' : ''}`.trim()}
        ref={galleryScrollRef}
        onScroll={(event) => {
          onGalleryScroll(event.currentTarget.scrollTop);
        }}
      >
        <div className="gallery-grid">
          <div style={{ height: galleryVirtualRange.topSpacerHeight }} />
          {visibleGallerySections.map((section, sectionIndex) => (
            <section key={section.key} className="gallery-day-group">
              <div className="gallery-day-header">
                <h3>{section.label}</h3>
              </div>

              <div
                className="gallery-grid-inner"
                style={{
                  gridTemplateColumns: `repeat(${galleryColumnCount}, minmax(0, 1fr))`,
                }}
              >
                {section.items.map((item, itemIndex) => {
                  const kind = inferAssetKind(item);
                  const isSelected = isSelectionMode
                    ? selectedAssetKeySet.has(item.key)
                    : item.key === selectedAssetKey;
                  const cacheKey = selectedProfileId
                    ? toThumbnailCacheKey(selectedProfileId, item.key)
                    : '';
                  const thumbnailUrl = cacheKey ? galleryThumbnails[cacheKey] : '';
                  const isThumbnailLoading = cacheKey
                    ? Boolean(galleryThumbnailLoading[cacheKey])
                    : false;
                  const hasThumbnailError = cacheKey
                    ? Boolean(galleryThumbnailErrors[cacheKey])
                    : false;
                  const placeholderLabel = isThumbnailLoading
                    ? '…'
                    : kind === 'image' || kind === 'video'
                      ? ''
                      : iconForKind(kind);

                  return (
                    <button
                      type="button"
                      key={item.key}
                      ref={(node) => setAssetItemRef(item.key, node)}
                      className={`gallery-card ${isSelected ? 'gallery-card--selected' : ''} ${
                        isQuickPreviewOpen && item.key === selectedAssetKey
                          ? 'gallery-card--preview-active'
                          : ''
                      }`.trim()}
                      tabIndex={item.key === galleryRovingAssetKey ? 0 : -1}
                      onFocus={() => {
                        if (isSelectionMode) {
                          onAssetFocus(item.key);
                        }
                      }}
                      onClick={(event) =>
                        onAssetClick(event, item, {
                          thumbnailCacheKey: cacheKey || undefined,
                          hasThumbnailError,
                        })
                      }
                    >
                      <div className="gallery-card-media">
                        {thumbnailUrl ? (
                          <img
                            className="gallery-card-image"
                            src={thumbnailUrl}
                            alt={basenameFromKey(item.key)}
                            loading={sectionIndex === 0 && itemIndex < 6 ? 'eager' : 'lazy'}
                            decoding="async"
                            draggable={false}
                            onError={() => {
                              if (!cacheKey) {
                                return;
                              }
                              onThumbnailDecodeError(cacheKey);
                            }}
                          />
                        ) : (
                          <div
                            className={`gallery-card-placeholder ${
                              isThumbnailLoading ? 'gallery-card-placeholder--loading' : ''
                            }`}
                          >
                            {isThumbnailLoading ? (
                              <span className="gallery-card-skeleton" aria-hidden="true">
                                <span className="gallery-card-skeleton-dot" />
                                <span className="gallery-card-skeleton-chip" />
                              </span>
                            ) : (
                              <>
                                {placeholderLabel ? <span>{placeholderLabel}</span> : null}
                                {hasThumbnailError ? (
                                  <small>Preview failed. Click to retry</small>
                                ) : null}
                              </>
                            )}
                          </div>
                        )}
                        {isSelected ? (
                          <span className="gallery-card-selection-indicator" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M6.5 12.5 10.3 16.3 17.5 8.9" />
                            </svg>
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          <div style={{ height: galleryVirtualRange.bottomSpacerHeight }} />

          {galleryDaySectionCount === 0 ? (
            <div className="empty-state">
              <p>No items in this filter.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
