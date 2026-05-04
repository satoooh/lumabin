import { describe, expect, it, vi } from 'vitest';
import { createGalleryActionOverlayProps } from '../../src/features/gallery/gallery-action-overlay-props';

describe('gallery action overlay props', () => {
  it('maps dialog state and async commands into the gallery action modal contract', () => {
    const handleCloseUploadConflictDialog = vi.fn();
    const handleResolveUploadConflict = vi.fn();
    const handleSubmitBulkMove = vi.fn();
    const handleSubmitBulkDelete = vi.fn();
    const handleSubmitAssetAction = vi.fn();
    const handleChangeBulkMoveDestinationPrefix = vi.fn();
    const handleChangeAssetActionInputValue = vi.fn();
    const handleCloseBulkMoveDialog = vi.fn();
    const handleCloseBulkDeleteDialog = vi.fn();
    const handleCloseAssetActionDialog = vi.fn();

    const props = createGalleryActionOverlayProps({
      uploadConflict: {
        uploadConflictDialog: {
          sources: [
            {
              path: '/tmp/sample.png',
              size: 1024,
            },
          ],
          destinationPrefix: 'photos/',
          conflicts: [
            {
              fileName: 'sample.png',
              key: 'photos/sample.png',
              sourcePath: '/tmp/sample.png',
            },
          ],
          totalConflicts: 1,
        },
        isUploadBusy: false,
        handleCloseUploadConflictDialog,
        handleResolveUploadConflict,
      },
      bulkMove: {
        bulkMoveDialog: {
          keys: ['photos/a.png'],
          destinationPrefix: 'archive/',
        },
        handleChangeBulkMoveDestinationPrefix,
        handleCloseBulkMoveDialog,
        handleSubmitBulkMove,
      },
      bulkDelete: {
        bulkDeleteDialogKeys: ['photos/a.png'],
        handleCloseBulkDeleteDialog,
        handleSubmitBulkDelete,
      },
      assetAction: {
        assetActionDialog: {
          kind: 'rename',
          key: 'photos/a.png',
          inputValue: 'b.png',
        },
        handleChangeAssetActionInputValue,
        handleCloseAssetActionDialog,
        handleSubmitAssetAction,
        isAssetActionBusy: false,
        selectedProfileId: 'profile-1',
      },
    });

    props.onCloseUploadConflict();
    props.onResolveUploadConflict('rename');
    props.onChangeBulkMoveDestinationPrefix('archive/2026/');
    props.onSubmitBulkMove();
    props.onSubmitBulkDelete();
    props.onChangeAssetActionInputValue('c.png');
    props.onSubmitAssetAction();

    expect(handleCloseUploadConflictDialog).toHaveBeenCalledTimes(1);
    expect(handleResolveUploadConflict).toHaveBeenCalledWith('rename');
    expect(handleChangeBulkMoveDestinationPrefix).toHaveBeenCalledWith('archive/2026/');
    expect(handleSubmitBulkMove).toHaveBeenCalledTimes(1);
    expect(handleSubmitBulkDelete).toHaveBeenCalledTimes(1);
    expect(handleChangeAssetActionInputValue).toHaveBeenCalledWith('c.png');
    expect(handleSubmitAssetAction).toHaveBeenCalledTimes(1);
    expect(props.bulkMoveDialog).toMatchObject({ destinationPrefix: 'archive/' });
    expect(props.bulkDeleteDialogKeys).toEqual(['photos/a.png']);
    expect(props.assetActionDialog).toMatchObject({ kind: 'rename' });
    expect(props.basenameFromKey('photos/a.png')).toBe('a.png');
  });
});
