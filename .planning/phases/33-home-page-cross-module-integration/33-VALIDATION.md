---
phase: 33
slug: home-page-cross-module-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 33 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^4.0.18 |
| **Config file** | vitest.config.ts (or vite.config.ts inline) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green + visual browser validation for all 4 requirements
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 33-01-01 | 01 | 1 | HOME-01 | unit | `npx vitest run src/pages/Home.test.tsx` | ❌ W0 | ⬜ pending |
| 33-01-02 | 01 | 1 | HOME-02 | unit | `npx vitest run src/pages/Home.test.tsx` | ❌ W0 | ⬜ pending |
| 33-02-01 | 02 | 2 | HOME-03 | manual-only | Visual browser check (requires live Supabase) | N/A | ⬜ pending |
| 33-02-02 | 02 | 2 | KB-07 | manual-only | Visual browser check (requires live Supabase) | N/A | ⬜ pending |
| 33-02-03 | 02 | 2 | KB-07 | unit | `npx vitest run src/components/layout/SearchCommand.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/Home.test.tsx` — stubs for HOME-01 (registry grid), HOME-02 (feed merge logic)
- [ ] `src/components/layout/SearchCommand.test.tsx` — stubs for KB-07 empty-query guard

*Existing infrastructure covers vitest setup. Only test files need creation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Client page renders KB "Conhecimento" section | HOME-03 | Requires live Supabase with KB data | Navigate to /clients/:slug, verify KB entries appear |
| KB entries appear in Cmd+K search results | KB-07 | Requires live Supabase with KB data | Open Cmd+K, type query, verify KB group appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
