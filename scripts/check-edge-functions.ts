/**
 * check-edge-functions.ts
 *
 * Verifies that critical Supabase Edge Functions are deployed with the correct
 * configuration. Run before deploying or after any edge function change.
 *
 * Usage:
 *   npx tsx --env-file .env.local scripts/check-edge-functions.ts
 *
 * Required env vars:
 *   SUPABASE_PROJECT_REF     — Supabase project reference (e.g., "abcdefghijklmnop")
 *   SUPABASE_ACCESS_TOKEN    — Supabase personal access token (from supabase.com/dashboard/account/tokens)
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 */

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!PROJECT_REF || !ACCESS_TOKEN) {
  console.error(
    '✗ Missing required env vars: SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN\n' +
    '  Add SUPABASE_ACCESS_TOKEN to .env.local (get it from supabase.com/dashboard/account/tokens)',
  )
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Rules: functions that MUST have verify_jwt disabled (they handle auth internally)
// ---------------------------------------------------------------------------

const REQUIRED_NO_VERIFY_JWT = [
  'admin-tenants',
  'admin-users',
]

// ---------------------------------------------------------------------------
// Fetch deployed function list from Supabase Management API
// ---------------------------------------------------------------------------

interface EdgeFunction {
  slug: string
  verify_jwt: boolean
  status: string
  version: number
}

async function fetchFunctions(): Promise<EdgeFunction[]> {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions`,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase API error ${res.status}: ${body}`)
  }

  return res.json() as Promise<EdgeFunction[]>
}

// ---------------------------------------------------------------------------
// Main check
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Checking edge functions for project: ${PROJECT_REF}\n`)

  let functions: EdgeFunction[]
  try {
    functions = await fetchFunctions()
  } catch (err) {
    console.error(`✗ Failed to fetch functions: ${err}`)
    process.exit(1)
  }

  const bySlug = new Map(functions.map((f) => [f.slug, f]))

  let failures = 0

  for (const slug of REQUIRED_NO_VERIFY_JWT) {
    const fn = bySlug.get(slug)

    if (!fn) {
      console.error(`✗ ${slug}: NOT DEPLOYED`)
      failures++
      continue
    }

    if (fn.verify_jwt !== false) {
      console.error(
        `✗ ${slug}: verify_jwt is TRUE — will reject Clerk JWTs with 401 Invalid JWT\n` +
        `  Fix: redeploy with verify_jwt=false (mcp__supabase__deploy_edge_function or supabase functions deploy --no-verify-jwt ${slug})`,
      )
      failures++
    } else {
      console.log(`✓ ${slug}: v${fn.version}, verify_jwt=false, status=${fn.status}`)
    }
  }

  console.log()

  if (failures > 0) {
    console.error(`${failures} check(s) failed.`)
    process.exit(1)
  }

  console.log('All edge function checks passed.')
}

main()
