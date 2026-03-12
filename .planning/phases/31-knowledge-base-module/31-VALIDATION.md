---
phase: 31
slug: knowledge-base-module
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (or "none — Wave 0 installs") |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 31-01-01 | 01 | 1 | KB-02 | manual + tsc | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 31-01-02 | 01 | 1 | KB-03 | manual + tsc | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 31-02-01 | 02 | 1 | KB-04 | manual + tsc | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 31-02-02 | 02 | 1 | KB-05 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 31-03-01 | 03 | 2 | KB-06 | manual + tsc | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Vitest config — if no vitest.config.ts exists, create one
- [ ] Confirm Phase 30 service layer (`kb-service.ts`) exists and exports expected functions

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| KB list page renders with filters | KB-02 | Visual rendering + filter UX | Visit /knowledge-base, verify list renders, apply type/tag/client filters |
| KB detail page renders markdown | KB-03 | Visual markdown rendering | Click entry, verify markdown body + metadata display |
| Create/edit form saves to Supabase | KB-04 | Requires Supabase connection | Create entry via form, verify it appears in list |
| ADR template injection | KB-06 | Visual template rendering | Create Decision-type entry, verify template sections appear |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
