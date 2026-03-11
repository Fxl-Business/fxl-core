---
phase: 20
slug: chart-type-expansion
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run tools/wireframe-builder/lib/ --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tools/wireframe-builder/lib/ --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose` + `npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green (257+) + `npx tsc --noEmit`
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | CHART-01–06 | unit | `npx vitest run tools/wireframe-builder/lib/ --reporter=verbose` | ❌ Wave 0 | ⬜ pending |
| 20-02-01 | 02 | 2 | CHART-01, CHART-02, CHART-03, CHART-04, CHART-06 | unit + manual | `npx vitest run tools/wireframe-builder/lib/ --reporter=verbose` | ✅ (extend existing) | ⬜ pending |
| 20-03-01 | 03 | 2 | CHART-05 | unit + manual | `npx vitest run tools/wireframe-builder/lib/ --reporter=verbose` | ❌ Wave 0 | ⬜ pending |
| 20-04-01 | 04 | 3 | CHART-01–06 | manual | N/A — visual verification | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Two test updates needed before schema tests can pass:

- [ ] `tools/wireframe-builder/lib/blueprint-schema.test.ts` — add `describe('Phase 20 — new chartType values and gauge-chart section', ...)` block with tests for all 5 new chartType enum values + GaugeChartSectionSchema
- [ ] `tools/wireframe-builder/lib/section-registry.test.ts` — update `ALL_SECTION_TYPES` array to include `'gauge-chart'` and change `toHaveLength(21)` to `toHaveLength(22)`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| stacked-bar renders with stacked segments and correct axis | CHART-01 | Visual chart rendering | Open wireframe with `chartType: 'stacked-bar'`; confirm bars stack with colored segments |
| stacked-area renders with filled stacked areas | CHART-01 | Visual chart rendering | Open wireframe with `chartType: 'stacked-area'`; confirm areas stack |
| horizontal-bar renders with horizontal bars | CHART-01 | Visual chart rendering | Open wireframe with `chartType: 'horizontal-bar'`; confirm horizontal layout |
| bubble chart renders with scaled circles | CHART-02 | Visual chart rendering | Open wireframe with `chartType: 'bubble'`; confirm circles of varying sizes |
| gauge renders radial arc with needle and zones | CHART-05 | Visual chart rendering | Add `gauge-chart` section to blueprint; confirm radial arc + value indicator |
| composed chart renders mixed bar + line + area | CHART-06 | Visual chart rendering | Open wireframe with `chartType: 'composed'`; confirm mixed series |
| All charts use --wf-* tokens and chartColors | All | Visual token verification | Confirm charts match wireframe palette |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
