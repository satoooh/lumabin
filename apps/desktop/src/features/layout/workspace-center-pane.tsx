import type { ComponentProps } from 'react';
import { AssetListPane } from '../gallery/asset-list-pane';
import { EmptyBrowserState } from '../gallery/empty-browser-state';
import { GalleryPane } from '../gallery/gallery-pane';
import { GalleryTopRow } from '../gallery/gallery-top-row';
import { SelectionActionBar } from '../gallery/selection-action-bar';
import { GuidedStart } from '../onboarding/guided-start';

export interface WorkspaceCenterPaneProps {
  assetListPane: ComponentProps<typeof AssetListPane>;
  emptyState: ComponentProps<typeof EmptyBrowserState>;
  galleryPane: ComponentProps<typeof GalleryPane>;
  galleryTopRow: ComponentProps<typeof GalleryTopRow>;
  guidedStart: ComponentProps<typeof GuidedStart>;
  selectionActionBar: ComponentProps<typeof SelectionActionBar>;
  showGuidedStart: boolean;
  viewMode: 'gallery' | 'list';
  visibleItemCount: number;
}

export const WorkspaceCenterPane = ({
  assetListPane,
  emptyState,
  galleryPane,
  galleryTopRow,
  guidedStart,
  selectionActionBar,
  showGuidedStart,
  viewMode,
  visibleItemCount,
}: WorkspaceCenterPaneProps) => (
  <section className="center-pane">
    {showGuidedStart ? (
      <GuidedStart {...guidedStart} />
    ) : (
      <>
        <GalleryTopRow {...galleryTopRow} />
        <SelectionActionBar {...selectionActionBar} />

        <div className="browser-content">
          {visibleItemCount === 0 ? (
            <EmptyBrowserState {...emptyState} />
          ) : viewMode === 'gallery' ? (
            <GalleryPane {...galleryPane} />
          ) : (
            <AssetListPane {...assetListPane} />
          )}
        </div>
      </>
    )}
  </section>
);
