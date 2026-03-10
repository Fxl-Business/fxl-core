# Phase 9: Component Library Expansion - Research

**Researched:** 2026-03-09
**Domain:** React component registry, Recharts chart variants, React Router parametric routing
**Confidence:** HIGH

## Summary

Phase 9 centralizes 7 dispatcher locations into a single registry, adds 6 new wireframe block types, 5 additional Recharts chart variants, and replaces the hardcoded FinanceiroContaAzul viewer with a generic parametric route. The codebase is well-structured for this -- the existing 15 section types follow a consistent pattern (TS type + Zod schema + renderer + property form + default factory + catalog entry) that maps directly to a registry data structure.

The registry pattern is the highest-risk item because it touches all 7 locations simultaneously and must maintain backward compatibility with existing blueprints stored in Supabase. The new block types are lower risk -- they follow the same pattern as existing blocks and use already-installed libraries (shadcn/ui components, Recharts 2.15.4). The generic viewer requires extracting shared logic from WireframeViewer.tsx (872 lines) and SharedWireframeView.tsx, resolving branding from Supabase dynamically instead of static imports.

**Primary recommendation:** Build the registry first (it unblocks everything else), then add new blocks in parallel with chart variants, and finish with the generic viewer migration. The registry must be validated by confirming `npx tsc --noEmit` passes with zero errors after migration of all 15 existing types.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Block fidelity: Wireframe functional -- inputs, toggles, selects render visually with hover/focus states but don't process real data. Consistent with existing blocks.
- Block visual style: All new blocks follow shadcn/ui as base style, adapted to wireframe tokens (--wf-*). "Steel" aesthetic -- clean, minimal, functional.
- Generic viewer: Create parametric route /clients/:clientSlug/wireframe. Delete hardcoded FinanceiroContaAzul viewer page. Add redirect from old route. SharedWireframeView remains separate (different auth model).
- Registry pattern: Single registry file maps section type string to { renderer, propertyForm, catalogEntry, defaultProps }. All 7 dispatcher locations consume from registry. Adding a new section type = 1 file (component) + 1 registry entry. Existing 15 section types migrated in same pass.
- New chart variants: 5 types (Radar, Treemap, Funnel, Scatter, Area) as sub-variants of existing chart section type. Added to chart type selector. Each renders with sample data and respects chartColors.

### Claude's Discretion
- Registry file structure and export pattern
- Property form field layout for each new block
- Sample/default data for each new block type
- ComponentPicker category assignment for new blocks
- Zod schema additions for new section types in BlueprintSection union
- Chart sample data shape and visual configuration
- Route parameter validation and error handling for generic viewer
- Migration approach for existing FinanceiroContaAzul blueprint references

### Deferred Ideas (OUT OF SCOPE)
- Drag-and-drop reorder of sections (ADVW-04 -- v2)
- Custom component creation via UI (ADVW-06 -- v2)
- Natural language editing of sections (ADVW-05 -- v2)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | Section types registered via registry pattern | Registry architecture pattern below; 7 dispatcher locations identified with exact file paths |
| COMP-02 | Operator can add settings-page block | New block type pattern; shadcn Input/Select/Switch components; wireframe token styling |
| COMP-03 | Operator can add form-section block | New block type pattern; variable input types (text, number, date, select) |
| COMP-04 | Operator can add filter-config block | New block type pattern; period/type filter controls |
| COMP-05 | Operator can add stat-card block | New block type pattern; standalone metric display |
| COMP-06 | Operator can add progress-bar block | New block type pattern; shadcn Progress component (needs install) |
| COMP-07 | Operator can add divider block | New block type pattern; shadcn Separator (already installed) |
| COMP-08 | 5 additional chart types (Radar, Treemap, Funnel, Scatter, Area) | Recharts 2.15.4 verified; all chart components available as exports |
| COMP-09 | Generic wireframe viewer parametrized by :clientSlug | Route architecture pattern; branding resolution from Supabase; shared viewer logic extraction |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 2.15.4 | All chart rendering (existing + 5 new types) | Already installed, exports RadarChart, Treemap, FunnelChart, ScatterChart, AreaChart |
| zod | 4.3.6 | Blueprint schema validation | Already used for BlueprintSectionSchema discriminated union |
| react-router-dom | 6.27.0 | Route params for generic viewer (:clientSlug) | Already installed, useParams hook for parametric routes |
| lucide-react | 0.460.0 | Icons for new block types in ComponentPicker | Already installed, provides all needed icons |

### shadcn/ui Components
| Component | Status | Needed By |
|-----------|--------|-----------|
| separator.tsx | INSTALLED | divider block (COMP-07) |
| input.tsx | INSTALLED | settings-page, form-section blocks |
| select.tsx | INSTALLED | settings-page, form-section, filter-config blocks |
| label.tsx | INSTALLED | All form-based blocks |
| switch.tsx | NOT INSTALLED | settings-page block toggles (COMP-02) |
| progress.tsx | NOT INSTALLED | progress-bar block (COMP-06) |
| card.tsx | NOT INSTALLED | stat-card block (COMP-05) |

### Installation Required
```bash
npx shadcn@latest add switch progress card
```

**No new npm dependencies required.** All functionality comes from existing packages and shadcn/ui component additions.

## Architecture Patterns

### Current Dispatcher Locations (7 -- to centralize)

These are the exact locations that must consume from the registry:

| # | File | Current Pattern | Registry Replacement |
|---|------|----------------|---------------------|
| 1 | `tools/wireframe-builder/components/sections/SectionRenderer.tsx` | switch on section.type (50 lines) | `registry[section.type].renderer` |
| 2 | `tools/wireframe-builder/components/editor/PropertyPanel.tsx` | switch on section.type (163 lines) + labels Record | `registry[section.type].propertyForm` + `registry[section.type].label` |
| 3 | `tools/wireframe-builder/components/editor/ComponentPicker.tsx` | hardcoded SECTION_CATALOG array (84 lines) | Build catalog from `Object.values(registry).map(r => r.catalogEntry)` |
| 4 | `tools/wireframe-builder/types/blueprint.ts` | BlueprintSection discriminated union (15 types) | Keep TS union (needed for type narrowing), but registry validates completeness |
| 5 | `tools/wireframe-builder/lib/blueprint-schema.ts` | Manually listed Zod schemas in array (280 lines) | `registry[type].schema` or keep centralized (see note below) |
| 6 | `tools/wireframe-builder/lib/defaults.ts` | switch on type returning default props (96 lines) | `registry[type].defaultProps` |
| 7 | `tools/wireframe-builder/components/editor/EditableSectionWrapper.tsx` | No dispatch (wraps generically) | No change needed -- already generic |

**Note on #7:** CONTEXT.md mentions "drag preview rendering" as the 7th location, but EditableSectionWrapper.tsx is actually already generic. The real 7th dispatcher is the `getSectionLabel` Record in PropertyPanel.tsx (line 33-50), which is part of #2.

### Pattern 1: Section Type Registry

**What:** A single record mapping section type string to all related artifacts.
**When to use:** Every time a new section type is added.

```typescript
// tools/wireframe-builder/lib/section-registry.ts

import type { ComponentType } from 'react'
import type { BlueprintSection } from '../types/blueprint'
import type { z } from 'zod'

type PropertyFormProps = {
  section: BlueprintSection
  onChange: (updated: BlueprintSection) => void
}

type CatalogEntry = {
  type: BlueprintSection['type']
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
  category: string // 'KPIs' | 'Graficos' | 'Tabelas' | 'Inputs' | 'Layout' | 'Metricas' | 'Formularios'
}

type SectionRegistration = {
  renderer: ComponentType<{
    section: BlueprintSection
    compareMode: boolean
    comparePeriod: string
    chartColors?: string[]
  }>
  propertyForm: ComponentType<PropertyFormProps>
  catalogEntry: CatalogEntry
  defaultProps: () => BlueprintSection
  schema: z.ZodType
  label: string
}

// The registry -- single source of truth
export const SECTION_REGISTRY: Record<BlueprintSection['type'], SectionRegistration> = {
  'kpi-grid': {
    renderer: KpiGridRenderer,
    propertyForm: KpiGridForm,
    catalogEntry: { type: 'kpi-grid', label: 'KPI Grid', description: '...', icon: LayoutGrid, category: 'KPIs' },
    defaultProps: () => ({ type: 'kpi-grid', columns: 4, items: [{ label: 'Novo KPI', value: 'R$ 0' }] }),
    schema: KpiGridSectionSchema,
    label: 'KPI Grid',
  },
  // ... all other types
}

// Derived utilities
export function getRenderer(type: BlueprintSection['type']) {
  return SECTION_REGISTRY[type].renderer
}

export function getPropertyForm(type: BlueprintSection['type']) {
  return SECTION_REGISTRY[type].propertyForm
}

export function getDefaultSection(type: BlueprintSection['type']): BlueprintSection {
  return SECTION_REGISTRY[type].defaultProps()
}

export function getSectionLabel(type: BlueprintSection['type']): string {
  return SECTION_REGISTRY[type].label
}

export function getCatalog(): { name: string; items: CatalogEntry[] }[] {
  const byCategory = new Map<string, CatalogEntry[]>()
  for (const reg of Object.values(SECTION_REGISTRY)) {
    const cat = reg.catalogEntry.category
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(reg.catalogEntry)
  }
  return Array.from(byCategory, ([name, items]) => ({ name, items }))
}
```

**Critical design decision:** The TS `BlueprintSection` discriminated union in `blueprint.ts` should REMAIN as a manual union type. TypeScript discriminated unions require explicit listing for type narrowing to work in switch statements. The registry complements it -- it does not replace it.

**Similarly**, the Zod schemas in `blueprint-schema.ts` must stay as a centralized discriminated union (`z.discriminatedUnion('type', [...])`) because Zod requires the array at build time. The registry can reference individual schemas for documentation, but the `BlueprintSectionSchema` export must remain manually assembled.

### Pattern 2: New Block Component Structure

**What:** Each new block type follows the same 4-file pattern.
**When to use:** For each of the 6 new blocks.

```
tools/wireframe-builder/
  components/
    sections/
      SettingsPageRenderer.tsx      # Visual renderer
    editor/
      property-forms/
        SettingsPageForm.tsx         # Property editing form
  types/
    blueprint.ts                    # Add SettingsPageSection type to union
  lib/
    blueprint-schema.ts             # Add Zod schema
    section-registry.ts             # Add registry entry
```

### Pattern 3: Chart Sub-Variant Extension

**What:** New chart types are sub-variants of the existing chart section type, not new top-level section types.
**When to use:** For COMP-08 (5 new charts).

The existing `BarLineChartSection.chartType` field uses `'bar' | 'line' | 'bar-line'`. The pattern extends `chartType` to include: `'radar' | 'treemap' | 'funnel' | 'scatter' | 'area'`.

```typescript
// Extend BarLineChartSection.chartType union:
export type ChartType = 'bar' | 'line' | 'bar-line' | 'radar' | 'treemap' | 'funnel' | 'scatter' | 'area'

export type BarLineChartSection = {
  type: 'bar-line-chart'
  title: string
  chartType: ChartType
  height?: number
  compareOnly?: boolean
  categories?: string[]
  xLabel?: string
  yLabel?: string
  // New: chart-specific data for variants that need it
  radarData?: { subject: string; value: number; fullMark?: number }[]
  treemapData?: { name: string; size: number; children?: { name: string; size: number }[] }[]
  funnelData?: { name: string; value: number }[]
  scatterData?: { x: number; y: number; z?: number }[]
  areaData?: { name: string; value: number }[] // reuses categories for X axis if not provided
}
```

**Alternative approach (recommended):** Rather than overloading `BarLineChartSection`, use the existing `chartType` field but add a generic `chartData` field for variant-specific sample data. This keeps the type cleaner. The ChartRenderer switch already dispatches on `section.chartType`, so extending it is natural.

### Pattern 4: Generic Viewer Route

**What:** Parametric route replacing hardcoded client pages.
**When to use:** For COMP-09.

```typescript
// App.tsx route change:
// BEFORE:
<Route path="/clients/financeiro-conta-azul/wireframe-view" element={<ProtectedRoute><FinanceiroWireframeViewer /></ProtectedRoute>} />

// AFTER:
<Route path="/clients/:clientSlug/wireframe" element={<ProtectedRoute><WireframeViewer /></ProtectedRoute>} />
// + redirect from old route:
<Route path="/clients/financeiro-conta-azul/wireframe-view" element={<Navigate to="/clients/financeiro-conta-azul/wireframe" replace />} />
```

The new `WireframeViewer` component:
- Uses `useParams<{ clientSlug: string }>()` to get the client slug
- Loads blueprint from Supabase via `loadBlueprint(clientSlug)`
- Loads branding from Supabase (or dynamic import as fallback)
- Renders same layout as current FinanceiroWireframeViewer but without hardcoded imports

**Key extraction:** The current WireframeViewer.tsx (872 lines) contains ALL the viewer logic. The generic version needs:
1. Replace `const CLIENT_SLUG = 'financeiro-conta-azul'` with `useParams`
2. Replace static `import brandingConfigSeed from '@clients/...'` with dynamic loading from Supabase or a dynamic import map
3. Keep ALL edit mode, comment, conflict resolution, save logic exactly as-is
4. SharedWireframeView.tsx stays untouched (different auth model)

### Anti-Patterns to Avoid
- **Adding section types without registry entries:** Every new type MUST have a registry entry. The registry should be the ONLY place to check "does this section type exist?"
- **Putting sample data in renderers:** Default/sample data lives in `defaultProps()` in the registry, NOT hardcoded in renderer components
- **Creating separate chart section types for each variant:** Radar, Treemap, etc. are chart variants within the existing `bar-line-chart` section type, not new top-level types. This keeps the ComponentPicker clean.
- **Using `any` to work around discriminated union types:** Add proper type narrowing with `section.chartType` checks instead
- **Hardcoding branding imports per client:** The generic viewer must dynamically resolve branding, not use a static import map

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering (Radar, Treemap, etc.) | Custom SVG chart components | Recharts `<RadarChart>`, `<Treemap>`, `<FunnelChart>`, `<ScatterChart>`, `<AreaChart>` | Recharts handles axes, tooltips, responsive sizing, animations |
| Toggle switches | Custom checkbox with CSS | shadcn Switch component (`npx shadcn@latest add switch`) | Accessibility, keyboard nav, focus states |
| Progress indicators | Custom div with width% | shadcn Progress component (`npx shadcn@latest add progress`) | Accessibility (role="progressbar"), aria attributes |
| Visual dividers | `<hr>` or border div | shadcn Separator component (already installed) | Consistent styling with design system |
| Form inputs | Raw HTML inputs | shadcn Input, Select, Label (already installed) | Consistent styling, focus states, wireframe token compatibility |
| Route parameter extraction | Manual URL parsing | react-router-dom `useParams<{ clientSlug: string }>()` | Type-safe, handles encoding, integrates with router context |

## Common Pitfalls

### Pitfall 1: Discriminated Union Exhaustiveness
**What goes wrong:** After adding 6 new types to BlueprintSection union, TypeScript may not catch missing cases in switch statements that don't use the registry.
**Why it happens:** The `switch` in SectionRenderer returns nothing for unmatched cases (implicit undefined), and TypeScript doesn't flag unreachable branches by default.
**How to avoid:** After registry migration, SectionRenderer should use `SECTION_REGISTRY[section.type].renderer` instead of switch. For any remaining switches, add a `default: assertNever(section)` pattern.
**Warning signs:** TypeScript compiles but new block types render as blank space.

### Pitfall 2: Zod Schema Out of Sync with TS Types
**What goes wrong:** Adding a new section type to the TS union but forgetting the Zod schema means blueprints with the new type pass TypeScript checks but fail Zod validation when loading from Supabase.
**Why it happens:** blueprint.ts and blueprint-schema.ts are separate files. No compile-time enforcement that they match.
**How to avoid:** The registry entry includes a `schema` field. A validation test can iterate registry entries and verify each schema parses the corresponding `defaultProps()` output.
**Warning signs:** New blocks save to DB but fail to load (loadBlueprint returns null).

### Pitfall 3: ChartGrid Recursive Type Impact
**What goes wrong:** ChartGridSection contains `items: BlueprintSection[]`. Adding new section types to the union means they can appear inside chart grids. New renderers must handle being rendered at any nesting level.
**Why it happens:** The recursive type is by design, but new renderers might not account for it.
**How to avoid:** Ensure new renderers work standalone (they should -- chart-grid passes sections to SectionRenderer which dispatches via registry).
**Warning signs:** New blocks work in top-level rows but break inside chart-grid.

### Pitfall 4: Static Branding Import Map (Generic Viewer)
**What goes wrong:** SharedWireframeView.tsx has a hardcoded `brandingMap` object that maps client slugs to dynamic imports. The generic viewer cannot use this pattern for arbitrary clients.
**Why it happens:** Current architecture assumes known clients at build time.
**How to avoid:** Store branding config in Supabase alongside blueprint data (same `blueprint_configs` table or a new `client_branding` table). Load at runtime, not build time.
**Warning signs:** Generic viewer works for financeiro-conta-azul but shows default branding for new clients.

### Pitfall 5: Wireframe Token Conflicts in New Blocks
**What goes wrong:** New blocks use app-level Tailwind classes (bg-background, text-foreground) instead of wireframe tokens (--wf-canvas, --wf-body), causing visual mismatch.
**Why it happens:** Phase 8 established the three-layer token isolation (app tokens, wireframe chrome --wf-*, client branding). New developers may not know which tokens to use.
**How to avoid:** All new block renderers must use wireframe tokens via inline styles or the wf-* Tailwind utilities established in Phase 8. Only the EditableSectionWrapper uses app tokens (it's editor chrome, not wireframe content).
**Warning signs:** New blocks look correct in dev but have wrong colors when branding or dark mode is applied.

### Pitfall 6: Schema Migration for New Section Types
**What goes wrong:** Existing blueprints in Supabase don't contain the new section types, but the Zod schema must still accept them. If the new types are added as required fields, old blueprints fail validation.
**Why it happens:** The discriminated union validates that each section has a known type. New types are naturally additive -- they don't affect existing data.
**How to avoid:** New section types are additive to the discriminated union. Existing blueprints that don't use them still pass validation. No schema migration needed for this change.
**Warning signs:** None -- this is actually safe by design. Document it so planners don't add unnecessary migration steps.

## Code Examples

### Recharts RadarChart (verified from Recharts 2.x exports)
```typescript
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'

const sampleData = [
  { subject: 'Vendas', value: 120, fullMark: 150 },
  { subject: 'Marketing', value: 98, fullMark: 150 },
  { subject: 'Suporte', value: 86, fullMark: 150 },
  { subject: 'Financeiro', value: 99, fullMark: 150 },
  { subject: 'RH', value: 85, fullMark: 150 },
]

<ResponsiveContainer width="100%" height={height ?? 300}>
  <RadarChart data={sampleData}>
    <PolarGrid stroke="var(--wf-grid)" />
    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--wf-muted)', fontSize: 12 }} />
    <PolarRadiusAxis tick={{ fill: 'var(--wf-muted)', fontSize: 10 }} />
    <Radar dataKey="value" stroke={chartColors?.[0] ?? 'var(--wf-accent)'} fill={chartColors?.[0] ?? 'var(--wf-accent)'} fillOpacity={0.3} />
  </RadarChart>
</ResponsiveContainer>
```

### Recharts Treemap (verified)
```typescript
import { Treemap, ResponsiveContainer } from 'recharts'

const sampleData = [
  { name: 'Vendas', size: 4500 },
  { name: 'Marketing', size: 2300 },
  { name: 'Operacoes', size: 1800 },
  { name: 'Suporte', size: 1200 },
  { name: 'RH', size: 800 },
]

<ResponsiveContainer width="100%" height={height ?? 300}>
  <Treemap
    data={sampleData}
    dataKey="size"
    nameKey="name"
    fill={chartColors?.[0] ?? 'var(--wf-accent)'}
    stroke="var(--wf-card)"
  />
</ResponsiveContainer>
```

### Recharts FunnelChart (verified)
```typescript
import { FunnelChart, Funnel, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const sampleData = [
  { name: 'Visitantes', value: 5000 },
  { name: 'Leads', value: 3200 },
  { name: 'Qualificados', value: 1800 },
  { name: 'Propostas', value: 900 },
  { name: 'Fechados', value: 400 },
]

<ResponsiveContainer width="100%" height={height ?? 300}>
  <FunnelChart>
    <Tooltip />
    <Funnel dataKey="value" data={sampleData} nameKey="name">
      {sampleData.map((_, i) => (
        <Cell key={i} fill={chartColors?.[i % chartColors.length] ?? `var(--wf-accent)`} />
      ))}
    </Funnel>
  </FunnelChart>
</ResponsiveContainer>
```

### Recharts ScatterChart (verified)
```typescript
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const sampleData = [
  { x: 100, y: 200 }, { x: 120, y: 100 }, { x: 170, y: 300 },
  { x: 140, y: 250 }, { x: 150, y: 400 }, { x: 110, y: 280 },
]

<ResponsiveContainer width="100%" height={height ?? 300}>
  <ScatterChart>
    <CartesianGrid stroke="var(--wf-grid)" />
    <XAxis dataKey="x" tick={{ fill: 'var(--wf-muted)', fontSize: 12 }} />
    <YAxis dataKey="y" tick={{ fill: 'var(--wf-muted)', fontSize: 12 }} />
    <Tooltip />
    <Scatter data={sampleData} fill={chartColors?.[0] ?? 'var(--wf-accent)'} />
  </ScatterChart>
</ResponsiveContainer>
```

### Recharts AreaChart (verified)
```typescript
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const sampleData = MONTHS.map((m) => ({ name: m, value: Math.round(Math.random() * 5000 + 1000) }))

<ResponsiveContainer width="100%" height={height ?? 300}>
  <AreaChart data={sampleData}>
    <CartesianGrid stroke="var(--wf-grid)" />
    <XAxis dataKey="name" tick={{ fill: 'var(--wf-muted)', fontSize: 12 }} />
    <YAxis tick={{ fill: 'var(--wf-muted)', fontSize: 12 }} />
    <Tooltip />
    <Area type="monotone" dataKey="value" stroke={chartColors?.[0] ?? 'var(--wf-accent)'} fill={chartColors?.[0] ?? 'var(--wf-accent)'} fillOpacity={0.2} />
  </AreaChart>
</ResponsiveContainer>
```

### shadcn Switch usage for wireframe blocks
```typescript
// After: npx shadcn@latest add switch
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// Inside SettingsPageRenderer -- uses wireframe tokens
<div className="flex items-center justify-between" style={{ color: 'var(--wf-body)' }}>
  <Label htmlFor="notify" className="text-sm" style={{ color: 'var(--wf-body)' }}>
    Notificacoes por email
  </Label>
  <Switch id="notify" disabled />
</div>
```

### React Router parametric route
```typescript
// Source: react-router-dom v6 useParams
import { useParams, Navigate } from 'react-router-dom'

function WireframeViewer() {
  const { clientSlug } = useParams<{ clientSlug: string }>()
  if (!clientSlug) return <Navigate to="/" replace />

  // Load blueprint and branding dynamically
  const [config, setConfig] = useState<BlueprintConfig | null>(null)
  useEffect(() => {
    loadBlueprint(clientSlug).then(result => {
      if (result) setConfig(result.config)
    })
  }, [clientSlug])
  // ...
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Switch statements in 7 files | Registry pattern (single file) | Phase 9 | Adding new section = 1 component + 1 registry entry |
| Per-client viewer pages | Generic :clientSlug viewer | Phase 9 | Any client works without code changes |
| 4 chart types only | 9 chart types (4 existing + 5 new) | Phase 9 | Richer wireframe visualization options |
| Hardcoded branding imports | Dynamic branding resolution | Phase 9 | Branding works for any client at runtime |

**Versions confirmed:**
- Recharts 2.15.4 (installed; all 5 chart types exported)
- Zod 4.3.6 (installed; discriminated union support)
- react-router-dom 6.27.0 (installed; useParams with generics)
- shadcn/ui components available via CLI (switch, progress, card need install)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (via vitest.config.ts) |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run && npx tsc --noEmit` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Registry maps all section types, getDefaultSection works for each | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "registry"` | Wave 0 |
| COMP-01 | All 7 dispatchers consume from registry (no orphaned switch) | manual-only | Visual code review -- no automated way to verify switch removal | N/A |
| COMP-02 | settings-page default props pass Zod validation | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "settings-page"` | Wave 0 |
| COMP-03 | form-section default props pass Zod validation | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "form-section"` | Wave 0 |
| COMP-04 | filter-config default props pass Zod validation | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "filter-config"` | Wave 0 |
| COMP-05 | stat-card default props pass Zod validation | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "stat-card"` | Wave 0 |
| COMP-06 | progress-bar default props pass Zod validation | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "progress-bar"` | Wave 0 |
| COMP-07 | divider default props pass Zod validation | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "divider"` | Wave 0 |
| COMP-08 | All 5 new chart types render without errors | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts -t "chart"` | Wave 0 |
| COMP-09 | Generic viewer resolves blueprint by slug | smoke | `npx tsc --noEmit` (route types compile) | N/A |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (mandatory per CLAUDE.md)
- **Per wave merge:** `npx vitest run && npx tsc --noEmit`
- **Phase gate:** Full suite green before verify-work

### Wave 0 Gaps
- [ ] `tools/wireframe-builder/lib/section-registry.test.ts` -- covers COMP-01 through COMP-08 (validates every registry entry has matching Zod schema + defaultProps round-trip)
- [ ] shadcn components install: `npx shadcn@latest add switch progress card`

## Open Questions

1. **Branding storage for generic viewer**
   - What we know: Current branding comes from static `.ts` files in `clients/[slug]/wireframe/branding.config.ts`. SharedWireframeView has a hardcoded `brandingMap` for dynamic imports.
   - What's unclear: Should branding be stored in Supabase alongside blueprints, or should the dynamic import map be extended? Supabase storage is more flexible but requires a schema addition. Dynamic imports require build-time knowledge of clients.
   - Recommendation: For Phase 9, use a dynamic import map keyed by client slug (extend the existing pattern in SharedWireframeView). This avoids DB schema changes. A future phase can move branding to Supabase when the briefing system (Phase 10) adds client management.

2. **Chart type naming in section type string**
   - What we know: The existing section type is `'bar-line-chart'`. Adding radar/treemap/etc. as `chartType` variants keeps the same section type string.
   - What's unclear: Whether the section type should be renamed to `'chart'` for clarity, since it now encompasses 9 chart types.
   - Recommendation: Keep `'bar-line-chart'` as the section type string for backward compatibility with existing blueprints in Supabase. The `chartType` field already serves as the sub-type discriminator.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: All 7 dispatcher files read and analyzed directly
- `package.json` + `node_modules/recharts/package.json`: Recharts 2.15.4 confirmed with all 5 chart exports verified
- `node_modules/recharts/es6/index.js`: RadarChart, Treemap, FunnelChart, ScatterChart, AreaChart all exported
- `src/components/ui/`: shadcn components inventory (separator installed; switch, progress, card missing)
- `vitest.config.ts`: Test framework configuration confirmed

### Secondary (MEDIUM confidence)
- Recharts component API patterns from training data; API shape verified against exports but not docs-checked for every prop

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed, versions verified from package.json and node_modules
- Architecture: HIGH - All 7 dispatcher locations read in full, registry pattern designed from actual code structure
- Pitfalls: HIGH - Based on direct codebase analysis (Zod sync issues, token isolation, branding resolution all observed in existing code)
- New blocks: HIGH - Follow exact same pattern as existing 15 block types
- Generic viewer: MEDIUM - Route migration is straightforward but branding resolution strategy has an open question

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable -- no breaking changes expected in locked stack)
