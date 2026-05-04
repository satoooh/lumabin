export const normalizePublicBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.replace(/\/+$/, '');
};

export const sanitizePublicBaseUrlInput = (value: string): string => value.trim();

export const buildPublicAssetUrl = (baseUrl: string, key: string): string => {
  const normalizedBaseUrl = normalizePublicBaseUrl(baseUrl);
  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${normalizedBaseUrl}/${encodedKey}`;
};
