import { toHttpStatusCode } from './s3-errors';

const UPLOAD_RETRY_MAX_ATTEMPTS = 3;
const UPLOAD_RETRY_BASE_DELAY_MS = 250;

const sleep = async (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const isRetryableUploadError = (error: unknown): boolean => {
  const statusCode = toHttpStatusCode(error);
  if (
    statusCode !== undefined &&
    (statusCode === 408 || statusCode === 429 || statusCode >= 500)
  ) {
    return true;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    '$retryable' in error &&
    typeof (error as { $retryable?: { throttling?: boolean } }).$retryable === 'object'
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const retryableByName = new Set([
    'RequestTimeout',
    'RequestTimeoutException',
    'TimeoutError',
    'NetworkingError',
    'Throttling',
    'ThrottlingException',
    'SlowDown',
  ]);
  if (retryableByName.has(error.name)) {
    return true;
  }

  if (
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    const code = (error as { code: string }).code;
    const retryableByCode = new Set([
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'EAI_AGAIN',
      'ENOTFOUND',
    ]);
    if (retryableByCode.has(code)) {
      return true;
    }
  }

  return false;
};

export const withUploadRetry = async <T>(
  run: () => Promise<T>,
): Promise<T> => {
  let latestError: unknown;
  for (let attempt = 1; attempt <= UPLOAD_RETRY_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      latestError = error;
      if (attempt >= UPLOAD_RETRY_MAX_ATTEMPTS || !isRetryableUploadError(error)) {
        throw error;
      }
      const backoffMs = UPLOAD_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      await sleep(backoffMs);
    }
  }

  throw latestError;
};
