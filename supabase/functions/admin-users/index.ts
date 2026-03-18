// Supabase Edge Function: admin-users
// Proxies Clerk Users API (list) for super admin use.
//
// Runtime: Deno (Supabase Functions)
// Methods: GET (list)
// Auth: Bearer token with super_admin JWT claim required
// Returns: { users: AdminUser[], totalCount: number }

// @ts-nocheck — Deno runtime, not checked by project tsc
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CLERK_SECRET_KEY = Deno.env.get('CLERK_SECRET_KEY')
const CLERK_API_BASE = 'https://api.clerk.com/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // Validate CLERK_SECRET_KEY is configured
  if (!CLERK_SECRET_KEY) {
    return jsonError('Server configuration error', 500)
  }

  // Extract Clerk JWT from Authorization header
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('Missing or invalid Authorization header', 401)
  }
  const token = authHeader.slice(7)

  // Decode JWT payload (Supabase gateway already verified the token)
  let payload: Record<string, unknown>
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return jsonError('Invalid JWT format', 401)
    }
    // Base64 URL decode the payload segment
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
    payload = JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return jsonError('Failed to decode token', 401)
  }

  // Enforce super_admin claim (handles both boolean true and string "true")
  if (payload.super_admin !== true && payload.super_admin !== 'true') {
    return jsonError('Forbidden: super_admin required', 403)
  }

  // Route: only GET /admin-users is supported
  if (req.method === 'GET') {
    return handleListUsers()
  }

  return jsonError('Not found', 404)
})

async function handleListUsers(): Promise<Response> {
  const clerkHeaders = { Authorization: `Bearer ${CLERK_SECRET_KEY}` }

  // 1. Fetch users and organizations in parallel
  const [usersRes, orgsRes] = await Promise.all([
    fetch(`${CLERK_API_BASE}/users?limit=100&order_by=-created_at`, { headers: clerkHeaders }),
    fetch(`${CLERK_API_BASE}/organizations?limit=100`, { headers: clerkHeaders }),
  ])

  if (!usersRes.ok) {
    const err = await usersRes.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    const message = err?.errors?.[0]?.message ?? 'Clerk API error'
    return jsonError(message, usersRes.status)
  }

  const rawData = await usersRes.json()
  const userList = Array.isArray(rawData) ? rawData : (rawData.data ?? [])

  // 2. Build user→org memberships map from org memberships
  // Clerk /v1/users does NOT include organization_memberships — fetch per org
  const userOrgMap = new Map<string, Array<{ orgId: string; orgName: string; role: string }>>()

  if (orgsRes.ok) {
    const orgsData = await orgsRes.json()
    const orgs = orgsData.data ?? []

    // Fetch memberships for all orgs in parallel
    const membershipResults = await Promise.all(
      orgs.map(async (org: Record<string, unknown>) => {
        const memRes = await fetch(
          `${CLERK_API_BASE}/organizations/${org.id}/memberships?limit=100`,
          { headers: clerkHeaders },
        )
        if (!memRes.ok) return { org, memberships: [] }
        const memData = await memRes.json()
        return { org, memberships: memData.data ?? [] }
      }),
    )

    for (const { org, memberships } of membershipResults) {
      for (const mem of memberships) {
        const userId = (mem.public_user_data as Record<string, unknown>)?.user_id ?? ''
        if (!userId) continue
        if (!userOrgMap.has(userId as string)) userOrgMap.set(userId as string, [])
        userOrgMap.get(userId as string)!.push({
          orgId: org.id as string,
          orgName: (org.name as string) ?? '',
          role: (mem.role as string) ?? 'member',
        })
      }
    }
  }

  // 3. Map users with enriched org memberships
  const users = userList.map((user: Record<string, unknown>) => ({
    id: user.id,
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    email: ((user.email_addresses as Array<Record<string, unknown>>) ?? [])
      .find((e) => e.id === user.primary_email_address_id)?.email_address ?? '',
    imageUrl: user.image_url ?? '',
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    organizationMemberships: userOrgMap.get(user.id as string) ?? [],
  }))

  return jsonOk({
    users,
    totalCount: users.length,
  })
}

function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function jsonError(error: string, status: number): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
