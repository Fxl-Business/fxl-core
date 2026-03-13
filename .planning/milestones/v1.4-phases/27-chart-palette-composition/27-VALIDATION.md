---
phase: 27
slug: chart-palette-composition
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 27 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` (vitest config inline) |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green + visual gallery review
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 27-01-01 | 01 | 1 | CHRT-02 | lint | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 27-01-02 | 01 | 1 | CHRT-03 | lint | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 27-01-03 | 01 | 1 | CHRT-03 | manual | Visual inspection in gallery | N/A | ⬜ pending |
| 27-01-04 | 01 | 1 | CHRT-04 | manual | Visual interaction in gallery | N/A | ⬜ pending |
| 27-02-01 | 02 | 1 | CHRT-05 | lint | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 27-02-02 | 02 | 1 | CHRT-05 | manual | Visual inspection in gallery | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test setup needed.

- TypeScript gate (`npx tsc --noEmit`) is already configured
- Vitest is already installed and configured
- Visual validation via ComponentGallery is already available

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chart palette renders blue/indigo/slate tones | CHRT-01 | Visual color verification | Open ComponentGallery, inspect chart components — no gold/amber colors |
| Chart containers have rounded-xl + shadow-sm | CHRT-02 | Visual styling check | Inspect chart cards in gallery — corners should be more rounded with subtle shadow |
| Legend dots are rounded-full colored circles | CHRT-03 | Visual element check | Check StackedBar, StackedArea, Composed, Donut legends — all should show circle dots |
| Bar charts show opacity transition on hover | CHRT-04 | Interactive behavior | Hover over bar charts in gallery — bars should transition from muted to full opacity |
| CompositionBar renders with hover:brightness-90 | CHRT-05 | Interactive behavior | Hover over CompositionBar segments — should dim slightly on hover |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
