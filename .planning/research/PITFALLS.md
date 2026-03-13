# Pitfalls Research

**Domain:** Configurable layout components in existing wireframe builder (sidebar widgets, header editor panels, filter bar editing)
**Researched:** 2026-03-13
**Confidence:** HIGH — based on direct codebase analysis of WireframeViewer.tsx, blueprint-schema.ts, types/blueprint.ts, WireframeSidebar.tsx, WireframeHeader.tsx, WireframeFilterBar.tsx, blueprint-store.ts, blueprint-migrations.ts, editor property-forms, and the FilterConfigRenderer/Form pair

---

## Critical Pitfalls

### Pitfall 1: FilterType Enum Divergence Between Schema Layers

**What goes wrong:**
`FilterConfigSectionSchema` (blueprint-schema.ts line 306) uses `filterType: z.enum(['period', 'select', 'date-range'])` — 3 variants. `FilterOptionSchema` (blueprint-schema.ts line 50), which drives `BlueprintScreen.filters[]` and `WireframeFilterBar`, uses `filterType: z.enum(['select', 'date-range', 'multi-select', 'search', 'toggle'])` — 5 variants. When building the sticky filter bar editor (edits `screen.filters[]`), these two enums look similar but serve different data paths. If a developer builds a property panel that lets users pick `multi-select` or `search` filter types, then accidentally writes the result into a `filter-config` section instead of `screen.filters[]`, Zod validation will reject the save. The error message mentions a path like `screens[0].sections[N].filters[0].filterType` — leading the developer to chase the wrong bug.

**Why it happens:**
Both schemas use the word "filter" and share the same field name `filterType`. `FilterOption` (component-level, used by WireframeFilterBar) and `filter-config` (a section block, used by FilterConfigRenderer) were built at different milestones for different purposes. The naming collision causes developers to conflate them, especially when building the filter bar editor for the first time.

**How to avoid:**
The sticky filter bar editor must operate exclusively on `screen.filters: FilterOption[]` using `FilterOptionSchema` (5-variant set). Never write filter bar edits into a `filter-config` section block. Any property panel for the filter bar must produce `FilterOption` objects (`key`, `label`, `options?`, `filterType` from the 5-variant set). The existing `FilterConfigForm.tsx` is for `filter-config` section blocks only — do not reuse it for the screen-level filter bar. Build a separate `FilterBarForm` or equivalent that knows it targets `screen.filters[]`.

**Warning signs:**
- A form allows picking `multi-select` or `search` but save fails with Zod error mentioning `filter-config.filters[N].filterType`
- The property panel in focus reads `section.type === 'filter-config'` when the goal is to edit the sticky filter bar
- `BlueprintConfigSchema.parse()` throwing on configs that contain valid `FilterOption` filterType values written to the wrong path

**Phase to address:**
Filter bar editor phase — the first task must be a comment or ADR clarifying which data path the editor targets.

---

### Pitfall 2: WireframeSidebar Component Is a Ghost — Sidebar Renders Inline in WireframeViewer

**What goes wrong:**
`WireframeSidebar.tsx` exists with a simple `screens: Screen[]` prop API. However, `WireframeViewer.tsx` renders the sidebar entirely inline (lines 764–944) with full logic: collapse state, icon rail, `partitionScreensByGroups()`, footer from `activeConfig.sidebar.footer`, and fixed positioning. `WireframeSidebar.tsx` is not imported anywhere in `WireframeViewer`. Any sidebar widget code (workspace switcher, account selector, user menu) built inside or against `WireframeSidebar.tsx` will have zero effect on the actual rendered viewer.

**Why it happens:**
`WireframeSidebar.tsx` was an early prototype. As the sidebar grew complex, it was implemented directly in `WireframeViewer` because the component's API was too limited. The file was never removed or deprecated, creating an apparent (but unused) implementation target.

**How to avoid:**
All sidebar widget additions must be made inside the inline sidebar block in `WireframeViewer.tsx` (lines 764–944). Before writing any sidebar widget code, confirm the rendering site by checking what `WireframeViewer` actually renders. If the inline sidebar block is extracted to a `WireframeViewerSidebar` component during this milestone, that extraction must happen as its own discrete step before any widget additions — not interwoven with them.

**Warning signs:**
- `WireframeSidebar` import appears in `WireframeViewer.tsx` (it is currently absent — any new import is a red flag)
- A sidebar widget renders correctly in isolation (Storybook / component gallery) but never appears in the wireframe viewer
- New props added to `WireframeSidebar.tsx` that `WireframeViewer` never passes

**Phase to address:**
Sidebar widgets phase, day one — audit the rendering site before writing a single line of widget code.

---

### Pitfall 3: No Mutation Helpers Exist for Dashboard-Level Config (sidebar, header)

**What goes wrong:**
All existing edit-mode mutation helpers in `WireframeViewer` (`updateWorkingScreen`, `handlePropertyChange`, `handleAddSection`, `handleReorderRows`, etc.) operate on `workingConfig.screens[safeActiveIndex]`. There are zero helpers for mutating `workingConfig.sidebar` or `workingConfig.header`. When adding sidebar and header property panels, the developer must either (a) build new mutation helpers that touch the top-level config, or (b) misuse `updateWorkingScreen` / `handlePropertyChange` for top-level mutations — which will target the wrong path and no-op or corrupt screen data.

**Why it happens:**
The editor was built exclusively for section-level editing. Dashboard-level config (`sidebar`, `header`) was added to the BlueprintConfig schema in v1.3 but no editor UI or mutation path was wired up — those fields are schema-present but editor-absent.

**How to avoid:**
Add dedicated helpers before building any property panels:

```typescript
function updateWorkingConfig(updater: (config: BlueprintConfig) => BlueprintConfig) {
  setWorkingConfig((prev) => {
    if (!prev) return prev
    return updater(prev)
  })
  setEditMode((prev) => ({ ...prev, dirty: true }))
}

function updateWorkingSidebar(patch: Partial<SidebarConfig>) {
  updateWorkingConfig((cfg) => ({ ...cfg, sidebar: { ...cfg.sidebar, ...patch } }))
}

function updateWorkingHeader(patch: Partial<HeaderConfig>) {
  updateWorkingConfig((cfg) => ({ ...cfg, header: { ...cfg.header, ...patch } }))
}
```

Follow the same pattern as `updateWorkingScreen`: functional update, always sets `dirty: true`.

**Warning signs:**
- A sidebar property panel that calls `handlePropertyChange` — that function expects `editMode.selectedSection.rowIndex/cellIndex` and will no-op or throw for dashboard-level changes
- `dirty` flag not set after a sidebar/header edit
- Config saved to Supabase shows `sidebar: undefined` or `header: undefined` despite edits

**Phase to address:**
Header editor phase and sidebar editor phase — add the missing mutation helpers as the first task, before building any property panels.

---

### Pitfall 4: Zod Schema Strips Unknown Fields Silently — New Config Fields Lost on Save

**What goes wrong:**
`saveBlueprint` calls `BlueprintConfigSchema.parse(config)` (blueprint-store.ts line 85) before writing to Supabase. Zod strips unknown keys by default. `HeaderConfigSchema` has `.passthrough()` to preserve forward-compat fields (line 76 of blueprint-schema.ts), but `SidebarConfigSchema` does not. If any new sidebar widget field (e.g., `widgets`, `showSearch`, `showWorkspaceSwitcher`) is added to the `SidebarConfig` TypeScript type but not to `SidebarConfigSchema`, the field will be silently stripped during save — the user configures the sidebar, clicks Salvar, and the data disappears on the next page load.

**Why it happens:**
`types/blueprint.ts` (TypeScript types) and `lib/blueprint-schema.ts` (Zod validation) are maintained separately. It is easy to update the TypeScript type for autocomplete and forget to update the Zod schema. Zod strips silently — there is no warning, no error, and the save returns `{ success: true }`.

**How to avoid:**
Every new field added to `SidebarConfig`, `HeaderConfig`, or any nested config type must be added to both `types/blueprint.ts` and `lib/blueprint-schema.ts` in the same commit. Use a task checklist: "Updated TypeScript type? Updated Zod schema? Added round-trip test?". If adding optional dashboard-level config fields that may grow, add `.passthrough()` to `SidebarConfigSchema`. Write a test in `blueprint-schema.test.ts` that round-trips the new field: `expect(BlueprintConfigSchema.parse({ ...config, sidebar: { footer: 'v1', widgets: [...] } })).toMatchObject({ sidebar: { widgets: [...] } })`.

**Warning signs:**
- New sidebar widget config saves successfully (no error, no toast) but fields are `undefined` after reload
- `console.log(validated)` inside `saveBlueprint` shows missing fields that existed in the input `config` argument
- A TypeScript type has a field with no corresponding Zod schema entry

**Phase to address:**
Any phase that extends the schema. Run `blueprint-schema.test.ts` after every schema change before considering the phase complete.

---

### Pitfall 5: Header Props Are Schema-Present But Render-Absent in WireframeHeader

**What goes wrong:**
`HeaderConfig` has `showPeriodSelector`, `showUserIndicator`, and `actions.{manage, share, export}` in both the TypeScript type and the Zod schema. However, `WireframeHeader.tsx` currently only reads `showLogo` from props. `showPeriodSelector`, `showUserIndicator`, and all `actions.*` fields are passed through to `WireframeViewer` and read from `activeConfig.header`, but `WireframeViewer` passes only `showLogo` to `WireframeHeader` (line 958–961). If a header property panel is built that lets operators toggle `showPeriodSelector: false`, the change will persist to Supabase correctly — but nothing will change visually, because the header never reads that field.

**Why it happens:**
`SidebarConfig` and `HeaderConfig` were added to the schema as stubs in v1.3 with the intent of wiring them up in a future milestone. The schema was designed ahead of the render implementation. The fields are present in the data layer but the presentation layer has not caught up.

**How to avoid:**
Before building the header property panel, wire up all header fields in `WireframeHeader.tsx`. Specifically:
- `showPeriodSelector` should show/hide the period selector in the center column
- `showUserIndicator` should show/hide the user chip on the right
- `actions.manage` / `actions.share` / `actions.export` should show/hide the corresponding action buttons

Only after the render is wired should a property panel be built — otherwise the header editor "works" but has no visible effect, which is misleading.

**Warning signs:**
- A header property panel ships but toggling `showPeriodSelector` produces no visual change
- `WireframeHeader` props only include `title`, `logoUrl`, `brandLabel`, `showLogo` — the other HeaderConfig fields are never passed as props
- Header editor is "completed" without a browser visual test confirming each toggle affects the render

**Phase to address:**
Header editor phase — wire render before building the editor.

---

### Pitfall 6: Schema Version Not Bumped for Structurally Breaking Changes

**What goes wrong:**
`CURRENT_SCHEMA_VERSION = 1` (blueprint-migrations.ts). The migration chain has a single `v0 → v1` migrator. If new sidebar widget fields are added as non-optional (`z.string()` instead of `z.string().optional()`), all existing blueprints stored in Supabase — including the pilot `financeiro-conta-azul` — will fail `BlueprintConfigSchema.safeParse()` on load. `loadBlueprint` returns `null` when safeParse fails (line 67–69 of blueprint-store.ts). The wireframe viewer shows "Nenhum blueprint encontrado para este cliente" for every existing client immediately after the change is deployed.

**Why it happens:**
Adding schema fields feels like a safe additive change. The risk is invisible until the stored record is validated against the new schema. There is no CI test that validates the actual stored blueprint shape against the schema before deployment.

**How to avoid:**
Two rules:
1. Every new schema field must be `.optional()` unless a migrator is written and `CURRENT_SCHEMA_VERSION` is bumped.
2. Before merging any schema change, run `BlueprintConfigSchema.safeParse(existingBlueprint)` against the actual shape of the stored `financeiro-conta-azul` blueprint. The easiest way: copy the stored JSON from Supabase and add a test case in `blueprint-schema.test.ts`.

**Warning signs:**
- `loadBlueprint` returning `null` for `financeiro-conta-azul` after a schema change
- Zod error messages mentioning a new field as `Required` at a path in a stored config
- `blueprint-schema.test.ts` passes on newly constructed test objects but no test covers the stored shape

**Phase to address:**
Any phase that extends `BlueprintConfigSchema`, `SidebarConfigSchema`, or `HeaderConfigSchema`.

---

### Pitfall 7: Filter Bar Sticky Positioning Broken by Container Overflow Changes

**What goes wrong:**
`WireframeFilterBar` uses `position: sticky, top: 0, zIndex: 9` to stick inside the scrolling area. Its `top: 0` is relative to the nearest ancestor with `overflow-y: auto` — currently the `<div style={{ flex: 1, overflowY: 'auto', padding: '12px 32px 32px' }}` wrapping `BlueprintRenderer` in `WireframeViewer` (line 984–986). If the filter bar editor adds a new wrapping element around `BlueprintRenderer` (e.g., a container div for the editor overlay, a panel wrapper), and that wrapper has any `overflow` property set, the sticky context breaks: the filter bar either stops sticking or sticks to the wrong ancestor.

**Why it happens:**
CSS sticky positioning is context-sensitive. Any intermediate `overflow` value (including `overflow: hidden` set as part of a layout fix) creates a new scroll container, invalidating the sticky behavior of descendants. This is a known CSS gotcha that is easy to introduce accidentally when adding layout chrome.

**How to avoid:**
When adding editor overlay elements around `BlueprintRenderer`, verify that no new ancestor gains `overflow: hidden`, `overflow: auto`, or `overflow: scroll`. If an editor panel wrapper is needed, use `position: absolute` or `position: fixed` layering rather than a block-level wrapper with overflow. After any layout change, test the filter bar by scrolling the content area and confirming the bar sticks.

**Warning signs:**
- Filter bar scrolls away with content after adding a wrapper element
- `position: sticky` visually stops working after a layout change
- A wrapper element has `overflow: hidden` added as part of a layout constraint fix

**Phase to address:**
Filter bar editor phase — after any layout changes, visual sticky test before considering the phase done.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Updating TypeScript type for new sidebar field but not Zod schema | Autocomplete works, no tsc errors | Zod strips the field on save; silent data loss; discovered only after a reload | Never — always update both files in the same commit |
| Reusing `FilterConfigForm` for the screen-level filter bar editor | Single form, less code | filterType enums diverge; users can set invalid filterType values; Zod rejects the save | Never — these are distinct data paths, build a separate form |
| Sidebar widget state kept in local component state (not in workingConfig) | Faster to build | Widget config lost on screen navigation or page reload; not persisted to Supabase | Never — all persistent widget config must round-trip through workingConfig → save → load |
| Adding sidebar widget rendering inline to WireframeViewer without extracting to a component | Avoids refactor complexity | WireframeViewer grows past 1200 LOC; sidebar logic is impossible to test in isolation | Acceptable for v2.2 if scope is limited; plan extraction in next milestone |
| Not wiring header fields to render before building header property panel | Editor ships faster | Header property panel "works" but produces no visible change; misleading to operators | Never — wire render before building editor |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase blueprint save | New TypeScript type field not in Zod schema; Zod strips it silently | Update both `types/blueprint.ts` and `lib/blueprint-schema.ts` in same commit; add round-trip test |
| Optimistic locking | Adding a secondary "save sidebar" button that calls `saveBlueprint` independently | All edits flow into `workingConfig` via mutation helpers; single AdminToolbar save button |
| WireframeHeader | Assuming `showPeriodSelector`, `showUserIndicator`, `actions.*` are wired to render | They are not — only `showLogo` is read; wire the remaining fields before building the header editor |
| FilterOption vs FilterConfigSection | Building the sticky filter bar editor using `FilterConfigForm` or targeting `filter-config` section | Screen-level filter bar edits `screen.filters[]` (FilterOption type, 5-variant filterType); section-level `filter-config` blocks are separate |
| Zod schema + .passthrough() | Forgetting `.passthrough()` on new schema objects for forward-compat | `HeaderConfigSchema` already uses `.passthrough()`; add it to `SidebarConfigSchema` if new widget fields may grow beyond v2.2 |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `partitionScreensByGroups` called twice per render | Doubled computation on every re-render | Call once, store in a local const; memoize with `useMemo` | Already present at WireframeViewer lines 897–898; visible above ~20 screens |
| Full `structuredClone(config)` on every `workingConfig` mutation | Slow edit mode with large blueprints | Accept for v2.2 (blueprint is small); plan for incremental patch approach if blueprints grow | Noticeable above ~50 screens with deep section data |
| Sidebar widget with per-widget local state that resets on screen navigation | Widget config disappears when user navigates between screens | Lift widget state into `workingConfig.sidebar` or `WireframeViewer` state; never keep persistent config in component-local `useState` | Immediately visible on first screen navigation after configuring a widget |
| Filter bar editor opening a PropertyPanel drawer for a non-section entity | Right-sheet panel appears, user configures filter bar, PropertyPanel's `section` prop is null causing the form to render nothing | Render filter bar editor through a dedicated panel component, not through `PropertyPanel` which expects a `BlueprintSection | null` | Immediately visible — PropertyPanel only renders when `section` is non-null |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Filter bar not selectable in edit mode (no EditableSectionWrapper around it) | Operator in edit mode cannot click the filter bar to open an editor | Add an explicit "Edit Filter Bar" affordance in edit mode — either a click target on the filter bar itself, or a dedicated button in AdminToolbar |
| Sidebar editor opening in the right-side PropertyPanel drawer | Spatial dissonance — user edits left sidebar from a right panel | Prefer inline sidebar editing or a top/centered modal for sidebar config; right-sheet works for section properties that appear in the main content area |
| Saving a header change also discards unsaved section property panel edits | User thinks they only toggled `showLogo` but any section panel edits are bundled into the same save | This is actually correct behavior with the single-save pattern; becomes a problem only if parallel save paths are introduced |
| Sidebar footer hardcoded to "Desenvolvido por FXL" when `sidebar.footer` is undefined | Operators who want to customize the footer text have no editor for it | Include `footer` text field in the sidebar config editor; it is already read from `activeConfig.sidebar.footer` (line 939 of WireframeViewer) |

---

## "Looks Done But Isn't" Checklist

- [ ] **Header fields wired to render:** After header editor phase, toggle each field (`showPeriodSelector: false`, `showUserIndicator: false`, `actions.export: true`) and confirm the change is visible in `WireframeHeader` in the browser — not just stored in the schema.
- [ ] **Sidebar footer editable:** A sidebar config editor that omits the `footer` field will leave it permanently showing the hardcoded fallback. Verify `footer` is included in the sidebar editor form.
- [ ] **FilterOption round-trip through Zod:** After saving a screen with `filterType: 'multi-select'` in `screen.filters[]`, reload the page and confirm the filter bar still shows the multi-select control. Silent Zod stripping is invisible until reload.
- [ ] **Sidebar groups editor affects render:** If a sidebar groups editor writes to `workingConfig.sidebar.groups`, reload and confirm `partitionScreensByGroups` renders the correct group headings and screen assignments.
- [ ] **WireframeSidebar.tsx not confused with inline sidebar:** After the sidebar widgets phase, search for any new imports of `WireframeSidebar` in `WireframeViewer.tsx` — there must be none.
- [ ] **Schema migration coverage:** After any `BlueprintConfigSchema` change, run `blueprint-schema.test.ts` with the actual stored `financeiro-conta-azul` blueprint shape as a test case. The parse must succeed without a migration.
- [ ] **Filter bar editor targets `screen.filters[]`:** After implementing the filter bar editor, inspect `workingConfig.screens[0].filters` in React DevTools — must show updated `FilterOption[]`, not updated `BlueprintSection[]`.
- [ ] **No new parallel save paths:** After all editor phases, search for `saveBlueprint` call sites in the codebase — must be exactly one call site in `WireframeViewer.handleSave`.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Zod strips new sidebar widget fields on save | HIGH | Add field to `SidebarConfigSchema` with `.optional()`; re-enter data manually (no recovery from Supabase after a save stripped it) |
| Schema version not bumped — existing blueprints return null on load | MEDIUM | Add migrator `v1 → v2` that sets new fields to defaults; bump `CURRENT_SCHEMA_VERSION`; test against the stored `financeiro-conta-azul` shape |
| Sidebar widget code in `WireframeSidebar.tsx` (wrong rendering site) | LOW | Move code to the inline sidebar block in `WireframeViewer` or to an extracted component; no data impact |
| Parallel save path introduced — optimistic locking conflicts appear within same session | MEDIUM | Remove secondary save button; redirect all mutations through `workingConfig`; confirm single `saveBlueprint` call site |
| FilterType enum mismatch causes save failures for screen-level filters | MEDIUM | Confirm `FilterOptionSchema` already has the 5-variant set (it does); ensure filter bar editor writes to `screen.filters[]`, not `filter-config.filters[]` |
| Header props not wired to render — editor has no visible effect | LOW | Wire missing props in `WireframeHeader.tsx`; visual-only fix, no data migration needed |
| Sticky filter bar stops sticking after layout change | LOW | Remove `overflow` property from any new ancestor wrapper element; test sticky behavior in the scroll container |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| FilterType enum divergence | Filter bar editor phase | Save a `screen.filters[]` entry with `filterType: 'multi-select'`; confirm Zod accepts it and filter bar renders a multi-select control after reload |
| WireframeSidebar ghost component | Sidebar widgets phase — day one | Grep for `WireframeSidebar` imports in `WireframeViewer.tsx`; must be zero |
| Missing workingConfig mutation helpers | Header editor phase + sidebar editor phase | Trace an edit from property panel `onChange` through `updateWorkingSidebar` or `updateWorkingHeader` to `dirty: true` in React DevTools |
| Zod schema/TypeScript type divergence | Any schema extension phase | Round-trip test: config with new fields → `BlueprintConfigSchema.parse()` → confirm fields survive; run before and after each schema extension |
| Header fields dead (schema present, render absent) | Header editor phase | Browser visual test: set `showPeriodSelector: false`, reload, confirm period selector absent in `WireframeHeader` |
| Optimistic locking conflict from parallel saves | All editor phases | Single search for `saveBlueprint` call sites — exactly one must exist |
| Schema version not bumped for breaking changes | Any schema extension phase | Run `BlueprintConfigSchema.safeParse` against the stored `financeiro-conta-azul` JSON before and after each schema change |
| Filter bar sticky positioning broken | Filter bar editor phase | Scroll test in the main content area after any layout changes — confirm filter bar sticks at top |
| Filter bar editor targeting wrong data path | Filter bar editor phase | React DevTools inspection of `workingConfig.screens[0].filters` after using the editor — must show updated `FilterOption[]` |

---

## Sources

- Direct codebase analysis: `tools/wireframe-builder/lib/blueprint-schema.ts` — `FilterOptionSchema` (line 50, 5-variant filterType) vs `FilterConfigSectionSchema` (line 306, 3-variant filterType); `HeaderConfigSchema.passthrough()` (line 76); `SidebarConfigSchema` lacks passthrough
- Direct codebase analysis: `src/pages/clients/WireframeViewer.tsx` — sidebar rendered inline (lines 764–944); `WireframeSidebar` not imported; `WireframeHeader` called with only `title`, `logoUrl`, `showLogo` (lines 957–961); `partitionScreensByGroups` called twice in same render expression (lines 897–898); `saveBlueprint` called from a single site (`handleSave`)
- Direct codebase analysis: `tools/wireframe-builder/components/WireframeSidebar.tsx` — minimal 2-prop API (`screens`, `onSelect`), not used in viewer
- Direct codebase analysis: `tools/wireframe-builder/components/WireframeHeader.tsx` — only `showLogo` prop read; `showPeriodSelector`, `showUserIndicator`, `actions.*` absent from component props and render
- Direct codebase analysis: `tools/wireframe-builder/lib/blueprint-store.ts` — `BlueprintConfigSchema.parse(config)` (line 85) strips unknown fields; `safeParse` failure returns `null` (lines 67–69)
- Direct codebase analysis: `tools/wireframe-builder/lib/blueprint-migrations.ts` — `CURRENT_SCHEMA_VERSION = 1`, single `v0 → v1` migrator
- Direct codebase analysis: `tools/wireframe-builder/components/editor/PropertyPanel.tsx` — renders only when `section: BlueprintSection | null` is non-null; not suitable for non-section editors
- Direct codebase analysis: `tools/wireframe-builder/components/editor/property-forms/FilterConfigForm.tsx` — operates on `FilterConfigSection.filters[]` (3-variant filterType), separate from screen-level `FilterOption[]`
- Direct codebase analysis: `tools/wireframe-builder/components/BlueprintRenderer.tsx` — filter bar rendered via `WireframeFilterBar` before the row grid (lines 146–156); filter bar has no `EditableSectionWrapper` equivalent in edit mode

---
*Pitfalls research for: v2.2 — Configurable Layout Components (sidebar widgets, header editor, filter bar editing)*
*Researched: 2026-03-13*
