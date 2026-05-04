import { describe, expect, it, vi } from 'vitest';
import { createAssetSharingQueryService } from '../../src/main/application/contexts/asset-sharing/query-service';
import type { AppSettings } from '../../src/shared/ipc';

const settings: AppSettings = {
  appearance: 'system',
  defaultConflictPolicy: 'skip',
  presignedUrlTTLSeconds: 3600,
  publicBaseUrls: {},
};

describe('asset sharing query service', () => {
  it('delegates normalized GET presign requests to the injected share URL strategy', async () => {
    const createAssetShareUrl = vi.fn(
      async () => 'https://cdn.example/folder%2Fphoto.png',
    );
    const service = createAssetSharingQueryService({
      createAssetShareUrl,
      getSettings: () => settings,
      normalizePresignTtl: (value) => value,
    });

    const result = await service.createPresignedGet({
      expiresInSeconds: 120,
      key: 'folder/photo.png',
      profileId: 'fixture-profile',
    });

    expect(result.url).toBe('https://cdn.example/folder%2Fphoto.png');
    expect(createAssetShareUrl).toHaveBeenCalledWith({
      profileId: 'fixture-profile',
      key: 'folder/photo.png',
      method: 'get',
      expiresInSeconds: 120,
    });
  });

  it('uses workspace default TTL and normalizes it before delegation', async () => {
    const createAssetShareUrl = vi.fn(async () => 'https://signed.example/put');
    const service = createAssetSharingQueryService({
      createAssetShareUrl,
      getSettings: () => settings,
      normalizePresignTtl: (value) => Math.min(value, 600),
    });

    const result = await service.createPresignedPut({
      key: 'folder/photo.png',
      profileId: 'profile-1',
    });

    expect(result.url).toBe('https://signed.example/put');
    expect(createAssetShareUrl).toHaveBeenCalledWith({
      profileId: 'profile-1',
      key: 'folder/photo.png',
      method: 'put',
      expiresInSeconds: 600,
    });
  });
});
