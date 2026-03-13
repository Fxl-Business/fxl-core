# Phase 47 — Schema Foundation: Research

## Current State

### SidebarConfig (tools/wireframe-builder/types/blueprint.ts, lines 397-405)

```typescript
export type SidebarGroup = {
  label: string
  screenIds: string[]
}

export type SidebarConfig = {
  footer?: string
  groups?: SidebarGroup[]
}
```

Two fields, both optional. No widget support. Added in v1.3 (Phase 18).

### SidebarConfigSchema (tools/wireframe-builder/lib/blueprint-schema.ts, lines 57-65)

```typescript
const SidebarGroupSchema = z.object({
  label: z.string(),
  screenIds: z.array(z.string()),
})

export const SidebarConfigSchema = z.object({
  footer: z.string().optional(),
  groups: z.array(SidebarGroupSchema).optional(),
})
```

No `.passthrough()` on SidebarConfigSchema — unlike HeaderConfigSchema which has `.passthrough()` (line 76).
This means any unknown fields in `sidebar` would be stripped during `BlueprintConfigSchema.parse()`.
Adding `.passthrough()` is necessary for forward-compat (Phase 51+ may add fields to widgets).

### BlueprintConfigSchema (lines 504-511)

```typescript
export const BlueprintConfigSchema = z.object({
  slug: z.string(),
  label: z.string(),
  schemaVersion: z.number().default(1),
  sidebar: SidebarConfigSchema.optional(),
  header: HeaderConfigSchema.optional(),
  screens: z.array(BlueprintScreenSchema),
})
```

`sidebar` is optional at the config level. Old blueprints without `sidebar` field parse fine.

### Downstream Consumers of SidebarConfig / SidebarGroup

| File | Import | Usage |
|------|--------|-------|
| `src/pages/clients/WireframeViewer.tsx` | `import type { SidebarGroup } from '@tools/wireframe-builder/types/blueprint'` | `partitionScreensByGroups()` helper (line 57-60) uses `SidebarGroup[]` to group screens in sidebar nav |
| `src/pages/clients/WireframeViewer.tsx` | `activeConfig?.sidebar?.groups` | Read groups for rendering (line 897) |
| `src/pages/clients/WireframeViewer.tsx` | `activeConfig?.sidebar?.footer` | Read footer text (line 939) |
| `src/pages/SharedWireframeView.tsx` | No SidebarConfig/SidebarGroup import | Uses hardcoded sidebar layout (no groups, no widgets) |
| `tools/wireframe-builder/lib/blueprint-store.ts` | `BlueprintConfigSchema.safeParse()` on load, `.parse()` on save | Round-trips all config data through Zod validation |
| `tools/wireframe-builder/lib/blueprint-schema.test.ts` | Imports `SidebarConfigSchema` for direct testing | 4 test cases for sidebar schema validation |

### Existing Blueprint Data (financeiro-conta-azul)

Blueprint is stored in Supabase (not as .ts file). The config JSON for this client includes `sidebar` with `footer` and `groups` fields. Any schema change must allow these existing values to parse correctly.

### Research Documents

Two research docs propose slightly different SidebarWidget shapes:

**ARCHITECTURE.md** proposes flat widget with `position` field:
```typescript
export type SidebarWidget = {
  type: SidebarWidgetType
  position: 'top' | 'bottom'
  label?: string
  options?: string[]
}
```

**STACK.md** proposes true discriminated union:
```typescript
export type SidebarWidget =
  | { type: 'workspace-switcher'; workspaces?: string[] }
  | { type: 'user-menu'; showRole?: boolean }
  | ...
```

### Design Decision for Phase 47

Use a **true discriminated union** on `type` for TypeScript narrowing, but keep a flat `widgets?: SidebarWidget[]` array on SidebarConfig (not nested `widgets.top` / `widgets.bottom`). Each widget variant carries its own specific optional fields. Position is implicit from widget type (workspace-switcher renders in header zone, user-menu renders in footer zone) — Phase 51 SIDEBAR_WIDGET_REGISTRY maps type to zone.

Only two widget types are in scope for v2.2: `workspace-switcher` and `user-menu`.
Future types (account-selector, search) are deferred to v2.3+ per REQUIREMENTS.md.

### Key Constraint

All new fields MUST be optional. Existing blueprints without `widgets` must parse without errors.
Adding `.passthrough()` to `SidebarConfigSchema` ensures any future Phase 51+ fields on individual widgets survive the round-trip through `BlueprintConfigSchema.parse()`.
