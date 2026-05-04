import {
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { recordStorageFailure } from '../../dev-metrics';
import { createStorageClient } from './s3-client-factory';
import { normalizePresignTtl } from './storage-object-policy';
import type {
  StorageProfile,
  StorageSecret,
} from './storage-contracts';

export const createStoragePresignedUrl = async (
  profile: StorageProfile,
  secret: StorageSecret,
  input: {
    key: string;
    method: 'get' | 'put';
    expiresInSeconds: number;
  },
): Promise<string> => {
  const client = createStorageClient(profile, secret);

  try {
    const expiresIn = normalizePresignTtl(input.expiresInSeconds);
    if (input.method === 'get') {
      return await getSignedUrl(
        client,
        new GetObjectCommand({
          Bucket: profile.bucket,
          Key: input.key,
        }),
        { expiresIn },
      );
    }

    return await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: profile.bucket,
        Key: input.key,
      }),
      { expiresIn },
    );
  } catch (error) {
    recordStorageFailure();
    throw error;
  } finally {
    client.destroy();
  }
};
