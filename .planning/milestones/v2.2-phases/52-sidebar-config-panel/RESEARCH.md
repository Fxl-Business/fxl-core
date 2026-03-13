# Phase 52 Research: Sidebar Config Panel

**Phase:** 52 — Sidebar Config Panel
**Depends on:** Phase 49 (mutation infrastructure), Phase 51 (widget renderers)
**Requirements:** SIDE-01, SIDE-02, SIDE-03
**Researched:** 2026-03-13

---

## Current State

### SidebarConfig Type (tools/wireframe-builder/types/blueprint.ts)

```typescript
export type SidebarGroup = {
  label: string       // heading text ("Financeiro", "Operacional", etc.)
  screenIds: string[] // screen IDs belonging to this group (matched by BlueprintScreen.id)
}

export type SidebarConfig = {
  footer?: string          // version/environment text
  groups?: SidebarGroup[]  // optional grouping of screens with labeled headings
}
```

After Phase 47 (Schema Foundation), SidebarConfig will be extended with `widgets?: SidebarWidget[]`.

After Phase 51 (Widget Renderers), `SIDEBAR_WIDGET_REGISTRY` will exist with `workspace-switcher` and `user-menu` widget types, each with `renderer`, `label`, `icon`, `defaultProps`.

### Sidebar Rendering (WireframeViewer.tsx lines 764-944)

The sidebar is rendered inline in WireframeViewer.tsx as a fixed-position `<aside>`. Key zones:

1. **Sidebar header** (lines 782-837): Label + collapse toggle button
2. **Navigation items** (lines 839-927):
   - In edit mode: `ScreenManager` (single flat list with DnD)
   - Collapsed: icon-only buttons per screen
   - Expanded: `partitionScreensByGroups()` renders grouped screen lists with headings
3. **Footer** (lines 929-944): Status chip with "Sistema Ativo" + footer text from `activeConfig?.sidebar?.footer ?? 'Desenvolvido por FXL'`

### partitionScreensByGroups Helper (lines 50-78)

Module-level function that takes `screens[]` and optional `groups[]`, returns `ScreenGroup[]`:
- If no groups: all screens in a single group with `label: null`
- If groups exist: maps `group.screenIds` to screens by ID, adds ungrouped screens at the end
- Filters out empty groups

### Existing Pattern: PropertyPanel (Sheet-based editor)

PropertyPanel.tsx uses `<Sheet side="right">` from shadcn/ui. Props: `open`, `section`, `onClose`, `onChange`. This is the reference pattern for all config panels.

### Mutation Infrastructure (Phase 49 provides)

Phase 49 will create:
```typescript
// In WireframeViewer.tsx
function updateWorkingConfig(updater: (config: BlueprintConfig) => BlueprintConfig) {
  setWorkingConfig((prev) => prev ? updater(prev) : prev)
  setEditMode((prev) => ({ ...prev, dirty: true }))
}
```

Phase 49 also adds AdminToolbar "Layout" button group with Sidebar/Header/Filtros buttons and `openPanel: 'sidebar' | 'header' | 'filter' | null` state.

### Available shadcn/ui Components

Present: Button, Input, Label, Separator, Sheet, Switch, Select, Dialog, Card, Badge, ScrollArea
Not present: Accordion, Checkbox

Since Checkbox is not available, screen assignment will use Switch toggles or shadcn Select with checkmarks. Alternatively, install Checkbox via `npx shadcn@latest add checkbox` as part of the plan.

### Screen Data

Each `BlueprintScreen` has:
- `id: string` — unique identifier used in `SidebarGroup.screenIds`
- `title: string` — display name
- `icon?: string` — lucide icon name

---

## Key Decisions

### 1. Screen-to-group assignment: at most ONE group per screen

Each screen belongs to at most one group. The UI must enforce this as exclusive selection (when assigning a screen to a group, it is automatically removed from its previous group). This matches the existing `partitionScreensByGroups` behavior where ungrouped screens fall to the bottom.

### 2. Panel organization: collapsible sections using simple heading + content pattern

No Accordion component is available. Use simple section headers with visual separation via `<Separator />`. Three sections:
- Footer Text (simple Input)
- Groups (CRUD list with inline rename + screen assignment)
- Widgets (toggle switches for workspace-switcher and user-menu)

### 3. Group management: inline editing

- Create: "Add Group" button appends `{ label: 'Novo Grupo', screenIds: [] }`
- Rename: inline Input with onBlur save
- Delete: icon button with confirmation (only if group has assigned screens; empty groups delete immediately)
- No drag-and-drop for group reordering (anti-feature per research)

### 4. Widget management: toggle switches

After Phase 51, the widget registry defines available types. The panel shows a Switch per widget type:
- ON: adds the widget's `defaultProps()` to `config.sidebar.widgets`
- OFF: removes the widget from the array
- Simple enough that a dedicated "widget picker" sub-component is unnecessary; inline switches suffice.

### 5. Live preview via updateWorkingConfig

Every change in the panel immediately calls `updateWorkingConfig()` to update `workingConfig.sidebar`. The sidebar inline JSX in WireframeViewer re-renders from `activeConfig` (which points to `workingConfig` in edit mode), producing live preview.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `tools/wireframe-builder/components/editor/SidebarConfigPanel.tsx` | NEW | Sheet panel with footer text, group CRUD, widget toggles |
| `src/components/ui/checkbox.tsx` | NEW (install via shadcn) | Needed for screen assignment checkboxes within groups |
| `src/pages/clients/WireframeViewer.tsx` | MODIFY | Wire SidebarConfigPanel to `openPanel === 'sidebar'` with updateWorkingConfig |

---

## Risks & Mitigations

1. **Risk: Checkbox not available** — Mitigated by installing shadcn checkbox component, or falling back to Switch toggles.
2. **Risk: updateWorkingConfig not yet available** — Phase 49 dependency; plan assumes it exists. If not, Task 1 stubs it.
3. **Risk: SidebarWidget type not yet available** — Phase 47/51 dependency; widget section uses conditional rendering based on type existence.
4. **Risk: Group delete with assigned screens** — Mitigated by confirming deletion via Dialog when group has screens; screens become ungrouped.

---

## Sources

- `tools/wireframe-builder/types/blueprint.ts` — SidebarConfig, SidebarGroup, BlueprintScreen types
- `tools/wireframe-builder/lib/blueprint-schema.ts` — SidebarConfigSchema, SidebarGroupSchema
- `src/pages/clients/WireframeViewer.tsx` — inline sidebar (lines 764-944), partitionScreensByGroups (lines 50-78), updateWorkingScreen (lines 458-470)
- `tools/wireframe-builder/components/editor/PropertyPanel.tsx` — Sheet pattern reference
- `tools/wireframe-builder/components/editor/AdminToolbar.tsx` — edit mode button layout
- `.planning/research/ARCHITECTURE.md` — updateWorkingConfig pattern, panel taxonomy
- `.planning/research/FEATURES.md` — MVP definition, feature dependencies
- `.planning/research/PITFALLS.md` — Pitfall 3 (no dashboard mutation helpers), Pitfall 4 (Zod strips unknown fields)
- `.planning/REQUIREMENTS.md` — SIDE-01, SIDE-02, SIDE-03 definitions

---
*Research for Phase 52: Sidebar Config Panel*
*Researched: 2026-03-13*
