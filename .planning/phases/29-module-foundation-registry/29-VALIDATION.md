---
phase: 29
slug: module-foundation-registry
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 29 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^4.0.18 |
| **Config file** | none — vitest uses vite.config.ts by default |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 29-01-01 | 01 | 1 | MOD-01 | unit | `npx vitest run src/modules/registry.test.ts` | ❌ W0 | ⬜ pending |
| 29-01-02 | 01 | 1 | MOD-01 | unit | `npx vitest run src/modules/registry.test.ts` | ❌ W0 | ⬜ pending |
| 29-01-03 | 01 | 1 | MOD-02 | structural | `tsc --noEmit` | ❌ W0 | ⬜ pending |
| 29-02-01 | 02 | 1 | MOD-03 | unit | `npx vitest run src/components/layout/Sidebar.test.tsx` | ❌ W0 | ⬜ pending |
| 29-02-02 | 02 | 1 | MOD-03 | manual | visual inspection + line count | N/A | ⬜ pending |
| 29-03-01 | 03 | 1 | MOD-04 | smoke | manual browser check | N/A | ⬜ pending |
| 29-04-01 | 04 | 2 | ESLint | integration | `npm run lint` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/modules/registry.test.ts` — stubs for MOD-01
- [ ] `src/components/layout/Sidebar.test.tsx` — stubs for MOD-03
- [ ] `eslint.config.js` — boundary rules config
- [ ] ESLint install: `npm install --save-dev eslint eslint-plugin-boundaries @typescript-eslint/parser`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App.tsx route count within 60 lines | MOD-03 | Line count/structure check | Count route definition lines in App.tsx |
| Docs routes still work | MOD-04 | Browser smoke test | Navigate to /processo, /ferramentas, verify pages render |
| WF builder gallery still works | MOD-04 | Browser smoke test | Navigate to /ferramentas/galeria, verify gallery renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
