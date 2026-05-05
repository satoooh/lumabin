import { DevMetricsPanel } from './dev-metrics-panel';
import { WorkspaceBrowserSessionPanel } from './workspace-browser-session-panel';
import { WorkspaceConnectionPanel } from './workspace-connection-panel';
import { WorkspaceDefaultsPanel } from './workspace-defaults-panel';
import { WorkspaceSavedViewsPanel } from './workspace-saved-views-panel';
import { WorkspaceSettingsFooter } from './workspace-settings-footer';
import { UnsavedChangesConfirmation } from './unsaved-changes-confirmation';
import { useMemo, useState } from 'react';
import type { AppSettings, DevMetricsSnapshot, ProfileSummary, SavedView } from '../../shared/ipc';
import {
  DEFAULT_WORKSPACE_SETTINGS_SECTION_ID,
  resolveActiveWorkspaceSettingsSection,
  resolveWorkspaceSettingsSections,
  type WorkspaceSettingsSectionId,
} from './workspace-settings-sections';

type ViewMode = 'gallery' | 'list';
type SortField = 'name' | 'size' | 'modified' | 'type';
type SortDirection = 'asc' | 'desc';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (value: ViewMode) => void;
  sortBy: SortField;
  onChangeSortBy: (value: SortField) => void;
  sortDirection: SortDirection;
  onChangeSortDirection: (value: SortDirection) => void;
  savedViews: SavedView[];
  newSavedViewName: string;
  onChangeNewSavedViewName: (value: string) => void;
  isSearchBusy: boolean;
  onSaveCurrentView: () => Promise<void> | void;
  onApplySavedView: (view: SavedView) => Promise<void> | void;
  onDeleteSavedView: (viewId: string) => Promise<void> | void;
  formatDate: (value: string) => string;
  selectedProfileId: string;
  selectedProfile?: ProfileSummary;
  onConnectionTest: () => Promise<void> | void;
  isProfileBusy: boolean;
  onOpenConnectionSetup: () => void;
  selectedPublicBaseUrl: string;
  onChangePublicBaseUrl: (value: string) => void;
  assetsPrefix: string;
  onChangeAssetsPrefix: (value: string) => void;
  onLoadFirstPage: () => Promise<void> | void;
  onLoadNextPage: () => Promise<void> | void;
  isListLoading: boolean;
  isNextPageDisabled: boolean;
  prefixes: string[];
  onOpenPrefix: (prefix: string) => Promise<void> | void;
  settings: AppSettings;
  onChangeAppearance: (value: AppSettings['appearance']) => void;
  onChangeDefaultConflictPolicy: (value: AppSettings['defaultConflictPolicy']) => void;
  onChangePresignedUrlTTLSeconds: (value: number) => void;
  onChangeUploadOptimizeImagesBeforeUpload: (value: boolean) => void;
  isSettingsDirty: boolean;
  isSettingsBusy: boolean;
  onSaveSettings: () => Promise<void> | void;
  isDiscardConfirming: boolean;
  onCancelDiscardChanges: () => void;
  onConfirmDiscardChanges: () => void;
  isDevEnv: boolean;
  isDevMetricsBusy: boolean;
  devMetrics: DevMetricsSnapshot | null;
  previewCacheHitRate: number;
  headCacheHitRate: number;
  searchCacheHitRate: number;
  formatBytes: (value: number) => string;
  onRefreshDevMetrics: () => Promise<void> | void;
  onResetDevMetrics: () => Promise<void> | void;
  onCopyDevMetricsSnapshot: () => Promise<void> | void;
}

export const WorkspaceSettingsModal = ({
  isOpen,
  onClose,
  viewMode,
  onChangeViewMode,
  sortBy,
  onChangeSortBy,
  sortDirection,
  onChangeSortDirection,
  savedViews,
  newSavedViewName,
  onChangeNewSavedViewName,
  isSearchBusy,
  onSaveCurrentView,
  onApplySavedView,
  onDeleteSavedView,
  formatDate,
  selectedProfileId,
  selectedProfile,
  onConnectionTest,
  isProfileBusy,
  onOpenConnectionSetup,
  selectedPublicBaseUrl,
  onChangePublicBaseUrl,
  assetsPrefix,
  onChangeAssetsPrefix,
  onLoadFirstPage,
  onLoadNextPage,
  isListLoading,
  isNextPageDisabled,
  prefixes,
  onOpenPrefix,
  settings,
  onChangeAppearance,
  onChangeDefaultConflictPolicy,
  onChangePresignedUrlTTLSeconds,
  onChangeUploadOptimizeImagesBeforeUpload,
  isSettingsDirty,
  isSettingsBusy,
  onSaveSettings,
  isDiscardConfirming,
  onCancelDiscardChanges,
  onConfirmDiscardChanges,
  isDevEnv,
  isDevMetricsBusy,
  devMetrics,
  previewCacheHitRate,
  headCacheHitRate,
  searchCacheHitRate,
  formatBytes,
  onRefreshDevMetrics,
  onResetDevMetrics,
  onCopyDevMetricsSnapshot,
}: WorkspaceSettingsModalProps) => {
  const sections = useMemo(() => resolveWorkspaceSettingsSections({
    isDevEnv,
    isSettingsDirty,
    savedViewCount: savedViews.length,
    selectedProfileId,
  }), [isDevEnv, isSettingsDirty, savedViews.length, selectedProfileId]);

  const [activeSectionId, setActiveSectionId] = useState<WorkspaceSettingsSectionId>(
    DEFAULT_WORKSPACE_SETTINGS_SECTION_ID,
  );
  const activeSection = resolveActiveWorkspaceSettingsSection(sections, activeSectionId);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Workspace Settings"
      onMouseDown={onClose}
    >
      <section
        className="modal-card modal-card--settings"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="panel-header-row">
          <div className="workspace-settings-title">
            <h2>Workspace settings</h2>
            <p className="minor">
              Saved defaults, live browser controls, and the active connection profile.
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <span className="button-content">
              <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
              <span>Close</span>
            </span>
          </button>
        </div>

        <div className="workspace-settings-overview">
          <span className={`pill ${selectedProfileId ? 'pill--success' : 'pill--neutral'}`}>
            {selectedProfileId ? selectedProfile?.name ?? 'Profile selected' : 'No connection profile'}
          </span>
          <span className={`pill ${isSettingsDirty ? 'pill--warning' : 'pill--neutral'}`}>
            {isSettingsDirty ? 'Unsaved settings' : 'All settings saved'}
          </span>
        </div>

        <div className="workspace-settings-workbench">
          <nav
            aria-label="Workspace settings sections"
            className="workspace-settings-nav"
            role="tablist"
          >
            {sections.map((section) => (
              <button
                aria-controls={`workspace-settings-section-${section.id}`}
                aria-selected={activeSection.id === section.id}
                className="workspace-settings-nav-button"
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                role="tab"
                type="button"
              >
                <span className="workspace-settings-nav-label">{section.label}</span>
                <span className="workspace-settings-nav-description">{section.description}</span>
                {section.badge ? <span className="pill">{section.badge}</span> : null}
              </button>
            ))}
          </nav>

          <div
            aria-label={activeSection.label}
            className="workspace-settings-section"
            id={`workspace-settings-section-${activeSection.id}`}
            role="tabpanel"
          >
            {activeSection.id === 'connection' ? (
              <WorkspaceConnectionPanel
                isProfileBusy={isProfileBusy}
                onChangePublicBaseUrl={onChangePublicBaseUrl}
                onConnectionTest={onConnectionTest}
                onOpenConnectionSetup={onOpenConnectionSetup}
                selectedProfile={selectedProfile}
                selectedProfileId={selectedProfileId}
                selectedPublicBaseUrl={selectedPublicBaseUrl}
              />
            ) : null}

            {activeSection.id === 'defaults' ? (
              <WorkspaceDefaultsPanel
                isSettingsDirty={isSettingsDirty}
                onChangeAppearance={onChangeAppearance}
                onChangeDefaultConflictPolicy={onChangeDefaultConflictPolicy}
                onChangePresignedUrlTTLSeconds={onChangePresignedUrlTTLSeconds}
                onChangeUploadOptimizeImagesBeforeUpload={onChangeUploadOptimizeImagesBeforeUpload}
                settings={settings}
              />
            ) : null}

            {activeSection.id === 'browser' ? (
              <WorkspaceBrowserSessionPanel
                assetsPrefix={assetsPrefix}
                isInitiallyExpanded={true}
                isListLoading={isListLoading}
                isNextPageDisabled={isNextPageDisabled}
                onChangeAssetsPrefix={onChangeAssetsPrefix}
                onChangeSortBy={onChangeSortBy}
                onChangeSortDirection={onChangeSortDirection}
                onChangeViewMode={onChangeViewMode}
                onLoadFirstPage={onLoadFirstPage}
                onLoadNextPage={onLoadNextPage}
                onOpenPrefix={onOpenPrefix}
                prefixes={prefixes}
                selectedProfileId={selectedProfileId}
                sortBy={sortBy}
                sortDirection={sortDirection}
                viewMode={viewMode}
              />
            ) : null}

            {activeSection.id === 'views' ? (
              <WorkspaceSavedViewsPanel
                formatDate={formatDate}
                isSearchBusy={isSearchBusy}
                newSavedViewName={newSavedViewName}
                onApplySavedView={onApplySavedView}
                onChangeNewSavedViewName={onChangeNewSavedViewName}
                onDeleteSavedView={onDeleteSavedView}
                onSaveCurrentView={onSaveCurrentView}
                savedViews={savedViews}
              />
            ) : null}

            {activeSection.id === 'developer' && isDevEnv ? (
              <div className="workspace-settings-panel">
                <DevMetricsPanel
                  isBusy={isDevMetricsBusy}
                  metrics={devMetrics}
                  previewCacheHitRate={previewCacheHitRate}
                  headCacheHitRate={headCacheHitRate}
                  searchCacheHitRate={searchCacheHitRate}
                  formatBytes={formatBytes}
                  formatDate={formatDate}
                  onRefresh={() => void onRefreshDevMetrics()}
                  onReset={() => void onResetDevMetrics()}
                  onCopySnapshot={() => void onCopyDevMetricsSnapshot()}
                />
              </div>
            ) : null}
          </div>
        </div>

        <WorkspaceSettingsFooter
          isSettingsBusy={isSettingsBusy}
          isSettingsDirty={isSettingsDirty}
          onSaveSettings={onSaveSettings}
        />
        {isDiscardConfirming ? (
          <UnsavedChangesConfirmation
            title="Discard unsaved workspace settings?"
            message="Public URL and default preference edits will be reset to the last saved values."
            onCancel={onCancelDiscardChanges}
            onConfirm={onConfirmDiscardChanges}
          />
        ) : null}
      </section>
    </div>
  );
};
