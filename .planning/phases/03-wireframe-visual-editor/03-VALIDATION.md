---
phase: 3
slug: wireframe-visual-editor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test infrastructure exists in this project |
| **Config file** | none |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | WEDT-04 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-01-02 | 01 | 1 | WEDT-04 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-02-01 | 02 | 2 | WEDT-01 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-02-02 | 02 | 2 | WEDT-01 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-03-01 | 03 | 2 | WEDT-02, WEDT-03 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 03-03-02 | 03 | 2 | WEDT-02, WEDT-03 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. TypeScript strict compilation (`npx tsc --noEmit`) is the acceptance criterion per CLAUDE.md.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag sections to reorder | WEDT-01 | Interactive UI drag behavior requires browser | Open editor, drag a section, verify new order persists |
| Add/remove sections via UI | WEDT-01 | Interactive UI button clicks | Click "+", pick section type, verify it appears; click trash, confirm, verify removal |
| Edit component props via panel | WEDT-02 | Form interaction requires browser | Click component, modify title in side panel, verify live update |
| Add/delete screens via sidebar | WEDT-03 | Interactive sidebar controls | Click "+", fill screen form, verify new screen; click "...", delete, verify removal |
| Edits sync to Supabase | WEDT-04 | Requires running Supabase + browser | Make edit, click save, verify Supabase row updated via dashboard |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
