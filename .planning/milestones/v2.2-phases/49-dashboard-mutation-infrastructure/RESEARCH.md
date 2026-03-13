# Phase 49 Research: Dashboard Mutation Infrastructure

**Researched:** 2026-03-13
**Phase Goal:** Operators have a mutation helper for dashboard-level config and a clear Layout entry point in the AdminToolbar

---

## Existing Mutation Pattern: updateWorkingScreen()

**Location:** `src/pages/clients/WireframeViewer.tsx`, line 458

```typescript
function updateWorkingScreen(
  updater: (screen: BlueprintScreen) => BlueprintScreen,
) {
  setWorkingConfig((prev) => {
    if (!prev) return prev
    const newScreens = [...prev.screens]
    const screen = newScreens[safeActiveIndex]
    if (!screen) return prev
    newScreens[safeActiveIndex] = updater(screen)
    return { ...prev, screens: newScreens }
  })
  setEditMode((prev) => ({ ...prev, dirty: true }))
}
```

**Key pattern observations:**
1. Takes a pure `updater` function (functional update pattern)
2. Uses `setWorkingConfig` (React setState) with functional form to avoid stale closures
3. Early returns `prev` when `prev` is null (edit mode not active)
4. Always sets `dirty: true` on `editMode` after mutation
5. The `dirty` flag triggers the "Salvar" button in AdminToolbar and the "unsaved changes" dialog on exit

## Save Cycle

**Location:** `WireframeViewer.tsx`, line 378 (`handleSave`)

1. Checks `workingConfig` and `user` exist
2. Sets `saving: true` on editMode
3. Calls `saveBlueprintToDb(clientSlug, workingConfig, user.id, lastUpdatedAt)` — writes entire `workingConfig` as JSONB
4. On success: copies `workingConfig` to `config` via `structuredClone`, sets `dirty: false`, `saving: false`
5. On conflict: opens conflict resolution dialog
6. Save is triggered by the "Salvar" button in AdminToolbar, which shows only when `editMode.active && dirty`

**Critical insight:** `saveBlueprintToDb` persists the **entire** `workingConfig` object. Any mutation to `workingConfig.sidebar` or `workingConfig.header` will automatically be persisted when the user clicks Save. No additional save plumbing is needed — only the mutation helper.

## State Management

**workingConfig** (`useState<BlueprintConfig | null>`):
- `null` when not in edit mode
- Deep clone of `config` when entering edit mode (`structuredClone(config)`)
- All mutations target `workingConfig` via `setWorkingConfig`
- On save, `workingConfig` is persisted and copied back to `config`

**editMode** (`useState<EditModeState>`):
```typescript
type EditModeState = {
  active: boolean
  dirty: boolean
  saving: boolean
  selectedSection: { rowIndex: number; cellIndex: number } | null
}
```

**activeConfig** (derived):
```typescript
const activeConfig = editMode.active && workingConfig ? workingConfig : config
```
This means the render tree always reads from `activeConfig` — mutations to `workingConfig` produce immediate UI updates.

## AdminToolbar Current Structure

**Location:** `tools/wireframe-builder/components/editor/AdminToolbar.tsx`

Current Props interface:
```typescript
type Props = {
  screenTitle: string
  editMode: boolean
  dirty: boolean
  saving: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  onToggleEdit: () => void
  onSave: () => void
  onOpenComments: () => void
  onOpenShare: () => void
  userDisplayName?: string
  userRole?: string
}
```

Current button layout (left to right in `ml-auto` flex container):
1. User display name/role chip
2. **Cores** button (Branding popover) — only in edit mode
3. Compartilhar button
4. Comentarios button
5. Theme toggle (light/dark)
6. **Salvar** button — only when `editMode && dirty`
7. Editar/Sair da Edicao toggle

**Where to add Layout buttons:** After the "Cores" button group, before "Compartilhar". This keeps edit-mode tools grouped together. The Layout buttons should follow the same conditional pattern as "Cores" — only rendered when `editMode` is true.

## Existing Sheet Panel Pattern: PropertyPanel

**Location:** `tools/wireframe-builder/components/editor/PropertyPanel.tsx`

Pattern:
```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

<Sheet open={open} onOpenChange={(v) => !v && onClose()}>
  <SheetContent side="right" className="w-[400px] sm:w-[450px] overflow-y-auto">
    <SheetHeader>
      <SheetTitle>...</SheetTitle>
    </SheetHeader>
    <div className="mt-6">...</div>
  </SheetContent>
</Sheet>
```

The PropertyPanel is rendered **outside** the WireframeThemeProvider (line 1011 in WireframeViewer) so it uses app-level (shadcn) styling, not wireframe CSS variables. New Layout panels should follow the same placement — outside the wireframe theme provider, as app-level overlays.

## BlueprintConfig Types Relevant to Mutations

```typescript
type SidebarConfig = {
  footer?: string
  groups?: SidebarGroup[]
}

type HeaderConfig = {
  showLogo?: boolean
  showPeriodSelector?: boolean
  showUserIndicator?: boolean
  actions?: {
    manage?: boolean
    share?: boolean
    export?: boolean
  }
}

type BlueprintConfig = {
  slug: string
  label: string
  schemaVersion?: number
  sidebar?: SidebarConfig
  header?: HeaderConfig
  screens: BlueprintScreen[]
}
```

## handlePropertyChange — What NOT to Use

`handlePropertyChange(updated: BlueprintSection)` at line 596 is specifically for section-level edits. It reads `editMode.selectedSection` for `rowIndex/cellIndex` and calls `updateWorkingScreen`. Using it for dashboard-level config would:
1. No-op if no section is selected (`editMode.selectedSection` is null)
2. Target the wrong data path (`screens[N].rows[R].sections[C]` instead of `sidebar` or `header`)
3. Potentially corrupt screen data if a section happens to be selected

The `updateWorkingConfig()` helper is the correct approach for dashboard-level mutations.

## Design Decisions

1. **updateWorkingConfig pattern**: Follow same functional update + dirty flag pattern as updateWorkingScreen, but targets top-level config instead of screens[activeIndex]
2. **Panel state management**: Simple `useState<'sidebar' | 'header' | 'filters' | null>(null)` in WireframeViewer — no context needed since only WireframeViewer manages panel open/close
3. **Stub panels**: Sheet components with title only — content filled in Phases 50, 52, 53
4. **AdminToolbar callback pattern**: Add `onOpenLayoutPanel: (panel: 'sidebar' | 'header' | 'filters') => void` callback to AdminToolbar Props
5. **Overlay placement**: New panels rendered after PropertyPanel in "App-level overlays" section (outside WireframeThemeProvider)
