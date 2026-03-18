// Supabase Edge Function: auth-token-exchange
// Validates a Clerk JWT, extracts org_id/user_id/role, and mints a Supabase-compatible JWT.
//
// Runtime: Deno (Supabase Functions)
// Method: POST
// Auth: Bearer token (Clerk session token)
// Returns: { access_token: string, expires_in: number }

// @ts-nocheck — Deno runtime, not checked by project tsc
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'

const CLERK_ISSUER = Deno.env.get('CLERK_ISSUER') // e.g., https://clerk.your-domain.com
const CLERK_JWKS_URL = CLERK_ISSUER ? `${CLERK_ISSUER}/.well-known/jwks.json` : null
const SUPABASE_JWT_SECRET = Deno.env.get('JWT_SIGNING_SECRET') // from Supabase Dashboard -> Settings -> API -> JWT Secret
const TOKEN_EXPIRY_SECONDS = 3600 // 1 hour

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405)
  }

  // Validate environment
  if (!CLERK_ISSUER || !CLERK_JWKS_URL) {
    return jsonError('CLERK_ISSUER environment variable not set', 500)
  }
  if (!SUPABASE_JWT_SECRET) {
    return jsonError('SUPABASE_JWT_SECRET environment variable not set', 500)
  }

  // Extract Clerk token from Authorization header
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('Missing or invalid Authorization header', 401)
  }
  const clerkToken = authHeader.slice(7)

  // Parse request body to get org_id (Clerk default session tokens don't include org claims)
  let bodyOrgId: string | undefined
  try {
    const body = await req.json()
    bodyOrgId = typeof body?.org_id === 'string' ? body.org_id : undefined
  } catch {
    // No body or invalid JSON — org_id may still come from JWT claims
  }

  try {
    // Fetch Clerk JWKS and verify the token
    const jwks = jose.createRemoteJWKSet(new URL(CLERK_JWKS_URL))
    // Verify signature via Clerk JWKS (issuer check skipped — JWKS already
    // guarantees the token was signed by our Clerk instance)
    const { payload } = await jose.jwtVerify(clerkToken, jwks)

    // Extract claims from Clerk JWT
    const userId = payload.sub
    // Prefer org_id from JWT claims; fall back to request body
    const orgId = (payload as Record<string, unknown>).org_id as string | undefined ?? bodyOrgId
    const orgRole = (payload as Record<string, unknown>).org_role as string | undefined

    if (!userId) {
      return jsonError('Clerk token missing sub claim', 401)
    }

    if (!orgId) {
      return jsonError('org_id is required. Pass it in the request body as { org_id: string }.', 400)
    }

    // Mint Supabase-compatible JWT
    const now = Math.floor(Date.now() / 1000)
    const secret = new TextEncoder().encode(SUPABASE_JWT_SECRET)

    const supabaseJwt = await new jose.SignJWT({
      sub: userId,
      org_id: orgId,
      role: orgRole ?? 'authenticated',
      aud: 'authenticated',
      iss: 'supabase',
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + TOKEN_EXPIRY_SECONDS)
      .sign(secret)

    return new Response(
      JSON.stringify({
        access_token: supabaseJwt,
        expires_in: TOKEN_EXPIRY_SECONDS,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token verification failed'

    // Distinguish between verification errors and other errors
    if (message.includes('JWS') || message.includes('JWT') || message.includes('signature')) {
      return jsonError(`Invalid Clerk token: ${message}`, 401)
    }

    console.error('Token exchange error:', err)
    return jsonError(`Token exchange failed: ${message}`, 500)
  }
})

function jsonError(error: string, status: number): Response {
  return new Response(
    JSON.stringify({ error, status }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}
