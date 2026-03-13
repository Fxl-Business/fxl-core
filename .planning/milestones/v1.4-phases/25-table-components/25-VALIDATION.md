---
phase: 25
slug: table-components
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-11
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + TypeScript compiler |
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
| 25-01-01 | 01 | 1 | TBL-01 | manual + tsc | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 25-01-02 | 01 | 1 | TBL-02 | manual + tsc | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 25-01-03 | 01 | 1 | TBL-03 | manual + tsc | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 25-01-04 | 01 | 1 | TBL-04 | manual + tsc | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 25-01-05 | 01 | 1 | TBL-05 | manual + tsc | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* Phase 25 is a pure visual restyle — TypeScript compliance (`npx tsc --noEmit`) is the only automated gate. No new test files needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Header `<th>` typography | TBL-01 | CSS class visual change | Inspect all 4 table headers in wireframe viewer (light + dark) |
| Row hover states | TBL-02 | Interactive CSS hover | Hover rows in ClickableTable, DrillDownTable; verify cursor-pointer |
| Total/highlight row styling | TBL-03 | Visual class change | Check total/highlight rows show primary color + extrabold uppercase |
| Dark footer row | TBL-04 | Conditional render + visual | Provide footer data, verify dark bg-slate-900 tfoot renders |
| Trend icon scale | TBL-05 | CSS hover transform | Hover trend icons, verify scale-110 transition |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-11
