---
phase: 23
slug: sidebar-header-chrome
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (vitest.config.ts) |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green + visual checklist
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 1 | SIDE-01 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 23-01-02 | 01 | 1 | SIDE-02 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 23-01-03 | 01 | 1 | SIDE-03 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 23-01-04 | 01 | 1 | SIDE-04 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 23-01-05 | 01 | 1 | SIDE-05 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 23-02-01 | 02 | 1 | HEAD-01 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 23-02-02 | 02 | 1 | HEAD-02 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 23-02-03 | 02 | 1 | HEAD-03 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 23-02-04 | 02 | 1 | HEAD-04 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Phase 23 is a pure visual restyle — TypeScript compliance is the only automated gate.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark sidebar background | SIDE-01 | Visual CSS token change | Open wireframe viewer, confirm slate-900/950 sidebar bg |
| Active nav item styling | SIDE-02 | Visual CSS class change | Click nav items, verify primary/10 bg + primary text |
| Hover transitions | SIDE-03 | Interactive CSS | Hover nav items, verify bg-slate-800 + text-white transitions |
| Group labels typography | SIDE-04 | Visual typography | Check section labels are 10px uppercase tracking-wider |
| Status footer card | SIDE-05 | Visual structure | Scroll sidebar to bottom, verify dot + label in bordered card |
| Header background and height | HEAD-01 | Visual CSS | Verify white bg, bottom border, h-14 |
| Search input | HEAD-02 | Visual structure | Verify rounded-lg input with search icon, slate-100/800 bg |
| Header right elements | HEAD-03 | Visual structure | Verify bell icon, dark mode toggle, user chip present |
| User chip details | HEAD-04 | Visual structure | Verify avatar, name, role text in user chip |

---

## TypeScript Gate

```bash
npx tsc --noEmit
```

Zero errors is the acceptance criterion for all changes.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
