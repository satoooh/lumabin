import type { IpcMain } from 'electron';
import { protocol } from 'electron';
import { E2E_FIXTURE_PUBLIC_BASE_URL } from '../../../adapters/e2e-fixture-storage-adapter';
import {
  createStorageMediaResponse,
} from '../../../adapters/storage/storage-media-response';
import { getWorkspaceSettings } from '../../../repositories/workspace-repository';
import { createStoragePresignedUrl } from '../../../adapters/storage/storage-presign-adapter';
import { normalizePresignTtl } from '../../../application-policies';
import {
  LUMABIN_MEDIA_SCHEME,
  parseLumabinMediaUrl,
} from '../../../../shared/media-url';
import {
  assertProfileExists,
  getProfileSecretOrThrow,
  isE2EFixtureProfile,
} from '../../composition-helpers';
import { registerAssetSharingComposition } from './composition';
import type {
  AssetSharingQueryServiceDependencies,
  AssetShareUrlInput,
} from './query-service';

const toFixtureAssetShareUrl = (
  input: AssetShareUrlInput,
  publicBaseUrl: string,
): string =>
  `${publicBaseUrl}/${encodeURIComponent(input.key)}?method=${input.method}&ttl=${input.expiresInSeconds}`;

export const createAssetSharingRuntimeDependencies =
  (): AssetSharingQueryServiceDependencies => ({
    createAssetShareUrl: async (input): Promise<string> => {
      if (isE2EFixtureProfile(input.profileId)) {
        return toFixtureAssetShareUrl(input, E2E_FIXTURE_PUBLIC_BASE_URL);
      }

      const profile = assertProfileExists(input.profileId);
      const secret = getProfileSecretOrThrow(profile.id);
      return createStoragePresignedUrl(profile, secret, {
        key: input.key,
        method: input.method,
        expiresInSeconds: input.expiresInSeconds,
      });
    },
    getSettings: getWorkspaceSettings,
    normalizePresignTtl,
  });

export const registerAssetSharingRuntime = (ipcMain: IpcMain): void => {
  registerAssetSharingComposition(
    ipcMain,
    createAssetSharingRuntimeDependencies(),
  );
};

export const registerStorageMediaProtocol = (): void => {
  protocol.handle(LUMABIN_MEDIA_SCHEME, async (request) => {
    const parsed = parseLumabinMediaUrl(request.url);
    if (!parsed) {
      return new Response('Invalid media URL', { status: 404 });
    }

    if (isE2EFixtureProfile(parsed.profileId)) {
      return new Response('Fixture media streaming is unavailable', { status: 404 });
    }

    const profile = assertProfileExists(parsed.profileId);
    const secret = getProfileSecretOrThrow(profile.id);
    return createStorageMediaResponse(profile, secret, {
      key: parsed.key,
      rangeHeader: request.headers.get('range') ?? undefined,
    });
  });
};
