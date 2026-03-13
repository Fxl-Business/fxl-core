---
phase: 17
slug: schema-foundation-layout-restructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green + `npx tsc --noEmit`
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | VIS-01 | manual | N/A — visual verification in browser | N/A | ⬜ pending |
| 17-02-01 | 02 | 1 | LAYOUT-01 | manual | N/A — layout is visual | N/A | ⬜ pending |
| 17-02-02 | 02 | 1 | LAYOUT-02 | manual | N/A — UI interaction | N/A | ⬜ pending |
| 17-03-01 | 03 | 1 | SIDE-01 | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | ✅ | ⬜ pending |
| 17-03-02 | 03 | 1 | HEAD-01 | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | ✅ | ⬜ pending |
| 17-03-03 | 03 | 1 | FILT-01 | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed.

*Existing test file to extend:* `tools/wireframe-builder/lib/blueprint-schema.test.ts`

New test cases to add as part of schema task:
1. `BlueprintConfigSchema` accepts config with optional `sidebar: {}` and `header: {}`
2. `BlueprintConfigSchema` accepts config without `sidebar` and `header` (backward compat)
3. `BlueprintConfigSchema` accepts `header: { anyFutureField: 'x' }` (forward-compat guard — Phase 18 fields must not be rejected)
4. `FilterOptionSchema` accepts `filterType: 'select'`, `filterType: 'date-range'`, `filterType: undefined`
5. Existing `validConfig` fixture still passes (regression guard)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `--wf-border` resolves to same color as `--wf-card-border` | VIS-01 | Visual CSS token — no DOM assertion possible | Open wireframe viewer, inspect StatCard/Settings/Form borders; should match card border color, not transparent/black |
| Header renders full-width above sidebar | LAYOUT-01 | Layout is visual | Open wireframe viewer; header should span full width including sidebar area; sidebar should start below header |
| "Gerenciar" button absent from sidebar, present in header | LAYOUT-02 | UI interaction location | Open wireframe viewer; confirm "Gerenciar" button is in the header area, not in the sidebar footer |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
