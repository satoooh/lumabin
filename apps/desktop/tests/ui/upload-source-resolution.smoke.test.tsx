import { describe, expect, it, vi } from 'vitest';
import { resolveUploadSources } from '../../src/features/upload/upload-source-resolution';

describe('resolveUploadSources', () => {
  it('uses bridge-provided absolute paths before clipboard persistence', async () => {
    const file = new File(['image'], 'image.png', { type: 'image/png' });

    const result = await resolveUploadSources(
      [{ file, relativePath: '/album//image.png' }],
      {
        getPathForFile: vi.fn(() => '/tmp/image.png'),
        persistClipboardFile: vi.fn(async () => {
          throw new Error('should not persist');
        }),
      },
    );

    expect(result.sources).toEqual([
      {
        path: '/tmp/image.png',
        size: file.size,
        relativePath: 'album/image.png',
      },
    ]);
    expect(result.unresolvedFiles).toEqual([]);
    expect(result.persistedClipboardFileCount).toBe(0);
  });

  it('persists clipboard files when no local path is available', async () => {
    vi.setSystemTime(new Date('2026-05-03T00:00:00.000Z'));
    const file = new File(['clipboard'], '', { type: 'image/png' });
    const persistClipboardFile = vi.fn(async () => '/tmp/clipboard.png');

    const result = await resolveUploadSources([{ file }], {
      getPathForFile: vi.fn(() => ''),
      persistClipboardFile,
    });

    expect(persistClipboardFile).toHaveBeenCalledWith({
      fileName: 'clipboard-1777766400000-1.png',
      mimeType: 'image/png',
      bytes: new Uint8Array(await file.arrayBuffer()),
    });
    expect(result.sources).toEqual([
      {
        path: '/tmp/clipboard.png',
        size: file.size,
      },
    ]);
    expect(result.persistedClipboardFileCount).toBe(1);
  });

  it('reports unresolved files when bridge and clipboard persistence cannot produce paths', async () => {
    const file = new File(['missing'], '', { type: 'application/octet-stream' });

    const result = await resolveUploadSources([{ file }], {
      getPathForFile: vi.fn(() => ''),
      persistClipboardFile: vi.fn(async () => 'relative/path.bin'),
    });

    expect(result.sources).toEqual([]);
    expect(result.unresolvedFiles).toEqual(['clipboard-1']);
    expect(result.persistedClipboardFileCount).toBe(0);
  });
});
