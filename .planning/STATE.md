---
gsd_state_version: 1.0
milestone: v11.0
milestone_name: Audit Logging
status: milestone_complete
stopped_at: v11.0 Audit Logging shipped 2026-03-21
last_updated: "2026-03-21T16:07:48.073Z"
last_activity: 2026-03-21
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 10
  completed_plans: 10
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-21)

**Core value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Current focus:** Planning next milestone

## Current Position

Milestone v11.0 Audit Logging — SHIPPED 2026-03-21
All 5 phases (134-138), 10 plans, 14 requirements complete.

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases total | 5 |
| Phases complete | 0 |
| Requirements total | 14 |
| Requirements mapped | 14 |
| Coverage | 100% |
| Phase 134 P02 | 15 | 1 tasks | 2 files |
| Phase 135 PA | 8 | 3 tasks | 3 files |
| Phase 136 P02 | 191 | 2 tasks | 5 files |
| Phase 136 P01 | 385 | 3 tasks | 5 files |
| Phase 137 P01 | 2 | 1 tasks | 1 files |
| Phase 137 P02 | 5 | 2 tasks | 2 files |
| Phase 138 P01 | 2 | 2 tasks | 3 files |
| Phase 138 P02 | 116 | 1 tasks | 1 files |
| Phase 138 P03 | 92 | 2 tasks | 2 files |

## Accumulated Context

### Decisions

- [134-01] Append-only RLS: no UPDATE/DELETE policies on audit_logs — denied by default when RLS enabled
- [134-01] SELECT policy uses exact super_admin bypass from migration 009 for consistency
- [134-01] actor_type + action constrained via CHECK at DB layer, not application layer
- [134-01] metadata is jsonb NOT NULL DEFAULT '{}' — avoids nullable JSONB queries
- [134-01] Migration history repaired: 9 remote-only timestamp migrations + 014-024 marked applied to unblock push
- [Phase 134]: Trigger SQL placed in migration 026 (separate from 025) because 025 was already applied to remote DB
- [Phase 134]: fn_audit_tenant_modules uses 'system' as actor_id — no user context in DB-level triggers for tenant_modules table
- [Phase 135-A]: Empty metadata stored as null not {} to avoid noisy empty JSONB in audit_logs
- [Phase 135-A]: Module-level setter pattern for ImpersonationContext coupling to audit service — bypasses React hook constraint
- [Phase 135-A]: impersonator_id check uses !== null (not falsy) to handle Clerk user ID edge case of string '0'
- [Phase 136-02]: audit-auth edge function always returns 200 to never block auth flow
- [Phase 136-02]: logAuthEvent() is void not async — callers cannot accidentally await it
- [Phase 136-02]: Google OAuth sign-in audit deferred — wrapping AuthenticateWithRedirectCallback deferred to future iteration (TODO CAPT-03)
- [Phase 136-01]: actor_type uses 'user' not super_admin — DB CHECK only allows user|system|trigger
- [Phase 136-01]: Impersonation action is 'impersonate' (not impersonate_start) to match DB CHECK constraint
- [137-01]: audit-logs uses --no-verify-jwt deploy flag: JWT validation done manually inside the function (super_admin claim check)
- [137-01]: Service role client bypasses RLS for audit-logs reads — super_admin JWT claim is the sole access gate
- [137-01]: limit clamped server-side with Math.min(Math.max(raw,1),100) — client cannot override max 100 rows per request
- [137-01]: GET-only endpoint; 405 returned for all other HTTP methods
- [Phase 137-02]: queryAuditLogs uses URLSearchParams to build query string — sub-paths avoided per CLAUDE.md (use query params)
- [Phase 137-02]: Response cast via Record<string, unknown> not any — typed casts with ?? fallback per CLAUDE.md rules
- [Phase 137-02]: queryAuditLogs DOES throw on error (unlike logAuditEvent) — UI consumers need error propagation for error states
- [Phase 138-03]: SECURITY DEFINER required for cleanup function — RLS denies DELETE on audit_logs
- [Phase 138-03]: Retention clamped 30-365 both server-side (SQL function) and client-side (SettingsPanel validation)
- [Phase 138-03]: pg_cron job runs daily at 03:00 UTC — off-peak for cleanup
- [Phase 138-03]: ON CONFLICT DO NOTHING for idempotent seed — safe to re-run migration
- [Phase 138-01]: Client-side filtering when multiple actions selected — API supports single action filter only
- [Phase 138-01]: selectedLog state declared but Sheet rendering deferred to plan 138-02
- [Phase 138-01]: Actor search triggers fetch on blur/Enter, not on every keystroke
- [Phase 138-02]: DiffView filters to only changed keys for cleaner presentation
- [Phase 138-02]: Metadata section excludes before/after keys to avoid duplication with DiffView
- [Phase 138-02]: CSV export uses native Blob API with URL.createObjectURL — no server endpoint needed

### Phase Notes

**Phase 134 — Schema Foundation**

- Migration 025 deployed: audit_logs table exists with 13 columns, INSERT+SELECT RLS only
- Migration history repaired: sequential (001-024) + timestamp migrations (20260318-20260319) both tracked
- RLS append-only confirmed: anon UPDATE returns 204 with 0 affected rows (row visible only to service role)
- Triggers for Phase 135: SECURITY DEFINER required to bypass RLS when writing to audit_logs
- Tables to trigger: tasks, tenant_modules (ADV-04 deferred v12: blueprint_configs, briefing_configs)

**Phase 135 — Capture Layer**

- logAuditEvent() must never throw — wrap entire body in try/catch, report to Sentry on failure
- ImpersonationContext already exists (v5.3) — read impersonator_id from it inside the service
- Service lives in src/modules/admin/services/audit-service.ts (write path)

**Phase 136 — Edge Function Instrumentation**

- admin-tenants and admin-users are existing edge functions — add logAuditEvent() calls after successful Clerk API calls
- Auth events (sign-in/sign-out) captured via Clerk webhooks or frontend hook — decide approach at plan time
- IP and user-agent come from the edge function request headers (not Clerk)

**Phase 137 — Query API**

- New edge function: supabase/functions/audit-logs/index.ts
- Must validate super_admin JWT claim before any query
- Max 100 rows per request (LIMIT enforced server-side)
- queryAuditLogs() lives in same audit-service.ts (read path, separate export)

**Phase 138 — Admin UI + Retention**

- Route: /admin/audit-logs (add to AdminSidebar)
- Sheet drawer (shadcn Sheet) for detail view — before/after diff only shown for UPDATE actions
- Export: native Blob API + URL.createObjectURL, no server-side endpoint needed
- Retention: platform_settings key audit_retention_days (default 90), pg_cron job calls DELETE WHERE created_at < NOW() - INTERVAL

### Pending Todos

None at this time.

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260320-oho | Fix 401 Unauthorized on admin edge functions (admin-users, admin-tenants) | 2026-03-20 | infra-only | [260320-oho-fix-401-unauthorized-on-admin-edge-funct](./quick/260320-oho-fix-401-unauthorized-on-admin-edge-funct/) |

## Session Continuity

To resume: read `.planning/PROJECT.md` for milestone goals, `.planning/ROADMAP.md` for phase details.
Next action: All Phase 138 plans complete — verify milestone completion
Last activity: 2026-03-21
Last session: 2026-03-20T12:47:41Z
Stopped at: Completed 138-02-PLAN.md
