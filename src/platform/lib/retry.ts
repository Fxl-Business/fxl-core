/**
 * Generic async retry wrapper with exponential backoff.
 *
 * Retries transient failures (network errors, 5xx) while immediately
 * propagating client errors (4xx) and supporting cancellation via AbortSignal.
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Base delay in ms before first retry (default: 1000) */
  baseDelay?: number
  /** Multiplier applied to delay after each attempt (default: 2) */
  backoffFactor?: number
  /** Optional AbortSignal to cancel retries (for Phase 126 compatibility) */
  signal?: AbortSignal
  /** Custom function to determine if an error is retryable. Default: network errors + 5xx */
  isRetryable?: (error: Error) => boolean
}

const DEFAULT_RETRY_OPTIONS: Required<
  Pick<RetryOptions, 'maxRetries' | 'baseDelay' | 'backoffFactor'>
> = {
  maxRetries: 3,
  baseDelay: 1000,
  backoffFactor: 2,
}

/**
 * Default retryable check: network errors (TypeError from fetch) and 5xx server errors.
 * Never retries 4xx client errors.
 */
export function isNetworkOrServerError(error: Error): boolean {
  // Network errors: fetch throws TypeError on network failure
  if (error instanceof TypeError) return true
  // Server errors: check for 5xx status in error message pattern "(5XX)"
  const statusMatch = error.message.match(/\((\d{3})\)/)
  if (statusMatch) {
    const status = parseInt(statusMatch[1], 10)
    return status >= 500 && status < 600
  }
  return false
}

/**
 * Retry an async operation with exponential backoff.
 *
 * The function is called once initially, then up to `maxRetries` additional times
 * if it fails with a retryable error. Delay between attempts grows exponentially:
 * `baseDelay * backoffFactor^attempt`.
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns The resolved value of `fn`
 * @throws The last error after all attempts are exhausted, or immediately for non-retryable errors
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const { maxRetries, baseDelay, backoffFactor } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  }
  const isRetryable = options?.isRetryable ?? isNetworkOrServerError
  const signal = options?.signal

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Check abort before each attempt
    if (signal?.aborted) {
      throw new DOMException('Retry aborted', 'AbortError')
    }

    try {
      return await fn()
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      lastError = error

      // Don't retry if not retryable or last attempt
      if (!isRetryable(error) || attempt === maxRetries) {
        throw error
      }

      const delay = baseDelay * Math.pow(backoffFactor, attempt)
      console.warn(
        `[withRetry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms:`,
        error.message,
      )

      // Wait with abort support
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, delay)
        if (signal) {
          const onAbort = () => {
            clearTimeout(timer)
            reject(new DOMException('Retry aborted', 'AbortError'))
          }
          signal.addEventListener('abort', onAbort, { once: true })
        }
      })
    }
  }

  // Should not reach here, but TypeScript needs it
  throw lastError ?? new Error('withRetry exhausted all attempts')
}
