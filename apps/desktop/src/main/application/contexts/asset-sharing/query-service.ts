import type {
  AppSettings,
  PresignInput,
  PresignResult,
} from '../../../../shared/ipc';

export type AssetSharePresignMethod = 'get' | 'put';

export interface AssetShareUrlInput {
  profileId: string;
  key: string;
  method: AssetSharePresignMethod;
  expiresInSeconds: number;
}

export interface AssetSharingQueryService {
  createPresignedGet(input: PresignInput): Promise<PresignResult>;
  createPresignedPut(input: PresignInput): Promise<PresignResult>;
}

export interface AssetSharingQueryServiceDependencies {
  createAssetShareUrl(input: AssetShareUrlInput): Promise<string>;
  getSettings(): AppSettings;
  normalizePresignTtl(value: number): number;
}

const createPresignedUrl = async (
  input: PresignInput,
  method: AssetSharePresignMethod,
  dependencies: AssetSharingQueryServiceDependencies,
): Promise<PresignResult> => {
  const settings = dependencies.getSettings();
  const ttl = dependencies.normalizePresignTtl(
    input.expiresInSeconds ?? settings.presignedUrlTTLSeconds,
  );

  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  const url = await dependencies.createAssetShareUrl({
    profileId: input.profileId,
    key: input.key,
    method,
    expiresInSeconds: ttl,
  });
  return { url, expiresAt };
};

export const createAssetSharingQueryService = (
  dependencies: AssetSharingQueryServiceDependencies,
): AssetSharingQueryService => ({
  createPresignedGet: (input) => createPresignedUrl(input, 'get', dependencies),
  createPresignedPut: (input) => createPresignedUrl(input, 'put', dependencies),
});
