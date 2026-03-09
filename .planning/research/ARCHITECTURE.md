# Architecture Research: v1.1 Wireframe Evolution Integration

**Domain:** Internal BI platform -- wireframe system evolution (file-to-DB migration, visual redesign, component expansion)
**Researched:** 2026-03-09
**Confidence:** HIGH (based on direct codebase analysis of 80+ files + verified Supabase documentation)

## System Overview: Current vs Target

### Current Architecture (v1.0)

```
                       FILE SYSTEM                    SUPABASE
                    +------------------+         +--------------------+
                    | blueprint        |  seed   | blueprint_configs  |
                    | .config.ts       |--on---->| (JSONB blob)       |
                    | (per client)     |  first  |                    |
                    +------------------+  load   +--------+-----------+
                                                          |
                    +------------------+                   | load/save
                    | branding         |                   |
                    | .config.ts       |--static import-+  |
                    +------------------+                |  |
                                                       v  v
                    +----------------------------------------------------+
                    |          WireframeViewer (per-client page)          |
                    |  +-----------+ +------------+ +----------------+   |
                    |  | AdminTool | | Screen     | | Property       |   |
                    |  | bar       | | Manager    | | Panel          |   |
                    |  +-----------+ +------------+ +----------------+   |
                    |           |                                         |
                    |           v                                         |
                    |  +-------------------------------------------------+
                    |  |       BlueprintRenderer                         |
                    |  |  rows[] -> SortableRow -> SectionRenderer      |
                    |  |    (dispatch by type: 15 section types)         |
                    |  +-------------------------------------------------+
                    +----------------------------------------------------+
```

### Target Architecture (v1.1)

```
     BRIEFING INPUT              SUPABASE (source of truth)            CLAUDE CODE
    +---------------+       +----------------------------------+    +---------------+
    | UI Briefing   |       | briefings (structured JSONB)     |    | Reads .md     |
    | Form/Chat     |------>| blueprint_configs (JSONB blob)   |<---| export file   |
    +---------------+       | branding_configs (JSONB)         |    | (no MCP)      |
                            +---------+----------+-------------+    +---------------+
                                      |          |
                    +-----------------+          +-----------------+
                    v                                              v
         +------------------+                           +------------------+
         | Blueprint        |                           | Wireframe Viewer |
         | Text View        |                           | (visual render)  |
         | (read-only)      |                           | + editor         |
         +------------------+                           | + theme toggle   |
                                                        +------------------+
```

## Component Responsibilities: What Changes vs What Stays

### UNCHANGED Components (zero modifications needed)

| Component | Location | Why Unchanged |
|-----------|----------|---------------|
| `SectionRenderer.tsx` | `tools/.../sections/SectionRenderer.tsx` | Type dispatch stays identical; new types just add cases |
| All 15 section renderers | `tools/.../sections/*.tsx` | Visual rendering of existing types unchanged |
| `PropertyPanel.tsx` + all 15 forms | `tools/.../editor/PropertyPanel.tsx` | Form rendering stays identical |
| `CommentOverlay` / `CommentManager` | `tools/.../components/Comment*.tsx` | Comment system independent of data source |
| `branding.ts` utility functions | `tools/.../lib/branding.ts` | Pure functions, input type unchanged |
| `config-resolver.ts` | `tools/.../lib/config-resolver.ts` | Receives BlueprintConfig, source irrelevant |
| `globals.css` app theme tokens | `src/styles/globals.css` | App theme remains separate from wireframe theme |
| `grid-layouts.ts` | `tools/.../lib/grid-layouts.ts` | Row/grid logic unchanged |

### MODIFIED Components (existing files that need targeted changes)

| Component | Location | What Changes | Why |
|-----------|----------|-------------|-----|
| `blueprint-store.ts` | `tools/.../lib/blueprint-store.ts` | Add `loadBranding()` / `saveBranding()` for branding_configs table | Branding moves from file to DB |
| `WireframeViewer.tsx` | `src/pages/.../WireframeViewer.tsx` | Replace static branding import with DB load; wrap content in theme provider; remove hardcoded `CLIENT_SLUG` | Branding from DB; wireframe theme toggle |
| `SharedWireframeView.tsx` | `src/pages/SharedWireframeView.tsx` | Same DB-sourced branding changes as WireframeViewer | Consistency |
| `BlueprintRenderer.tsx` | `tools/.../components/BlueprintRenderer.tsx` | Use `--wf-*` CSS vars for wireframe chrome styling | Wireframe theme support |
| `ComponentPicker.tsx` | `tools/.../editor/ComponentPicker.tsx` | Add new entries to `SECTION_CATALOG` array | Expanded component library |
| `App.tsx` | `src/App.tsx` | Add routes: blueprint text view, briefing form, generic wireframe viewer | New pages |
| `types/blueprint.ts` | `tools/.../types/blueprint.ts` | Add new types to `BlueprintSection` discriminated union | Expanded component types |

### NEW Components (files to create)

| Component | Proposed Location | Purpose |
|-----------|-------------------|---------|
| `BlueprintTextView.tsx` | `src/pages/clients/BlueprintTextView.tsx` | Read-only textual rendering of blueprint from DB |
| `BriefingForm.tsx` | `src/pages/clients/BriefingForm.tsx` | UI for inputting/editing briefing data |
| `branding-store.ts` | `tools/.../lib/branding-store.ts` | CRUD for branding_configs table |
| `briefing-store.ts` | `tools/.../lib/briefing-store.ts` | CRUD for briefings table |
| `blueprint-export.ts` | `tools/.../lib/blueprint-export.ts` | Export blueprint as MD for Claude Code |
| `WireframeThemeProvider.tsx` | `tools/.../components/WireframeThemeProvider.tsx` | Theme context for wireframe dark/light toggle |
| New section renderers | `tools/.../sections/*.tsx` | For expanded component types (settings, forms, stat-card, etc.) |
| New property forms | `tools/.../editor/property-forms/*.tsx` | Editor forms for new component types |
| `004_blueprint_evolution.sql` | `supabase/migrations/` | New tables: briefings, branding_configs |
| `export-blueprint.ts` | `scripts/` | CLI tool for MD export |
| `types/briefing.ts` | `tools/.../types/briefing.ts` | TypeScript types for briefing data |

## Architectural Patterns

### Pattern 1: Keep JSONB Blob as Primary Blueprint Store

**What:** The existing `blueprint_configs` table stores the full `BlueprintConfig` as a single JSONB column. Keep this as the primary read/write path for the visual editor. Do NOT normalize blueprints into separate screens/sections tables.

**Why NOT normalize:**

The analysis of the existing codebase reveals critical reasons against normalization:

1. **The visual editor reads/writes entire configs atomically.** `WireframeViewer.tsx` loads the full `BlueprintConfig` on mount (line 80-86), clones it for edit mode (line 211), and saves the entire object back on save (line 243). Normalizing would force assembly of a deeply nested object on every load -- complexity with zero benefit at FXL's client count.

2. **Sections are a discriminated union of 15+ types.** Each type has a unique shape (`KpiGridSection` has `items[]`, `BarLineChartSection` has `chartType`, etc.). Storing these in a normalized table requires a polymorphic schema (type column + JSONB payload per row) -- which is just JSONB with extra steps.

3. **`ScreenRow` nesting makes relational modeling painful.** Screens contain `rows[]`, each with a `layout` and `sections[]`. A section like `chart-grid` contains other sections recursively. This tree structure maps naturally to JSON, not relational tables.

4. **Current scale is 1 client.** Even at 10-20 clients, JSONB queries by `client_slug` (indexed) return in under 5ms.

**What to add for text view / export needs:**

Instead of normalized tables, use JSONB operators to query specific parts of the blueprint:

```sql
-- Get screen titles for text view sidebar
SELECT config->'screens' AS screens
FROM blueprint_configs
WHERE client_slug = 'financeiro-conta-azul';

-- Find sections of a specific type (for analytics, not rendering)
SELECT s->>'title' as title
FROM blueprint_configs,
     jsonb_array_elements(config->'screens') AS screen,
     jsonb_array_elements(screen->'sections') AS s
WHERE client_slug = 'financeiro-conta-azul'
  AND s->>'type' = 'kpi-grid';
```

**Trade-offs:**
- PRO: Zero migration complexity -- existing table and code paths unchanged
- PRO: Atomic reads/writes match editor's actual usage pattern
- PRO: BlueprintConfig TypeScript type remains the single contract
- CON: No per-screen granular queries without JSONB operators
- CON: Blueprint text view must load entire config even to show one screen
- MITIGATION: At current data sizes (<50KB per config), loading entire config is negligible

**Confidence:** HIGH -- preserving proven architecture, avoiding unnecessary normalization.

### Pattern 2: Three-Layer Theme Isolation

**What:** Three independent CSS variable scopes that never collide.

```
Layer 1: App Theme         --primary, --accent, --foreground, etc.
                           (globals.css :root / .dark)
                           Controls: Sidebar, docs, home, all app chrome

Layer 2: Wireframe Theme   --wf-bg, --wf-fg, --wf-surface, --wf-accent, --wf-border
                           (wireframe container via data-wf-theme="light|dark")
                           Controls: Wireframe shell (header, sidebar, content area bg)

Layer 3: Client Branding   --brand-primary, --brand-secondary, --brand-accent, etc.
                           (wireframe container via inline style, existing)
                           Controls: Client-specific colors in charts, KPIs, tables
```

**Why a separate wireframe theme layer:**

The current codebase already has two layers working:
- **App theme:** `globals.css` defines `:root` and `.dark` with `--primary: 220 16% 22%` (dark gray-blue) and `--accent: 43 96% 56%` (gold). The `Layout` component uses these.
- **Client branding:** `branding.ts` generates `--brand-*` CSS vars injected at wireframe container level via `brandingToCssVars()`. These control chart colors and KPI highlights.

The v1.1 requirement adds a wireframe-specific dark/light toggle (white/black/gray/gold palette). This toggle must:
- NOT affect the FXL Core app theme (which has its own dark mode)
- NOT override client branding colors
- Only affect the wireframe chrome: sidebar bg, content area bg, card surfaces, text color

**Implementation:**

```css
/* Append to globals.css or new wireframe-theme.css */
[data-wf-theme="light"] {
  --wf-bg: 0 0% 97%;           /* light gray background */
  --wf-fg: 0 0% 10%;           /* near-black text */
  --wf-surface: 0 0% 100%;     /* white cards */
  --wf-surface-alt: 0 0% 95%;  /* slightly off-white */
  --wf-border: 0 0% 88%;       /* subtle borders */
  --wf-accent: 43 96% 56%;     /* gold */
  --wf-accent-fg: 43 50% 10%;  /* dark text on gold */
  --wf-muted: 0 0% 60%;        /* muted text */
}

[data-wf-theme="dark"] {
  --wf-bg: 0 0% 7%;            /* near-black background */
  --wf-fg: 0 0% 96%;           /* near-white text */
  --wf-surface: 0 0% 12%;      /* dark cards */
  --wf-surface-alt: 0 0% 15%;  /* slightly lighter dark */
  --wf-border: 0 0% 20%;       /* subtle borders */
  --wf-accent: 43 85% 50%;     /* gold, slightly desaturated */
  --wf-accent-fg: 43 20% 96%;  /* light text on gold */
  --wf-muted: 0 0% 55%;        /* muted text */
}
```

```tsx
// WireframeThemeProvider.tsx -- wraps wireframe viewer
type WfTheme = 'light' | 'dark'

const WfThemeContext = createContext<{
  theme: WfTheme
  toggle: () => void
}>({ theme: 'light', toggle: () => {} })

export function WireframeThemeProvider({
  children,
  brandVars,
}: {
  children: React.ReactNode
  brandVars: React.CSSProperties
}) {
  const [theme, setTheme] = useState<WfTheme>('light')
  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <WfThemeContext.Provider value={{ theme, toggle }}>
      <div data-wf-theme={theme} style={brandVars}>
        {children}
      </div>
    </WfThemeContext.Provider>
  )
}
```

Wireframe components use `bg-[hsl(var(--wf-surface))]` for chrome and `var(--brand-primary)` for client colors. The existing `brandingToCssVars()` function is unchanged -- its output is applied as inline styles on the same container.

**Confidence:** HIGH -- extends the proven `--brand-*` prefix pattern from v1.0 and the existing app `:root`/`.dark` pattern.

### Pattern 3: Claude Code Access via MD Export (Not MCP)

**What:** Export blueprint data as Markdown files that Claude Code reads via standard file access, rather than configuring a Supabase MCP connector.

**Analysis of MCP vs MD Export for FXL Core:**

| Factor | MCP Connector | MD Export |
|--------|---------------|-----------|
| Setup | MCP server config, OAuth flow, project scoping | Zero -- just file read |
| Runtime | Requires MCP server running, network access | None -- static file |
| Security | Claude Code gets raw DB query access | Read-only .md file |
| Debugging | Opaque SQL queries generated by LLM | Human-readable Markdown |
| FXL constraint | "No heavy backend beyond Supabase" | Files are free |
| Data freshness | Real-time | On-demand (run before Claude session) |
| Effort to implement | Install `@supabase/mcp`, configure `.mcp.json` | Write one export function |

The Supabase MCP server (verified via official docs) provides `execute_sql`, `list_tables`, and other powerful tools. It supports `project_ref` scoping and `read_only=true` mode. However, for FXL Core's current scale (1 client, blueprints <50KB), the MD export approach is simpler and safer.

**Implementation:**

```typescript
// tools/wireframe-builder/lib/blueprint-export.ts

export function blueprintToMarkdown(config: BlueprintConfig): string {
  const lines: string[] = [
    `# Blueprint: ${config.label}`,
    `**Slug:** ${config.slug}`,
    `**Screens:** ${config.screens.length}`,
    '',
  ]

  for (const screen of config.screens) {
    lines.push(`## ${screen.title}`)
    lines.push(`- ID: ${screen.id}`)
    lines.push(`- Period: ${screen.periodType}`)
    lines.push(`- Compare switch: ${screen.hasCompareSwitch ? 'Yes' : 'No'}`)
    if (screen.filters.length > 0) {
      lines.push(`- Filters: ${screen.filters.map(f => f.label).join(', ')}`)
    }
    lines.push('')

    for (const section of screen.sections) {
      lines.push(`### [${section.type}]`)
      // Type-specific detail rendering per discriminated union type
      lines.push(sectionToMarkdown(section))
      lines.push('')
    }
  }

  return lines.join('\n')
}
```

Invoked via `npm run export-blueprint -- --client financeiro-conta-azul` writing to `clients/[slug]/wireframe/blueprint.export.md`. Claude Code reads this file naturally before generating or modifying blueprints.

**Future upgrade path:** If FXL grows to 20+ clients or needs real-time AI-DB interaction, MCP can be added. The Supabase MCP supports project-scoped read-only mode. But for v1.1 with one pilot client, MD export is the pragmatic choice.

**Confidence:** MEDIUM -- MCP would work technically, but MD export is simpler for current scale. Re-evaluate at v2.0.

### Pattern 4: Registry-Based Component Expansion

**What:** Extend the existing discriminated union + switch dispatch pattern for new section types. Do NOT change the architecture -- just add more cases to the existing pattern.

**Current pattern (5 touch points per new section type):**

1. Add type to `BlueprintSection` union in `types/blueprint.ts`
2. Add renderer in `tools/.../sections/` folder
3. Add case to `SectionRenderer.tsx` switch statement
4. Add property form in `tools/.../editor/property-forms/`
5. Add case to `PropertyPanel.tsx` switch + entry to `ComponentPicker.tsx` catalog

**Recommended new section types:**

| Type | Purpose | Renderer Complexity | Why Needed |
|------|---------|---------------------|------------|
| `settings-page` | Full settings layout with grouped inputs | Medium | v1.1 target: settings pages |
| `form-section` | Generic form with configurable fields | Medium | v1.1 target: input blocks |
| `filter-config` | Configurable filter bar component | Low | v1.1 target: dynamic filters |
| `stat-card` | Single large statistic with subtitle | Low | Simpler than kpi-grid for hero stats |
| `progress-bar` | Progress indicator with label/value | Low | Common in settings/status screens |
| `divider` | Visual separator between sections | Trivial | Layout utility |

**Section types NOT to add:**

| Rejected Type | Why Not |
|---------------|---------|
| `tabs-container` | Container-of-containers breaks flat section model; use screens instead |
| `accordion` | Complex state management; use separate sections with info-blocks |
| `generic-component` | Violates discriminated union pattern; every type must have known shape |

**Confidence:** HIGH -- extending established pattern, not inventing new architecture.

### Pattern 5: Briefing Storage as Structured JSONB

**What:** Store briefings as structured JSONB documents in a `briefings` table, not as Markdown files in git.

**Why DB over files:**

The existing `clients/financeiro-conta-azul/docs/briefing.md` is a Markdown file committed to git. For v1.1, briefings need to be:
- Created/edited via UI (not git commits)
- Read by Claude Code for AI blueprint generation
- Linked to specific blueprint versions
- Queryable by status (draft/approved)

**Schema:**

```sql
CREATE TABLE public.briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  content jsonb NOT NULL,            -- structured briefing sections
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'archived')),
  created_by text,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_slug, version)
);
```

**Briefing content JSONB structure** (based on analysis of existing `briefing.md`):

```typescript
type BriefingContent = {
  productContext: {
    productName: string
    productType: string    // 'BI de Plataforma' | 'BI Personalizado' | ...
    sourceSystem: string
    objective: string
    targetAudience: string
  }
  dataSources: {
    reportTypes: {
      name: string
      format: string       // 'Excel' | 'CSV' | 'API'
      frequency: string
      fields: { name: string; usage: string }[]
    }[]
  }
  screens: {
    name: string
    purpose: string
    kpis?: string[]
    charts?: string[]
    tables?: string[]
    notes?: string
  }[]
  businessRules?: string[]
  constraints?: string[]
  notes?: string
}
```

**Claude Code access:** The MD export script includes briefing data alongside blueprint data, so Claude Code gets full context when generating blueprints.

**Confidence:** HIGH -- follows same JSONB pattern as existing blueprint_configs table.

## Data Flow

### Current Flow: File-Seed to DB

```
blueprint.config.ts (static import)
    |
    v (seed on first load, if DB empty)
blueprint_configs.config (JSONB blob)
    |
    v (loadBlueprint)
WireframeViewer state (BlueprintConfig)
    |
    v (structuredClone for edit mode)
workingConfig state
    |
    v (saveBlueprintToDb)
blueprint_configs.config (JSONB updated)
```

### Target Flow: DB-First

```
WRITE PATH (editor saves -- unchanged logic):
  WireframeViewer workingConfig
      |
      v (saveBlueprintToDb -- existing function, same JSONB blob)
  blueprint_configs.config


READ PATH A (wireframe visual -- unchanged):
  blueprint_configs.config (JSONB blob)
      |
      v (loadBlueprint -- existing function)
  WireframeViewer state (BlueprintConfig)


READ PATH B (text view -- NEW):
  blueprint_configs.config (same JSONB blob, same table)
      |
      v (loadBlueprint -- same function reused)
  BlueprintTextView (iterates screens, renders as formatted text)


READ PATH C (Claude Code -- NEW):
  blueprint_configs.config
      |
      v (loadBlueprint + blueprintToMarkdown)
  clients/[slug]/wireframe/blueprint.export.md (generated file)
      |
      v (Claude Code reads file)
  AI generates/modifies blueprint


BRANDING FLOW (file -> DB migration):
  CURRENT: branding.config.ts (static import at module scope)
  TARGET:  branding_configs table (JSONB)
      |
      v (loadBranding -- async, in useEffect)
  branding state (BrandingConfig)
      |
      v (resolveBranding -- same pure function, unchanged)
  brandVars, chartPalette (used throughout session)

  MIGRATION: Keep .ts file as seed fallback (same pattern as blueprint seed)


BRIEFING FLOW (entirely NEW):
  BriefingForm UI
      |
      v (saveBriefing)
  briefings table (JSONB content)
      |
      v (Claude Code reads via MD export)
  AI generates BlueprintConfig
      |
      v (saveBlueprintToDb)
  blueprint_configs.config
```

### Key Architectural Invariant

The `BlueprintConfig` TypeScript type is the contract boundary between storage and rendering. Whether data comes from a `.ts` file, JSONB blob, or future normalized tables, the object passed to `BlueprintRenderer` must conform to `BlueprintConfig`. This invariant must never be violated.

## Recommended Project Structure (new and modified files only)

```
tools/wireframe-builder/
  lib/
    blueprint-store.ts            # MODIFY -- add loadBranding/saveBranding
    blueprint-export.ts           # NEW -- MD export for Claude Code
    briefing-store.ts             # NEW -- briefing CRUD
  components/
    WireframeThemeProvider.tsx     # NEW -- wireframe dark/light toggle
    BlueprintRenderer.tsx          # MODIFY -- use --wf-* vars
    sections/
      SettingsPageRenderer.tsx     # NEW
      FormSectionRenderer.tsx      # NEW
      FilterConfigRenderer.tsx     # NEW
      StatCardRenderer.tsx         # NEW
      ProgressBarRenderer.tsx      # NEW
      DividerRenderer.tsx          # NEW
    editor/
      ComponentPicker.tsx          # MODIFY -- add new catalog entries
      PropertyPanel.tsx            # MODIFY -- add new form cases
      property-forms/
        SettingsPageForm.tsx       # NEW
        FormSectionForm.tsx        # NEW
        FilterConfigForm.tsx       # NEW
        StatCardForm.tsx           # NEW
  types/
    blueprint.ts                  # MODIFY -- add new section types to union
    briefing.ts                   # NEW -- briefing type definitions

src/
  pages/
    clients/
      BlueprintTextView.tsx       # NEW -- read-only blueprint rendering
      BriefingForm.tsx            # NEW -- briefing input UI
  App.tsx                         # MODIFY -- new routes
  styles/
    globals.css                   # MODIFY -- append wireframe theme vars

supabase/migrations/
  004_blueprint_evolution.sql     # NEW -- briefings + branding_configs tables

scripts/
  export-blueprint.ts            # NEW -- CLI for MD export
```

## Anti-Patterns

### Anti-Pattern 1: Normalizing Sections into Individual Rows

**What people do:** Create a `blueprint_sections` table with one row per section (type, title, config columns).
**Why it's wrong:** Sections are a discriminated union of 15+ types with unique shapes. `chart-grid` sections contain other sections recursively. The editor reads/writes entire screen configs atomically via `structuredClone`. Normalizing forces polymorphic schemas, recursive joins, and sort_order updates on every drag-reorder -- all for zero performance benefit at current scale.
**Do this instead:** Keep sections as JSONB within `blueprint_configs.config`. Use JSONB operators for any targeted queries.

### Anti-Pattern 2: Using App Theme Tokens in Wireframe Components

**What people do:** Use `bg-primary`, `text-foreground`, `border-border` in wireframe section renderers.
**Why it's wrong:** The wireframe viewer runs full-screen outside `<Layout>` (verified in `App.tsx` lines 57-61). App tokens (`--primary`, `--accent`) serve the FXL Core shell. If the wireframe has its own dark/light toggle, it must NOT inherit or conflict with the app theme. Client branding (`--brand-*`) already exists as a third layer.
**Do this instead:** Wireframe chrome components use `--wf-*` tokens. Chart and data components use `--brand-*` tokens. Never reference `--primary`, `--accent`, or bare Tailwind theme colors in `tools/wireframe-builder/components/`.

### Anti-Pattern 3: One WireframeViewer Page Per Client

**What people do:** Create `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` for each client, with hardcoded `CLIENT_SLUG` and static branding imports.
**Why it's wrong:** Currently done exactly this way (verified: line 37 `const CLIENT_SLUG = 'financeiro-conta-azul'`, lines 12-13 static branding import). Does not scale. Each new client requires a new page file, route, and static imports.
**Do this instead:** Create a generic `GenericWireframeViewer.tsx` parameterized by `:clientSlug` route param. Load blueprint, branding, and comments dynamically by slug from DB. The existing per-client page can redirect during migration.

### Anti-Pattern 4: MCP as Primary Data Access for AI

**What people do:** Configure Supabase MCP so Claude Code reads blueprints directly from the database.
**Why it's wrong for v1.1:** Adds infrastructure dependency (MCP server), security surface (Claude has DB query access), and debugging opacity (SQL generated by LLM is hard to audit). FXL Core's constraint is minimal backend infrastructure.
**Do this instead:** Export blueprints to Markdown that Claude Code reads natively. Fast, auditable, zero infrastructure. Upgrade to MCP when scale demands it.

### Anti-Pattern 5: Separate Branding Table with Normalized Color Columns

**What people do:** Create `branding_configs` with columns for `primary_color`, `secondary_color`, `heading_font`, etc.
**Why it's wrong:** `BrandingConfig` is already a well-typed TypeScript interface with 7 fields. The branding utilities (`resolveBranding`, `brandingToCssVars`, `getChartPalette`) expect this exact shape. Normalizing to columns adds schema migration friction when adding fields (e.g., `darkModeOverrides`), while JSONB handles schema evolution naturally.
**Do this instead:** Store `BrandingConfig` as a JSONB blob (same pattern as `blueprint_configs.config`). Type-check on the application side with TypeScript.

## Integration Points

### External Services

| Service | Current Integration | v1.1 Changes |
|---------|---------------------|--------------|
| Supabase | `@supabase/supabase-js` via `src/lib/supabase.ts` singleton | Add 2 new tables; same client instance, same RLS pattern |
| Clerk | `@clerk/react` for operator auth; localStorage UUID for anon | No changes |
| Vercel | Static SPA deploy | No changes |

### Internal Boundaries

| Boundary | Communication | v1.1 Impact |
|----------|---------------|-------------|
| `tools/wireframe-builder/` <-> `src/pages/` | Import components + lib functions | New store modules imported by new/modified pages |
| `tools/.../types/` <-> `tools/.../components/` | TypeScript discriminated union as contract | New section types added to union |
| `tools/.../lib/` <-> Supabase | `supabase.from()` queries | 2 new tables, same query pattern |
| `clients/[slug]/` <-> `tools/` | Config files (seed data) | Files become seed-only fallback; DB is primary |
| `scripts/` <-> `tools/.../lib/` | CLI export calls lib functions | New dependency direction |

### Build Order Considering Dependencies

```
                     +------------------------+
              1.     |  Migration 004         |  (tables must exist first)
                     |  (briefings +          |
                     |   branding_configs)    |
                     +----------+-------------+
                                |
               +----------------+------------------+
               v                v                  v
      2a. +----------+  2b. +----------+  2c. +-------------+
          | branding |      | briefing |      | wireframe   |
          | store.ts |      | store.ts |      | theme CSS   |
          +----+-----+      +----+-----+      | + provider  |
               |                  |           +------+------+
               v                  |                  |
      3.  +-----------+           |                  |
          | Viewer    |           |                  |
          | loads     |<----------+                  |
          | from DB   |<-----------------------------+
          +-----------+
               |
               v
      4.  +------------------+
          | Blueprint text   |  (needs DB read path working)
          | view + MD export |
          +--------+---------+
                   |
                   v
      5.  +------------------+
          | New section types|  (independent of DB -- can parallelize with 2-4)
          | (renderers +     |
          |  forms + catalog)|
          +------------------+
```

**Rationale:**
- Migration 004 is the foundation; all store modules depend on tables existing
- Branding store, briefing store, and theme CSS have zero dependencies on each other (parallelize)
- Viewer modifications depend on branding store (async load) and theme provider (wrapper)
- Text view depends on working blueprint load from DB (which already exists)
- New section types are completely independent of all DB work and can be built in parallel at any phase
- MD export depends on blueprint types being stable (build after section type expansion)

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-5 clients (current) | JSONB blob per client is fine; per-client viewer pages acceptable |
| 5-20 clients | Generic viewer with `:clientSlug` route param; client index page listing all clients |
| 20-100 clients | Add GIN index on `blueprint_configs.config` for JSONB queries; paginate text view |
| 100+ clients | Consider normalized screens table alongside JSONB; MCP for AI workflows |

### Scaling Priorities

1. **First bottleneck (at 2 clients):** Hardcoded `CLIENT_SLUG` and static imports in WireframeViewer. Fix by parameterizing the viewer page.
2. **Second bottleneck (at 5 clients):** Branding files committed to git per client. Fix is already in v1.1 scope (branding_configs DB table).
3. **Third bottleneck (at 20+ clients):** Blueprint export for Claude Code must handle many clients. Fix by adding a client selector to export script.

## Sources

- Supabase MCP documentation: https://supabase.com/docs/guides/getting-started/mcp
- Supabase MCP GitHub: https://github.com/supabase-community/supabase-mcp
- Supabase JSON documentation: https://supabase.com/docs/guides/database/json
- Supabase migration docs: https://supabase.com/docs/guides/deployment/database-migrations
- Supabase schema design: https://dev.to/pipipi-dev/schema-design-with-supabase-partitioning-and-normalization-4b7i
- Supabase best practices: https://www.leanware.co/insights/supabase-best-practices
- Direct codebase analysis: `tools/wireframe-builder/` (80+ files), `src/pages/` (11 files), `supabase/migrations/` (3 files)
- Verified types: `BlueprintConfig` (219 lines), `BlueprintRenderer` (293 lines), `WireframeViewer` (734 lines)

---
*Architecture research for: FXL Core v1.1 Wireframe Evolution -- integration with existing system*
*Researched: 2026-03-09*
