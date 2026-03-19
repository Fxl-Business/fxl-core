---
phase: 121-auth-token-exchange
plan: 03
subsystem: testing
tags: [vitest, testing-library, react-hooks, unit-test, mock]

requires:
  - phase: 121-01
    provides: "Vitest path aliases @platform, @shared, @modules + jsdom environment"
provides:
  - "15 unit tests for auth/token exchange pipeline"
  - "Testing patterns for mocking Clerk hooks and Supabase client"
affects: [122, 123, 124]

tech-stack:
  added: []
  patterns:
    - "vi.mock for Clerk hooks, vi.stubGlobal for fetch, vi.stubEnv for import.meta.env"
    - "Dynamic import with vi.resetModules for module-level env vars"
    - "Deferred promise pattern for testing async race conditions in hooks"

key-files:
  created:
    - src/platform/tenants/token-exchange.test.ts
    - src/platform/tenants/useOrgTokenExchange.test.ts
    - src/platform/tenants/useActiveOrg.test.ts
  modified:
    - src/test-setup.ts

key-decisions:
  - "Use expect.extend(matchers) instead of import @testing-library/jest-dom — compatible with globals: false"
  - "Use dynamic import + vi.resetModules for testing module-level env var reads"
  - "Use deferred promise pattern to test race condition timing in org switch test"

patterns-established:
  - "Clerk mock pattern: vi.mock('@clerk/react', () => ({ useSession: vi.fn() }))"
  - "Module-level env testing: vi.stubEnv + vi.resetModules + dynamic import"
  - "Hook race condition test: deferred promise controls when async resolves"

requirements-completed: [TEST-01]

duration: 8min
completed: 2026-03-19
---

# Plan 121-03: Unit Tests for Auth/Token Exchange Summary

**15 unit tests covering token-exchange service, useOrgTokenExchange hook (including race condition fix), and useActiveOrg hook**

## Performance

- **Duration:** 8 min
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- 6 tests for token-exchange.ts (happy path, 401/400 errors, network errors, missing env)
- 6 tests for useOrgTokenExchange (happy path, failures, no session, no org, org switch race condition, onOrgChange callback)
- 3 tests for useActiveOrg (member validation, stale org detection, loading state)
- Fixed test-setup.ts to use vitest expect.extend instead of direct jest-dom import

## Task Commits

1. **Task 1+2: All test files** - `166610d` (test)

## Files Created/Modified
- `src/platform/tenants/token-exchange.test.ts` - 6 tests for HTTP service
- `src/platform/tenants/useOrgTokenExchange.test.ts` - 6 tests for token exchange hook
- `src/platform/tenants/useActiveOrg.test.ts` - 3 tests for active org hook
- `src/test-setup.ts` - Fixed jest-dom setup for globals: false

## Decisions Made
- Used expect.extend(matchers) pattern for jest-dom compatibility with vitest globals: false
- Used dynamic import with vi.resetModules for token-exchange tests (module-level env read)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed test-setup.ts jest-dom import**
- **Found during:** Task 1 (token-exchange tests)
- **Issue:** `import '@testing-library/jest-dom'` requires global expect (vitest globals: false)
- **Fix:** Changed to `expect.extend(matchers)` pattern
- **Verification:** All tests pass

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Essential fix for test setup. No scope creep.

## Issues Encountered
None

## Next Phase Readiness
- All auth unit tests passing — ready for edge function deployment verification (121-04)

---
*Phase: 121-auth-token-exchange*
*Completed: 2026-03-19*
