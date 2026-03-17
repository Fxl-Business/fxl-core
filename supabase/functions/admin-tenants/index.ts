// Supabase Edge Function: admin-tenants
// Proxies Clerk Organizations API (list, detail, create) for super admin use.
//
// Runtime: Deno (Supabase Functions)
// Methods: GET (list / detail), POST (create)
// Auth: Bearer token with super_admin JWT claim required
// Returns: Tenant[] | TenantDetail | TenantDetail (created)

// @ts-nocheck — Deno runtime, not checked by project tsc
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CLERK_SECRET_KEY = Deno.env.get('CLERK_SECRET_KEY')
const CLERK_API_BASE = 'https://api.clerk.com/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  // Route: parse URL path
  const url = new URL(req.url)
  // Path format: /admin-tenants or /admin-tenants/:orgId
  // Supabase functions URL: /functions/v1/admin-tenants[/orgId]
  const pathParts = url.pathname.split('/').filter(Boolean)
  // Last segment after function name
  const functionIndex = pathParts.findIndex((p) => p === 'admin-tenants')
  const orgId = functionIndex !== -1 && pathParts.length > functionIndex + 1
    ? pathParts[functionIndex + 1]
    : null

  if (req.method === 'GET' && !orgId) {
    // List all Clerk organizations
    return handleListOrgs()
  }

  if (req.method === 'GET' && orgId) {
    // Get single org detail
    return handleGetOrg(orgId)
  }

  if (req.method === 'POST' && !orgId) {
    // Create a new org
    const userId = payload.sub as string | undefined
    if (!userId) {
      return jsonError('Missing user ID in token', 401)
    }
    const body = await req.json().catch(() => null)
    if (!body || typeof body.name !== 'string') {
      return jsonError('Request body must include { name: string }', 400)
    }
    return handleCreateOrg(body.name, body.slug as string | undefined, userId)
  }

  return jsonError('Not found', 404)
})

async function handleListOrgs(): Promise<Response> {
  const res = await fetch(`${CLERK_API_BASE}/organizations?limit=100&order_by=-created_at&include_members_count=true`, {
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    const message = err?.errors?.[0]?.message ?? 'Clerk API error'
    return jsonError(message, res.status)
  }

  const data = await res.json()
  const orgs = data.data ?? []

  const tenants = orgs.map((org: Record<string, unknown>) => ({
    id: org.id,
    name: org.name,
    slug: org.slug ?? null,
    membersCount: org.members_count ?? 0,
    createdAt: org.created_at,
    imageUrl: org.image_url ?? '',
  }))

  return jsonOk({
    tenants,
    totalCount: data.total_count ?? tenants.length,
  })
}

async function handleGetOrg(orgId: string): Promise<Response> {
  const res = await fetch(`${CLERK_API_BASE}/organizations/${orgId}`, {
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    const message = err?.errors?.[0]?.message ?? 'Clerk API error'
    return jsonError(message, res.status)
  }

  const org = await res.json()

  return jsonOk({
    id: org.id,
    name: org.name,
    slug: org.slug ?? null,
    membersCount: org.members_count ?? 0,
    createdAt: org.created_at,
    imageUrl: org.image_url ?? '',
    publicMetadata: org.public_metadata ?? {},
    privateMetadata: org.private_metadata ?? {},
    maxAllowedMemberships: org.max_allowed_memberships ?? null,
    adminDeleteEnabled: org.admin_delete_enabled ?? false,
  })
}

async function handleCreateOrg(
  name: string,
  slug: string | undefined,
  createdBy: string,
): Promise<Response> {
  const body: Record<string, unknown> = { name, created_by: createdBy }
  if (slug) body.slug = slug

  const res = await fetch(`${CLERK_API_BASE}/organizations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    const message = err?.errors?.[0]?.message ?? 'Clerk API error'
    return jsonError(message, res.status)
  }

  const org = await res.json()

  return new Response(
    JSON.stringify({
      id: org.id,
      name: org.name,
      slug: org.slug ?? null,
      membersCount: org.members_count ?? 0,
      createdAt: org.created_at,
      imageUrl: org.image_url ?? '',
      publicMetadata: org.public_metadata ?? {},
      privateMetadata: org.private_metadata ?? {},
      maxAllowedMemberships: org.max_allowed_memberships ?? null,
      adminDeleteEnabled: org.admin_delete_enabled ?? false,
    }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
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
