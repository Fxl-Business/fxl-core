# Phase 135: Capture Layer - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a fire-and-forget logAuditEvent() service function that inserts audit_logs rows without interrupting the caller, and automatically tags impersonation sessions in metadata.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- supabase/migrations/025_audit_logs.sql — table schema and column definitions
- supabase/migrations/026_audit_triggers.sql — trigger patterns for audit logging
- Existing Supabase client setup in src/

### Established Patterns
- Supabase edge functions for server-side operations
- TypeScript strict mode with no `any`
- Error reporting via Sentry

### Integration Points
- audit_logs table (Phase 134) — INSERT target
- Edge functions (Phase 136) — will consume logAuditEvent()
- Impersonation context — must detect and tag sessions

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
