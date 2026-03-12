---
phase: 30
slug: supabase-migrations-data-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 30 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/lib/kb-service.test.ts src/lib/tasks-service.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/kb-service.test.ts src/lib/tasks-service.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 30-01-01 | 01 | 1 | KB-01 | migration | `make migrate` | ❌ W0 | ⬜ pending |
| 30-01-02 | 01 | 1 | TASK-01 | migration | `make migrate` | ❌ W0 | ⬜ pending |
| 30-02-01 | 02 | 1 | KB-01 | unit | `npx vitest run src/lib/kb-service.test.ts` | ❌ W0 | ⬜ pending |
| 30-02-02 | 02 | 1 | TASK-01 | unit | `npx vitest run src/lib/tasks-service.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/kb-service.test.ts` — stubs for KB-01 CRUD + search
- [ ] `src/lib/tasks-service.test.ts` — stubs for TASK-01 CRUD

*Existing infrastructure covers test framework (Vitest already configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Migration applies to remote Supabase | KB-01, TASK-01 | Requires live Supabase project | Run `make migrate`, check dashboard for tables |
| Existing operations still work | KB-01, TASK-01 | Integration test against live DB | Save a blueprint, submit a briefing after migrations |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
