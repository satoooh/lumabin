import { QuickPreviewActionButton } from './quick-preview-action-button';

export interface QuickPreviewSharingViewModel {
  isBusy: boolean;
  isShareUrlCopied: boolean;
  publicUrlForSelectedAsset: string;
  isPublicUrlCopied: boolean;
  presignedGetUrl: string;
  isPresignedGetCopied: boolean;
  presignedPutUrl: string;
  isPresignedPutCopied: boolean;
}

export interface QuickPreviewSharingCommands {
  onShareSelectedAsset: () => void;
  onDownloadSelectedAsset: () => void;
  onCopyPublicUrl: () => void;
  onCreatePresignedPut: () => void;
  onCopyPresignedGetUrl: () => void;
  onCopyPresignedPutUrl: () => void;
}

interface QuickPreviewSharingSectionProps {
  selectedProfileId: string;
  sharing: QuickPreviewSharingViewModel;
  sharingCommands: QuickPreviewSharingCommands;
}

const CopyIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="9" y="9" width="10" height="10" rx="1.5" />
    <path d="M5 15V5a1 1 0 0 1 1-1h10" />
  </svg>
);

export const QuickPreviewSharingSection = ({
  selectedProfileId,
  sharing,
  sharingCommands,
}: QuickPreviewSharingSectionProps) => {
  const {
    isBusy: isSharingBusy,
    isShareUrlCopied,
    publicUrlForSelectedAsset,
    isPublicUrlCopied,
    presignedGetUrl,
    isPresignedGetCopied,
    presignedPutUrl,
    isPresignedPutCopied,
  } = sharing;
  const {
    onShareSelectedAsset,
    onDownloadSelectedAsset,
    onCopyPublicUrl,
    onCreatePresignedPut,
    onCopyPresignedGetUrl,
    onCopyPresignedPutUrl,
  } = sharingCommands;

  let publicUrlBadge = 'Setup needed';
  if (publicUrlForSelectedAsset) {
    publicUrlBadge = isPublicUrlCopied ? 'Copied!' : 'Public';
  }

  return (
    <section className="quick-preview-section">
      <div className="quick-preview-section-heading">
        <h3>Share & access</h3>
        <p>Start with a share link; keep stable and write URLs secondary.</p>
      </div>
      <div className="quick-preview-action-stack quick-preview-action-stack--access">
        <QuickPreviewActionButton
          ariaLabel={isShareUrlCopied ? 'Copied!' : 'Share'}
          title="Share link"
          description="Generate and copy temporary read URL"
          emphasis="primary"
          badge={isShareUrlCopied ? 'Copied!' : undefined}
          disabled={isSharingBusy || !selectedProfileId}
          isBusy={isSharingBusy}
          onClick={onShareSelectedAsset}
          icon={
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 5h5v5" />
              <path d="M10 14L19 5" />
              <path d="M20 12v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
            </svg>
          }
        />
        <div className="quick-preview-action-grid">
          <QuickPreviewActionButton
            title="Download original"
            description="Save the source file locally"
            disabled={isSharingBusy || !selectedProfileId}
            isBusy={isSharingBusy}
            onClick={onDownloadSelectedAsset}
            icon={
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v10" />
                <path d="m8 10 4 4 4-4" />
                <path d="M5 19h14" />
              </svg>
            }
          />
          <QuickPreviewActionButton
            ariaLabel={isPublicUrlCopied ? 'Copied!' : 'Copy public URL'}
            title="Public URL"
            description={publicUrlForSelectedAsset ? 'Stable workspace URL' : 'Needs Public URL base'}
            badge={publicUrlBadge}
            disabled={!publicUrlForSelectedAsset}
            onClick={onCopyPublicUrl}
            icon={
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 14a4 4 0 0 0 5.7 0l2.2-2.2a4 4 0 1 0-5.7-5.7L10.9 7" />
                <path d="M14 10a4 4 0 0 0-5.7 0L6 12.2a4 4 0 1 0 5.7 5.7L13 17" />
              </svg>
            }
          />
        </div>
        {!publicUrlForSelectedAsset ? (
          <p className="minor quick-preview-inline-note">
            Set Public URL base in Settings &gt; Connection.
          </p>
        ) : null}
        <details className="quick-preview-collapsible quick-preview-collapsible--utility" open={Boolean(presignedGetUrl || presignedPutUrl)}>
          <summary>
            <span>Temporary access</span>
            <span className="pill pill--neutral">
              {[presignedGetUrl, presignedPutUrl].filter(Boolean).length || 'URL'}
            </span>
          </summary>
          <div className="quick-preview-collapsible-body">
            <QuickPreviewActionButton
              title="Upload URL"
              description="Generate temporary write URL"
              badge={presignedPutUrl ? 'Ready' : undefined}
              disabled={isSharingBusy || !selectedProfileId}
              isBusy={isSharingBusy}
              onClick={onCreatePresignedPut}
              icon={
                <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 19V8" />
                  <path d="m8 12 4-4 4 4" />
                  <path d="M5 19h14" />
                </svg>
              }
            />
            {presignedGetUrl || presignedPutUrl ? (
              <details className="quick-preview-collapsible" open>
                <summary>
                  <span>Generated URLs</span>
                  <span className="pill pill--neutral">
                    {[presignedGetUrl, presignedPutUrl].filter(Boolean).length}
                  </span>
                </summary>
                <div className="quick-preview-collapsible-body quick-preview-generated-links">
                  {presignedGetUrl ? (
                    <div className="url-box">
                      <span>GET URL</span>
                      <textarea value={presignedGetUrl} readOnly rows={3} />
                      <button type="button" onClick={onCopyPresignedGetUrl}>
                        <span className="button-content">
                          <CopyIcon />
                          <span>{isPresignedGetCopied ? 'Copied!' : 'Copy GET URL'}</span>
                        </span>
                      </button>
                    </div>
                  ) : null}
                  {presignedPutUrl ? (
                    <div className="url-box">
                      <span>PUT URL</span>
                      <textarea value={presignedPutUrl} readOnly rows={3} />
                      <button type="button" onClick={onCopyPresignedPutUrl}>
                        <span className="button-content">
                          <CopyIcon />
                          <span>{isPresignedPutCopied ? 'Copied!' : 'Copy PUT URL'}</span>
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </details>
            ) : null}
          </div>
        </details>
      </div>
    </section>
  );
};
