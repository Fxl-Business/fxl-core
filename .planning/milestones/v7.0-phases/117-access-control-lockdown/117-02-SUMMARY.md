---
phase: 117-access-control-lockdown
plan: "02"
subsystem: platform/auth
tags: [access-control, routing, auth, clerk]
dependency_graph:
  requires: [117-01]
  provides: [access-control-lockdown-complete]
  affects: [AppRouter, ProtectedRoute]
tech_stack:
  added: []
  patterns: [AuthOnlyRoute wrapper, Navigate redirect]
key_files:
  created: []
  modified:
    - src/platform/router/AppRouter.tsx
    - src/platform/auth/ProtectedRoute.tsx
  deleted:
    - src/platform/pages/CriarEmpresa.tsx
decisions:
  - "/solicitar-acesso uses the same AuthOnlyRoute wrapper pattern as the former /criar-empresa — no redirect loop possible"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-19"
  tasks_completed: 2
  files_changed: 3
---

# Phase 117 Plan 02: Router Wiring & CriarEmpresa Removal Summary

**One-liner:** Wired SolicitarAcesso into AppRouter at /solicitar-acesso, redirected ProtectedRoute no-org users there, and deleted CriarEmpresa.tsx with all createOrganization() call sites.

## What Was Done

- `AppRouter.tsx`: removed `CriarEmpresa` import and `/criar-empresa` route; added `SolicitarAcesso` import and `/solicitar-acesso` route under the same `AuthOnlyRoute` wrapper
- `ProtectedRoute.tsx`: changed no-org redirect from `/criar-empresa` to `/solicitar-acesso`; updated comment from "onboarding" to "request access"
- `CriarEmpresa.tsx`: deleted entirely — 131 lines removed

## Verification Results

- `grep -rn "CriarEmpresa|criar-empresa" src/` — zero matches
- `grep -rn "createOrganization" src/` — zero matches
- `grep -n "solicitar-acesso" src/platform/auth/ProtectedRoute.tsx` — 1 match
- `grep -n "solicitar-acesso" src/platform/router/AppRouter.tsx` — 2 matches (route path + comment)
- `npx tsc --noEmit` — zero errors

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 691aef1 | feat(117-02): swap /criar-empresa for /solicitar-acesso in AppRouter |
| 2 | 2538a5f | fix(117-02): redirect no-org users to /solicitar-acesso; delete CriarEmpresa |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/platform/router/AppRouter.tsx` — exists, no CriarEmpresa/criar-empresa references
- `src/platform/auth/ProtectedRoute.tsx` — exists, redirects to /solicitar-acesso
- `src/platform/pages/CriarEmpresa.tsx` — deleted (confirmed)
- Commits 691aef1 and 2538a5f — present in git log
