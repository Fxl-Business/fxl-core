---
phase: 13
slug: layout-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing) |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | LAYOUT-01 | manual-only | Visual: scroll long page, header stays visible with blur | N/A | ⬜ pending |
| 13-01-02 | 01 | 1 | LAYOUT-02 | manual-only | Visual: verify "Nucleo FXL" brand + "FXL-CORE" subtitle | N/A | ⬜ pending |
| 13-01-03 | 01 | 1 | LAYOUT-03 | manual-only | Visual: verify search bar with Cmd+K badge in header | N/A | ⬜ pending |
| 13-01-04 | 01 | 1 | LAYOUT-04 | manual-only | Visual: verify single scrollbar, no inner scroll containers | N/A | ⬜ pending |
| 13-01-05 | 01 | 1 | LAYOUT-05 | manual-only | Visual: navigate between pages, verify scroll resets | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed.

The phase gate is TypeScript compilation (`npx tsc --noEmit` must pass) plus visual verification of the 5 success criteria. Existing vitest tests must continue passing.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Header sticky with backdrop-blur | LAYOUT-01 | CSS position:sticky and backdrop-blur require browser rendering | Scroll a long doc page; header stays fixed with visible frosted glass effect |
| Brand name + subtitle in header | LAYOUT-02 | Text content verification in rendered header | Verify "Nucleo FXL" and "FXL-CORE" visible in header |
| Search bar with Cmd+K badge | LAYOUT-03 | Visual + keyboard interaction | Verify search input in header; press Cmd+K to open dialog |
| Three-column layout without nested scroll | LAYOUT-04 | Nested scroll detection requires visual inspection | Verify sidebar + content + TOC columns; only one scrollbar visible |
| Viewport scroll + position reset | LAYOUT-05 | Scroll behavior requires browser navigation | Navigate between doc pages; verify scroll position resets to top |

**Justification:** Layout changes affect CSS positioning and visual rendering. Vitest uses `environment: 'node'` which cannot test DOM layout. Unit tests cannot verify sticky positioning, backdrop-blur, or scroll behavior.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
