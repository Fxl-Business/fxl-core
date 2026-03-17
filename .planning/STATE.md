---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Rebrand Nexo
status: planning
stopped_at: Roadmap v4.0 criado — 2 phases (73-74), 13/13 requirements mapped
last_updated: "2026-03-17T15:28:08.466Z"
last_activity: 2026-03-17 — Roadmap v4.0 criado (2 phases, 13 requirements mapped)
progress:
  total_phases: 2
  completed_phases: 2
  total_plans: 2
  completed_plans: 2
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-17)

**Core value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Current focus:** v4.0 Rebrand Nexo — Phase 73: Rename Nexo

## Current Position

Milestone: v4.0 of v4.3 (Rebrand Nexo)
Phase: 73 of 74 (Rename Nexo)
Plan: 0 of 1 in current phase
Status: Ready to plan
Last activity: 2026-03-17 — Roadmap v4.0 criado (2 phases, 13 requirements mapped)

Progress: [░░░░░░░░░░] 0%

## Platform Evolution Plan (v4.0-v4.3)

v4.0: Rebrand Nexo (rename mecanico) <- CURRENT
v4.1: Super Admin (painel global, roles, MCP)
v4.2: Docs do Sistema (product docs vs enterprise docs)
v4.3: Tenant Onboarding (fluxo real, migrar org_fxl_default)

Design spec: docs/superpowers/specs/2026-03-17-nexo-platform-evolution-design.md

## Accumulated Context

### Decisions

- Product renamed from "FXL Core" / "Nucleo FXL" to "Nexo"
- FXL SDK keeps "FXL" name (company name, not product)
- Super admin = single user (Cauet) com Clerk publicMetadata.super_admin = true
- Spokes have independent auth (API key, not shared Clerk)
- Docs separation: scope column (tenant vs product) on documents table
- MCP integrations (Supabase + Clerk) for super admin ops via Claude Code

### Pending Todos

None.

### Blockers/Concerns

- Verify Clerk pricing for Organizations (free tier supports 5 orgs)
- tenant_modules migration needs to be applied (make migrate)

## Session Continuity

Last session: 2026-03-17T03:00:00Z
Stopped at: Roadmap v4.0 criado — 2 phases (73-74), 13/13 requirements mapped
Next: /gsd:plan-phase 73
