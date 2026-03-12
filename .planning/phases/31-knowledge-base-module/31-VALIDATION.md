---
phase: 31
slug: knowledge-base-module
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| 31-01-01 | 01 | 1 | KB-02 | unit | `npx vitest run src/modules/knowledge-base/hooks/useKBEntries.test.ts` | ❌ W0 | ⬜ pending |
| 31-01-02 | 01 | 1 | KB-03 | manual-only | Visual browser check on /knowledge-base/:id | N/A | ⬜ pending |
| 31-01-03 | 01 | 1 | KB-04 | manual-only | Visual browser check: create + verify in list | N/A | ⬜ pending |
| 31-01-04 | 01 | 1 | KB-05 | unit | `npx vitest run src/modules/knowledge-base/hooks/useKBSearch.test.ts` | ❌ W0 | ⬜ pending |
| 31-01-05 | 01 | 1 | KB-06 | unit | `npx vitest run src/modules/knowledge-base/pages/KBFormPage.test.ts` | ❌ W0 | ⬜ pending |
| ALL | — | — | ALL | type check | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
