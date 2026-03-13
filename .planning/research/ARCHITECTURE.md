# Architecture Research

**Domain:** Configurable wireframe layout components — sidebar widgets, header config, filter bar editor
**Researched:** 2026-03-13
**Confidence:** HIGH (all findings derived from direct codebase analysis, not training data)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          WireframeViewer.tsx                             │
│  (orchestrator: BlueprintConfig state, editMode, workingConfig, save)    │
├───────────────────────────────┬─────────────────────────────────────────┤
│          AdminToolbar         │  edit mode toggle, save, branding, share │
├───────────────┬───────────────┴──────────────────────────┬──────────────┤
│  <aside>      │          <main>                          │  PropertyPanel│
│  sidebar      │  WireframeHeader      BlueprintRenderer  │  (Sheet right)│
│  (inline)     │  WireframeFilterBar   (per-screen rows)  │               │
│               │                                          │               │
│  ScreenManager│  FilterBar: activeScreen.filters[]       │  section forms│
│  (screens[])  │  Header: activeConfig.header (partial)   │  via registry │
└───────────────┴──────────────────────────────────────────┴──────────────┘
                              ↓
                   Supabase (blueprints table)
                   BlueprintConfig (Zod-validated JSONB)
```

### Component Responsibilities

| Component | Responsibility | Existing State |
|-----------|----------------|----------------|
| `WireframeViewer.tsx` | Orchestrates all state: config, editMode, workingConfig, save | Existing — central orchestrator |
| `AdminToolbar` | Edit mode toggle, save button, branding popover, share | Existing |
| `<aside>` (inline in Viewer) | Sidebar chrome, collapse, screen nav via ScreenManager | Existing (inline JSX, not WireframeSidebar.tsx) |
| `WireframeHeader` | Header chrome: logo, search (decorative), user chip | Existing — only consumes `showLogo` |
| `WireframeFilterBar` | Filter bar for active screen; driven by `activeScreen.filters` | Existing |
| `ScreenManager` | Screen list, add/delete/rename/reorder in edit mode | Existing |
| `PropertyPanel` | Right-side Sheet; delegates to per-type forms via section-registry | Existing |
| `SECTION_REGISTRY` | Single source of truth: renderer + propertyForm + schema + defaultProps per section type | Existing in `section-registry.tsx` |
| `BlueprintConfig` | Top-level schema: `sidebar?`, `header?`, `screens[]` | Existing |
| `SidebarConfig` | `footer?: string`, `groups?: SidebarGroup[]` | Existing — minimal |
| `HeaderConfig` | `showLogo`, `showPeriodSelector`, `showUserIndicator`, `actions.*` | Existing — schema only, not fully rendered |

## Critical Existing Gaps

These gaps are what v2.2 must close. Understanding them drives the build order.

### Gap 1: WireframeHeader only reads `showLogo`

`WireframeViewer.tsx` lines 957–961 pass only `logoUrl` and `showLogo` to `WireframeHeader`.
The `HeaderConfig` fields `showPeriodSelector`, `showUserIndicator`, and `actions.*` are stored in
the schema and in Supabase, but have zero effect on render. The period selector, user chip, and
action buttons are hardcoded in `WireframeHeader.tsx` — they never consult `config.header`.

### Gap 2: WireframeSidebar.tsx is an unused component

`WireframeSidebar.tsx` exists as a standalone preview component (used in ComponentGallery) but is
never imported by `WireframeViewer.tsx`. The actual sidebar in the Viewer is inline JSX. These
are two separate concerns and should remain separate.

### Gap 3: No editor entry points for sidebar, header, or filter

AdminToolbar has no buttons for "Edit Sidebar", "Edit Header", or "Edit Filtros". ScreenManager
is the only editor surface. `SidebarConfig` and `HeaderConfig` have no property panels and no
visual editor access.

### Gap 4: Filter editing is view-only

`WireframeFilterBar` renders `activeScreen.filters[]` correctly but there is no mechanism
to add, remove, or reconfigure `FilterOption` items through the visual editor.

### Gap 5: No widget concept in SidebarConfig

The v2.2 milestone targets compound widgets (workspace switcher, account selector, user menu)
in the sidebar. `SidebarConfig` today only has `footer` and `groups[]`. A typed `widgets[]`
array does not exist yet.

## Recommended Architecture for v2.2

### Data Model Changes

Three schema extensions are needed. All must be backward-compatible (optional fields only).

**1. SidebarConfig — add `widgets[]`**

```typescript
// tools/wireframe-builder/types/blueprint.ts

export type SidebarWidgetType =
  | 'workspace-switcher'
  | 'account-selector'
  | 'user-menu'
  | 'search'

export type SidebarWidget = {
  type: SidebarWidgetType
  position: 'top' | 'bottom'    // placement relative to nav items
  label?: string                  // display label override
  options?: string[]              // workspace names, account names, etc.
}

export type SidebarConfig = {
  footer?: string
  groups?: SidebarGroup[]
  widgets?: SidebarWidget[]       // NEW — compound widgets
}
```

The Zod schema in `blueprint-schema.ts` must mirror this with a new `SidebarWidgetSchema`
and update `SidebarConfigSchema`. The `HeaderConfigSchema` already uses `.passthrough()`
for forward-compat. Apply the same to `SidebarConfigSchema`.

**2. HeaderConfig — no new fields needed**

All needed fields already exist in the schema. The work is purely in the render layer
and property panel — `WireframeHeader` must consume all existing `HeaderConfig` fields.

**3. FilterOption — no new schema fields needed**

`FilterOption` already has `filterType` discriminator with five variants. The work is
a new editor UI surface to add/remove/edit `filters[]` per screen.

### Component Boundaries — New vs Modified

| Component | Action | Rationale |
|-----------|--------|-----------|
| `types/blueprint.ts` | MODIFY — add `SidebarWidget`, `SidebarWidgetType`, extend `SidebarConfig.widgets` | Schema source of truth |
| `lib/blueprint-schema.ts` | MODIFY — add `SidebarWidgetSchema`, update `SidebarConfigSchema` | Runtime Zod validation |
| `WireframeHeader.tsx` | MODIFY — accept and render all `HeaderConfig` fields | Close Gap 1 |
| `WireframeViewer.tsx` | MODIFY — pass full `HeaderConfig`; add `openPanel` state; add `updateWorkingDashboard` helper; render widget zones in sidebar | Close Gaps 1, 3, 5 |
| `AdminToolbar.tsx` | MODIFY — add "Layout" button group in edit mode: Sidebar, Header, Filtros buttons | Close Gap 3 |
| `editor/SidebarConfigPanel.tsx` | NEW — Sheet for editing `SidebarConfig` (groups, footer, widgets) | Gap 3 — sidebar editor |
| `editor/HeaderConfigPanel.tsx` | NEW — Sheet for editing `HeaderConfig` (boolean toggles, action flags) | Gap 3 — header editor |
| `editor/FilterBarEditor.tsx` | NEW — Sheet for editing `activeScreen.filters[]` (add/remove/reorder `FilterOption`) | Gap 4 — filter editor |
| `editor/SidebarWidgetPicker.tsx` | NEW — sub-component inside SidebarConfigPanel for adding widget types | Supports compound widgets |
| `lib/sidebar-widget-registry.tsx` | NEW — `SIDEBAR_WIDGET_REGISTRY` with renderer + defaultProps per widget type | Separate registry for layout widgets |
| `components/sidebar-widgets/` | NEW FOLDER — four widget renderer components | Render compound sidebar widgets |

### Editor Entry Point Pattern

AdminToolbar currently shows in edit mode: `Cores | Compartilhar | Comentarios | Theme | Salvar | Editar`.

In edit mode, add a "Layout" button group:

```
[Sidebar] [Header] [Filtros]   (visible only when editMode.active)
```

Each button sets `openPanel` state. Only one panel can be open at a time (exclusive).
`WireframeViewer` manages `openPanel: 'sidebar' | 'header' | 'filter' | null`.

AdminToolbar receives three new callbacks: `onOpenSidebarPanel`, `onOpenHeaderPanel`, `onOpenFilterPanel`.
This is consistent with how `onOpenShare` and `onOpenComments` already work — callbacks, not shared state.

### Property Panel Taxonomy

The existing `PropertyPanel` handles per-section editing via `SECTION_REGISTRY`. It is triggered by
selecting a section cell (rowIndex + cellIndex).

New layout panels are NOT section types. They edit dashboard-level config (`SidebarConfig`, `HeaderConfig`)
or screen-level config (`filters[]`). They must NOT go through `SECTION_REGISTRY`.

Use three separate Sheet components with their own forms:

```typescript
// In WireframeViewer.tsx render — outside WireframeThemeProvider, like PropertyPanel

<SidebarConfigPanel
  open={openPanel === 'sidebar'}
  config={workingConfig?.sidebar ?? {}}
  screens={screens}
  onChange={(updated) => updateWorkingDashboard('sidebar', updated)}
  onClose={() => setOpenPanel(null)}
/>

<HeaderConfigPanel
  open={openPanel === 'header'}
  config={workingConfig?.header ?? {}}
  onChange={(updated) => updateWorkingDashboard('header', updated)}
  onClose={() => setOpenPanel(null)}
/>

<FilterBarEditor
  open={openPanel === 'filter'}
  filters={activeScreen?.filters ?? []}
  onChange={(filters) => updateWorkingScreen(s => ({ ...s, filters }))}
  onClose={() => setOpenPanel(null)}
/>
```

### Widget Registry Pattern

Sidebar widgets are typed compound components — distinct from section types.
They do NOT go through `SECTION_REGISTRY` (which is for content sections inside screen rows).

A separate `SIDEBAR_WIDGET_REGISTRY` is appropriate:

```typescript
// tools/wireframe-builder/lib/sidebar-widget-registry.tsx

export type SidebarWidgetRendererProps = {
  widget: SidebarWidget
  collapsed: boolean
}

export type SidebarWidgetRegistration = {
  type: SidebarWidgetType
  label: string
  icon: ComponentType<{ className?: string }>
  renderer: ComponentType<SidebarWidgetRendererProps>
  defaultProps: () => SidebarWidget
}

export const SIDEBAR_WIDGET_REGISTRY: Record<
  SidebarWidgetType,
  SidebarWidgetRegistration
> = {
  'workspace-switcher': { ... },
  'account-selector': { ... },
  'user-menu': { ... },
  'search': { ... },
}
```

Widget renderers live in `tools/wireframe-builder/components/sidebar-widgets/`.
In collapsed rail mode, each widget renders as an icon-only button — the `collapsed` prop
controls this condensed rendering, matching the existing collapsed icon behavior of screen items.

### Data Flow for Layout Config Edits

```
[AdminToolbar "Sidebar" / "Header" / "Filtros" button click]
         ↓
[WireframeViewer: setOpenPanel('sidebar' | 'header' | 'filter')]
         ↓
[Panel component opens as Sheet]
         ↓
[User edits fields in panel form]
         ↓
[onChange callback fires with updated config fragment]
         ↓
[WireframeViewer: updateWorkingDashboard() or updateWorkingScreen()]
         ↓
[editMode.dirty = true]
         ↓
[User clicks Save — handleSave() → saveBlueprintToDb() → Supabase]
```

The key insight: `updateWorkingScreen` already exists for per-screen mutations.
Dashboard-level mutations need the same pattern targeting `workingConfig.sidebar` or
`workingConfig.header` directly:

```typescript
function updateWorkingDashboard<K extends 'sidebar' | 'header'>(
  key: K,
  value: BlueprintConfig[K],
) {
  setWorkingConfig((prev) => {
    if (!prev) return prev
    return { ...prev, [key]: value }
  })
  setEditMode((prev) => ({ ...prev, dirty: true }))
}
```

### WireframeHeader Props Extension

`WireframeHeader.tsx` must accept and render all `HeaderConfig` fields:

```typescript
type Props = {
  title: string
  logoUrl?: string
  brandLabel?: string
  // Extended — previously all hardcoded/ignored
  showLogo?: boolean
  showPeriodSelector?: boolean    // NEW — was always rendered
  showUserIndicator?: boolean     // NEW — was always rendered
  actions?: {
    manage?: boolean
    share?: boolean
    export?: boolean
  }
}
```

The caller in `WireframeViewer.tsx` spreads `activeConfig?.header` into these props.
Default behavior (all true) is preserved when `header` is undefined.

### Sidebar Widget Rendering Zones

Widgets with `position: 'top'` render above the nav items; `position: 'bottom'` render above the footer.
The sidebar `<aside>` in WireframeViewer has three content zones:

```
[sidebar header: label + collapse toggle]
[top widgets]          ← NEW zone: SidebarWidget[] where position === 'top'
[nav: ScreenManager or grouped screen list]
[bottom widgets]       ← NEW zone: SidebarWidget[] where position === 'bottom'
[footer]
```

Widget renderers receive `collapsed: boolean` and handle their own icon-only condensed rendering.

## Recommended File Structure

```
tools/wireframe-builder/
├── types/
│   └── blueprint.ts                  MODIFY — SidebarWidget, SidebarWidgetType, SidebarConfig.widgets
├── lib/
│   ├── blueprint-schema.ts           MODIFY — SidebarWidgetSchema, update SidebarConfigSchema
│   ├── section-registry.tsx          NO CHANGE — sections only
│   └── sidebar-widget-registry.tsx   NEW — SIDEBAR_WIDGET_REGISTRY
├── components/
│   ├── WireframeHeader.tsx           MODIFY — consume full HeaderConfig
│   ├── sidebar-widgets/              NEW FOLDER
│   │   ├── WorkspaceSwitcherWidget.tsx
│   │   ├── AccountSelectorWidget.tsx
│   │   ├── UserMenuWidget.tsx
│   │   └── SearchWidget.tsx
│   └── editor/
│       ├── AdminToolbar.tsx          MODIFY — Layout button group in edit mode
│       ├── SidebarConfigPanel.tsx    NEW — Sheet for SidebarConfig editing
│       ├── HeaderConfigPanel.tsx     NEW — Sheet for HeaderConfig editing
│       ├── FilterBarEditor.tsx       NEW — Sheet for filters[] editing
│       └── SidebarWidgetPicker.tsx   NEW — widget type picker (child of SidebarConfigPanel)
│
src/pages/clients/
└── WireframeViewer.tsx               MODIFY — openPanel state, pass full HeaderConfig,
                                               updateWorkingDashboard helper, widget zone rendering
```

## Architectural Patterns

### Pattern 1: Registry-per-concern

**What:** Separate registries for section types (content) vs sidebar widget types (layout).
**When to use:** When two taxonomies have different props interfaces and different editor surfaces.
**Trade-offs:** More files, but no registry pollution. Section registry stays clean.

`SECTION_REGISTRY` handles: `renderer | propertyForm | schema | defaultProps | catalogEntry | label`.
`SIDEBAR_WIDGET_REGISTRY` handles: `renderer | label | icon | defaultProps` (no propertyForm — editing is inline inside `SidebarConfigPanel`, not in a separate Sheet per widget).

### Pattern 2: Exclusive-panel state via union type

**What:** `openPanel: 'sidebar' | 'header' | 'filter' | null` controls which layout config panel is open. Only one panel open at a time.
**When to use:** Panels target different data; double-open causes confusion and conflicting saves.
**Trade-offs:** Slightly more state in Viewer, prevents double-open UX issues.

This mirrors how `shareOpen` and `managerOpen` are boolean per-panel. The union here is appropriate because these three panels are mutually exclusive — unlike comments/share which can coexist.

### Pattern 3: Config fragment updater (dashboard-level)

**What:** `updateWorkingDashboard(key, value)` mirrors `updateWorkingScreen` for dashboard-level config.
**When to use:** Any mutation to `workingConfig.sidebar` or `workingConfig.header`.
**Trade-offs:** Adds a new helper in WireframeViewer but keeps the mutation pattern consistent.

The function is generic over the key to preserve type safety without `any`.

### Pattern 4: Backward-compatible schema extension

**What:** All new fields on `SidebarConfig` are optional. Existing blueprints without `widgets`
still parse and render correctly.
**When to use:** Any schema addition to Supabase-stored JSONB data.
**Trade-offs:** No migration needed. Old data reads as `{ widgets: undefined }` and renders without widgets.

`HeaderConfigSchema` already uses `.passthrough()` for forward-compat. Apply same to `SidebarConfigSchema`.

## Integration Points with Existing Architecture

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `WireframeViewer` ↔ `AdminToolbar` | New props: `onOpenSidebarPanel`, `onOpenHeaderPanel`, `onOpenFilterPanel` callbacks | Consistent with existing `onOpenShare`, `onOpenComments` pattern |
| `WireframeViewer` ↔ `SidebarConfigPanel` | Props: `open`, `config`, `screens`, `onChange`, `onClose` | Same interface as PropertyPanel |
| `WireframeViewer` ↔ `HeaderConfigPanel` | Props: `open`, `config`, `onChange`, `onClose` | Same interface |
| `WireframeViewer` ↔ `FilterBarEditor` | Props: `open`, `filters`, `onChange`, `onClose` | Per-screen; `onChange` → `updateWorkingScreen` |
| `WireframeViewer` ↔ `WireframeHeader` | Extended props from `activeConfig?.header` spread | No breaking change — all new props optional |
| `<aside>` (Viewer) ↔ `SIDEBAR_WIDGET_REGISTRY` | Direct import in Viewer; render widget.type lookup | No new context needed |
| `SidebarConfigPanel` ↔ `SidebarWidgetPicker` | Child component rendered inline in panel | Picker returns `SidebarWidget` via callback |

### Supabase Impact

No new tables required. `SidebarWidget[]` is stored as part of `BlueprintConfig.sidebar.widgets`
in the existing `blueprints.config` JSONB column. The Zod schema ensures valid shape on read.

The `blueprint-migrations.ts` utility handles forward-compatibility if needed, but since all
new fields are optional additions, no migration script is required for v2.2.

### What Does Not Change

- `SECTION_REGISTRY` — no new section types needed for this milestone
- `BlueprintScreen` shape — only `filters[]` editing, no new screen fields
- `ScreenManager` — no changes needed
- `PropertyPanel` — no changes needed; it is for section-level editing only
- Supabase schema (`blueprints` table) — JSONB column absorbs new fields transparently
- `WireframeSidebar.tsx` — remains as gallery preview component, untouched

## Suggested Build Order

Build order follows schema-first, then render, then editor — matching the dependency graph.

**Phase A: Schema extension (foundation)**
1. `types/blueprint.ts` — add `SidebarWidget`, `SidebarWidgetType`, extend `SidebarConfig`
2. `lib/blueprint-schema.ts` — add `SidebarWidgetSchema`, update `SidebarConfigSchema`
3. `tsc --noEmit` — confirm zero type errors before proceeding

**Phase B: Render layer — header config functional**
4. `WireframeHeader.tsx` — consume all `HeaderConfig` fields (showPeriodSelector, showUserIndicator, actions)
5. `WireframeViewer.tsx` — pass full `header` config to `WireframeHeader`
6. Visual validation: `financeiro-conta-azul` wireframe renders same as before (no regressions)

**Phase C: Sidebar widget render layer**
7. `lib/sidebar-widget-registry.tsx` — create registry with four widget types
8. `components/sidebar-widgets/` — four widget renderer components
9. `WireframeViewer.tsx` `<aside>` — add top/bottom widget zones, render from registry by position
10. Visual validation: sidebar renders correctly with and without `widgets` in config

**Phase D: Editor panels**
11. `AdminToolbar.tsx` — add Layout button group (Sidebar, Header, Filtros) visible only in edit mode
12. `WireframeViewer.tsx` — add `openPanel` state + `updateWorkingDashboard` helper
13. `editor/HeaderConfigPanel.tsx` — toggle form for all `HeaderConfig` boolean fields
14. `editor/SidebarConfigPanel.tsx` — groups editor + footer field + widget list management
15. `editor/SidebarWidgetPicker.tsx` — sub-component used inside SidebarConfigPanel
16. `editor/FilterBarEditor.tsx` — add/remove/reorder `FilterOption[]` with filterType discriminator
17. Wire all panels via `openPanel` state in WireframeViewer

**Phase E: Integration validation**
18. Manual test: HeaderConfigPanel toggles → header re-renders → save → reload persists
19. Manual test: add workspace-switcher widget → renders in sidebar → save → reload
20. Manual test: add/remove filter option per screen → FilterBar updates immediately
21. `tsc --noEmit` — zero errors required before task close

## Anti-Patterns

### Anti-Pattern 1: Adding layout widgets to SECTION_REGISTRY

**What people do:** Make sidebar widgets follow the same path as kpi-grid or bar-line-chart.
**Why it's wrong:** Sidebar widgets are layout concerns rendered outside the main content area. They have different props, different lifecycles, and no `rows[]` placement. Forcing them through SECTION_REGISTRY pollutes the content/section taxonomy.
**Do this instead:** Use a separate `SIDEBAR_WIDGET_REGISTRY` with its own type hierarchy.

### Anti-Pattern 2: Making FilterBarEditor a section type

**What people do:** Treat filter editing as a PropertyPanel triggered by clicking the filter bar in edit mode.
**Why it's wrong:** Filters are per-screen config (`BlueprintScreen.filters[]`), not a section inside `rows[]`. There is no rowIndex/cellIndex for a filter bar — it belongs to the screen, not a row.
**Do this instead:** Open FilterBarEditor via the AdminToolbar "Filtros" button. It reads `activeScreen.filters` and writes back via `updateWorkingScreen`.

### Anti-Pattern 3: Merging WireframeSidebar.tsx with the Viewer sidebar

**What people do:** Add widget support to the existing `WireframeSidebar.tsx` component.
**Why it's wrong:** `WireframeSidebar.tsx` is the standalone gallery preview component with a minimal prop interface (`screens[]`). The actual Viewer sidebar is inline JSX with full state access. They serve different purposes.
**Do this instead:** Enhance the inline `<aside>` in `WireframeViewer.tsx` directly. `WireframeSidebar.tsx` can remain as the gallery component.

### Anti-Pattern 4: Moving openPanel to a context

**What people do:** Create a `LayoutEditorContext` to share panel open state across components.
**Why it's wrong:** Only `WireframeViewer.tsx` consumes this state — AdminToolbar receives callbacks, panels receive open/onClose props. No deep subscribers exist.
**Do this instead:** Keep `openPanel` as a `useState` in `WireframeViewer.tsx`, pass callbacks as props. This is consistent with how `editMode`, `shareOpen`, and `managerOpen` are handled today.

### Anti-Pattern 5: Per-widget property Sheet panels

**What people do:** Create a separate Sheet panel per widget type (WorkspaceSwitcherPanel, AccountSelectorPanel, etc.) opened by clicking the widget in the sidebar.
**Why it's wrong:** Widgets are few (4 types), their config is simple (position, label, options), and they are always edited as part of the sidebar's config. A dedicated Sheet per widget type over-engineers the editor surface.
**Do this instead:** Edit all widgets inline within `SidebarConfigPanel`. The panel shows a list of added widgets with inline controls for each widget's fields.

## Sources

- Direct analysis: `tools/wireframe-builder/types/blueprint.ts` (SidebarConfig, HeaderConfig, FilterOption types) — HIGH confidence
- Direct analysis: `tools/wireframe-builder/lib/blueprint-schema.ts` (Zod schemas, .passthrough() on HeaderConfigSchema) — HIGH confidence
- Direct analysis: `src/pages/clients/WireframeViewer.tsx` (inline sidebar, header usage lines 957–961, updateWorkingScreen pattern) — HIGH confidence
- Direct analysis: `tools/wireframe-builder/components/WireframeHeader.tsx` (showLogo only consumed) — HIGH confidence
- Direct analysis: `tools/wireframe-builder/lib/section-registry.tsx` (SectionRegistration type, SECTION_REGISTRY pattern) — HIGH confidence
- Direct analysis: `tools/wireframe-builder/components/editor/PropertyPanel.tsx` (Sheet pattern, registry delegation) — HIGH confidence
- Direct analysis: `tools/wireframe-builder/components/editor/AdminToolbar.tsx` (edit mode button layout, callback props) — HIGH confidence
- Direct analysis: `tools/wireframe-builder/components/editor/ScreenManager.tsx` (DnD reorder, dialog add pattern) — HIGH confidence
- `.planning/PROJECT.md` — v2.2 milestone goals and constraints — HIGH confidence

---
*Architecture research for: FXL Core v2.2 — Configurable Layout Components (Sidebar Widgets, Header Config, Filter Bar Editor)*
*Researched: 2026-03-13*
