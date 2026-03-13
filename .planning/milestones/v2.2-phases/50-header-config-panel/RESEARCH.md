# Phase 50 Research: Header Config Panel

**Researched:** 2026-03-13
**Phase:** 50 — Header Config Panel
**Depends on:** Phase 48 (Header Render Wiring), Phase 49 (Dashboard Mutation Infrastructure)
**Requirements:** HDR-04, HDR-05, HDR-06

---

## Current State

### HeaderConfig Type (types/blueprint.ts)

The `HeaderConfig` type defines dashboard-level header appearance:

```typescript
export type HeaderConfig = {
  showLogo?: boolean              // defaults true
  showPeriodSelector?: boolean    // defaults true
  showUserIndicator?: boolean     // defaults true
  actions?: {
    manage?: boolean   // defaults true
    share?: boolean    // defaults true
    export?: boolean   // defaults false
  }
}
```

**Missing fields needed for this phase:**
- `brandLabel?: string` — custom display name overriding `config.label` in the header (HDR-05)
- `periodType?: PeriodType` — dashboard-level period type: 'mensal' | 'anual' (HDR-06)

These must be added to both `HeaderConfig` (types/blueprint.ts) and `HeaderConfigSchema` (lib/blueprint-schema.ts) as part of this phase's execution.

### HeaderConfigSchema (lib/blueprint-schema.ts)

```typescript
const HeaderConfigSchema = z.object({
  showLogo: z.boolean().optional(),
  showPeriodSelector: z.boolean().optional(),
  showUserIndicator: z.boolean().optional(),
  actions: z.object({
    manage: z.boolean().optional(),
    share: z.boolean().optional(),
    export: z.boolean().optional(),
  }).optional(),
}).passthrough()
```

The `.passthrough()` means `brandLabel` and `periodType` will survive a round-trip even before the schema is updated. However, they should be explicitly added for validation.

### WireframeHeader Component (components/WireframeHeader.tsx)

Currently accepts:
```typescript
type Props = {
  title: string
  logoUrl?: string
  brandLabel?: string       // from config.label
  showLogo?: boolean        // from config.header?.showLogo
}
```

After Phase 48 (HDR-01/02/03), WireframeHeader will also accept and render:
- `showPeriodSelector?: boolean`
- `showUserIndicator?: boolean`
- `actions?: { manage?: boolean; share?: boolean; export?: boolean }`
- `periodType?: PeriodType` (from HDR-06, needed for period selector display)

### WireframeViewer Header Rendering (pages/clients/WireframeViewer.tsx)

Currently passes to WireframeHeader:
```tsx
<WireframeHeader
  title={activeScreen.title}
  logoUrl={branding.logoUrl}
  showLogo={activeConfig?.header?.showLogo}
/>
```

After Phase 48, this will be expanded to pass all header config fields.

---

## Dependency Interfaces

### From Phase 48: Header Render Wiring

Phase 48 ensures all `HeaderConfig` fields are consumed by WireframeHeader. After Phase 48:

1. WireframeHeader renders/hides period selector based on `showPeriodSelector`
2. WireframeHeader renders/hides user chip based on `showUserIndicator`
3. WireframeHeader renders/hides action buttons based on `actions.*`
4. WireframeViewer passes all `activeConfig?.header` fields to WireframeHeader

**This is critical for Phase 50**: without Phase 48, toggling these fields in the panel would have no visible effect.

### From Phase 49: Dashboard Mutation Infrastructure

Phase 49 provides:

1. **`updateWorkingConfig()` helper** — a function in WireframeViewer that mutates `workingConfig` at the top level (not screen-level), sets `dirty: true`, enabling live preview
2. **AdminToolbar Layout button group** — "Sidebar", "Header", "Filtros" buttons visible in edit mode, each opening its respective Sheet panel
3. **Stub Sheet panels** — Phase 49 creates placeholder sheets that Phase 50 fills in

**updateWorkingConfig pattern** (from PITFALLS.md research):
```typescript
function updateWorkingConfig(updater: (config: BlueprintConfig) => BlueprintConfig) {
  setWorkingConfig((prev) => {
    if (!prev) return prev
    return updater(prev)
  })
  setEditMode((prev) => ({ ...prev, dirty: true }))
}
```

---

## Existing Editor Patterns

### PropertyPanel (Sheet for section editing)

Located at `tools/wireframe-builder/components/editor/PropertyPanel.tsx`. Uses:
- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
- Opens from right side, width 400-450px
- Controlled by `open` boolean prop
- Calls `onChange` callback with updated data

This is the pattern to follow for HeaderConfigPanel, with the key difference that HeaderConfigPanel will call `updateWorkingConfig()` instead of `handlePropertyChange()`.

### BrandingPopover (inline editor)

Located at `tools/wireframe-builder/components/editor/BrandingPopover.tsx`. Uses:
- Custom popover positioning (not Sheet)
- Direct state mutation via `updateBranding()`
- Inline color inputs with immediate feedback

HeaderConfigPanel will use the Sheet approach (like PropertyPanel) since it has more controls.

### Switch component (shadcn/ui)

Located at `src/components/ui/switch.tsx`. Standard radix Switch.
Used in existing codebase: `ModulesPanel.tsx`, `ThemeToggle.tsx`, `ComponentGallery.tsx`.

### Select component (shadcn/ui)

Located at `src/components/ui/select.tsx`. Full radix Select with trigger, content, items.

### Input component (shadcn/ui)

Located at `src/components/ui/input.tsx`. Standard controlled input.

### Label component (shadcn/ui)

Located at `src/components/ui/label.tsx`. Radix label for form fields.

---

## State Management Analysis

### How live preview works

1. AdminToolbar "Header" button sets `headerPanelOpen = true`
2. HeaderConfigPanel reads from `workingConfig.header` (not `config.header`)
3. When operator flips a toggle, panel calls `updateWorkingConfig()` with a new header value
4. `updateWorkingConfig()` calls `setWorkingConfig(updater)` + sets `dirty: true`
5. `activeConfig` is derived as `editMode.active && workingConfig ? workingConfig : config`
6. WireframeViewer passes `activeConfig?.header` fields to WireframeHeader
7. WireframeHeader re-renders with new values (immediate visual change)
8. Operator clicks "Salvar" in AdminToolbar to persist changes

### Persistence flow

- Save calls `saveBlueprintToDb(clientSlug, workingConfig, userId, lastUpdatedAt)`
- `workingConfig` now contains the updated `header` field
- On reload, `loadBlueprintFromDb` returns the config with updated header
- `BlueprintConfigSchema.parse()` validates the saved config (must pass with new fields)

---

## Schema Extension Needed

Phase 50 must add `brandLabel` and `periodType` to HeaderConfig:

**types/blueprint.ts:**
```typescript
export type HeaderConfig = {
  showLogo?: boolean
  showPeriodSelector?: boolean
  showUserIndicator?: boolean
  brandLabel?: string           // NEW — custom display name, overrides config.label
  periodType?: PeriodType       // NEW — dashboard-level period type (mensal/anual)
  actions?: {
    manage?: boolean
    share?: boolean
    export?: boolean
  }
}
```

**lib/blueprint-schema.ts:**
```typescript
const HeaderConfigSchema = z.object({
  showLogo: z.boolean().optional(),
  showPeriodSelector: z.boolean().optional(),
  showUserIndicator: z.boolean().optional(),
  brandLabel: z.string().optional(),
  periodType: PeriodTypeSchema.optional(),
  actions: z.object({
    manage: z.boolean().optional(),
    share: z.boolean().optional(),
    export: z.boolean().optional(),
  }).optional(),
}).passthrough()
```

---

## UI Design

### Panel Layout (Sheet, right side)

```
+----------------------------------+
| Header Config         [X close]  |
| Configure a aparencia do header  |
+----------------------------------+
|                                  |
| APARENCIA                        |
| -------------------------------- |
| Exibir Logo        [switch]      |
| Label Customizado  [_________]   |
|                                  |
| PERIODO                          |
| -------------------------------- |
| Seletor de Periodo [switch]      |
| Tipo de Periodo    [mensal v]    |
|                                  |
| USUARIO                          |
| -------------------------------- |
| Indicador de Usuario [switch]    |
|                                  |
| ACOES                            |
| -------------------------------- |
| Gerenciar          [switch]      |
| Compartilhar       [switch]      |
| Exportar           [switch]      |
+----------------------------------+
```

### Toggle grouping

1. **Aparencia** — showLogo, brandLabel
2. **Periodo** — showPeriodSelector, periodType
3. **Usuario** — showUserIndicator
4. **Acoes** — manage, share, export

---

## File Impact

| File | Change |
|------|--------|
| `tools/wireframe-builder/types/blueprint.ts` | Add `brandLabel` and `periodType` to `HeaderConfig` |
| `tools/wireframe-builder/lib/blueprint-schema.ts` | Add `brandLabel` and `periodType` to `HeaderConfigSchema` |
| `tools/wireframe-builder/components/editor/HeaderConfigPanel.tsx` | NEW — Sheet panel component |
| `src/pages/clients/WireframeViewer.tsx` | Wire HeaderConfigPanel open/close state, pass `updateWorkingConfig` and `activeConfig.header` |
| `tools/wireframe-builder/components/WireframeHeader.tsx` | Accept and render `brandLabel` from header config (Phase 48 may already handle this partially) |

---

## Risks

1. **Phase 48/49 not complete** — Panel will compile but toggles will have no visual effect if Phase 48 render wiring is missing. This phase MUST execute after both dependencies.
2. **brandLabel prop collision** — WireframeHeader already accepts `brandLabel` prop (from `config.label`). The header config `brandLabel` should override it. WireframeViewer must pass `activeConfig?.header?.brandLabel ?? activeConfig?.label` as the `brandLabel` prop.
3. **periodType scope** — `periodType` exists at screen level (`BlueprintScreen.periodType`). The dashboard-level `header.periodType` sets a default for the header period selector display, not per-screen override. Clear naming in the panel label avoids confusion.
4. **Schema backward compatibility** — Both new fields are optional with no defaults in Zod, so existing blueprints parse without errors. The `.passthrough()` on HeaderConfigSchema already provides forward-compat.
