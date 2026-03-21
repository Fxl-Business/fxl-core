# Phase 136: Edge Function Instrumentation - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Add logAuditEvent() calls to all critical admin edge functions (admin-tenants, admin-users) and auth event handlers to capture tenant CRUD, member management, user management, and sign-in events automatically.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- src/platform/services/audit-service.ts — logAuditEvent() and setAuditImpersonatorId()
- src/platform/types/audit.ts — AuditEventPayload, AuditAction, AuditResourceType types
- Existing edge functions in supabase/functions/

### Established Patterns
- Edge functions use Supabase client for DB operations
- logAuditEvent() is fire-and-forget (no try/catch needed at call site)
- CLAUDE.md: never use sub-paths in edge functions, use query params

### Integration Points
- admin-tenants edge function — tenant CRUD + member management
- admin-users edge function — user management
- Auth event handlers — sign-in capture with IP/user-agent

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase

</specifics>

<deferred>
## Deferred Ideas

None

</deferred>
