---
phase: 5
slug: technical-configuration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (no test runner — see Wave 0) |
| **Config file** | tsconfig.json (existing) |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit` + run validator against pilot client
- **Before `/gsd:verify-work`:** Full suite must be green + validator 100% coverage on pilot
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | TCONF-01 | type-check | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | TCONF-01 | type-check | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 1 | TCONF-02 | manual+tsc | `npx tsc --noEmit` + run resolver on pilot | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | TCONF-02 | manual+tsc | `npx tsc --noEmit` + inspect SKILL.md output | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | TCONF-04 | script | Run validator against pilot blueprint | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | TCONF-03 | manual-only | Operator runs Claude prompt, reviews draft | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test framework installed — `npx tsc --noEmit` is primary automated check
- [ ] Validation script (TCONF-04) doubles as integration test for resolver (TCONF-02)
- [ ] AI draft generation (TCONF-03) is manual-only — operator reviews Claude output

*Note: Adding vitest for unit tests on resolver/validator is recommended but optional for this phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Claude generates valid TechnicalConfig draft | TCONF-03 | AI interaction — requires operator to invoke Claude and review output quality | 1. Run `/project:generate-technical-config financeiro-conta-azul` 2. Compare draft to expected TechnicalConfig structure 3. Verify field references match briefing KPIs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
