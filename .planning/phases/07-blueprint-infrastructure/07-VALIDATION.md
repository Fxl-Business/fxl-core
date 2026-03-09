---
phase: 7
slug: blueprint-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (if not installed) or manual TypeScript compilation |
| **Config file** | none — Wave 0 installs if needed |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | INFRA-01 | integration | Manual: load wireframe viewer, verify no .ts import | ❌ W0 | ⬜ pending |
| 7-01-02 | 01 | 1 | INFRA-03 | unit | `npx tsc --noEmit` (zod schema compiles) | ❌ W0 | ⬜ pending |
| 7-02-01 | 02 | 1 | INFRA-02 | integration | Manual: save blueprint, verify schemaVersion in DB | ❌ W0 | ⬜ pending |
| 7-02-02 | 02 | 1 | INFRA-04 | integration | Manual: open 2 tabs, edit both, verify conflict modal | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `zod` package installed
- [ ] `sonner` package installed + Toaster mounted in app
- [ ] Zod schema for BlueprintConfig compiles with `npx tsc --noEmit`

*Existing infrastructure (Supabase client, blueprint-store.ts) covers base requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Wireframe loads from DB only | INFRA-01 | Requires running app + Supabase | Load wireframe viewer, check Network tab for Supabase query, no .ts file import |
| schemaVersion persists | INFRA-02 | Requires DB inspection | Save blueprint, query Supabase, verify config.schemaVersion field |
| Validation toast on bad data | INFRA-03 | Requires manually corrupting DB data | Insert malformed JSON in Supabase, load viewer, verify toast appears |
| Conflict detection modal | INFRA-04 | Requires 2 browser tabs | Open 2 tabs on same client wireframe, edit in both, save first, save second, verify modal |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
