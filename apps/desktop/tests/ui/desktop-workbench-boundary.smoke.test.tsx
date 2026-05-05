import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_ROOT = join(process.cwd(), 'src');

describe('desktop workbench boundary', () => {
  it('keeps App as a render shell and the workbench away from direct preload access', () => {
    const appSource = readFileSync(join(SOURCE_ROOT, 'App.tsx'), 'utf8');
    const desktopWorkbenchOverlaysSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/desktop-workbench-overlays.ts'),
      'utf8',
    );
    const desktopWorkbenchOverlayCoordinationSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/desktop-workbench-overlay-coordination.ts'),
      'utf8',
    );
    const desktopWorkbenchOverlayHandoffsSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/desktop-workbench-overlay-handoffs.ts'),
      'utf8',
    );
    const desktopWorkbenchPreviewCoordinationSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/desktop-workbench-preview-coordination.ts'),
      'utf8',
    );
    const desktopWorkbenchMainPresentersSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/desktop-workbench-main-presenters.ts'),
      'utf8',
    );
    const desktopWorkbenchTopbarCoordinationSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/desktop-workbench-topbar-coordination.ts'),
      'utf8',
    );
    const desktopWorkbenchTopbarHandoffsSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/desktop-workbench-topbar-handoffs.ts'),
      'utf8',
    );
    const desktopWorkbenchCenterPaneCoordinationSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/desktop-workbench-center-pane-coordination.ts'),
      'utf8',
    );
    const desktopWorkbenchWorkspaceSettingsCoordinationSource = readFileSync(
      join(
        SOURCE_ROOT,
        'features/workbench/desktop-workbench-workspace-settings-coordination.ts',
      ),
      'utf8',
    );
    const desktopWorkbenchShellInputsSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/desktop-workbench-shell-inputs.ts'),
      'utf8',
    );
    const workbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-desktop-workbench.ts'),
      'utf8',
    );
    const previewWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-preview-workbench.ts'),
      'utf8',
    );
    const uploadWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-upload-workbench.ts'),
      'utf8',
    );
    const assetActionsWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-asset-actions-workbench.ts'),
      'utf8',
    );
    const desktopWorkbenchFeedbackSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-desktop-workbench-feedback.ts'),
      'utf8',
    );
    const desktopWorkbenchShellResourcesSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-desktop-workbench-shell-resources.ts'),
      'utf8',
    );
    const diagnosticsWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-diagnostics-workbench.ts'),
      'utf8',
    );
    const desktopWorkbenchShellSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-desktop-workbench-shell.ts'),
      'utf8',
    );
    const desktopWorkbenchShellCoordinationSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-desktop-workbench-shell-coordination.ts'),
      'utf8',
    );
    const galleryBrowsingWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-gallery-browsing-workbench.ts'),
      'utf8',
    );
    const gallerySettingsWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-gallery-settings-workbench.ts'),
      'utf8',
    );
    const gallerySessionWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-gallery-session-workbench.ts'),
      'utf8',
    );
    const workspaceStateWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-workspace-state-workbench.ts'),
      'utf8',
    );
    const workspaceCommandsWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-workspace-commands-workbench.ts'),
      'utf8',
    );
    const workspaceGalleryLifecycleWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-workspace-gallery-lifecycle-workbench.ts'),
      'utf8',
    );
    const workspaceSettingsWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-workspace-settings-workbench.ts'),
      'utf8',
    );
    const workspaceRuntimeStateWorkbenchSource = readFileSync(
      join(SOURCE_ROOT, 'features/workbench/use-workspace-runtime-state-workbench.ts'),
      'utf8',
    );

    expect(appSource.split('\n').length).toBeLessThanOrEqual(80);
    expect(appSource).toContain("import { useDesktopWorkbench } from './features/workbench/use-desktop-workbench';");
    expect(appSource).not.toContain('useState');
    expect(workbenchSource).toContain(
      "import { createDesktopWorkbenchOverlayCoordinationProps } from './desktop-workbench-overlay-coordination';",
    );
    expect(workbenchSource).toContain(
      "import { createDesktopWorkbenchOverlayCoordinationInput } from './desktop-workbench-overlay-handoffs';",
    );
    expect(workbenchSource).toContain(
      "import { createDesktopWorkbenchPreviewCoordinationInput } from './desktop-workbench-preview-coordination';",
    );
    expect(desktopWorkbenchOverlayCoordinationSource).toContain("from './desktop-workbench-overlays';");
    expect(desktopWorkbenchOverlayCoordinationSource).toContain(
      'createDesktopWorkbenchConnectionSetupCommands',
    );
    expect(desktopWorkbenchOverlayCoordinationSource).toContain(
      'createDesktopWorkbenchFeedbackLayerOverlayInput',
    );
    expect(desktopWorkbenchOverlayCoordinationSource).toContain(
      'createDesktopWorkbenchGalleryActionOverlayInput',
    );
    expect(desktopWorkbenchOverlayCoordinationSource).toContain(
      'createDesktopWorkbenchQuickPreviewOverlayInput',
    );
    expect(desktopWorkbenchOverlayCoordinationSource).toContain('createDesktopWorkbenchOverlayProps');
    expect(desktopWorkbenchOverlayHandoffsSource).toContain(
      "import type { createDesktopWorkbenchOverlayCoordinationProps } from './desktop-workbench-overlay-coordination';",
    );
    expect(desktopWorkbenchOverlayHandoffsSource).toContain(
      'createDesktopWorkbenchOverlayCoordinationInput',
    );
    [
      'quickPreviewAssetManagement: {',
      'quickPreviewAssetManagementCommands: {',
      'connectionSetupState: {',
      'connectionSetupCommands: {',
      'connectionSetupForm: {',
      'galleryActionUploadConflict: {',
      'galleryActionBulkMove: {',
      'galleryActionBulkDelete: {',
      'galleryActionAssetAction: {',
      'feedbackLayerCommands: {',
      'feedbackLayerDropOverlay: {',
      'feedbackLayerPendingDelete: {',
      'feedbackLayerUpload: {',
    ].forEach((directOverlayHandoff) => {
      expect(workbenchSource).not.toContain(directOverlayHandoff);
    });
    expect(workbenchSource).not.toContain("from './desktop-workbench-overlays';");
    expect(workbenchSource).not.toContain('createDesktopWorkbenchQuickPreviewOverlayInput');
    expect(workbenchSource).toContain(
      "import { createDesktopWorkbenchTopbarCoordinationProps } from './desktop-workbench-topbar-coordination';",
    );
    expect(workbenchSource).toContain(
      "import { createDesktopWorkbenchTopbarCoordinationInput } from './desktop-workbench-topbar-handoffs';",
    );
    expect(desktopWorkbenchTopbarHandoffsSource).toContain(
      "import type { createDesktopWorkbenchTopbarCoordinationProps } from './desktop-workbench-topbar-coordination';",
    );
    expect(desktopWorkbenchTopbarHandoffsSource).toContain(
      'createDesktopWorkbenchTopbarCoordinationInput',
    );
    expect(workbenchSource).toContain(
      "import { createDesktopWorkbenchCenterPaneCoordinationProps } from './desktop-workbench-center-pane-coordination';",
    );
    expect(workbenchSource).toContain(
      "import { createDesktopWorkbenchWorkspaceSettingsCoordinationInput } from './desktop-workbench-workspace-settings-coordination';",
    );
    expect(workbenchSource).toContain(
      "import { useDesktopWorkbenchShellCoordination } from './use-desktop-workbench-shell-coordination';",
    );
    expect(desktopWorkbenchShellCoordinationSource).toContain(
      "from './desktop-workbench-main-presenters';",
    );
    expect(desktopWorkbenchShellCoordinationSource).toContain('createDesktopWorkbenchShellProps');
    expect(workbenchSource).not.toContain('createDesktopWorkbenchShellProps');
    expect(workbenchSource).not.toContain("from './desktop-workbench-main-presenters';");
    expect(desktopWorkbenchCenterPaneCoordinationSource).toContain(
      "from './desktop-workbench-main-presenters';",
    );
    expect(desktopWorkbenchCenterPaneCoordinationSource).toContain(
      'createDesktopWorkbenchCenterPaneAssetList',
    );
    expect(desktopWorkbenchCenterPaneCoordinationSource).toContain(
      'createDesktopWorkbenchCenterPaneProps',
    );
    expect(workbenchSource).not.toContain('createDesktopWorkbenchCenterPaneAssetList');
    expect(workbenchSource).not.toContain('createDesktopWorkbenchCenterPaneProps');
    expect(desktopWorkbenchWorkspaceSettingsCoordinationSource).toContain(
      "import type { WorkspaceSettingsWorkbenchOptions } from './use-workspace-settings-workbench';",
    );
    expect(desktopWorkbenchWorkspaceSettingsCoordinationSource).toContain(
      'createDesktopWorkbenchWorkspaceSettingsCoordinationInput',
    );
    expect(workbenchSource).not.toContain(
      'useWorkspaceSettingsWorkbench({',
    );
    expect(desktopWorkbenchTopbarCoordinationSource).toContain(
      "from './desktop-workbench-main-presenters';",
    );
    expect(desktopWorkbenchTopbarCoordinationSource).toContain(
      'createDesktopWorkbenchTopbarAssets',
    );
    expect(desktopWorkbenchTopbarCoordinationSource).toContain(
      'createDesktopWorkbenchTopbarProps',
    );
    [
      'assets: {\n      logoSrc',
      'feedback: {\n      inlineFeedback',
      'files: {\n      fileInputRef',
      'profileMenu: {\n      closeProfileMenu',
      'search: {\n      activeSearchQuery',
      'state: {\n      isDropActive',
      'workspaceActions: {\n      handleToggleShortcutHelp',
    ].forEach((directTopbarHandoff) => {
      expect(workbenchSource).not.toContain(directTopbarHandoff);
    });
    expect(workbenchSource).not.toContain('createDesktopWorkbenchTopbarAssets');
    expect(workbenchSource).not.toContain('createDesktopWorkbenchTopbarProps');
    expect(desktopWorkbenchShellCoordinationSource).toContain("from './desktop-workbench-shell-inputs';");
    expect(desktopWorkbenchShellCoordinationSource).toContain(
      "import { useDesktopWorkbenchShell } from './use-desktop-workbench-shell';",
    );
    expect(desktopWorkbenchShellCoordinationSource).toContain(
      'createDesktopWorkbenchKeyboardShortcutsInput',
    );
    expect(desktopWorkbenchShellCoordinationSource).toContain(
      'createDesktopWorkbenchShellDialogState',
    );
    expect(desktopWorkbenchShellCoordinationSource).toContain(
      'const shellUi = useDesktopWorkbenchShell({',
    );
    expect(workbenchSource).not.toContain('createDesktopWorkbenchKeyboardShortcutsInput');
    expect(workbenchSource).not.toContain('createDesktopWorkbenchShellDialogState');
    expect(workbenchSource).not.toContain('const shellUi = useDesktopWorkbenchShell({');
    expect(workbenchSource).not.toContain('showStatusStrip,\n    canClearSearch');
    expect(workbenchSource).toContain("import { usePreviewWorkbench } from './use-preview-workbench';");
    expect(desktopWorkbenchPreviewCoordinationSource).toContain(
      "import type { PreviewWorkbenchOptions } from './use-preview-workbench';",
    );
    expect(desktopWorkbenchPreviewCoordinationSource).toContain(
      'createDesktopWorkbenchPreviewCoordinationInput',
    );
    expect(workbenchSource).not.toContain('usePreviewWorkbench({');
    expect(workbenchSource).toContain("import { useUploadWorkbench } from './use-upload-workbench';");
    expect(workbenchSource).toContain("import { useAssetActionsWorkbench } from './use-asset-actions-workbench';");
    expect(workbenchSource).toContain(
      "import { useDesktopWorkbenchShellResources } from './use-desktop-workbench-shell-resources';",
    );
    expect(workbenchSource).not.toContain("import { useDesktopWorkbenchShell } from './use-desktop-workbench-shell';");
    expect(workbenchSource).toContain("import { useDiagnosticsWorkbench } from './use-diagnostics-workbench';");
    expect(workbenchSource).toContain("import { useGalleryBrowsingWorkbench } from './use-gallery-browsing-workbench';");
    expect(workbenchSource).toContain("import { useGallerySettingsWorkbench } from './use-gallery-settings-workbench';");
    expect(workbenchSource).toContain("import { useGallerySessionWorkbench } from './use-gallery-session-workbench';");
    expect(workbenchSource).toContain("import { useWorkspaceCommandsWorkbench } from './use-workspace-commands-workbench';");
    expect(workbenchSource).toContain("import { useWorkspaceSettingsWorkbench } from './use-workspace-settings-workbench';");
    expect(workbenchSource).toContain("import { useWorkspaceStateWorkbench } from './use-workspace-state-workbench';");
    expect(workbenchSource).toContain(
      "import { useWorkspaceRuntimeStateWorkbench } from './use-workspace-runtime-state-workbench';",
    );
    expect(workbenchSource).not.toContain("const NEW_PROFILE_OPTION_VALUE = '__new_profile__';");
    expect(workbenchSource).not.toContain("const MANAGE_PROFILE_OPTION_VALUE = '__manage_profile__';");
    expect(workbenchSource).not.toContain('useQuickPreviewNavigation');
    expect(workbenchSource).not.toContain('usePreviewSharingCommands');
    expect(workbenchSource).not.toContain('handlePdfNextPage');
    expect(workbenchSource).not.toContain('handleVideoDecodeError');
    expect(workbenchSource).not.toContain('quickPreviewSharingCommands');
    expect(workbenchSource).not.toContain('cameraLabel');
    expect(workbenchSource).not.toContain('useUploadController');
    expect(workbenchSource).not.toContain('useUploadToastSummary');
    expect(workbenchSource).not.toContain('useTransientFeedback');
    expect(workbenchSource).not.toContain('useDesktopWorkbenchFeedback');
    expect(workbenchSource).not.toContain('useAppDomRefs');
    expect(workbenchSource).not.toContain('useTooltipWarmState');
    expect(workbenchSource).not.toContain('STATUS_AUTO_HIDE_MS');
    expect(workbenchSource).not.toContain('COPY_FEEDBACK_AUTO_HIDE_MS');
    expect(workbenchSource).not.toContain('DELETE_UNDO_WINDOW_MS');
    expect(desktopWorkbenchFeedbackSource).toContain('useTransientFeedback');
    expect(desktopWorkbenchShellResourcesSource).toContain('useDesktopWorkbenchFeedback');
    expect(desktopWorkbenchShellResourcesSource).toContain('useAppDomRefs');
    expect(desktopWorkbenchShellResourcesSource).toContain('useTooltipWarmState');
    expect(assetActionsWorkbenchSource).toContain('DELETE_UNDO_WINDOW_MS');
    expect(workbenchSource).not.toContain('useAssetMutationCommands');
    expect(workbenchSource).not.toContain('usePendingDeleteController');
    expect(workbenchSource).not.toContain('useDevMetricsCommands');
    expect(workbenchSource).not.toContain('useDevMetricsPolling');
    expect(workbenchSource).not.toContain('RuntimeInfo');
    expect(workbenchSource).not.toContain('desktopApi.runtime.getInfo');
    expect(workbenchSource).not.toContain('useProfileMenuState');
    expect(workbenchSource).not.toContain('onCloseAssetActionDialog: () => setAssetActionDialog(null)');
    expect(workbenchSource).not.toContain('onCloseBulkDeleteDialog: () => setBulkDeleteDialogKeys(null)');
    expect(workbenchSource).not.toContain('onCloseBulkMoveDialog: () => setBulkMoveDialog(null)');
    expect(workbenchSource).not.toContain('onCloseUploadConflictDialog: () => setUploadConflictDialog(null)');
    expect(workbenchSource).toContain('onCloseAssetActionDialog: handleCloseAssetActionDialog');
    expect(workbenchSource).toContain('onCloseUploadConflictDialog: handleCloseUploadConflictDialog');
    expect(workbenchSource).not.toContain('useProfileFormState');
    expect(workbenchSource).not.toContain('useWorkspaceSettingsState');
    expect(workbenchSource).not.toContain('useWorkspaceBootstrap');
    expect(workbenchSource).not.toContain('useProfileCommands');
    expect(workbenchSource).not.toContain('useProfileValidationFocus');
    expect(workbenchSource).not.toContain('useWorkspaceSettingsCommands');
    expect(workbenchSource).not.toContain("from '../layout/use-workspace-state-flags';");
    expect(workbenchSource).not.toContain('useWorkspaceDialogActions');
    expect(workbenchSource).not.toContain('iconForKind');
    expect(workbenchSource).not.toContain('basenameFromKey');
    expect(workbenchSource).not.toContain('formatBytes');
    expect(workbenchSource).not.toContain('formatDate');
    expect(workbenchSource).not.toContain('inferAssetKind');
    expect(workbenchSource).not.toContain('thumbnailCacheKey');
    expect(workbenchSource).not.toContain('GALLERY_TILE_MIN_WIDTH_MAX');
    expect(workbenchSource).not.toContain('GALLERY_TILE_MIN_WIDTH_MIN');
    expect(workbenchSource).not.toContain('GALLERY_TILE_MIN_WIDTH_SLIDER_STEP');
    expect(workbenchSource).not.toContain('GALLERY_TILE_MIN_WIDTH_DEFAULT');
    expect(workbenchSource).not.toContain('useAssetBrowserQueryController');
    expect(workbenchSource).not.toContain('useGalleryWorkspacePreferences');
    expect(workbenchSource).not.toContain('useGalleryViewportController');
    expect(workbenchSource).not.toContain('useGalleryViewModel');
    expect(workbenchSource).not.toContain('useGalleryThumbnails');
    expect(workbenchSource).not.toContain('useAssetFocusController');
    expect(workbenchSource).not.toContain('normalizeAssetPrefix');
    expect(workbenchSource).not.toContain('useSelectedProfileGalleryBootstrap');
    expect(workbenchSource).not.toContain('useGallerySelectionController');
    expect(workbenchSource).not.toContain('useGalleryDialogGuards');
    expect(workbenchSource).not.toContain('useSavedViewCommands');
    expect(workbenchSource).toContain('useWorkspaceGalleryLifecycleWorkbench');
    expect(workbenchSource).not.toContain("from '../gallery/use-profile-gallery-lifecycle';");
    expect(workspaceGalleryLifecycleWorkbenchSource).toContain('handleProfileSelected');
    expect(workspaceGalleryLifecycleWorkbenchSource).toContain('handleProfileDeleted');
    expect(workbenchSource).not.toContain('createWorkspaceSettingsOverlayProps');
    expect(workbenchSource).not.toContain('createQuickPreviewOverlayProps');
    expect(workbenchSource).not.toContain('createGalleryActionOverlayProps');
    expect(workbenchSource).not.toContain('createConnectionSetupOverlayProps');
    expect(workbenchSource).not.toContain('createWorkspaceFeedbackLayerProps');
    expect(workbenchSource).not.toContain('assetManagementCommands: {');
    expect(workbenchSource).not.toContain('const quickPreviewAssetManagementCommands');
    expect(workbenchSource).not.toContain('feedbackLayer: {');
    expect(workbenchSource).not.toContain('commands: {\n      handleCancelUpload');
    expect(workbenchSource).not.toContain('dropOverlay: {\n      dropOverlayPrefixLabel');
    expect(workbenchSource).not.toContain('pendingDelete: {\n      activePendingDeleteJob');
    expect(workbenchSource).not.toContain('upload: {\n      activeUploadJobCount');
    expect(workbenchSource).not.toContain('galleryActionModals: {');
    expect(workbenchSource).not.toContain('assetAction: {\n      assetActionDialog');
    expect(workbenchSource).not.toContain('bulkDelete: {\n      bulkDeleteDialogKeys');
    expect(workbenchSource).not.toContain('bulkMove: {\n      bulkMoveDialog');
    expect(workbenchSource).not.toContain('commands: {\n      handleCloseConnectionSetup');
    expect(workbenchSource).not.toContain('form: {\n      allowStoredSecret');
    expect(workbenchSource).not.toContain('state: {\n      isConnectionSetupOpen');
    expect(workbenchSource).not.toContain('uploadConflict: {\n      uploadConflictDialog');
    expect(workbenchSource).not.toContain('refs: {');
    expect(workbenchSource).not.toContain('activeSearchQuery,\n    closeProfileMenu');
    expect(workbenchSource).not.toContain('fileInputRef,\n    handleFilePickerChange');
    expect(workbenchSource).not.toContain('createDesktopWorkbenchCenterPaneProps({\n    activeKindLabel');
    expect(workbenchSource).not.toContain('useGlobalKeyboardShortcuts');
    expect(workbenchSource).not.toContain('useDialogEscape');
    expect(workbenchSource).not.toContain('useWorkspaceModalGuards');
    expect(workbenchSource).not.toContain('useUiDerivations');
    expect(workbenchSource).not.toContain('useModalFocusTrap');
    expect(workbenchSource).not.toContain('../layout/app-topbar-props');
    expect(workbenchSource).not.toContain('../layout/workspace-center-pane-props');
    expect(workbenchSource).not.toContain('app-shell--drop-active');
    expect(workbenchSource).not.toContain('app-shell--tooltips-warm');
    expect(workbenchSource).not.toContain('window.lumabin');
    expect(diagnosticsWorkbenchSource).toContain('runtimeApi.getInfo');
    expect(desktopWorkbenchOverlaysSource).not.toContain('window.lumabin');
    expect(desktopWorkbenchMainPresentersSource).not.toContain('window.lumabin');
    expect(desktopWorkbenchShellInputsSource).not.toContain('window.lumabin');
    expect(desktopWorkbenchShellSource).not.toContain('window.lumabin');
    expect(previewWorkbenchSource).not.toContain('window.lumabin');
    expect(uploadWorkbenchSource).not.toContain('window.lumabin');
    expect(assetActionsWorkbenchSource).not.toContain('window.lumabin');
    expect(diagnosticsWorkbenchSource).not.toContain('window.lumabin');
    expect(galleryBrowsingWorkbenchSource).not.toContain('window.lumabin');
    expect(galleryBrowsingWorkbenchSource).toContain('resetGalleryTileMinWidth');
    expect(galleryBrowsingWorkbenchSource).toContain('GALLERY_TILE_MIN_WIDTH_DEFAULT');
    expect(gallerySettingsWorkbenchSource).toContain('useSavedViewCommands');
    expect(gallerySettingsWorkbenchSource).not.toContain('window.lumabin');
    expect(workspaceSettingsWorkbenchSource).not.toContain('useSavedViewCommands');
    expect(workspaceSettingsWorkbenchSource).not.toContain('setAssetsPrefix');
    expect(workspaceSettingsWorkbenchSource).not.toContain('loadAssetsPage');
    expect(workspaceRuntimeStateWorkbenchSource).toContain('showGuidedStart');
    expect(workspaceRuntimeStateWorkbenchSource).toContain('isNextPageDisabled');
    expect(workspaceCommandsWorkbenchSource).not.toContain('useProfileDeletionCleanup');
    expect(workspaceCommandsWorkbenchSource).not.toContain('resetAssetsResult');
    expect(workspaceCommandsWorkbenchSource).not.toContain('setSearchItems');
    expect(workspaceCommandsWorkbenchSource).not.toContain('setSearchInput');
    expect(workspaceCommandsWorkbenchSource).not.toContain('setSelectedAssetKey');
    expect(workspaceStateWorkbenchSource).toContain("const NEW_PROFILE_OPTION_VALUE = '__new_profile__';");
    expect(workspaceStateWorkbenchSource).toContain("const MANAGE_PROFILE_OPTION_VALUE = '__manage_profile__';");
    expect(workspaceGalleryLifecycleWorkbenchSource).toContain('resetAssetsResult');
    expect(workspaceGalleryLifecycleWorkbenchSource).toContain('setSelectedAssetKey');
    expect(gallerySessionWorkbenchSource).not.toContain('window.lumabin');
    expect(workspaceCommandsWorkbenchSource).not.toContain('window.lumabin');
    expect(workspaceSettingsWorkbenchSource).not.toContain('window.lumabin');
    expect(workspaceStateWorkbenchSource).not.toContain('window.lumabin');
  });
});
