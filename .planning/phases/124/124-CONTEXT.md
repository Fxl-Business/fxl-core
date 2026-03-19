# Phase 124: Regression Guard - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Smoke test end-to-end validating the critical multi-tenant flow: login (JWT) -> org active -> sidebar docs visible -> org switch -> sidebar updates with new org docs. The test must detect regressions in the token-exchange -> RLS chain before they reach users. No browser tests (explicitly out of scope per REQUIREMENTS.md). No new features — only test infrastructure.

</domain>

<decisions>
## Implementation Decisions

### Test execution model
- Standalone Node.js script (`scripts/smoke-test.ts`) run via `npx tsx --env-file .env.local`
- NOT a Vitest test — this makes real network calls to Supabase, not unit testing
- Single entry point: `make smoke-test`
- Exit code 0 = all pass, exit code 1 = any failure

### JWT approach
- Mint Supabase-compatible JWTs locally using `node:crypto` (HS256)
- Use the same `JWT_SIGNING_SECRET` as the `auth-token-exchange` edge function
- No Clerk SDK dependency — pure JWT minting bypasses auth to test RLS directly
- Payload: `{ sub, org_id, role: 'authenticated', aud: 'authenticated', iss: 'supabase' }`

### Failure reporting
- Step-by-step labeled output: `PASS [step name]` or `FAIL [step name]: reason`
- 7 sequential steps covering the full flow
- Summary footer: `PASSED (7/7 steps)` or `FAILED (N/7 steps failed)`
- Missing env vars cause immediate exit with explicit variable name in error

### Test sequence (7 steps)
1. Env vars present (fail fast if any missing)
2. auth-token-exchange edge function deployed (health check — expect 401 for bad token)
3. Org A JWT minted (format validation)
4. Org B JWT minted (format validation)
5. Org A sees its documents (count > 0)
6. Org B sees no documents — isolation (count === 0)
7. RLS isolation confirmed (cross-check: orgA count != orgB count)

### Environment configuration
- 4 new env vars: `JWT_SIGNING_SECRET`, `SMOKE_TEST_USER_ID`, `SMOKE_TEST_ORG_A`, `SMOKE_TEST_ORG_B`
- Reuses existing: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_FUNCTIONS_URL`
- Documented in `.env.local.example`
- No new npm dependencies (node:crypto built-in, @supabase/supabase-js already installed)

### Claude's Discretion
- Exact console output formatting (colors, spacing)
- Whether to add timing per step
- Error message wording details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Multi-tenant architecture
- `.planning/REQUIREMENTS.md` — TEST-04 requirement definition, out-of-scope items (no Playwright/Cypress)
- `.planning/ROADMAP.md` §Phase 124 — Success criteria and dependency on Phase 123

### Token exchange pattern
- `src/platform/tenants/token-exchange.ts` — Client-side exchange service (JWT payload structure, edge function URL)
- `supabase/functions/auth-token-exchange/index.ts` — Edge function that mints JWTs (HS256 algorithm, signing secret)

### Existing test infrastructure
- `vitest.config.ts` — Vitest config with path aliases (smoke test is standalone, not Vitest)
- `Makefile` — Existing targets (add `smoke-test` alongside `check-functions`)
- `src/platform/tenants/token-exchange.test.ts` — Unit test patterns for token exchange

### RLS policies
- `src/modules/docs/services/__tests__/docs-rls.test.ts` — Integration test pattern for RLS isolation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@supabase/supabase-js` createClient: Already in deps, used for querying documents with custom JWT injection
- `node:crypto` createHmac: Built-in Node.js, no install needed for HS256 JWT minting
- `scripts/check-edge-functions.ts`: Existing script pattern for edge function health checks (run via `npx tsx --env-file`)

### Established Patterns
- Makefile targets use `npx tsx --env-file .env.local scripts/*.ts` pattern
- Token exchange uses `fetch()` to POST to `${FUNCTIONS_URL}/auth-token-exchange`
- JWT payload follows Supabase convention: `sub`, `org_id`, `role`, `aud`, `iss`, `iat`, `exp`
- Supabase client creation with custom fetch for header injection (Authorization + apikey)

### Integration Points
- `Makefile` — New `smoke-test` target after `check-functions`
- `.env.local.example` — Document 4 new vars
- `scripts/` directory — New `smoke-test.ts` file

</code_context>

<specifics>
## Specific Ideas

- Health check sends an intentionally bad token to auth-token-exchange; a 401 proves the function is deployed (not a CORS error which means undeployed — Pitfall #10)
- Fresh Supabase client per org query — no shared singleton state between org A and org B checks
- Known data: org_3B54c87bk has 91 docs (17 product + 74 tenant), org_3B3Sko has 0 docs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 124-regression-guard*
*Context gathered: 2026-03-19*
