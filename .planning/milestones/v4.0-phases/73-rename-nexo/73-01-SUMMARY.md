---
phase: 73-rename-nexo
plan: 01
subsystem: branding
tags: [rename, branding, ui, docs, meta]
key-files:
  - src/platform/auth/Login.tsx
  - src/platform/layout/TopNav.tsx
  - src/platform/pages/Home.tsx
  - src/platform/router/AppRouter.tsx
  - index.html
  - CLAUDE.md
  - .planning/PROJECT.md
  - docs/processo/fases/fase2.md
  - docs/processo/spoke-onboarding.md
  - docs/ferramentas/branding-collection.md
metrics:
  files_changed: 10
  occurrences_replaced: 17
  typescript_errors: 0
---

## One-liner

Replaced all user-visible occurrences of "Nucleo FXL" / "FXL Core" with "Nexo" across src/, index.html, CLAUDE.md, and docs/.

## What was built

Pure string replacement across 10 files, zero functional changes:

| Scope | Files | Replacements |
|-------|-------|-------------|
| UI components | Login.tsx, TopNav.tsx, Home.tsx, AppRouter.tsx | 5 |
| Meta | index.html | 1 |
| Config | CLAUDE.md | 3 |
| Planning | .planning/PROJECT.md | 3 |
| Docs | fase2.md, spoke-onboarding.md, branding-collection.md | 5 |

"FXL SDK", standalone "FXL" (company name), repo path `fxl-core`, and `docs/superpowers/specs/` historical design spec files were left untouched.

## Deviations

- `.planning/PROJECT.md` line 13 retains `"FXL Core" / "Nucleo FXL"` — this is the milestone goal statement ("Rename FXL Core / Nucleo FXL to Nexo") and is intentionally kept as historical planning context.
- `package.json "name": "fxl-core"` unchanged — CONTEXT.md decision: GitHub repo name stays `fxl-core`.

## Commits

- `15cad00` — app: rename FXL Core / Nucleo FXL to Nexo across UI, meta, and docs (Phase 73)
