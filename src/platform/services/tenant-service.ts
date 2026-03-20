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
import type { CreateTenantPayload, Tenant, TenantDetail, TenantListResponse, ArchiveTenantResponse, RestoreTenantResponse } from '@platform/types/tenant'
import { withRetry } from '@platform/lib/retry'

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
 * List Clerk Organizations (tenants), filtered by status.
 *
 * @param status - 'active' (default) or 'archived'
 * @returns { tenants: Tenant[], totalCount: number }
 */
export async function listTenants(status: 'active' | 'archived' = 'active'): Promise<TenantListResponse> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-tenants?status=${status}`, {
      headers: await getAuthHeaders(),
    })
    if (!res.ok) throw new Error(`Failed to list tenants: ${res.status}`)
    return res.json() as Promise<TenantListResponse>
  })
}

/**
 * Get a single Clerk Organization with full detail.
 *
 * @param orgId - Clerk org ID (e.g., "org_xxx")
 */
export async function getTenantDetail(orgId: string): Promise<TenantDetail> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-tenants/${orgId}`, {
      headers: await getAuthHeaders(),
    })
    if (!res.ok) throw new Error(`Failed to get tenant: ${res.status}`)
    return res.json() as Promise<TenantDetail>
  })
}

/**
 * Create a new Clerk Organization (tenant).
 *
 * @param payload - { name: string, slug?: string }
 * @returns The newly created TenantDetail
 */
export async function createTenant(payload: CreateTenantPayload): Promise<TenantDetail> {
  return withRetry(async () => {
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
  })
}

/**
 * Archive a tenant (soft-delete).
 * Sets archived_at on all org-scoped data, removes memberships, flags Clerk org.
 *
 * @param orgId - Clerk org ID (e.g., "org_xxx")
 */
export async function archiveTenant(orgId: string): Promise<ArchiveTenantResponse> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-tenants?action=archive`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ orgId }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string }
      throw new Error(err.error ?? `Failed to archive tenant: ${res.status}`)
    }
    return res.json() as Promise<ArchiveTenantResponse>
  })
}

/**
 * Restore an archived tenant.
 * Clears archived_at on all org-scoped data, removes archived flag from Clerk org.
 * Does NOT restore memberships — admin re-adds manually.
 *
 * @param orgId - Clerk org ID (e.g., "org_xxx")
 */
export async function restoreTenant(orgId: string): Promise<RestoreTenantResponse> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-tenants?action=restore`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ orgId }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string }
      throw new Error(err.error ?? `Failed to restore tenant: ${res.status}`)
    }
    return res.json() as Promise<RestoreTenantResponse>
  })
}

// Re-export types for convenience
export type { Tenant, TenantDetail, CreateTenantPayload, TenantListResponse, ArchiveTenantResponse, RestoreTenantResponse }
