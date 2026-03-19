/**
 * smoke-test.ts
 *
 * Programmatic smoke test for the Nexo multi-tenant data isolation pipeline.
 * Mints Supabase-compatible JWTs locally (HS256 via node:crypto), queries the
 * documents table with org-scoped tokens, and verifies RLS isolation.
 *
 * Usage:
 *   npx tsx --env-file .env.local scripts/smoke-test.ts
 *   make smoke-test
 *
 * Required env vars:
 *   VITE_SUPABASE_URL             — Supabase project URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY — Supabase anon key
 *   VITE_SUPABASE_FUNCTIONS_URL   — Supabase Edge Functions URL
 *   JWT_SIGNING_SECRET            — Same secret used by auth-token-exchange edge function
 *   SMOKE_TEST_USER_ID            — Any valid Clerk user sub
 *   SMOKE_TEST_ORG_A              — Org ID with documents (positive case)
 *   SMOKE_TEST_ORG_B              — Org ID with zero documents (isolation case)
 *
 * Exit codes:
 *   0 — all steps passed
 *   1 — one or more steps failed
 */

import { createHmac } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_FUNCTIONS_URL',
  'JWT_SIGNING_SECRET',
  'SMOKE_TEST_USER_ID',
  'SMOKE_TEST_ORG_A',
  'SMOKE_TEST_ORG_B',
] as const

function loadEnv(): Record<(typeof REQUIRED_ENV_VARS)[number], string> {
  const missing: string[] = []
  const env: Record<string, string> = {}

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key] ?? ''
    if (!value) {
      missing.push(key)
    }
    env[key] = value
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required env var(s): ${missing.join(', ')}\n` +
      'Add them to .env.local — see .env.local.example for details.',
    )
  }

  return env as Record<(typeof REQUIRED_ENV_VARS)[number], string>
}

// ---------------------------------------------------------------------------
// JWT Minting (HS256, same algorithm as auth-token-exchange edge function)
// ---------------------------------------------------------------------------

function base64url(input: string): string {
  return Buffer.from(input).toString('base64url')
}

function mintJWT(userId: string, orgId: string, secret: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({
    sub: userId,
    org_id: orgId,
    role: 'authenticated',
    aud: 'authenticated',
    iss: 'supabase',
    iat: now,
    exp: now + 3600,
  }))
  const signingInput = `${header}.${payload}`
  const signature = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url')
  return `${signingInput}.${signature}`
}

// ---------------------------------------------------------------------------
// Document Query (fresh Supabase client per call — no shared state)
// ---------------------------------------------------------------------------

async function queryDocuments(jwt: string, url: string, anonKey: string): Promise<number> {
  const client = createClient(url, anonKey, {
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers)
        headers.set('Authorization', `Bearer ${jwt}`)
        headers.set('apikey', anonKey)
        return fetch(input, { ...init, headers })
      },
    },
  })
  const { data, error } = await client.from('documents').select('id', { count: 'exact', head: false })
  if (error) throw new Error(`Supabase query error: ${error.message}`)
  return data?.length ?? 0
}

// ---------------------------------------------------------------------------
// Edge Function Health Check
// ---------------------------------------------------------------------------

async function checkEdgeFunctionHealth(functionsUrl: string): Promise<void> {
  const res = await fetch(`${functionsUrl}/auth-token-exchange`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer invalid-token-for-health-check',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ org_id: 'test' }),
  })
  // We expect 401 (invalid token) — that proves the function is deployed and running
  // 404 or network error = not deployed (Pitfall #10: CORS error means undeployed)
  if (res.status === 401) return
  const body = await res.text().catch(() => '')
  throw new Error(
    `auth-token-exchange health check failed: expected 401, got ${res.status}. ` +
    `Body: ${body.slice(0, 200)}`,
  )
}

// ---------------------------------------------------------------------------
// Step Runner
// ---------------------------------------------------------------------------

interface StepResult {
  label: string
  passed: boolean
  error?: string
}

const results: StepResult[] = []

async function step(label: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn()
    results.push({ label, passed: true })
    console.log(`  PASS  [${label}]`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    results.push({ label, passed: false, error: message })
    console.log(`  FAIL  [${label}]: ${message}`)
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('')
  console.log('===================================')
  console.log(' Nexo Multi-Tenant Smoke Test')
  console.log('===================================')
  console.log('')

  // Shared state between steps
  let env: Record<(typeof REQUIRED_ENV_VARS)[number], string> | undefined
  let jwtA = ''
  let jwtB = ''
  let countA = -1
  let countB = -1

  // Step 1: Validate env vars
  await step('env vars present', () => {
    env = loadEnv()
  })

  if (!env) {
    // Can't continue without env vars
    printSummary()
    process.exit(1)
  }

  // Step 2: Edge function health check
  await step('auth-token-exchange deployed', async () => {
    await checkEdgeFunctionHealth(env!.VITE_SUPABASE_FUNCTIONS_URL)
  })

  // Step 3: Mint JWT for org A
  await step('org A JWT minted', () => {
    jwtA = mintJWT(env!.SMOKE_TEST_USER_ID, env!.SMOKE_TEST_ORG_A, env!.JWT_SIGNING_SECRET)
    const parts = jwtA.split('.')
    if (parts.length !== 3) {
      throw new Error(`JWT has ${parts.length} parts, expected 3`)
    }
  })

  // Step 4: Mint JWT for org B
  await step('org B JWT minted', () => {
    jwtB = mintJWT(env!.SMOKE_TEST_USER_ID, env!.SMOKE_TEST_ORG_B, env!.JWT_SIGNING_SECRET)
    const parts = jwtB.split('.')
    if (parts.length !== 3) {
      throw new Error(`JWT has ${parts.length} parts, expected 3`)
    }
  })

  // Step 5: Org A should see its documents
  await step('org A sees its documents', async () => {
    countA = await queryDocuments(jwtA, env!.VITE_SUPABASE_URL, env!.VITE_SUPABASE_PUBLISHABLE_KEY)
    if (countA === 0) {
      throw new Error(
        `org A (${env!.SMOKE_TEST_ORG_A}) returned 0 documents — expected > 0. ` +
        'Check RLS policies and token exchange.',
      )
    }
  })

  // Step 6: Org B should see no documents (isolation)
  await step('org B sees no documents (isolation)', async () => {
    countB = await queryDocuments(jwtB, env!.VITE_SUPABASE_URL, env!.VITE_SUPABASE_PUBLISHABLE_KEY)
    if (countB !== 0) {
      throw new Error(
        `org B (${env!.SMOKE_TEST_ORG_B}) returned ${countB} documents — expected 0. ` +
        'RLS isolation breach detected!',
      )
    }
  })

  // Step 7: Cross-check isolation
  await step('RLS isolation confirmed', () => {
    if (countA === countB) {
      throw new Error(
        `org A and org B both returned ${countA} documents — isolation not working. ` +
        'Expected different counts.',
      )
    }
    if (countA <= 0 || countB !== 0) {
      throw new Error(
        `Unexpected counts: org A=${countA}, org B=${countB}. ` +
        'Expected org A > 0 and org B = 0.',
      )
    }
  })

  printSummary()

  const failCount = results.filter(r => !r.passed).length
  if (failCount > 0) {
    process.exit(1)
  }
}

function printSummary(): void {
  const total = results.length
  const passed = results.filter(r => r.passed).length
  const failed = total - passed

  console.log('')
  console.log('===================================')
  if (failed === 0) {
    console.log(`  PASSED (${passed}/${total} steps)`)
  } else {
    console.log(`  FAILED (${failed}/${total} steps failed)`)
  }
  console.log('===================================')
  console.log('')
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
