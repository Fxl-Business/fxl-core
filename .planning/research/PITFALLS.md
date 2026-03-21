# Pitfalls Research

**Domain:** React admin panel — interactive graph visualization + module management refactor (v12.0)
**Researched:** 2026-03-21
**Confidence:** HIGH (based on direct codebase inspection + verified sources)

---

## Critical Pitfalls

### Pitfall 1: Graph Library Bundle Blow-Up

**What goes wrong:**
Adding a full-featured graph library (ReactFlow, cytoscape.js, vis-network) to the bundle for a single internal admin page inflates the initial load for all users — including non-admins who never visit `/admin/modules`. ReactFlow alone is ~200KB gzipped. For a platform whose primary use cases are docs and wireframes, this is disproportionate overhead on every page load.

**Why it happens:**
The library is installed globally and imported at the top of a component file. Vite/Rollup only tree-shakes at the module boundary — if the component file is in the main chunk, the library is in the main chunk. There is no automatic lazy boundary.

**How to avoid:**
Use `React.lazy()` + `Suspense` to code-split the graph component into its own chunk. The diagram only loads when the admin visits `/admin/modules`. Alternatively: with only 6 modules, a custom SVG layout built with Tailwind and absolute positioning entirely avoids the library problem. Decide approach before writing any code.

```tsx
// Lazy-load only if using a graph library
const ModulesOverviewPage = React.lazy(() => import('./ModulesOverviewPage'))
// Wrap at route level with Suspense
```

**Warning signs:**
- `npx vite-bundle-visualizer` shows the graph library in the main chunk
- Build output shows a single JS file that is measurably larger after adding the import
- `console.time` shows initial page load increased for the docs home page, not just /admin/modules

**Phase to address:** Phase 1 (Graph implementation decision) — choose approach before writing any code.

---

### Pitfall 2: Serializing React Components from MODULE_REGISTRY into Graph Node State

**What goes wrong:**
`ModuleDefinition.extensions[].injects` is typed as `Record<string, React.ComponentType<SlotComponentProps>>`. The `icon` field is a `LucideIcon` (also a React component). When extracting graph nodes from `MODULE_REGISTRY`, developers may copy the full `ModuleDefinition` object into React state as graph node data. React state must be serializable — storing function/component references causes stale closures, memory leaks, and "non-serializable value" warnings. If ReactFlow or similar is used, its internal store will also reject component references in node data.

**Why it happens:**
`MODULE_REGISTRY` looks like plain data at the import site. The `icon` and `injects` fields are function types but are not visually distinguishable from data when reading the registry array.

**How to avoid:**
Define a separate `GraphNode` and `GraphEdge` type containing only serializable primitives, and extract them from `MODULE_REGISTRY` once outside the component:

```ts
interface GraphNode {
  id: ModuleId
  label: string
  status: ModuleStatus
  description: string
  extensionCount: number
  // NO: icon, injects, routeConfig, useNavItems
}

interface GraphEdge {
  source: ModuleId
  target: ModuleId
  extensionId: string
  description: string
}

// Derive at module level, not inside the component
const GRAPH_NODES: GraphNode[] = MODULE_REGISTRY.map(m => ({
  id: m.id,
  label: m.label,
  status: m.status,
  description: m.description,
  extensionCount: m.extensions?.length ?? 0,
}))
```

Render the icon separately by looking it up from `MODULE_REGISTRY` by ID at render time — do not store it in state.

**Warning signs:**
- `GraphNode` type includes `icon: LucideIcon` or `injects: Record<...ComponentType...>`
- Full `ModuleDefinition` objects spread into graph node data
- Browser console warns about non-serializable values in state or Redux store

**Phase to address:** Phase 1 (Graph data model) — define serializable types before implementing the diagram.

---

### Pitfall 3: Breaking the Existing Module Toggle Flow During Refactor

**What goes wrong:**
`ModulesPanel` currently holds all Supabase state logic for reading/writing `tenant_modules`. Moving toggles to `TenantDetailPage` without first extracting this logic into a shared hook results in one of two failures:
1. Logic is duplicated — two files do the same Supabase upsert with the same optimistic update pattern, diverging over time.
2. Logic is moved but `TenantDetailPage` line 583-596 still has a "Gerenciar modulos" link pointing to `/admin/modules?org=...`. After the refactor, this link points to a page that no longer has toggles, confusing operators.

**Why it happens:**
The `TenantDetailPage` cross-link to `ModulesPanel` is at the bottom of a 650-line file. It is easy to miss during refactoring. The link is currently just a placeholder (`Gerencie os modulos ativos deste tenant na pagina de modulos`) and it feels harmless, so it survives the refactor unnoticed.

**How to avoid:**
1. Extract the Supabase toggle logic into `useModuleStates(orgId: string)` hook before moving any UI.
2. The hook owns: fetch from `tenant_modules`, optimistic update, upsert, revert on error.
3. Both `ModulesPanel` (legacy) and `TenantModulesSection` (new) use the same hook.
4. After moving toggles to TenantDetailPage, remove the "Gerenciar modulos" link and placeholder section (lines 577-596 in TenantDetailPage.tsx) entirely.

**Warning signs:**
- Two files both contain `supabase.from('tenant_modules').upsert(...)` with no shared hook
- The "Gerenciar modulos" link on TenantDetailPage survives after toggles have been moved there
- `grep -r "admin/modules" src/` returns a result inside TenantDetailPage.tsx after the refactor

**Phase to address:** Phase 2 (module toggle migration) — extract hook first, then migrate UI, then remove stale link.

---

### Pitfall 4: TenantDetailPage Becomes a God Component

**What goes wrong:**
`TenantDetailPage.tsx` is already ~650 lines managing: tenant data fetching, member list, add/remove member, impersonation, archive confirmation, and a placeholder modules section. Adding real module toggle logic (Supabase state, optimistic update, revert on error) inline to this file pushes it past ~900 lines. Finding bugs becomes hard; testing becomes impractical.

**Why it happens:**
The modules section feels like a "small addition" — `orgId` is already available from the parent, so developers inline the toggle state instead of extracting a component.

**How to avoid:**
Enforce a strict component boundary: extract module management into `<TenantModulesSection orgId={orgId} />`, a self-contained component that owns its own state and Supabase calls. It takes only `orgId` as prop. TenantDetailPage renders it as a black box.

```tsx
// In TenantDetailPage — replace lines 577-596 with:
<TenantModulesSection orgId={orgId} />

// TenantModulesSection.tsx owns ALL module state
export function TenantModulesSection({ orgId }: { orgId: string }) {
  const { moduleStates, isLoading, handleToggle } = useModuleStates(orgId)
  // ...rendering only
}
```

**Warning signs:**
- Module toggle state (`moduleStates`, `isLoadingModules`) is declared in `TenantDetailPage` rather than in a sub-component
- TenantDetailPage exceeds 700 lines after the addition
- `handleToggle` callback is defined in TenantDetailPage and passed down via props

**Phase to address:** Phase 2 (TenantModulesSection extraction) — enforce boundary before writing toggle logic.

---

### Pitfall 5: Graph Hover State Causes Full Re-Render of All Nodes

**What goes wrong:**
Implementing "hover a node to highlight connected edges" with naive state management causes every node and every edge component to re-render on each mouseover event. With 6 modules this is invisible, but the pattern is wrong and scales poorly.

**Why it happens:**
`hoveredNodeId` state lives in the page component. Every node receives an `isHighlighted` prop derived from parent state. When any node is hovered, all nodes re-render to check whether their prop changed.

**How to avoid:**
Use CSS-only hover highlights. For a small static graph (6 nodes), CSS hover with `group` modifiers in Tailwind and SVG edge coloring via CSS variables is the correct solution — zero JS state, zero re-renders:

```tsx
// SVG edges as absolute-positioned lines that respond to a parent CSS class
// No React state needed for visual highlight
<div className="group/node" data-module-id={node.id}>
  {/* edges use group-hover/node:stroke-indigo-500 via CSS */}
</div>
```

If click-to-lock highlight is needed (for navigation), store only the selected ID (`selectedNodeId`) as a single string — not a derived highlight map per node.

**Warning signs:**
- `hoveredNodeId` state lives in the page component and is passed to each node as a prop
- React DevTools Profiler shows all 6 nodes re-rendering on every mouseover
- `isHighlighted` prop computed in the parent for each node

**Phase to address:** Phase 1 (Graph interactivity) — decide hover strategy before wiring interactions.

---

### Pitfall 6: ModulesPanel URL Parameter Orphan After Refactor

**What goes wrong:**
After the refactor, `/admin/modules` becomes a read-only overview page. But the current `ModulesPanel` reads `searchParams.get('org')` to pre-select a tenant. If the `useSearchParams` usage survives into the new overview page, it silently processes a meaningless `?org=` parameter from old bookmarks or links. Worse: any external link pointing to `/admin/modules?org=someId` with intent to manage modules will now land on the wrong page with no indication that the workflow moved.

**Why it happens:**
URL parameter handling is at the top of the component and copied forward without auditing whether the new page still uses it.

**How to avoid:**
1. When rewriting `ModulesPanel` into the overview page, delete all `useSearchParams` usage entirely.
2. Search for all stale cross-references: `grep -r "admin/modules" src/` before marking the phase done.
3. If redirecting old links is needed, add a redirect in the router: `/admin/modules?org=:id` → `/admin/tenants/:id`.

**Warning signs:**
- `useSearchParams` still imported in the new ModulesPanel/overview component
- `grep -r "admin/modules" src/` returns results indicating tenant-scoped links still point there
- QA finds operator clicking "Gerenciar modulos" still navigates to the overview page instead of TenantDetailPage

**Phase to address:** Phase 3 (New overview page) — remove `useSearchParams` and audit cross-references at implementation time.

---

### Pitfall 7: Module Cards on Overview Page Include Toggle Switches

**What goes wrong:**
The overview page's module cards are visually similar to `ModulesPanel`'s existing `ModuleCard` component (which has a `Switch`). If the overview cards are built by copying `ModuleCard` without removing the toggle, operators visiting the overview page can toggle modules without selecting a tenant — the toggle fires with `selectedOrgId === null`, which the existing `handleToggle` guard silently swallows (`if (!selectedOrgId) return`). The UI shows a toggle that does nothing, which is confusing and erodes trust.

**Why it happens:**
`ModuleCard` is a convenient starting point for the new overview cards. Copy-paste with light editing leaves the `Switch` component in place.

**How to avoid:**
Define a new `ModuleOverviewCard` component from scratch — not derived from `ModuleCard`. It is display-only: icon, label, status badge, description, extensions list. No `Switch`, no `onToggle` prop. TypeScript enforces this — the props interface has no toggle-related fields.

**Warning signs:**
- New overview cards import `Switch` from `@shared/ui/switch`
- `ModuleOverviewCard` props interface includes `isEnabled` or `onToggle`
- A `Switch` component renders on `/admin/modules` after the refactor

**Phase to address:** Phase 3 (New overview page) — new card component, no shared code with ModuleCard.

---

### Pitfall 8: Extension Dependency Graph Edges Are Incorrect or Phantom

**What goes wrong:**
The `ModuleExtension.requires[]` array (in `registry.ts`) lists module IDs that must be enabled for the extension to activate. When deriving graph edges from this field to draw "module A depends on module B" lines, developers may misread the direction: `requires: ['tasks']` on a `clients` module extension means clients depends on tasks — the edge goes `clients → tasks`, not the reverse. Drawing the edge backwards makes the diagram actively misleading.

Additionally, if `requires[]` contains a string that is not a valid `ModuleId` (e.g., a slot ID like `clients:tasks-sidebar`), the graph will show a phantom node or a broken edge pointing to a non-existent module.

**Why it happens:**
`requires[]` is typed as `string[]`, not `ModuleId[]`. No validation fires at runtime. The graph rendering code maps over the array without checking whether each ID exists in `MODULE_REGISTRY`.

**How to avoid:**
1. When extracting edges, filter `requires` entries against `MODULE_REGISTRY.map(m => m.id)`:

```ts
const GRAPH_EDGES: GraphEdge[] = MODULE_REGISTRY.flatMap(mod =>
  (mod.extensions ?? []).flatMap(ext =>
    ext.requires
      .filter(reqId => MODULE_REGISTRY.some(m => m.id === reqId))
      .map(reqId => ({
        source: mod.id,     // the module that HAS the extension
        target: reqId as ModuleId,  // the module it REQUIRES
        extensionId: ext.id,
        description: ext.description,
      }))
  )
)
```

2. Direction: source = module declaring the extension, target = required module. An arrow from source to target means "needs."

**Warning signs:**
- `GRAPH_EDGES` includes an edge whose `target` does not match any `id` in `MODULE_REGISTRY`
- Diagram shows more nodes than `MODULE_REGISTRY.length`
- Extension arrows point in the direction that suggests "provides to" rather than "requires"

**Phase to address:** Phase 1 (Graph data model) — validate edges during extraction, before rendering.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline module toggle logic in TenantDetailPage | Faster to write | 900-line God component, impossible to test in isolation | Never — extract `TenantModulesSection` from day 1 |
| Import full ReactFlow without lazy loading | Simpler import statement | ~200KB added to main bundle for all users | Never — admin pages must be lazy-loaded |
| Copy full `ModuleDefinition` into graph node state | Less extraction code | Non-serializable React components in state; stale closures | Never — always derive a plain `GraphNode` type |
| Copy-paste Supabase toggle logic from ModulesPanel | Faster to implement | Duplicate fetch/upsert logic diverges independently | Never — extract `useModuleStates` hook instead |
| Copy `ModuleCard` and remove the toggle later | Faster card prototype | Toggle survives into production; overview page allows no-op mutations | Never — new `ModuleOverviewCard` from scratch |
| CSS-only SVG graph without a library | Zero bundle cost | Limited interactivity, harder to extend to 20+ modules | Acceptable for 6 static nodes with simple hover |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `MODULE_REGISTRY` as graph data source | Passing full `ModuleDefinition` (with React components) into graph node state | Extract serializable `GraphNode` fields — id, label, status, description, extensionCount |
| `extension.requires[]` for graph edges | Treating slot IDs (e.g., `clients:tasks-sidebar`) as module IDs | Filter against `MODULE_REGISTRY.map(m => m.id)` before creating edges |
| `tenant_modules` Supabase table | Re-fetching entire module list on every toggle | Use optimistic update already present in ModulesPanel — copy this pattern into the extracted `useModuleStates` hook |
| `useSearchParams` in ModulesPanel | Keeping `?org=` param logic in the new overview page | Remove `useSearchParams` entirely from the overview page |
| TenantDetailPage existing cross-link | Leaving "Gerenciar modulos" link pointing to `/admin/modules` after toggles are moved | Remove or replace that link section (lines 577-596) as part of Phase 2 |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Graph library in main bundle | First load slower for all routes, not just /admin/modules | `React.lazy()` + dynamic import for the overview page | From first build with the library added |
| Hover state at page level driving re-renders | All nodes re-render on every mouseover | CSS-only hover or graph-internal state; no `isHighlighted` prop per node | Visible with DevTools at any scale |
| Mounting graph on every overview page render | Graph resets visual state on unrelated state changes | `useMemo` for node/edge arrays; `React.memo` on the graph container | Every parent state change |
| Fetching `tenant_modules` on every TenantDetailPage mount with no cache | Supabase called on every `/admin/tenants/:id` navigation | `useModuleStates` hook caches result in a `useRef` with a short stale window | Frequent navigation between tenant detail pages |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Overview page accidentally exposes toggle mutations | Operator disables modules for all tenants without selecting one | `ModuleOverviewCard` has no `Switch` — TypeScript enforces this via props interface |
| Rendering extension descriptions from `ModuleExtension.description` via `dangerouslySetInnerHTML` | XSS if description ever comes from user input (it does not today, but the pattern is dangerous) | Always render as `{ext.description}` — never `dangerouslySetInnerHTML` |
| Toggle mutations callable from the overview page without a selected tenant | No-op silently accepted; operator confused | `handleToggle` guard (`if (!orgId) return`) already exists in ModulesPanel — the hook must preserve this |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Diagram is purely decorative with no click-through | Operators see a graph but cannot navigate to the relevant tenant or module detail | Each node click navigates to `/admin/modules#module-id` anchor or to a focused card |
| Module cards on overview include toggle switches | Operator confused: "which toggle is the real one?" (overview vs TenantDetailPage) | Overview page is display-only — no toggles anywhere |
| Extension `requires` IDs displayed raw (e.g., `connector`) | Non-technical operator cannot understand what the extension needs | Resolve the ID to a human-readable module label from `MODULE_REGISTRY` |
| Loading spinner blocks overview page while fetching per-tenant data | Overview renders blank on every visit | Overview page uses only static `MODULE_REGISTRY` — no async needed; render immediately with no loading state |
| Graph with no legend | Operator does not understand what edge direction means | Include a legend: "arrow = module requires" with a small example |

---

## "Looks Done But Isn't" Checklist

- [ ] **Stale link removed:** `grep -r "admin/modules" src/` returns zero results inside TenantDetailPage.tsx
- [ ] **No toggles on overview:** `grep -r "<Switch" src/platform/pages/admin/ModulesPanel` returns zero results after refactor
- [ ] **Bundle impact checked:** `npx vite-bundle-visualizer` run after any graph library addition — confirms it is in a lazy chunk, not the main chunk
- [ ] **Toggle parity:** Every toggle that existed in ModulesPanel is present and functional in TenantDetailPage's new `TenantModulesSection`
- [ ] **useSearchParams removed:** `grep "useSearchParams" src/platform/pages/admin/ModulesPanel` returns zero results
- [ ] **Graph edges validated:** No edge in `GRAPH_EDGES` has a `target` that does not match a `ModuleId` in `MODULE_REGISTRY`
- [ ] **GraphNode is serializable:** `GraphNode` type has no `React.ComponentType` or `LucideIcon` fields
- [ ] **Dark mode:** Graph diagram (SVG lines, node borders, status badges) renders correctly in dark mode — manual test in both modes
- [ ] **TypeScript zero errors:** `npx tsc --noEmit` passes after all changes — no unused imports from removed logic in ModulesPanel

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Graph library in main bundle | LOW | Move import to lazy component, rebuild — no logic changes needed |
| Duplicate toggle logic in two files | MEDIUM | Extract `useModuleStates` hook, replace both callsites — risk of subtle behavioral differences during extraction |
| God component (TenantDetailPage 900+ lines) | MEDIUM | Extract `TenantModulesSection`, move state — requires careful props/state boundary audit |
| Stale deep-link to old ModulesPanel | LOW | Find with grep, replace link target or remove — pure string change |
| Non-serializable data in graph node state | LOW | Define `GraphNode` type, re-derive from registry — no architectural change, just a refactor of the extraction code |
| Toggle switch visible on overview page | LOW | Remove `Switch` from `ModuleOverviewCard`, delete `onToggle` prop — component-level fix |
| Phantom graph edge from invalid `requires[]` entry | LOW | Add filter step in edge extraction — one line of code change |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Graph library bundle blow-up | Phase 1 — Graph approach decision | `npx vite-bundle-visualizer` shows graph code in a lazy chunk |
| Non-serializable `ModuleDefinition` in graph state | Phase 1 — Graph data model | `GraphNode` type has zero function or component fields |
| Phantom graph edges from invalid `requires[]` | Phase 1 — Graph data model | Each `GRAPH_EDGES` entry has a `target` matching a real `ModuleId` |
| Hover state O(n) re-renders | Phase 1 — Graph interactivity | React DevTools Profiler: only directly-affected elements re-render on mouseover |
| Duplicate Supabase toggle logic | Phase 2 — Extract `useModuleStates` hook | Only one file imports `supabase.from('tenant_modules')` for toggle mutations |
| TenantDetailPage God component | Phase 2 — `TenantModulesSection` extraction | TenantDetailPage < 700 lines after adding module section |
| Stale "Gerenciar modulos" deep-link | Phase 2 — Post-migration link audit | `grep -r "admin/modules" src/` returns zero results from TenantDetailPage |
| Toggle switches on overview page | Phase 3 — New overview page | No `<Switch` in ModulesPanel component tree |
| `useSearchParams` orphan | Phase 3 — New overview page | `useSearchParams` absent from ModulesPanel after rewrite |

---

## Sources

- Direct inspection of `src/platform/pages/admin/ModulesPanel.tsx` — current toggle logic, optimistic update pattern, `?org=` search param usage
- Direct inspection of `src/platform/pages/admin/TenantDetailPage.tsx` (lines 577-596) — stale "Gerenciar modulos" link and placeholder modules section
- Direct inspection of `src/platform/module-loader/registry.ts` — `ModuleDefinition` type including `React.ComponentType` fields in `extensions[].injects`
- Direct inspection of `src/platform/module-loader/extension-registry.ts` — `resolveExtensions` as reference for correct edge direction from `requires[]`
- [React Flow Performance Docs](https://reactflow.dev/learn/advanced-use/performance) — avoiding unnecessary re-renders in node-based UIs
- [npm trends: react-flow vs d3.js vs react-graph-vis](https://npmtrends.com/d3.js-vs-react-flow-vs-react-graph-vis) — library adoption and download comparison
- [React Docs: Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) — state extraction patterns when moving features between components
- [DEV: Ten React graph visualization libraries (2024)](https://dev.to/ably/top-react-graph-visualization-libraries-3gmn) — library landscape with bundle size context

---
*Pitfalls research for: v12.0 Admin Modules Overview — interactive graph + module management refactor*
*Researched: 2026-03-21*
