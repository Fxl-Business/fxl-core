// Supabase Edge Function: audit-auth
// Receives auth events (sign_in, sign_out) from the frontend and logs to audit_logs.
// Fire-and-forget: always returns 200, never blocks the auth flow.
//
// Runtime: Deno (Supabase Functions)
// Method: POST
// Auth: Bearer token (Clerk session token) — decoded internally
// Body: { event: 'sign_in' | 'sign_out' }
// Returns: { ok: true } always

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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// IMPORTANT: These values MUST match the CHECK constraint in 025_audit_logs.sql.
// The DB allows: 'sign_in' and 'sign_out' — NOT 'auth.sign_in' or 'auth.sign_out'.
const VALID_EVENTS = ['sign_in', 'sign_out'] as const

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return jsonOk() // Always 200, never block auth flow
  }

  try {
    // Extract and decode JWT from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonOk() // No token = silently skip
    }
    const token = authHeader.slice(7)

    let payload: Record<string, unknown>
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return jsonOk()
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
      payload = JSON.parse(atob(padded)) as Record<string, unknown>
    } catch {
      return jsonOk() // Bad token = silently skip
    }

    // Parse request body
    const body = await req.json().catch(() => null)
    if (!body || typeof body.event !== 'string') {
      return jsonOk()
    }

    const event = body.event as string
    if (!VALID_EVENTS.includes(event as typeof VALID_EVENTS[number])) {
      return jsonOk()
    }

    // Extract actor info from JWT
    const actorId = (payload.sub as string) ?? 'unknown'
    const actorEmail = (payload.email as string)
      ?? ((payload.unsafe_metadata as Record<string, unknown>)?.email as string)
      ?? ''
    const ipAddress = (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim())
      ?? req.headers.get('x-real-ip')
      ?? ''
    const userAgent = req.headers.get('user-agent') ?? ''

    // Extract session ID from JWT if available (jti or sid claim)
    const sessionId = (payload.sid as string) ?? (payload.jti as string) ?? null

    // Log to audit_logs — fire-and-forget, errors logged but never thrown
    // CRITICAL: action is bare 'sign_in'/'sign_out' — NOT prefixed with 'auth.'
    // This matches the CHECK constraint in 025_audit_logs.sql
    const supabase = getSupabaseAdmin()
    await supabase.from('audit_logs').insert({
      org_id: (payload.org_id as string) ?? null,
      actor_id: actorId,
      actor_email: actorEmail,
      actor_type: 'user',
      action: event, // bare 'sign_in' or 'sign_out' — matches DB CHECK constraint
      resource_type: 'session',
      resource_id: sessionId ?? actorId,
      resource_label: actorEmail || actorId,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: sessionId ? { session_id: sessionId } : null,
    })
  } catch (err) {
    // NEVER throw — log and return 200
    console.error('[audit-auth] Failed to log auth event:', err)
  }

  return jsonOk()
})

function jsonOk(): Response {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
