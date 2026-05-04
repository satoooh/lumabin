import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createDesktopWorkbenchOverlayCoordinationProps } from '../../src/features/workbench/desktop-workbench-overlay-coordination';

type OverlayCoordinationInput = Parameters<typeof createDesktopWorkbenchOverlayCoordinationProps>[0];

describe('desktop workbench overlay coordination', () => {
  it('builds overlay props from named modal and feedback handoffs', () => {
    const onOpenAssetDelete = vi.fn();
    const handleSaveProfile = vi.fn();
    const handleCancelUpload = vi.fn();
    const workspaceSettings = {
      isOpen: true,
      onClose: vi.fn(),
    } as unknown as OverlayCoordinationInput['workspaceSettings'];
    const uploadToastRef = createRef<HTMLDivElement>();

    const overlays = createDesktopWorkbenchOverlayCoordinationProps({
      quickPreview: {
        animation: {
          closeQuickPreview: vi.fn(),
          quickPreviewOrigin: null,
          quickPreviewSourceRect: null,
          resolveQuickPreviewCloseTargetRect: vi.fn(() => null),
        },
        formatters: {} as unknown as OverlayCoordinationInput['quickPreview']['formatters'],
        media: {
          assetPreview: null,
          assetPreviewError: '',
          handleImageDecodeError: vi.fn(),
          handlePdfNextPage: vi.fn(),
          handlePdfPrevPage: vi.fn(),
          handleRetrySelectedAssetPreview: vi.fn(),
          handleVideoDecodeError: vi.fn(),
          isPreviewBusy: false,
          pdfPreviewPage: 1,
          previewDataUrl: '',
        },
        metadata: {
          cameraLabel: '-',
          capturedAtLabel: '-',
          isAssetKeyCopied: false,
          isHeadBusy: false,
          lensLabel: '-',
          selectedAssetMetadata: null,
          selectedAssetMetadataError: '',
          shootSettingsLabel: '-',
        },
        metadataCommands: {} as unknown as OverlayCoordinationInput['quickPreview']['metadataCommands'],
        navigation: {
          hasNextPreviewImage: false,
          hasPrevPreviewImage: false,
          isQuickPreviewInfoOpen: false,
          moveQuickPreviewSelection: vi.fn(),
          handleToggleQuickPreviewInfoOpen: vi.fn(),
          previewMediaItemsCount: 0,
          selectedPreviewItemIndex: 0,
        },
        sharing: {
          isPresignedGetCopied: false,
          isPresignedPutCopied: false,
          isPublicUrlCopied: false,
          isShareUrlCopied: false,
          isSharingBusy: false,
          presignedGetUrl: '',
          presignedPutUrl: '',
          publicUrlForSelectedAsset: '',
          selectedProfileId: 'profile-1',
        },
        sharingCommands: {} as unknown as OverlayCoordinationInput['quickPreview']['sharingCommands'],
        state: {
          isQuickPreviewOpen: true,
        },
        selectedAsset: null,
      } as unknown as OverlayCoordinationInput['quickPreview'],
      quickPreviewAssetManagement: {
        isAssetActionBusy: true,
      },
      quickPreviewAssetManagementCommands: {
        onOpenAssetDelete,
        onOpenAssetMove: vi.fn(),
        onOpenAssetRename: vi.fn(),
      },
      connectionSetupState: {
        isConnectionSetupOpen: true,
        isProfileBusy: false,
        selectedProfileId: 'profile-1',
      },
      connectionSetupCommands: {
        handleCloseConnectionSetup: vi.fn(),
        handleDeleteProfile: vi.fn(),
        handleR2AccountIdChange: vi.fn(),
        handleSaveProfile,
        handleStartNewProfile: vi.fn(),
      },
      connectionSetupForm: {
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
      connectionSetupProfileFormRefs: {
        profileAccessKeyInputRef: createRef<HTMLInputElement>(),
        profileBucketInputRef: createRef<HTMLInputElement>(),
        profileEndpointInputRef: createRef<HTMLInputElement>(),
        profileNameInputRef: createRef<HTMLInputElement>(),
        profileRegionInputRef: createRef<HTMLInputElement>(),
        profileSecretKeyInputRef: createRef<HTMLInputElement>(),
      },
      galleryActionUploadConflict: {
        uploadConflictDialog: null,
        isUploadBusy: false,
        handleCloseUploadConflictDialog: vi.fn(),
        handleResolveUploadConflict: vi.fn(),
      },
      galleryActionBulkMove: {
        bulkMoveDialog: null,
        handleCloseBulkMoveDialog: vi.fn(),
        handleChangeBulkMoveDestinationPrefix: vi.fn(),
        handleSubmitBulkMove: vi.fn(),
      },
      galleryActionBulkDelete: {
        bulkDeleteDialogKeys: null,
        handleCloseBulkDeleteDialog: vi.fn(),
        handleSubmitBulkDelete: vi.fn(),
      },
      galleryActionAssetAction: {
        assetActionDialog: null,
        handleChangeAssetActionInputValue: vi.fn(),
        handleCloseAssetActionDialog: vi.fn(),
        handleSubmitAssetAction: vi.fn(),
        isAssetActionBusy: true,
        selectedProfileId: 'profile-1',
      },
      feedbackLayerCommands: {
        handleCancelUpload,
        handleClearFinishedUploads: vi.fn(),
        handleRetryUpload: vi.fn(),
        executePendingDelete: vi.fn(),
        undoPendingDelete: vi.fn(),
      },
      feedbackLayerDropOverlay: {
        dropOverlayPrefixLabel: 'uploads/',
        isDropActive: true,
      },
      feedbackLayerPendingDelete: {
        activePendingDeleteJob: null,
        pendingDeleteQueuedMoreCount: 0,
        pendingDeleteRemainingSeconds: 0,
        showPendingDeleteToast: false,
      },
      feedbackLayerUpload: {
        activeUploadJobCount: 1,
        isUploadBusy: true,
        isUploadToastExpanded: false,
        showUploadToast: true,
        totalUploadJobs: 1,
        uploadSummaryCanRetry: false,
        uploadSummaryCompactTitle: 'Uploading',
        uploadSummaryJob: null,
        uploadSummaryLastError: null,
        uploadSummaryProgress: 50,
        uploadSummarySubtitle: '1 file',
        uploadSummaryTitle: 'Uploading files',
        uploadToastRef,
      },
      shortcutHelp: {
        isOpen: false,
        onClose: vi.fn(),
      },
      workspaceSettings,
    });

    overlays.quickPreview.assetManagementCommands.onOpenAssetDelete();
    void overlays.connectionSetup.onSaveProfile();
    overlays.feedbackLayer.onCancelUpload('job-1');

    expect(overlays.quickPreview.isOpen).toBe(true);
    expect(overlays.connectionSetup).toMatchObject({
      isOpen: true,
      selectedProfileId: 'profile-1',
    });
    expect(overlays.galleryActionModals).toMatchObject({
      isAssetActionBusy: true,
      selectedProfileId: 'profile-1',
    });
    expect(overlays.feedbackLayer.dropOverlay).toMatchObject({
      isActive: true,
      prefixLabel: 'uploads/',
    });
    expect(overlays.feedbackLayer.upload.ref).toBe(uploadToastRef);
    expect(overlays.workspaceSettings).toBe(workspaceSettings);
    expect(onOpenAssetDelete).toHaveBeenCalledTimes(1);
    expect(handleSaveProfile).toHaveBeenCalledTimes(1);
    expect(handleCancelUpload).toHaveBeenCalledWith('job-1');
  });
});
