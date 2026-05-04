import type { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import type { AssetItem } from '../../../shared/ipc';
import { inferContentType } from './storage-object-policy';

export const toAssetItem = (
  object: NonNullable<ListObjectsV2CommandOutput['Contents']>[number],
): AssetItem => {
  const key = object.Key ?? '';
  return {
    key,
    size: object.Size ?? 0,
    contentType: inferContentType(key),
    lastModified: object.LastModified?.toISOString() ?? new Date().toISOString(),
    etag: object.ETag ?? '',
  };
};
