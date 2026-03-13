---
phase: 22
slug: token-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (vitest.config.ts) |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run tools/wireframe-builder/lib/branding.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit && npx vitest run tools/wireframe-builder/lib/branding.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 22-01-01 | 01 | 1 | TOK-01 | manual | Visual inspection in browser | N/A | ⬜ pending |
| 22-01-02 | 01 | 1 | TOK-02 | manual | Visual inspection dark mode | N/A | ⬜ pending |
| 22-01-03 | 01 | 1 | TOK-03 | manual | `grep "color-mix" tools/wireframe-builder/styles/wireframe-tokens.css` | N/A | ⬜ pending |
| 22-01-04 | 01 | 1 | TOK-04 | manual | `grep "wf-header-search-bg" tools/wireframe-builder/styles/wireframe-tokens.css` | N/A | ⬜ pending |
| 22-01-05 | 01 | 1 | TOK-05 | manual | Browser DevTools computed styles | N/A | ⬜ pending |
| 22-01-06 | 01 | 1 | TOK-06 | unit (grep) | `grep -r "#f59e0b" tools/wireframe-builder/` | N/A | ⬜ pending |
| 22-01-07 | 01 | 1 | TOK-07 | unit | `npx vitest run tools/wireframe-builder/lib/branding.test.ts` | ✅ exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. The branding.test.ts file exists and needs content update, not creation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Slate palette renders correctly | TOK-01 | Visual verification of color rendering | Open wireframe viewer, confirm blue #1152d4 accent |
| Both themes updated | TOK-02 | Visual check of dark mode toggle | Toggle dark mode, verify colors update |
| Canvas background values | TOK-05 | Computed style check | DevTools → computed → --wf-canvas = #f6f6f8 (light) / #101622 (dark) |
| Client branding override | TOK-07 | Integration test with client data | Load financeiro-conta-azul wireframe, verify #1B6B93 overrides --wf-primary |

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
