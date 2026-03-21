# Research Summary — v12.0 Admin Modules Overview

**Synthesized:** 2026-03-21
**Milestone:** v12.0 — Transform `/admin/modules` into a platform catalog with interactive dependency diagram

---

## Executive Summary

The v12.0 milestone is a focused admin page transformation: `/admin/modules` moves from a per-tenant module toggle panel to a platform-level architectural overview with an interactive dependency diagram and enriched module cards. The existing `ModulesPanel.tsx`, `MODULE_REGISTRY`, and `ModuleDefinition` manifest schema already contain everything needed — no new data sources, no schema changes, and only one optional new dependency (`@xyflow/react` + `@dagrejs/dagre`, justified only if the custom SVG approach is rejected for scalability reasons).

The recommended approach is consistent across all four research documents: use a custom SVG graph driven by fixed node positions and quadratic bezier edges, extract module toggle logic into a self-contained `TenantModulesSection` component, and relocate tenant management to `TenantDetailPage`. This produces zero new npm dependencies, keeps the bundle unchanged, and creates a clean architectural separation — the overview page is purely read-only from `MODULE_REGISTRY`, the tenant management page owns all Supabase state. The overview page renders immediately with no loading states.

The primary risks are organizational rather than technical: the refactor touches two existing admin pages simultaneously (`ModulesPanel` and `TenantDetailPage`) and requires coordinated removal of stale cross-references. The mitigation is strict phase sequencing — extract toggle logic first, wire `TenantDetailPage`, then transform `ModulesPanel` — so the tenant management flow is never broken mid-refactor.

---

## Key Findings

### From STACK.md

| Technology | Role | Decision |
|------------|------|----------|
| `@xyflow/react` ^12.10.1 | Directed graph rendering | OPTIONAL — use only if SVG custom approach is rejected; adds ~200KB gzipped to bundle |
| `@dagrejs/dagre` ^1.1.4 | Automatic node layout (x/y positions) | Paired with React Flow; unnecessary for 6-node static graph with fixed positions |
| `@types/dagre` ^0.7.3 | TypeScript types for dagre | Dev dependency; only needed if dagre is adopted |
| React 18, TypeScript 5, Tailwind 3, shadcn/ui | Existing stack | Unchanged; all v12.0 work runs on these |

**Critical version note:** If `@xyflow/react` is added, its CSS must be imported before Tailwind directives in `src/index.css`. Tailwind 3 compatibility confirmed without upgrade.

**Firm recommendation:** Do not add `@xyflow/react`. Custom SVG is the correct tool for 6 static nodes. React Flow is a future upgrade path if module count exceeds 15-20.

### From FEATURES.md

**P1 — Must have for v12.0 launch:**
- Remove tenant selector and module toggles from `ModulesPanel` (prerequisite — page purpose is ambiguous while management UI is present)
- Redesigned module cards: feature list from `navChildren`, route tag as monospace badge, `tenantScoped` indicator, polished extension display
- Interactive SVG dependency diagram: 6 nodes, edges from `extensions[].requires[]`, hover highlights connected edges
- Click a diagram node scrolls to and ring-highlights the corresponding module card
- Module count summary header: total, breakdown by status (active/beta/coming-soon)

**P2 — Add after P1s are stable:**
- Slot labels on diagram edges (SLOT_ID text near edge midpoint on hover)
- Module detail slide-over with full manifest info

**P3 / v13+ deferral:**
- Dynamic layout algorithm when module count grows past 10 (current fixed 2-row layout breaks at scale)
- Module health status (requires backend infrastructure not yet planned)
- Dependency graph PNG/SVG export (niche, low priority)

**Anti-features confirmed to avoid:**
- `@xyflow/react` for 6 static nodes — bundle cost with zero functional gain over custom SVG
- Toggle switches anywhere on the overview page — confuses purpose
- Real-time dependency data from backend — MODULE_REGISTRY is static; a backend call returns identical data
- Filter/search over 6 modules — absurd UX, adds noise
- D3 force-directed layout — non-deterministic, positions reflow on every render

### From ARCHITECTURE.md

**Component map for v12.0:**

| Component | Type | Responsibility |
|-----------|------|----------------|
| `ModulesPanel.tsx` | Modified | Platform overview: diagram + cards, zero Supabase calls after transformation |
| `ModuleGraphDiagram.tsx` | New | Reads MODULE_REGISTRY, derives nodes/edges via `useMemo`, renders interactive SVG/CSS graph |
| `ModuleOverviewCard.tsx` | New | Display-only per-module card — icon, label, status, description, extensions; no Switch |
| `TenantModuleToggles.tsx` | New (extracted) | Owns fetch/upsert/optimistic state for per-org module toggles; takes `orgId` prop |
| `TenantDetailPage.tsx` | Modified | Receives `<TenantModuleToggles orgId={...} />`, removes stale "Gerenciar modulos" link |
| `MODULE_REGISTRY` | Unchanged | Static source of truth — nodes and edges both derive from here; no schema changes |

All new files live in `src/platform/pages/admin/` — no new directories required.

**Key architectural principle:** `ModuleGraphDiagram` derives its graph entirely from `MODULE_REGISTRY` via `useMemo`. No network requests, no async, no Supabase calls on the overview page. Immediate render.

**Graph data derivation:**
- Nodes: one per `MODULE_REGISTRY` entry (`id`, `label`, `status` — serializable primitives only)
- Edges: derived from `extensions[].requires[]`, filtered against MODULE_REGISTRY IDs to exclude slot IDs
- Edge direction: `source = module declaring the extension`, `target = required module`

**Recommended 4-phase build order** (from ARCHITECTURE.md, rationale: tenant flow never breaks mid-refactor):
1. Extract `TenantModuleToggles.tsx` — toggle logic moves but stays functional
2. Wire into `TenantDetailPage`, remove stale "Gerenciar modulos" link (lines 577-596)
3. Build `ModuleOverviewCard` and `ModuleGraphDiagram`
4. Transform `ModulesPanel` — remove tenant logic, add diagram + cards

### From PITFALLS.md

**Top pitfalls with prevention strategies:**

| # | Pitfall | Phase | Prevention |
|---|---------|-------|------------|
| 1 | Graph library in main bundle (~200KB for all users, not just admins) | Phase 1 | Use custom SVG — zero deps. If React Flow is later required, wrap in `React.lazy()` at route level |
| 2 | `ModuleDefinition` (with `LucideIcon`, `React.ComponentType`) copied into graph state | Phase 1 | Define serializable `GraphNode` type — primitives only; look up icon from registry at render time, never store in state |
| 3 | Phantom/inverted graph edges from `requires[]` misread | Phase 1 | `source = module with extension`, `target = required module`; filter `requires[]` against `MODULE_REGISTRY.map(m => m.id)` to exclude slot IDs |
| 4 | Breaking toggle flow during refactor (duplicate logic or stale deep-links) | Phase 2 | Extract `useModuleStates(orgId)` hook first; delete TenantDetailPage stale link section as part of phase |
| 5 | `TenantDetailPage` becoming a 900-line god component | Phase 2 | Enforce `<TenantModulesSection orgId={orgId} />` boundary from day 1 — no module state in the parent |
| 6 | Toggle switches surviving onto the overview page | Phase 3 | Build `ModuleOverviewCard` from scratch, never from `ModuleCard` — TypeScript props interface has zero toggle fields |
| 7 | `useSearchParams` (`?org=` param) orphaned in new overview page | Phase 3 | Delete all `useSearchParams` usage when rewriting `ModulesPanel`; audit with `grep -r "admin/modules" src/` |
| 8 | Hover state at page level driving O(n) re-renders per mouseover | Phase 1 | CSS-only hover via Tailwind `group` modifiers; no `isHighlighted` prop per node; store only `selectedNodeId` string if click-lock needed |

**"Looks Done But Isn't" checklist (from PITFALLS.md):**
- `grep -r "admin/modules" src/` returns zero results inside `TenantDetailPage.tsx`
- `grep -r "<Switch" src/platform/pages/admin/ModulesPanel` returns zero results
- `useSearchParams` absent from new `ModulesPanel`
- `GraphNode` type has no `React.ComponentType` or `LucideIcon` fields
- All toggle behavior from old `ModulesPanel` is present and functional on `TenantDetailPage`
- Dark mode: SVG graph renders correctly (manual test required)
- `npx tsc --noEmit` passes with zero errors

---

## Implications for Roadmap

All research converges on the same 4-phase build order. Phases have explicit dependency gates. No phase requires a research spike — patterns are well-defined from existing codebase analysis.

### Suggested Phase Structure

**Phase 1 — Graph Data Model and Diagram Component**

Rationale: Establishes the foundational decisions (SVG vs library, serializable `GraphNode` type, edge direction, hover strategy) before any other code is written. Pitfalls 1, 2, 3, and 8 are all prevented here, making this the highest-leverage phase for the milestone.

Delivers: `ModuleGraphDiagram.tsx` — fully interactive with hover edge highlighting and click-to-scroll behavior.

Features from FEATURES.md: Interactive SVG diagram (P1), hover highlight (P1).

Pitfalls to prevent: Bundle blow-up, non-serializable state, phantom/inverted edges, hover re-renders.

Research flag: NO — custom SVG with fixed positions is a well-understood pattern; no library or algorithm complexity.

---

**Phase 2 — Tenant Toggle Migration**

Rationale: Extract and relocate toggle logic before transforming `ModulesPanel`. The tenant management flow must work on `TenantDetailPage` before it is removed from `ModulesPanel`. This is the prerequisite gate for Phase 4.

Delivers: `TenantModuleToggles.tsx` (extracted from ModulesPanel with `orgId` prop) + `TenantDetailPage` updated + stale "Gerenciar modulos" link removed.

Features from FEATURES.md: Tenant management relocated (P1 prerequisite).

Pitfalls to prevent: Broken toggle flow, duplicate Supabase logic, god component, stale deep-link to old page.

Research flag: NO — Supabase optimistic update pattern is already documented in existing `ModulesPanel`; extraction is a structural refactor with no new patterns.

---

**Phase 3 — ModuleOverviewCard and ModulesPanel Transformation**

Rationale: Executed only after Phase 2 confirms tenant management is fully functional on its new page. `ModuleOverviewCard` must be built from scratch (not from `ModuleCard`) to structurally prevent toggle survival.

Delivers: `ModuleOverviewCard.tsx` + `ModulesPanel.tsx` transformed into read-only platform overview.

Features from FEATURES.md: Rich module cards with feature list, route tag, tenantScoped badge, extension display (P1); module count summary header (P2).

Pitfalls to prevent: Toggle on overview page, `useSearchParams` orphan, stale cross-references (`grep` audit required).

Research flag: NO — card grid with Tailwind; `MODULE_REGISTRY` already has all required fields (`navChildren`, `route`, `tenantScoped`, `status`, `description`, `icon`, `extensions`).

---

**Phase 4 — Integration, P1 Completion, and P2 Features**

Rationale: Wire the diagram-to-card navigation (click-to-scroll via `useRef` map), validate the full system end-to-end, then layer in P2 enhancements once P1 is confirmed stable.

Delivers: Click-node scroll-to-card with ring highlight (P1); slot labels on diagram edges (P2); complete TypeScript + dark mode QA pass.

Features from FEATURES.md: Click-node navigation (P1), slot edge labels (P2).

Pitfalls to prevent: Diagram-to-card ref binding, dark mode SVG rendering, TypeScript clean compile, all items in "Looks Done But Isn't" checklist.

Research flag: NO — `scrollIntoView` + `Map<ModuleId, RefObject>` is a documented React pattern; no unknowns.

---

### Phase Dependencies

```
Phase 1 (Graph component)  ─── independent, can start immediately
Phase 2 (Toggle migration) ─── independent, can run in parallel with Phase 1
Phase 3 (Overview page)    ─── requires Phase 2 complete (toggles moved before ModulesPanel gutted)
Phase 4 (Integration + QA) ─── requires Phase 1 + Phase 3 complete
```

Phases 1 and 2 are independent and can be assigned to parallel agents.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Decisions from official `@xyflow/react` docs and direct codebase analysis. One conditional dependency clearly justified with bundle size data and alternatives table. |
| Features | HIGH | Feature scope grounded in existing `ModuleDefinition` schema — no speculative fields. All P1 items derive from data already in `MODULE_REGISTRY`. Anti-features list is detailed with specific reasons. |
| Architecture | HIGH | All findings from direct inspection of the exact files being changed. Component boundaries, line numbers for stale links, and data flow are all from actual source, not inference. |
| Pitfalls | HIGH | Pitfalls identified from codebase inspection with specific file paths, line numbers, and grep commands for verification. Not theoretical. Includes recovery cost estimates. |
| Overall | HIGH | All four documents are fully consistent. No contradictions between recommended approaches. Phase order, component boundaries, and anti-features all agree across all research files. |

### Gaps to Address

1. **Current state of `extends[].requires[]` in manifests:** Architecture research notes that `requires[]` in existing manifests currently contains self-references (a module requiring itself), not cross-module dependencies. The diagram may render with fewer cross-module edges than expected. Verify actual manifest contents before Phase 1 to understand whether meaningful edges exist or whether the diagram will be primarily node-display.

2. **`STATUS_LABELS` / `STATUS_CLASSES` location decision:** Both `TenantModuleToggles` and `ModuleOverviewCard` need these constants. The research does not specify whether to duplicate them inline or extract to a shared const file. Resolve this in Phase 3 before writing both components.

3. **`TenantDetailPage` line numbers:** Pitfalls research cites lines 577-596 for the stale "Gerenciar modulos" link. Verify the current line numbers haven't shifted before Phase 2, as the file may have been updated since the research was conducted.

---

## Aggregated Sources

**HIGH confidence (official documentation or direct codebase inspection):**
- [@xyflow/react npm](https://www.npmjs.com/package/@xyflow/react) — version 12.10.1 confirmed
- [React Flow installation docs (reactflow.dev)](https://reactflow.dev/learn/getting-started/installation-and-requirements) — peer deps, TypeScript, Vite
- [React Flow Tailwind CSS integration](https://reactflow.dev/examples/styling/tailwind) — CSS import order requirement
- [React Flow Dagre layout example](https://reactflow.dev/examples/layout/dagre) — `getLayoutedElements` pattern
- [React Flow TypeScript guide](https://reactflow.dev/learn/advanced-use/typescript) — `Node<T>`, `NodeProps<T>` usage
- [React Flow Performance Docs](https://reactflow.dev/learn/advanced-use/performance) — re-render avoidance patterns
- Direct codebase: `src/platform/pages/admin/ModulesPanel.tsx`
- Direct codebase: `src/platform/pages/admin/TenantDetailPage.tsx`
- Direct codebase: `src/platform/module-loader/registry.ts`, `module-ids.ts`, `extension-registry.ts`
- Direct codebase: `src/platform/module-loader/hooks/useModuleEnabled.tsx`, `module-signals.ts`
- Direct codebase: `src/platform/router/AppRouter.tsx`
- Direct codebase: `src/modules/tasks/manifest.ts`, `src/modules/connector/manifest.tsx`

**MEDIUM confidence (community sources, corroborated patterns):**
- [Dagre + React Flow custom nodes — ncoughlin.com](https://ncoughlin.com/posts/react-flow-dagre-custom-nodes)
- [Ten React graph libraries — DEV Community](https://dev.to/ably/top-react-graph-visualization-libraries-3gmn) — alternatives comparison
- Cambridge Intelligence comparative guide — React Flow vs reagraph/cytoscape for admin UI use cases
- [React Docs: Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- WebSearch: admin module catalog UI patterns 2025, plugin registry visualization (Backstage, Grafana, Linear references)
- [React Flow whats-new 2025-10-28](https://reactflow.dev/whats-new/2025-10-28) — Tailwind 3 backward compatibility confirmed

---

*Research synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
*Synthesized: 2026-03-21*
*Ready for roadmap: yes*
