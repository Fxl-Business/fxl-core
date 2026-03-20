/**
 * Client-side admin user management service.
 *
 * Calls the `admin-users` Supabase Edge Function which proxies Clerk
 * Users API. Requires the caller to have a Clerk session token
 * with `super_admin: true` JWT claim.
 *
 * Usage:
 *   // In a component that has access to Clerk session:
 *   setAdminClerkTokenGetter(() => session.getToken())
 *   const { users, totalCount } = await listUsers()
 */
import type {
  AdminUserListResponse,
  OrgMemberListResponse,
  AddMemberResponse,
  RemoveMemberResponse,
  ImpersonationTokenResponse,
} from '@platform/types/admin'
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
 * setAdminClerkTokenGetter(() => session.getToken())
 * ```
 */
export function setAdminClerkTokenGetter(fn: () => Promise<string | null>): void {
  _clerkTokenGetter = fn
}

async function getAuthHeaders(): Promise<HeadersInit> {
  if (!_clerkTokenGetter) {
    throw new Error(
      'Clerk token getter not set. Call setAdminClerkTokenGetter() before using admin service.',
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
 * List all Clerk users (admin-only).
 * Calls the admin-users Supabase Edge Function.
 *
 * @returns { users: AdminUser[], totalCount: number }
 */
export async function listUsers(): Promise<AdminUserListResponse> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-users`, {
      headers: await getAuthHeaders(),
    })
    if (!res.ok) throw new Error(`Failed to list users: ${res.status}`)
    return res.json() as Promise<AdminUserListResponse>
  })
}

/**
 * List all members of a specific organization (admin-only).
 * Calls the admin-tenants Supabase Edge Function members endpoint.
 *
 * @param orgId - Clerk org ID (e.g., "org_xxx")
 * @returns { members: OrgMember[], totalCount: number }
 */
export async function listOrgMembers(orgId: string): Promise<OrgMemberListResponse> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-tenants/${orgId}?include=members`, {
      headers: await getAuthHeaders(),
    })
    if (!res.ok) throw new Error(`Failed to list org members: ${res.status}`)
    return res.json() as Promise<OrgMemberListResponse>
  })
}

/**
 * Add a user to a Clerk organization (admin-only).
 * Calls admin-tenants edge function with ?action=add-member.
 *
 * @param orgId - Clerk org ID (e.g., "org_xxx")
 * @param userId - Clerk user ID (e.g., "user_xxx")
 * @returns { userId, role, joinedAt }
 */
export async function addOrgMember(
  orgId: string,
  userId: string,
): Promise<AddMemberResponse> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-tenants?action=add-member`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ orgId, userId, role: 'org:member' }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string }
      throw new Error(body.error ?? `Failed to add member: ${res.status}`)
    }
    return res.json() as Promise<AddMemberResponse>
  })
}

/**
 * Remove a user from a Clerk organization (admin-only).
 * Calls admin-tenants edge function with ?action=remove-member.
 *
 * @param orgId - Clerk org ID (e.g., "org_xxx")
 * @param userId - Clerk user ID (e.g., "user_xxx")
 * @returns { removed: true, userId }
 */
export async function removeOrgMember(
  orgId: string,
  userId: string,
): Promise<RemoveMemberResponse> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-tenants?action=remove-member`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ orgId, userId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string }
      throw new Error(body.error ?? `Failed to remove member: ${res.status}`)
    }
    return res.json() as Promise<RemoveMemberResponse>
  })
}

/**
 * Get a Supabase JWT scoped to a specific org (admin impersonation).
 * Calls admin-tenants edge function with ?action=impersonate-token.
 *
 * @param orgId - The Clerk org ID to impersonate (e.g., "org_xxx")
 * @returns { access_token, expires_in, org_id, is_impersonation }
 */
export async function getImpersonationToken(
  orgId: string,
): Promise<ImpersonationTokenResponse> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-tenants?action=impersonate-token`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ orgId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string }
      throw new Error(body.error ?? `Failed to get impersonation token: ${res.status}`)
    }
    return res.json() as Promise<ImpersonationTokenResponse>
  })
}

// Re-export types for convenience
export type {
  AdminUser,
  AdminUserListResponse,
  OrgMembership,
  OrgMember,
  OrgMemberListResponse,
  AddMemberResponse,
  RemoveMemberResponse,
  ImpersonationTokenResponse,
} from '@platform/types/admin'
