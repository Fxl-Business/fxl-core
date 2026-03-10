---
phase: 10
slug: briefing-blueprint-views
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.0.18 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run --reporter=verbose && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | BRFG-01 | unit | `npx vitest run tools/wireframe-builder/lib/briefing-store.test.ts` | Wave 0 | pending |
| 10-01-02 | 01 | 1 | BRFG-01 | unit | `npx vitest run tools/wireframe-builder/lib/briefing-schema.test.ts` | Wave 0 | pending |
| 10-02-01 | 02 | 2 | BRFG-02 | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-text.test.ts` | Wave 0 | pending |
| 10-02-02 | 02 | 2 | BRFG-03 | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-export.test.ts` | Wave 0 | pending |
| 10-03-01 | 03 | 2 | BRFG-04 | unit | Existing token tests cover CRUD | Existing | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `tools/wireframe-builder/lib/briefing-store.test.ts` — briefing CRUD stubs (load/save/upsert)
- [ ] `tools/wireframe-builder/lib/briefing-schema.test.ts` — Zod schema validation stubs
- [ ] `tools/wireframe-builder/lib/blueprint-text.test.ts` — section extraction logic stubs
- [ ] `tools/wireframe-builder/lib/blueprint-export.test.ts` — markdown generation stubs

*Existing infrastructure covers test framework and token CRUD tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Briefing form renders correctly with all field types | BRFG-01 | Visual correctness | Open briefing form, fill all sections, verify layout |
| Blueprint text view shows hierarchical outline | BRFG-02 | Visual hierarchy | Open blueprint text view, verify collapsible tree structure |
| Share modal shows tokens and copy works | BRFG-04 | Clipboard + modal interaction | Click share button in AdminToolbar, verify modal content |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
