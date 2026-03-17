/**
 * Client-side tenant management service.
 *
 * Calls the `admin-tenants` Supabase Edge Function which proxies Clerk
 * Organizations API. Requires the caller to have a Clerk session token
 * with `super_admin: true` JWT claim.
 *
 * Usage:
 *   // In a component that has access to Clerk session:
 *   setClerkTokenGetter(() => session.getToken())
 *   const { tenants } = await listTenants()
 */
import type { CreateTenantPayload, Tenant, TenantDetail, TenantListResponse } from '@platform/types/tenant'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ?? ''

/** Module-level getter for the current Clerk session token. */
let _clerkTokenGetter: (() => Promise<string | null>) | null = null

/**
 * Register the Clerk token getter so the service can include auth headers
 * without being inside a React component.
 *
 * Call this once on mount in a component that has access to Clerk session:
 * ```tsx
 * setClerkTokenGetter(() => session.getToken())
 * ```
 */
export function setClerkTokenGetter(fn: () => Promise<string | null>): void {
  _clerkTokenGetter = fn
}

async function getAuthHeaders(): Promise<HeadersInit> {
  if (!_clerkTokenGetter) {
    throw new Error(
      'Clerk token getter not set. Call setClerkTokenGetter() before using tenant service.',
    )
  }
  const token = await _clerkTokenGetter()
  if (!token) {
    throw new Error('Clerk session token is null. User may not be authenticated.')
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

/**
 * List all Clerk Organizations (tenants).
 *
 * @returns { tenants: Tenant[], totalCount: number }
 */
export async function listTenants(): Promise<TenantListResponse> {
  const res = await fetch(`${FUNCTIONS_URL}/admin-tenants`, {
    headers: await getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to list tenants: ${res.status}`)
  return res.json() as Promise<TenantListResponse>
}

/**
 * Get a single Clerk Organization with full detail.
 *
 * @param orgId - Clerk org ID (e.g., "org_xxx")
 */
export async function getTenantDetail(orgId: string): Promise<TenantDetail> {
  const res = await fetch(`${FUNCTIONS_URL}/admin-tenants/${orgId}`, {
    headers: await getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to get tenant: ${res.status}`)
  return res.json() as Promise<TenantDetail>
}

/**
 * Create a new Clerk Organization (tenant).
 *
 * @param payload - { name: string, slug?: string }
 * @returns The newly created TenantDetail
 */
export async function createTenant(payload: CreateTenantPayload): Promise<TenantDetail> {
  const res = await fetch(`${FUNCTIONS_URL}/admin-tenants`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string }
    throw new Error(err.error ?? `Failed to create tenant: ${res.status}`)
  }
  return res.json() as Promise<TenantDetail>
}

// Re-export Tenant type for convenience
export type { Tenant, TenantDetail, CreateTenantPayload, TenantListResponse }
