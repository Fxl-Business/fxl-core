# Feature Research

**Domain:** Admin module overview page — platform catalog with dependency visualization
**Researched:** 2026-03-21
**Milestone:** v12.0 Admin Modules Overview
**Confidence:** HIGH (design decisions grounded in existing codebase; MEDIUM for library specifics)

---

## Context: What Already Exists vs What Is New

This research is scoped to v12.0 additions. The platform already has:

### Already built (not in scope)
- `/admin/modules` page (`ModulesPanel.tsx`) with tenant selector, per-tenant enable/disable toggles
- `MODULE_REGISTRY` with 6 `ModuleDefinition` entries: docs, ferramentas, projects, clients, tasks, connector
- `ModuleDefinition` schema: id, label, description, status, badge, enabled, tenantScoped, extensions[], icon, route, navChildren, routeConfig
- `ModuleExtension` schema: id, requires[], description, injects (Record<SlotId, Component>)
- `SLOT_IDS`: HOME_DASHBOARD, HOME_QUICK_ACTIONS
- Basic `ModuleCard` showing icon, label, status badge, description, extensions list with slot names
- `tenant_modules` Supabase table for per-org module enable/disable state

### What v12.0 adds (this milestone)
- Transform `/admin/modules` from tenant management tool to platform overview page
- Interactive dependency diagram showing module interconnections
- Enriched module cards with feature lists, route, tenantScoped indicator, richer extension details
- Module management per-tenant moved to `TenantDetailPage`

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that make this feel like a real platform catalog. Missing any = page feels incomplete or purposeless.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Module grid — richer cards | Any platform catalog shows modules in a scannable grid with more than just a toggle | LOW | Enhance existing ModuleCard: add feature list from navChildren, route badge, tenantScoped indicator, styled extension pills |
| Status badges per module | Visual state at a glance — active/beta/coming-soon is a standard admin catalog pattern | LOW | Already exists; needs layout adjustment without toggle row |
| Extensions visible per card | The extension system's value is transparency — operators need to see what each module injects | LOW | Already exists in current panel; refine the display |
| Module count summary header | "6 modules, 4 active, 2 beta" sets operator expectations before reading cards | LOW | Current panel has activeCount/total but scoped to tenant; repurpose as platform-level summary |
| Page title and description updated | Clear heading that this is an overview, not a management page | LOW | Change "Gerencie os modulos ativos por tenant" to platform-level description |
| Responsive grid layout | Must be readable on all screen sizes | LOW | Already uses `grid-cols-1 lg:grid-cols-2` — maintain pattern |
| Remove tenant selector and toggles | The page has a new purpose; tenant management controls are wrong context here | LOW | Delete selector and Switch; pure read-only render from MODULE_REGISTRY |

### Differentiators (What Makes This Valuable)

Features that elevate this beyond a list into an architectural overview tool.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Interactive SVG dependency diagram | Shows HOW modules connect — which extensions inject into which slots, and which modules require which | MEDIUM | Custom SVG with fixed node positions (2 rows of 3), bezier path edges, hover highlights connected edges; no new library needed |
| Hover-highlight on diagram | Hovering a node highlights its direct edges and connected peers — makes dependency reading intuitive | LOW | React `useState` + CSS `stroke` change on edges; trivial with custom SVG |
| Click-node scrolls to card | Clicking a diagram node scrolls and ring-highlights the corresponding module card — connects diagram to catalog | MEDIUM | `useRef` map keyed by `mod.id`; click handler calls `scrollIntoView({ behavior: 'smooth' })` + sets active card state |
| Module feature list in cards | Cards show what the module provides (nav items from navChildren flattened) — turns opaque modules into explained capabilities | LOW | Flatten `navChildren` into bullet list; derive from existing manifest data; zero new schema needed |
| Route path visible on card | Shows where the module lives in the app — useful for operators onboarding to the platform | LOW | `mod.route` already in `ModuleDefinition`; display as monospace tag |
| tenantScoped indicator | Distinguish platform-wide modules from per-tenant modules visually — important architectural distinction | LOW | One badge or icon; `mod.tenantScoped` already in `ModuleDefinition` |
| Slot labels on diagram edges | Edge labels show SLOT_ID text on hover — tells operators exactly what gets injected where | LOW-MEDIUM | SVG `<text>` or tooltip near edge midpoint; enhances diagram readability |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full React Flow / @xyflow/react integration | "Real" graph editor feel with drag-drop, zoom, pan | ~150KB+ bundle addition; brings in d3-zoom dependency; overkill for 6 static nodes; not in current stack; complex setup for zero added functional value | Custom SVG with absolute-positioned nodes and SVG `<path>` bezier edges — zero cost, full control, perfectly adequate for 6-node static graph |
| Module enable/disable toggle on overview page | "Reuse existing toggle UI from current panel" | Mixes management concerns into an overview page — confuses purpose; operators arrive to understand the platform, not to configure it | Keep toggles on TenantDetailPage as planned; this page is explicitly read-only |
| Real-time dependency data from backend | "Live graph" sounds impressive | Extensions are statically defined in MODULE_REGISTRY — there is no dynamic runtime dependency to fetch; a backend call would return the same data as the in-memory registry | Drive diagram entirely from MODULE_REGISTRY; no Supabase calls needed for the overview page |
| Filterable/searchable module grid | Power-user feature | Only 6 modules; filter adds visual noise with zero practical value; text search over 6 items is absurd | Use clear status badges and section grouping; revisit if module count exceeds ~15 |
| D3.js force-directed layout for diagram | "Automatic positioning looks impressive" | Force-directed is non-deterministic; positions reflow on every render; jarring animation for a static 6-node graph; brings in d3 as a dependency | Fixed positions defined by hand in a 2-row layout (3 modules per row); deterministic, visually predictable, and easy to maintain |
| Expandable/collapsible module cards | "Save space, show more" | 6 cards fit cleanly in a 2-column grid; interaction complexity for marginal benefit; complicates the "card as artifact" mental model | Fixed-height cards with consistent layout; extensions section already compact |
| Inline module editing from overview | "Manage from one place" | Responsibility confusion: overview is for understanding, not configuration; mixing these creates UX debt | Admin > Tenants for per-tenant management; future module settings page for module-level config |

---

## Feature Dependencies

```
[Remove tenant selector + toggles]
    └──prerequisite for──> [Page redesign]
                               (page purpose is ambiguous while management UI is present)

[Interactive SVG diagram]
    └──requires──> [MODULE_REGISTRY extensions[] with requires[]]
                       └──already exists (module-ids.ts + registry.ts)
    └──data source: MODULE_IDS (6 nodes) + ModuleExtension.requires[] (edges)

[Hover highlight on diagram]
    └──requires──> [Diagram node rendering]
    └──implemented via──> React useState (no additional dependency)

[Click-to-scroll card focus]
    └──requires──> [Diagram rendered]
    └──requires──> [Card grid rendered with stable refs]
    └──implemented via──> useRef map keyed by mod.id + scrollIntoView

[Module feature list in cards]
    └──requires──> [navChildren available in ModuleDefinition]
    └──note: navChildren already in ModuleManifest, inherited by ModuleDefinition
    └──zero new schema changes needed

[Slot labels on diagram edges]
    └──requires──> [Diagram edges rendered]
    └──data source: ModuleExtension.injects keys (already SLOT_IDS)

[Tenant management removal]
    └──requires──> [TenantDetailPage receives module toggle UI]
    └──unblocks──> [Overview page becoming read-only]
```

### Dependency Notes

- **Tenant management removal is phase prerequisite:** If the tenant selector stays on `/admin/modules`, the new overview UI fights for attention. Move it to TenantDetailPage first (or as first step of this milestone), then redesign.
- **Diagram drives from MODULE_REGISTRY, not Supabase:** The dependency graph is static code (manifests). No async data loading for the diagram itself. This makes the page fast and simple.
- **Click-to-scroll requires stable refs:** Use a `Map<ModuleId, RefObject<HTMLDivElement>>` populated during card grid render. Diagram click handler calls the matching ref's `scrollIntoView`.
- **navChildren is already typed and populated in all 6 manifests** — no schema changes needed to derive the feature list.

---

## MVP Definition

### Launch With (v12.0 — this milestone)

Minimum that fulfills the milestone goal: transform `/admin/modules` into a platform overview.

- [ ] Remove tenant selector and module toggles from ModulesPanel
- [ ] Redesigned module grid: richer cards with feature list (from navChildren), route tag, tenantScoped badge, polished extension display
- [ ] Interactive SVG dependency diagram: 6 module nodes, edges for extension `requires[]` relationships, hover highlights connected edges
- [ ] Click a diagram node scrolls to and ring-highlights corresponding card
- [ ] Module count summary header: total modules, breakdown by status (active/beta/coming-soon)

### Add After Validation (v12.x)

- [ ] Slot labels on diagram edges (SLOT_ID text near edge midpoint on hover) — adds context for new operators
- [ ] Module detail slide-over/modal with full manifest info — for deeper inspection without leaving page

### Future Consideration (v13+)

- [ ] Dynamic diagram layout when module count grows beyond 10 — current fixed 2-row layout breaks at scale
- [ ] Module health status (if modules gain runtime health checks) — requires backend infrastructure not yet planned
- [ ] Dependency graph export (PNG/SVG download) — niche, low priority

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Remove tenant management from page | HIGH — prerequisite for clean overview | LOW | P1 |
| Rich module cards (feature list, route, badges) | HIGH — makes each module understandable | LOW | P1 |
| Interactive SVG diagram (nodes + edges) | HIGH — the core differentiator of this milestone | MEDIUM | P1 |
| Hover highlight on diagram | MEDIUM — improves diagram readability | LOW | P1 |
| Click-to-scroll card focus | MEDIUM — connects diagram to catalog | MEDIUM | P1 |
| Module count summary header | LOW — nice context but not load-bearing | LOW | P2 |
| Slot labels on diagram edges | MEDIUM — adds precision to extension understanding | LOW | P2 |
| Module detail slide-over | LOW — cards already show most needed info | MEDIUM | P3 |

**Priority key:**
- P1: Must have for v12.0 launch
- P2: Should have, add when P1s are stable
- P3: Nice to have, future consideration

---

## Implementation Notes

### SVG diagram approach — no new library

recharts is already installed but is chart-oriented (cartesian/radial, not graph). @xyflow/react is NOT in the current stack and would add 150KB+ for 6 static nodes.

Recommended approach for the dependency diagram:

1. Assign each module a fixed `(cx, cy)` position in a conceptual 2-row layout (3 per row)
2. Render a full-width `<svg viewBox="0 0 800 300">` or similar
3. Edges: `<path d="M... Q... Z">` quadratic bezier from node center to node center, computed from fixed positions
4. Nodes: `<foreignObject>` containing a small div with icon + label, or `<circle>` + `<text>` in SVG
5. Hover state: `useState<ModuleId | null>(hoveredNode)` — on hover, highlight edges connected to that node with CSS class change (stroke color, opacity)
6. Click: call `moduleRefs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'center' })`

This approach costs zero new dependencies, gives full control over the visual design, and is perfectly adequate for a 6-node static graph.

### Card data derivation — existing manifest fields

`ModuleDefinition` already contains everything needed:

- `navChildren` → flatten to bullet list of navigation paths (depth-1 or depth-2 labels)
- `extensions[]` → display with slot names (keys of `injects`) and `requires[]` badges
- `route` → display as monospace route tag (e.g., `/apps`)
- `tenantScoped` → "Por tenant" badge using amber/slate colors
- `status` → existing badge (active/beta/coming-soon already styled)
- `description` → existing field
- `icon` → existing LucideIcon component

No schema changes to `MODULE_REGISTRY` or any manifest needed.

### Tenant management migration

The Supabase `tenant_modules` read/write logic in `ModulesPanel.tsx` (lines 137-236) moves entirely to `TenantDetailPage` or a new `TenantModulesTab` component. After removal, `ModulesPanel` becomes a pure render of `MODULE_REGISTRY` with no Supabase calls.

---

## Reference Patterns

### What comparable platforms do for module/plugin catalogs

| Platform | Catalog Approach | Relevant Pattern |
|----------|-----------------|------------------|
| Backstage (CNCF) | Plugin catalog: cards with kind, type, owner, description, links; separate detail page per plugin | Rich card with metadata taxonomy; click-to-detail pattern |
| Grafana | Plugin catalog: grid with status badges (installed/uninstalled/deprecated) + dependency warnings shown inline | Status-first card design; dependency warnings in-card |
| Figma (plugins page) | Icon grid with description, install count; no dependency diagram (plugins are independent) | Icon-prominent, scannable grid |
| Linear (integrations page) | Icon grid with "Connected" state badges; click opens detail/config slide-over | State badge + click-to-detail; management separate from catalog |

**Common pattern:** Scannable grid + status clarity + click-to-detail. None of these use interactive graphs for small catalogs. An interactive dependency diagram is a Nexo-specific differentiator driven by the extension/slot architecture.

### Module overview pages in developer tools

Vite's plugin ecosystem docs, Webpack's plugin catalog, and VSCode's extension marketplace all use similar grid-of-cards with:
- Icon + name + description (always)
- Status / version / compatibility badge (always)
- "What it provides" section (expected)
- Install / activate CTA (excluded here — management is elsewhere)

Dependency relationships are shown in VSCode extension details ("This extension depends on X") — inline within the card detail view, not as a separate diagram. The interactive diagram is a step beyond standard patterns, justified by the slot-injection architecture's inherent graph nature.

---

## Sources

- Existing codebase: `/src/platform/module-loader/registry.ts`, `/src/platform/module-loader/module-ids.ts`, `/src/platform/pages/admin/ModulesPanel.tsx`, manifests in `/src/modules/*/manifest.*`
- `.planning/PROJECT.md` — v12.0 milestone goal definition
- [React Flow / @xyflow/react](https://reactflow.dev) — reviewed for library fit; rejected as over-engineered for 6 static nodes
- [xyflow GitHub](https://github.com/xyflow/xyflow) — confirmed d3-zoom dependency; confirmed no meaningful tree-shaking for core
- WebSearch: admin module catalog UI patterns 2025, plugin registry visualization, dashboard UX best practices

---

*Feature research for: v12.0 Admin Modules Overview — Nexo platform*
*Researched: 2026-03-21*
