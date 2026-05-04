export const toHttpStatusCode = (error: unknown): number | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    '$metadata' in error &&
    typeof (error as { $metadata?: { httpStatusCode?: number } }).$metadata === 'object'
  ) {
    return (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
  }
  return undefined;
};

const toStorageErrorName = (error: Error): string => error.name || 'StorageError';

const providerRecoveryHint = (
  errorName: string,
  statusCode: number | undefined,
): string | undefined => {
  if (
    statusCode === 401 ||
    statusCode === 403 ||
    [
      'AccessDenied',
      'InvalidAccessKeyId',
      'SignatureDoesNotMatch',
      'Unauthorized',
    ].includes(errorName)
  ) {
    return 'Authorization failed. Check the access key, secret, bucket permissions, and R2/S3 endpoint.';
  }

  if (statusCode === 301 || errorName === 'PermanentRedirect') {
    return 'Bucket endpoint mismatch. Check the endpoint URL and region for this provider.';
  }

  if (errorName === 'NoSuchBucket') {
    return 'Bucket not found. Check the bucket name and account endpoint.';
  }

  if (
    statusCode === 400 ||
    ['AuthorizationHeaderMalformed', 'InvalidArgument', 'InvalidBucketName'].includes(errorName)
  ) {
    return 'Provider rejected the request. Check the endpoint, region, and bucket name.';
  }

  return undefined;
};

export const formatStorageError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Unknown storage error';
  }

  const statusCode = toHttpStatusCode(error);
  const status = statusCode ? ` (HTTP ${statusCode})` : '';
  const errorName = toStorageErrorName(error);
  const hint = providerRecoveryHint(errorName, statusCode);
  const details = error.message ? ` ${error.message}` : '';

  if (hint) {
    return `${errorName}${status}: ${hint}${details}`;
  }

  return `${errorName}${status}:${details}`;
};

export const isNotFoundError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
    return true;
  }

  return toHttpStatusCode(error) === 404;
};

export const isInvalidRangeError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === 'InvalidRange') {
    return true;
  }
  return toHttpStatusCode(error) === 416;
};
