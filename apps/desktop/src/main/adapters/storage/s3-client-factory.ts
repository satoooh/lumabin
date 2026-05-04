import { S3Client } from '@aws-sdk/client-s3';
import type {
  StorageClientFactory,
  StorageProfile,
  StorageSecret,
} from './storage-contracts';

let storageClientFactoryForTest: StorageClientFactory | null = null;

export const setStorageClientFactoryForTest = (
  factory: StorageClientFactory | null,
): void => {
  storageClientFactoryForTest = factory;
};

export const createStorageClient = (
  profile: StorageProfile,
  secret: StorageSecret,
): S3Client => {
  if (storageClientFactoryForTest) {
    return storageClientFactoryForTest(profile, secret);
  }
  return new S3Client({
    region: profile.region,
    endpoint: profile.endpoint,
    credentials: {
      accessKeyId: secret.accessKeyId,
      secretAccessKey: secret.secretAccessKey,
    },
    forcePathStyle: profile.provider === 's3',
  });
};
