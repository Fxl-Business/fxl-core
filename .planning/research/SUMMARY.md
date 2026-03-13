# Project Research Summary

**Project:** FXL Core v2.2 — Wireframe Builder Configurable Layout Components
**Domain:** Wireframe builder editor extension — sidebar widgets, header config panels, filter bar editor
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

This milestone extends an existing, working visual editor (AdminToolbar, PropertyPanel, ScreenManager, 28 section types) to cover layout-level configuration: the sidebar chrome, the header chrome, and the per-screen filter bar. The base stack is fully validated — React 18, TypeScript strict, Tailwind CSS 3, Vite 5, Supabase, Clerk, @dnd-kit, Zod 4.x. No new npm packages are required; the only additions are two shadcn/ui component files (`tooltip.tsx` and `sidebar.tsx`) that wrap Radix packages already installed. Zero new Supabase tables are needed — all new config is stored as optional JSONB fields in the existing `blueprints.config` column.

The recommended approach follows the existing architectural pattern throughout: schema extension first (Zod and TypeScript in lockstep), then render wiring, then editor panels. New layout panels use the established Sheet pattern but are NOT routed through `SECTION_REGISTRY` — they operate at config-root level (`workingConfig.sidebar`, `workingConfig.header`) or screen level (`screen.filters[]`), requiring a new `updateWorkingDashboard` helper alongside the existing `updateWorkingScreen`. Critically, `WireframeHeader` must have its render layer wired to the full `HeaderConfig` schema before any header property panel is built, because `showPeriodSelector`, `showUserIndicator`, and `actions.*` already exist in the schema and in Supabase but are currently ignored by the component.

The key risks center on two silent failure modes: Zod stripping new sidebar fields on save because `SidebarConfigSchema` lacks `.passthrough()` (data disappears after reload with no error), and confusion between two filter taxonomies (`FilterOption` for the sticky bar with 5 filterType variants vs `FilterConfigSection` for the section block with 3 variants). Both risks have clear prevention strategies: always update TypeScript type and Zod schema in the same commit, and build a dedicated `FilterBarEditor` that never touches `filter-config` section data. The build order is deterministic and dependency-verified — this is an extension of known patterns, not a new domain.

---

## Key Findings

### Recommended Stack

The base stack is unchanged and fully sufficient for v2.2. Two shadcn/ui component files need to be installed (`npx shadcn add tooltip` and `npx shadcn add sidebar`) — but their underlying Radix packages are already in `package.json`. The shadcn `sidebar` component is used only as a visual reference for compound widget patterns (workspace switcher, user menu); it must NOT be used as structural infrastructure in `WireframeViewer` due to CSS variable collision risk between `--sidebar-*` (shadcn) and `--wf-sidebar-*` (wireframe).

**Core technologies relevant to v2.2:**
- `shadcn/ui sidebar.tsx`: Compound widget visual reference (team-switcher, nav-user patterns) — install as component file, use as visual reference only
- `shadcn/ui tooltip.tsx`: Required internally by sidebar for collapsed-state icon labels — wrapper file missing, Radix package already installed
- `Zod 4.3.6`: Discriminated union for `SidebarWidget` type narrowing — no upgrade needed
- `@dnd-kit/sortable`: Filter option reordering in editor — already installed and used in `BlueprintRenderer`
- `@radix-ui/react-switch`: Boolean toggles in header and sidebar config panels — already installed

**Explicitly rejected additions:** `cookies-next` (Next.js only), `react-beautiful-dnd` (archived), shadcn Sidebar as app shell infrastructure, Recharts 3.x, React 19, Tailwind v4 — all explicitly deferred per `PROJECT.md`.

### Expected Features

**Must have (table stakes — v2.2 core):**
- Wire `showPeriodSelector`, `showUserIndicator`, `actions.*` in `WireframeHeader` render — prerequisite for header editor to have any visible effect; these fields exist in schema but are ignored by the component
- `updateWorkingDashboard()` helper for config-root mutations — prerequisite for sidebar and header panels to commit changes
- Header Config Panel (Sheet, boolean toggles for all `HeaderConfig` fields) — opened from AdminToolbar in edit mode
- Sidebar Config Panel (Sheet, groups editor + footer text field + widget list manager) — opened from AdminToolbar in edit mode
- Filter Bar Editor Panel (Sheet, add/remove/configure `FilterOption[]` per screen) — opened via AdminToolbar "Filtros" button
- `SidebarConfig` schema extension: `widgets?: SidebarWidget[]` (Zod + TypeScript, additive, backward-compatible)
- Workspace Switcher widget renderer in sidebar header zone (decorative dropdown chip)
- User Menu widget renderer in sidebar footer zone (avatar + name/role, replaces status chip as a toggle option)

**Should have (differentiators — v2.2 polish):**
- Search widget in sidebar nav area (decorative disabled input, `showSearch: boolean`)
- Account Selector widget in sidebar header (secondary slot below workspace switcher)
- Filter "add from library" presets (hardcoded `FilterOption` templates: Período, Empresa, Produto, Status, Responsável)
- Header `brandLabel` override field in Header Config Panel
- Explicit AdminToolbar "Layout" button group (Sidebar, Header, Filtros) visible only in edit mode

**Defer to v2.3+:**
- Header `periodType` at dashboard level
- Sidebar icon assignment via config panel (currently only via ScreenManager per-screen)
- Sidebar badge count configuration per screen
- Mobile sidebar drawer mode (explicitly out of scope per `PROJECT.md`)

**Anti-features (do not build):**
- Drag-and-drop screens between sidebar groups — DnD context conflict with ScreenManager's existing sortable context
- Replace custom WireframeViewer sidebar with shadcn `SidebarProvider` — breaking layout restructure with CSS var collision
- Per-screen header config overrides — scope creep; header is intentionally global chrome
- Live filter logic dispatching across 28 section types — product-level scope, not wireframe tool scope

### Architecture Approach

`WireframeViewer.tsx` remains the single state orchestrator. The critical addition is `openPanel: 'sidebar' | 'header' | 'filter' | null` exclusive panel state, plus three new panel components rendered as sibling Sheets alongside the existing `PropertyPanel`. Layout widgets (sidebar compound components) get their own `SIDEBAR_WIDGET_REGISTRY` separate from `SECTION_REGISTRY` — correct taxonomy separation since widgets are layout-level concerns, not content-row elements. All mutations flow through `workingConfig` to a single `handleSave` / `saveBlueprint` call site — no parallel save paths.

**Major components — new and modified:**
1. `WireframeViewer.tsx` (MODIFY) — `openPanel` state, `updateWorkingDashboard` helper, sidebar widget zones, full `HeaderConfig` prop pass-through
2. `WireframeHeader.tsx` (MODIFY) — consume all `HeaderConfig` fields (currently only `showLogo` is wired)
3. `AdminToolbar.tsx` (MODIFY) — "Layout" button group (Sidebar, Header, Filtros) in edit mode
4. `editor/HeaderConfigPanel.tsx` (NEW) — Sheet with boolean toggles for all `HeaderConfig` fields
5. `editor/SidebarConfigPanel.tsx` (NEW) — Sheet with groups editor, footer input, widget list manager
6. `editor/FilterBarEditor.tsx` (NEW) — Sheet with `FilterOption[]` CRUD for the active screen
7. `editor/SidebarWidgetPicker.tsx` (NEW) — widget type picker sub-component inside `SidebarConfigPanel`
8. `lib/sidebar-widget-registry.tsx` (NEW) — `SIDEBAR_WIDGET_REGISTRY` with renderer + defaultProps per widget type
9. `components/sidebar-widgets/` (NEW FOLDER) — four widget renderer components (WorkspaceSwitcher, AccountSelector, UserMenu, Search)
10. `types/blueprint.ts` + `lib/blueprint-schema.ts` (MODIFY) — `SidebarWidget` type, `SidebarWidgetSchema`, extended `SidebarConfig`

### Critical Pitfalls

1. **FilterType enum divergence** — `FilterOptionSchema` (screen-level sticky bar) has 5 filterType variants; `FilterConfigSectionSchema` (section block) has 3. Never reuse `FilterConfigForm.tsx` for the screen-level filter bar. Build a dedicated `FilterBarEditor` targeting `screen.filters[]` (5-variant set) exclusively.

2. **WireframeSidebar.tsx is a ghost component** — `WireframeSidebar.tsx` exists but is never imported by `WireframeViewer`. All sidebar widget work must be done in the inline `<aside>` block in `WireframeViewer.tsx` (lines 764–944). Widget code added to `WireframeSidebar.tsx` has zero effect on the actual viewer.

3. **Zod silent stripping of new sidebar fields** — `SidebarConfigSchema` lacks `.passthrough()`. New widget fields not added to Zod are silently stripped on save — no error, data disappears on reload. Always update `types/blueprint.ts` AND `lib/blueprint-schema.ts` in the same commit. Add `.passthrough()` to `SidebarConfigSchema`.

4. **Header props are schema-present but render-absent** — `showPeriodSelector`, `showUserIndicator`, `actions.*` exist in `HeaderConfig` schema but `WireframeHeader.tsx` ignores them (only `showLogo` is consumed). Wire the render before building the header editor panel or the panel will produce no visible effect — a misleading "done" state.

5. **No mutation helpers for dashboard-level config** — `updateWorkingScreen` exists but sidebar/header mutations need a new `updateWorkingDashboard(key, value)` helper. Using `handlePropertyChange` for dashboard-level edits will no-op or silently corrupt screen data.

6. **Schema version risk** — `CURRENT_SCHEMA_VERSION = 1`. All new fields must be `.optional()`. Run `BlueprintConfigSchema.safeParse` against the actual stored `financeiro-conta-azul` blueprint JSON before any schema change is merged. A non-optional field on an existing blueprint causes `loadBlueprint` to return `null` for every client.

---

## Implications for Roadmap

The build order is deterministic and dependency-driven. Schema must precede render; render must precede editor; prerequisite helpers must precede panels. All 7 phases follow the dependency chain directly.

### Phase 1: Schema Foundation

**Rationale:** All subsequent phases depend on TypeScript types and Zod schemas being in sync. `SidebarWidget` type and `SidebarConfigSchema` update cannot happen after components try to use them. This is the hardest dependency in the chain — nothing compiles correctly without it.
**Delivers:** `SidebarWidget`, `SidebarWidgetType` types in `blueprint.ts`; `SidebarConfigSchema` updated with `SidebarWidgetSchema` discriminated union and `.passthrough()`; `tsc --noEmit` at zero errors; round-trip test confirming new fields survive `BlueprintConfigSchema.parse()`.
**Addresses:** Schema extension prerequisite for all other phases
**Avoids:** Pitfalls 3 (Zod stripping) and 6 (schema version risk)

### Phase 2: Header Render Wiring

**Rationale:** `showPeriodSelector`, `showUserIndicator`, and `actions.*` are dead schema — they exist but `WireframeHeader` ignores them. Building the header editor before this wiring produces a panel with no visible effect. This phase is low-effort (3-4 prop additions + conditional renders) with high payoff and zero risk of regression when fields are undefined.
**Delivers:** `WireframeHeader.tsx` accepting and conditionally rendering all `HeaderConfig` fields; `WireframeViewer.tsx` passing full `activeConfig.header` as props; browser visual regression test confirming existing render is unchanged when fields are undefined.
**Addresses:** Table stakes prerequisite — render before editor
**Avoids:** Pitfall 4 (header render-absent)

### Phase 3: Dashboard Mutation Infrastructure + Editor Entry Points

**Rationale:** `updateWorkingDashboard` helper and `openPanel` exclusive state must exist before any layout config panel can commit changes. AdminToolbar Layout button group provides the UX surface. These are isolated changes but are hard blockers for all panel phases.
**Delivers:** `updateWorkingDashboard<K extends 'sidebar' | 'header'>` helper in `WireframeViewer`; `openPanel: 'sidebar' | 'header' | 'filter' | null` state; AdminToolbar "Layout" button group visible only in edit mode; `onOpenSidebarPanel`, `onOpenHeaderPanel`, `onOpenFilterPanel` callbacks wired to Viewer.
**Addresses:** Table stakes prerequisite — mutation helpers and entry points before panels
**Avoids:** Pitfall 5 (wrong mutation helper for dashboard-level edits)

### Phase 4: Header Config Panel

**Rationale:** Simplest editor panel — boolean toggles only, no CRUD lists. With render wiring done in Phase 2 and mutation infrastructure in Phase 3, this phase is a straightforward form composition. Good confidence-building phase before the more complex sidebar and filter panels.
**Delivers:** `editor/HeaderConfigPanel.tsx` Sheet with Switch toggles for `showLogo`, `showPeriodSelector`, `showUserIndicator`, `actions.manage/share/export`; wired to `updateWorkingDashboard('header', ...)` on change; opened from AdminToolbar.
**Uses:** `switch.tsx` (already installed), existing Sheet pattern as established by 28 section property forms
**Avoids:** Pitfall 4 (header toggles would have no visual effect without Phase 2)

### Phase 5: Sidebar Widget Renderers

**Rationale:** Widget rendering must exist before the sidebar config panel can show meaningful visual feedback. Building renderers first validates the `SIDEBAR_WIDGET_REGISTRY` pattern and confirms the inline sidebar widget zones in `WireframeViewer` work correctly before an editor surface can add or remove widgets.
**Delivers:** `lib/sidebar-widget-registry.tsx` with 4 widget type registrations; `components/sidebar-widgets/` with WorkspaceSwitcherWidget, UserMenuWidget, SearchWidget, AccountSelectorWidget; top/bottom widget zones added to WireframeViewer inline `<aside>`; collapsed icon-only rendering per widget when sidebar is in rail mode.
**Uses:** `SidebarWidget` type from Phase 1; `SIDEBAR_WIDGET_REGISTRY` separate from `SECTION_REGISTRY`
**Avoids:** Pitfall 2 (widget code in `WireframeSidebar.tsx` ghost component — all work in inline `<aside>`)

### Phase 6: Sidebar Config Panel

**Rationale:** With schema (Phase 1), mutation helpers (Phase 3), and widget renderers (Phase 5) complete, the sidebar editor panel has immediate visual feedback. This is the most complex editor panel in the milestone due to group CRUD + screen assignment + widget list management.
**Delivers:** `editor/SidebarConfigPanel.tsx` Sheet with footer text input, group create/rename/delete with screen assignment (checkbox per screen), widget list manager (add/remove via type picker); `editor/SidebarWidgetPicker.tsx` sub-component; all changes routed through `updateWorkingDashboard('sidebar', ...)`.
**Implements:** SidebarConfigPanel, SidebarWidgetPicker architecture components
**Avoids:** Pitfall 3 (Zod stripping — schema already updated in Phase 1 with `.passthrough()`)

### Phase 7: Filter Bar Editor

**Rationale:** Filter bar editing targets `screen.filters[]` via the existing `updateWorkingScreen` — entirely independent from the dashboard-level mutation path. Isolated by design, can run after Phase 3 (entry point) without depending on Phases 4-6. The filterType taxonomy risk must be addressed here with a purpose-built `FilterBarEditor` that never touches `filter-config` section data.
**Delivers:** `editor/FilterBarEditor.tsx` Sheet with `FilterOption[]` CRUD for the active screen (add/remove rows, label input, filterType select covering all 5 variants, options configuration); "add from library" presets; wired to `updateWorkingScreen(s => ({ ...s, filters }))` exclusively.
**Uses:** `FilterOptionSchema` 5-variant filterType set; `@dnd-kit/sortable` for filter reorder if needed
**Avoids:** Pitfall 1 (FilterType enum divergence — dedicated form for screen-level path only)

### Phase Ordering Rationale

- Schema first: Phase 1 is a hard dependency for all subsequent phases. No component can import `SidebarWidget` type or validate `SidebarWidget` objects before it.
- Render before editor: Phase 2 must precede Phase 4. Building a settings panel for a field that the component ignores is the single most common mistake in this domain.
- Infrastructure before panels: Phase 3 (mutation helpers + entry points) must precede Phases 4, 6, and 7. Panel forms without a mutation path do nothing.
- Renderers before panel: Phase 5 (widget renderers) before Phase 6 (sidebar config panel) enables immediate visual validation of widget add/remove during development.
- Filter bar is independent: Phase 7 depends only on Phase 3 (entry point) and uses `updateWorkingScreen` — it can be parallelized with Phases 4-6 if needed.

### Research Flags

Phases with standard patterns — skip additional research during planning:
- **Phase 1 (Schema):** Standard Zod extension + TypeScript type addition. Fully analyzed, implementation is mechanical.
- **Phase 2 (Header render):** 3-4 prop additions + conditional renders in a single component. Fully analyzed.
- **Phase 3 (Mutation infrastructure):** Copy of existing `updateWorkingScreen` pattern. No unknowns.
- **Phase 4 (Header Config Panel):** Established Sheet + Switch toggle form pattern; 28 existing section forms as reference.
- **Phase 7 (Filter Bar Editor):** Data path fully analyzed; `FilterOptionSchema` verified; `FilterConfigForm` identified as negative reference (do not reuse).

Phases that may benefit from brief planning review:
- **Phase 5 (Sidebar Widget Renderers):** Widget collapsed/expanded rendering in rail mode has UX nuance. Review shadcn sidebar-07 visual reference before deciding collapsed icon treatment per widget type.
- **Phase 6 (Sidebar Config Panel):** Group-to-screen assignment UX (radio buttons per screen vs checkboxes per group) needs a design decision during phase planning. Recommendation: radio buttons to enforce single-group membership structurally.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified against live `package.json`; Radix versions confirmed; zero new npm packages needed; two shadcn component file paths verified |
| Features | HIGH | Table stakes derived from direct schema and component analysis; UX conventions (widget collapsed states, group assignment UX) rated MEDIUM |
| Architecture | HIGH | All findings from direct source analysis: `blueprint-schema.ts`, `types/blueprint.ts`, `WireframeViewer.tsx` line numbers cited; `SIDEBAR_WIDGET_REGISTRY` pattern derived from existing `SECTION_REGISTRY` precedent |
| Pitfalls | HIGH | All 7 pitfalls identified from live codebase gaps with specific file/line references; warning signs and recovery steps concrete; Zod stripping confirmed by direct `blueprint-store.ts` read |

**Overall confidence:** HIGH

### Gaps to Address

- **Sidebar collapsed icon rendering per widget type:** The collapsed sidebar rail renders screen items as icon-only buttons. Exactly which icon represents each widget type (workspace switcher, user menu, search, account selector) in the collapsed state is not specified. Recommend resolving during Phase 5 planning — use the widget's registered `icon` from `SIDEBAR_WIDGET_REGISTRY` (e.g., `LayoutGrid` for workspace switcher, `CircleUser` for user menu, `Search` for search, `Building2` for account selector).

- **Group-to-screen assignment interaction in Sidebar Config Panel:** A screen can currently be in at most one group. The interaction model for assigning/unassigning screens to groups needs a design decision before Phase 6 implementation: radio buttons per screen (enforces single-group), or checkboxes per group (allows multi-group assignment). Single-group is the current schema behavior; recommend radio buttons.

- **`partitionScreensByGroups` called twice per render (minor performance):** PITFALLS.md flags this (WireframeViewer lines 897–898) — doubled computation on every re-render. Not a v2.2 blocker at current blueprint scale, but should be noted as a quick-win cleanup opportunity.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `tools/wireframe-builder/types/blueprint.ts` — `SidebarConfig`, `HeaderConfig`, `FilterOption`, `BlueprintScreen` types (direct read)
- `tools/wireframe-builder/lib/blueprint-schema.ts` — Zod schemas, `.passthrough()` on `HeaderConfigSchema` only, 3-variant vs 5-variant filterType divergence (direct read)
- `src/pages/clients/WireframeViewer.tsx` — inline sidebar block lines 764–944, `updateWorkingScreen` pattern, `WireframeHeader` call site lines 957–961 (direct read)
- `tools/wireframe-builder/components/WireframeHeader.tsx` — confirmed only `showLogo` consumed; remaining `HeaderConfig` fields absent from props (direct read)
- `tools/wireframe-builder/lib/blueprint-store.ts` — `BlueprintConfigSchema.parse()` strips unknown fields; `safeParse` failure returns `null` (direct read)
- `tools/wireframe-builder/lib/blueprint-migrations.ts` — `CURRENT_SCHEMA_VERSION = 1`, single `v0 → v1` migrator (direct read)
- `package.json` — all Radix packages confirmed present, zero new npm packages needed (direct read)
- `src/components/ui/` directory listing — `tooltip.tsx` confirmed absent, `sheet.tsx` confirmed present (direct ls)
- `tools/wireframe-builder/components/editor/PropertyPanel.tsx` — Sheet pattern for section property panels (direct read)
- `tools/wireframe-builder/components/editor/property-forms/FilterConfigForm.tsx` — operates on `FilterConfigSection.filters[]`, 3-variant filterType (direct read)

### Secondary (MEDIUM confidence)
- [shadcn/ui Sidebar blocks — sidebar-07](https://ui.shadcn.com/blocks/sidebar) — team-switcher and nav-user compound widget visual patterns as reference
- [shadcn/ui Sidebar docs](https://ui.shadcn.com/docs/components/sidebar) — SidebarProvider, useSidebar hook structure
- [Achromatic: Using the new Shadcn Sidebar](https://www.achromatic.dev/blog/shadcn-sidebar) — no `cookies-next` for Vite, internal deps confirmed against installed packages
- [shadcn/ui Sidebar Vite issue #7696](https://github.com/shadcn-ui/ui/issues/7696) — `class-variance-authority` import Vite gotcha (already resolved in project)
- `.planning/PROJECT.md` — v2.2 milestone goals, out-of-scope constraints, existing validated requirements

---
*Research completed: 2026-03-13*
*Ready for roadmap: yes*
