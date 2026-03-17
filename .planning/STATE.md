---
gsd_state_version: 1.0
milestone: v3.3
milestone_name: Generic Connector Module
status: in-progress
stopped_at: Starting v3.3 execution
last_updated: "2026-03-17T02:00:00Z"
last_activity: 2026-03-17 — Starting v3.3 Generic Connector Module
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: 3
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** FXL Core e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Current focus:** v3.3 Generic Connector Module

## Current Position

Milestone: v3.3 of v3.5 (Generic Connector Module)
Status: In Progress
Last activity: 2026-03-17 — Starting Phase 70

Progress: [..........] 0%

## Multi-Milestone Plan (v3.1-v3.5)

Wave 0: v3.0 archived
Wave 1: v3.1 (multi-tenancy) COMPLETE + v3.2 (SDK skill) COMPLETE
Wave 2: v3.3 (connector) IN PROGRESS + v3.4 (Beach House) — depend on v3.2
Wave 3: v3.5 (integration) — depends on v3.3 + v3.4

Design spec: docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md

## v3.3 Phases (70-72)

| Phase | Goal | Depends on | Requirements |
|-------|------|------------|--------------|
| 70 | Core connector infrastructure (types, service, hooks) | Nothing | CON-01..05 |
| 71 | Connector UI components (entities, widgets, router) | Phase 70 | CON-06..12 |
| 72 | Integration verification (tsc, build) | Phase 71 | CON-13 |

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
- [Phase 68]: Audit scoring uses weighted system (Critical=10, Important=5, Normal=2)
- [Phase 69]: fxl-doctor.sh runs 5 checks: tsc, eslint, prettier, security headers, contract version
- [Phase 69]: Templates use mustache-style placeholders for customization

### Pending Todos

None.

### Blockers/Concerns

- Verify Clerk pricing for Organizations (free tier supports 5 orgs)

## Session Continuity

Last session: 2026-03-17T02:00:00Z
Stopped at: Starting v3.3 Phase 70
Next: Execute Phase 70 (connector infrastructure)
