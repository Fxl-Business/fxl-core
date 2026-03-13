---
phase: 24
slug: kpi-cards
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 24 — Validation Strategy

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
| 24-01-01 | 01 | 1 | CARD-01 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 24-01-02 | 01 | 1 | CARD-02 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 24-01-03 | 01 | 1 | CARD-03 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 24-01-04 | 01 | 1 | CARD-04 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |
| 24-01-05 | 01 | 1 | CARD-05 | manual + tsc | `npx tsc --noEmit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Phase 24 is a pure visual restyle — TypeScript compliance is the only automated gate.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card background and border | CARD-01 | Visual CSS | Open wireframe, verify white/slate-900 bg, rounded-xl, shadow-sm |
| Group-hover icon transition | CARD-02 | Interactive CSS | Hover KPI card, verify icon container transitions primary/10 → solid primary |
| Trend badge pills | CARD-03 | Visual structure | Verify rounded-full pills, emerald for positive, rose for negative |
| Typography hierarchy | CARD-04 | Visual typography | Verify text-2xl extrabold values, text-sm medium labels |
| Comparison text | CARD-05 | Visual structure | Verify text-[10px] slate-400 comparison below value |

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
