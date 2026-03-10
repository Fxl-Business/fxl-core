---
phase: 9
slug: component-library-expansion
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (via vitest.config.ts) |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | COMP-01 | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "registry"` | Wave 0 | pending |
| 09-01-02 | 01 | 1 | COMP-01 | manual-only | Visual code review — no orphaned switch statements | N/A | pending |
| 09-02-01 | 02 | 1 | COMP-02 | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "settings-page"` | Wave 0 | pending |
| 09-02-02 | 02 | 1 | COMP-03 | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "form-section"` | Wave 0 | pending |
| 09-02-03 | 02 | 1 | COMP-04 | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "filter-config"` | Wave 0 | pending |
| 09-02-04 | 02 | 1 | COMP-05 | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "stat-card"` | Wave 0 | pending |
| 09-02-05 | 02 | 1 | COMP-06 | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "progress-bar"` | Wave 0 | pending |
| 09-02-06 | 02 | 1 | COMP-07 | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "divider"` | Wave 0 | pending |
| 09-03-01 | 03 | 2 | COMP-08 | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "chart"` | Wave 0 | pending |
| 09-04-01 | 04 | 2 | COMP-09 | smoke | `npx tsc --noEmit` (route types compile) | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `tools/wireframe-builder/lib/section-registry.test.ts` — stubs for COMP-01 through COMP-08 (validates every registry entry has matching Zod schema + defaultProps round-trip)
- [ ] shadcn components install: `npx shadcn@latest add switch progress card`

*Existing infrastructure covers test framework and TypeScript checking.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 7 dispatchers consume from registry (no orphaned switch) | COMP-01 | Architectural pattern — no automated way to verify switch removal | Grep for `switch.*section.type` in wireframe-builder; should only exist in registry |
| New blocks render visually correct with --wf-* tokens | COMP-02-07 | Visual correctness | Open wireframe viewer, add each new block type from picker, verify rendering |
| Generic viewer loads any client | COMP-09 | Route integration | Navigate to /clients/financeiro-conta-azul/wireframe and verify blueprint loads |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
