---
phase: 21
slug: gallery-reorganization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (vitest.config.ts) |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run` (270 tests must remain green)
- **Before `/gsd:verify-work`:** Full suite green + `npx tsc --noEmit` + visual checkpoint
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 1 | GAL-01, GAL-02 | compile | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 21-01-02 | 01 | 1 | GAL-01, GAL-02 | compile + visual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 21-02-01 | 02 | 2 | GAL-01, GAL-02 | manual | N/A — visual checkpoint | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — existing test infrastructure covers all phase requirements. No new test files needed.

ComponentGallery.tsx is a display component with no logic to unit-test. The registry tests already verify catalog completeness; the gallery itself is visual-only.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Gallery shows 6 thematic sections with headings | GAL-01 | Visual layout | Open /gallery; confirm Shell, Gráficos, Cards & Métricas, Tabelas, Inputs, Modais sections visible |
| All 6 Phase 20 chart types appear in gallery | GAL-02 | Visual | Scroll Gráficos section; confirm stacked-bar, stacked-area, horizontal-bar, bubble, gauge, composed previews present |
| Sidebar, header, filter bar appear in Shell section | GAL-01 | Visual | Confirm Shell section shows WireframeHeader, sidebar collapse preview, filter bar with all 5 filter types |
| No stale mock data errors | Regression | Visual | No red error boundaries or blank preview cards |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
