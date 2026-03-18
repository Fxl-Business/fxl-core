/**
 * Tests for admin-service and tenant-service token handling.
 *
 * Key invariants:
 * - Both services require a Clerk token getter to be registered before use
 * - Authorization header must be `Bearer <token>`
 * - A 401 from the Supabase gateway {"code":401,"message":"Invalid JWT"} should
 *   surface as a clear error, not silently fail
 * - A 403 from the edge function {"error":"Forbidden: super_admin required"}
 *   should also surface clearly
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  setAdminClerkTokenGetter,
  listUsers,
} from './admin-service'
import {
  setClerkTokenGetter,
  listTenants,
} from './tenant-service'

// ---------------------------------------------------------------------------
// Mock fetch globally
// ---------------------------------------------------------------------------

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockJsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

// ---------------------------------------------------------------------------
// admin-service — setAdminClerkTokenGetter / getAuthHeaders
// ---------------------------------------------------------------------------

describe('admin-service: token getter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset getter to null between tests by registering a null-returning one
    setAdminClerkTokenGetter(() => Promise.resolve(null))
  })

  it('throws when token getter returns null', async () => {
    setAdminClerkTokenGetter(() => Promise.resolve(null))
    await expect(listUsers()).rejects.toThrow('Clerk session token is null')
  })

  it('sends correct Authorization header when token is valid', async () => {
    setAdminClerkTokenGetter(() => Promise.resolve('test-jwt-token'))
    mockFetch.mockResolvedValue(
      mockJsonResponse(200, { users: [], totalCount: 0 }),
    )

    await listUsers()

    expect(mockFetch).toHaveBeenCalledOnce()
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer test-jwt-token')
  })
})

// ---------------------------------------------------------------------------
// admin-service — 401 from Supabase gateway (verify_jwt misconfiguration)
// ---------------------------------------------------------------------------

describe('admin-service: Supabase gateway 401 detection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setAdminClerkTokenGetter(() => Promise.resolve('valid-token'))
  })

  it('throws on 401 from Supabase gateway ({"code":401,"message":"Invalid JWT"})', async () => {
    // This is the exact format Supabase gateway returns when verify_jwt:true rejects a Clerk JWT
    mockFetch.mockResolvedValue(
      mockJsonResponse(401, { code: 401, message: 'Invalid JWT' }),
    )

    await expect(listUsers()).rejects.toThrow('401')
  })

  it('throws on 403 from edge function (super_admin check fails)', async () => {
    mockFetch.mockResolvedValue(
      mockJsonResponse(403, { error: 'Forbidden: super_admin required' }),
    )

    await expect(listUsers()).rejects.toThrow('403')
  })

  it('returns data normally on 200', async () => {
    mockFetch.mockResolvedValue(
      mockJsonResponse(200, { users: [], totalCount: 0 }),
    )

    const result = await listUsers()
    expect(result.users).toEqual([])
    expect(result.totalCount).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// tenant-service — same invariants
// ---------------------------------------------------------------------------

describe('tenant-service: token getter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setClerkTokenGetter(() => Promise.resolve(null))
  })

  it('throws when token getter returns null', async () => {
    setClerkTokenGetter(() => Promise.resolve(null))
    await expect(listTenants()).rejects.toThrow('Clerk session token is null')
  })

  it('sends correct Authorization header when token is valid', async () => {
    setClerkTokenGetter(() => Promise.resolve('test-jwt-token'))
    mockFetch.mockResolvedValue(
      mockJsonResponse(200, { tenants: [], totalCount: 0 }),
    )

    await listTenants()

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer test-jwt-token')
  })
})

describe('tenant-service: Supabase gateway 401 detection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setClerkTokenGetter(() => Promise.resolve('valid-token'))
  })

  it('throws on 401 from Supabase gateway', async () => {
    mockFetch.mockResolvedValue(
      mockJsonResponse(401, { code: 401, message: 'Invalid JWT' }),
    )

    await expect(listTenants()).rejects.toThrow('401')
  })

  it('throws on 403 from edge function', async () => {
    mockFetch.mockResolvedValue(
      mockJsonResponse(403, { error: 'Forbidden: super_admin required' }),
    )

    await expect(listTenants()).rejects.toThrow('403')
  })
})
