---
phase: 32
slug: task-management-module
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 32 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.0.18 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run src/modules/tasks` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/modules/tasks && npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green + visual browser check
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 32-01-01 | 01 | 1 | TASK-02 | unit | `npx vitest run src/lib/tasks-service.test.ts` | Phase 30 | ⬜ pending |
| 32-01-02 | 01 | 1 | TASK-02 | manual | `make dev` → /tarefas | N/A | ⬜ pending |
| 32-02-01 | 02 | 2 | TASK-03 | unit | `npx vitest run src/lib/tasks-service.test.ts` | Phase 30 | ⬜ pending |
| 32-02-02 | 02 | 2 | TASK-03 | manual | `make dev` → /tarefas/new, /tarefas/:id/edit | N/A | ⬜ pending |
| 32-03-01 | 03 | 3 | TASK-04 | unit | `npx vitest run src/modules/tasks` | ❌ W0 | ⬜ pending |
| 32-03-02 | 03 | 3 | TASK-04 | manual | `make dev` → /tarefas/kanban | N/A | ⬜ pending |
| 32-03-03 | 03 | 3 | TASK-05 | manual | `make dev` → done task "Documentar" button | N/A | ⬜ pending |
| 32-00-01 | all | all | TASK-02–05 | type check | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/modules/tasks/lib/nextStatus.test.ts` — unit test for status cycling pure function
- [ ] Verify `src/lib/tasks-service.test.ts` exists from Phase 30 with listTasks, createTask, updateTask, updateTaskStatus coverage

*If Phase 30 created tasks-service.test.ts with full coverage: only nextStatus test needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| /tarefas renders task list with filter controls | TASK-02 | UI rendering | Visit /tarefas, verify filter dropdowns for status/priority/client, verify task cards render |
| Task form saves all fields | TASK-03 | Form interaction | Create task via /tarefas/new, verify all fields save; edit via /tarefas/:id/edit, verify pre-fill and update |
| Kanban shows 4 columns | TASK-04 | Visual layout | Visit /tarefas/kanban, verify 4 columns (todo, in_progress, done, blocked) |
| Status badge click advances status | TASK-04 | Click interaction | Click status badge on task card, verify status changes and card moves to next column |
| "Documentar" button on done tasks | TASK-05 | Cross-module navigation | Set task to done, verify "Documentar" button appears, click it, verify KB form pre-filled with title |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
