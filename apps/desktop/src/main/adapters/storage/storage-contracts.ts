import type { S3Client } from '@aws-sdk/client-s3';
import type { Provider } from '../../../shared/ipc';

export interface StorageProfile {
  provider: Provider;
  endpoint: string;
  region: string;
  bucket: string;
}

export interface StorageSecret {
  accessKeyId: string;
  secretAccessKey: string;
}

export type StorageClientFactory = (
  profile: StorageProfile,
  secret: StorageSecret,
) => S3Client;

export interface StorageListInput {
  prefix?: string;
  continuationToken?: string;
  limit?: number;
  recursive?: boolean;
}

export interface StorageConnectionResult {
  ok: boolean;
  message: string;
}

export interface StorageDeleteResult {
  deleted: string[];
  skipped: string[];
}
