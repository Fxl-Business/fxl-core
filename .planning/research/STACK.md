# Stack Research — v12.0 Admin Modules Overview

**Domain:** Interactive Module Dependency Diagram — React 18 + TypeScript admin panel feature
**Researched:** 2026-03-21
**Confidence:** HIGH (@xyflow/react — official docs verified), MEDIUM (@dagrejs/dagre — multiple sources corroborated)

> This is an additive research document for v12.0. The base stack (React 18, TypeScript strict,
> Tailwind CSS 3, Vite 5, Supabase, Clerk, shadcn/ui, lucide-react, recharts, Sentry, Zod 4.x)
> is validated and unchanged. This document covers ONLY what is new for v12.0.

---

## Executive Decision: One New npm Dependency

The interactive module dependency diagram requires a graph layout and rendering library.
No existing dependency in the stack covers directed-graph visualization with interactive
node/edge behavior (hover highlighting, click navigation, pan/zoom). A single library
addition is justified.

**Chosen:** `@xyflow/react` (React Flow v12) — the de-facto standard for node-based UIs in React.

---

## Already-Present Stack (Do Not Re-research)

| Package | Role in v12.0 |
|---------|---------------|
| React 18 + TypeScript 5 strict | Host environment for the diagram component |
| Tailwind CSS 3 | Style custom node cards inside the diagram |
| shadcn/ui + `@radix-ui/*` | Module overview cards, tooltips, status badges |
| lucide-react | Icons inside custom node cards |
| `react-router-dom` ^6 | `useNavigate()` for click-to-navigate from diagram nodes |
| `MODULE_REGISTRY` typed constant | Source of truth for node definitions and dependency edges |

---

## New Dependency: @xyflow/react

### Core Technologies (New for v12.0)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@xyflow/react` | ^12.10.1 | Directed graph rendering — nodes, edges, pan/zoom, interaction | Standard library for node-based UIs in React; built-in TypeScript types; custom nodes are plain React components styled with Tailwind; official Tailwind integration documented; React 18 compatible |
| `@dagrejs/dagre` | ^1.1.4 | Automatic graph layout (position calculation) | Dagre is the recommended layout engine for React Flow dependency trees; zero configuration required; calculates `x/y` positions from edge definitions so nodes don't need manual placement |

### Why @xyflow/react Over Alternatives

**React Flow** is the right choice because:

1. **Custom nodes are React components.** Every module card is a `.tsx` component styled with Tailwind, shadcn/ui, and lucide-react — no canvas or SVG API required. This matches the existing codebase style completely.

2. **Tailwind works natively.** React Flow UI components are built on shadcn/ui and support Tailwind class styling on custom nodes. Official documentation confirms the integration pattern.

3. **Interaction model matches requirements.** Hover-based edge highlighting, click handlers on nodes, pan/zoom canvas — all first-class features with zero custom event wiring.

4. **TypeScript types are built-in.** `Node<T>`, `Edge`, `ReactFlowProvider`, `useReactFlow` are all fully typed. No `@types/` package needed.

5. **Viewport rendering.** Only renders nodes in the viewport — the ~10 modules in MODULE_REGISTRY are trivially small, so performance is not a concern, but the library does not regress it.

6. **Version 12.x is stable and maintained** — last publish one month ago (March 2026), on npm as `@xyflow/react` (renamed from `reactflow` in v11).

---

## Installation

```bash
# New dependencies for v12.0
npm install @xyflow/react @dagrejs/dagre

# Type definitions for dagre (not bundled)
npm install -D @types/dagre
```

---

## Integration Pattern with Existing Stack

### CSS import

React Flow requires its base stylesheet. In the Tailwind-based project, import it **before** Tailwind in `src/index.css`:

```css
/* src/index.css — add before @tailwind directives */
@import '@xyflow/react/dist/style.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

This ordering is required. Tailwind overrides must come after React Flow's base styles.

### Custom node — plain React + Tailwind

Custom nodes are standard React components. They receive `NodeProps<T>` and can use any installed library:

```typescript
import { NodeProps, Handle, Position } from '@xyflow/react';
import { ModuleDefinition } from '@/modules/admin/constants/module-registry';

type ModuleNode = Node<{ module: ModuleDefinition }, 'module'>;

function ModuleNodeCard({ data }: NodeProps<ModuleNode>) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm w-48">
      <Handle type="target" position={Position.Top} />
      <p className="text-sm font-semibold text-foreground">{data.module.label}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

No SVG, no canvas API, no D3 — just Tailwind classes on a div.

### Dagre layout — convert MODULE_REGISTRY to positioned nodes

```typescript
import dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 192;
const NODE_HEIGHT = 80;

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 40 });

  nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach(e => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return {
    nodes: nodes.map(n => {
      const pos = g.node(n.id);
      return { ...n, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } };
    }),
    edges,
  };
}
```

This function runs once on mount (MODULE_REGISTRY is static). No re-layout needed.

### Hover highlighting — built-in edge styling

React Flow supports dynamic edge className/style via props. Highlight connected edges on node hover using `useReactFlow().setEdges()`:

```typescript
function onNodeMouseEnter(_: React.MouseEvent, node: Node) {
  setEdges(edges =>
    edges.map(e => ({
      ...e,
      className: e.source === node.id || e.target === node.id ? 'stroke-primary' : 'opacity-30',
    }))
  );
}
```

No extra library, no custom SVG — this is the idiomatic React Flow pattern.

### Click navigation — useNavigate + node onClick

```typescript
import { useNavigate } from 'react-router-dom';

function onNodeClick(_: React.MouseEvent, node: Node) {
  navigate(`/admin/modules/${node.id}`);
}
```

`react-router-dom` is already installed. No new routing infrastructure.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `@xyflow/react` | `reagraph` | WebGL-based; overkill for ~10 static nodes; custom node styling requires canvas API instead of Tailwind; React Flow has better DX for this use case |
| `@xyflow/react` | `cytoscape.js` + `react-cytoscapejs` | Canvas rendering; styling uses Cytoscape's own selector language, not Tailwind; requires two packages; the React wrapper is community-maintained and less active |
| `@xyflow/react` | `d3` + custom SVG | Maximum customization but requires writing 300+ lines of D3 position/force calculation, drag, zoom, and hover logic manually; no justification for this complexity at ~10 static nodes |
| `@xyflow/react` | `vis-network` | jQuery-era library; not React-native; no TypeScript types built-in; has fallen behind React Flow in community adoption |
| `@dagrejs/dagre` | `elkjs` | ELK is more powerful (handles compound graphs, routing constraints) but ~10x more complex to configure; overkill for a flat dependency tree with ~10 nodes |
| `@dagrejs/dagre` | Manual x/y positions | MODULE_REGISTRY may change across milestones; hardcoded positions break on every addition; dagre auto-layout is zero maintenance |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `d3` or `d3-force` | 50KB+ for force simulation that produces unstable organic layouts; wrong rendering model for an admin diagram (nodes should be stable and structured, not physics-simulated) | `@dagrejs/dagre` for deterministic hierarchical layout |
| `cytoscape` + `react-cytoscapejs` | Canvas rendering bypasses Tailwind entirely; community React wrapper has maintenance gaps; two packages for one feature | `@xyflow/react` where custom nodes are React components |
| `reagraph` | WebGL renderer is correct for graphs with 1000+ nodes; at ~10 nodes it adds complexity (canvas event handling) without benefit | `@xyflow/react` |
| `elkjs` | Complex to configure; async layout algorithm; asynchronous position calculation complicates React state management | `@dagrejs/dagre` |
| `mermaid` or `mermaid-js/react` | Static SVG output; no interactive hover/click events; theming conflicts with dark mode CSS vars | `@xyflow/react` |
| `sigma.js` | WebGL network graphs for social network-scale data; not suited for ~10 node admin diagrams | `@xyflow/react` |

---

## Stack Patterns

**For the dependency diagram specifically:**
- Use `@xyflow/react` ReactFlow component with `nodeTypes` map pointing to custom TSX components
- Run dagre layout once on mount (MODULE_REGISTRY is static)
- Keep diagram state local — no Supabase persistence needed (MODULE_REGISTRY is a constant)
- Wrap in `ReactFlowProvider` only if the component tree needs `useReactFlow()` outside the main `<ReactFlow>` component

**For the module overview cards (outside the diagram):**
- Use existing shadcn/ui `Card` component — no React Flow involvement
- Grid layout via Tailwind `grid grid-cols-2 lg:grid-cols-3`
- These are independent from the diagram and share no state with it

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|----------------|-------|
| `@xyflow/react` | ^12.10.1 | React 18, TypeScript 5, Vite 5, Tailwind 3 | v12 is the current stable release (renamed from `reactflow`); Tailwind 4 support added in UI components but Tailwind 3 continues to work with CSS import ordering fix |
| `@dagrejs/dagre` | ^1.1.4 | `@xyflow/react` any version | Dagre is layout-only (pure JS graph algorithm); no React dependency; TypeScript types via `@types/dagre` |
| `@types/dagre` | ^0.7.3 | `@dagrejs/dagre` | Dev-only type declarations for dagre's graphlib API |

**Note on Tailwind 3 + React Flow CSS:** React Flow's UI component system was updated for Tailwind 4 in late 2025, but the core `@xyflow/react` library works correctly with Tailwind 3. The only requirement is importing `@xyflow/react/dist/style.css` before Tailwind's entry point in `src/index.css`.

---

## Sources

- [@xyflow/react on npm](https://www.npmjs.com/package/@xyflow/react) — Version 12.10.1 confirmed, last publish date verified. HIGH confidence.
- [React Flow installation docs (reactflow.dev)](https://reactflow.dev/learn/getting-started/installation-and-requirements) — Peer dependency requirements, TypeScript support, Vite template. HIGH confidence.
- [React Flow + Tailwind CSS example (reactflow.dev)](https://reactflow.dev/examples/styling/tailwind) — CSS import ordering requirement confirmed. HIGH confidence.
- [React Flow Dagre layout example (reactflow.dev)](https://reactflow.dev/examples/layout/dagre) — `getLayoutedElements` pattern with `@dagrejs/dagre`. HIGH confidence.
- [React Flow TypeScript guide (reactflow.dev)](https://reactflow.dev/learn/advanced-use/typescript) — `Node<T>`, `Edge`, `NodeProps<T>` type usage confirmed. HIGH confidence.
- [React Flow UI — Tailwind 4 update announcement (reactflow.dev)](https://reactflow.dev/whats-new/2025-10-28) — Confirmed Tailwind 3 backward compatibility and CSS import order change for Tailwind 4. MEDIUM confidence (changelog, not migration guide).
- [Dagre layout in React Flow — ncoughlin.com](https://ncoughlin.com/posts/react-flow-dagre-custom-nodes) — Community walkthrough of dagre + custom nodes integration. MEDIUM confidence.
- [Ten React graph visualization libraries — DEV Community](https://dev.to/ably/top-react-graph-visualization-libraries-3gmn) — Comparative survey; confirmed reagraph/cytoscape/d3 tradeoffs. MEDIUM confidence.
- Cambridge Intelligence comparative guide — confirmed React Flow recommendation for workflow/admin UI use cases vs reagraph/cytoscape for large-scale network analysis. MEDIUM confidence.

---

*Stack research for: v12.0 Admin Modules Overview — interactive dependency diagram*
*Researched: 2026-03-21*
