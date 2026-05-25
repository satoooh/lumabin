export const LUMABIN_MEDIA_SCHEME = 'lumabin-media';
export const LUMABIN_MEDIA_ASSET_HOST = 'asset';

export interface ParsedLumabinMediaUrl {
  key: string;
  profileId: string;
}

export const buildLumabinMediaUrl = (
  profileId: string,
  key: string,
  nonce?: number,
): string => {
  const baseUrl = `${LUMABIN_MEDIA_SCHEME}://${LUMABIN_MEDIA_ASSET_HOST}/${encodeURIComponent(
    profileId,
  )}/${encodeURIComponent(key)}`;
  return typeof nonce === 'number' ? `${baseUrl}?v=${nonce}` : baseUrl;
};

export const parseLumabinMediaUrl = (value: string): ParsedLumabinMediaUrl | null => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (parsed.protocol !== `${LUMABIN_MEDIA_SCHEME}:`) {
    return null;
  }
  if (parsed.host !== LUMABIN_MEDIA_ASSET_HOST) {
    return null;
  }

  const [, encodedProfileId, encodedKey] = parsed.pathname.split('/');
  if (!encodedProfileId || !encodedKey) {
    return null;
  }

  try {
    return {
      profileId: decodeURIComponent(encodedProfileId),
      key: decodeURIComponent(encodedKey),
    };
  } catch {
    return null;
  }
};
