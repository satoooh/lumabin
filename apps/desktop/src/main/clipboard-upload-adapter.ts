import { clipboard } from 'electron';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';

const CLIPBOARD_UPLOAD_ROOT_DIRECTORY = join(tmpdir(), 'lumabin-clipboard-uploads');

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'application/pdf': 'pdf',
};

export const normalizeClipboardFileName = (
  fileName: string | undefined,
  mimeType: string | undefined,
): string => {
  const rawName = typeof fileName === 'string' ? basename(fileName.trim()) : '';
  const safeName = rawName
    .replace(/[<>:"/\\|?*]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  const detectedExtension =
    MIME_EXTENSION_MAP[(mimeType ?? '').toLowerCase()] ??
    (mimeType?.includes('/') ? mimeType.split('/').at(-1) ?? '' : '');
  const sanitizedExtension = detectedExtension.replace(/[^a-z0-9]+/gi, '').toLowerCase();

  if (!safeName) {
    const fallbackExt = sanitizedExtension || 'bin';
    return `clipboard.${fallbackExt}`;
  }

  if (extname(safeName)) {
    return safeName;
  }

  if (sanitizedExtension) {
    return `${safeName}.${sanitizedExtension}`;
  }

  return safeName;
};

export const toClipboardBytes = (value: unknown): Uint8Array | null => {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  if (Array.isArray(value)) {
    const byteList = value.filter((item) => Number.isInteger(item));
    if (byteList.length === 0) {
      return null;
    }
    return Uint8Array.from(byteList as number[]);
  }
  return null;
};

export const persistClipboardBytes = async (
  fileName: string,
  bytes: Buffer,
): Promise<string> => {
  const storedFileName = `${Date.now()}-${randomUUID().slice(0, 8)}-${fileName}`;
  const outputPath = join(CLIPBOARD_UPLOAD_ROOT_DIRECTORY, storedFileName);

  await mkdir(CLIPBOARD_UPLOAD_ROOT_DIRECTORY, { recursive: true });
  await writeFile(outputPath, bytes);
  return outputPath;
};

export const readSystemClipboardPng = (): Buffer | null => {
  const image = clipboard.readImage();
  if (image.isEmpty()) {
    return null;
  }

  const pngBytes = image.toPNG();
  if (!pngBytes || pngBytes.byteLength === 0) {
    return null;
  }
  return Buffer.from(pngBytes);
};
