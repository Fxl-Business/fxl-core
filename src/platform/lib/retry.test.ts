import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { withRetry, isNetworkOrServerError } from './retry'

describe('isNetworkOrServerError', () => {
  it('returns true for TypeError (network failure)', () => {
    expect(isNetworkOrServerError(new TypeError('Failed to fetch'))).toBe(true)
  })

  it('returns true for 500 server error', () => {
    expect(
      isNetworkOrServerError(
        new Error('Request failed (500): Internal server error'),
      ),
    ).toBe(true)
  })

  it('returns true for 502 server error', () => {
    expect(isNetworkOrServerError(new Error('Failed (502): Bad gateway'))).toBe(
      true,
    )
  })

  it('returns false for 401 error', () => {
    expect(
      isNetworkOrServerError(
        new Error('Token exchange failed (401): Unauthorized'),
      ),
    ).toBe(false)
  })

  it('returns false for 400 error', () => {
    expect(isNetworkOrServerError(new Error('Failed (400): Bad request'))).toBe(
      false,
    )
  })

  it('returns false for generic error without status', () => {
    expect(isNetworkOrServerError(new Error('Something went wrong'))).toBe(
      false,
    )
  })
})

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok')

    const result = await withRetry(fn)

    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on network error and succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('recovered')

    const promise = withRetry(fn, { baseDelay: 100 })

    // Advance past the first retry delay (100ms * 2^0 = 100ms)
    await vi.advanceTimersByTimeAsync(100)

    const result = await promise
    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retries on 500 error and succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failed (500): Internal error'))
      .mockResolvedValue('recovered')

    const promise = withRetry(fn, { baseDelay: 100 })

    await vi.advanceTimersByTimeAsync(100)

    const result = await promise
    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('does not retry on 4xx error', async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new Error('Token exchange failed (401): Unauthorized'))

    await expect(withRetry(fn)).rejects.toThrow('(401)')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('exhausts retries and throws last error', async () => {
    const error = new TypeError('Failed to fetch')
    const fn = vi.fn().mockImplementation(() => Promise.reject(error))

    const promise = withRetry(fn, {
      maxRetries: 2,
      baseDelay: 100,
      backoffFactor: 2,
    })

    // Attach catch handler immediately to avoid unhandled rejection
    const resultPromise = promise.catch((e: Error) => e)

    // Attempt 0 fails -> wait 100ms
    await vi.advanceTimersByTimeAsync(100)
    // Attempt 1 fails -> wait 200ms
    await vi.advanceTimersByTimeAsync(200)
    // Attempt 2 (last) fails -> throws

    const result = await resultPromise
    expect(result).toBe(error)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('uses custom baseDelay and backoffFactor', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fail'))
      .mockRejectedValueOnce(new TypeError('fail'))
      .mockResolvedValue('ok')

    const promise = withRetry(fn, {
      maxRetries: 3,
      baseDelay: 100,
      backoffFactor: 3,
    })

    // First delay: 100 * 3^0 = 100ms
    await vi.advanceTimersByTimeAsync(100)
    // Second delay: 100 * 3^1 = 300ms
    await vi.advanceTimersByTimeAsync(300)

    const result = await promise
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('respects custom isRetryable', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failed (401): Unauthorized'))
      .mockResolvedValue('ok')

    // Custom: retry everything
    const promise = withRetry(fn, {
      baseDelay: 100,
      isRetryable: () => true,
    })

    await vi.advanceTimersByTimeAsync(100)

    const result = await promise
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('aborts on AbortSignal before first attempt', async () => {
    const controller = new AbortController()
    controller.abort() // Pre-aborted

    const fn = vi.fn().mockResolvedValue('ok')

    const rejection = await withRetry(fn, {
      baseDelay: 100,
      signal: controller.signal,
    }).catch((e: Error) => e)

    expect(rejection).toBeInstanceOf(DOMException)
    expect((rejection as DOMException).name).toBe('AbortError')
    expect(fn).not.toHaveBeenCalled()
  })

  it('aborts on AbortSignal during delay', async () => {
    vi.useRealTimers() // Use real timers for this test — abort timing is tricky with fakes

    const controller = new AbortController()
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fail'))
      .mockResolvedValue('ok')

    const promise = withRetry(fn, {
      baseDelay: 60_000, // Long delay so abort fires first
      signal: controller.signal,
    })

    // Abort shortly after — the delay promise rejects via abort listener
    setTimeout(() => controller.abort(), 10)

    const rejection = await promise.catch((e: Error) => e)
    expect(rejection).toBeInstanceOf(DOMException)
    expect((rejection as DOMException).name).toBe('AbortError')

    vi.useFakeTimers() // Restore for afterEach consistency
  })

  it('uses default options when none provided', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fail'))
      .mockRejectedValueOnce(new TypeError('fail'))
      .mockRejectedValueOnce(new TypeError('fail'))
      .mockResolvedValue('ok')

    const promise = withRetry(fn)

    // Default: baseDelay=1000, backoffFactor=2
    // Delay 0: 1000 * 2^0 = 1000ms
    await vi.advanceTimersByTimeAsync(1000)
    // Delay 1: 1000 * 2^1 = 2000ms
    await vi.advanceTimersByTimeAsync(2000)
    // Delay 2: 1000 * 2^2 = 4000ms
    await vi.advanceTimersByTimeAsync(4000)

    const result = await promise
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(4)
  })
})
