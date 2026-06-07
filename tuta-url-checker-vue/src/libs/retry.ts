import { makeRetriable, type RetryContext } from 'p-retry'
import { HttpError } from '@/libs/errors'

const RETRIES = Number(import.meta.env.VITE_RETRY_MAX) || 3

/**
 * Which errors are worth retrying.
 */
function shouldRetry({ error }: RetryContext): boolean {
  return error instanceof HttpError && error.status === 429
}

function onFailedAttempt({ error, attemptNumber, retriesLeft, retryDelay }: RetryContext): void {
  console.warn('[retry] attempt failed', {
    attempt: attemptNumber,
    retriesLeft,
    retryDelayMs: retryDelay,
    error: error.message,
  })
}

const retryOptions = {
  retries: RETRIES,
  minTimeout: 500,
  factor: 2,
  randomize: true,
  shouldRetry,
  onFailedAttempt,
}

/**
 * Wrap an async function so failures matching `shouldRetry` are retried
 * with exponential backoff
 * p-retry is also secure vlidated dependency
 */
export function withRetry<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return makeRetriable(fn, retryOptions)
}
