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
import type { AdminUserListResponse, OrgMemberListResponse } from '@platform/types/admin'

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
  const res = await fetch(`${FUNCTIONS_URL}/admin-users`, {
    headers: await getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to list users: ${res.status}`)
  return res.json() as Promise<AdminUserListResponse>
}

/**
 * List all members of a specific organization (admin-only).
 * Calls the admin-tenants Supabase Edge Function members endpoint.
 *
 * @param orgId - Clerk org ID (e.g., "org_xxx")
 * @returns { members: OrgMember[], totalCount: number }
 */
export async function listOrgMembers(orgId: string): Promise<OrgMemberListResponse> {
  const res = await fetch(`${FUNCTIONS_URL}/admin-tenants/${orgId}/members`, {
    headers: await getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to list org members: ${res.status}`)
  return res.json() as Promise<OrgMemberListResponse>
}

// Re-export types for convenience
export type { AdminUser, AdminUserListResponse, OrgMembership, OrgMember, OrgMemberListResponse } from '@platform/types/admin'
