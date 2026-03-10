# Phase 11: AI-Assisted Generation - Research

**Researched:** 2026-03-10
**Domain:** AI-driven blueprint generation from structured briefing data
**Confidence:** HIGH

## Summary

Phase 11 connects the structured briefing input (Phase 10) to automated blueprint generation via Claude Code as a terminal-invoked SKILL. The generation pipeline is: read BriefingConfig from Supabase, analyze business context, map modules/KPIs to screen recipes, produce a valid BlueprintConfig, validate with Zod, save to Supabase. The operator then views and edits the result via the existing wireframe viewer and visual editor.

The critical architectural insight is that Claude Code runs as a terminal agent, not inside the Vite browser runtime. The existing store files (`briefing-store.ts`, `blueprint-store.ts`) depend on `@/lib/supabase` which uses `import.meta.env` -- unavailable outside Vite. A thin Node.js CLI script is needed to bridge this gap: read env vars from `.env.local`, create a Supabase client, load briefing, and save the generated blueprint. Claude Code then generates the BlueprintConfig JSON and passes it to this script.

**Primary recommendation:** Build a Node.js CLI script (`tools/wireframe-builder/scripts/generate-blueprint.ts`) that Claude Code invokes via `npx tsx`, with screen recipes as typed objects in a dedicated module, and vertical templates as pre-defined BlueprintConfig skeletons.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Generation trigger: Claude Code SKILL (SKILL.md in wireframe-builder) -- operator invokes from terminal
- Reads briefing from Supabase via `briefing-store.ts`
- Generates valid BlueprintConfig, validates with Zod schema
- Saves directly to Supabase via `blueprint-store.ts`
- Operator opens wireframe viewer and sees the result immediately
- No approval flow -- first version is generated directly, operator edits afterward
- Output destination: direct to Supabase (same table/pattern as manual blueprints)
- No local file intermediary

### Claude's Discretion
- Screen recipe structure: typed screen templates vs section combo patterns vs reference blueprint analysis
- Vertical template scope: financeiro-only vs 3 verticals (financeiro/varejo/servicos)
- SKILL.md design: invocation syntax, parameters, output format
- How much intelligence comes from typed recipes vs Claude's own analysis
- Error handling when briefing is incomplete or ambiguous

### Deferred Ideas (OUT OF SCOPE)
- AI-assisted briefing filling from pre-defined forms (BRFA-01 -- v2)
- Supabase MCP for direct Claude Code DB access (BRFA-02 -- v2)
- Blueprint diff and merge visual (ADVW-01 -- v2)
- Progressive refinement / regenerate individual screens (ADVW-02 -- v2)
- Natural language editing ("aumenta o grafico") (ADVW-05 -- v2)
- UI button that triggers generation from browser (requires API integration -- future)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AIGE-01 | Claude Code pode gerar blueprint a partir de briefing no Supabase + analise de blueprints existentes | CLI script for Supabase read/write, SKILL.md instructions for Claude Code analysis, BlueprintConfig Zod validation pipeline |
| AIGE-02 | Screen recipes tipadas disponveis como contexto para geracao (ex: tela de faturamento, estoque) | Typed ScreenRecipe objects mapping business contexts to section structures, stored as `.ts` module |
| AIGE-03 | Templates de blueprint pre-definidos para verticais FXL (financeiro, varejo, servicos) | VerticalTemplate type as pre-built BlueprintConfig skeletons with placeholder data |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.98.0 | DB access for briefing read and blueprint write | Already in project, has CJS+ESM builds for Node.js CLI use |
| zod | 4.3.6 | Runtime validation of generated BlueprintConfig | Already used for all schema validation in the project |
| tsx | latest | Run TypeScript CLI scripts from terminal | Standard for running .ts scripts in Node.js, no build step needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | latest | Read .env.local in Node.js CLI context | Only if `tsx` doesn't natively handle env file loading |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Node.js CLI script | Supabase REST API via curl | curl approach is simpler but loses Zod validation; script approach keeps type safety |
| tsx runner | ts-node | tsx is faster, zero-config, and supports ESM natively |
| Typed recipe objects | Markdown templates | Typed objects can be Zod-validated and programmatically composed; markdown needs parsing |

**Installation:**
```bash
npm install -D tsx
# dotenv likely unnecessary -- tsx can use --env-file flag or manual parsing
```

Note: `tsx` may already be available via vitest dependency chain. Verify before adding.

## Architecture Patterns

### Recommended Project Structure
```
tools/wireframe-builder/
  lib/
    screen-recipes.ts       # Typed ScreenRecipe objects (AIGE-02)
    vertical-templates.ts   # Pre-built BlueprintConfig skeletons (AIGE-03)
    generation-engine.ts    # Pure function: BriefingConfig -> BlueprintConfig
  scripts/
    generate-blueprint.ts   # Node.js CLI entry point (reads env, calls engine, saves to Supabase)
  SKILL.md                  # Updated with generation invocation instructions
```

### Pattern 1: Node.js CLI Bridge for Supabase Access

**What:** A standalone script that creates its own Supabase client (reading credentials from `.env.local`) instead of importing the Vite-dependent `@/lib/supabase`. The script reads the briefing, calls the pure generation engine, validates with Zod, and saves to Supabase.

**When to use:** Whenever Claude Code needs to interact with Supabase from the terminal.

**Why necessary:** The existing `briefing-store.ts` and `blueprint-store.ts` import from `@/lib/supabase` which uses `import.meta.env` -- a Vite-only API. Node.js scripts cannot use `import.meta.env`. The CLI script creates its own client:

```typescript
// tools/wireframe-builder/scripts/generate-blueprint.ts
import { createClient } from '@supabase/supabase-js'
import { BriefingConfigSchema } from '../lib/briefing-schema'
import { BlueprintConfigSchema } from '../lib/blueprint-schema'
import { generateBlueprint } from '../lib/generation-engine'

// Read from .env.local (or process.env if pre-loaded)
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const clientSlug = process.argv[2]
  const vertical = process.argv[3] as 'financeiro' | 'varejo' | 'servicos' | undefined

  // 1. Load briefing from Supabase
  const { data } = await supabase
    .from('briefing_configs')
    .select('config')
    .eq('client_slug', clientSlug)
    .maybeSingle()

  if (!data) {
    console.error(`No briefing found for client: ${clientSlug}`)
    process.exit(1)
  }

  const briefing = BriefingConfigSchema.parse(data.config)

  // 2. Generate blueprint
  const blueprint = generateBlueprint(briefing, clientSlug, { vertical })

  // 3. Validate with Zod
  const validated = BlueprintConfigSchema.parse(blueprint)

  // 4. Save to Supabase (upsert, no optimistic locking for generation)
  const { error } = await supabase
    .from('blueprint_configs')
    .upsert({
      client_slug: clientSlug,
      config: validated,
      updated_by: 'claude:generation',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_slug' })

  if (error) throw error
  console.log(`Blueprint generated for ${clientSlug}: ${validated.screens.length} screens`)
}

main().catch((e) => { console.error(e); process.exit(1) })
```

**Invocation by Claude Code:**
```bash
npx tsx --env-file .env.local tools/wireframe-builder/scripts/generate-blueprint.ts <client-slug> [vertical]
```

### Pattern 2: Pure Generation Engine (No Side Effects)

**What:** The core generation logic is a pure function that takes a BriefingConfig and returns a BlueprintConfig. No Supabase calls, no file I/O. This makes it testable and composable.

**When to use:** Always. The CLI script handles I/O; the engine handles logic.

```typescript
// tools/wireframe-builder/lib/generation-engine.ts
import type { BriefingConfig } from '../types/briefing'
import type { BlueprintConfig, BlueprintScreen } from '../types/blueprint'
import { SCREEN_RECIPES } from './screen-recipes'
import { VERTICAL_TEMPLATES } from './vertical-templates'

export type GenerationOptions = {
  vertical?: 'financeiro' | 'varejo' | 'servicos'
}

export function generateBlueprint(
  briefing: BriefingConfig,
  clientSlug: string,
  options: GenerationOptions = {}
): BlueprintConfig {
  // Start from vertical template if specified, otherwise build from scratch
  const base = options.vertical
    ? structuredClone(VERTICAL_TEMPLATES[options.vertical])
    : { slug: clientSlug, label: briefing.companyInfo.name, screens: [] }

  // Map briefing modules to screens using recipes
  const screens = briefing.modules.map((mod) => {
    const recipe = findBestRecipe(mod, briefing.companyInfo.segment)
    return buildScreen(mod, recipe, briefing)
  })

  return {
    ...base,
    slug: clientSlug,
    label: briefing.companyInfo.name,
    screens: mergeScreens(base.screens, screens),
  }
}
```

### Pattern 3: Screen Recipes as Typed Objects

**What:** Each recipe describes how to build a screen for a specific business context. Not a full BlueprintScreen, but a template of section types and their arrangements.

**When to use:** For AIGE-02 -- the "typed screen recipes" requirement.

```typescript
// tools/wireframe-builder/lib/screen-recipes.ts
import type { BlueprintSection } from '../types/blueprint'

export type ScreenRecipe = {
  id: string
  name: string                          // 'Faturamento', 'Estoque', 'DRE Gerencial'
  category: 'financeiro' | 'operacional' | 'comercial' | 'geral'
  description: string
  matchKeywords: string[]               // Used to match against briefing modules
  periodType: 'mensal' | 'anual' | 'none'
  hasCompareSwitch: boolean
  suggestedFilters: { key: string; label: string }[]
  sections: RecipeSection[]
}

export type RecipeSection = {
  type: BlueprintSection['type']
  purpose: string                       // What this section shows in this recipe context
  defaults: Partial<BlueprintSection>   // Pre-filled props for this context
}
```

### Pattern 4: Vertical Templates as BlueprintConfig Skeletons

**What:** Complete BlueprintConfig objects for each FXL vertical (financeiro, varejo, servicos) with placeholder/sample data that renders correctly in the wireframe viewer.

**When to use:** For AIGE-03 -- operator selects a template as starting point.

```typescript
// tools/wireframe-builder/lib/vertical-templates.ts
import type { BlueprintConfig } from '../types/blueprint'

export const VERTICAL_TEMPLATES: Record<string, BlueprintConfig> = {
  financeiro: {
    slug: 'template-financeiro',
    label: 'Template Financeiro',
    schemaVersion: 1,
    screens: [
      // Based on financeiro-conta-azul reference (10 screens)
      // DRE, Receita, Despesas, Centro de Custo, Margens,
      // Fluxo Mensal, Fluxo Anual, Indicadores, Upload, Config
    ],
  },
  varejo: { /* ... */ },
  servicos: { /* ... */ },
}
```

### Anti-Patterns to Avoid
- **Running Vite-dependent code in Node.js:** Never import `@/lib/supabase` from CLI scripts. Always create a standalone Supabase client.
- **Generating invalid JSON:** Always Zod-validate before saving. The `BlueprintConfigSchema.parse()` call MUST happen before the Supabase upsert.
- **Hardcoding client data in templates:** Templates use placeholder/sample data. Client-specific data comes from the briefing.
- **Making Claude Code responsible for schema correctness:** The generation engine should handle structural correctness; Claude Code provides business analysis.
- **Duplicating store logic:** The CLI script should only handle the Supabase client creation differently; the actual read/write operations mirror the existing store pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supabase client for Node.js | Custom HTTP wrapper for Supabase REST API | `@supabase/supabase-js` with `createClient()` | Already installed, has CJS/ESM builds, handles auth/RLS automatically |
| BlueprintConfig validation | Manual field checks | `BlueprintConfigSchema.parse()` from `blueprint-schema.ts` | 21 section types with complex discriminated union; Zod schema is the source of truth |
| Screen section defaults | Manual object construction | `getDefaultSection(type)` from `section-registry.tsx` | Registry already provides valid defaults for all 21 types |
| Env var loading in Node.js | Custom `.env.local` parser | `tsx --env-file .env.local` flag or `dotenv` | Handles quoting, multiline, and edge cases |
| Screen ID generation | Manual string concatenation | Pattern: `mod.name` -> kebab-case slug | Consistent with existing screen IDs in financeiro-conta-azul |

**Key insight:** The generation engine should compose screens from existing section types and registry defaults. Every section it produces MUST pass the corresponding Zod schema. The existing 21 section schemas are the hard constraint -- generation cannot invent new section types.

## Common Pitfalls

### Pitfall 1: Vite import.meta.env in Node.js CLI
**What goes wrong:** CLI scripts that import `@/lib/supabase` will fail with `import.meta.env is not defined` because `import.meta.env` is Vite-specific.
**Why it happens:** The existing store files are designed for browser context.
**How to avoid:** Create a standalone Supabase client in the CLI script using `process.env`.
**Warning signs:** "ReferenceError: import.meta.env is not defined" at runtime.

### Pitfall 2: Generated BlueprintConfig fails Zod validation
**What goes wrong:** Generated config has missing required fields, wrong discriminated union values, or incorrect nested structures.
**Why it happens:** The 21 section types have different required fields. `kpi-grid` needs `items[]`, `bar-line-chart` needs `title` + `chartType`, `drill-down-table` needs `columns[]` + `rows[]`, etc.
**How to avoid:** Use `getDefaultSection(type)` as starting point, then overlay recipe-specific data. Always validate with `BlueprintConfigSchema.parse()` before saving.
**Warning signs:** Zod parse errors with path like `screens[2].sections[1].type`.

### Pitfall 3: Screen recipes matching wrong business modules
**What goes wrong:** A "Receita" module gets matched to a generic data table recipe instead of a revenue-specific recipe with KPI grid + donut chart + ranking table.
**Why it happens:** Keyword matching is too simplistic or ambiguous module names.
**How to avoid:** Use a scoring system: match module name, KPIs, and business rules against recipe keywords. Require a minimum confidence score. Fallback to a generic screen recipe rather than a wrong one.
**Warning signs:** Generated screens that don't match the briefing intent.

### Pitfall 4: Overwriting existing blueprints without warning
**What goes wrong:** Running generation on a client that already has a manually-crafted blueprint destroys the existing work.
**Why it happens:** The upsert pattern replaces the entire config.
**How to avoid:** Check if a blueprint already exists before generation. If it does, log a warning and require `--force` flag to proceed. The `loadBlueprint()` check handles this.
**Warning signs:** Operator runs generation twice and loses edits from the first round.

### Pitfall 5: tsx not handling path aliases
**What goes wrong:** `@tools/...` and `@/...` aliases from `tsconfig.json` don't resolve in `tsx` runner.
**Why it happens:** `tsx` doesn't read Vite's resolve config. Path aliases need `tsconfig-paths` or explicit paths.
**How to avoid:** Use relative imports in CLI scripts (`../lib/blueprint-schema` not `@tools/wireframe-builder/lib/blueprint-schema`). Or configure `tsconfig.json` paths and use `tsx --tsconfig tsconfig.json`.
**Warning signs:** "Cannot find module '@tools/...'" at runtime.

### Pitfall 6: Missing schemaVersion in generated config
**What goes wrong:** Generated BlueprintConfig omits `schemaVersion`, causing the migration system to attempt migration on load.
**Why it happens:** Manual JSON construction forgets the field.
**How to avoid:** The Zod schema has `z.number().default(1)` for schemaVersion, but explicit inclusion is safer. Always set `schemaVersion: CURRENT_SCHEMA_VERSION` from `blueprint-migrations.ts`.
**Warning signs:** Console warning about migration on first load of generated blueprint.

## Code Examples

### Verified: Minimal valid BlueprintScreen
```typescript
// Source: blueprint-schema.test.ts (existing test fixture)
const validScreen = {
  id: 'screen-1',
  title: 'Dashboard',
  periodType: 'mensal' as const,
  filters: [{ key: 'month', label: 'Month' }],
  hasCompareSwitch: false,
  sections: [
    {
      type: 'kpi-grid' as const,
      items: [{ label: 'Revenue', value: 'R$ 100k' }],
    },
  ],
}
```

### Verified: Minimal valid BlueprintConfig
```typescript
// Source: blueprint-schema.test.ts (existing test fixture)
const validConfig = {
  slug: 'test-client',
  label: 'Test Client',
  schemaVersion: 1,
  screens: [validScreen],
}
```

### Verified: Section default construction
```typescript
// Source: section-registry.tsx
import { getDefaultSection } from './section-registry'

// Returns a valid section with all required fields filled
const kpiGrid = getDefaultSection('kpi-grid')
// { type: 'kpi-grid', columns: 4, items: [{ label: 'Novo KPI', value: 'R$ 0' }] }

const barChart = getDefaultSection('bar-line-chart')
// { type: 'bar-line-chart', title: 'Novo Grafico', chartType: 'bar' }
```

### Verified: Supabase upsert pattern (force write)
```typescript
// Source: blueprint-store.ts (null lastKnownUpdatedAt path)
const { error } = await supabase
  .from('blueprint_configs')
  .upsert(
    {
      client_slug: clientSlug,
      config: validated,
      updated_by: 'claude:generation',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'client_slug' }
  )
```

### Verified: BriefingConfig structure (generation input)
```typescript
// Source: tools/wireframe-builder/types/briefing.ts
type BriefingConfig = {
  companyInfo: {
    name: string       // 'Empresa XYZ'
    segment: string    // 'Financeiro', 'Varejo', 'Servicos'
    size: string       // 'PME', 'Medio', 'Grande'
    description?: string
  }
  dataSources: {
    system: string     // 'Conta Azul', 'Excel'
    exportType: string // 'CSV', 'XLSX', 'API'
    fields: string[]   // key fields available
  }[]
  modules: {
    name: string       // 'DRE Gerencial', 'Fluxo de Caixa'
    kpis: string[]     // ['Receita Total', 'Margem Bruta']
    businessRules?: string
  }[]
  targetAudience: string
  freeFormNotes: string
}
```

### Reference: financeiro-conta-azul blueprint structure (quality bar)
```
10 screens total:
1. Resultado Mensal (DRE) - kpi-grid + calculo-card + waterfall-chart + drill-down-table
2. Visao por Receita      - kpi-grid + chart-grid(donut+bar) + clickable-table + data-table
3. Visao por Despesas      - kpi-grid + chart-grid(donut+bar) + data-table
4. Visao por Centro Custo  - kpi-grid + chart-grid(bar+donut) + data-table
5. Margens                 - kpi-grid + chart-grid(bar+bar) + data-table
6. Fluxo Mensal            - saldo-banco + kpi-grid + bar-line-chart + clickable-table
7. Fluxo Anual             - manual-input + kpi-grid + chart-grid(bar+line) + clickable-table
8. Indicadores             - kpi-grid + pareto-chart + data-table
9. Upload                  - upload-section + data-table
10. Configuracoes          - config-table (x4)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Blueprint as .ts file | Blueprint as Supabase JSONB | Phase 7 (2026-03-09) | Generation can save directly to DB; no file commit needed |
| Manual blueprint creation | Visual editor (Phase 9) | Phase 9 (2026-03-09) | Post-generation editing is already built |
| Unstructured briefing (markdown only) | Structured BriefingConfig in Supabase | Phase 10 (2026-03-10) | Briefing is machine-readable for generation |
| No schema validation | Zod validation on all read/write | Phase 7 (2026-03-09) | Generated blueprints are guaranteed valid or rejected |

**Deprecated/outdated:**
- `clients/[slug]/wireframe/blueprint.config.ts` -- file-based configs are deprecated; DB is sole source of truth (Phase 7 decision)
- Manual spec generation via `spec-writer.ts` -- still exists but separate from blueprint generation

## Discretion Recommendations

### Screen Recipe Structure: Typed Objects (RECOMMENDED)

Use typed `ScreenRecipe` objects, not markdown templates or reference blueprint analysis.

**Rationale:**
- Typed objects can be Zod-validated and composed programmatically
- Each recipe maps a business context (e.g., "revenue analysis") to a section arrangement
- The `matchKeywords` field enables fuzzy matching against briefing module names
- Recipes are composable: a DRE screen recipe can include sub-recipes for KPI grids and calculo cards
- The financeiro-conta-azul reference provides the quality bar for what good recipes look like

**Recommended recipe count for v1:** 8-10 recipes covering the most common FXL screen patterns:
1. DRE / Resultado (kpi-grid + calculo-card + waterfall + drill-down-table)
2. Revenue Analysis (kpi-grid + chart-grid + clickable-table + data-table)
3. Expense Analysis (kpi-grid + chart-grid + data-table)
4. Cost Center (kpi-grid + chart-grid + data-table)
5. Margins (kpi-grid + chart-grid + data-table)
6. Cash Flow Daily (saldo-banco + kpi-grid + bar-line-chart + clickable-table)
7. Cash Flow Annual (manual-input + kpi-grid + chart-grid + clickable-table)
8. KPI Dashboard (kpi-grid + pareto-chart + data-table)
9. Data Upload (upload-section + data-table)
10. Settings (config-table array)

### Vertical Template Scope: Start with financeiro, scaffold varejo and servicos

**Rationale:**
- financeiro-conta-azul provides a complete, validated reference blueprint
- The financeiro template can be extracted directly from the existing reference data
- varejo and servicos templates can be scaffolded with placeholder screens using the same recipes
- AIGE-03 says "Templates de blueprint pre-definidos para verticais FXL (financeiro, varejo, servicos)" -- all three are expected
- Start financeiro as HIGH quality, varejo/servicos as MEDIUM quality (basic structure, fewer screens)

### SKILL.md Design: Single-command invocation

**Recommended invocation:**
```
Claude Code, generate a blueprint for client [slug] using the financeiro template.
```

The SKILL.md should document:
1. Pre-requisites (briefing must exist in Supabase)
2. Command: `npx tsx --env-file .env.local tools/wireframe-builder/scripts/generate-blueprint.ts <slug> [vertical]`
3. Post-generation verification: load the wireframe viewer URL to confirm rendering
4. Common customization patterns for post-generation editing

### Intelligence Balance: 70% recipes, 30% Claude analysis

The generation engine should do the heavy lifting (mapping modules to recipes, composing sections), but Claude Code provides the business analysis layer:
- Which modules in the briefing map to which recipe categories
- What KPI labels and section titles should be (from briefing data)
- Whether additional screens are needed beyond what recipes suggest
- How to handle ambiguous or incomplete briefing data

## Open Questions

1. **tsx --env-file support**
   - What we know: Node.js 20.6+ supports `--env-file` natively; tsx passes flags through to Node
   - What's unclear: Whether the project's Node version supports this flag
   - Recommendation: Test with `npx tsx --env-file .env.local` first; fall back to `dotenv` if needed

2. **Path alias resolution in tsx**
   - What we know: Vite aliases (`@/`, `@tools/`) are defined in `vite.config.ts` and `vitest.config.ts` but not in `tsconfig.json` paths
   - What's unclear: Whether the tsconfig already has path mappings that tsx can use
   - Recommendation: Use relative imports in CLI scripts to avoid alias issues entirely

3. **Existing blueprint overwrite protection**
   - What we know: The generation uses upsert (replaces existing)
   - What's unclear: Whether the user wants protection or prefers "generate and overwrite"
   - Recommendation: Implement `--force` flag; warn if blueprint exists, require `--force` to overwrite

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AIGE-01 | Generation engine produces valid BlueprintConfig from BriefingConfig | unit | `npx vitest run tools/wireframe-builder/lib/generation-engine.test.ts -x` | No -- Wave 0 |
| AIGE-01 | Generated config passes Zod validation | unit | `npx vitest run tools/wireframe-builder/lib/generation-engine.test.ts -x` | No -- Wave 0 |
| AIGE-01 | CLI script reads briefing from Supabase and saves blueprint | integration | Manual -- requires Supabase connection | No -- manual test |
| AIGE-02 | Screen recipes map business contexts to section structures | unit | `npx vitest run tools/wireframe-builder/lib/screen-recipes.test.ts -x` | No -- Wave 0 |
| AIGE-02 | Each recipe produces valid sections (Zod) | unit | `npx vitest run tools/wireframe-builder/lib/screen-recipes.test.ts -x` | No -- Wave 0 |
| AIGE-03 | Vertical templates are valid BlueprintConfigs | unit | `npx vitest run tools/wireframe-builder/lib/vertical-templates.test.ts -x` | No -- Wave 0 |
| AIGE-03 | Vertical templates render without errors in viewer | smoke | Manual -- open wireframe viewer | No -- manual test |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + `npx tsc --noEmit` before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tools/wireframe-builder/lib/generation-engine.test.ts` -- covers AIGE-01 (pure function tests)
- [ ] `tools/wireframe-builder/lib/screen-recipes.test.ts` -- covers AIGE-02 (recipe validity + Zod)
- [ ] `tools/wireframe-builder/lib/vertical-templates.test.ts` -- covers AIGE-03 (template validity)

## Sources

### Primary (HIGH confidence)
- `tools/wireframe-builder/types/blueprint.ts` -- all 21 section types, BlueprintConfig, BlueprintScreen definitions
- `tools/wireframe-builder/types/briefing.ts` -- BriefingConfig, DataSource, BriefingModule definitions
- `tools/wireframe-builder/lib/blueprint-schema.ts` -- Zod schemas for all 21 section types + BlueprintConfigSchema
- `tools/wireframe-builder/lib/briefing-schema.ts` -- Zod schemas for BriefingConfig
- `tools/wireframe-builder/lib/blueprint-store.ts` -- loadBlueprint(), saveBlueprint() with optimistic locking
- `tools/wireframe-builder/lib/briefing-store.ts` -- loadBriefing(), saveBriefing()
- `tools/wireframe-builder/lib/section-registry.tsx` -- SECTION_REGISTRY with all 21 types, getDefaultSection()
- `tools/wireframe-builder/lib/blueprint-text.ts` -- extractBlueprintSummary() for post-generation verification
- `tools/wireframe-builder/lib/blueprint-export.ts` -- exportBlueprintMarkdown() for readable output
- `tools/wireframe-builder/SKILL.md` -- existing skill patterns and wireframe quality standards
- `clients/financeiro-conta-azul/docs/briefing.md` -- reference briefing quality bar
- `clients/financeiro-conta-azul/docs/blueprint.md` -- reference blueprint quality bar (10 screens)
- `src/lib/supabase.ts` -- Vite-specific Supabase client (NOT usable in Node CLI)
- `vitest.config.ts` -- test configuration with path aliases

### Secondary (MEDIUM confidence)
- `package.json` -- confirms @supabase/supabase-js 2.98.0, zod 4.3.6, vitest 4.0.18
- `node_modules/@supabase/supabase-js/dist/` -- verified CJS+ESM builds exist for Node.js use
- `.env.local.example` -- confirms env var naming: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY

### Tertiary (LOW confidence)
- tsx --env-file flag compatibility: assumed based on Node.js 20.6+ support, needs runtime verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project, verified builds
- Architecture: HIGH -- based on deep analysis of existing codebase patterns and constraints
- Pitfalls: HIGH -- identified from actual code analysis (import.meta.env, Zod schemas, alias resolution)
- Screen recipes: MEDIUM -- design recommendation based on analysis of financeiro-conta-azul reference; actual recipe effectiveness depends on implementation
- Vertical templates: MEDIUM -- financeiro template can be extracted from reference; varejo/servicos are new and need domain knowledge

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable domain, internal tooling)
