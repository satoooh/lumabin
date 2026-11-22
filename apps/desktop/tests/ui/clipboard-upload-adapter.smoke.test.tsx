import { Blob } from 'node:buffer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readSystemClipboardPng } from '../../src/main/clipboard-upload-adapter';

const { readClipboard, decodeImage } = vi.hoisted(() => ({
  readClipboard: vi.fn(),
  decodeImage: vi.fn(),
}));

vi.mock('electron', () => ({
  clipboard: { read: readClipboard },
  nativeImage: { createFromBuffer: decodeImage },
}));

const clipboardItem = (type: string, bytes: number[]) => ({
  types: [type],
  getType: vi.fn(async () => new Blob([Uint8Array.from(bytes)], { type })),
});

describe('readSystemClipboardPng', () => {
  beforeEach(() => vi.resetAllMocks());

  it('prefers PNG to JPEG across clipboard items', async () => {
    const jpeg = clipboardItem('image/jpeg', [1]);
    const png = clipboardItem('image/png', [2]);
    const pngBytes = Buffer.from([2]);
    readClipboard.mockResolvedValue([jpeg, png]);
    decodeImage.mockReturnValue({ isEmpty: () => false, toPNG: () => pngBytes });

    await expect(readSystemClipboardPng()).resolves.toEqual(pngBytes);
    expect(decodeImage).toHaveBeenCalledWith(pngBytes);
    expect(jpeg.getType).not.toHaveBeenCalled();
  });

  it('returns JPEG contents as PNG when PNG is unavailable', async () => {
    const pngBytes = Buffer.from([2]);
    readClipboard.mockResolvedValue([clipboardItem('image/jpeg', [1])]);
    decodeImage.mockReturnValue({ isEmpty: () => false, toPNG: () => pngBytes });

    await expect(readSystemClipboardPng()).resolves.toEqual(pngBytes);
    expect(decodeImage).toHaveBeenCalledWith(Buffer.from([1]));
  });

  it('returns null for a clipboard containing only text', async () => {
    readClipboard.mockResolvedValue([clipboardItem('text/plain', [1])]);

    await expect(readSystemClipboardPng()).resolves.toBeNull();
    expect(decodeImage).not.toHaveBeenCalled();
  });
});
