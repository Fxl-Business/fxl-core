---
gsd_state_version: 1.0
milestone: null
milestone_name: null
status: between_milestones
stopped_at: Completed v3.3, ready for v3.4
last_updated: "2026-03-17T02:15:00Z"
last_activity: 2026-03-17 — v3.3 archived, proceeding to v3.4+v3.5
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-17)

**Core value:** FXL Core e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Current focus:** v3.4 Beach House Migration + v3.5 Integracao Beach House ↔ Hub

## Current Position

Milestone: Between v3.3 and v3.4
Status: Archival complete, starting next milestones
Last activity: 2026-03-17 — v3.3 archived

## Multi-Milestone Plan (v3.1-v3.5)

Wave 0: v3.0 archived
Wave 1: v3.1 (multi-tenancy) COMPLETE + v3.2 (SDK skill) COMPLETE
Wave 2: v3.3 (connector) COMPLETE + v3.4 (Beach House) NEXT
Wave 3: v3.5 (integration) — depends on v3.3 + v3.4

Design spec: docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md

## Accumulated Context

### Decisions

- Modular monolith chosen over workspace packages/polyrepo
- FXL SDK as Claude Code skill (not npm package)
- Clerk Organizations for multi-tenancy
- Knowledge Base module removed (v3.0)
- v3.0 reorganization complete — all modules in src/modules/, platform in src/platform/
- @platform/*, @shared/*, @modules/* convenience aliases active
- Edge Function JWT bridge chosen over direct JWT template (validation + logging)
- VITE_AUTH_MODE=anon|org flag for backward-compatible dev/staging
- org_id default 'org_fxl_default' for existing data backfill
- [Phase 64]: COALESCE-based RLS pattern for anon fallback
- [Phase 65]: Supabase org client uses custom fetch wrapper with mutable token ref
- [Phase 66]: Opt-out model for tenant_modules: modules not in table are enabled by default
- [Phase 68]: Contract v1 limited to 4 field types (string, number, date, boolean)
- [Phase 68]: Contract v1 is read-only (GET only, no mutations)
- [Phase 68]: Types copied to spoke projects, not imported from package
- [Phase 70]: Contract types copied inline (SDK skill outside TS compilation scope)
- [Phase 70]: ConnectorResult<T> uses ok/error discriminated union pattern
- [Phase 70]: Manifest cache: 1min TTL in-memory Map
- [Phase 70]: useConnectorList hardcoded for v3.3 (Supabase in v3.5)
- [Phase 71]: ConnectorHomeWidget follows RecentTasksWidget self-contained pattern

### Pending Todos

None.

### Blockers/Concerns

- Verify Clerk pricing for Organizations (free tier supports 5 orgs)

## Session Continuity

Last session: 2026-03-17T02:15:00Z
Stopped at: v3.3 archived, starting v3.4+v3.5
Next: Create v3.4 milestone (Beach House Migration) then v3.5 (Integration)
