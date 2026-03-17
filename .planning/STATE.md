---
gsd_state_version: 1.0
milestone: v3.2
milestone_name: FXL SDK Skill
status: completed
stopped_at: Completed v3.2 FXL SDK Skill (2 phases, 23 files created)
last_updated: "2026-03-17T01:44:00Z"
last_activity: 2026-03-17 — v3.2 FXL SDK Skill COMPLETE (2 phases, all skill files created)
progress:
  total_phases: 2
  completed_phases: 2
  total_plans: 2
  completed_plans: 2
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-16)

**Core value:** FXL Core e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Current focus:** v3.2 FXL SDK Skill — COMPLETE

## Current Position

Milestone: v3.2 of v3.5 (FXL SDK Skill)
Status: Complete
Last activity: 2026-03-17 — v3.2 FXL SDK Skill complete (SKILL.md, 8 rules, contract types, 8 templates, 5 checklists)

Progress: [==========] 100%

## Multi-Milestone Plan (v3.1-v3.5)

Wave 0: v3.0 archived
Wave 1: v3.1 (multi-tenancy) COMPLETE + v3.2 (SDK skill) COMPLETE
Wave 2: v3.3 (connector) + v3.4 (Beach House) — depend on v3.2
Wave 3: v3.5 (integration) — depends on v3.3 + v3.4

Design spec: docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md

## v3.2 Phases (68-69)

| Phase | Goal | Depends on | Requirements |
|-------|------|------------|--------------|
| 68 | SDK core structure (SKILL.md, rules, contract) | Nothing | SDK-01..10 |
| 69 | Templates + checklists | Phase 68 | SDK-11..15 |

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

Last session: 2026-03-17T01:44:00Z
Stopped at: Completed v3.2 FXL SDK Skill
Next: `/gsd:new-milestone` for v3.3 (connector module) or v3.4 (Beach House migration) — see design spec Section 9 for dependency graph
