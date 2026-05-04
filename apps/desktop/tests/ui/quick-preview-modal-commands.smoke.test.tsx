import { cleanup, render, waitFor } from '@testing-library/react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { useQuickPreviewModalCommands } from '../../src/features/preview/use-quick-preview-modal-commands';
import type { AssetItem } from '../../src/shared/ipc';

const selectedAsset: AssetItem = {
  contentType: 'image/png',
  etag: 'etag-1',
  key: 'photos/sample.png',
  lastModified: '2026-05-03T00:00:00.000Z',
  size: 1024,
};

type QuickPreviewModalCommands = ReturnType<typeof useQuickPreviewModalCommands>;

interface ProbeProps {
  onReady: (commands: QuickPreviewModalCommands) => void;
  selectedAsset?: AssetItem | null;
}

const Probe = ({ onReady, selectedAsset: asset = selectedAsset }: ProbeProps) => {
  const commands = useQuickPreviewModalCommands({
    copyPublicUrl: vi.fn(async () => undefined),
    copyToClipboard: vi.fn(async () => undefined),
    createPresigned: vi.fn(async () => undefined),
    downloadSelectedAsset: vi.fn(async () => undefined),
    presignedGetUrl: 'https://example.com/get',
    presignedPutUrl: 'https://example.com/put',
    retryMetadata: vi.fn(),
    selectedAsset: asset,
    setIsQuickPreviewInfoOpen: vi.fn(),
    shareSelectedAsset: vi.fn(async () => undefined),
  });

  onReady(commands);
  return null;
};

describe('useQuickPreviewModalCommands', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('builds command groups for sharing and metadata actions', async () => {
    let commands: QuickPreviewModalCommands | undefined;
    const copyPublicUrl = vi.fn(async () => undefined);
    const copyToClipboard = vi.fn(async () => undefined);
    const createPresigned = vi.fn(async () => undefined);
    const downloadSelectedAsset = vi.fn(async () => undefined);
    const retryMetadata = vi.fn();
    const setIsQuickPreviewInfoOpen = vi.fn();
    const shareSelectedAsset = vi.fn(async () => undefined);

    const CustomProbe = () => {
      commands = useQuickPreviewModalCommands({
        copyPublicUrl,
        copyToClipboard,
        createPresigned,
        downloadSelectedAsset,
        presignedGetUrl: 'https://example.com/get',
        presignedPutUrl: 'https://example.com/put',
        retryMetadata,
        selectedAsset,
        setIsQuickPreviewInfoOpen,
        shareSelectedAsset,
      });
      return null;
    };

    render(<CustomProbe />);

    commands?.handleToggleInfoOpen();
    commands?.sharingCommands.onCopyPresignedGetUrl();
    commands?.sharingCommands.onCopyPresignedPutUrl();
    commands?.sharingCommands.onCopyPublicUrl();
    commands?.sharingCommands.onCreatePresignedPut();
    commands?.sharingCommands.onDownloadSelectedAsset();
    commands?.sharingCommands.onShareSelectedAsset();
    commands?.metadataCommands.onCopyAssetKey();
    commands?.metadataCommands.onRetryMetadata();

    expect(setIsQuickPreviewInfoOpen).toHaveBeenCalledWith(expect.any(Function));
    await waitFor(() => {
      expect(copyToClipboard).toHaveBeenCalledWith('https://example.com/get', 'Presigned GET URL');
      expect(copyToClipboard).toHaveBeenCalledWith('https://example.com/put', 'Presigned PUT URL');
      expect(copyToClipboard).toHaveBeenCalledWith('photos/sample.png', 'Asset key');
      expect(copyPublicUrl).toHaveBeenCalledTimes(1);
      expect(createPresigned).toHaveBeenCalledWith('put');
      expect(downloadSelectedAsset).toHaveBeenCalledTimes(1);
      expect(shareSelectedAsset).toHaveBeenCalledTimes(1);
      expect(retryMetadata).toHaveBeenCalledTimes(1);
    });
  });

  it('does not copy an asset key when no asset is selected', async () => {
    let commands: QuickPreviewModalCommands | undefined;
    const copyToClipboard = vi.fn(async () => undefined);

    const CustomProbe = () => {
      commands = useQuickPreviewModalCommands({
        copyPublicUrl: vi.fn(async () => undefined),
        copyToClipboard,
        createPresigned: vi.fn(async () => undefined),
        downloadSelectedAsset: vi.fn(async () => undefined),
        presignedGetUrl: '',
        presignedPutUrl: '',
        retryMetadata: vi.fn(),
        selectedAsset: null,
        setIsQuickPreviewInfoOpen: vi.fn(),
        shareSelectedAsset: vi.fn(async () => undefined),
      });
      return null;
    };

    render(<CustomProbe />);

    commands?.metadataCommands.onCopyAssetKey();
    await waitFor(() => expect(copyToClipboard).not.toHaveBeenCalled());
  });

  it('publishes commands from the probe with default dependencies', async () => {
    let commands: QuickPreviewModalCommands | undefined;

    render(<Probe onReady={(next) => {
      commands = next;
    }} />);

    await waitFor(() => expect(commands).toBeDefined());
  });
});
