# Phase 51 Research: Sidebar Widget Renderers

**Phase:** 51 — Sidebar Widget Renderers
**Depends on:** Phase 47 (Schema Foundation)
**Requirements:** SIDE-04, SIDE-05
**Researched:** 2026-03-13

---

## Current Sidebar Structure

The sidebar lives as an inline `<aside>` block in `WireframeViewer.tsx` (lines 764-944).
`WireframeSidebar.tsx` is a ghost component (gallery preview only, never imported by the Viewer).

### Three Zones

The sidebar has three distinct rendering zones:

1. **Header zone** (lines 782-837): Label ("Dashboard" or `activeConfig?.label`) + collapse toggle button (`PanelLeft` icon). When collapsed, shows only the toggle button centered.

2. **Navigation zone** (lines 839-927): `<nav>` element containing either:
   - `ScreenManager` (in edit mode) for drag-reorder
   - Icon-only buttons (collapsed mode) via `getIconComponent(screen.icon)`
   - Grouped screen list via `partitionScreensByGroups()` (expanded mode)

3. **Footer zone** (lines 929-944): Status chip with green dot, "Sistema Ativo" text, and `activeConfig?.sidebar?.footer ?? 'Desenvolvido por FXL'`. Only visible when sidebar is NOT collapsed.

### Collapse/Rail Mode

```typescript
const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 52
const effectiveSidebarCollapsed = sidebarCollapsed && !editMode.active
const sidebarWidth = effectiveSidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED
```

When collapsed:
- Header: only shows the collapse toggle button, centered
- Nav: screen items render as 36x36 icon-only buttons
- Footer: completely hidden (`{!effectiveSidebarCollapsed && (...)}`)

### CSS Variables Used

The sidebar uses `--wf-sidebar-*` CSS custom properties:
- `--wf-sidebar-bg` (background)
- `--wf-sidebar-fg` (foreground text)
- `--wf-sidebar-muted` (secondary text)
- `--wf-sidebar-border` (borders)
- `--wf-accent` / `--wf-accent-muted` (active state)

### Icon System

`getIconComponent(name: string): LucideIcon | undefined` from `IconPicker.tsx` maps kebab-case strings (e.g., `'layout-dashboard'`) to Lucide icon components. The collapsed sidebar uses this for screen items.

---

## What Phase 47 Produces (Dependencies)

Phase 47 extends the schema. After Phase 47 completes, these types exist:

### In `tools/wireframe-builder/types/blueprint.ts`:

```typescript
export type SidebarWidgetType =
  | 'workspace-switcher'
  | 'account-selector'
  | 'user-menu'
  | 'search'

export type SidebarWidget = {
  type: SidebarWidgetType
  position: 'top' | 'bottom'
  label?: string
  options?: string[]
}

export type SidebarConfig = {
  footer?: string
  groups?: SidebarGroup[]
  widgets?: SidebarWidget[]  // NEW from Phase 47
}
```

### In `tools/wireframe-builder/lib/blueprint-schema.ts`:

```typescript
const SidebarWidgetSchema = z.object({
  type: z.enum(['workspace-switcher', 'account-selector', 'user-menu', 'search']),
  position: z.enum(['top', 'bottom']),
  label: z.string().optional(),
  options: z.array(z.string()).optional(),
})

export const SidebarConfigSchema = z.object({
  footer: z.string().optional(),
  groups: z.array(SidebarGroupSchema).optional(),
  widgets: z.array(SidebarWidgetSchema).optional(),
}).passthrough()
```

---

## Widget Design Reference (shadcn sidebar-07)

The visual reference is shadcn sidebar-07 patterns. Key components:

### Workspace Switcher (team-switcher.tsx pattern)

- Dropdown chip in sidebar header
- Shows icon + label + ChevronsUpDown chevron
- Background: subtle contrast against sidebar bg (e.g., `#1e293b` on dark sidebar)
- Rounded corners, compact height (~40px)
- In collapsed mode: icon-only square button

### User Menu (nav-user.tsx pattern)

- Footer widget showing avatar circle + name + role text
- Avatar: initials circle (e.g., "CA" for "Cauet A.")
- Name: primary text, role: muted secondary text
- In collapsed mode: avatar circle only as button

---

## Widget Zone Placement

Based on ARCHITECTURE.md recommended zones and `SidebarWidget.position` field:

```
[sidebar header: label + collapse toggle]
[workspace-switcher widget]     ← position: 'top', renders IN header zone (replaces/augments label)
[search widget (future)]        ← position: 'top', renders above nav
[nav: ScreenManager / grouped screens]
[user-menu widget]              ← position: 'bottom', renders in footer zone (replaces status chip)
[footer (when no user-menu)]
```

For Phase 51, the two widgets map to specific zones:
- **workspace-switcher** (`position: 'top'`): Renders in/below the sidebar header zone, above navigation
- **user-menu** (`position: 'bottom'`): Renders in the footer zone, replacing the status chip when present

---

## Rendering Approach

### SIDEBAR_WIDGET_REGISTRY

A constant mapping `SidebarWidgetType` to rendering metadata:

```typescript
{
  'workspace-switcher': { icon: ChevronsUpDown, label: 'Workspace Switcher', zone: 'header' },
  'user-menu': { icon: User, label: 'User Menu', zone: 'footer' },
  'account-selector': { icon: Building2, label: 'Account Selector', zone: 'header' },
  'search': { icon: Search, label: 'Search', zone: 'nav' },
}
```

### Widget Renderer Components

Two widget renderers needed for Phase 51:

1. **WorkspaceSwitcherWidget**: Inline component rendering a dropdown-style chip with:
   - Label text (from `widget.label ?? activeConfig?.label ?? 'Dashboard'`)
   - ChevronsUpDown icon (decorative)
   - Subtle background distinct from sidebar bg
   - Collapsed: icon-only button (ChevronsUpDown)

2. **UserMenuWidget**: Inline component rendering an avatar + name/role chip with:
   - Avatar initials circle (first letter of label, e.g., "O" for "Operador")
   - Name text (from `widget.label ?? 'Operador'`)
   - Role text (from `widget.options?.[0] ?? 'Admin'`)
   - Visually distinct from plain text status footer
   - Collapsed: avatar circle only

### Integration in WireframeViewer `<aside>`

Widget rendering goes inline in the sidebar `<aside>` block. The logic:

1. Extract widgets from `activeConfig?.sidebar?.widgets ?? []`
2. Find header-zone widgets: `widgets.filter(w => w.position === 'top')`
3. Find footer-zone widgets: `widgets.filter(w => w.position === 'bottom')`
4. Render header widgets between sidebar header and nav
5. Render footer widgets in place of or before the existing footer
6. When no widgets configured: exact same render as today (backward compat)

### Collapsed Mode

Each widget in collapsed mode renders as a 36x36 icon-only button matching existing collapsed screen item style:
- Same dimensions, border-radius, hover effects
- Uses the icon from `SIDEBAR_WIDGET_REGISTRY[widget.type].icon`
- Consistent with screen items in collapsed rail

---

## Backward Compatibility

When `activeConfig?.sidebar?.widgets` is undefined or empty:
- Header zone: renders label + toggle as before
- Footer zone: renders status chip as before
- Nav zone: no change
- Zero visual regression

---

## Files to Modify/Create

| File | Action | Purpose |
|------|--------|---------|
| `tools/wireframe-builder/lib/sidebar-widget-registry.ts` | CREATE | SIDEBAR_WIDGET_REGISTRY constant |
| `tools/wireframe-builder/components/sidebar-widgets/WorkspaceSwitcherWidget.tsx` | CREATE | Workspace switcher renderer |
| `tools/wireframe-builder/components/sidebar-widgets/UserMenuWidget.tsx` | CREATE | User menu renderer |
| `src/pages/clients/WireframeViewer.tsx` | MODIFY | Add widget zone rendering in inline `<aside>` |

---

## Sources

- `src/pages/clients/WireframeViewer.tsx` lines 764-944 — inline sidebar structure, zones, collapse logic
- `tools/wireframe-builder/types/blueprint.ts` — current SidebarConfig type
- `tools/wireframe-builder/lib/blueprint-schema.ts` — current SidebarConfigSchema (no .passthrough())
- `.planning/research/ARCHITECTURE.md` — recommended widget zones and SIDEBAR_WIDGET_REGISTRY pattern
- `.planning/research/FEATURES.md` — workspace switcher and user menu feature specs
- `.planning/ROADMAP.md` — Phase 51 success criteria
- `.planning/REQUIREMENTS.md` — SIDE-04, SIDE-05 requirement descriptions

---
*Research completed: 2026-03-13*
