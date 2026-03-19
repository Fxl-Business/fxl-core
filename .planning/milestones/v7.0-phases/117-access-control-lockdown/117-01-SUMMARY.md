---
phase: 117-access-control-lockdown
plan: "01"
subsystem: platform-auth
tags: [auth, access-control, clerk, holding-screen]
dependency_graph:
  requires: []
  provides: [SolicitarAcesso page component]
  affects: [AppRouter — ready to import and route to /solicitar-acesso]
tech_stack:
  added: []
  patterns: [Clerk useClerk signOut, shadcn Card, react-router-dom useNavigate]
key_files:
  created:
    - src/platform/pages/SolicitarAcesso.tsx
  modified: []
decisions:
  - Used Building2 lucide icon for visual context — muted, non-alarming style
  - navigate('/login') after signOut for explicit redirect control
metrics:
  duration: "40s"
  completed_date: "2026-03-19"
  tasks_completed: 1
  files_changed: 1
---

# Phase 117 Plan 01: SolicitarAcesso Holding Screen Summary

**One-liner:** Branded Portuguese holding screen using `useClerk().signOut()` for users with no org membership — no form, no submission.

## What Was Built

Created `src/platform/pages/SolicitarAcesso.tsx` — a minimal centered auth-page-style component that:

- Replicates the Login.tsx Nexo branding block (h1 "Nexo" + subtitle)
- Shows a `Building2` icon and a welcoming Portuguese message explaining the user needs admin approval to join an organization
- Has a single "Sair da conta" button that calls `useClerk().signOut()` then navigates to `/login`
- Contains zero form elements, inputs, or submission mechanisms

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create SolicitarAcesso page | `2d3bd06` | src/platform/pages/SolicitarAcesso.tsx |

## Verification

- `npx tsc --noEmit` — 0 errors
- No `<form>`, `<input>`, `createOrganization`, `useOrganizationList` in file
- `signOut` present (2 occurrences), `useClerk` present, `Nexo` branding present
- Portuguese message with "organização", "administrador", "solicite" present

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/platform/pages/SolicitarAcesso.tsx` — EXISTS
- Commit `2d3bd06` — EXISTS
