import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import {
  addStorageTransferredBytes,
  recordStorageFailure,
  recordStorageMetric,
} from '../../dev-metrics';
import { createStorageClient } from './s3-client-factory';
import { toHttpStatusCode } from './s3-errors';
import { inferContentType } from './storage-object-policy';
import type { StorageProfile, StorageSecret } from './storage-contracts';

export interface StorageMediaResponseInput {
  key: string;
  rangeHeader?: string;
}

const once = (callback: () => void): (() => void) => {
  let didRun = false;
  return () => {
    if (didRun) {
      return;
    }
    didRun = true;
    callback();
  };
};

const toResponseBody = (
  body: unknown,
  onStreamClosed: () => void,
): { body: BodyInit | null; closesAsync: boolean } => {
  if (!body) {
    return { body: null, closesAsync: false };
  }

  if (body instanceof Readable) {
    const cleanup = once(onStreamClosed);
    body.once('close', cleanup);
    body.once('end', cleanup);
    body.once('error', cleanup);
    return {
      body: Readable.toWeb(body) as BodyInit,
      closesAsync: true,
    };
  }

  if (body instanceof Uint8Array) {
    const arrayBuffer = new ArrayBuffer(body.byteLength);
    new Uint8Array(arrayBuffer).set(body);
    return { body: arrayBuffer, closesAsync: false };
  }

  if (typeof body === 'string') {
    return { body, closesAsync: false };
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    'transformToWebStream' in body &&
    typeof (body as { transformToWebStream?: unknown }).transformToWebStream === 'function'
  ) {
    return {
      body: (body as { transformToWebStream: () => ReadableStream }).transformToWebStream(),
      closesAsync: true,
    };
  }

  throw new Error('Unsupported S3 body stream type for media response');
};

export const toStorageMediaErrorResponse = (error: unknown): Response => {
  const statusCode = toHttpStatusCode(error);
  if (statusCode === 401 || statusCode === 403) {
    return new Response('Media access denied', { status: 403 });
  }
  if (statusCode === 404) {
    return new Response('Media not found', { status: 404 });
  }
  if (statusCode === 416) {
    return new Response('Requested range not satisfiable', { status: 416 });
  }
  return new Response('Media unavailable', { status: 502 });
};

export const createStorageMediaResponse = async (
  profile: StorageProfile,
  secret: StorageSecret,
  input: StorageMediaResponseInput,
): Promise<Response> => {
  const client = createStorageClient(profile, secret);

  try {
    recordStorageMetric('getCalls');
    const result = await client.send(
      new GetObjectCommand({
        Bucket: profile.bucket,
        Key: input.key,
        ...(input.rangeHeader ? { Range: input.rangeHeader } : {}),
      }),
    );

    const headers = new Headers();
    headers.set('content-type', result.ContentType ?? inferContentType(input.key));
    headers.set('accept-ranges', result.AcceptRanges ?? 'bytes');
    if (typeof result.ContentLength === 'number') {
      headers.set('content-length', String(result.ContentLength));
      addStorageTransferredBytes({ bytesDownloaded: result.ContentLength });
    }
    if (result.ContentRange) {
      headers.set('content-range', result.ContentRange);
    }
    if (result.ETag) {
      headers.set('etag', result.ETag);
    }
    if (result.LastModified) {
      headers.set('last-modified', result.LastModified.toUTCString());
    }

    const responseBody = toResponseBody(result.Body, () => client.destroy());
    if (!responseBody.closesAsync) {
      client.destroy();
    }

    return new Response(responseBody.body, {
      status: result.ContentRange ? 206 : 200,
      headers,
    });
  } catch (error) {
    recordStorageFailure();
    client.destroy();
    return toStorageMediaErrorResponse(error);
  }
};
