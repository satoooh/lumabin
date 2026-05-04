import type { AssetItem, AssetMetadata } from '../../shared/ipc';

interface QuickPreviewTechnicalDetailsProps {
  selectedAsset: AssetItem;
  formatDate: (value: string) => string;
  formatBytes: (value: number) => string;
  onCopyAssetKey: () => void;
  isAssetKeyCopied: boolean;
  isHeadBusy: boolean;
  onRetryMetadata: () => void;
  selectedAssetMetadataError: string;
  selectedAssetMetadata: AssetMetadata | null;
}

const CopyIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="9" y="9" width="10" height="10" rx="1.5" />
    <path d="M5 15V5a1 1 0 0 1 1-1h10" />
  </svg>
);

export const QuickPreviewTechnicalDetails = ({
  selectedAsset,
  formatDate,
  formatBytes,
  onCopyAssetKey,
  isAssetKeyCopied,
  isHeadBusy,
  onRetryMetadata,
  selectedAssetMetadataError,
  selectedAssetMetadata,
}: QuickPreviewTechnicalDetailsProps) => {
  const objectMetadataEntries = selectedAssetMetadata
    ? Object.entries(selectedAssetMetadata.metadata)
    : [];

  return (
    <details className="quick-preview-collapsible">
      <summary>
        <span>Technical details</span>
        {isHeadBusy ? (
          <span className="pill">Loading...</span>
        ) : objectMetadataEntries.length > 0 ? (
          <span className="pill pill--neutral">{objectMetadataEntries.length} fields</span>
        ) : null}
      </summary>
      <div className="quick-preview-collapsible-body">
        <div className="kv-list compact-kv">
          <div>
            <span>Modified</span>
            <strong>{formatDate(selectedAsset.lastModified)}</strong>
          </div>
          <div>
            <span>Type</span>
            <strong>{selectedAsset.contentType}</strong>
          </div>
          <div>
            <span>Size</span>
            <strong>{formatBytes(selectedAsset.size)}</strong>
          </div>
          <div>
            <span>ETag</span>
            <strong>{selectedAsset.etag || '-'}</strong>
          </div>
        </div>
        <p className="quick-preview-key" title={selectedAsset.key}>{selectedAsset.key}</p>
        <div className="row-actions">
          <button type="button" onClick={onCopyAssetKey}>
            <span className="button-content">
              <CopyIcon />
              <span>{isAssetKeyCopied ? 'Copied!' : 'Copy key'}</span>
            </span>
          </button>
        </div>
        {selectedAssetMetadataError ? (
          <>
            <p className="error-text">{selectedAssetMetadataError}</p>
            <div className="row-actions">
              <button type="button" disabled={isHeadBusy} onClick={onRetryMetadata}>
                <span className="button-content">
                  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 12a8 8 0 1 1-2.3-5.7" />
                    <path d="M20 4v6h-6" />
                  </svg>
                  <span>Retry metadata</span>
                </span>
              </button>
            </div>
          </>
        ) : selectedAssetMetadata ? (
          <>
            <div className="kv-list compact-kv">
              <div>
                <span>Reported Size</span>
                <strong>{formatBytes(selectedAssetMetadata.size)}</strong>
              </div>
              <div>
                <span>Reported Type</span>
                <strong>{selectedAssetMetadata.contentType}</strong>
              </div>
            </div>
            <ul className="metadata-list">
              {objectMetadataEntries.length > 0 ? (
                objectMetadataEntries.map(([key, value]) => (
                  <li key={key}>
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </li>
                ))
              ) : (
                <li className="empty">No metadata.</li>
              )}
            </ul>
          </>
        ) : (
          <p className="minor">Metadata not loaded.</p>
        )}
      </div>
    </details>
  );
};
