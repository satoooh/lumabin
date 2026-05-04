import type { DevMetricsSnapshot } from '../../shared/ipc';

interface DevMetricsPanelProps {
  isBusy: boolean;
  metrics: DevMetricsSnapshot | null;
  previewCacheHitRate: number;
  headCacheHitRate: number;
  searchCacheHitRate: number;
  formatBytes: (value: number) => string;
  formatDate: (value: string) => string;
  onRefresh: () => void;
  onReset: () => void;
  onCopySnapshot: () => void;
}

export const DevMetricsPanel = ({
  isBusy,
  metrics,
  previewCacheHitRate,
  headCacheHitRate,
  searchCacheHitRate,
  formatBytes,
  formatDate,
  onRefresh,
  onReset,
  onCopySnapshot,
}: DevMetricsPanelProps) => {
  const canCopySnapshot = Boolean(metrics) && !isBusy;

  return (
    <article className="panel">
      <div className="panel-header-row">
        <h3>Dev metrics (storage)</h3>
        <span className="pill">{isBusy ? 'Loading…' : 'Live'}</span>
      </div>
      <p className="minor">
        Cache hit rates and remote call counters for this app session.
      </p>

      <div className="dev-metrics-grid">
        <div className="dev-metrics-item">
          <span>Preview cache hit</span>
          <strong>{previewCacheHitRate}%</strong>
        </div>
        <div className="dev-metrics-item">
          <span>HEAD cache hit</span>
          <strong>{headCacheHitRate}%</strong>
        </div>
        <div className="dev-metrics-item">
          <span>Search cache hit</span>
          <strong>{searchCacheHitRate}%</strong>
        </div>
        <div className="dev-metrics-item">
          <span>List calls</span>
          <strong>{metrics?.storage.listCalls ?? 0}</strong>
        </div>
        <div className="dev-metrics-item">
          <span>HEAD calls</span>
          <strong>{metrics?.storage.headCalls ?? 0}</strong>
        </div>
        <div className="dev-metrics-item">
          <span>GET calls</span>
          <strong>{metrics?.storage.getCalls ?? 0}</strong>
        </div>
        <div className="dev-metrics-item">
          <span>PUT calls</span>
          <strong>{metrics?.storage.putCalls ?? 0}</strong>
        </div>
        <div className="dev-metrics-item">
          <span>Exists checks</span>
          <strong>{metrics?.storage.existsChecks ?? 0}</strong>
        </div>
        <div className="dev-metrics-item">
          <span>Read bytes</span>
          <strong>{formatBytes(metrics?.storage.bytesDownloaded ?? 0)}</strong>
        </div>
        <div className="dev-metrics-item">
          <span>Upload bytes</span>
          <strong>{formatBytes(metrics?.storage.bytesUploaded ?? 0)}</strong>
        </div>
        <div className="dev-metrics-item">
          <span>Failures</span>
          <strong>{metrics?.storage.failures ?? 0}</strong>
        </div>
        <div className="dev-metrics-item">
          <span>Updated</span>
          <strong>{metrics ? formatDate(metrics.collectedAt) : '-'}</strong>
        </div>
      </div>

      <div className="row-actions">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isBusy}
          aria-busy={isBusy}
        >
          <span className="button-content">
            {isBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.3-5.7" />
              <path d="M20 4v6h-6" />
            </svg>
            <span>Refresh</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isBusy}
          aria-busy={isBusy}
        >
          <span className="button-content">
            {isBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            <span>Reset</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onCopySnapshot}
          disabled={!canCopySnapshot}
          aria-busy={isBusy}
        >
          <span className="button-content">
            {isBusy ? <span className="button-spinner" aria-hidden="true" /> : null}
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="9" y="9" width="10" height="10" rx="2" />
              <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy snapshot</span>
          </span>
        </button>
      </div>
    </article>
  );
};
