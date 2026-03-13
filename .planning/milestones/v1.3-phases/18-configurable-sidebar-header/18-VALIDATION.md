---
phase: 18
slug: configurable-sidebar-header
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 18 — Validation Strategy

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
- **Before `/gsd:verify-work`:** Full suite must be green (244+) + `npx tsc --noEmit`
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | SIDE-03, SIDE-05, HEAD-02, HEAD-03, HEAD-04, HEAD-05 | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | ✅ | ⬜ pending |
| 18-02-01 | 02 | 1 | SIDE-02, SIDE-03, SIDE-06, SIDE-07 | manual | N/A — visual | N/A | ⬜ pending |
| 18-03-01 | 03 | 1 | SIDE-04 | manual | N/A — visual state interaction | N/A | ⬜ pending |
| 18-04-01 | 04 | 1 | HEAD-02, HEAD-03, HEAD-04, HEAD-05 | manual | N/A — visual | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all automated requirements. No new test files needed.

*Existing test file to extend:* `tools/wireframe-builder/lib/blueprint-schema.test.ts`

New test cases to add as part of schema task (Plan 18-01):
1. `SidebarConfigSchema` accepts `{ footer: 'v1.0', groups: [{ label: 'Financeiro', screenIds: ['screen-1'] }] }` — SIDE-03
2. `SidebarConfigSchema` accepts `{ groups: [] }` — backward compat empty groups
3. `BlueprintScreenSchema` accepts `{ ...validScreen, badge: 3 }` — SIDE-05 number badge
4. `BlueprintScreenSchema` accepts `{ ...validScreen, badge: 'NEW' }` — SIDE-05 string badge
5. `BlueprintScreenSchema` accepts `{ ...validScreen }` (no badge, backward compat) — regression guard
6. `HeaderConfigSchema` accepts `{ showLogo: true, actions: { manage: true, share: false } }` — HEAD-02/05
7. Existing forward-compat test still green (passthrough guard regression)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Icons render next to sidebar menu items | SIDE-02 | Visual — ScreenManager already has code, need visual confirmation | Open wireframe viewer with a blueprint that has screen.icon set; confirm icon appears next to label |
| Sidebar groups display with headings | SIDE-03 | Visual layout | Configure sidebar.groups in blueprint; confirm labeled sections appear in sidebar |
| Sidebar collapses to icon-only rail | SIDE-04 | Visual state interaction | Click collapse toggle; confirm sidebar narrows to 56px with icons only; click again to expand |
| Badge/notification pill renders on items | SIDE-05 | Visual | Set screen.badge = 3 in blueprint; confirm red pill with "3" appears on sidebar item |
| Footer text from config | SIDE-06 | Visual | Set sidebar.footer = "v2.0 staging" in blueprint; confirm footer shows that text |
| Active screen remains highlighted | SIDE-07 | Visual regression | Navigate screens; confirm active item has highlighted background |
| Client logo renders in header | HEAD-02 | Visual | Open wireframe with branding.logoUrl set; confirm logo appears in header left area |
| Period selector hidden when showPeriodSelector: false | HEAD-03 | Visual | Set header.showPeriodSelector: false; confirm period selector disappears from header |
| User indicator shows Clerk user name | HEAD-04 | Visual | Open wireframe viewer; confirm user name/role chip appears in header right |
| Share and Export action buttons render | HEAD-05 | Visual | Set header.actions.share: true, header.actions.export: true; confirm buttons appear |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
