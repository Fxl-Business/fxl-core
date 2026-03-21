// Supabase Edge Function: admin-tenants
// Proxies Clerk Organizations API (list, detail, create, member management) for super admin use.
// Also handles tenant archival/restore operations.
//
// Runtime: Deno (Supabase Functions)
// Methods: GET (list / detail), POST (create / add-member / impersonate-token / archive / restore), DELETE (remove-member)
// Auth: Bearer token with super_admin JWT claim required
// Returns: Tenant[] | TenantDetail | TenantDetail (created) | member response | impersonation token | archive/restore result

// @ts-nocheck — Deno runtime, not checked by project tsc
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { logAuditEvent, extractAuditContext } from '../_shared/audit.ts'

const CLERK_SECRET_KEY = Deno.env.get('CLERK_SECRET_KEY')
const CLERK_API_BASE = 'https://api.clerk.com/v1'
const SUPABASE_JWT_SECRET = Deno.env.get('JWT_SIGNING_SECRET')
const TOKEN_EXPIRY_SECONDS = 3600

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH, OPTIONS',
}

const ARCHIVABLE_TABLES = [
  'tenant_modules', 'comments', 'share_tokens', 'blueprint_configs',
  'briefing_configs', 'knowledge_entries', 'tasks', 'documents',
  'clients', 'projects',
] as const

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

  // Route: parse URL path and query params
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  // Extract orgId: last path segment that starts with "org_" (handles both
  // /admin-tenants/org_xxx and /functions/v1/admin-tenants/org_xxx)
  const orgId = pathParts.find((p) => p.startsWith('org_')) ?? null
  // Members can be requested via sub-path (/members) or query param (?include=members)
  const isMembers = orgId !== null && (
    pathParts.includes('members') ||
    url.searchParams.get('include') === 'members'
  )

  // Action-based routes via ?action= query param
  const action = url.searchParams.get('action')

  if (req.method === 'POST' && action === 'add-member') {
    const body = await req.json().catch(() => null)
    if (!body || typeof body.orgId !== 'string' || typeof body.userId !== 'string') {
      return jsonError('Request body must include { orgId: string, userId: string }', 400)
    }
    return handleAddMember(body.orgId, body.userId, body.role as string | undefined, req, payload)
  }

  if (req.method === 'DELETE' && action === 'remove-member') {
    const body = await req.json().catch(() => null)
    if (!body || typeof body.orgId !== 'string' || typeof body.userId !== 'string') {
      return jsonError('Request body must include { orgId: string, userId: string }', 400)
    }
    return handleRemoveMember(body.orgId, body.userId, req, payload)
  }

  if (req.method === 'POST' && action === 'impersonate-token') {
    const body = await req.json().catch(() => null)
    if (!body || typeof body.orgId !== 'string') {
      return jsonError('Request body must include { orgId: string }', 400)
    }
    // Extract userId from the admin's JWT payload (already decoded above)
    const adminUserId = payload.sub as string | undefined
    if (!adminUserId) {
      return jsonError('Missing user ID in admin token', 401)
    }
    return handleImpersonateToken(body.orgId, adminUserId, req, payload)
  }

  if (req.method === 'POST' && action === 'archive') {
    const body = await req.json().catch(() => null)
    if (!body || typeof body.orgId !== 'string') {
      return jsonError('Request body must include { orgId: string }', 400)
    }
    return handleArchiveTenant(body.orgId, req, payload)
  }

  if (req.method === 'POST' && action === 'restore') {
    const body = await req.json().catch(() => null)
    if (!body || typeof body.orgId !== 'string') {
      return jsonError('Request body must include { orgId: string }', 400)
    }
    return handleRestoreTenant(body.orgId, req, payload)
  }

  if (req.method === 'GET' && !orgId) {
    // List all Clerk organizations
    const status = url.searchParams.get('status') ?? 'active'
    return handleListOrgs(status)
  }

  if (req.method === 'GET' && orgId && isMembers) {
    // List members of a specific org
    return handleListMembers(orgId)
  }

  if (req.method === 'GET' && orgId && !isMembers) {
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
    return handleCreateOrg(body.name, body.slug as string | undefined, userId, req, payload)
  }

  return jsonError('Not found', 404)
})

async function handleListOrgs(status: string = 'active'): Promise<Response> {
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

  // Map and include publicMetadata for filtering
  const allTenants = orgs.map((org: Record<string, unknown>) => {
    const pubMeta = (org.public_metadata ?? {}) as Record<string, unknown>
    return {
      id: org.id,
      name: org.name,
      slug: org.slug ?? null,
      membersCount: org.members_count ?? 0,
      createdAt: org.created_at,
      imageUrl: org.image_url ?? '',
      archived: pubMeta.archived === true,
    }
  })

  // Filter by status
  const tenants = status === 'archived'
    ? allTenants.filter((t: { archived: boolean }) => t.archived)
    : allTenants.filter((t: { archived: boolean }) => !t.archived)

  return jsonOk({
    tenants,
    totalCount: tenants.length,
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
  req: Request,
  payload: Record<string, unknown>,
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

  const supabase = getSupabaseAdmin()
  const ctx = extractAuditContext(req, payload)
  await logAuditEvent(supabase, {
    org_id: org.id as string,
    actor_id: ctx.actor_id,
    actor_email: ctx.actor_email,
    actor_type: 'user',
    action: 'create',
    resource_type: 'tenant',
    resource_id: org.id as string,
    resource_label: (org.name as string) ?? '',
    ip_address: ctx.ip_address,
    user_agent: ctx.user_agent,
    metadata: { slug: org.slug ?? null },
  })

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

async function handleListMembers(orgId: string): Promise<Response> {
  const res = await fetch(
    `${CLERK_API_BASE}/organizations/${orgId}/memberships?limit=100`,
    {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    const message = err?.errors?.[0]?.message ?? 'Clerk API error'
    return jsonError(message, res.status)
  }

  const data = await res.json()
  const memberships = data.data ?? []

  const members = memberships.map((mem: Record<string, unknown>) => {
    const pubData = (mem.public_user_data as Record<string, unknown>) ?? {}
    return {
      userId: pubData.user_id ?? mem.user_id ?? '',
      firstName: pubData.first_name ?? null,
      lastName: pubData.last_name ?? null,
      email: pubData.identifier ?? '',
      imageUrl: pubData.image_url ?? '',
      role: mem.role ?? 'member',
      joinedAt: mem.created_at ?? 0,
    }
  })

  return jsonOk({
    members,
    totalCount: data.total_count ?? members.length,
  })
}

async function handleAddMember(
  orgId: string,
  userId: string,
  role: string = 'org:member',
  req: Request,
  payload: Record<string, unknown>,
): Promise<Response> {
  const res = await fetch(
    `${CLERK_API_BASE}/organizations/${orgId}/memberships`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, role }),
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    const message = err?.errors?.[0]?.message ?? 'Clerk API error'
    return jsonError(message, res.status)
  }

  const data = await res.json()
  const pubData = (data.public_user_data as Record<string, unknown>) ?? {}

  const supabaseAdmin = getSupabaseAdmin()
  const ctx = extractAuditContext(req, payload)
  await logAuditEvent(supabaseAdmin, {
    org_id: orgId,
    actor_id: ctx.actor_id,
    actor_email: ctx.actor_email,
    actor_type: 'user',
    action: 'add_member',
    resource_type: 'org_member',
    resource_id: userId,
    resource_label: `${userId} -> ${orgId}`,
    ip_address: ctx.ip_address,
    user_agent: ctx.user_agent,
    metadata: { role: (data.role ?? role) as string },
  })

  return jsonOk({
    userId: (pubData.user_id ?? data.user_id ?? userId) as string,
    role: (data.role ?? role) as string,
    joinedAt: (data.created_at ?? 0) as number,
  })
}

async function handleRemoveMember(
  orgId: string,
  userId: string,
  req: Request,
  payload: Record<string, unknown>,
): Promise<Response> {
  // Clerk DELETE endpoint uses userId as the membership identifier
  const res = await fetch(
    `${CLERK_API_BASE}/organizations/${orgId}/memberships/${userId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    const message = err?.errors?.[0]?.message ?? 'Clerk API error'
    return jsonError(message, res.status)
  }

  const supabaseAdmin = getSupabaseAdmin()
  const ctx = extractAuditContext(req, payload)
  await logAuditEvent(supabaseAdmin, {
    org_id: orgId,
    actor_id: ctx.actor_id,
    actor_email: ctx.actor_email,
    actor_type: 'user',
    action: 'remove_member',
    resource_type: 'org_member',
    resource_id: userId,
    resource_label: `${userId} -> ${orgId}`,
    ip_address: ctx.ip_address,
    user_agent: ctx.user_agent,
    metadata: null,
  })

  return jsonOk({ removed: true, userId })
}

async function handleArchiveTenant(
  orgId: string,
  req: Request,
  payload: Record<string, unknown>,
): Promise<Response> {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  // Step 1: List all org memberships
  const membersRes = await fetch(
    `${CLERK_API_BASE}/organizations/${orgId}/memberships?limit=100`,
    { headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` } },
  )
  if (!membersRes.ok) {
    const err = await membersRes.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    return jsonError(err?.errors?.[0]?.message ?? 'Failed to list members for archival', membersRes.status)
  }
  const membersData = await membersRes.json()
  const memberIds: string[] = (membersData.data ?? []).map(
    (m: Record<string, unknown>) => {
      const pub = (m.public_user_data as Record<string, unknown>) ?? {}
      return (pub.user_id ?? m.user_id ?? '') as string
    }
  ).filter((id: string) => id.length > 0)

  // Step 2: Remove all memberships
  const removeResults = await Promise.allSettled(
    memberIds.map((userId: string) =>
      fetch(`${CLERK_API_BASE}/organizations/${orgId}/memberships/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` },
      })
    )
  )
  const removeFailed = removeResults.filter(r => r.status === 'rejected').length
  if (removeFailed > 0) {
    return jsonError(`Failed to remove ${removeFailed} of ${memberIds.length} members`, 500)
  }

  // Step 3: Set Clerk org publicMetadata.archived = true
  const metaRes = await fetch(`${CLERK_API_BASE}/organizations/${orgId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_metadata: { archived: true } }),
  })
  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    return jsonError(err?.errors?.[0]?.message ?? 'Failed to set archived metadata', metaRes.status)
  }

  // Step 4: Stamp archived_at on all Supabase tables
  const dbResults = await Promise.allSettled(
    ARCHIVABLE_TABLES.map((table) =>
      supabase
        .from(table)
        .update({ archived_at: now })
        .eq('org_id', orgId)
        .is('archived_at', null)
    )
  )
  const dbErrors = dbResults
    .map((r, i) => {
      if (r.status === 'rejected') return ARCHIVABLE_TABLES[i]
      if (r.status === 'fulfilled' && r.value.error) return `${ARCHIVABLE_TABLES[i]}: ${r.value.error.message}`
      return null
    })
    .filter(Boolean)

  if (dbErrors.length > 0) {
    return jsonError(`Partial archive — DB errors: ${dbErrors.join(', ')}`, 500)
  }

  const ctx = extractAuditContext(req, payload)
  await logAuditEvent(supabase, {
    org_id: orgId,
    actor_id: ctx.actor_id,
    actor_email: ctx.actor_email,
    actor_type: 'user',
    action: 'archive',
    resource_type: 'tenant',
    resource_id: orgId,
    resource_label: orgId,
    ip_address: ctx.ip_address,
    user_agent: ctx.user_agent,
    metadata: { members_removed: memberIds.length, tables_updated: ARCHIVABLE_TABLES.length },
  })

  return jsonOk({
    archived: true,
    orgId,
    membersRemoved: memberIds.length,
    tablesUpdated: ARCHIVABLE_TABLES.length,
    archivedAt: now,
  })
}

async function handleRestoreTenant(
  orgId: string,
  req: Request,
  payload: Record<string, unknown>,
): Promise<Response> {
  const supabase = getSupabaseAdmin()

  // Step 1: Clear archived_at on all Supabase tables
  const dbResults = await Promise.allSettled(
    ARCHIVABLE_TABLES.map((table) =>
      supabase
        .from(table)
        .update({ archived_at: null })
        .eq('org_id', orgId)
        .not('archived_at', 'is', null)
    )
  )
  const dbErrors = dbResults
    .map((r, i) => {
      if (r.status === 'rejected') return ARCHIVABLE_TABLES[i]
      if (r.status === 'fulfilled' && r.value.error) return `${ARCHIVABLE_TABLES[i]}: ${r.value.error.message}`
      return null
    })
    .filter(Boolean)

  if (dbErrors.length > 0) {
    return jsonError(`Partial restore — DB errors: ${dbErrors.join(', ')}`, 500)
  }

  // Step 2: Clear archived from Clerk org publicMetadata
  const metaRes = await fetch(`${CLERK_API_BASE}/organizations/${orgId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_metadata: { archived: null } }),
  })
  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }))
    return jsonError(err?.errors?.[0]?.message ?? 'Failed to clear archived metadata', metaRes.status)
  }

  const ctx = extractAuditContext(req, payload)
  await logAuditEvent(supabase, {
    org_id: orgId,
    actor_id: ctx.actor_id,
    actor_email: ctx.actor_email,
    actor_type: 'user',
    action: 'restore',
    resource_type: 'tenant',
    resource_id: orgId,
    resource_label: orgId,
    ip_address: ctx.ip_address,
    user_agent: ctx.user_agent,
    metadata: { tables_updated: ARCHIVABLE_TABLES.length },
  })

  return jsonOk({
    restored: true,
    orgId,
    tablesUpdated: ARCHIVABLE_TABLES.length,
  })
}

async function handleImpersonateToken(
  orgId: string,
  adminUserId: string,
  req: Request,
  payload: Record<string, unknown>,
): Promise<Response> {
  if (!SUPABASE_JWT_SECRET) {
    return jsonError('SUPABASE_JWT_SECRET not configured', 500)
  }

  const now = Math.floor(Date.now() / 1000)
  const secret = new TextEncoder().encode(SUPABASE_JWT_SECRET)

  const supabaseJwt = await new jose.SignJWT({
    sub: adminUserId,
    org_id: orgId,
    role: 'authenticated',
    aud: 'authenticated',
    iss: 'supabase',
    is_impersonation: true,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + TOKEN_EXPIRY_SECONDS)
    .sign(secret)

  const supabaseAdmin = getSupabaseAdmin()
  const ctx = extractAuditContext(req, payload)
  await logAuditEvent(supabaseAdmin, {
    org_id: orgId,
    actor_id: ctx.actor_id,
    actor_email: ctx.actor_email,
    actor_type: 'user',
    action: 'impersonate',
    resource_type: 'tenant',
    resource_id: orgId,
    resource_label: orgId,
    ip_address: ctx.ip_address,
    user_agent: ctx.user_agent,
    metadata: { expires_in: TOKEN_EXPIRY_SECONDS },
  })

  return jsonOk({
    access_token: supabaseJwt,
    expires_in: TOKEN_EXPIRY_SECONDS,
    org_id: orgId,
    is_impersonation: true,
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
