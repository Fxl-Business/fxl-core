# Phase 140: Dependency Diagram - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Build an interactive SVG diagram showing all platform modules as nodes and their extension dependencies as edges on /admin/modules. Hover highlights connected edges; unrelated edges dim. Correct rendering in both dark and light mode. Click-to-scroll navigation is Phase 142 scope.

Requirements: DIAG-01, DIAG-02, DIAG-04

</domain>

<decisions>
## Implementation Decisions

### Data extraction from MODULE_REGISTRY
- **D-01:** MODULE_REGISTRY is the sole data source. No Supabase calls. Diagram data derived via useMemo at render time.
- **D-02:** Define a `GraphNode` type with only serializable primitives: `{ id: string; label: string; status: ModuleStatus; x: number; y: number }`. No LucideIcon or React.ComponentType fields.
- **D-03:** Define a `GraphEdge` type: `{ source: string; target: string; extensionId: string; slot: string }`. Source is the module declaring the extension, target is the module referenced in `requires[]`.
- **D-04:** Filter `requires[]` entries against MODULE_REGISTRY IDs to exclude slot IDs (e.g., `home.dashboard` is a slot, not a module). Only create edges where both source and target are valid module IDs.
- **D-05:** Current reality: only `tasks` and `connector` modules declare extensions, and both self-reference in `requires[]` (tasks requires tasks, connector requires connector). This means the diagram will initially have 6 nodes and 0 cross-module edges. The implementation must handle this gracefully -- self-referencing edges should be excluded since they add no information.

### SVG layout approach
- **D-06:** Custom SVG, no @xyflow/react. 6 static nodes do not justify a graph library.
- **D-07:** Fixed layout positions computed at build time (not a force-directed or dynamic layout). With only 6 nodes, a 2-row x 3-column grid or circular arrangement works well. Positions stored as constants in the component file.
- **D-08:** Node dimensions: rounded rectangle with module label and status badge inside. Approximate 160x60px per node.

### Hover interaction (DIAG-02)
- **D-09:** On hover over a node, edges connected to that node get a highlighted color (indigo-500). All other edges dim to low opacity (0.15). Nodes not connected also dim slightly.
- **D-10:** On mouse leave, all edges and nodes return to default state. No click-to-lock-highlight in this phase (click behavior is Phase 142).
- **D-11:** Hover state managed via React useState (hoveredNodeId: string | null). Edge and node classes derived from hoveredNodeId via conditional Tailwind classes.

### Visual styling (DIAG-04)
- **D-12:** Light mode: nodes have white bg with border-slate-200, edges are slate-400. Dark mode: nodes have card bg with border-slate-700, edges are slate-500. Use Tailwind dark: variants.
- **D-13:** Status badge inside each node uses the same STATUS_LABELS and STATUS_CLASSES pattern from ModulesPanel (emerald for active, amber for beta, slate for coming-soon). Extract these to a shared constants file or duplicate inline.
- **D-14:** Edges rendered as SVG `<path>` or `<line>` elements with arrowhead markers. Quadratic bezier curves for non-straight connections to avoid overlap.

### Component structure
- **D-15:** Single `ModuleDiagram` component in `src/platform/pages/admin/components/ModuleDiagram.tsx`. Exports default for lazy import by ModulesPanel.
- **D-16:** Helper function `buildGraph(registry: ModuleDefinition[]): { nodes: GraphNode[]; edges: GraphEdge[] }` lives in same file or a `diagram-utils.ts` sibling. Pure function, easily testable.
- **D-17:** SVG element uses viewBox for responsive scaling. Container div constrains max width. SVG fills available width and scales proportionally.

### Claude's Discretion
- Exact node positions and spacing within the layout grid
- Arrow marker SVG definition details
- Transition/animation easing for hover effects
- Whether to show extension labels on edges or keep edges unlabeled
- Empty state design if zero cross-module edges exist (current reality)

</decisions>

<specifics>
## Specific Ideas

- Self-referencing edges (module requires itself) should be excluded -- they convey no dependency information
- The diagram should look good even with zero cross-module edges (current state). Nodes alone should form a clear visual of the platform module landscape.
- When real cross-module dependencies are added later, edges should appear naturally without layout changes.
- STATUS_CLASSES pattern from ModulesPanel (lines 26-38) should be reused, not reinvented.

</specifics>

<canonical_refs>
## Canonical References

### Module system architecture
- `src/platform/module-loader/registry.ts` -- ModuleDefinition, ModuleExtension, MODULE_REGISTRY definitions
- `src/platform/module-loader/module-ids.ts` -- MODULE_IDS and SLOT_IDS constants
- `src/platform/module-loader/extension-registry.ts` -- Extension resolution logic

### Current admin page (will be transformed)
- `src/platform/pages/admin/ModulesPanel.tsx` -- Current page that will host the diagram; STATUS_LABELS/STATUS_CLASSES patterns to reuse

### Extension examples (data shape reference)
- `src/modules/tasks/manifest.ts` -- Extension with requires: [MODULE_IDS.TASKS], injects HOME_DASHBOARD
- `src/modules/connector/extensions/home-widgets.ts` -- Extension with requires: [MODULE_IDS.CONNECTOR], injects HOME_DASHBOARD

### Requirements
- `.planning/REQUIREMENTS.md` -- DIAG-01, DIAG-02, DIAG-04 definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- STATUS_LABELS / STATUS_CLASSES in ModulesPanel.tsx (lines 26-38): Badge styling pattern reusable for node status badges
- ModuleDefinition type: Source of truth for node data (id, label, description, status, extensions)
- MODULE_IDS constant: Used to validate requires[] entries against real module IDs

### Established Patterns
- MODULE_REGISTRY array iterated with .map() for rendering (ModulesPanel line 298)
- Extensions accessed via `mod.extensions ?? []` with nullish coalescing
- Slot IDs accessed via `Object.keys(ext.injects)` pattern
- Dark mode via Tailwind `dark:` variants throughout the codebase

### Integration Points
- ModuleDiagram component will be imported into ModulesPanel.tsx (or its replacement after Phase 139)
- Graph data derived from the same MODULE_REGISTRY import already used by ModulesPanel
- Phase 142 will add onClick to nodes that scrolls to card grid (Phase 141), so nodes need a data-module-id attribute or callback prop

</code_context>

<deferred>
## Deferred Ideas

- Click-to-scroll from diagram node to module card -- Phase 142 scope
- Module usage statistics overlay on diagram -- future milestone (STAT-01/02)
- Drag-and-drop node repositioning -- explicitly out of scope per REQUIREMENTS.md

</deferred>

---

*Phase: 140-dependency-diagram*
*Context gathered: 2026-03-21*
