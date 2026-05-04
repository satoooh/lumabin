import type { AssetItem, AssetPreview } from '../../shared/ipc';

interface QuickPreviewMediaPanelProps {
  assetPreview: AssetPreview | null;
  assetPreviewError: string;
  basenameFromKey: (key: string) => string;
  hasNextPreviewImage: boolean;
  hasPrevPreviewImage: boolean;
  isPreviewBusy: boolean;
  isSharingBusy: boolean;
  onDownloadSelectedAsset: () => void;
  onImageDecodeError: () => void;
  onMoveSelection: (direction: -1 | 1) => void;
  onPdfNextPage: () => void;
  onPdfPrevPage: () => void;
  onRetryPreview: () => void;
  onVideoDecodeError: () => void;
  pdfPreviewPage: number;
  previewDataUrl: string;
  selectedAsset: AssetItem;
  selectedProfileId: string;
}

export const QuickPreviewMediaPanel = ({
  assetPreview,
  assetPreviewError,
  basenameFromKey,
  hasNextPreviewImage,
  hasPrevPreviewImage,
  isPreviewBusy,
  isSharingBusy,
  onDownloadSelectedAsset,
  onImageDecodeError,
  onMoveSelection,
  onPdfNextPage,
  onPdfPrevPage,
  onRetryPreview,
  onVideoDecodeError,
  pdfPreviewPage,
  previewDataUrl,
  selectedAsset,
  selectedProfileId,
}: QuickPreviewMediaPanelProps) => {
  if (assetPreviewError) {
    return (
      <div>
        <p className="error-text">{assetPreviewError}</p>
        <div className="row-actions">
          <button type="button" disabled={isPreviewBusy} onClick={onRetryPreview}>
            <span className="button-content">
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 12a8 8 0 1 1-2.3-5.7" />
                <path d="M20 4v6h-6" />
              </svg>
              <span>Retry preview</span>
            </span>
          </button>
          <button
            type="button"
            disabled={isSharingBusy || !selectedProfileId}
            onClick={onDownloadSelectedAsset}
          >
            <span className="button-content">
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v10" />
                <path d="m8 10 4 4 4-4" />
                <path d="M5 19h14" />
              </svg>
              <span>Download original</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (assetPreview?.kind === 'image' && previewDataUrl) {
    return (
      <>
        <img
          className="asset-image-lightbox"
          src={previewDataUrl}
          alt={selectedAsset.key}
          onError={onImageDecodeError}
        />
        <button
          type="button"
          className="image-nav-button image-nav-button--prev"
          aria-label="Previous asset"
          title="Previous asset (Left Arrow)"
          onClick={() => onMoveSelection(-1)}
          disabled={!hasPrevPreviewImage}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          <span className="sr-only">Previous asset</span>
        </button>
        <button
          type="button"
          className="image-nav-button image-nav-button--next"
          aria-label="Next asset"
          title="Next asset (Right Arrow)"
          onClick={() => onMoveSelection(1)}
          disabled={!hasNextPreviewImage}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
          <span className="sr-only">Next asset</span>
        </button>
      </>
    );
  }

  if (assetPreview?.kind === 'video' && previewDataUrl) {
    return (
      <video
        className="asset-video-lightbox"
        src={previewDataUrl}
        controls
        autoPlay
        playsInline
        onError={onVideoDecodeError}
      />
    );
  }

  if (assetPreview?.kind === 'pdf' && previewDataUrl) {
    return (
      <div className="asset-pdf-lightbox-wrap">
        <div className="asset-pdf-controls">
          <button type="button" onClick={onPdfPrevPage} disabled={pdfPreviewPage <= 1}>
            Prev page
          </button>
          <span className="minor">Page {pdfPreviewPage}</span>
          <button type="button" onClick={onPdfNextPage}>
            Next page
          </button>
        </div>
        <iframe
          className="asset-pdf-lightbox"
          src={`${previewDataUrl}#page=${pdfPreviewPage}&zoom=page-width`}
          title={basenameFromKey(selectedAsset.key)}
        />
        {assetPreview.truncated ? (
          <p className="minor">
            Preview is partial. Use Download for the full PDF if rendering looks incomplete.
          </p>
        ) : null}
      </div>
    );
  }

  if (isPreviewBusy) {
    return <p className="minor">Loading preview...</p>;
  }

  return (
    <div>
      <p className="minor">Preview unavailable.</p>
      <div className="row-actions">
        <button type="button" onClick={onRetryPreview}>
          <span className="button-content">
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.3-5.7" />
              <path d="M20 4v6h-6" />
            </svg>
            <span>Retry preview</span>
          </span>
        </button>
      </div>
    </div>
  );
};
