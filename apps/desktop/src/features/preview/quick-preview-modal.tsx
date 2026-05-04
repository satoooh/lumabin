import type { CSSProperties } from 'react';
import { QuickPreviewInfoPanel } from './quick-preview-info-panel';
import { QuickPreviewMediaPanel } from './quick-preview-media-panel';
import type { QuickPreviewModalProps } from './quick-preview-modal-contracts';
import { QuickPreviewTopbar } from './quick-preview-topbar';
import { useQuickPreviewCloseAnimation } from './use-quick-preview-close-animation';

export const QuickPreviewModal = ({
  isOpen,
  selectedAsset,
  animation,
  assetManagement,
  assetManagementCommands,
  formatters,
  media,
  metadata,
  metadataCommands,
  navigation,
  sharing,
  sharingCommands,
}: QuickPreviewModalProps) => {
  const {
    onClose,
    previewOrigin,
    previewSourceRect,
    resolveCloseTargetRect,
  } = animation;
  const {
    hasNextPreviewImage,
    hasPrevPreviewImage,
    isQuickPreviewInfoOpen,
    onMoveSelection,
    onToggleInfoOpen,
    previewMediaItemsCount,
    selectedPreviewItemIndex,
  } = navigation;
  const {
    assetPreview,
    assetPreviewError,
    isPreviewBusy,
    onImageDecodeError,
    onPdfNextPage,
    onPdfPrevPage,
    onRetryPreview,
    onVideoDecodeError,
    pdfPreviewPage,
    previewDataUrl,
  } = media;
  const {
    isPresignedGetCopied,
    isPresignedPutCopied,
    isPublicUrlCopied,
    isShareUrlCopied,
    isSharingBusy,
    presignedGetUrl,
    presignedPutUrl,
    publicUrlForSelectedAsset,
    selectedProfileId,
  } = sharing;
  const {
    onCopyPresignedGetUrl,
    onCopyPresignedPutUrl,
    onCopyPublicUrl,
    onCreatePresignedPut,
    onDownloadSelectedAsset,
    onShareSelectedAsset,
  } = sharingCommands;
  const { isAssetActionBusy } = assetManagement;
  const {
    onOpenAssetDelete,
    onOpenAssetMove,
    onOpenAssetRename,
  } = assetManagementCommands;
  const {
    cameraLabel,
    capturedAtLabel,
    isAssetKeyCopied,
    isHeadBusy,
    lensLabel,
    selectedAssetMetadata,
    selectedAssetMetadataError,
    shootSettingsLabel,
  } = metadata;
  const {
    onCopyAssetKey,
    onRetryMetadata,
  } = metadataCommands;
  const {
    basenameFromKey,
    formatBytes,
    formatDate,
  } = formatters;
  const {
    overlayRef,
    previewCardRef,
    previewMediaRef,
    requestCloseWithAnimation,
  } = useQuickPreviewCloseAnimation({
    isOpen,
    onClose,
    previewSourceRect,
    resolveCloseTargetRect,
    selectedAssetKey: selectedAsset?.key,
  });

  if (!isOpen || !selectedAsset) {
    return null;
  }

  const previewCardStyle = previewOrigin
    ? ({
        '--preview-origin-x': `${previewOrigin.x}%`,
        '--preview-origin-y': `${previewOrigin.y}%`,
      } as CSSProperties)
    : undefined;
  const assetName = basenameFromKey(selectedAsset.key);

  return (
    <div
      ref={overlayRef}
      className="modal-overlay modal-overlay--photo"
      role="dialog"
      aria-modal="true"
      aria-label="Asset Preview"
      onMouseDown={requestCloseWithAnimation}
    >
      <section
        ref={previewCardRef}
        className="modal-card modal-card--preview"
        style={previewCardStyle}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <QuickPreviewTopbar
          assetName={assetName}
          hasNextPreviewImage={hasNextPreviewImage}
          hasPrevPreviewImage={hasPrevPreviewImage}
          isQuickPreviewInfoOpen={isQuickPreviewInfoOpen}
          onClose={requestCloseWithAnimation}
          onMoveSelection={onMoveSelection}
          onToggleInfoOpen={onToggleInfoOpen}
          previewMediaItemsCount={previewMediaItemsCount}
          selectedPreviewItemIndex={selectedPreviewItemIndex}
        />

        <div className={`quick-preview-layout ${!isQuickPreviewInfoOpen ? 'quick-preview-layout--focus' : ''}`}>
          <div className="quick-preview-media" ref={previewMediaRef}>
            <QuickPreviewMediaPanel
              assetPreview={assetPreview}
              assetPreviewError={assetPreviewError}
              basenameFromKey={basenameFromKey}
              hasNextPreviewImage={hasNextPreviewImage}
              hasPrevPreviewImage={hasPrevPreviewImage}
              isPreviewBusy={isPreviewBusy}
              isSharingBusy={isSharingBusy}
              onDownloadSelectedAsset={onDownloadSelectedAsset}
              onImageDecodeError={onImageDecodeError}
              onMoveSelection={onMoveSelection}
              onPdfNextPage={onPdfNextPage}
              onPdfPrevPage={onPdfPrevPage}
              onRetryPreview={onRetryPreview}
              onVideoDecodeError={onVideoDecodeError}
              pdfPreviewPage={pdfPreviewPage}
              previewDataUrl={previewDataUrl}
              selectedAsset={selectedAsset}
              selectedProfileId={selectedProfileId}
            />
          </div>
          {isQuickPreviewInfoOpen ? (
            <QuickPreviewInfoPanel
              overview={{
                assetName,
                cameraLabel,
                capturedAtLabel,
                lensLabel,
                selectedAsset,
                selectedProfileId,
                shootSettingsLabel,
              }}
              formatters={{
                formatBytes,
                formatDate,
              }}
              sharing={{
                isBusy: isSharingBusy,
                isPresignedGetCopied,
                isPresignedPutCopied,
                isPublicUrlCopied,
                isShareUrlCopied,
                presignedGetUrl,
                presignedPutUrl,
                publicUrlForSelectedAsset,
              }}
              sharingCommands={{
                onCopyPresignedGetUrl,
                onCopyPresignedPutUrl,
                onCopyPublicUrl,
                onCreatePresignedPut,
                onDownloadSelectedAsset,
                onShareSelectedAsset,
              }}
              assetManagement={{
                isBusy: isAssetActionBusy,
              }}
              assetManagementCommands={{
                onOpenAssetDelete,
                onOpenAssetMove,
                onOpenAssetRename,
              }}
              metadata={{
                isAssetKeyCopied,
                isHeadBusy,
                selectedAssetMetadata,
                selectedAssetMetadataError,
              }}
              metadataCommands={{
                onCopyAssetKey,
                onRetryMetadata,
              }}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
};
