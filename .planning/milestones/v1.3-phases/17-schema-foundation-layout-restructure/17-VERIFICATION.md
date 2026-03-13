---
phase: 17-schema-foundation-layout-restructure
verified: 2026-03-11T00:20:00Z
status: human_needed
score: 5/5 must-haves verified
re_verification: false
human_verification:
  - test: "Open wireframe viewer for any client (/clients/[slug]/wireframe) in a browser"
    expected: "Header spans the full viewport width including the area above the sidebar column. The sidebar begins at top: 56px, not at the top of the viewport. No layout collapse or white screen."
    why_human: "CSS flex layout correctness (flexDirection: column vs row) and pixel-level visual overlap can only be confirmed by visual inspection. grep cannot confirm rendering in a live browser."
  - test: "Check that card, table, form, and section borders appear as soft stone gray (not black or transparent) in both light and dark wireframe themes"
    expected: "Borders on StatCard, SettingsPage, FormSection, ProgressBar, FilterConfig, and Divider sections display as warm stone gray (#e7e5e4 in light, #44403c in dark), not as harsh black"
    why_human: "Visual rendering of CSS custom property chains (--wf-border -> --wf-card-border -> --wf-neutral-200) must be verified in browser. grep confirms the token exists but not that it cascades correctly in all browsers."
  - test: "Click the 'Gerenciar' button in the header right side and confirm the comment manager panel opens"
    expected: "A 'Gerenciar' button is visible in the header right area (not in sidebar footer). Clicking it opens the CommentManager overlay. Sidebar footer only shows 'Desenvolvido por FXL'."
    why_human: "Conditional rendering ({onGerenciar && <button>}) and wiring to handleOpenManager are confirmed in code, but end-to-end click behavior and absence of the button from sidebar footer requires visual confirmation."
---

# Phase 17: Schema Foundation & Layout Restructure — Verification Report

**Phase Goal:** The type system, Zod schemas, and layout hierarchy are correct and stable so all downstream phases build on solid ground
**Verified:** 2026-03-11T00:20:00Z
**Status:** human_needed — automated checks PASSED, 3 items require browser confirmation
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Wireframe viewer renders with header full-width above sidebar (not beside it) | ? HUMAN | `WireframeViewer.tsx:677` outer div has `flexDirection: 'column'`; `WireframeHeader` is first child at line 684; body row at line 689 wraps aside+main. Code correct — visual confirmation needed. |
| 2 | "Gerenciar" action lives in the header area, not in the sidebar | ? HUMAN | `WireframeHeader.tsx:89` conditional `{onGerenciar && <button>Gerenciar</button>}`; `WireframeViewer.tsx:687` passes `onGerenciar={handleOpenManager}`; sidebar footer (lines 739-748) contains only "Desenvolvido por FXL". Code correct — visual confirmation needed. |
| 3 | Wireframe components use softer gray palette (no harsh blacks in card/table/section borders) | ? HUMAN | `wireframe-tokens.css:29` `--wf-border: var(--wf-card-border)` in light block; `wireframe-tokens.css:86` same in dark block. `tailwind.config.ts:90` `border: 'var(--wf-border)'` in wf map. Token chain is complete — visual rendering in browser needed. |
| 4 | BlueprintConfig schema accepts optional SidebarConfig and HeaderConfig at dashboard level (not screen level) | VERIFIED | `blueprint.ts:292-308` exports `SidebarConfig`, `HeaderConfig` (as `Record<string, unknown>`), extended `BlueprintConfig` with optional `sidebar?` and `header?`. `blueprint-schema.ts:404-411` `BlueprintConfigSchema` has `.sidebar: SidebarConfigSchema.optional()` and `.header: HeaderConfigSchema.optional()`. All 7 Phase 17 schema tests pass. |
| 5 | FilterOption type supports a filterType discriminator field that defaults gracefully for backward compatibility | VERIFIED | `WireframeFilterBar.tsx:8` `filterType?: 'select' \| 'date-range' \| 'multi-select' \| 'search' \| 'toggle'`. `blueprint-schema.ts:50-55` `FilterOptionSchema` includes `filterType` enum optional. Tests confirm backward compat (no filterType = still valid) and forward (filterType: 'date-range' = valid). |

**Score: 5/5 truths confirmed at code level. 3 require human visual confirmation.**

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tools/wireframe-builder/styles/wireframe-tokens.css` | `--wf-border: var(--wf-card-border)` in both light and dark theme blocks | VERIFIED | Line 29 (light block) and line 86 (dark block) — both present and correctly placed after `--wf-card-border`. |
| `tailwind.config.ts` | `wf.border` Tailwind color token mapped to `var(--wf-border)` | VERIFIED | Line 90: `border: 'var(--wf-border)'` inside the `wf:` color map, placed after `'table-border'`. |
| `tools/wireframe-builder/components/WireframeHeader.tsx` | Optional `onGerenciar?: () => void` prop + conditional Gerenciar button in header right | VERIFIED | Props type at line 5-9 includes `onGerenciar?: () => void`. Component destructures it at line 31. Conditional button at lines 88-109. |
| `src/pages/clients/WireframeViewer.tsx` | `flexDirection: 'column'` outer container; `WireframeHeader` above body row; sidebar at `top: 56` | VERIFIED | Line 678: `flexDirection: 'column'`. Line 684: `WireframeHeader` as first child with `onGerenciar={handleOpenManager}`. Aside at lines 691-749: `top: 56`, `height: 'calc(100vh - 56px)'`. Body row wrapper at line 689. |
| `tools/wireframe-builder/components/WireframeFilterBar.tsx` | `filterType?` optional field on `FilterOption` type | VERIFIED | Line 8: `filterType?: 'select' \| 'date-range' \| 'multi-select' \| 'search' \| 'toggle'`. |
| `tools/wireframe-builder/types/blueprint.ts` | `SidebarConfig`, `HeaderConfig` types; extended `BlueprintConfig` with optional `sidebar` and `header` | VERIFIED | Lines 292-308: `SidebarConfig` with optional `footer?`, `HeaderConfig` as `Record<string, unknown>`, `BlueprintConfig` with `sidebar?` and `header?` fields. |
| `tools/wireframe-builder/lib/blueprint-schema.ts` | `SidebarConfigSchema`, `HeaderConfigSchema` (passthrough), extended `BlueprintConfigSchema` and exported `FilterOptionSchema` | VERIFIED | Lines 50-64: `FilterOptionSchema` exported with `filterType` enum; `SidebarConfigSchema` at line 57; `HeaderConfigSchema` at line 64 using `z.object({}).passthrough()`; `BlueprintConfigSchema` at lines 404-411 includes both. |
| `tools/wireframe-builder/lib/blueprint-schema.test.ts` | 7 new Phase 17 test cases including forward-compat guard | VERIFIED | Lines 306-354: describe block "Phase 17 schema extensions" with 7 test cases. All pass (244 total tests pass). |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `WireframeViewer.tsx` | `WireframeHeader.tsx` | `onGerenciar={handleOpenManager}` prop | WIRED | Line 687: `onGerenciar={handleOpenManager}`. `handleOpenManager` defined at lines 267-270, sets `managerOpen: true`. |
| `WireframeViewer.tsx aside` | header height 56px constant | `top: 56` on fixed sidebar | WIRED | Aside at line 700: `top: 56`. Header height is 56 (WireframeHeader.tsx line 52). Both in sync. |
| `blueprint.ts FilterOption` | `WireframeFilterBar.tsx FilterOption` | re-export: `export type { FilterOption }` | WIRED | `blueprint.ts` line 7 imports from `'../components/WireframeFilterBar'`; line 19 re-exports. `filterType` field in source propagates automatically. |
| `blueprint-schema.ts ValidatedBlueprintConfig` | `blueprint.ts BlueprintConfig` | `z.infer<typeof BlueprintConfigSchema>` must match manual type | VERIFIED | TypeScript `npx tsc --noEmit` exits with 0 errors — types are compatible. `HeaderConfig` as `Record<string, unknown>` is assignable from `z.object({}).passthrough()` output. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| VIS-01 | 17-01-PLAN.md | Wireframe component palette usa grays mais suaves | SATISFIED (human for visual) | `--wf-border` alias added in both theme blocks. Six section renderers (`var(--wf-border)`) now resolve to stone gray chain. Visual confirmation needed in browser. |
| LAYOUT-01 | 17-02-PLAN.md | Header renderiza acima da sidebar (full-width, highest z-order) | SATISFIED (human for visual) | `WireframeViewer.tsx` outer container `flexDirection: 'column'` with `WireframeHeader` as first child before body row. Code confirms intent; browser visual needed. |
| LAYOUT-02 | 17-02-PLAN.md | "Gerenciar" move da sidebar para header como action button | SATISFIED (human for visual) | `onGerenciar` prop passed and button renders conditionally in header. Sidebar footer contains only "Desenvolvido por FXL". Browser confirmation needed. |
| SIDE-01 | 17-03-PLAN.md | SidebarConfig adicionado ao BlueprintConfig schema (dashboard-level) | SATISFIED | `blueprint.ts:292` exports `SidebarConfig`. `BlueprintConfig:305` has `sidebar?: SidebarConfig`. Schema and test confirm optional + backward compat. |
| HEAD-01 | 17-03-PLAN.md | HeaderConfig adicionado ao BlueprintConfig schema (dashboard-level) | SATISFIED | `blueprint.ts:299` exports `HeaderConfig = Record<string, unknown>`. `BlueprintConfig:306` has `header?: HeaderConfig`. `HeaderConfigSchema` uses `passthrough()` for forward compat. Test confirms `{ anyFutureField: 'x' }` accepted. |
| FILT-01 | 17-03-PLAN.md | FilterOption type extendido com filterType discriminator | SATISFIED | `WireframeFilterBar.tsx:8` adds `filterType?` optional field. `FilterOptionSchema:54` adds enum. Tests confirm 'select', 'date-range', and missing filterType all pass. |

**Orphaned requirements check:** REQUIREMENTS.md traceability table maps VIS-01, LAYOUT-01, LAYOUT-02, SIDE-01, HEAD-01, FILT-01 all to Phase 17. No orphaned requirements found.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `tools/wireframe-builder/types/blueprint.ts` | 212 | `placeholder?: string` | Info | Legitimate form field config property, not an implementation anti-pattern. |
| `tools/wireframe-builder/lib/blueprint-schema.ts` | 282 | `placeholder: z.string().optional()` | Info | Matches the type above — correct Zod schema for a real form field. |

No blocker or warning anti-patterns found. The two "placeholder" occurrences above are field names in `FormSectionSection`, not incomplete implementations.

---

### TypeScript and Test Gates

- `npx tsc --noEmit` — exit 0, zero errors
- `npx vitest run` — 244 tests pass (237 pre-existing + 7 new Phase 17 cases), zero failures
- All 4 phase commits verified in git history: `b8707cc`, `f10ca1c`, `f8a8f59`, `eaadf76`

---

### Human Verification Required

#### 1. Full-width header layout

**Test:** Run `make dev`, open `/clients/[any-slug]/wireframe` in a browser
**Expected:** The header bar spans the entire viewport width including the area directly above the sidebar column. The sidebar begins immediately below the header bottom edge (not at the top of the viewport). No white screen or layout collapse.
**Why human:** The flex layout change (`flexDirection: column`) is confirmed in code, but visual overlap, z-index behavior, and pixel-level alignment require browser inspection. A bug in a parent container's overflow or height could still cause the sidebar to overlap despite correct code.

#### 2. Soft gray border palette on six section renderers

**Test:** In the wireframe viewer, navigate to screens containing StatCard, SettingsPage, FormSection, ProgressBar, FilterConfig, and Divider sections (or inspect the component gallery). Toggle between light and dark modes.
**Expected:** Card and section borders display as soft warm stone gray (light: #e7e5e4, dark: #44403c), not harsh black or invisible/transparent.
**Why human:** The CSS variable chain `--wf-border -> --wf-card-border -> --wf-neutral-200/#e7e5e4` is correct in the token file, but CSS cascade and specificity issues (e.g., a component using inline styles or a class that overrides the variable) can only be caught visually in a running browser.

#### 3. Gerenciar button location and sidebar footer

**Test:** Open the wireframe viewer. Check the header right side for a "Gerenciar" button. Click it and verify the CommentManager overlay opens. Check the sidebar footer — it should only show "Desenvolvido por FXL", with no "Gerenciar" button.
**Expected:** Gerenciar button is visible in header right; clicking it opens the comment manager; sidebar footer shows only the FXL credit text.
**Why human:** Conditional rendering is correct in code (`{onGerenciar && <button>}`), but the actual visual placement, hover behavior, and absence of the old sidebar button require a live browser to confirm.

---

## Gaps Summary

No gaps found. All automated verification checks pass. The 5 must-have truths are confirmed at the code level (correct structure, correct tokens, correct types, all tests pass, TypeScript clean). Three truths have visual or interactive components that require a human to open the wireframe viewer in a browser to confirm.

---

_Verified: 2026-03-11T00:20:00Z_
_Verifier: Claude (gsd-verifier)_
