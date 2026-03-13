---
phase: 46-sync-cli
plan: 02
subsystem: infra
tags: [supabase, cli, sync, upsert]

requires:
  - phase: 45-dynamic-rendering
    provides: documents table populated and app reading from it
provides:
  - sync-up CLI script reading docs/ and upserting into Supabase
  - make sync-up Makefile target
affects: []

tech-stack:
  added: []
  patterns: [filesystem-to-DB upsert with slug conflict key]

key-files:
  created:
    - tools/sync/sync-up.ts
  modified:
    - Makefile

key-decisions:
  - "Upsert with onConflict: slug for idempotent operation"
  - "Does NOT include sort_order in upsert (preserves DB ordering)"
  - "One-at-a-time upsert for clear error reporting per document"

patterns-established:
  - "slug as conflict key for idempotent upserts"

requirements-completed: [SYNC-02, SYNC-03]

duration: 5min
completed: 2026-03-13
---

# Phase 46-02: sync-up Summary

**CLI script reading 62 .md files from docs/ and upserting into Supabase with slug conflict key**

## Performance

- **Duration:** 5 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created sync-up.ts reading all .md files from docs/ recursively
- Frontmatter extraction (title, badge, description) matches docs-parser pattern
- Upsert with onConflict: slug ensures no duplicates on repeated runs
- Custom tags preserved verbatim in body
- Added make sync-up Makefile target

## Task Commits

1. **Task 1+2: sync-up script + Makefile** - `a93031d` (infra)

## Files Created/Modified
- `tools/sync/sync-up.ts` - Filesystem-to-DB upsert script
- `Makefile` - Added sync-up target

## Decisions Made
- sort_order excluded from upsert to preserve manual DB ordering
- One-at-a-time upsert for clear per-document error messages

## Deviations from Plan
None

## Issues Encountered
None

---
*Phase: 46-sync-cli*
*Completed: 2026-03-13*
