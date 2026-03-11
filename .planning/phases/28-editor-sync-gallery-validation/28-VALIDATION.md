---
phase: 28
slug: editor-sync-gallery-validation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 28 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + TypeScript strict |
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
| 28-01-01 | 01 | 1 | EDIT-01 | lint | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 28-02-01 | 02 | 1 | GAL-01 | lint | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 28-02-02 | 02 | 1 | GAL-02 | manual | Visual inspection in gallery | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

- TypeScript gate (`npx tsc --noEmit`) is already configured
- Vitest is already installed and configured
- Visual validation via ComponentGallery is already available

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ScreenManager sidebar matches WireframeSidebar dark design | EDIT-01 | Visual comparison | Open editor and wireframe sidebar side-by-side — dark background, typography, spacing should match |
| Gallery components render correctly in light and dark mode | GAL-01 | Visual inspection | Toggle dark mode in gallery — all 27 entries should render correctly in both themes |
| Client branding override (#1B6B93) applies correctly | GAL-02 | Visual inspection | Apply financeiro-conta-azul branding in gallery — verify primary color override renders correctly |
| Zero TypeScript errors across phases 22-28 | GAL-02 | Automated gate | Run `npx tsc --noEmit` — must report zero errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
