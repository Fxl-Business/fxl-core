// Supabase Edge Function: audit-logs
// Secure paginated query API for audit log data.
// Gated behind super_admin JWT claim — used by Phase 138 Admin UI.
//
// Runtime: Deno (Supabase Functions)
// Methods: GET only
// Auth: Bearer token with super_admin JWT claim required
// Query params: limit, offset, org_id, actor_id, action, resource_type, date_from, date_to
// Returns: { data: AuditLogRow[], total: number, limit: number, offset: number }

// @ts-nocheck — Deno runtime, not checked by project tsc
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

// Inline type — cannot import from src/ in Deno runtime
interface AuditLogRow {
  id: string
  org_id: string
  actor_id: string
  actor_email: string
  actor_type: 'user' | 'system' | 'trigger'
  action: string
  resource_type: string
  resource_id: string
  resource_label: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return jsonError('Method not allowed', 405)
  }

  // Extract and validate Authorization header
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('Missing or invalid Authorization header', 401)
  }
  const token = authHeader.slice(7)

  // Decode JWT payload (Supabase gateway already verified the token signature)
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

  // Parse query params
  const url = new URL(req.url)
  const params = url.searchParams

  // Pagination: limit (default 50, max 100, min 1), offset (default 0, min 0)
  const rawLimit = parseInt(params.get('limit') ?? '50', 10)
  const rawOffset = parseInt(params.get('offset') ?? '0', 10)
  const limit = Math.min(Math.max(isNaN(rawLimit) ? 50 : rawLimit, 1), 100)
  const offset = Math.max(isNaN(rawOffset) ? 0 : rawOffset, 0)

  // Optional filters
  const orgId = params.get('org_id') ?? null
  const actorId = params.get('actor_id') ?? null
  const action = params.get('action') ?? null
  const resourceType = params.get('resource_type') ?? null
  const dateFrom = params.get('date_from') ?? null
  const dateTo = params.get('date_to') ?? null

  // Build Supabase query with service role (bypasses RLS — super_admin check above is the access control)
  let query = getSupabaseAdmin()
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Apply optional filters
  if (orgId !== null) {
    query = query.eq('org_id', orgId)
  }
  if (actorId !== null) {
    query = query.eq('actor_id', actorId)
  }
  if (action !== null) {
    query = query.eq('action', action)
  }
  if (resourceType !== null) {
    query = query.eq('resource_type', resourceType)
  }
  if (dateFrom !== null) {
    query = query.gte('created_at', dateFrom)
  }
  if (dateTo !== null) {
    query = query.lte('created_at', dateTo)
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('[audit-logs] Query error:', error.message)
    return jsonError('Failed to query audit logs', 500)
  }

  return jsonOk({
    data: (data ?? []) as AuditLogRow[],
    total: count ?? 0,
    limit,
    offset,
  })
})

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
