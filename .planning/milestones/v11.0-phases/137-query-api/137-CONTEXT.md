# Phase 137: Query API - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a secure, typed audit-logs query edge function with super_admin-only access, pagination (limit/offset, max 100), and filters (org_id, actor_id, action, resource_type). Add a queryAuditLogs() function to audit-service.ts for frontend consumption.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- supabase/functions/_shared/audit.ts — shared audit helper (Phase 136)
- src/platform/services/audit-service.ts — logAuditEvent() already exists (Phase 135)
- src/platform/types/audit.ts — AuditLogRow, AuditAction, AuditResourceType types
- Existing RLS patterns with super_admin bypass (migration 009, 025)

### Established Patterns
- Edge functions use query params (not sub-paths per CLAUDE.md)
- Supabase client for DB queries with typed responses
- No `any` in TypeScript (strict mode)

### Integration Points
- audit_logs table (Phase 134) — SELECT source
- audit-service.ts — add queryAuditLogs() alongside existing logAuditEvent()
- Phase 138 Admin UI — will consume queryAuditLogs()

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
