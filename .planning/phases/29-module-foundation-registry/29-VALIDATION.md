---
phase: 29
slug: module-foundation-registry
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-12
---

# Phase 29 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | tsc + ESLint (no vitest tests in this phase) |
| **Config file** | tsconfig.json (tsc), eslint.config.js (ESLint — created in Plan 01) |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npm run lint` (runs `eslint src/ && tsc --noEmit`) |
| **Estimated runtime** | ~10 seconds |

**Note:** vitest is installed in devDependencies but no test files exist in the project yet. This phase uses TypeScript compilation and ESLint boundary checks as the automated feedback mechanism. Unit tests are not required for this structural/wiring phase.

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green (`npm run lint` exits 0)
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 29-01-01 | 01 | 1 | MOD-01, MOD-04 | structural | `npx tsc --noEmit` | pending |
| 29-01-02 | 01 | 1 | MOD-02 | structural | `ls -d src/modules/*/pages src/modules/*/components src/modules/*/hooks src/modules/*/types \| wc -l` | pending |
| 29-01-03 | 01 | 1 | MOD-03 | integration | `npm run lint` | pending |
| 29-02-01 | 02 | 2 | MOD-03 | structural | `npx tsc --noEmit` | pending |
| 29-02-02 | 02 | 2 | MOD-03 | structural | `npx tsc --noEmit && npm run lint` | pending |
| 29-02-03 | 02 | 2 | MOD-03 | manual | visual inspection (checkpoint) | pending |

*Status: pending | green | red | flaky*

---

## Wave 0 Requirements

- [ ] `eslint.config.js` — boundary rules config (created in Plan 01, Task 3)
- [ ] ESLint install: `npm install --save-dev eslint eslint-plugin-boundaries @typescript-eslint/parser` (Plan 01, Task 3)
- [ ] Update `package.json` lint script to `"eslint src/ && tsc --noEmit"` (Plan 01, Task 3)

**No vitest test files required.** This phase validates through:
1. TypeScript compilation (`tsc --noEmit`) — verifies types, imports, and module structure
2. ESLint boundary checks (`eslint src/`) — verifies cross-module import rules
3. Visual verification (Plan 02 checkpoint) — verifies routing and navigation work correctly

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar shows correct nav sections from registry | MOD-03 | Visual rendering check | Open localhost:5173, verify Processo/Padroes/Ferramentas/Clientes sections appear |
| App.tsx route count within 60 lines | MOD-03 | Line count/structure check | Count route definition lines in App.tsx |
| Docs routes still work | MOD-04 | Browser smoke test | Navigate to /processo, /ferramentas, verify pages render |
| WF builder gallery still works | MOD-04 | Browser smoke test | Navigate to /ferramentas/wireframe-builder/galeria, verify gallery renders |
| Sidebar expand/collapse works | MOD-03 | Interactive behavior | Click section headers, verify accordion behavior |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers ESLint + lint script setup (no vitest tests needed)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
