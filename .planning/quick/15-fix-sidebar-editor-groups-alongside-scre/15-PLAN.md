---
phase: "15"
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/clients/WireframeViewer.tsx
autonomous: false
requirements: [SIDEBAR-GROUPS, SIDEBAR-WIDGET-PICKER]
must_haves:
  truths:
    - "In edit mode, sidebar nav shows groups as headings interspersed with their screens (same visual as view mode) instead of a flat ScreenManager list"
    - "The ADICIONAR section at the top is removed; '+ Grupo' button appears at the bottom of the nav area alongside screens"
    - "The '+ Widget' button shows a popover listing available widget types from SIDEBAR_WIDGET_REGISTRY with icon+label, letting the user choose which widget to add"
    - "Group headings in edit mode are clickable (open SidebarPropertyPanel), have delete buttons, and show selection border -- same as current view-mode group rendering"
    - "Each per-group ScreenManager instance passes editMode={true} so screens are draggable/renameable/deletable within their group"
  artifacts:
    - path: "src/pages/clients/WireframeViewer.tsx"
      provides: "Unified grouped edit-mode sidebar with inline add-group button and widget type picker popover"
  key_links:
    - from: "edit-mode nav section (lines ~1237-1402)"
      to: "partitionScreensByGroups"
      via: "edit mode now uses partitionScreensByGroups instead of flat ScreenManager"
      pattern: "editMode\\.active.*partitionScreensByGroups"
    - from: "widget add button"
      to: "SIDEBAR_WIDGET_REGISTRY"
      via: "Popover listing available widgets from registry"
      pattern: "Popover.*SIDEBAR_WIDGET_REGISTRY"
---

<objective>
Fix the Wireframe Builder sidebar editor to: (1) show groups alongside screens in edit mode using the same partitionScreensByGroups rendering as view mode but with edit capabilities, (2) remove the separate "ADICIONAR" section and place the "+ Grupo" button inline at the bottom of the nav area, and (3) replace the auto-add widget button with a Popover picker that lists available widget types from SIDEBAR_WIDGET_REGISTRY.

Purpose: The current edit mode shows a flat ScreenManager that ignores groups, and the ADICIONAR section creates a confusing separation between groups/widgets and screens. The widget add button blindly picks the first available type instead of letting the user choose.

Output: Modified WireframeViewer.tsx with unified grouped edit-mode sidebar
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/pages/clients/WireframeViewer.tsx
@tools/wireframe-builder/components/editor/ScreenManager.tsx
@tools/wireframe-builder/lib/sidebar-widget-registry.ts
@tools/wireframe-builder/components/editor/SidebarPropertyPanel.tsx

<interfaces>
<!-- Key types the executor needs -->

From tools/wireframe-builder/types/blueprint.ts:
```typescript
export type SidebarGroup = { label: string; screenIds: string[] }
export type SidebarWidget = { type: SidebarWidgetType; [key: string]: unknown }
export type SidebarWidgetType = 'workspace-switcher' | 'user-menu'
```

From tools/wireframe-builder/lib/sidebar-widget-registry.ts:
```typescript
export type SidebarWidgetRegistration = {
  type: SidebarWidgetType
  icon: ComponentType<{ style?: React.CSSProperties; className?: string }>
  label: string
  zone: SidebarWidgetZone
  defaultProps: () => SidebarWidget
}
export const SIDEBAR_WIDGET_REGISTRY: Record<SidebarWidgetType, SidebarWidgetRegistration>
```

From tools/wireframe-builder/components/editor/ScreenManager.tsx:
```typescript
type Props = {
  screens: BlueprintScreen[]
  activeIndex: number
  editMode: boolean          // When true: drag handles, rename, delete, reorder, + Nova Tela button
  onSelectScreen: (index: number) => void
  onAddScreen: (screen: BlueprintScreen) => void
  onDeleteScreen: (index: number) => void
  onRenameScreen: (index: number, title: string) => void
  onReorderScreens: (screens: BlueprintScreen[]) => void
}
```

Module-level helper already in WireframeViewer.tsx:
```typescript
type ScreenGroup = {
  label: string | null
  screens: { screen: BlueprintScreen; originalIndex: number }[]
}
function partitionScreensByGroups(screens: BlueprintScreen[], groups?: SidebarGroup[]): ScreenGroup[]
```

Available UI component:
```typescript
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Unify edit-mode sidebar nav to use grouped rendering with inline controls</name>
  <files>src/pages/clients/WireframeViewer.tsx</files>
  <action>
This task modifies the sidebar's edit-mode rendering in WireframeViewer.tsx. Three changes in one coherent edit:

**Change A: Remove the "ADICIONAR" section (lines ~1111-1234)**

Delete the entire `{editMode.active && !effectiveSidebarCollapsed && (...)}` block that renders the "ADICIONAR" heading with the "+ Grupo" and "+ Widget" buttons. This section will be replaced by inline controls within the nav area.

**Change B: Unify edit-mode nav to use partitionScreensByGroups (lines ~1237-1248)**

Replace the edit-mode branch that renders a single flat `<ScreenManager>`:
```tsx
{editMode.active ? (
  <ScreenManager screens={screens} activeIndex={safeActiveIndex} editMode={editMode.active} ... />
) : effectiveSidebarCollapsed ? (
```

With a new branch that uses `partitionScreensByGroups` for edit mode (same as the existing non-edit expanded branch at lines ~1293-1401), but with these key differences:

1. **Pass `editMode={true}` to each per-group ScreenManager** (currently the view-mode branch passes `editMode={false}`). This enables drag-and-drop, rename, delete within each group.

2. **Keep group heading click-to-select, delete button, and selection border** exactly as they already are in the view-mode grouped rendering (lines 1296-1385). The code already has `editMode.active` checks for these -- they'll now be true.

3. **Add a "+ Grupo" button at the bottom of the grouped list** (after all groups render), styled like the existing "+ Grupo" button but as a subtle inline ghost button matching the "Nova Tela" button style pattern in ScreenManager. Use the same onClick logic as the removed ADICIONAR button: create a new group via `updateWorkingConfig`, then `handleSelectSidebarElement({ type: 'group', groupIndex: currentGroups.length })`.

4. **Add a "+ Widget" button with a Popover picker** after the "+ Grupo" button. Import `Popover, PopoverContent, PopoverTrigger` from `@/components/ui/popover`. The button should:
   - Compute `availableWidgets` from `SIDEBAR_WIDGET_REGISTRY` filtered by widgets not already in config (same logic as the removed ADICIONAR button)
   - Be disabled if `availableWidgets.length === 0` (all widget types already added)
   - On click, open a Popover showing a list of available widgets, each as a row with the widget's `reg.icon` (16x16) and `reg.label`
   - Clicking a widget row: adds it via `updateWorkingConfig` (same logic), selects it via `handleSelectSidebarElement`, and closes the popover
   - Style the popover content with dark sidebar theme: bg matching `var(--wf-sidebar)` or `#0f172a`, border `var(--wf-sidebar-border)`, text white, hover `rgba(255,255,255,0.1)`. Each row: flex, items-center, gap-2, px-3 py-2, text-xs, rounded, cursor-pointer.
   - Use `useState` for popover open state so it can close after selection.

5. **For ungrouped screens** (group.label === null): render them with `editMode={true}` so they're also editable. Since ScreenManager always shows "Nova Tela" when editMode=true, it's acceptable to have it in each group -- new screens are added to the global list and can be assigned to groups via the SidebarPropertyPanel. Keep the same onAddScreen/onDeleteScreen/onRenameScreen/onReorderScreens handlers, mapping local indices back to original indices (same pattern as the view-mode branch uses for onSelectScreen, onDeleteScreen, onRenameScreen).

6. **Handle onReorderScreens per-group**: Create a local handler per group that updates the group's screenIds:
```tsx
onReorderScreens={(reorderedLocalScreens) => {
  const newScreenIds = reorderedLocalScreens.map(s => s.id)
  updateWorkingConfig((cfg) => ({
    ...cfg,
    sidebar: {
      ...cfg.sidebar,
      groups: (cfg.sidebar?.groups ?? []).map((g, i) =>
        i === gi ? { ...g, screenIds: newScreenIds } : g
      ),
    },
  }))
}}
```
For ungrouped screens (label === null), reorder updates the global screens array normally via `handleReorderScreens`.

**Change C: Restructure the nav ternary**

Simplify the ternary to:
```tsx
{effectiveSidebarCollapsed ? (
  // Collapsed rendering (icon-only, same as current -- unchanged)
) : editMode.active ? (
  // NEW: expanded edit mode with groups + inline add buttons
) : (
  // Expanded view mode with groups (existing, unchanged)
)}
```
The collapsed branch stays identical. Edit mode gets the new grouped rendering. View mode stays the same.

**Important notes:**
- Add `import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'` at the top of the file
- Use `useState` for `widgetPopoverOpen` state (can be local inline via IIFE or add to component state)
- Style inline buttons (+ Grupo, + Widget) consistently with sidebar dark theme using inline styles (matching existing codebase patterns in this file, which uses inline styles extensively)
- The "+ Grupo" and "+ Widget" buttons should be at the BOTTOM of the nav area, after all groups, as small subtle buttons (not a prominent "ADICIONAR" section)
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/Projetos/fxl-core && npx tsc --noEmit</automated>
  </verify>
  <done>
    - The "ADICIONAR" section with its heading and buttons is completely removed from the sidebar
    - In edit mode (expanded), the nav area uses partitionScreensByGroups to show group headings interspersed with screens
    - Each group's ScreenManager has editMode=true enabling drag, rename, delete
    - Group headings are clickable (open SidebarPropertyPanel) and have delete buttons
    - A subtle "+ Grupo" button sits at the bottom of the nav area
    - A "+ Widget" button with Popover picker sits after "+ Grupo", listing available widget types with icon+label from SIDEBAR_WIDGET_REGISTRY
    - Selecting a widget type from the popover adds it and selects it for editing
    - TypeScript compiles with zero errors
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Verify sidebar edit mode UX</name>
  <files>src/pages/clients/WireframeViewer.tsx</files>
  <action>Human visual verification of all three fixes in the browser.</action>
  <what-built>Unified sidebar edit mode with grouped screens, inline add-group button, and widget type picker popover</what-built>
  <how-to-verify>
    1. Run `make dev` and open a wireframe with sidebar groups configured
    2. Enter edit mode via AdminToolbar
    3. Verify the old "ADICIONAR" section with "Grupo"/"Widget" buttons at the top is GONE
    4. Verify the nav area shows group headings (uppercase labels) with screens underneath each group, all editable (drag handles, rename via menu, delete)
    5. Click a group heading -- verify it gets a blue selection border and the SidebarPropertyPanel Sheet opens on the right to edit the group
    6. Click the delete button (trash icon) on a group heading -- verify the group is removed
    7. Scroll to the bottom of the nav area -- verify "+ Grupo" and "+ Widget" buttons are visible
    8. Click "+ Grupo" -- verify a new group is added and the SidebarPropertyPanel opens for it
    9. Click "+ Widget" -- verify a Popover appears listing available widget types (e.g., "Workspace Switcher", "User Menu") with their icons
    10. Select a widget type from the popover -- verify the widget is added and selected (SidebarPropertyPanel opens)
    11. If all widget types are already added, verify the "+ Widget" button is disabled/dimmed
    12. Verify drag-and-drop reordering works within a group
    13. Click "Salvar" in toolbar -- verify changes persist after page reload
  </how-to-verify>
  <verify>Visual inspection in browser</verify>
  <done>All 3 issues confirmed fixed: groups alongside screens, inline add buttons, widget type picker popover</done>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with zero errors
- Visual verification in browser confirms all 3 issues are fixed
- No regressions in view mode (non-edit) sidebar rendering
</verification>

<success_criteria>
1. Edit mode sidebar shows groups alongside screens (not in a separate ADICIONAR section)
2. "+ Grupo" button is inline at the bottom of the nav, not in a separate header section
3. "+ Widget" shows a popover picker with available widget types from SIDEBAR_WIDGET_REGISTRY
4. Group headings in edit mode are interactive (click to select, delete button)
5. Screens within groups are fully editable (drag, rename, delete)
6. Zero TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/15-fix-sidebar-editor-groups-alongside-scre/15-SUMMARY.md`
</output>
