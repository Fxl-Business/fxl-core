---
phase: 16
slug: consistency-pass
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-10
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x (existing) |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green + visual inspection all pages light/dark
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | CONSIST-01, CONSIST-02, CONSIST-03 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 16-01-02 | 01 | 1 | CONSIST-04 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed for visual-only CSS class changes.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Home page typography scale and card styling | CONSIST-01 | Pure CSS class changes — visual output | Open Home page, verify 4xl title, slate+indigo cards, icon containers |
| Client page header consistency | CONSIST-02 | CSS class changes on page headers | Open client Index and DocViewer, verify matching doc page visual language |
| Login/Profile slate+indigo palette | CONSIST-03 | Clerk renders pre-built UI, only wrapper styling | Open Login and Profile, verify background and container styling |
| PromptBlock dark theme and Callout indigo | CONSIST-04 | CSS class changes on component containers | Open page with prompt blocks and callouts, verify indigo accents and dark prompt bg |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-10
