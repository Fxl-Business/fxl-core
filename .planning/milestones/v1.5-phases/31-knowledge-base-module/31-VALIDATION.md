---
phase: 31
slug: knowledge-base-module
status: draft
nyquist_compliant: true
wave_0_complete: false
wave_0_plan: "31-00-PLAN.md"
created: 2026-03-12
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run src/modules/knowledge-base` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx vitest run src/modules/knowledge-base`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 31-00-01 | 00 | 0 | KB-02, KB-05, KB-06 | stub creation | `ls src/modules/knowledge-base/hooks/useKBEntries.test.ts src/modules/knowledge-base/hooks/useKBSearch.test.ts src/modules/knowledge-base/pages/KBFormPage.test.ts` | N/A | ⬜ pending |
| 31-01-01 | 01 | 1 | KB-02 | unit | `npx vitest run src/modules/knowledge-base/hooks/useKBEntries.test.ts` | ⬜ W0 (31-00) | ⬜ pending |
| 31-01-02 | 01 | 1 | KB-03 | manual-only | Visual browser check on /knowledge-base/:id | N/A | ⬜ pending |
| 31-01-03 | 01 | 1 | KB-04 | manual-only | Visual browser check: create + verify in list | N/A | ⬜ pending |
| 31-01-04 | 01 | 1 | KB-05 | unit | `npx vitest run src/modules/knowledge-base/hooks/useKBSearch.test.ts` | ⬜ W0 (31-00) | ⬜ pending |
| 31-01-05 | 01 | 1 | KB-06 | unit | `npx vitest run src/modules/knowledge-base/pages/KBFormPage.test.ts` | ⬜ W0 (31-00) | ⬜ pending |
| ALL | — | — | ALL | type check | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 is covered by **31-00-PLAN.md** which creates all 3 test stub files:

- [ ] `src/modules/knowledge-base/hooks/useKBEntries.test.ts` — stubs for KB-02 filter composition
- [ ] `src/modules/knowledge-base/hooks/useKBSearch.test.ts` — stubs for KB-05 search_vec + plain type
- [ ] `src/modules/knowledge-base/pages/KBFormPage.test.ts` — stubs for KB-06 ADR template injection

*Mock pattern: same as `tools/wireframe-builder/lib/blueprint-store.test.ts` — mock `@/lib/supabase` with `vi.mock()`, wire fluent chain with `vi.fn()`.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Detail page renders entry with metadata | KB-03 | Requires live Supabase + browser rendering | Navigate to /knowledge-base/:id, verify title, body markdown, type, tags, client, dates visible |
| Form saves and entry appears in list | KB-04 | Requires live Supabase connection | Create entry via form, verify toast, verify entry in list immediately |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (via 31-00-PLAN.md)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending (wave_0_complete will be set to true after 31-00 executes)
