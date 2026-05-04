import type { ComponentProps } from 'react';
import { createWorkspaceFeedbackLayerProps } from '../layout/workspace-feedback-layer-props';
import { createGalleryActionOverlayProps } from '../gallery/gallery-action-overlay-props';
import { GalleryActionModals } from '../gallery/action-modals';
import { QuickPreviewModal } from '../preview/quick-preview-modal';
import { createQuickPreviewOverlayProps } from '../preview/quick-preview-overlay-props';
import { ConnectionSetupModal } from '../settings/connection-setup-modal';
import { createConnectionSetupOverlayProps } from '../settings/connection-setup-overlay-props';
import { ShortcutHelpModal } from '../settings/shortcut-help-modal';
import { WorkspaceSettingsModal } from '../settings/workspace-settings-modal';
import { WorkspaceFeedbackLayer } from '../layout/workspace-feedback-layer';

type QuickPreviewOverlayInput = Parameters<typeof createQuickPreviewOverlayProps>[0];
type ConnectionSetupOverlayInput = Parameters<typeof createConnectionSetupOverlayProps>[0];
type GalleryActionOverlayInput = Parameters<typeof createGalleryActionOverlayProps>[0];
type WorkspaceFeedbackLayerInput = Parameters<typeof createWorkspaceFeedbackLayerProps>[0];

export type DesktopWorkbenchQuickPreviewBaseInput = Omit<
  QuickPreviewOverlayInput,
  'assetManagement' | 'assetManagementCommands'
>;

interface DesktopWorkbenchQuickPreviewOverlayInput {
  assetManagement: QuickPreviewOverlayInput['assetManagement'];
  assetManagementCommands: QuickPreviewOverlayInput['assetManagementCommands'];
  quickPreview: DesktopWorkbenchQuickPreviewBaseInput;
}

interface DesktopWorkbenchQuickPreviewAssetManagementCommandsInput {
  commands: QuickPreviewOverlayInput['assetManagementCommands'];
}

interface DesktopWorkbenchQuickPreviewAssetManagementInput {
  assetManagement: QuickPreviewOverlayInput['assetManagement'];
}

interface DesktopWorkbenchConnectionSetupOverlayInput {
  commands: ConnectionSetupOverlayInput['commands'];
  form: ConnectionSetupOverlayInput['form'];
  profileFormRefs: ConnectionSetupOverlayInput['refs'];
  state: ConnectionSetupOverlayInput['state'];
}

interface DesktopWorkbenchConnectionSetupCommandsInput {
  commands: ConnectionSetupOverlayInput['commands'];
}

interface DesktopWorkbenchConnectionSetupFormInput {
  form: ConnectionSetupOverlayInput['form'];
}

interface DesktopWorkbenchConnectionSetupStateInput {
  state: ConnectionSetupOverlayInput['state'];
}

interface DesktopWorkbenchGalleryActionOverlayInput {
  assetAction: GalleryActionOverlayInput['assetAction'];
  bulkDelete: GalleryActionOverlayInput['bulkDelete'];
  bulkMove: GalleryActionOverlayInput['bulkMove'];
  uploadConflict: GalleryActionOverlayInput['uploadConflict'];
}

interface DesktopWorkbenchGalleryActionAssetActionInput {
  assetAction: GalleryActionOverlayInput['assetAction'];
}

interface DesktopWorkbenchGalleryActionBulkDeleteInput {
  bulkDelete: GalleryActionOverlayInput['bulkDelete'];
}

interface DesktopWorkbenchGalleryActionBulkMoveInput {
  bulkMove: GalleryActionOverlayInput['bulkMove'];
}

interface DesktopWorkbenchGalleryActionUploadConflictInput {
  uploadConflict: GalleryActionOverlayInput['uploadConflict'];
}

interface DesktopWorkbenchFeedbackLayerOverlayInput {
  commands: WorkspaceFeedbackLayerInput['commands'];
  dropOverlay: WorkspaceFeedbackLayerInput['dropOverlay'];
  pendingDelete: WorkspaceFeedbackLayerInput['pendingDelete'];
  upload: WorkspaceFeedbackLayerInput['upload'];
}

interface DesktopWorkbenchFeedbackLayerCommandsInput {
  commands: WorkspaceFeedbackLayerInput['commands'];
}

interface DesktopWorkbenchFeedbackLayerDropOverlayInput {
  dropOverlay: WorkspaceFeedbackLayerInput['dropOverlay'];
}

interface DesktopWorkbenchFeedbackLayerPendingDeleteInput {
  pendingDelete: WorkspaceFeedbackLayerInput['pendingDelete'];
}

interface DesktopWorkbenchFeedbackLayerUploadInput {
  upload: WorkspaceFeedbackLayerInput['upload'];
}

interface DesktopWorkbenchShortcutHelpInput {
  shortcutHelp: ComponentProps<typeof ShortcutHelpModal>;
}

interface DesktopWorkbenchOverlayPropsInput {
  connectionSetup: ConnectionSetupOverlayInput;
  feedbackLayer: WorkspaceFeedbackLayerInput;
  galleryActionModals: GalleryActionOverlayInput;
  quickPreview: QuickPreviewOverlayInput;
  shortcutHelp: ComponentProps<typeof ShortcutHelpModal>;
  workspaceSettings: ComponentProps<typeof WorkspaceSettingsModal>;
}

interface DesktopWorkbenchOverlayProps {
  connectionSetup: ComponentProps<typeof ConnectionSetupModal>;
  feedbackLayer: ComponentProps<typeof WorkspaceFeedbackLayer>;
  galleryActionModals: ComponentProps<typeof GalleryActionModals>;
  quickPreview: ComponentProps<typeof QuickPreviewModal>;
  shortcutHelp: ComponentProps<typeof ShortcutHelpModal>;
  workspaceSettings: ComponentProps<typeof WorkspaceSettingsModal>;
}

export const createDesktopWorkbenchQuickPreviewOverlayInput = ({
  assetManagement,
  assetManagementCommands,
  quickPreview,
}: DesktopWorkbenchQuickPreviewOverlayInput): QuickPreviewOverlayInput => ({
  ...quickPreview,
  assetManagement,
  assetManagementCommands,
});

export const createDesktopWorkbenchQuickPreviewAssetManagementCommands = ({
  commands,
}: DesktopWorkbenchQuickPreviewAssetManagementCommandsInput): QuickPreviewOverlayInput['assetManagementCommands'] =>
  commands;

export const createDesktopWorkbenchQuickPreviewAssetManagement = ({
  assetManagement,
}: DesktopWorkbenchQuickPreviewAssetManagementInput): QuickPreviewOverlayInput['assetManagement'] =>
  assetManagement;

export const createDesktopWorkbenchConnectionSetupOverlayInput = ({
  commands,
  form,
  profileFormRefs,
  state,
}: DesktopWorkbenchConnectionSetupOverlayInput): ConnectionSetupOverlayInput => ({
  state,
  commands,
  form,
  refs: profileFormRefs,
});

export const createDesktopWorkbenchConnectionSetupCommands = ({
  commands,
}: DesktopWorkbenchConnectionSetupCommandsInput): ConnectionSetupOverlayInput['commands'] =>
  commands;

export const createDesktopWorkbenchConnectionSetupForm = ({
  form,
}: DesktopWorkbenchConnectionSetupFormInput): ConnectionSetupOverlayInput['form'] =>
  form;

export const createDesktopWorkbenchConnectionSetupState = ({
  state,
}: DesktopWorkbenchConnectionSetupStateInput): ConnectionSetupOverlayInput['state'] =>
  state;

export const createDesktopWorkbenchGalleryActionOverlayInput = ({
  assetAction,
  bulkDelete,
  bulkMove,
  uploadConflict,
}: DesktopWorkbenchGalleryActionOverlayInput): GalleryActionOverlayInput => ({
  uploadConflict,
  bulkMove,
  bulkDelete,
  assetAction,
});

export const createDesktopWorkbenchGalleryActionAssetAction = ({
  assetAction,
}: DesktopWorkbenchGalleryActionAssetActionInput): GalleryActionOverlayInput['assetAction'] =>
  assetAction;

export const createDesktopWorkbenchGalleryActionBulkDelete = ({
  bulkDelete,
}: DesktopWorkbenchGalleryActionBulkDeleteInput): GalleryActionOverlayInput['bulkDelete'] =>
  bulkDelete;

export const createDesktopWorkbenchGalleryActionBulkMove = ({
  bulkMove,
}: DesktopWorkbenchGalleryActionBulkMoveInput): GalleryActionOverlayInput['bulkMove'] =>
  bulkMove;

export const createDesktopWorkbenchGalleryActionUploadConflict = ({
  uploadConflict,
}: DesktopWorkbenchGalleryActionUploadConflictInput): GalleryActionOverlayInput['uploadConflict'] =>
  uploadConflict;

export const createDesktopWorkbenchFeedbackLayerOverlayInput = ({
  commands,
  dropOverlay,
  pendingDelete,
  upload,
}: DesktopWorkbenchFeedbackLayerOverlayInput): WorkspaceFeedbackLayerInput => ({
  commands,
  dropOverlay,
  pendingDelete,
  upload,
});

export const createDesktopWorkbenchFeedbackLayerCommands = ({
  commands,
}: DesktopWorkbenchFeedbackLayerCommandsInput): WorkspaceFeedbackLayerInput['commands'] =>
  commands;

export const createDesktopWorkbenchFeedbackLayerDropOverlay = ({
  dropOverlay,
}: DesktopWorkbenchFeedbackLayerDropOverlayInput): WorkspaceFeedbackLayerInput['dropOverlay'] =>
  dropOverlay;

export const createDesktopWorkbenchFeedbackLayerPendingDelete = ({
  pendingDelete,
}: DesktopWorkbenchFeedbackLayerPendingDeleteInput): WorkspaceFeedbackLayerInput['pendingDelete'] =>
  pendingDelete;

export const createDesktopWorkbenchFeedbackLayerUpload = ({
  upload,
}: DesktopWorkbenchFeedbackLayerUploadInput): WorkspaceFeedbackLayerInput['upload'] =>
  upload;

export const createDesktopWorkbenchShortcutHelp = ({
  shortcutHelp,
}: DesktopWorkbenchShortcutHelpInput): ComponentProps<typeof ShortcutHelpModal> =>
  shortcutHelp;

export const createDesktopWorkbenchOverlayProps = ({
  connectionSetup,
  feedbackLayer,
  galleryActionModals,
  quickPreview,
  shortcutHelp,
  workspaceSettings,
}: DesktopWorkbenchOverlayPropsInput): DesktopWorkbenchOverlayProps => ({
  quickPreview: createQuickPreviewOverlayProps(quickPreview),
  galleryActionModals: createGalleryActionOverlayProps(galleryActionModals),
  shortcutHelp,
  workspaceSettings,
  connectionSetup: createConnectionSetupOverlayProps(connectionSetup),
  feedbackLayer: createWorkspaceFeedbackLayerProps(feedbackLayer),
});
