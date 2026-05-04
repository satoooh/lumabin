import type { AssetItem } from '../../../../shared/ipc';

export type AssetMutationPayload = {
  bucket?: string;
  profileId: string;
  fromKey?: string;
  toKey?: string;
  keys?: string[];
  deletedCount?: number;
  skippedCount?: number;
};

export type AssetObservationPayload = {
  bucket: string;
  profileId: string;
  items: AssetItem[];
};

export type AssetLibraryEvent =
  | {
      type: 'asset-library.asset.renamed';
      occurredAt: string;
      payload: AssetMutationPayload;
    }
  | {
      type: 'asset-library.asset.moved';
      occurredAt: string;
      payload: AssetMutationPayload;
    }
  | {
      type: 'asset-library.assets.deleted';
      occurredAt: string;
      payload: AssetMutationPayload;
    }
  | {
      type: 'asset-library.assets.observed';
      occurredAt: string;
      payload: AssetObservationPayload;
    };
