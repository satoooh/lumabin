import {
  createDesktopWorkbenchConnectionSetupCommands,
  createDesktopWorkbenchConnectionSetupForm,
  createDesktopWorkbenchConnectionSetupOverlayInput,
  createDesktopWorkbenchConnectionSetupState,
  createDesktopWorkbenchFeedbackLayerCommands,
  createDesktopWorkbenchFeedbackLayerDropOverlay,
  createDesktopWorkbenchFeedbackLayerOverlayInput,
  createDesktopWorkbenchFeedbackLayerPendingDelete,
  createDesktopWorkbenchFeedbackLayerUpload,
  createDesktopWorkbenchGalleryActionAssetAction,
  createDesktopWorkbenchGalleryActionBulkDelete,
  createDesktopWorkbenchGalleryActionBulkMove,
  createDesktopWorkbenchGalleryActionOverlayInput,
  createDesktopWorkbenchGalleryActionUploadConflict,
  createDesktopWorkbenchOverlayProps,
  createDesktopWorkbenchQuickPreviewAssetManagement,
  createDesktopWorkbenchQuickPreviewAssetManagementCommands,
  createDesktopWorkbenchQuickPreviewOverlayInput,
  createDesktopWorkbenchShortcutHelp,
} from './desktop-workbench-overlays';

type QuickPreviewInput = Parameters<
  typeof createDesktopWorkbenchQuickPreviewOverlayInput
>[0]['quickPreview'];
type QuickPreviewAssetManagement = Parameters<
  typeof createDesktopWorkbenchQuickPreviewAssetManagement
>[0]['assetManagement'];
type QuickPreviewAssetManagementCommands = Parameters<
  typeof createDesktopWorkbenchQuickPreviewAssetManagementCommands
>[0]['commands'];
type ConnectionSetupState = Parameters<
  typeof createDesktopWorkbenchConnectionSetupState
>[0]['state'];
type ConnectionSetupCommands = Parameters<
  typeof createDesktopWorkbenchConnectionSetupCommands
>[0]['commands'];
type ConnectionSetupForm = Parameters<
  typeof createDesktopWorkbenchConnectionSetupForm
>[0]['form'];
type ConnectionSetupProfileFormRefs = Parameters<
  typeof createDesktopWorkbenchConnectionSetupOverlayInput
>[0]['profileFormRefs'];
type GalleryActionUploadConflict = Parameters<
  typeof createDesktopWorkbenchGalleryActionUploadConflict
>[0]['uploadConflict'];
type GalleryActionBulkMove = Parameters<
  typeof createDesktopWorkbenchGalleryActionBulkMove
>[0]['bulkMove'];
type GalleryActionBulkDelete = Parameters<
  typeof createDesktopWorkbenchGalleryActionBulkDelete
>[0]['bulkDelete'];
type GalleryActionAssetAction = Parameters<
  typeof createDesktopWorkbenchGalleryActionAssetAction
>[0]['assetAction'];
type FeedbackLayerCommands = Parameters<
  typeof createDesktopWorkbenchFeedbackLayerCommands
>[0]['commands'];
type FeedbackLayerDropOverlay = Parameters<
  typeof createDesktopWorkbenchFeedbackLayerDropOverlay
>[0]['dropOverlay'];
type FeedbackLayerPendingDelete = Parameters<
  typeof createDesktopWorkbenchFeedbackLayerPendingDelete
>[0]['pendingDelete'];
type FeedbackLayerUpload = Parameters<
  typeof createDesktopWorkbenchFeedbackLayerUpload
>[0]['upload'];
type ShortcutHelp = Parameters<typeof createDesktopWorkbenchShortcutHelp>[0]['shortcutHelp'];
type WorkspaceSettings = Parameters<typeof createDesktopWorkbenchOverlayProps>[0]['workspaceSettings'];

interface CreateDesktopWorkbenchOverlayCoordinationPropsInput {
  connectionSetupCommands: ConnectionSetupCommands;
  connectionSetupForm: ConnectionSetupForm;
  connectionSetupProfileFormRefs: ConnectionSetupProfileFormRefs;
  connectionSetupState: ConnectionSetupState;
  feedbackLayerCommands: FeedbackLayerCommands;
  feedbackLayerDropOverlay: FeedbackLayerDropOverlay;
  feedbackLayerPendingDelete: FeedbackLayerPendingDelete;
  feedbackLayerUpload: FeedbackLayerUpload;
  galleryActionAssetAction: GalleryActionAssetAction;
  galleryActionBulkDelete: GalleryActionBulkDelete;
  galleryActionBulkMove: GalleryActionBulkMove;
  galleryActionUploadConflict: GalleryActionUploadConflict;
  quickPreview: QuickPreviewInput;
  quickPreviewAssetManagement: QuickPreviewAssetManagement;
  quickPreviewAssetManagementCommands: QuickPreviewAssetManagementCommands;
  shortcutHelp: ShortcutHelp;
  workspaceSettings: WorkspaceSettings;
}

export const createDesktopWorkbenchOverlayCoordinationProps = ({
  connectionSetupCommands,
  connectionSetupForm,
  connectionSetupProfileFormRefs,
  connectionSetupState,
  feedbackLayerCommands,
  feedbackLayerDropOverlay,
  feedbackLayerPendingDelete,
  feedbackLayerUpload,
  galleryActionAssetAction,
  galleryActionBulkDelete,
  galleryActionBulkMove,
  galleryActionUploadConflict,
  quickPreview,
  quickPreviewAssetManagement,
  quickPreviewAssetManagementCommands,
  shortcutHelp,
  workspaceSettings,
}: CreateDesktopWorkbenchOverlayCoordinationPropsInput) => {
  const quickPreviewOverlay = createDesktopWorkbenchQuickPreviewOverlayInput({
    quickPreview,
    assetManagement: createDesktopWorkbenchQuickPreviewAssetManagement({
      assetManagement: quickPreviewAssetManagement,
    }),
    assetManagementCommands: createDesktopWorkbenchQuickPreviewAssetManagementCommands({
      commands: quickPreviewAssetManagementCommands,
    }),
  });

  const connectionSetupOverlay = createDesktopWorkbenchConnectionSetupOverlayInput({
    state: createDesktopWorkbenchConnectionSetupState({
      state: connectionSetupState,
    }),
    commands: createDesktopWorkbenchConnectionSetupCommands({
      commands: connectionSetupCommands,
    }),
    form: createDesktopWorkbenchConnectionSetupForm({
      form: connectionSetupForm,
    }),
    profileFormRefs: connectionSetupProfileFormRefs,
  });

  const galleryActionOverlay = createDesktopWorkbenchGalleryActionOverlayInput({
    uploadConflict: createDesktopWorkbenchGalleryActionUploadConflict({
      uploadConflict: galleryActionUploadConflict,
    }),
    bulkMove: createDesktopWorkbenchGalleryActionBulkMove({
      bulkMove: galleryActionBulkMove,
    }),
    bulkDelete: createDesktopWorkbenchGalleryActionBulkDelete({
      bulkDelete: galleryActionBulkDelete,
    }),
    assetAction: createDesktopWorkbenchGalleryActionAssetAction({
      assetAction: galleryActionAssetAction,
    }),
  });

  const feedbackLayerOverlay = createDesktopWorkbenchFeedbackLayerOverlayInput({
    commands: createDesktopWorkbenchFeedbackLayerCommands({
      commands: feedbackLayerCommands,
    }),
    dropOverlay: createDesktopWorkbenchFeedbackLayerDropOverlay({
      dropOverlay: feedbackLayerDropOverlay,
    }),
    pendingDelete: createDesktopWorkbenchFeedbackLayerPendingDelete({
      pendingDelete: feedbackLayerPendingDelete,
    }),
    upload: createDesktopWorkbenchFeedbackLayerUpload({
      upload: feedbackLayerUpload,
    }),
  });

  return createDesktopWorkbenchOverlayProps({
    quickPreview: quickPreviewOverlay,
    galleryActionModals: galleryActionOverlay,
    shortcutHelp: createDesktopWorkbenchShortcutHelp({
      shortcutHelp,
    }),
    workspaceSettings,
    connectionSetup: connectionSetupOverlay,
    feedbackLayer: feedbackLayerOverlay,
  });
};
