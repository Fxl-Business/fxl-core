---
phase: 14
slug: sidebar-navigation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 14 — Validation Strategy

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
| 14-01-01 | 01 | 1 | NAV-01 | manual-only | Visual: sidebar sticky with independent scroll | N/A | ⬜ pending |
| 14-01-02 | 01 | 1 | NAV-02 | manual-only | Visual: section headers uppercase, xs, bold | N/A | ⬜ pending |
| 14-01-03 | 01 | 1 | NAV-03 | manual-only | Visual: active item indigo left border + text | N/A | ⬜ pending |
| 14-01-04 | 01 | 1 | NAV-04 | manual-only | Visual: chevron toggle expand/collapse | N/A | ⬜ pending |
| 14-01-05 | 01 | 1 | NAV-05 | manual-only | Visual: sub-items indented pl-4 | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed.

Phase gate: TypeScript compilation (`npx tsc --noEmit`) plus visual verification of the 4 success criteria. Existing vitest tests must continue passing.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar sticky with independent scroll | NAV-01 | CSS sticky + overflow-y-auto require browser | Scroll page content; sidebar stays fixed. Scroll sidebar; it scrolls independently |
| Section headers typography | NAV-02 | Visual typography verification | Inspect PROCESSO, PADROES headers for uppercase, xs, bold, tracking-wider |
| Active item indigo indicator | NAV-03 | Visual state requires navigation | Navigate to doc; verify active item has indigo border-l and text |
| Collapsible sections | NAV-04 | Interactive behavior | Click chevron on sections; verify expand/collapse |
| Sub-item indentation | NAV-05 | Visual nesting verification | Inspect sub-items for consistent pl-4 indentation |

**Justification:** All changes are CSS class modifications. Unit tests cannot verify sticky positioning, visual hierarchy, or scroll behavior.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
