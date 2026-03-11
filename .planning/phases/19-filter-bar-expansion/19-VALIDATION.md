---
phase: 19
slug: filter-bar-expansion
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green (251+) + `npx tsc --noEmit`
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | FILT-02, FILT-03, FILT-04, FILT-05, FILT-06 | unit + manual | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | ✅ | ⬜ pending |
| 19-02-01 | 02 | 1 | FILT-02, FILT-03, FILT-04, FILT-05, FILT-06 | manual | N/A — visual verification in browser | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all automated requirements. No new test files needed.

*Existing test file to extend:* `tools/wireframe-builder/lib/blueprint-schema.test.ts`

New test cases (Phase 19 describe block):
1. `FilterOptionSchema` accepts `filterType: 'date-range'` — FILT-02
2. `FilterOptionSchema` accepts `filterType: 'multi-select'` — FILT-03
3. `FilterOptionSchema` accepts `filterType: 'search'` — FILT-04
4. `FilterOptionSchema` accepts `filterType: 'toggle'` — FILT-06
5. Backward compat: `FilterOptionSchema` accepts no `filterType` (undefined) — regression guard

Note: Most schema tests for these filterType values already pass from Phase 17. The Phase 19 describe block adds an explicit grouped coverage test.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Date range picker renders calendar widget | FILT-02 | Visual UI widget | Open wireframe with `filterType: 'date-range'`; confirm calendar/date inputs appear |
| Multi-select dropdown renders checkbox list | FILT-03 | Visual UI widget | Open wireframe with `filterType: 'multi-select'`; confirm dropdown with checkboxes opens |
| Text search input renders | FILT-04 | Visual UI widget | Open wireframe with `filterType: 'search'`; confirm text input appears |
| Period presets appear in date range filter | FILT-05 | Visual — preset buttons | Confirm "Últimos 7 dias", "Último mês", "Este ano" buttons appear in date range filter |
| Boolean toggle switch renders | FILT-06 | Visual UI widget | Open wireframe with `filterType: 'toggle'`; confirm toggle switch appears |
| Existing filters without filterType still render | backward compat | Visual regression | Confirm existing `<select>` filters still render normally |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
