---
phase: 135-capture-layer
plan: A
subsystem: audit
tags: [supabase, sentry, typescript, impersonation, audit-logs]

# Dependency graph
requires:
  - phase: 134-schema-foundation
    provides: audit_logs table with INSERT+SELECT RLS and append-only policy
provides:
  - logAuditEvent() exported async function in audit-service.ts
  - setAuditImpersonatorId() module-level setter for impersonation tagging
  - AuditEventPayload, AuditLogRow, AuditActorType, AuditAction, AuditResourceType types
  - ImpersonationContext wired to auto-tag audit logs during impersonation sessions
affects:
  - 136-edge-function-instrumentation
  - 137-query-api
  - 138-admin-ui-retention

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "module-level setter pattern for React-context-independent service state (same as _setTokenGetter in supabase.ts)"
    - "never-throw service function: entire body in try/catch, errors reported to Sentry"
    - "impersonation metadata injection: impersonator_id added to metadata only when _impersonatorId !== null"

key-files:
  created:
    - src/platform/types/audit.ts
    - src/platform/services/audit-service.ts
  modified:
    - src/platform/auth/ImpersonationContext.tsx

key-decisions:
  - "Empty metadata (no caller data, no impersonation) stored as null not {} to avoid empty JSONB"
  - "Impersonation check uses !== null (not falsy) to handle edge case of string '0' as a valid Clerk user ID"
  - "setAuditImpersonatorId called after setIsImpersonating(true) succeeds — only tag if impersonation fully established"

patterns-established:
  - "Never-throw pattern: async function with entire body in single try/catch, Sentry.captureException in both error-response and catch paths"
  - "Module-level context injection: module-level mutable + exported setter, bypasses React hook constraint for services"

requirements-completed: [CAPT-01, CAPT-04]

# Metrics
duration: 8min
completed: 2026-03-20
---

# Phase 135 Plan A: Audit Event Capture Service Summary

**logAuditEvent() service with never-throw guarantee, Sentry error reporting, and automatic impersonation session tagging via module-level setter pattern**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-20T03:30:00Z
- **Completed:** 2026-03-20T03:38:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created fully typed audit event interfaces (AuditEventPayload, AuditLogRow, AuditActorType, AuditAction, AuditResourceType)
- Implemented logAuditEvent() with never-throw guarantee — entire body in try/catch, two Sentry capture paths
- Wired ImpersonationContext to call setAuditImpersonatorId on enter/exit, enabling automatic tagging without hook coupling

## Task Commits

Each task was committed atomically:

1. **Task 1: Create audit types** - `c520834` (feat)
2. **Task 2: Create audit-service.ts with logAuditEvent()** - `f2406e4` (feat)
3. **Task 3: Wire impersonation context to audit service** - `c260a0f` (feat)

## Files Created/Modified

- `src/platform/types/audit.ts` — AuditActorType, AuditAction, AuditResourceType, AuditEventPayload, AuditLogRow
- `src/platform/services/audit-service.ts` — logAuditEvent(), setAuditImpersonatorId(), module-level _impersonatorId state
- `src/platform/auth/ImpersonationContext.tsx` — imports setAuditImpersonatorId, calls on enter/exit impersonation

## Decisions Made

- Empty metadata stored as null (not {}) to avoid noisy empty JSONB objects in the audit_logs table
- Used `!== null` check (not falsy) for `_impersonatorId` to correctly handle Clerk user ID edge cases
- Placed `setAuditImpersonatorId(session.user.id)` after all state updates in `enterImpersonation` success path to ensure impersonation is fully established before tagging

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 136 (Edge Function Instrumentation) can now import `logAuditEvent()` from `@platform/services/audit-service`
- Function signature: `logAuditEvent(payload: AuditEventPayload): Promise<void>` — callers do not need try/catch
- Types available at `@platform/types/audit` for constructing payloads

---
*Phase: 135-capture-layer*
*Completed: 2026-03-20*
