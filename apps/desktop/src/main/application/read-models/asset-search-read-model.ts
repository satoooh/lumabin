import type { AssetItem } from '../../../shared/ipc';

export interface SearchReadModelScope {
  profileId: string;
  bucket: string;
}

export interface SearchAssetsQuery extends SearchReadModelScope {
  query: string;
  limit: number;
}

export interface SearchAssetsResult {
  items: AssetItem[];
  total: number;
  indexedCount: number;
}

export interface UpsertSearchAssetsCommand extends SearchReadModelScope {
  items: AssetItem[];
}

export interface RenameSearchAssetCommand extends SearchReadModelScope {
  fromKey: string;
  toKey: string;
}

export interface RemoveSearchAssetsCommand extends SearchReadModelScope {
  keys: string[];
}

export interface AssetSearchReadModelReader {
  searchAssets(input: SearchAssetsQuery): SearchAssetsResult;
}

export interface AssetSearchReadModelWriter {
  upsertAssets(input: UpsertSearchAssetsCommand): void;
  renameAsset(input: RenameSearchAssetCommand): void;
  removeAssets(input: RemoveSearchAssetsCommand): void;
  clearProfile(profileId: string): void;
}
