---
gsd_state_version: 1.0
milestone: v4.2
milestone_name: Docs do Sistema + Tenant Onboarding
status: executing
stopped_at: Completed 83-01-PLAN.md
last_updated: "2026-03-17T19:24:29.726Z"
last_activity: 2026-03-17 — Completed 81-01 (scope column on documents table, split RLS policies, TypeScript types)
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 2
  completed_plans: 2
  percent: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-17)

**Core value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Current focus:** Phase 81 — Docs Data Model (ready to plan)

## Current Position

Milestone: v4.2 Docs do Sistema + Tenant Onboarding
Phase: 81 of 84 (Docs Data Model)
Plan: 1 of 1 in current phase (COMPLETE)
Status: In progress
Last activity: 2026-03-17 — Completed 81-01 (scope column on documents table, split RLS policies, TypeScript types)

Progress: [█░░░░░░░░░░░░░░░░░░░] 5%

## Platform Evolution Plan (v4.0-v4.3)

v4.0: Rebrand Nexo — COMPLETE
v4.1: Super Admin — COMPLETE
v4.2: Docs do Sistema + Tenant Onboarding — IN PROGRESS

Design spec: docs/superpowers/specs/2026-03-17-nexo-platform-evolution-design.md

## Accumulated Context

### Decisions

- [81-01] scope='product' only bypasses org_id in SELECT policy — write policies require super_admin for product docs
- [81-01] In-memory cache unchanged; scope filtering happens client-side via getProductDocs/getTenantDocs
- [81-01] org_id added to DocumentRow type to align TypeScript with DB reality
- [Phase 83-01]: AuthOnlyRoute instead of Clerk SignedIn — SignedIn not exported by @clerk/react in this version
- [Phase 83-01]: isOrgMode() guard on SemModulos check preserves anon mode where all modules are enabled by default

### Pending Todos

None.

### Blockers/Concerns

Phase 82 depends on Phase 81 (scope column must exist before UI and migration).
Phase 84 depends on Phase 83 (real org must exist before data migration).
Phases 81-82 and 83-84 are independent tracks — safe to parallelize.

## Session Continuity

Last session: 2026-03-17T19:24:29.723Z
Stopped at: Completed 83-01-PLAN.md
Next: /gsd:execute-phase 82
Resume file: None
