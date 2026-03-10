---
phase: 11
slug: ai-assisted-generation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | AIGE-02 | unit | `npx vitest run screen-recipes` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | AIGE-03 | unit | `npx vitest run vertical-templates` | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 1 | AIGE-01 | unit | `npx vitest run generate-blueprint` | ❌ W0 | ⬜ pending |
| 11-02-02 | 02 | 1 | AIGE-01 | integration | `npx vitest run blueprint-generation` | ❌ W0 | ⬜ pending |
| 11-03-01 | 03 | 2 | AIGE-01 | integration | `npx vitest run cli-generate` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for screen recipe validation (AIGE-02)
- [ ] Test stubs for vertical template validation (AIGE-03)
- [ ] Test stubs for blueprint generation engine (AIGE-01)
- [ ] Shared fixtures: sample BriefingConfig, reference BlueprintConfig

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Generated blueprint renders in wireframe viewer | AIGE-01 | Requires browser + Supabase | Load generated blueprint in dev, verify all screens render |
| CLI skill invocation from Claude Code | AIGE-01 | Requires Claude Code runtime | Run skill command, verify output |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
