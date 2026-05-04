import { Readable } from 'node:stream';
import { buffer as streamToBuffer } from 'node:stream/consumers';
import type { AssetPreview } from '../../../shared/ipc';

export const normalizePrefix = (prefix?: string): string | undefined => {
  if (!prefix) {
    return undefined;
  }
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
};

export const inferContentType = (key: string): string => {
  const normalized = key.toLowerCase();
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (normalized.endsWith('.png')) {
    return 'image/png';
  }
  if (normalized.endsWith('.gif')) {
    return 'image/gif';
  }
  if (normalized.endsWith('.webp')) {
    return 'image/webp';
  }
  if (normalized.endsWith('.mp4')) {
    return 'video/mp4';
  }
  if (normalized.endsWith('.mov')) {
    return 'video/quicktime';
  }
  if (normalized.endsWith('.pdf')) {
    return 'application/pdf';
  }
  if (normalized.endsWith('.csv')) {
    return 'text/csv';
  }
  return 'application/octet-stream';
};

export const inferPreviewKind = (
  contentType: string,
  key: string,
): AssetPreview['kind'] => {
  const normalizedType = contentType.toLowerCase();
  const normalizedKey = key.toLowerCase();

  if (normalizedType.startsWith('image/') || /\.(png|jpe?g|gif|webp|avif|svg)$/.test(normalizedKey)) {
    return 'image';
  }
  if (normalizedType.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/.test(normalizedKey)) {
    return 'video';
  }
  if (normalizedType.includes('pdf') || normalizedKey.endsWith('.pdf')) {
    return 'pdf';
  }
  if (normalizedType.includes('csv') || normalizedKey.endsWith('.csv')) {
    return 'csv';
  }
  return 'other';
};

export const bodyToBuffer = async (body: unknown): Promise<Buffer> => {
  if (!body) {
    return Buffer.alloc(0);
  }

  if (Buffer.isBuffer(body)) {
    return body;
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  if (typeof body === 'string') {
    return Buffer.from(body);
  }

  if (body instanceof Readable) {
    return streamToBuffer(body);
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    'transformToByteArray' in body &&
    typeof (body as { transformToByteArray?: unknown }).transformToByteArray === 'function'
  ) {
    const bytes = await (body as { transformToByteArray: () => Promise<Uint8Array> })
      .transformToByteArray();
    return Buffer.from(bytes);
  }

  throw new Error('Unsupported S3 body stream type for preview');
};

export const parseTotalBytes = (contentRange?: string): number | undefined => {
  if (!contentRange) {
    return undefined;
  }
  const matched = contentRange.match(/\/(\d+)$/);
  if (!matched) {
    return undefined;
  }
  return Number(matched[1]);
};

export const toCopySourcePath = (bucket: string, key: string): string => {
  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${bucket}/${encodedKey}`;
};

export const chunkBy = <T,>(items: T[], size: number): T[][] => {
  if (size <= 0) {
    return [items];
  }
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

export const normalizePresignTtl = (expiresInSeconds: number): number =>
  Math.max(60, Math.min(7 * 24 * 60 * 60, Math.floor(expiresInSeconds)));
