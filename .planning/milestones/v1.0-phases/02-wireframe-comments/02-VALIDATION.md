---
phase: 2
slug: wireframe-comments
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-07
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (tsc type-checking only) |
| **Config file** | tsconfig.json |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit` + manual smoke test
- **Before `/gsd:verify-work`:** Full manual walkthrough of all 3 success criteria
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | WCMT-01 | type-check | `npx tsc --noEmit` | tsconfig.json | ⬜ pending |
| 02-01-02 | 01 | 1 | WCMT-01 | type-check | `npx tsc --noEmit` | tsconfig.json | ⬜ pending |
| 02-02-01 | 02 | 2 | WCMT-02 | manual-only | Manual: open shared link, enter name, post comment | N/A | ⬜ pending |
| 02-02-02 | 02 | 2 | WCMT-03 | manual-only | Manual: open panel, verify grouping and resolve | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing `npx tsc --noEmit` serves as primary automated validation per CLAUDE.md conventions
- No test framework installation needed for this phase
- Supabase integration testing is manual against a real Supabase instance

*Existing infrastructure covers automated phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Comment persists after reload | WCMT-01 | Requires real Supabase instance | Create comment, reload page, verify presence |
| Block-level anchoring | WCMT-01 | Requires visual verification | Click section icon, add comment, verify it appears on correct block |
| Client access via shared link | WCMT-02 | Requires real token + Supabase Auth | Open shared link, enter name, post comment |
| Comment management panel | WCMT-03 | Requires populated data | Open panel, verify grouping by screen, test resolve button |
| Token expiry/revocation | WCMT-02 | Requires time-based or manual revoke test | Revoke token, verify access denied |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or documented manual procedures
- [ ] Sampling continuity: tsc runs after every task commit
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
