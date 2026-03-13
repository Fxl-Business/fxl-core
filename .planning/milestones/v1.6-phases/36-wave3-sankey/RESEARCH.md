# Phase 36 Research: Wave 3 — Sankey Diagram

## Recharts Sankey Export Check

**CLI check result:**
```
$ node -e 'const r = require("./node_modules/recharts"); console.log(Boolean(r.Sankey))'
true
```

**Export details:**
- `typeof r.Sankey` = `function`
- `displayName` = `'Sankey'`
- Recharts version: **2.15.4**

**Sankey defaultProps from Recharts:**
```json
{
  "nameKey": "name",
  "dataKey": "value",
  "nodePadding": 10,
  "nodeWidth": 10,
  "linkCurvature": 0.5,
  "iterations": 32,
  "margin": { "top": 5, "right": 5, "bottom": 5, "left": 5 },
  "sort": true
}
```

**Conclusion:** Recharts 2.15.4 exports `Sankey` as a named export. No fallback plan needed.

---

## Recharts Sankey API (from types/chart/Sankey.d.ts)

The `Sankey` component accepts a `data` prop with this shape:

```ts
interface SankeyData {
  nodes: any[];                    // Array of node objects (must have name key)
  links: LinkDataItem[];           // Array of link objects
}

interface LinkDataItem {
  source: number;                  // Integer index into nodes array (NOT string name)
  target: number;                  // Integer index into nodes array (NOT string name)
  [key: string]: any;              // Must include value (controlled by dataKey prop)
}
```

**Critical constraint:** `links[].source` and `links[].target` are **integer array indices** into the `nodes` array. This matches the success criteria requirement for index-based links.

The component also accepts:
- `node?: ReactElement | ((props) => ReactElement) | RectangleProps` -- custom node rendering
- `link?: ReactElement | ((props) => ReactElement) | SVGPathElement` -- custom link rendering
- `width/height` -- explicit dimensions (unlike other Recharts charts, Sankey does NOT use ResponsiveContainer natively)
- `children` -- can include `<Tooltip />` as a child

---

## Standalone Section Type Pattern (5-file checklist via XCUT-06)

From analyzing the GaugeChart standalone section (most recent addition), the pattern is:

### File 1: Type definition (`types/blueprint.ts`)
- Add a new type to the `BlueprintSection` discriminated union
- Example: `SankeySection` with `type: 'sankey'`

### File 2: Zod schema (`lib/blueprint-schema.ts`)
- Define `SankeyChartSectionSchema` with `z.literal('sankey')` discriminant
- Add to `nonRecursiveSections` array
- Export the schema for use in section-registry

### File 3: Component + Renderer
- **Component:** `tools/wireframe-builder/components/SankeyComponent.tsx`
  - Receives typed props including `chartColors`
  - Uses `Sankey` from recharts with `isAnimationActive={false}` (XCUT-02)
  - Colors nodes from `chartColors` palette
- **Renderer:** `tools/wireframe-builder/components/sections/SankeyRenderer.tsx`
  - Thin wrapper casting `section as SankeySection` and forwarding to component

### File 4: Property form (`components/editor/property-forms/SankeyForm.tsx`)
- Simple form with title input (and optionally height)
- Node/link editing is complex; minimal form is acceptable for v1

### File 5: Registry entry (`lib/section-registry.tsx`)
- Add `'sankey'` key to `SECTION_REGISTRY` with all 6 fields
- Import renderer, form, schema, icon

---

## Current Section Registry State

- **Current count:** 23 section types
- **After Phase 35 (4 new):** 27 section types (pie-chart, progress-grid, heatmap, sparkline-grid)
- **After Phase 36 (1 new):** 28 section types (sankey)
- Test assertion in `section-registry.test.ts` line 48: `expect(...).toHaveLength(23)` -- must become 28

---

## chartColors Pattern

The `chartColors` prop flows through:
1. `useWireframeChartPalette(containerRef)` resolves CSS vars `--wf-chart-1` through `--wf-chart-5` to hex strings
2. Passed as `chartColors?: string[]` through `SectionRendererProps`
3. Each chart component receives it and applies to fills/strokes

For Sankey, `chartColors` will be used to color **nodes** (cycling through the palette), while **links** will use a lighter/transparent version of the source node color.

---

## Key Implementation Notes

1. **Sankey does NOT work with ResponsiveContainer** well in Recharts 2.x -- it needs explicit `width` and `height` props. A common pattern is to use a wrapper div with `useRef` + measuring, or pass a fixed height and use `width="100%"` via a resize observer.

2. **No animation:** Success criteria require `isAnimationActive={false}` -- but Sankey does not have this prop directly. The Sankey component does not animate by default, so no action needed.

3. **Integer index constraint:** The `links` array must use integer indices (`source: 0, target: 2`) not string names. The `defaultProps` in the registry must hardcode sample data with integer indices and an inline comment documenting this constraint.

4. **Tooltip:** Sankey supports `<Tooltip />` as a child component for hover information on nodes/links.

---

*Researched: 2026-03-12*
