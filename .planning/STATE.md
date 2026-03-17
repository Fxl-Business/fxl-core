---
gsd_state_version: 1.0
milestone: v4.1
milestone_name: Super Admin
status: defining_requirements
stopped_at: null
last_updated: "2026-03-17T04:00:00Z"
last_activity: 2026-03-17 — Milestone v4.1 started
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

**Core value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Current focus:** v4.1 Super Admin — painel global de administracao

## Current Position

Milestone: v4.1 of v4.3 (Super Admin)
Status: Defining requirements
Last activity: 2026-03-17 — Milestone v4.1 started

## Platform Evolution Plan (v4.0-v4.3)

v4.0: Rebrand Nexo — COMPLETE
v4.1: Super Admin (painel global, roles, MCP) ← CURRENT
v4.2: Docs do Sistema (product docs vs enterprise docs)
v4.3: Tenant Onboarding (fluxo real, migrar org_fxl_default)

Design spec: docs/superpowers/specs/2026-03-17-nexo-platform-evolution-design.md

## Accumulated Context

### Decisions

- Product renamed to "Nexo" (v4.0)
- FXL SDK keeps "FXL" name (company name, not product)
- Super admin = single user (Cauet) with Clerk publicMetadata.super_admin = true
- RLS bypass: super_admin JWT claim check in policies (no service-role key)
- Spokes have independent auth (API key, not shared Clerk)
- Docs separation: scope column (tenant vs product) on documents table
- MCP integrations (Supabase + Clerk) for super admin ops via Claude Code
- Module management moves from localStorage to Supabase tenant_modules

### Pending Todos

None.

### Blockers/Concerns

- Verify Clerk pricing for Organizations (free tier supports 5 orgs)
- tenant_modules migration needs to be applied (make migrate)

## Session Continuity

Last session: 2026-03-17T04:00:00Z
Stopped at: Starting v4.1 Super Admin
Next: Define requirements, create roadmap, execute with parallel agents
