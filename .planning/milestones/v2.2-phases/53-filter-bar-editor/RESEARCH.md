# Phase 53 Research: Filter Bar Editor

**Researched:** 2026-03-13
**Confidence:** HIGH (all findings from direct codebase analysis)
**Phase depends on:** Phase 49 (Dashboard Mutation Infrastructure)

---

## Current State Analysis

### FilterOption Type (5-variant filterType)

**Source:** `tools/wireframe-builder/components/WireframeFilterBar.tsx` (lines 4-9)

```typescript
export type FilterOption = {
  key: string
  label: string
  options?: string[]
  filterType?: 'select' | 'date-range' | 'multi-select' | 'search' | 'toggle'
}
```

Re-exported from `tools/wireframe-builder/types/blueprint.ts` (line 7, 20).

**Zod schema:** `FilterOptionSchema` in `tools/wireframe-builder/lib/blueprint-schema.ts` (lines 50-55):
```typescript
export const FilterOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
  options: z.array(z.string()).optional(),
  filterType: z.enum(['select', 'date-range', 'multi-select', 'search', 'toggle']).optional(),
})
```

Both the TypeScript type and Zod schema are aligned. No changes needed.

### BlueprintScreen.filters[] — Screen-Level Data

**Source:** `tools/wireframe-builder/types/blueprint.ts` (lines 385-395)

```typescript
export type BlueprintScreen = {
  id: string
  title: string
  // ...
  filters: FilterOption[]
  // ...
}
```

Filters are **screen-level data**, not dashboard-level. Each screen has its own `filters[]` array. This is the target data path for the FilterBarEditor.

### WireframeFilterBar Rendering

**Source:** `tools/wireframe-builder/components/WireframeFilterBar.tsx`

The component renders each FilterOption via a `FilterControl` switch that dispatches to 5 sub-components:
- `SelectFilter` — `filterType === 'select'` (or undefined/default)
- `DateRangeFilter` — `filterType === 'date-range'`
- `MultiSelectFilter` — `filterType === 'multi-select'`
- `SearchFilter` — `filterType === 'search'`
- `ToggleFilter` — `filterType === 'toggle'`

The filter bar is sticky-positioned inside the main content scroll area. It is rendered by `BlueprintRenderer.tsx` (line 147) using `<WireframeFilterBar filters={screen.filters} ...>`.

### How Filters Are Consumed

**Source:** `tools/wireframe-builder/components/BlueprintRenderer.tsx` (lines 147-152)

```tsx
<WireframeFilterBar
  filters={screen.filters}
  showCompareSwitch={screen.hasCompareSwitch}
  compareMode={compareMode}
  onCompareModeChange={setCompareMode}
  comparePeriodType={screen.periodType === 'anual' ? 'anual' : 'mensal'}
```

The filter bar reads directly from `screen.filters`. Any mutation to `screen.filters[]` via `updateWorkingScreen` will immediately reflect in the rendered filter bar.

### FilterConfigForm (DO NOT REUSE)

**Source:** `tools/wireframe-builder/components/editor/property-forms/FilterConfigForm.tsx`

This is for the `filter-config` **section block** (a content section type), NOT for the screen-level sticky filter bar. Key differences:
- Operates on `FilterConfigSection.filters[]` — 3-variant filterType: `period`, `select`, `date-range`
- Missing `key` field (FilterOption requires `key`)
- Missing filterTypes: `multi-select`, `search`, `toggle`
- Has `defaultValue` field that FilterOption does not have
- Data path: `screen.sections[N].filters` (section-level), NOT `screen.filters` (screen-level)

**Decision:** Build a new `FilterBarEditor` component. Do NOT reuse `FilterConfigForm`.

### updateWorkingScreen (Mutation Pattern)

**Source:** `src/pages/clients/WireframeViewer.tsx` (lines 458-470)

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

The FilterBarEditor will use this existing helper to mutate `screen.filters[]`:
```typescript
updateWorkingScreen(s => ({ ...s, filters: updatedFilters }))
```

This is the correct mutation path. No new mutation helper is needed for filter bar editing.

### AdminToolbar Entry Point (Phase 49 Dependency)

**Source:** `tools/wireframe-builder/components/editor/AdminToolbar.tsx`

Phase 49 will add a "Layout" button group (Sidebar, Header, Filtros) to AdminToolbar, visible only in edit mode. The "Filtros" button will set `openPanel('filter')` in WireframeViewer.

Phase 49 also introduces:
- `openPanel: 'sidebar' | 'header' | 'filter' | null` state in WireframeViewer
- `updateWorkingConfig()` helper for dashboard-level mutations (sidebar, header)
- AdminToolbar will receive `onOpenFilterPanel` callback

After Phase 49, the FilterBarEditor just needs to:
1. Accept `open`, `filters`, `onChange`, `onClose` props
2. Be rendered in WireframeViewer when `openPanel === 'filter'`

### Available shadcn/ui Components

All needed components already exist:
- `src/components/ui/sheet.tsx` — Sheet panel (side panel overlay)
- `src/components/ui/input.tsx` — text inputs
- `src/components/ui/button.tsx` — action buttons
- `src/components/ui/select.tsx` — dropdown selects
- `src/components/ui/badge.tsx` — filter type badges
- `src/components/ui/separator.tsx` — visual separators
- `src/components/ui/label.tsx` — form labels

---

## ROADMAP filterType Discrepancy

The ROADMAP success criteria #4 lists the 5 variants as: `date-range, multi-select, search, toggle, period-presets`. However, the actual codebase type is: `select | date-range | multi-select | search | toggle`. There is no `period-presets` variant in the schema or renderer. The 5th variant is `select` (also the default when `filterType` is undefined). The plan will use the actual codebase types.

---

## Key Constraints

1. **Screen-scoped edits:** Filter changes affect only `screens[safeActiveIndex].filters[]`. No cross-screen mutation.
2. **Live preview:** Changes via `updateWorkingScreen` immediately re-render the filter bar (no save required for preview).
3. **Zod round-trip safe:** `FilterOptionSchema` already validates all 5 filterTypes. No schema changes needed.
4. **Persist via existing save flow:** All changes flow through `workingConfig` and are saved by the single `handleSave` in WireframeViewer.
5. **No `any`:** All types are fully typed via `FilterOption` from `WireframeFilterBar.tsx`.
6. **Filter key uniqueness:** Each FilterOption needs a unique `key` field. The editor should generate a default key from the label or use a slug pattern.

---

## Sources

- `tools/wireframe-builder/components/WireframeFilterBar.tsx` — FilterOption type, 5 sub-renderers
- `tools/wireframe-builder/types/blueprint.ts` — BlueprintScreen.filters, FilterOption re-export
- `tools/wireframe-builder/lib/blueprint-schema.ts` — FilterOptionSchema (lines 50-55)
- `tools/wireframe-builder/components/BlueprintRenderer.tsx` — filter bar rendering (lines 147-152)
- `tools/wireframe-builder/components/editor/property-forms/FilterConfigForm.tsx` — section-level filter form (NOT for screen filters)
- `src/pages/clients/WireframeViewer.tsx` — updateWorkingScreen (lines 458-470), AdminToolbar wiring (lines 748-761)
- `.planning/research/ARCHITECTURE.md` — FilterBarEditor architecture, openPanel state pattern
- `.planning/research/PITFALLS.md` — Pitfall 1 (FilterType enum divergence), Pitfall 7 (sticky positioning)
- `.planning/REQUIREMENTS.md` — FILT-01 through FILT-05

---
*Research for Phase 53: Filter Bar Editor*
*Researched: 2026-03-13*
