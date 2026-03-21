# Architecture Research

**Domain:** Admin Modules Overview Page — v12.0 integration into existing Nexo platform
**Researched:** 2026-03-21
**Confidence:** HIGH (all findings derived from direct codebase analysis — no speculation)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  React 18 SPA (Vercel)                                                        │
│                                                                                │
│  ┌──────────────────────────────────────────┐  ┌────────────────────────────┐ │
│  │  Admin Panel (/admin/*)                   │  │  Operator Modules           │ │
│  │  src/platform/pages/admin/                │  │  src/modules/               │ │
│  │                                           │  │  docs, tasks, clients...    │ │
│  │  ModulesPanel.tsx  [TRANSFORM v12.0]      │  └────────────────────────────┘ │
│  │    Before: tenant toggle per org          │                                  │
│  │    After:  platform overview +            │  ┌────────────────────────────┐ │
│  │            diagram + cards                │  │  src/platform/              │ │
│  │                                           │  │  module-loader/             │ │
│  │  TenantDetailPage.tsx  [EXTEND v12.0]     │  │    registry.ts  ← source   │ │
│  │    Add: inline module toggles             │  │    module-ids.ts           │ │
│  │    Remove: link "Gerenciar modulos →"     │  │    hooks/useModuleEnabled  │ │
│  │                                           │  │    module-signals.ts       │ │
│  └───────────────────┬──────────────────────┘  └─────────────────────────── ┘ │
│                      │                                                          │
│  ┌───────────────────▼──────────────────────────────────────────────────────┐  │
│  │  New Components (platform-scoped)                                         │  │
│  │  src/platform/pages/admin/                                                │  │
│  │                                                                            │  │
│  │  ModuleGraphDiagram.tsx  — reads MODULE_REGISTRY, derives edges from      │  │
│  │                            extensions[].requires[], renders SVG/div graph │  │
│  │  ModuleOverviewCard.tsx  — per-module card: status, description,          │  │
│  │                            extensions list, no toggle                      │  │
│  │  TenantModuleToggles.tsx — extracted toggle section for TenantDetailPage  │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Data layer                                                               │   │
│  │  MODULE_REGISTRY (static)  ←  manifests from src/modules/*/manifest.*   │   │
│  │  Supabase tenant_modules   ←  per-org enabled state (only in toggles)   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Location |
|-----------|----------------|----------|
| `ModulesPanel.tsx` | Platform overview: diagram + module cards (no toggles) | `src/platform/pages/admin/` (modified) |
| `ModuleGraphDiagram.tsx` | Interactive connection diagram derived from MODULE_REGISTRY | `src/platform/pages/admin/` (new) |
| `ModuleOverviewCard.tsx` | Per-module display: status badge, description, extensions | `src/platform/pages/admin/` (new) |
| `TenantModuleToggles.tsx` | Per-tenant enable/disable switches + Supabase upsert | `src/platform/pages/admin/` (new, extracted) |
| `TenantDetailPage.tsx` | Tenant detail: existing sections + inline module toggles | `src/platform/pages/admin/` (modified) |
| `MODULE_REGISTRY` | Static source of truth for all module metadata and extensions | `src/platform/module-loader/registry.ts` (unchanged) |

## Recommended Project Structure

The new files all live inside the existing `admin/` folder — no new directories needed.

```
src/platform/pages/admin/
├── ModulesPanel.tsx          # MODIFIED: strip tenant logic, add diagram + cards
├── ModuleGraphDiagram.tsx    # NEW: interactive diagram component
├── ModuleOverviewCard.tsx    # NEW: card for each module (read-only)
├── TenantModuleToggles.tsx   # NEW: extracted toggle section
├── TenantDetailPage.tsx      # MODIFIED: add TenantModuleToggles, remove link
├── AdminDashboard.tsx        # unchanged
├── TenantsPage.tsx           # unchanged
└── ...                       # other admin pages unchanged
```

### Structure Rationale

- **All new components in `admin/`:** All three new components are exclusively consumed by admin pages. No module or shared layer needs them. Keeping them co-located avoids false abstraction.
- **No `src/shared/` additions:** The diagram and cards are admin-only. Shared layer is for cross-feature primitives (shadcn wrappers, utils). Platform-admin components are not shared.
- **Extracted `TenantModuleToggles`:** The toggle logic (fetch tenant_modules, optimistic upsert) is substantial and identical whether it lives inline in TenantDetailPage or ModulesPanel. Extracting it into a focused component makes both consumers clean.

## Architectural Patterns

### Pattern 1: Derive Graph Edges from MODULE_REGISTRY at Render Time

**What:** `ModuleGraphDiagram` computes nodes and edges from MODULE_REGISTRY in a `useMemo`. No new data structure or graph store — the registry is the graph.

**When to use:** The relationship data already exists in `extensions[].requires[]`. Creating a parallel data structure would duplicate it and drift.

**Trade-offs:** Pro — zero data sync issues. Con — requires parsing the registry format on every render (acceptable: 6 modules, O(n) parse).

**Example:**
```typescript
// Inside ModuleGraphDiagram.tsx
const graph = useMemo(() => {
  const nodes = MODULE_REGISTRY.map(m => ({ id: m.id, label: m.label, status: m.status }))
  const edges: Array<{ from: string; to: string; extensionId: string }> = []

  for (const mod of MODULE_REGISTRY) {
    for (const ext of mod.extensions ?? []) {
      for (const requiredId of ext.requires) {
        edges.push({ from: mod.id, to: requiredId, extensionId: ext.id })
      }
    }
  }

  return { nodes, edges }
}, []) // MODULE_REGISTRY is module-level const, stable reference
```

The `requires` array in each `ModuleExtension` specifies which modules an extension depends on. For example, `tasks-home-widget` has `requires: [MODULE_IDS.TASKS]` — meaning the Tasks module requires itself to be enabled (self-dependency, which means no cross-module edge). Only extensions with `requires` pointing to a *different* module ID produce a visible diagram edge.

**Current state of cross-module edges:** Looking at existing manifests, `requires` arrays reference the module's own ID (self-declaration). The diagram will have nodes for all 6 modules and will highlight which modules expose extensions into which slots. Edges can also be derived from `ext.injects` keys (slot targets) for a richer diagram.

### Pattern 2: Tenant Toggle as Controlled Component via `orgId` Prop

**What:** `TenantModuleToggles` accepts `orgId: string` and `orgName: string` as props. It owns its own fetch and upsert state internally — identical logic to the current `ModulesPanel` but scoped to a single org.

**When to use:** `TenantDetailPage` already has `orgId` from URL params. No context or lifting needed.

**Trade-offs:** Pro — self-contained, testable in isolation, no global state. Con — if multiple toggle instances existed simultaneously (they won't), each would have its own fetch.

**Example:**
```typescript
// src/platform/pages/admin/TenantModuleToggles.tsx
interface TenantModuleTogglesProps {
  orgId: string
  orgName: string
}

export function TenantModuleToggles({ orgId, orgName }: TenantModuleTogglesProps) {
  // identical fetch/toggle/upsert logic currently in ModulesPanel
  // ...
}

// Usage in TenantDetailPage.tsx (replaces the "Gerenciar modulos" link section):
<TenantModuleToggles orgId={tenant.id} orgName={tenant.name} />
```

### Pattern 3: ModulesPanel Becomes a Read-Only Overview

**What:** After extracting toggle logic to `TenantModuleToggles`, `ModulesPanel` is repurposed to show the platform-level view: diagram at top, module cards below. No tenant selector, no toggles, no Supabase calls.

**When to use:** The admin panel route `/admin/modules` becomes an information architecture page — "what is the module system" — rather than a management page. Management moves to where context already exists (tenant detail).

**Trade-offs:** Pro — clear separation of concerns, each page has one job. Con — operators must navigate to a specific tenant to toggle modules (one extra click, but more intentional).

## Data Flow

### Module Overview Page (New)

```
User navigates to /admin/modules
    ↓
ModulesPanel renders
    ↓
ModuleGraphDiagram reads MODULE_REGISTRY (synchronous, no fetch)
    → useMemo derives nodes[] and edges[]
    → renders interactive SVG or CSS-positioned div diagram
    ↓
ModuleOverviewCard per module — static render from MODULE_REGISTRY
    → shows label, description, status badge
    → lists extensions with slot targets
    ↓
No Supabase calls on this page
```

### Tenant Module Toggles (Moved)

```
User navigates to /admin/tenants/:orgId
    ↓
TenantDetailPage fetches tenant detail (existing)
    ↓
TenantModuleToggles mounts with orgId prop
    → fetches tenant_modules WHERE org_id = orgId
    → builds Map<moduleId, enabled>
    ↓
User toggles a switch
    → optimistic update to local Map
    → supabase.upsert({ org_id, module_id, enabled })
    → revert on error
    → toast on success/failure
```

### Key Data Flows

1. **Graph derivation:** MODULE_REGISTRY static array → `useMemo` → `{ nodes, edges }` — happens once at component mount, no network, no async.
2. **Tenant state fetch:** `orgId` prop → Supabase `tenant_modules` query → `Map<ModuleId, boolean>` — same pattern as current `ModulesPanel`, just triggered by prop change instead of Select change.
3. **Toggle mutation:** Switch `onCheckedChange` → optimistic state update → `supabase.upsert` → rollback on error — no change from current implementation.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (6 modules) | Static diagram with CSS positioning or simple SVG — no library needed |
| 15-20 modules | Consider a layout algorithm (dagre, elk) to auto-position nodes — still same data model |
| 50+ modules | Graph library becomes necessary (react-flow, d3-force) — data model unchanged, only renderer swaps |

### Scaling Priorities

1. **First bottleneck:** Diagram readability as module count grows. At 6 modules, a hand-crafted CSS grid or SVG with explicit positions is fine and avoids a dependency. Document node positions as constants so they can be tuned.
2. **Second bottleneck:** Toggle fetch on TenantDetailPage adds a Supabase query per page load. Already acceptable — same as current ModulesPanel. If tenant detail becomes slow, lazy-load `TenantModuleToggles` behind a `<Suspense>` boundary.

## Anti-Patterns

### Anti-Pattern 1: Moving Toggle Logic to a New Shared Hook

**What people do:** Extract `useTenantModules(orgId)` into `src/platform/module-loader/hooks/` to share between old ModulesPanel and new TenantDetailPage.

**Why it's wrong:** ModulesPanel no longer needs this logic at all after v12.0. Creating a shared hook for a single consumer adds indirection with no benefit. The hook would also need the full optimistic + toast + rollback behavior, making it heavier than a component.

**Do this instead:** Extract a `TenantModuleToggles` component that owns its own local state. Components are the right unit for UI + side effects.

### Anti-Pattern 2: Using react-flow or a Graph Library for the Diagram

**What people do:** Install react-flow because "it's a graph" and use its node/edge system.

**Why it's wrong:** 6 modules with known relationships do not need a force-directed or drag-repositionable graph library. react-flow adds ~150KB to the bundle and requires learning its API, configuration, and CSS reset conflicts. The positions can be defined as layout constants.

**Do this instead:** Use a CSS grid or absolute-positioned `div` nodes with SVG `<line>` or `<path>` connectors drawn between them. This is maintainable, zero-dep, and perfectly readable at current scale.

### Anti-Pattern 3: Putting ModuleGraphDiagram in `src/shared/`

**What people do:** Assume "reusable" means "shared/". The diagram reads MODULE_REGISTRY, which is platform-internal.

**Why it's wrong:** `src/shared/` is for framework-agnostic primitives (shadcn wrappers, utility functions, generic hooks). Components that depend on platform-specific registries belong in `src/platform/`. Putting the diagram in shared would require importing platform internals from the shared layer, inverting the dependency direction.

**Do this instead:** Keep `ModuleGraphDiagram.tsx` in `src/platform/pages/admin/`. It is an admin UI component, not a shared primitive.

### Anti-Pattern 4: Keeping the Tenant Selector in ModulesPanel

**What people do:** Keep the existing `<Select>` for tenant on ModulesPanel and add the diagram above it.

**Why it's wrong:** The goal of v12.0 is to make `/admin/modules` a platform-level overview, not a per-tenant management tool. Having both a platform diagram and a tenant selector on the same page creates ambiguity about what the page is for. The operator reads the overview as platform-scoped, then is asked to select a tenant — scope-switching mid-page is confusing.

**Do this instead:** Remove the tenant selector from ModulesPanel entirely. Tenant module management lives exclusively on TenantDetailPage.

## Integration Points

### Existing Architecture — What Changes and What Stays

| Component | Change | Notes |
|-----------|--------|-------|
| `ModulesPanel.tsx` | Major modification — remove tenant selector, fetch, toggle logic; add diagram + overview cards | Page now zero Supabase calls |
| `TenantDetailPage.tsx` | Add `<TenantModuleToggles orgId={tenant.id} orgName={tenant.name} />` inside the "Modulos" section; remove the "Gerenciar modulos →" link | The stub section at line 578 already exists and is ready for this |
| `TenantModuleToggles.tsx` | New component — extracted from ModulesPanel with `orgId` prop instead of Select | Identical Supabase logic, just driven by prop |
| `ModuleGraphDiagram.tsx` | New component — reads MODULE_REGISTRY, no props needed | Pure computation + render |
| `ModuleOverviewCard.tsx` | New component — renders one module's metadata (no toggle) | Reuses STATUS_LABELS/STATUS_CLASSES from ModulesPanel |
| `MODULE_REGISTRY` | Unchanged | Already has everything needed: `extensions[].requires`, `extensions[].injects`, `status`, `description` |
| `AppRouter.tsx` | No change needed | `/admin/modules` route already points to ModulesPanel via lazy import |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| ModuleGraphDiagram → MODULE_REGISTRY | Direct import (same package, `@platform/module-loader/registry`) | No abstraction layer needed |
| TenantModuleToggles → Supabase | Direct via `@platform/supabase` client | Same pattern as current ModulesPanel |
| TenantDetailPage → TenantModuleToggles | Props: `orgId`, `orgName` | No context, no lifting |
| ModulesPanel → ModuleGraphDiagram | Import, no props | Diagram is self-contained |
| ModulesPanel → ModuleOverviewCard | Import, passes `mod: ModuleDefinition` | Thin display component |

## Suggested Build Order

**Phase 1 — Extract toggle logic (enables TenantDetailPage work in parallel)**

1. Create `TenantModuleToggles.tsx` by extracting the fetch + toggle + upsert logic from `ModulesPanel.tsx`. Accept `orgId: string` and `orgName: string` as props instead of the `<Select>`. Keep `STATUS_LABELS`, `STATUS_CLASSES`, and `ModuleCard` locally for now.
2. Verify TypeScript — `npx tsc --noEmit`.

**Phase 2 — Wire TenantDetailPage**

3. In `TenantDetailPage.tsx`, replace the "Modulos" section (lines 577-597) with `<TenantModuleToggles orgId={tenant.id} orgName={tenant.name} />`. Remove the `Blocks` and `ExternalLink` imports if no longer used.
4. Verify TypeScript + visual check on `/admin/tenants/:orgId`.

**Phase 3 — Build overview components**

5. Create `ModuleOverviewCard.tsx` — display-only card with icon, label, description, status badge, and extensions list. Move `STATUS_LABELS`/`STATUS_CLASSES` to this file (or a small shared const) so both `TenantModuleToggles` and `ModuleOverviewCard` import from one place.
6. Create `ModuleGraphDiagram.tsx` — compute `{ nodes, edges }` from MODULE_REGISTRY, render as positioned nodes with SVG connector lines. Add hover state to highlight a node's connections.

**Phase 4 — Transform ModulesPanel**

7. Replace `ModulesPanel.tsx` body: remove the tenant selector, the fetch, the toggle logic. Add `<ModuleGraphDiagram />` at the top and a responsive grid of `<ModuleOverviewCard />` below. Update the page header copy to reflect the new purpose.
8. Final TypeScript check + visual verification of both `/admin/modules` and `/admin/tenants/:orgId`.

**Rationale for order:** Extracting `TenantModuleToggles` first means the tenant management flow is never broken — it just moves from one page to another. The ModulesPanel transformation in Phase 4 only happens after the replacement is working.

## Sources

- Direct codebase analysis: `src/platform/pages/admin/ModulesPanel.tsx`
- Direct codebase analysis: `src/platform/pages/admin/TenantDetailPage.tsx`
- Direct codebase analysis: `src/platform/module-loader/registry.ts`
- Direct codebase analysis: `src/platform/module-loader/module-ids.ts`
- Direct codebase analysis: `src/platform/module-loader/hooks/useModuleEnabled.tsx`
- Direct codebase analysis: `src/platform/module-loader/module-signals.ts`
- Direct codebase analysis: `src/platform/router/AppRouter.tsx`
- Direct codebase analysis: `src/modules/tasks/manifest.ts`
- Direct codebase analysis: `src/modules/connector/manifest.tsx`

---
*Architecture research for: Admin Modules Overview Page (Nexo v12.0)*
*Researched: 2026-03-21*
