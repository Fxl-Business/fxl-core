---
phase: 8
slug: wireframe-design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + manual visual verification |
| **Config file** | vitest.config.ts (existing) |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 8-01-01 | 01 | 1 | DSGN-01 | automated | `npx tsc --noEmit` (tokens compile, no hardcoded hex in wireframe components) | ❌ W0 | ⬜ pending |
| 8-01-02 | 01 | 1 | DSGN-02 | automated | `npx tsc --noEmit` (WireframeThemeProvider types check) | ❌ W0 | ⬜ pending |
| 8-02-01 | 02 | 2 | DSGN-01 | manual | Visual: wireframe renders with warm gray + gold palette | ❌ W0 | ⬜ pending |
| 8-02-02 | 02 | 2 | DSGN-03 | manual | Visual: toggle dark/light, all components respond | ❌ W0 | ⬜ pending |
| 8-03-01 | 03 | 3 | DSGN-04 | manual | Visual: branding overrides accent + sidebar, app shell unchanged | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] CSS file for --wf-* token definitions (created in Plan 01)
- [ ] WireframeThemeProvider component (created in Plan 01)

*Existing infrastructure (vitest, TypeScript strict, Tailwind CSS) covers base requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Warm gray + gold palette renders correctly | DSGN-01 | Visual color accuracy | Load wireframe viewer, compare card/border/text/accent colors against spec |
| Dark/light toggle switches all components | DSGN-03 | Requires running app + visual check | Click toggle in AdminToolbar, verify all cards/charts/tables/sidebar respond |
| Branding overrides accent without affecting app | DSGN-04 | Requires running app with client branding | Load branded client wireframe, verify sidebar + accent use brand colors, app shell unchanged |
| 10-step neutral scale visible | DSGN-01 | Visual distinction check | Verify canvas bg, card bg, borders, text levels all use distinct neutral steps |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
