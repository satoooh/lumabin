import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
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
  createDesktopWorkbenchQuickPreviewAssetManagement,
  createDesktopWorkbenchQuickPreviewAssetManagementCommands,
  createDesktopWorkbenchQuickPreviewOverlayInput,
  createDesktopWorkbenchShortcutHelp,
  type DesktopWorkbenchQuickPreviewBaseInput,
} from '../../src/features/workbench/desktop-workbench-overlays';

describe('desktop workbench overlays', () => {
  it('adds asset action handoff to preview-owned overlay input', () => {
    const onOpenAssetDelete = vi.fn();
    const onOpenAssetMove = vi.fn();
    const onOpenAssetRename = vi.fn();
    const quickPreview = {
      state: {
        isQuickPreviewOpen: true,
      },
      selectedAsset: null,
    } as unknown as DesktopWorkbenchQuickPreviewBaseInput;

    const input = createDesktopWorkbenchQuickPreviewOverlayInput({
      quickPreview,
      assetManagement: createDesktopWorkbenchQuickPreviewAssetManagement({
        assetManagement: {
          isAssetActionBusy: true,
        },
      }),
      assetManagementCommands: createDesktopWorkbenchQuickPreviewAssetManagementCommands({
        commands: {
          onOpenAssetDelete,
          onOpenAssetMove,
          onOpenAssetRename,
        },
      }),
    });

    input.assetManagementCommands.onOpenAssetDelete();
    input.assetManagementCommands.onOpenAssetMove();
    input.assetManagementCommands.onOpenAssetRename();

    expect(input).toMatchObject({
      state: {
        isQuickPreviewOpen: true,
      },
      selectedAsset: null,
      assetManagement: {
        isAssetActionBusy: true,
      },
    });
    expect(onOpenAssetDelete).toHaveBeenCalledTimes(1);
    expect(onOpenAssetMove).toHaveBeenCalledTimes(1);
    expect(onOpenAssetRename).toHaveBeenCalledTimes(1);
  });

  it('keeps profile form refs bundled for connection setup overlay input', () => {
    const profileFormRefs = {
      profileAccessKeyInputRef: createRef<HTMLInputElement>(),
      profileBucketInputRef: createRef<HTMLInputElement>(),
      profileEndpointInputRef: createRef<HTMLInputElement>(),
      profileNameInputRef: createRef<HTMLInputElement>(),
      profileRegionInputRef: createRef<HTMLInputElement>(),
      profileSecretKeyInputRef: createRef<HTMLInputElement>(),
    };

    const input = createDesktopWorkbenchConnectionSetupOverlayInput({
      state: createDesktopWorkbenchConnectionSetupState({
        state: {
          isConnectionSetupOpen: true,
          isProfileBusy: false,
          selectedProfileId: 'profile-1',
        },
      }),
      commands: createDesktopWorkbenchConnectionSetupCommands({
        commands: {
          handleCloseConnectionSetup: vi.fn(),
          handleDeleteProfile: vi.fn(),
          handleR2AccountIdChange: vi.fn(),
          handleSaveProfile: vi.fn(),
          handleStartNewProfile: vi.fn(),
        },
      }),
      form: createDesktopWorkbenchConnectionSetupForm({
        form: {
          allowStoredSecret: true,
          canSaveProfile: true,
          isCreatingProfile: false,
          profileFieldErrors: {},
          profileForm: {
            bucket: 'lumabin-assets',
            endpoint: 'https://example.r2.cloudflarestorage.com',
            name: 'Production',
            provider: 'r2',
            region: 'auto',
          },
          profileFormValidationErrors: [],
          r2AccountId: 'account-id',
          setProfileForm: vi.fn(),
        },
      }),
      profileFormRefs,
    });

    expect(input.state).toMatchObject({
      isConnectionSetupOpen: true,
      selectedProfileId: 'profile-1',
    });
    expect(input.refs).toBe(profileFormRefs);
    expect(input.form.profileForm).toMatchObject({
      bucket: 'lumabin-assets',
      provider: 'r2',
    });
  });

  it('names gallery action modal handoff groups before overlay prop conversion', () => {
    const handleResolveUploadConflict = vi.fn();
    const handleSubmitAssetAction = vi.fn();

    const input = createDesktopWorkbenchGalleryActionOverlayInput({
      uploadConflict: createDesktopWorkbenchGalleryActionUploadConflict({
        uploadConflict: {
          uploadConflictDialog: null,
          isUploadBusy: false,
          setUploadConflictDialog: vi.fn(),
          handleResolveUploadConflict,
        },
      }),
      bulkMove: createDesktopWorkbenchGalleryActionBulkMove({
        bulkMove: {
          bulkMoveDialog: null,
          handleCloseBulkMoveDialog: vi.fn(),
          handleChangeBulkMoveDestinationPrefix: vi.fn(),
          handleSubmitBulkMove: vi.fn(),
        },
      }),
      bulkDelete: createDesktopWorkbenchGalleryActionBulkDelete({
        bulkDelete: {
          bulkDeleteDialogKeys: null,
          handleCloseBulkDeleteDialog: vi.fn(),
          handleSubmitBulkDelete: vi.fn(),
        },
      }),
      assetAction: createDesktopWorkbenchGalleryActionAssetAction({
        assetAction: {
          assetActionDialog: null,
          handleChangeAssetActionInputValue: vi.fn(),
          handleCloseAssetActionDialog: vi.fn(),
          handleSubmitAssetAction,
          isAssetActionBusy: true,
          selectedProfileId: 'profile-1',
        },
      }),
    });

    void input.uploadConflict.handleResolveUploadConflict('replace');
    void input.assetAction.handleSubmitAssetAction();

    expect(input.uploadConflict.isUploadBusy).toBe(false);
    expect(input.assetAction).toMatchObject({
      isAssetActionBusy: true,
      selectedProfileId: 'profile-1',
    });
    expect(handleResolveUploadConflict).toHaveBeenCalledWith('replace');
    expect(handleSubmitAssetAction).toHaveBeenCalledTimes(1);
  });

  it('keeps feedback layer state and commands bundled as an overlay handoff', () => {
    const handleCancelUpload = vi.fn();
    const executePendingDelete = vi.fn();
    const uploadToastRef = createRef<HTMLDivElement>();

    const input = createDesktopWorkbenchFeedbackLayerOverlayInput({
      commands: createDesktopWorkbenchFeedbackLayerCommands({
        commands: {
          handleCancelUpload,
          handleClearFinishedUploads: vi.fn(),
          handleRetryUpload: vi.fn(),
          executePendingDelete,
          undoPendingDelete: vi.fn(),
        },
      }),
      dropOverlay: createDesktopWorkbenchFeedbackLayerDropOverlay({
        dropOverlay: {
          dropOverlayPrefixLabel: 'uploads/',
          isDropActive: true,
        },
      }),
      pendingDelete: createDesktopWorkbenchFeedbackLayerPendingDelete({
        pendingDelete: {
          activePendingDeleteJob: null,
          pendingDeleteQueuedMoreCount: 2,
          pendingDeleteRemainingSeconds: 4,
          showPendingDeleteToast: true,
        },
      }),
      upload: createDesktopWorkbenchFeedbackLayerUpload({
        upload: {
          activeUploadJobCount: 1,
          isUploadBusy: true,
          isUploadToastExpanded: false,
          showUploadToast: true,
          totalUploadJobs: 3,
          uploadSummaryCanRetry: false,
          uploadSummaryCompactTitle: 'Uploading',
          uploadSummaryJob: null,
          uploadSummaryLastError: null,
          uploadSummaryProgress: 45,
          uploadSummarySubtitle: '1 of 3',
          uploadSummaryTitle: 'Uploading files',
          uploadToastRef,
        },
      }),
    });

    void input.commands.handleCancelUpload('job-1');
    void input.commands.executePendingDelete('delete-1');

    expect(input.dropOverlay).toMatchObject({
      dropOverlayPrefixLabel: 'uploads/',
      isDropActive: true,
    });
    expect(input.pendingDelete.showPendingDeleteToast).toBe(true);
    expect(input.upload.uploadToastRef).toBe(uploadToastRef);
    expect(handleCancelUpload).toHaveBeenCalledWith('job-1');
    expect(executePendingDelete).toHaveBeenCalledWith('delete-1');
  });

  it('names shortcut help overlay handoff before overlay prop conversion', () => {
    const onClose = vi.fn();

    const shortcutHelp = createDesktopWorkbenchShortcutHelp({
      shortcutHelp: {
        isOpen: true,
        onClose,
      },
    });

    shortcutHelp.onClose();

    expect(shortcutHelp.isOpen).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
