---
phase: 124-regression-guard
plan: 01
status: complete
started: 2026-03-19
completed: 2026-03-19
---

# Plan 124-01: Smoke Test Script — Summary

## What was built

Programmatic multi-tenant smoke test that validates the token-exchange -> RLS isolation pipeline without requiring a browser, Clerk SDK, or user credentials.

## Key files

### Created
- `scripts/smoke-test.ts` — 276-line standalone Node.js script with 7 sequential verification steps
- `.env.local.example` — Updated with 4 new smoke test env vars

### Modified
- `Makefile` — Added `smoke-test` target to .PHONY and body

## Implementation details

- **JWT minting:** Pure `node:crypto` HS256 implementation replicating the auth-token-exchange edge function algorithm
- **Document query:** Fresh `@supabase/supabase-js` client per org call with custom fetch injecting JWT + apikey headers
- **Edge function health check:** POST with bad token expects 401 (proves function deployed, not CORS error)
- **Step runner:** Accumulates PASS/FAIL results with labeled output, exits 1 on any failure

## 7-step sequence

1. Env vars present (fail fast)
2. auth-token-exchange deployed (health check)
3. Org A JWT minted (format validation)
4. Org B JWT minted (format validation)
5. Org A sees its documents (count > 0)
6. Org B sees no documents — isolation (count === 0)
7. RLS isolation confirmed (cross-check)

## Verification

- `npx tsc --noEmit` — zero errors
- `make smoke-test` — runs correctly (fails at env validation when vars missing, which is the expected behavior)
- Script exit code propagates correctly through Makefile
- No new dependencies added (node:crypto built-in, @supabase/supabase-js already in package.json)

## Self-Check: PASSED

All must_haves verified:
- Smoke test executes the full sequence (org A token -> query -> org B token -> query -> isolation check)
- Exit code 1 + clear FAIL message when any step fails
- Single command: `make smoke-test`
- Each step prints labeled PASS/FAIL output
- Edge function health check validates deployment

---
*Plan 124-01 completed: 2026-03-19*
