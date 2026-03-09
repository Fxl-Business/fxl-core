---
phase: 6
slug: system-generation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (not yet installed — Wave 0) |
| **Config file** | vitest.config.ts (Wave 0 creates) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit && npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 0 | ALL | setup | `npx vitest run` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | SGEN-01 | unit | `npx vitest run tools/wireframe-builder/lib/spec-generator.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | SGEN-01 | manual | Operator verifies template repo scaffolds and `npm run dev` works | N/A | ⬜ pending |
| 06-02-02 | 02 | 1 | SGEN-02, SGEN-05 | manual | Generated pages render with branding | N/A | ⬜ pending |
| 06-03-01 | 03 | 2 | SGEN-03 | unit | `npx vitest run tools/wireframe-builder/lib/br-normalizer.test.ts` | ❌ W0 | ⬜ pending |
| 06-03-02 | 03 | 2 | SGEN-04 | unit | `npx vitest run -t "auth roles"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@vitest/ui` — install as devDependencies
- [ ] `vitest.config.ts` — root config with TypeScript path aliases matching tsconfig
- [ ] `tools/wireframe-builder/lib/spec-generator.test.ts` — covers SGEN-01, SGEN-02, SGEN-04, SGEN-05
- [ ] `tools/wireframe-builder/lib/br-normalizer.test.ts` — covers SGEN-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Template repo scaffold starts with `npm run dev` | SGEN-01 | Requires separate repo clone and run | 1. Clone template repo 2. npm install 3. npm run dev 4. Verify both frontend and backend start |
| Generated pages render KPI cards, charts, tables | SGEN-02 | Visual verification in browser | 1. Run product spec generation for pilot 2. Claude Code generates in template 3. Verify dashboard renders correctly |
| Upload flow works end-to-end | SGEN-03 | E2E flow across frontend + backend | 1. Upload test CSV with BR formats 2. Verify data appears normalized in Supabase |
| Clerk login and role enforcement | SGEN-04 | Requires Clerk dashboard setup | 1. Create test users with Admin/Editor/Viewer roles 2. Verify access restrictions per role |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
