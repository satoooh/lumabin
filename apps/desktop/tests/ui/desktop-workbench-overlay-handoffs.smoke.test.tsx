import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createDesktopWorkbenchOverlayCoordinationProps } from '../../src/features/workbench/desktop-workbench-overlay-coordination';
import { createDesktopWorkbenchOverlayCoordinationInput } from '../../src/features/workbench/desktop-workbench-overlay-handoffs';

type OverlayCoordinationInput = Parameters<typeof createDesktopWorkbenchOverlayCoordinationProps>[0];

describe('desktop workbench overlay handoffs', () => {
  it('maps flat root handoffs to the overlay coordination contract', () => {
    const handleSaveProfile = vi.fn();
    const handleCancelUpload = vi.fn();
    const handleOpenAssetRename = vi.fn();
    const workspaceSettingsOverlayProps = {
      isOpen: true,
      onClose: vi.fn(),
    } as unknown as OverlayCoordinationInput['workspaceSettings'];
    const uploadToastRef = createRef<HTMLDivElement>();
    const profileFormRefs: OverlayCoordinationInput['connectionSetupProfileFormRefs'] = {
      profileAccessKeyInputRef: createRef<HTMLInputElement>(),
      profileBucketInputRef: createRef<HTMLInputElement>(),
      profileEndpointInputRef: createRef<HTMLInputElement>(),
      profileNameInputRef: createRef<HTMLInputElement>(),
      profileRegionInputRef: createRef<HTMLInputElement>(),
      profileSecretKeyInputRef: createRef<HTMLInputElement>(),
    };

    const input = createDesktopWorkbenchOverlayCoordinationInput({
      activePendingDeleteJob: null,
      activeUploadJobCount: 1,
      allowStoredSecret: true,
      assetActionDialog: null,
      bulkDeleteDialogKeys: null,
      bulkMoveDialog: null,
      canSaveProfile: true,
      dropOverlayPrefixLabel: 'uploads/',
      executePendingDelete: vi.fn(),
      handleCancelUpload,
      handleChangeAssetActionInputValue: vi.fn(),
      handleChangeBulkMoveDestinationPrefix: vi.fn(),
      handleClearFinishedUploads: vi.fn(),
      handleCloseAssetActionDialog: vi.fn(),
      handleCloseBulkDeleteDialog: vi.fn(),
      handleCloseBulkMoveDialog: vi.fn(),
      handleCloseConnectionSetup: vi.fn(),
      handleCloseShortcutHelp: vi.fn(),
      handleCloseUploadConflictDialog: vi.fn(),
      handleDeleteProfile: vi.fn(),
      handleOpenAssetDelete: vi.fn(),
      handleOpenAssetMove: vi.fn(),
      handleOpenAssetRename,
      handleR2AccountIdChange: vi.fn(),
      handleResolveUploadConflict: vi.fn(),
      handleRetryUpload: vi.fn(),
      handleSaveProfile,
      handleStartNewProfile: vi.fn(),
      handleSubmitAssetAction: vi.fn(),
      handleSubmitBulkDelete: vi.fn(),
      handleSubmitBulkMove: vi.fn(),
      isAssetActionBusy: true,
      isConnectionSetupOpen: true,
      isCreatingProfile: false,
      isDropActive: true,
      isProfileBusy: false,
      isShortcutHelpOpen: false,
      isUploadBusy: true,
      isUploadToastExpanded: false,
      pendingDeleteQueuedMoreCount: 0,
      pendingDeleteRemainingSeconds: 0,
      profileFieldErrors: {},
      profileForm: {
        bucket: 'lumabin-assets',
        endpoint: 'https://example.r2.cloudflarestorage.com',
        name: 'Production',
        provider: 'r2',
        region: 'auto',
      },
      profileFormRefs,
      profileFormValidationErrors: [],
      quickPreviewOverlayInput: {
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
          handleToggleQuickPreviewInfoOpen: vi.fn(),
          isQuickPreviewInfoOpen: false,
          moveQuickPreviewSelection: vi.fn(),
          previewMediaItemsCount: 0,
          selectedPreviewItemIndex: 0,
        },
        selectedAsset: null,
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
      } as unknown as OverlayCoordinationInput['quickPreview'],
      r2AccountId: 'account-id',
      selectedProfileId: 'profile-1',
      setProfileForm: vi.fn(),
      showPendingDeleteToast: false,
      showUploadToast: true,
      totalUploadJobs: 1,
      undoPendingDelete: vi.fn(),
      uploadConflictDialog: null,
      uploadSummaryCanRetry: false,
      uploadSummaryCompactTitle: 'Uploading',
      uploadSummaryJob: null,
      uploadSummaryLastError: null,
      uploadSummaryProgress: 50,
      uploadSummarySubtitle: '1 file',
      uploadSummaryTitle: 'Uploading files',
      uploadToastRef,
      workspaceSettingsOverlayProps,
    });

    expect(input.quickPreviewAssetManagementCommands.onOpenAssetRename).toBe(handleOpenAssetRename);
    expect(input.connectionSetupCommands.handleSaveProfile).toBe(handleSaveProfile);
    expect(input.connectionSetupProfileFormRefs).toBe(profileFormRefs);
    expect(input.feedbackLayerCommands.handleCancelUpload).toBe(handleCancelUpload);
    expect(input.feedbackLayerUpload.uploadToastRef).toBe(uploadToastRef);
    expect(input.workspaceSettings).toBe(workspaceSettingsOverlayProps);
  });
});
