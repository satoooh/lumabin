import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import {
  downloadBlobFromUrl,
  openUrlFallback,
  usePreviewSharingCommands,
} from '../../src/features/preview/use-preview-sharing-commands';
import type { AssetItem } from '../../src/shared/ipc';

const selectedAsset: AssetItem = {
  contentType: 'image/png',
  etag: 'etag-image',
  key: 'photos/image.png',
  lastModified: '2026-05-02T00:00:00.000Z',
  size: 1024,
};

const createSharingApi = () => ({
  createPresignedGet: vi.fn(async () => ({
    expiresAt: '2026-05-02T01:00:00.000Z',
    url: 'https://signed.example/get',
  })),
  createPresignedPut: vi.fn(async () => ({
    expiresAt: '2026-05-02T01:00:00.000Z',
    url: 'https://signed.example/put',
  })),
});

interface ProbeProps {
  action: ReturnType<typeof usePreviewSharingCommands> extends infer Commands
    ? keyof Commands
    : never;
  publicUrlForSelectedAsset?: string;
  setPresignedGetUrl?: (value: string) => void;
  setPresignedPutUrl?: (value: string) => void;
  setStatusLine?: (status: string, tone?: 'neutral' | 'success' | 'error') => void;
  sharingApi?: ReturnType<typeof createSharingApi>;
}

const Probe = ({
  action,
  publicUrlForSelectedAsset = 'https://cdn.example/photos/image.png',
  setPresignedGetUrl = vi.fn(),
  setPresignedPutUrl = vi.fn(),
  setStatusLine = vi.fn(),
  sharingApi = createSharingApi(),
}: ProbeProps) => {
  const commands = usePreviewSharingCommands({
    markCopied: vi.fn(),
    presignedUrlTTLSeconds: 3600,
    publicUrlForSelectedAsset,
    pushInlineFeedback: vi.fn(),
    selectedAsset,
    selectedProfileId: 'profile-1',
    sharingApi,
    setIsSharingBusy: vi.fn(),
    setPresignedGetUrl,
    setPresignedPutUrl,
    setStatusLine,
  });

  useEffect(() => {
    if (action === 'handleCreatePresigned') {
      void commands.handleCreatePresigned('put');
      return;
    }
    if (action === 'handleCopyPublicUrl') {
      void commands.handleCopyPublicUrl();
      return;
    }
    if (action === 'handleShareSelectedAsset') {
      void commands.handleShareSelectedAsset();
    }
  }, [action, commands]);

  return null;
};

describe('preview sharing commands', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('generates and stores a presigned PUT URL', async () => {
    const sharingApi = createSharingApi();
    const setPresignedPutUrl = vi.fn();
    const setStatusLine = vi.fn();

    render(
      <Probe
        action="handleCreatePresigned"
        setPresignedPutUrl={setPresignedPutUrl}
        setStatusLine={setStatusLine}
        sharingApi={sharingApi}
      />,
    );

    await vi.waitFor(() => {
      expect(setPresignedPutUrl).toHaveBeenCalledWith('https://signed.example/put');
    });
    expect(sharingApi.createPresignedPut).toHaveBeenCalledWith({
      expiresInSeconds: 3600,
      key: 'photos/image.png',
      profileId: 'profile-1',
    });
    expect(setStatusLine).toHaveBeenCalledWith('Presigned PUT URL generated', 'success');
  });

  it('reports when a public URL base is missing', async () => {
    const setStatusLine = vi.fn();

    render(
      <Probe
        action="handleCopyPublicUrl"
        publicUrlForSelectedAsset=""
        setStatusLine={setStatusLine}
      />,
    );

    await vi.waitFor(() => {
      expect(setStatusLine).toHaveBeenCalledWith(
        'Set Public URL base in Settings > Connection first.',
        'error',
      );
    });
  });

  it('downloads blobs with the asset file name', async () => {
    const append = vi.spyOn(document.body, 'append');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const objectUrl = 'blob:download';
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(objectUrl);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(window, 'setTimeout').mockImplementation((callback: TimerHandler) => {
      if (typeof callback === 'function') {
        callback();
      }
      return 0;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        blob: async () => new Blob(['image']),
        ok: true,
      })),
    );

    await downloadBlobFromUrl('https://signed.example/get', 'image.png');

    const anchor = append.mock.calls[0]?.[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('image.png');
    expect(anchor.href).toBe(objectUrl);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl);
  });

  it('opens a fallback link for direct download', () => {
    const append = vi.spyOn(document.body, 'append');
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    openUrlFallback('https://signed.example/get');

    const anchor = append.mock.calls[0]?.[0] as HTMLAnchorElement;
    expect(anchor.href).toBe('https://signed.example/get');
    expect(anchor.target).toBe('_blank');
    expect(anchor.rel).toBe('noreferrer noopener');
    expect(click).toHaveBeenCalledTimes(1);
  });
});
