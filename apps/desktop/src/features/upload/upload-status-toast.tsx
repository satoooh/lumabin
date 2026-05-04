import { forwardRef, useEffect, useState, type FocusEvent as ReactFocusEvent } from 'react';
import type { UploadJobStatus } from '../../shared/ipc';

interface UploadStatusToastProps {
  isVisible: boolean;
  isExpanded: boolean;
  title: string;
  compactTitle: string;
  status: UploadJobStatus['status'];
  subtitle: string;
  lastError?: string;
  progress: number;
  canRetry: boolean;
  isBusy: boolean;
  isActive: boolean;
  activeJobCount: number;
  totalJobs: number;
  onRetryFailed: () => void;
  onCancel: () => void;
  onDismiss: () => void;
}

const UploadStateIcon = ({ status }: { status: UploadJobStatus['status'] }) => {
  if (status === 'done') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="m5 12 4.2 4.2L19 6.6" />
      </svg>
    );
  }

  if (status === 'failed') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="m12 7.5 6 10.5H6l6-10.5Z" />
        <path d="M12 10.5v3.8" />
        <circle cx="12" cy="16.5" r="0.8" />
      </svg>
    );
  }

  if (status === 'canceled') {
    return (
      <svg viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="2.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 16V6" />
      <path d="M8.4 9.8 12 6l3.6 3.8" />
      <rect x="4.5" y="16.2" width="15" height="3.8" rx="1.2" />
    </svg>
  );
};

export const UploadStatusToast = forwardRef<HTMLElement, UploadStatusToastProps>(
  (
    {
      isVisible,
      isExpanded,
      title,
      compactTitle,
      status,
      subtitle,
      lastError,
      progress,
      canRetry,
      isBusy,
      isActive,
      activeJobCount,
      totalJobs,
      onRetryFailed,
      onCancel,
      onDismiss,
    },
    ref,
  ) => {
    const [isHoverExpanded, setIsHoverExpanded] = useState<boolean>(false);

    useEffect(() => {
      if (!isVisible || isExpanded) {
        setIsHoverExpanded(false);
      }
    }, [isExpanded, isVisible]);

    if (!isVisible) {
      return null;
    }

    const tone = status === 'failed'
      ? 'error'
      : status === 'done'
        ? 'success'
        : 'neutral';
    const statusLabel = status === 'running'
      ? 'uploading'
      : status === 'done'
        ? 'completed'
        : status === 'failed'
          ? 'failed'
          : status === 'canceled'
            ? 'canceled'
            : 'queued';
    const shouldExpandOnInteract = !isExpanded;
    const isExpandedView = isExpanded || isHoverExpanded;

    const handleMouseEnter = () => {
      if (!shouldExpandOnInteract) {
        return;
      }
      setIsHoverExpanded(true);
    };

    const handleMouseLeave = () => {
      if (!shouldExpandOnInteract) {
        return;
      }
      setIsHoverExpanded(false);
    };

    const handleFocusCapture = () => {
      if (!shouldExpandOnInteract) {
        return;
      }
      setIsHoverExpanded(true);
    };

    const handleBlurCapture = (event: ReactFocusEvent<HTMLElement>) => {
      if (!shouldExpandOnInteract) {
        return;
      }
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
        return;
      }
      setIsHoverExpanded(false);
    };

    return (
      <section
        ref={ref}
        className={`upload-toast ${isExpandedView ? '' : 'upload-toast--compact'}`}
        aria-live="polite"
        aria-atomic="true"
        aria-expanded={isExpandedView}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
      >
        {!isExpandedView ? (
          <>
            <div className="upload-toast__compact-row">
              <div className="upload-toast__header-main">
                <span className={`upload-toast__state-icon upload-toast__state-icon--${tone}`} aria-hidden="true">
                  <UploadStateIcon status={status} />
                </span>
                <div className="upload-toast__header-copy">
                  <p className="upload-toast__title">{compactTitle || title}</p>
                </div>
              </div>
              <div className="upload-toast__compact-actions">
                <span className="upload-toast__meta-compact">{progress}%</span>
              </div>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  transform: `scaleX(${Math.max(0, Math.min(1, progress / 100))})`,
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="upload-toast__header">
              <div className="upload-toast__header-main">
                <span className={`upload-toast__state-icon upload-toast__state-icon--${tone}`} aria-hidden="true">
                  <UploadStateIcon status={status} />
                </span>
                <div className="upload-toast__header-copy">
                  <p className="upload-toast__title">{title}</p>
                  <p className="upload-toast__subtitle">{subtitle}</p>
                </div>
              </div>
              <span className={`pill pill--${tone}`}>
                {statusLabel}
              </span>
            </div>
            {lastError ? (
              <p className="upload-toast__error">Last error: {lastError}</p>
            ) : null}
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  transform: `scaleX(${Math.max(0, Math.min(1, progress / 100))})`,
                }}
              />
            </div>
            <p className="upload-toast__meta">
              {progress}% • {activeJobCount} active / {totalJobs} jobs
            </p>
            <div className="upload-toast__actions">
              {canRetry ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={onRetryFailed}
                >
                  <span className="button-content">
                    <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
                      <path d="M20 4v6h-6" />
                    </svg>
                    <span>Retry failed</span>
                  </span>
                </button>
              ) : null}
              {isActive ? (
                <button type="button" onClick={onCancel}>
                  <span className="button-content">
                    <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="7" y="7" width="10" height="10" rx="1.5" />
                    </svg>
                    <span>Cancel</span>
                  </span>
                </button>
              ) : (
                <button type="button" onClick={onDismiss}>
                  <span className="button-content">
                    <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 6l12 12" />
                      <path d="M18 6L6 18" />
                    </svg>
                    <span>Dismiss</span>
                  </span>
                </button>
              )}
            </div>
          </>
        )}
      </section>
    );
  },
);

UploadStatusToast.displayName = 'UploadStatusToast';
