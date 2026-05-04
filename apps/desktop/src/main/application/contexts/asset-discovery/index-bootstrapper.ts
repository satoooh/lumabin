import type {
  ListAssetsResult,
  ProfileSummary,
} from '../../../../shared/ipc';
import type { AssetSearchReadModelWriter } from '../../read-models/asset-search-read-model';

type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

type ProfileSecret = {
  accessKeyId: string;
  secretAccessKey: string;
};

interface SearchIndexBootstrapperDependencies {
  listStorageObjects(
    profile: StoredProfile,
    secret: ProfileSecret,
    input: {
      prefix: string;
      continuationToken?: string;
      limit: number;
      recursive: boolean;
    },
  ): Promise<ListAssetsResult>;
  maxObjects?: number;
  pageSize?: number;
  searchReadModelWriter: Pick<AssetSearchReadModelWriter, 'upsertAssets'>;
}

const DEFAULT_SEARCH_INDEX_BOOTSTRAP_PAGE_SIZE = 1_000;
const DEFAULT_SEARCH_INDEX_BOOTSTRAP_MAX_OBJECTS = 50_000;

export const createSearchIndexBootstrapper =
  (dependencies: SearchIndexBootstrapperDependencies) =>
  async (profile: StoredProfile, secret: ProfileSecret): Promise<void> => {
    const pageSize = dependencies.pageSize ?? DEFAULT_SEARCH_INDEX_BOOTSTRAP_PAGE_SIZE;
    const maxObjects = dependencies.maxObjects ?? DEFAULT_SEARCH_INDEX_BOOTSTRAP_MAX_OBJECTS;
    let continuationToken: string | undefined;
    let indexedCount = 0;

    do {
      const page = await dependencies.listStorageObjects(profile, secret, {
        prefix: '',
        continuationToken,
        limit: pageSize,
        recursive: true,
      });
      if (page.items.length > 0) {
        dependencies.searchReadModelWriter.upsertAssets({
          profileId: profile.id,
          bucket: profile.bucket,
          items: page.items,
        });
        indexedCount += page.items.length;
      }
      continuationToken = page.nextContinuationToken;
    } while (continuationToken && indexedCount < maxObjects);
  };
