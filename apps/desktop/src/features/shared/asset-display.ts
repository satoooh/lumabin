import type { AssetItem } from '../../shared/ipc';

export type AssetKind = 'image' | 'video' | 'pdf' | 'csv' | 'other';

const decimalNumberFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const compactDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const galleryDayFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  weekday: 'short',
  year: 'numeric',
});

export const inferAssetKind = (item: AssetItem): AssetKind => {
  const contentType = item.contentType.toLowerCase();
  const key = item.key.toLowerCase();

  if (contentType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(key)) {
    return 'image';
  }
  if (contentType.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/.test(key)) {
    return 'video';
  }
  if (contentType.includes('pdf') || key.endsWith('.pdf')) {
    return 'pdf';
  }
  if (contentType.includes('csv') || key.endsWith('.csv')) {
    return 'csv';
  }
  return 'other';
};

export const formatBytes = (size: number): string => {
  if (size < 1024) {
    return `${size}\u00A0B`;
  }
  if (size < 1024 * 1024) {
    return `${decimalNumberFormatter.format(size / 1024)}\u00A0KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${decimalNumberFormatter.format(size / (1024 * 1024))}\u00A0MB`;
  }
  return `${decimalNumberFormatter.format(size / (1024 * 1024 * 1024))}\u00A0GB`;
};

export const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return compactDateTimeFormatter.format(parsed);
};

export const dayKeyFromIso = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'unknown';
  }
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(
    parsed.getDate(),
  ).padStart(2, '0')}`;
};

export const formatGalleryDayLabel = (dayKey: string): string => {
  if (dayKey === 'unknown') {
    return 'Unknown date';
  }

  const [year, month, day] = dayKey.split('-').map((part) => Number(part));
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) {
    return dayKey;
  }

  return galleryDayFormatter.format(parsed);
};

export const iconForKind = (kind: AssetKind): string => {
  if (kind === 'image') {
    return 'IMG';
  }
  if (kind === 'video') {
    return 'VID';
  }
  if (kind === 'pdf') {
    return 'PDF';
  }
  if (kind === 'csv') {
    return 'CSV';
  }
  return 'FILE';
};

export const thumbnailCacheKey = (profileId: string, key: string): string =>
  `${profileId}::${key}`;
