# Stack Research — v2.2 Configurable Layout Components

**Domain:** Wireframe Builder — compound sidebar widgets, header property panels, filter bar editor
**Researched:** 2026-03-13
**Confidence:** HIGH (validated against installed packages, live shadcn/ui docs, and existing codebase patterns)

> This is an additive research document for v2.2. The base stack (React 18, TypeScript strict,
> Tailwind CSS 3, Vite 5, Supabase, Clerk, Recharts 2.x, @dnd-kit, Zod 4.x, lucide-react)
> is validated and unchanged. This document covers ONLY what is new or changed for v2.2.

---

## Executive Decision: Two shadcn/ui Component Installs, Zero New npm Packages

All three v2.2 features — compound sidebar widgets, header config property panels, filter bar
editor — require adding only two shadcn/ui component files that are missing from
`src/components/ui/`. The underlying Radix UI packages they depend on are already installed.
No new npm packages are needed.

---

## Feature-by-Feature Analysis

### 1. Compound Sidebar Widgets (workspace switcher, account selector, user menu)

**Target pattern:** shadcn/ui sidebar-07 — the "sidebar that collapses to icons" block, which
ships with `nav-user.tsx` (user menu in footer) and `team-switcher.tsx` (workspace switcher
in header). These are compound components built from `SidebarMenuButton`, `SidebarHeader`,
`SidebarFooter`, and a Popover-based dropdown.

**Install needed:**
```bash
npx shadcn add tooltip   # tooltip.tsx — used by sidebar for icon tooltips in collapsed state
npx shadcn add sidebar   # sidebar.tsx — SidebarProvider, SidebarMenu, useSidebar, etc.
```

**Why tooltip is the only missing piece:** `@radix-ui/react-tooltip ^1.1.0` is already in
`package.json`. The Radix package is installed; only the shadcn wrapper `tooltip.tsx` is
absent from `src/components/ui/`. Sidebar uses Tooltip internally when collapsed to show
icon labels.

**All other sidebar dependencies are already installed:**

| Dependency | Already Present | Notes |
|------------|----------------|-------|
| `@radix-ui/react-slot` ^1.2.4 | Yes | SidebarMenuButton uses asChild pattern |
| `@radix-ui/react-separator` ^1.1.8 | Yes | SidebarSeparator |
| `@radix-ui/react-dialog` ^1.1.15 | Yes | Mobile Sheet drawer |
| `@radix-ui/react-tooltip` ^1.1.0 | Yes | Icon tooltips (package only, .tsx missing) |
| `sheet.tsx` | Yes | Mobile sidebar drawer |
| `separator.tsx` | Yes | Visual dividers |
| `button.tsx` | Yes | Trigger buttons |
| `input.tsx` | Yes | Search widget in sidebar |
| `class-variance-authority` ^0.7.1 | Yes | Sidebar variant management |

**Important scoping constraint:** The shadcn `sidebar` component MUST be used only inside
`tools/wireframe-builder/`. The FXL Core app shell has its own sidebar at
`src/components/layout/Sidebar.tsx`. These are separate systems with no overlap.

**Rendering approach inside wireframe:** The `WireframeSidebar.tsx` component will import
from the newly installed `src/components/ui/sidebar` (same import path as all other shadcn
components). The sidebar widgets (workspace-switcher, user-menu, etc.) become sub-components
inside `tools/wireframe-builder/components/` following the existing pattern.

**Cookie-based state persistence in shadcn sidebar:** The shadcn sidebar uses a cookie
(`SIDEBAR_COOKIE_NAME = 'sidebar:state'`) for Next.js projects. For this Vite project, the
open/closed state can be managed via the `defaultOpen` prop or localStorage. No cookies-next
package is needed — the sidebar state in the wireframe viewer is ephemeral (resets on page
load is acceptable for a wireframe tool).

---

### 2. Header Property Panels (showPeriodSelector, showUserIndicator, actions.*)

**Current state:** `HeaderConfig` schema is already defined in `types/blueprint.ts` with all
boolean fields. `WireframeHeader.tsx` already reads `showLogo`. The editor has no panel for
these fields.

**What's needed:** A `HeaderConfigForm` component following the exact pattern of existing
property forms. All UI primitives required are already installed:

| Field Type | Component | Already Installed |
|------------|-----------|------------------|
| Boolean toggles (showLogo, showPeriodSelector, showUserIndicator) | `switch.tsx` → `@radix-ui/react-switch` ^1.2.6 | Yes |
| Boolean toggles (actions.manage, share, export) | Same `switch.tsx` | Yes |
| Panel container | `sheet.tsx` (PropertyPanel pattern) | Yes |

**Entry point in editor:** New "Header" button or section in `AdminToolbar`, triggering a
Sheet panel with `HeaderConfigForm` — identical flow to how branding is edited via
`BrandingPopover`. The change propagates through the same `onSave` → Supabase pipeline.

**WireframeHeader.tsx extension:** Currently only `showLogo` is wired. Props for
`showPeriodSelector`, `showUserIndicator`, and `actions.*` need to be added to the component
and passed from `WireframeViewer.tsx`. No new packages — pure TypeScript prop addition.

---

### 3. Filter Bar Editor (per-screen FilterOption[] editor)

**Current state:** `WireframeFilterBar.tsx` renders `FilterOption[]` from
`BlueprintScreen.filters`. The visual editor has no way to add/remove/edit filter options
per screen. A separate section type `filter-config` exists but is a section-level component,
not the screen-level filter bar.

**What's needed:** A `FilterBarEditorPanel` triggered from within the edit mode UI that edits
`screen.filters[]`. All primitives required are already installed.

**Key distinction:** This is NOT adding to the section registry. The filter bar is a
screen-level config (not a section), so it gets its own edit flow separate from `PropertyPanel`.

The existing `FilterConfigForm.tsx` (for the `filter-config` section type) uses the exact
same list-edit pattern needed here — add/remove filters, label input, filterType select. The
`FilterBarEditorPanel` will reuse this form structure with a minor adaptation to target
`BlueprintScreen.filters` instead of `FilterConfigSection.filters`.

**Already in `FilterOption` type:** `filterType` supports `'select' | 'date-range' |
'multi-select' | 'search' | 'toggle'`. The editor needs to expose all five variants.

---

### 4. Schema Extension for SidebarWidget (Zod — No Upgrade)

**The `SidebarConfig` type in `types/blueprint.ts` currently has:**
```typescript
export type SidebarConfig = {
  footer?: string
  groups?: SidebarGroup[]
}
```

**Extension needed** (additive, backward-compatible):
```typescript
export type SidebarWidget =
  | { type: 'workspace-switcher'; workspaces?: string[] }
  | { type: 'account-selector'; accounts?: string[] }
  | { type: 'user-menu'; showRole?: boolean }
  | { type: 'search'; placeholder?: string }

export type SidebarConfig = {
  footer?: string
  groups?: SidebarGroup[]
  widgets?: {
    top?: SidebarWidget[]    // renders in SidebarHeader area
    bottom?: SidebarWidget[] // renders in SidebarFooter area
  }
}
```

Zod 4.3.6 (already installed) handles `z.discriminatedUnion('type', [...])` for
`SidebarWidget`. The `SidebarConfigSchema` currently has no `.passthrough()` but adding
`widgets` is a backward-compatible Zod schema addition — old blueprints without `widgets`
parse fine with `z.optional()`.

`HeaderConfigSchema` already has `.passthrough()` (line 76 of `blueprint-schema.ts`),
so any new `HeaderConfig` fields added in v2.2 will survive existing DB round-trips without
a migration.

---

## Recommended Stack (Additions Only)

### New shadcn/ui Components to Install

| Component | Command | What It Adds | Why Needed |
|-----------|---------|-------------|-----------|
| `tooltip` | `npx shadcn add tooltip` | `src/components/ui/tooltip.tsx` (wraps `@radix-ui/react-tooltip`) | sidebar.tsx imports Tooltip for collapsed icon labels |
| `sidebar` | `npx shadcn add sidebar` | `src/components/ui/sidebar.tsx` (~600 lines, composable sidebar system) | SidebarProvider, SidebarMenu, SidebarHeader, SidebarFooter, SidebarContent, useSidebar hook |

### No New npm Packages

```bash
# Zero new packages in package.json
# Only two shadcn component files to add:
npx shadcn add tooltip
npx shadcn add sidebar
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| shadcn `sidebar` component | Custom sidebar from scratch | sidebar-07 compound widget patterns (team-switcher, nav-user) match the target exactly. Building from scratch adds 3-4x effort with identical output |
| shadcn `sidebar` component | Headless UI sidebar | Headless UI has no sidebar primitive |
| Extend `PropertyPanel` Sheet for header/filter config | Separate dialog component | Sheet is the established pattern for all property editing (28 section types use it). Consistency outweighs novelty |
| `z.discriminatedUnion` for SidebarWidget | `widgetType: string` flat field | TypeScript strict mode and Zod runtime validation require typed union; string field loses narrowing in the render switch |
| @dnd-kit/sortable for filter reorder in editor | react-beautiful-dnd | react-beautiful-dnd is archived. @dnd-kit is already in the project and used in `BlueprintRenderer` |
| ephemeral sidebar open state (no persistence) | `localStorage` persistence | Wireframe sidebar is decorative/preview, not a functional app sidebar. State reset on reload is acceptable and avoids complexity |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `cookies-next` | Next.js only. Vite project has no cookie middleware layer | No sidebar state persistence, or `localStorage` via a custom hook if needed |
| shadcn `sidebar` in `src/components/layout/` | The FXL app shell has its own sidebar. Using shadcn sidebar there would be a breaking architectural change | Keep app shell sidebar as-is; use shadcn sidebar only in wireframe-builder |
| New `filter-bar` section type | Filter bar is a screen-level config (`screen.filters[]`), not a section. Adding it to the section registry would break the data model | Edit `screen.filters[]` directly via `FilterBarEditorPanel` |
| `react-beautiful-dnd` | Archived project, React 18 issues | `@dnd-kit/sortable` already installed |
| `@radix-ui/react-collapsible` | Not in package.json. Filter bar accordion is a flat list, not a tree | Plain div + CSS for any collapsible behavior |
| Recharts 3.x upgrade | Breaking API changes, PROJECT.md defers explicitly | Stay on 2.13.3 |
| React 19 | PROJECT.md defers (stability) | Stay on React 18.3.1 |
| Tailwind v4 | PROJECT.md defers (stability) | Stay on Tailwind CSS 3.4.x |

---

## Integration Points with Existing Visual Editor

Three new edit surfaces are needed. All follow the established pattern:

**Pattern:** `AdminToolbar button → Sheet panel → Form component → onChange callback → BlueprintConfig mutation → Supabase save`

| Surface | Entry Point | Panel Component | Form Component | Mutates |
|---------|-------------|----------------|----------------|---------|
| Sidebar config | "Sidebar" button in AdminToolbar (edit mode) | `SidebarConfigPanel` (Sheet) | `SidebarConfigForm` | `config.sidebar` |
| Header config | "Header" button in AdminToolbar (edit mode) | `HeaderConfigPanel` (Sheet) | `HeaderConfigForm` | `config.header` |
| Filter bar | "Editar Filtros" button in filter bar (edit mode) | `FilterBarEditorPanel` (Sheet) | Adapts `FilterConfigForm` pattern | `screen.filters[]` |

The `SidebarConfigForm` adds a widget list editor (add/remove SidebarWidget items with type
selector and string array inputs for workspaces/accounts). It also retains the existing
`groups` and `footer` fields already in `SidebarConfig`.

---

## Version Compatibility

| Package | Current Version | Compatible With v2.2 | Notes |
|---------|----------------|---------------------|-------|
| `@radix-ui/react-tooltip` | `^1.1.0` | shadcn sidebar | Already installed; tooltip.tsx wrapper file is missing |
| `@radix-ui/react-separator` | `^1.1.8` | shadcn sidebar | Already installed |
| `@radix-ui/react-slot` | `^1.2.4` | shadcn sidebar asChild | Already installed |
| `@radix-ui/react-dialog` | `^1.1.15` | shadcn sidebar mobile Sheet | Already installed |
| `@radix-ui/react-switch` | `^1.2.6` | HeaderConfigForm toggles | Already installed |
| `zod` | `^4.3.6` | SidebarWidget discriminated union | No upgrade needed |
| `@dnd-kit/sortable` | `^10.0.0` | Filter bar reorder in editor | Already used in BlueprintRenderer |

---

## Sources

- [shadcn/ui Sidebar blocks](https://ui.shadcn.com/blocks/sidebar) — sidebar-07 includes nav-user and team-switcher compound widgets (HIGH — direct doc verification)
- [shadcn/ui Sidebar docs](https://ui.shadcn.com/docs/components/sidebar) — SidebarProvider, useSidebar hook, component structure (MEDIUM — page loaded, full source not accessible)
- [Achromatic: Using the new Shadcn Sidebar](https://www.achromatic.dev/blog/shadcn-sidebar) — confirmed Sheet, Separator, Tooltip as internal deps; no cookies-next for Vite (MEDIUM — verified against installed packages)
- [shadcn/ui Sidebar Vite issue #7696](https://github.com/shadcn-ui/ui/issues/7696) — class-variance-authority import is the known Vite gotcha; already in project (MEDIUM — GitHub issue)
- Project `package.json` at `/Users/cauetpinciara/Documents/fxl/Projetos/fxl-core/package.json` — all Radix packages confirmed installed (HIGH — direct read)
- `src/components/ui/` directory listing — tooltip.tsx confirmed missing, sheet.tsx confirmed present (HIGH — direct ls)
- `tools/wireframe-builder/types/blueprint.ts` — SidebarConfig, HeaderConfig, FilterOption types confirmed (HIGH — direct read)
- `tools/wireframe-builder/lib/blueprint-schema.ts` — HeaderConfigSchema has `.passthrough()` for forward-compat (HIGH — direct read)
- `tools/wireframe-builder/components/editor/PropertyPanel.tsx` — Sheet-based property panel pattern confirmed (HIGH — direct read)
- `tools/wireframe-builder/components/editor/property-forms/FilterConfigForm.tsx` — list-edit pattern for filter options confirmed (HIGH — direct read)

---

*Stack research for: FXL Core v2.2 — Wireframe Builder Configurable Layout Components*
*Researched: 2026-03-13*
