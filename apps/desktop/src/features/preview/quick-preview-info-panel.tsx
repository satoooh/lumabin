import type { AssetItem, AssetMetadata } from '../../shared/ipc';
import { QuickPreviewActionButton } from './quick-preview-action-button';
import {
  QuickPreviewSharingSection,
  type QuickPreviewSharingCommands,
  type QuickPreviewSharingViewModel,
} from './quick-preview-sharing-section';
import { QuickPreviewTechnicalDetails } from './quick-preview-technical-details';

interface QuickPreviewOverviewModel {
  selectedAsset: AssetItem;
  assetName: string;
  selectedProfileId: string;
  capturedAtLabel: string;
  cameraLabel: string;
  lensLabel: string;
  shootSettingsLabel: string;
}

interface QuickPreviewFormatters {
  formatDate: (value: string) => string;
  formatBytes: (value: number) => string;
}

interface QuickPreviewAssetManagementViewModel {
  isBusy: boolean;
}

interface QuickPreviewAssetManagementCommands {
  onOpenAssetRename: () => void;
  onOpenAssetMove: () => void;
  onOpenAssetDelete: () => void;
}

interface QuickPreviewMetadataViewModel {
  isAssetKeyCopied: boolean;
  isHeadBusy: boolean;
  selectedAssetMetadataError: string;
  selectedAssetMetadata: AssetMetadata | null;
}

interface QuickPreviewMetadataCommands {
  onCopyAssetKey: () => void;
  onRetryMetadata: () => void;
}

interface QuickPreviewInfoPanelProps {
  overview: QuickPreviewOverviewModel;
  formatters: QuickPreviewFormatters;
  sharing: QuickPreviewSharingViewModel;
  sharingCommands: QuickPreviewSharingCommands;
  assetManagement: QuickPreviewAssetManagementViewModel;
  assetManagementCommands: QuickPreviewAssetManagementCommands;
  metadata: QuickPreviewMetadataViewModel;
  metadataCommands: QuickPreviewMetadataCommands;
}

export const QuickPreviewInfoPanel = ({
  overview,
  formatters,
  sharing,
  sharingCommands,
  assetManagement,
  assetManagementCommands,
  metadata,
  metadataCommands,
}: QuickPreviewInfoPanelProps) => {
  const {
    selectedAsset,
    assetName,
    selectedProfileId,
    capturedAtLabel,
    cameraLabel,
    lensLabel,
    shootSettingsLabel,
  } = overview;
  const { formatDate, formatBytes } = formatters;
  const { isBusy: isAssetActionBusy } = assetManagement;
  const {
    onOpenAssetRename,
    onOpenAssetMove,
    onOpenAssetDelete,
  } = assetManagementCommands;
  const {
    isAssetKeyCopied,
    isHeadBusy,
    selectedAssetMetadataError,
    selectedAssetMetadata,
  } = metadata;
  const { onCopyAssetKey, onRetryMetadata } = metadataCommands;

  const captureDetails = [
    cameraLabel !== '-'
      ? { label: 'Camera', value: cameraLabel }
      : null,
    lensLabel !== '-'
      ? { label: 'Lens', value: lensLabel }
      : null,
    shootSettingsLabel !== '-'
      ? { label: 'Exposure', value: shootSettingsLabel }
      : null,
  ].filter((entry): entry is { label: string; value: string } => entry !== null);

  return (
    <aside className="quick-preview-info">
      <section className="quick-preview-section quick-preview-section--overview">
        <div className="quick-preview-overview-header">
          <p className="quick-preview-overview-eyebrow">Selected asset</p>
          <h3>{assetName}</h3>
          <p className="quick-preview-path" title={selectedAsset.key}>{selectedAsset.key}</p>
        </div>
        <div className="quick-preview-overview-grid">
          <div>
            <span>Captured</span>
            <strong>{capturedAtLabel}</strong>
          </div>
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
        </div>
      </section>

      <QuickPreviewSharingSection
        selectedProfileId={selectedProfileId}
        sharing={sharing}
        sharingCommands={sharingCommands}
      />

      {captureDetails.length > 0 ? (
        <section className="quick-preview-section">
          <h3>Capture details</h3>
          <div className="kv-list">
            {captureDetails.map((detail) => (
              <div key={detail.label}>
                <span>{detail.label}</span>
                <strong>{detail.value}</strong>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="quick-preview-section">
        <div className="quick-preview-section-heading">
          <h3>Manage asset</h3>
          <p>Rename, move, or delete.</p>
        </div>
        <div className="quick-preview-action-grid quick-preview-action-grid--manage">
          <QuickPreviewActionButton
            title="Rename asset"
            description="Keep the current location"
            disabled={isAssetActionBusy || !selectedProfileId}
            titleAttr="Rename asset..."
            onClick={onOpenAssetRename}
            icon={
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m4 20 4.5-1 10-10a1.6 1.6 0 0 0-2.2-2.2l-10 10L4 20z" />
                <path d="m13.5 6.5 4 4" />
              </svg>
            }
          />
          <QuickPreviewActionButton
            title="Move asset"
            description="Change prefix or folder"
            disabled={isAssetActionBusy || !selectedProfileId}
            titleAttr="Move asset..."
            onClick={onOpenAssetMove}
            icon={
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h12" />
                <path d="m12 8 4 4-4 4" />
                <path d="M4 6v12" />
              </svg>
            }
          />
          <QuickPreviewActionButton
            title="Delete asset"
            description="Confirm before removal"
            emphasis="danger"
            disabled={isAssetActionBusy || !selectedProfileId}
            titleAttr="Delete asset..."
            onClick={onOpenAssetDelete}
            icon={
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 7h14" />
                <path d="M9 7V5h6v2" />
                <path d="M8 9v9" />
                <path d="M12 9v9" />
                <path d="M16 9v9" />
                <path d="M7 18.5h10" />
              </svg>
            }
          />
        </div>
      </section>

      <QuickPreviewTechnicalDetails
        formatBytes={formatBytes}
        formatDate={formatDate}
        isAssetKeyCopied={isAssetKeyCopied}
        isHeadBusy={isHeadBusy}
        onCopyAssetKey={onCopyAssetKey}
        onRetryMetadata={onRetryMetadata}
        selectedAsset={selectedAsset}
        selectedAssetMetadata={selectedAssetMetadata}
        selectedAssetMetadataError={selectedAssetMetadataError}
      />
    </aside>
  );
};
