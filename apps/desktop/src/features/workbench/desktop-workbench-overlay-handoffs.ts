import type { createDesktopWorkbenchOverlayCoordinationProps } from './desktop-workbench-overlay-coordination';

type OverlayCoordinationInput = Parameters<typeof createDesktopWorkbenchOverlayCoordinationProps>[0];
type ConnectionSetupCommands = OverlayCoordinationInput['connectionSetupCommands'];
type ConnectionSetupForm = OverlayCoordinationInput['connectionSetupForm'];
type ConnectionSetupState = OverlayCoordinationInput['connectionSetupState'];
type FeedbackLayerCommands = OverlayCoordinationInput['feedbackLayerCommands'];
type FeedbackLayerDropOverlay = OverlayCoordinationInput['feedbackLayerDropOverlay'];
type FeedbackLayerPendingDelete = OverlayCoordinationInput['feedbackLayerPendingDelete'];
type FeedbackLayerUpload = OverlayCoordinationInput['feedbackLayerUpload'];
type GalleryActionAssetAction = OverlayCoordinationInput['galleryActionAssetAction'];
type GalleryActionBulkDelete = OverlayCoordinationInput['galleryActionBulkDelete'];
type GalleryActionBulkMove = OverlayCoordinationInput['galleryActionBulkMove'];
type GalleryActionUploadConflict = OverlayCoordinationInput['galleryActionUploadConflict'];
type QuickPreviewAssetManagementCommands =
  OverlayCoordinationInput['quickPreviewAssetManagementCommands'];
type ShortcutHelp = OverlayCoordinationInput['shortcutHelp'];

interface DesktopWorkbenchOverlayHandoffInput {
  activePendingDeleteJob: FeedbackLayerPendingDelete['activePendingDeleteJob'];
  activeUploadJobCount: FeedbackLayerUpload['activeUploadJobCount'];
  allowStoredSecret: ConnectionSetupForm['allowStoredSecret'];
  assetActionDialog: GalleryActionAssetAction['assetActionDialog'];
  bulkDeleteDialogKeys: GalleryActionBulkDelete['bulkDeleteDialogKeys'];
  bulkMoveDialog: GalleryActionBulkMove['bulkMoveDialog'];
  canSaveProfile: ConnectionSetupForm['canSaveProfile'];
  cancelDiscardConfirmation: ConnectionSetupCommands['cancelDiscardConfirmation'];
  confirmDiscardChanges: ConnectionSetupCommands['confirmDiscardChanges'];
  dropOverlayPrefixLabel: FeedbackLayerDropOverlay['dropOverlayPrefixLabel'];
  executePendingDelete: FeedbackLayerCommands['executePendingDelete'];
  handleCancelUpload: FeedbackLayerCommands['handleCancelUpload'];
  handleChangeAssetActionInputValue: GalleryActionAssetAction['handleChangeAssetActionInputValue'];
  handleChangeBulkMoveDestinationPrefix: GalleryActionBulkMove['handleChangeBulkMoveDestinationPrefix'];
  handleClearFinishedUploads: FeedbackLayerCommands['handleClearFinishedUploads'];
  handleCloseAssetActionDialog: GalleryActionAssetAction['handleCloseAssetActionDialog'];
  handleCloseBulkDeleteDialog: GalleryActionBulkDelete['handleCloseBulkDeleteDialog'];
  handleCloseBulkMoveDialog: GalleryActionBulkMove['handleCloseBulkMoveDialog'];
  handleCloseConnectionSetup: ConnectionSetupCommands['handleCloseConnectionSetup'];
  handleCloseShortcutHelp: ShortcutHelp['onClose'];
  handleCloseUploadConflictDialog: GalleryActionUploadConflict['handleCloseUploadConflictDialog'];
  handleDeleteProfile: ConnectionSetupCommands['handleDeleteProfile'];
  handleOpenAssetDelete: QuickPreviewAssetManagementCommands['onOpenAssetDelete'];
  handleOpenAssetMove: QuickPreviewAssetManagementCommands['onOpenAssetMove'];
  handleOpenAssetRename: QuickPreviewAssetManagementCommands['onOpenAssetRename'];
  handleR2AccountIdChange: ConnectionSetupCommands['handleR2AccountIdChange'];
  handleResolveUploadConflict: GalleryActionUploadConflict['handleResolveUploadConflict'];
  handleRetryUpload: FeedbackLayerCommands['handleRetryUpload'];
  handleSaveProfile: ConnectionSetupCommands['handleSaveProfile'];
  handleStartNewProfile: ConnectionSetupCommands['handleStartNewProfile'];
  handleSubmitAssetAction: GalleryActionAssetAction['handleSubmitAssetAction'];
  handleSubmitBulkDelete: GalleryActionBulkDelete['handleSubmitBulkDelete'];
  handleSubmitBulkMove: GalleryActionBulkMove['handleSubmitBulkMove'];
  isAssetActionBusy: GalleryActionAssetAction['isAssetActionBusy'];
  isConnectionSetupOpen: ConnectionSetupState['isConnectionSetupOpen'];
  isCreatingProfile: ConnectionSetupForm['isCreatingProfile'];
  isProfileDiscardConfirming: ConnectionSetupState['isDiscardConfirming'];
  isDropActive: FeedbackLayerDropOverlay['isDropActive'];
  isProfileBusy: ConnectionSetupState['isProfileBusy'];
  isShortcutHelpOpen: ShortcutHelp['isOpen'];
  isUploadBusy: GalleryActionUploadConflict['isUploadBusy'];
  isUploadToastExpanded: FeedbackLayerUpload['isUploadToastExpanded'];
  pendingDeleteQueuedMoreCount: FeedbackLayerPendingDelete['pendingDeleteQueuedMoreCount'];
  pendingDeleteRemainingSeconds: FeedbackLayerPendingDelete['pendingDeleteRemainingSeconds'];
  profileFieldErrors: ConnectionSetupForm['profileFieldErrors'];
  profileForm: ConnectionSetupForm['profileForm'];
  profileFormRefs: OverlayCoordinationInput['connectionSetupProfileFormRefs'];
  profileFormValidationErrors: ConnectionSetupForm['profileFormValidationErrors'];
  quickPreviewOverlayInput: OverlayCoordinationInput['quickPreview'];
  r2AccountId: ConnectionSetupForm['r2AccountId'];
  selectedProfileId: ConnectionSetupState['selectedProfileId'];
  setProfileForm: ConnectionSetupForm['setProfileForm'];
  showPendingDeleteToast: FeedbackLayerPendingDelete['showPendingDeleteToast'];
  showUploadToast: FeedbackLayerUpload['showUploadToast'];
  totalUploadJobs: FeedbackLayerUpload['totalUploadJobs'];
  undoPendingDelete: FeedbackLayerCommands['undoPendingDelete'];
  uploadConflictDialog: GalleryActionUploadConflict['uploadConflictDialog'];
  uploadSummaryCanRetry: FeedbackLayerUpload['uploadSummaryCanRetry'];
  uploadSummaryCompactTitle: FeedbackLayerUpload['uploadSummaryCompactTitle'];
  uploadSummaryJob: FeedbackLayerUpload['uploadSummaryJob'];
  uploadSummaryLastError: FeedbackLayerUpload['uploadSummaryLastError'];
  uploadSummaryProgress: FeedbackLayerUpload['uploadSummaryProgress'];
  uploadSummarySubtitle: FeedbackLayerUpload['uploadSummarySubtitle'];
  uploadSummaryTitle: FeedbackLayerUpload['uploadSummaryTitle'];
  uploadToastRef: FeedbackLayerUpload['uploadToastRef'];
  workspaceSettingsOverlayProps: OverlayCoordinationInput['workspaceSettings'];
}

export const createDesktopWorkbenchOverlayCoordinationInput = ({
  activePendingDeleteJob,
  activeUploadJobCount,
  allowStoredSecret,
  assetActionDialog,
  bulkDeleteDialogKeys,
  bulkMoveDialog,
  canSaveProfile,
  cancelDiscardConfirmation,
  confirmDiscardChanges,
  dropOverlayPrefixLabel,
  executePendingDelete,
  handleCancelUpload,
  handleChangeAssetActionInputValue,
  handleChangeBulkMoveDestinationPrefix,
  handleClearFinishedUploads,
  handleCloseAssetActionDialog,
  handleCloseBulkDeleteDialog,
  handleCloseBulkMoveDialog,
  handleCloseConnectionSetup,
  handleCloseShortcutHelp,
  handleCloseUploadConflictDialog,
  handleDeleteProfile,
  handleOpenAssetDelete,
  handleOpenAssetMove,
  handleOpenAssetRename,
  handleR2AccountIdChange,
  handleResolveUploadConflict,
  handleRetryUpload,
  handleSaveProfile,
  handleStartNewProfile,
  handleSubmitAssetAction,
  handleSubmitBulkDelete,
  handleSubmitBulkMove,
  isAssetActionBusy,
  isConnectionSetupOpen,
  isCreatingProfile,
  isProfileDiscardConfirming,
  isDropActive,
  isProfileBusy,
  isShortcutHelpOpen,
  isUploadBusy,
  isUploadToastExpanded,
  pendingDeleteQueuedMoreCount,
  pendingDeleteRemainingSeconds,
  profileFieldErrors,
  profileForm,
  profileFormRefs,
  profileFormValidationErrors,
  quickPreviewOverlayInput,
  r2AccountId,
  selectedProfileId,
  setProfileForm,
  showPendingDeleteToast,
  showUploadToast,
  totalUploadJobs,
  undoPendingDelete,
  uploadConflictDialog,
  uploadSummaryCanRetry,
  uploadSummaryCompactTitle,
  uploadSummaryJob,
  uploadSummaryLastError,
  uploadSummaryProgress,
  uploadSummarySubtitle,
  uploadSummaryTitle,
  uploadToastRef,
  workspaceSettingsOverlayProps,
}: DesktopWorkbenchOverlayHandoffInput): OverlayCoordinationInput => ({
  quickPreview: quickPreviewOverlayInput,
  quickPreviewAssetManagement: {
    isAssetActionBusy,
  },
  quickPreviewAssetManagementCommands: {
    onOpenAssetDelete: handleOpenAssetDelete,
    onOpenAssetMove: handleOpenAssetMove,
    onOpenAssetRename: handleOpenAssetRename,
  },
  connectionSetupState: {
    isConnectionSetupOpen,
    isDiscardConfirming: isProfileDiscardConfirming,
    isProfileBusy,
    selectedProfileId,
  },
  connectionSetupCommands: {
    cancelDiscardConfirmation,
    confirmDiscardChanges,
    handleCloseConnectionSetup,
    handleDeleteProfile,
    handleR2AccountIdChange,
    handleSaveProfile,
    handleStartNewProfile,
  },
  connectionSetupForm: {
    allowStoredSecret,
    canSaveProfile,
    isCreatingProfile,
    profileFieldErrors,
    profileForm,
    profileFormValidationErrors,
    r2AccountId,
    setProfileForm,
  },
  connectionSetupProfileFormRefs: profileFormRefs,
  galleryActionUploadConflict: {
    uploadConflictDialog,
    isUploadBusy,
    handleCloseUploadConflictDialog,
    handleResolveUploadConflict,
  },
  galleryActionBulkMove: {
    bulkMoveDialog,
    handleCloseBulkMoveDialog,
    handleChangeBulkMoveDestinationPrefix,
    handleSubmitBulkMove,
  },
  galleryActionBulkDelete: {
    bulkDeleteDialogKeys,
    handleCloseBulkDeleteDialog,
    handleSubmitBulkDelete,
  },
  galleryActionAssetAction: {
    assetActionDialog,
    handleChangeAssetActionInputValue,
    handleCloseAssetActionDialog,
    handleSubmitAssetAction,
    isAssetActionBusy,
    selectedProfileId,
  },
  feedbackLayerCommands: {
    handleCancelUpload,
    handleClearFinishedUploads,
    handleRetryUpload,
    executePendingDelete,
    undoPendingDelete,
  },
  feedbackLayerDropOverlay: {
    dropOverlayPrefixLabel,
    isDropActive,
  },
  feedbackLayerPendingDelete: {
    activePendingDeleteJob,
    pendingDeleteQueuedMoreCount,
    pendingDeleteRemainingSeconds,
    showPendingDeleteToast,
  },
  feedbackLayerUpload: {
    activeUploadJobCount,
    isUploadBusy,
    isUploadToastExpanded,
    showUploadToast,
    totalUploadJobs,
    uploadSummaryCanRetry,
    uploadSummaryCompactTitle,
    uploadSummaryJob,
    uploadSummaryLastError,
    uploadSummaryProgress,
    uploadSummarySubtitle,
    uploadSummaryTitle,
    uploadToastRef,
  },
  shortcutHelp: {
    isOpen: isShortcutHelpOpen,
    onClose: handleCloseShortcutHelp,
  },
  workspaceSettings: workspaceSettingsOverlayProps,
});
