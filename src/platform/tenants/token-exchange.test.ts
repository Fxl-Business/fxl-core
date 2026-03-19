import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

// Must stub env before importing the module (FUNCTIONS_URL is read at module level)
// We use dynamic import + vi.resetModules to re-evaluate the module per test group

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.resetModules()
})

describe('exchangeToken', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_FUNCTIONS_URL', 'https://test.supabase.co/functions/v1')
  })

  it('returns access token on 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'test-token', expires_in: 3600 }),
      }),
    )

    const { exchangeToken } = await import('./token-exchange')
    const result = await exchangeToken('clerk-token', 'org_123')

    expect(result.access_token).toBe('test-token')
    expect(result.expires_in).toBe(3600)
  })

  it('sends correct request to edge function', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'tok', expires_in: 3600 }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { exchangeToken } = await import('./token-exchange')
    await exchangeToken('my-clerk-token', 'org_abc')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/auth-token-exchange',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer my-clerk-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ org_id: 'org_abc' }),
      }),
    )
  })

  it('throws on 401 error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid Clerk token: expired' }),
      }),
    )

    const { exchangeToken } = await import('./token-exchange')
    await expect(exchangeToken('bad-token', 'org_123')).rejects.toThrow('401')
  })

  it('throws on 400 error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'org_id is required' }),
      }),
    )

    const { exchangeToken } = await import('./token-exchange')
    await expect(exchangeToken('token', '')).rejects.toThrow('400')
  })

  it('propagates network errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    )

    const { exchangeToken } = await import('./token-exchange')
    await expect(exchangeToken('token', 'org_123')).rejects.toThrow('Network error')
  })

  it('throws when FUNCTIONS_URL is empty', async () => {
    vi.stubEnv('VITE_SUPABASE_FUNCTIONS_URL', '')

    const { exchangeToken } = await import('./token-exchange')
    await expect(exchangeToken('token', 'org_123')).rejects.toThrow(
      'VITE_SUPABASE_FUNCTIONS_URL is not set',
    )
  })
})
