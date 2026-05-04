const extensionFromMimeType = (mimeType: string): string => {
  const normalized = mimeType.trim().toLowerCase();
  if (!normalized) {
    return '';
  }
  const explicitMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
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
  const mapped = explicitMap[normalized];
  if (mapped) {
    return mapped;
  }
  const fromSubtype = normalized.split('/').at(-1) ?? '';
  return fromSubtype.replace(/[^a-z0-9]+/gi, '').toLowerCase();
};

export const clipboardFallbackFileName = (file: File, index: number): string => {
  const normalizedName = file.name.trim();
  if (normalizedName.length > 0) {
    return normalizedName;
  }
  const extension = extensionFromMimeType(file.type);
  const suffix = extension ? `.${extension}` : '.bin';
  return `clipboard-${Date.now()}-${index + 1}${suffix}`;
};

export const isEditableEventTarget = (target: EventTarget | null): boolean => {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

export const isLikelyAbsolutePath = (value: string): boolean =>
  /^([/]|[a-zA-Z]:[\\/]|\\\\)/.test(value);

export const hasFileTransfer = (event: DragEvent): boolean => {
  const types = event.dataTransfer?.types;
  if (!types) {
    return false;
  }
  return Array.from(types).includes('Files');
};
