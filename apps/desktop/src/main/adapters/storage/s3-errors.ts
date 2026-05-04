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

export const formatStorageError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Unknown storage error';
  }

  const statusCode = toHttpStatusCode(error);
  const status = statusCode ? ` (HTTP ${statusCode})` : '';
  return `${error.name}${status}: ${error.message}`;
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
