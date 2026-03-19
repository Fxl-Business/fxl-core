---
phase: 121-auth-token-exchange
plan: 01
subsystem: auth
tags: [vitest, jsdom, react-hooks, token-exchange, race-condition]

requires: []
provides:
  - "Vitest path aliases @platform, @shared, @modules for platform unit tests"
  - "jsdom test environment + test-setup.ts with jest-dom"
  - "Race-condition-free org token exchange (isReady=false during exchange)"
affects: [121-03, 122, 123]

tech-stack:
  added: []
  patterns:
    - "Invalidate-before-fetch: reset state synchronously before async work"

key-files:
  created:
    - src/test-setup.ts
  modified:
    - vitest.config.ts
    - src/platform/tenants/useOrgTokenExchange.ts

key-decisions:
  - "Reset isReady+token at top of doExchange before any await — closes query window immediately"
  - "Remove duplicate null-sets from catch block since they are now at function top"

patterns-established:
  - "Invalidate-before-fetch: when switching context (org, user), set ready=false and clear token synchronously before starting async exchange"

requirements-completed: [AUTH-03]

duration: 5min
completed: 2026-03-19
---

# Plan 121-01: Fix Token Exchange Race Condition + Vitest Aliases Summary

**Eliminated stale-token query window on org switch and unblocked platform unit tests with @platform/@shared/@modules vitest aliases**

## Performance

- **Duration:** 5 min
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Fixed race condition where isReady stayed true during org switch, allowing queries with wrong org's token
- Added @platform, @shared, @modules path aliases to vitest.config.ts
- Switched test environment from node to jsdom for React hook testing
- Created test-setup.ts with @testing-library/jest-dom import

## Task Commits

1. **Task 1+2: Vitest aliases + race condition fix** - `6ce1056` (fix)

## Files Created/Modified
- `vitest.config.ts` - Added 3 path aliases, switched to jsdom, added setupFiles
- `src/test-setup.ts` - Jest-dom import for testing library matchers
- `src/platform/tenants/useOrgTokenExchange.ts` - Reset isReady=false and token=null at start of doExchange

## Decisions Made
- Combined both tasks into a single commit since they are part of the same plan
- Kept initial useState(() => getOrgAccessToken() !== null) for SPA navigation case

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## Next Phase Readiness
- Vitest is ready for platform unit tests (Plan 121-03)
- Token exchange is race-condition-free for org switching

---
*Phase: 121-auth-token-exchange*
*Completed: 2026-03-19*
