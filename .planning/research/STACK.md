# Stack Research: v1.1 Wireframe Evolution

**Domain:** Internal BI platform -- wireframe editor expansion, dynamic blueprints, briefing input
**Researched:** 2026-03-09
**Confidence:** HIGH (all recommendations verified against official docs/npm)

## Scope

This research covers ONLY additions/changes needed for v1.1 features. The existing stack (React 18, TypeScript strict, Tailwind CSS 3, Vite 5, Supabase, Clerk, shadcn/ui, recharts 2.x, dnd-kit, lucide-react) is validated and unchanged.

Five target areas:
1. Expanded component library (charts, inputs, form builders)
2. Blueprint data in Supabase (already stored, needs typed client + text rendering)
3. Wireframe design system (white/black/gray/gold palette, dark+light mode)
4. Claude Code access to Supabase data (MCP or MD export)
5. Briefing input UI (forms, validation, persistence)

---

## Recommended Stack Additions

### 1. Form Infrastructure (Briefing Input UI)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-hook-form | ^7.71.2 | Form state management | De facto React form library. Uncontrolled by default = minimal re-renders. shadcn/ui Form component is built on it. Zero-config TypeScript support. 85M+ weekly npm downloads. |
| zod | ^3.24.0 (v3 line) | Schema validation + type inference | TypeScript-first validation. Infers TS types from schemas = single source of truth for briefing data shapes. Stable with @hookform/resolvers. |
| @hookform/resolvers | ^5.2.2 | Connects zod to react-hook-form | Official bridge. zodResolver plugs zod schemas into react-hook-form validation pipeline. |

**Why zod v3, NOT v4:** Zod v4 (4.3.x) has known type incompatibilities with @hookform/resolvers as of March 2026. GitHub issues #12829 and #799 document ZodError thrown instead of captured by zodResolver, and input/output type mismatches in TypeScript. The v3 line (3.24.x) is stable and battle-tested with the react-hook-form ecosystem. Upgrade to v4 when @hookform/resolvers ships native v4 support without workarounds.

### 2. Toast Notifications (Save/Sync Feedback)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| sonner | ^2.0.0 | Toast notifications | shadcn/ui's recommended toast library. Simpler API than Radix Toast primitive. Supports stacking, promise-based toasts (ideal for Supabase save operations), custom JSX. Integrated via `npx shadcn@latest add sonner`. |

### 3. Additional shadcn/ui Primitives

These are NOT npm packages -- generated via `npx shadcn@latest add [name]`. Each auto-installs the correct Radix primitive version.

**Already installed:** button, badge, dialog, separator, scroll-area, command, sheet, select, input, label, popover, textarea.

| Component | Needed For | New Radix Dependency |
|-----------|-----------|---------------------|
| `form` | Briefing input with error states, field validation | react-hook-form (via npm install above) |
| `checkbox` | Multi-select in briefing (data sources, features needed) | @radix-ui/react-checkbox |
| `switch` | Toggle dark/light mode, boolean briefing options | @radix-ui/react-switch |
| `tabs` | Briefing section navigation, blueprint text/visual toggle | @radix-ui/react-tabs |
| `radio-group` | Single-select in briefing (project type, frequency) | @radix-ui/react-radio-group |
| `accordion` | Collapsible briefing sections, settings panels | @radix-ui/react-accordion |
| `card` | Form section containers, settings cards | None (pure Tailwind) |
| `dropdown-menu` | Editor toolbar actions, export options | @radix-ui/react-dropdown-menu |
| `sonner` | Toast wrapper component for shadcn styling | sonner (via npm install above) |
| `slider` | Numeric config values (column count, chart height) | @radix-ui/react-slider |

**Installation approach:** Run `npx shadcn@latest add [component]` one at a time. The CLI auto-manages Radix package versions. Do NOT manually add @radix-ui/* packages to avoid version conflicts.

### 4. Supabase MCP Server (Claude Code Access)

| Technology | Setup | Purpose | Why Recommended |
|------------|-------|---------|-----------------|
| Supabase MCP (hosted) | Claude Code config | Claude Code reads/queries blueprint data from Supabase | Official Supabase MCP server. OAuth auth (no PAT needed). `execute_sql` tool lets Claude query blueprint_configs directly. Project-scoped + read-only for safety. |

**This is NOT an npm dependency.** It is a Claude Code MCP server configuration added via CLI or settings file.

---

## What Stays Unchanged

| Technology | Current Version | Why No Change |
|------------|----------------|---------------|
| react | ^18.3.1 | Stable. React 19 migration not needed and would break Clerk/shadcn. |
| typescript | ^5.6.3 | Strict mode with zero `any`. Current. |
| tailwindcss | ^3.4.15 | v4 migration is breaking (CSS-first config). shadcn/ui compatibility uncertain. |
| vite | ^5.4.10 | Stable build tooling. No benefit from Vite 6 for this scope. |
| @supabase/supabase-js | ^2.98.0 | Already used for blueprint_configs + comments. No API changes needed. |
| @clerk/react | ^6.0.1 | Auth unchanged for v1.1. |
| recharts | ^2.13.3 | All needed chart types available. See detailed analysis below. |
| @dnd-kit/core + sortable | ^6.3.1 / ^10.0.0 | Drag-reorder works. No changes. |
| lucide-react | ^0.460.0 | Icon library. Sufficient. |
| react-markdown + remark-gfm | ^9.0.1 / ^4.0.0 | Used for blueprint text rendering. May also render briefing previews. |
| yaml | ^2.4.0 | Frontmatter parsing. Unchanged. |

---

## What NOT to Add

### Recharts Upgrade (2.x to 3.x): DEFER

Recharts 3.8.0 is current but introduces breaking changes:
- `CategoricalChartState` removed from event handlers and Customized components
- Z-index now determined by SVG render order (JSX ordering matters)
- `accessibilityLayer` defaults to true
- `recharts-scale` and `react-smooth` internalized

The current codebase uses standard recharts components (BarChart, LineChart, ComposedChart, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid) without CategoricalChartState or Customized. Migration would likely succeed, BUT:
- v1.1 scope is already large (5 feature areas)
- Recharts 2.x already has ALL needed chart types
- Risk of subtle rendering regressions in existing 10-screen pilot wireframe

**Recommendation:** Stay on recharts ^2.13.3 for v1.1. Migrate to 3.x in a dedicated maintenance phase later.

### New Chart Libraries (nivo, visx, chart.js, echarts): NOT NEEDED

Recharts 2.x already provides every chart type needed for expanded component library:
- `RadarChart` + `Radar` + `PolarGrid` + `PolarAngleAxis` -- multi-axis comparisons
- `Treemap` -- hierarchical data visualization
- `FunnelChart` + `Funnel` -- conversion/pipeline funnels
- `ScatterChart` + `Scatter` + `ZAxis` -- correlation analysis
- `AreaChart` + `Area` -- cumulative/trend data
- `Sankey` -- flow diagrams

All available via standard `import { ... } from 'recharts'`. No new package needed. Just new renderer components following the existing pattern (section type + renderer + property form + ComponentPicker entry).

### State Management (Redux, Zustand, Jotai): NOT NEEDED

Current architecture uses:
- Local state (`useState`) for UI state
- Props for the BlueprintRenderer component tree
- Supabase as persistent state (blueprint_configs, comments)
- react-hook-form (new) will handle form state

This is correct for a declarative rendering pipeline. Global state adds complexity without solving a real problem here.

### tanstack-query / SWR: DEFERRED

Explicitly out of scope per PROJECT.md: "React Query hooks with loading/error states -- v2 (AGEN-02)". Current direct Supabase calls are fine for v1.1.

### CSS-in-JS / Styled Components: NOT NEEDED

The design system already uses CSS custom properties with Tailwind utility classes. The wireframe palette (white/black/gray/gold) is achievable by adding scoped CSS variables -- no new styling paradigm needed.

### Form Builder Libraries (formik, react-jsonschema-form, survey.js): NOT NEEDED

react-hook-form + zod + shadcn Form component covers all briefing input needs. The briefing form structure is known at build time (not dynamically generated from JSON schema), so a generic form builder adds unnecessary abstraction.

### Separate Rich Text Editor (tiptap, slate, lexical): NOT NEEDED

Briefing input is structured Q&A (text fields, selects, checkboxes), not free-form rich text. react-markdown handles display of briefing previews. If rich text is ever needed, re-evaluate then.

---

## Installation Plan

```bash
# New runtime dependencies
npm install react-hook-form@^7.71.2 zod@^3.24.0 @hookform/resolvers@^5.2.2 sonner@^2.0.0

# New shadcn/ui components (run sequentially, each auto-installs Radix deps)
npx shadcn@latest add form
npx shadcn@latest add checkbox
npx shadcn@latest add switch
npx shadcn@latest add tabs
npx shadcn@latest add radio-group
npx shadcn@latest add accordion
npx shadcn@latest add card
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sonner
npx shadcn@latest add slider
```

No new dev dependencies. The project already has vitest, typescript, and vite configured.

---

## Integration Details

### A. Briefing Forms Integration

react-hook-form + zod + shadcn Form compose into a type-safe form pipeline:

```typescript
// 1. Define schema (single source of truth for validation + types)
import { z } from 'zod'

const briefingSchema = z.object({
  companyName: z.string().min(1, 'Required'),
  industry: z.string().min(1, 'Required'),
  dataSources: z.array(z.string()).min(1, 'Select at least one'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  goals: z.string().optional(),
})

type BriefingFormData = z.infer<typeof briefingSchema>

// 2. Wire into form (shadcn Form wraps react-hook-form)
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<BriefingFormData>({
  resolver: zodResolver(briefingSchema),
})
```

The zod schema also validates data before Supabase persistence, and can be shared with Claude Code for blueprint generation context.

### B. Supabase MCP Configuration

Add to project-level MCP settings. Two options:

**Option 1 -- Claude Code CLI (recommended):**
```bash
claude mcp add supabase --type http \
  "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&read_only=true"
```

**Option 2 -- Manual config file (.mcp.json at project root):**
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&read_only=true"
    }
  }
}
```

This gives Claude Code:
- `execute_sql` -- query blueprint_configs, briefings, comments
- `list_tables` -- discover/verify schema
- `generate_typescript_types` -- keep Database types in sync

Project-scoped (`project_ref`) + read-only = safe for development. Claude Code can read blueprints to generate improved versions from briefing context.

**Fallback if MCP is unreliable:** Write a Makefile target that exports blueprint data as markdown:
```bash
# In Makefile
blueprint-export:
    supabase db dump --data-only -t blueprint_configs | \
    node scripts/blueprint-to-md.js > .planning/blueprint-export.md
```
But MCP is strongly preferred because it provides live, queryable access without file sync overhead.

### C. Blueprint Typed Client

The blueprint_configs table already exists (migration 003). For v1.1, add type-safe queries:

```bash
# Generate types from existing schema
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" > src/lib/database.types.ts
```

Then use in the Supabase client:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Now typed: supabase.from('blueprint_configs').select('*')
// Returns: { id: string, client_slug: string, config: Json, ... }
```

No schema migration needed for blueprint storage. The existing `config jsonb` column holds the full BlueprintConfig. Add a `briefings` table for the new briefing data:

```sql
CREATE TABLE public.briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  answers jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'complete', 'archived')),
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_briefings" ON briefings FOR ALL TO anon USING (true);
CREATE INDEX idx_briefings_client_slug ON briefings(client_slug);
```

### D. Wireframe Design System (No New Libraries)

The white/black/gray/gold palette uses the EXISTING CSS custom property system. Add a `.wireframe` scope class in globals.css:

```css
/* Wireframe-specific palette -- neutral + gold accent */
.wireframe {
  --background: 0 0% 100%;       /* Pure white */
  --foreground: 0 0% 7%;         /* Near black */
  --muted: 0 0% 96%;             /* Light gray */
  --muted-foreground: 0 0% 45%;  /* Medium gray */
  --border: 0 0% 90%;            /* Subtle gray */
  --accent: 43 96% 56%;          /* Gold */
  --card: 0 0% 100%;             /* White cards */
  --card-foreground: 0 0% 7%;    /* Near black text */
}

.wireframe.dark {
  --background: 0 0% 7%;         /* Near black */
  --foreground: 0 0% 96%;        /* Near white */
  --muted: 0 0% 12%;             /* Dark gray */
  --muted-foreground: 0 0% 65%;  /* Medium gray */
  --border: 0 0% 17%;            /* Subtle dark border */
  --accent: 43 85% 50%;          /* Gold (desaturated) */
  --card: 0 0% 9%;               /* Dark card */
  --card-foreground: 0 0% 96%;   /* Near white text */
}
```

This scoping means wireframe components automatically use the neutral palette while the FXL Core app shell keeps its blue-gray theme. Client branding (--brand-*) overrides work unchanged because they target chart colors and specific brand elements, not the base palette.

### E. New Recharts Components (No New Imports Needed)

For expanded chart types, use existing recharts 2.x:

```typescript
// All available in recharts ^2.13.3 -- no new packages
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { Treemap } from 'recharts'
import { FunnelChart, Funnel, LabelList } from 'recharts'
import { ScatterChart, Scatter, ZAxis } from 'recharts'
import { AreaChart, Area } from 'recharts'
```

Each new chart type follows the established pattern:
1. New type in `BlueprintSection` union (`tools/wireframe-builder/types/blueprint.ts`)
2. New component (`tools/wireframe-builder/components/RadarChartComponent.tsx`, etc.)
3. New renderer or case in SectionRenderer switch
4. New property form (`tools/wireframe-builder/components/editor/property-forms/`)
5. Entry in ComponentPicker for editor add-section flow

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| react-hook-form + zod | formik + yup | Formik re-renders on every keystroke (controlled). Yup has weaker TypeScript type inference. shadcn/ui Form component is built specifically on RHF. |
| zod v3 (3.24.x) | zod v4 (4.3.x) | Type incompatibilities with @hookform/resolvers documented in multiple GitHub issues. Upgrade when resolver ecosystem stabilizes. |
| sonner for toasts | @radix-ui/react-toast (shadcn toast) | Sonner has simpler API, better stacking behavior, promise-based toasts for async operations. shadcn recommends sonner. |
| Supabase MCP (hosted) | Custom Edge Function exporting MD | MCP provides live SQL access + type generation. Edge Function needs deploy + maintenance. |
| Supabase MCP (hosted) | Local Supabase MCP (localhost:54321) | Hosted works without running local Supabase. Production data accessible directly. |
| CSS variable scoping | CSS Modules / styled-components | Already using CSS vars for theming. New pattern creates inconsistency. |
| recharts 2.x (keep) | recharts 3.x (upgrade) | Breaking changes + large v1.1 scope = unnecessary risk. Upgrade separately later. |
| recharts 2.x (keep) | nivo / visx / echarts | Recharts already has all needed chart types. Switching = rewrite 4+ chart components + all property forms. |
| react-hook-form | tanstack-form | TanStack Form is newer with less ecosystem adoption. shadcn/ui Form is built on RHF. |

---

## Version Compatibility Matrix

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| react-hook-form@^7.71.2 | react@^18.3.1 | Requires React 16.8+. Fully tested with React 18. |
| zod@^3.24.0 | @hookform/resolvers@^5.2.2 | v3 line stable. Resolvers@5.2.x has native v3 support. |
| @hookform/resolvers@^5.2.2 | react-hook-form@^7.x, zod@>=3.22.0 | Requires zod >=3.22.0 for proper module resolution. |
| sonner@^2.0.0 | react@^18.3.1 | Standalone. No Radix dependency. |
| recharts@^2.13.3 | react@^18.3.1 | All chart types (Radar, Treemap, Funnel, Scatter, Area) available. |
| shadcn/ui components | @radix-ui/* (auto-managed by CLI) | CLI pins correct Radix versions per component. |
| Supabase MCP (hosted) | @supabase/supabase-js@^2.x | MCP reads same DB. No version coupling with app client. |

---

## Summary of Changes

**4 npm packages to install:**
- `react-hook-form` -- form state for briefing UI
- `zod` -- validation schemas for briefing + blueprint data
- `@hookform/resolvers` -- zod-to-RHF bridge
- `sonner` -- toast notifications

**10 shadcn/ui components to add** (via CLI, auto-install Radix deps):
- form, checkbox, switch, tabs, radio-group, accordion, card, dropdown-menu, sonner, slider

**1 MCP server to configure** (not a code dependency):
- Supabase MCP for Claude Code access to blueprint data

**1 SQL migration** (new table):
- `briefings` table for briefing input persistence

**0 existing packages changed.** Everything else stays at current versions.

---

## Sources

- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) -- v7.71.2 verified current
- [zod npm](https://www.npmjs.com/package/zod) -- v3.24.x and v4.3.6 both maintained
- [Zod v4 + hookform resolvers issues](https://github.com/react-hook-form/react-hook-form/issues/12829) -- type incompatibilities documented
- [@hookform/resolvers npm](https://www.npmjs.com/package/@hookform/resolvers) -- v5.2.2 verified current
- [shadcn/ui forms docs](https://ui.shadcn.com/docs/forms/react-hook-form) -- RHF + zod integration guide
- [shadcn/ui component list](https://ui.shadcn.com/docs/components) -- available primitives
- [recharts npm](https://www.npmjs.com/package/recharts) -- v3.8.0 current, v2.x still works
- [recharts 3.0 migration guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) -- breaking changes documented
- [recharts specialized charts](https://deepwiki.com/recharts/recharts/3.3-specialized-charts) -- Treemap, Funnel, Radar confirmed available in 2.x
- [Supabase MCP docs](https://supabase.com/docs/guides/getting-started/mcp) -- hosted setup, project scoping
- [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp) -- configuration, auth, tools list
- [Supabase type generation](https://supabase.com/docs/guides/api/rest/generating-types) -- CLI command for Database types
- [sonner npm](https://www.npmjs.com/package/sonner) -- v2.x, recommended by shadcn/ui

---
*Stack research for: FXL Core v1.1 Wireframe Evolution*
*Researched: 2026-03-09*
