---
phase: 12
slug: design-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | FOUND-01 | manual-only | Visual: text renders in Inter | N/A | ⬜ pending |
| 12-01-02 | 01 | 1 | FOUND-02 | manual-only | Visual: code blocks render in JetBrains Mono | N/A | ⬜ pending |
| 12-01-03 | 01 | 1 | FOUND-03 | unit | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 12-01-04 | 01 | 1 | FOUND-04 | manual-only | Visual: scroll long page, verify slim scrollbar | N/A | ⬜ pending |
| 12-01-05 | 01 | 1 | FOUND-05 | manual-only | Open wireframe viewer, verify stone gray + gold | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

This phase is pure CSS/configuration changes. No new testable logic is introduced. The existing wireframe-theme.test.ts covers token isolation at the component level. The gate is `tsc --noEmit` (zero TypeScript errors) plus visual verification.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Inter font rendering | FOUND-01 | Font rendering is visual — letter spacing and weight rendering differ from system-ui | Open any page, inspect body text, verify Inter font in DevTools computed styles |
| JetBrains Mono rendering | FOUND-02 | Font rendering is visual — monospace ligatures and weight differ from system mono | Open a doc page with code blocks, inspect computed font-family |
| Scrollbar styling | FOUND-04 | CSS pseudo-element styling cannot be queried programmatically | Scroll any long page, verify 6px width and slate-200 color thumb |
| Wireframe token isolation | FOUND-05 | Visual verification of color preservation in complex rendered wireframe | Open /clients/financeiro-conta-azul/wireframe, verify stone gray + gold accent preserved |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
