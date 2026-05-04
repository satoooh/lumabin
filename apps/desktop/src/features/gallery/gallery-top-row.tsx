import type { RefObject } from 'react';
import { ActiveQuerySummary } from './active-query-summary';
import { UnifiedFilterBar } from './filter-bars';

interface GalleryTopRowProps {
  viewMode: 'gallery' | 'list';
  unifiedFilterOptions: Array<{
    id: string;
    label: string;
    count: number;
    tone?: 'default' | 'kind' | 'smart';
  }>;
  activeUnifiedFilterId: string;
  onSelectUnifiedFilter: (id: string) => void;
  activeKindLabel: string;
  activeSmartCollectionLabel: string;
  activeSearchQuery: string;
  onClearSearch: () => void;
  onResetFilters: () => void;
  gallerySizeSliderRef: RefObject<HTMLInputElement | null>;
  galleryTileMinWidthMin: number;
  galleryTileMinWidthMax: number;
  galleryTileMinWidthStep: number;
  galleryTileMinWidth: number;
  onGalleryTileMinWidthInput: (value: number) => void;
  onGalleryTileMinWidthCommit: () => void;
  onGalleryTileMinWidthReset: () => void;
  onSetViewMode: (mode: 'gallery' | 'list') => void;
  isSelectionMode: boolean;
  selectedAssetCount: number;
  onToggleSelectionMode: () => void;
}

export const GalleryTopRow = ({
  viewMode,
  unifiedFilterOptions,
  activeUnifiedFilterId,
  onSelectUnifiedFilter,
  activeKindLabel,
  activeSmartCollectionLabel,
  activeSearchQuery,
  onClearSearch,
  onResetFilters,
  gallerySizeSliderRef,
  galleryTileMinWidthMin,
  galleryTileMinWidthMax,
  galleryTileMinWidthStep,
  galleryTileMinWidth,
  onGalleryTileMinWidthInput,
  onGalleryTileMinWidthCommit,
  onGalleryTileMinWidthReset,
  onSetViewMode,
  isSelectionMode,
  selectedAssetCount,
  onToggleSelectionMode,
}: GalleryTopRowProps) => {
  return (
    <div className="gallery-top-row">
      {viewMode === 'gallery' ? (
        <div className="gallery-top-leading">
          <UnifiedFilterBar
            className="gallery-filter-rail"
            options={unifiedFilterOptions}
            activeId={activeUnifiedFilterId}
            onSelect={onSelectUnifiedFilter}
          />
        </div>
      ) : null}
      <div className="gallery-top-controls" role="toolbar" aria-label="Gallery controls">
        {viewMode === 'gallery' ? (
          <ActiveQuerySummary
            mode="compact"
            searchQuery={activeSearchQuery}
            activeKindLabel={activeKindLabel}
            activeSmartCollectionLabel={activeSmartCollectionLabel}
            onClearSearch={onClearSearch}
            onResetFilters={onResetFilters}
          />
        ) : null}

        {viewMode === 'gallery' ? (
          <div className="gallery-size-control">
            <label htmlFor="gallery-size-slider" className="sr-only">
              Gallery tile size
            </label>
            <input
              ref={gallerySizeSliderRef}
              id="gallery-size-slider"
              type="range"
              min={galleryTileMinWidthMin}
              max={galleryTileMinWidthMax}
              step={galleryTileMinWidthStep}
              defaultValue={galleryTileMinWidth}
              onInput={(event) => {
                onGalleryTileMinWidthInput(Number(event.currentTarget.value));
              }}
              onPointerUp={onGalleryTileMinWidthCommit}
              onKeyUp={onGalleryTileMinWidthCommit}
              onBlur={onGalleryTileMinWidthCommit}
              onDoubleClick={onGalleryTileMinWidthReset}
              aria-label="Gallery tile size"
              title="Tile size (Cmd/Ctrl +/-), double-click to reset"
            />
          </div>
        ) : null}

        <div className="view-mode-segment" role="group" aria-label="View mode">
          <button
            type="button"
            className={`segment-chip ${viewMode === 'gallery' ? 'segment-chip--active' : ''}`}
            onClick={() => onSetViewMode('gallery')}
            aria-pressed={viewMode === 'gallery'}
          >
            Gallery
          </button>
          <button
            type="button"
            className={`segment-chip ${viewMode === 'list' ? 'segment-chip--active' : ''}`}
            onClick={() => onSetViewMode('list')}
            aria-pressed={viewMode === 'list'}
          >
            List
          </button>
        </div>

        <button
          type="button"
          className={`selection-toggle-button ${isSelectionMode ? 'selection-toggle-button--active' : ''}`}
          onClick={onToggleSelectionMode}
          aria-pressed={isSelectionMode}
          title={isSelectionMode ? 'Exit selection mode' : 'Selection mode'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {isSelectionMode ? (
              <path d="M6 12.5l4 4 8-9" />
            ) : (
              <>
                <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.2" />
                <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.2" />
                <rect x="4.5" y="13" width="6.5" height="6.5" rx="1.2" />
              </>
            )}
          </svg>
          {isSelectionMode && selectedAssetCount > 0 ? (
            <span className="selection-toggle-count" aria-hidden="true">
              {selectedAssetCount}
            </span>
          ) : null}
          <span>{isSelectionMode ? 'Done' : 'Select'}</span>
        </button>
      </div>
    </div>
  );
};
