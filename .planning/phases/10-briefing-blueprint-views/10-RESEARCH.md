# Phase 10: Briefing & Blueprint Views - Research

**Researched:** 2026-03-10
**Domain:** Supabase CRUD forms, blueprint data transformation, file download, share token UI
**Confidence:** HIGH

## Summary

Phase 10 covers four discrete features: (1) a structured briefing form persisted in Supabase, (2) a read-only blueprint text view, (3) a Markdown export of that blueprint, and (4) restoring the share link button with a management modal. All four features are primarily frontend work with a single new Supabase table (migration 004) being the only backend change.

The codebase already has every building block needed. The Supabase pattern is well-established (blueprint_configs migration 003 is the exact template for briefing_configs). The tokens.ts CRUD is complete and tested. The section-registry.tsx provides the metadata (labels, types) needed to generate the blueprint text view. shadcn Dialog, Input, Button, Switch, Textarea, Badge, Card, and ScrollArea are already installed.

**Primary recommendation:** Follow the existing blueprint_configs pattern exactly for the new briefing_configs table. Build the briefing form as a standalone page route, the blueprint text view as a tab or route alongside the wireframe, and the share modal as a Dialog in AdminToolbar. Use the SECTION_REGISTRY labels for human-readable section type names in the text view.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Briefing form: Hybrid format -- structured sections for essentials + free-form markdown field for additional context
- Structured sections: company info (name, segment, size), data sources (system, export type, fields), modules/KPIs (module name, KPI list, business rules), target audience
- Free-form field: markdown textarea for anything that doesn't fit the structured sections
- Persisted as JSON in Supabase (new table `briefing_configs`, same pattern as `blueprint_configs`)
- Client slug as unique key, JSONB config column
- Blueprint text view: Hierarchical outline -- Tree structure Screen > Section > Properties
- Collapsible per screen (default: all expanded)
- Each section shows: type badge, title, key fields (e.g., KPI names for kpi-grid, column headers for data-table, chart type for charts)
- Read-only -- no editing from this view
- Lives as a tab or route alongside the wireframe visual view
- Blueprint Markdown export: Button in blueprint text view that generates a .md file download
- Markdown format readable by Claude Code for generation context
- Includes: client name, screen list with section details, property summaries
- Same hierarchical structure as text view but as downloadable markdown
- Share link UX: Button in AdminToolbar alongside Save/Theme toggle
- Opens modal with: copyable link, list of active tokens with expiration dates, revoke button per token
- Creates 30-day token on "Generate new link" click
- Uses existing tokens.ts system (createShareToken, getTokensForClient, revokeToken)
- Toast feedback on copy/create/revoke actions

### Claude's Discretion
- Exact briefing form field types and validation rules
- Blueprint text view styling and layout details
- Markdown export template structure
- Share modal visual design
- Whether blueprint text view is a separate route or a tab/mode within existing page
- Briefing form field ordering and grouping
- Error states and loading patterns
- Navigation between briefing form and other client views

### Deferred Ideas (OUT OF SCOPE)
- Briefing generation from pre-defined templates (Phase 11 -- AIGE-03)
- AI-assisted briefing filling (future)
- Blueprint diff/compare between versions (v2 -- ADVW-01)
- Real-time collaborative briefing editing (v2 -- ADVW-03)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BRFG-01 | Operador pode inserir briefing de cliente via formulario estruturado persistido no Supabase | Supabase table pattern (migration 004), briefing-store.ts CRUD, BriefingForm component with structured sections + markdown field |
| BRFG-02 | Operador pode visualizar blueprint como texto estruturado/explicativo (view read-only) | SECTION_REGISTRY labels + section type metadata, hierarchical rendering of BlueprintConfig screens/sections |
| BRFG-03 | Blueprint exportavel como Markdown para acesso do Claude Code | Browser Blob/URL.createObjectURL download, markdown template from same data as text view |
| BRFG-04 | Operador pode gerar share link para cliente (botao restaurado) | Existing tokens.ts CRUD (createShareToken, getTokensForClient, revokeToken), shadcn Dialog for modal |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.x | Briefing persistence, token CRUD | Already used for blueprint_configs and share_tokens |
| React 18 | 18.3.x | UI components | Project standard |
| TypeScript 5 | strict | Type safety | Project standard, `any` forbidden |
| Tailwind CSS 3 | 3.x | Styling | Project standard |
| shadcn/ui | latest | Dialog, Input, Button, Badge, Card, Textarea | Already installed components |
| sonner | 2.x | Toast notifications | Already used throughout |
| lucide-react | 0.460 | Icons | Already used throughout |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.3.6 | Briefing config schema validation | Validate before Supabase write, same pattern as blueprint-schema.ts |
| react-router-dom | 6.27 | Route params for client slug, navigation | New routes for briefing form and blueprint text view |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom file download | file-saver library | Not needed -- Blob + URL.createObjectURL is 5 lines of code, no new dependency |
| React Hook Form | Manual state | Briefing form has ~15 fields total across 4 sections -- simple enough for useState, no form library needed |
| Markdown renderer for preview | react-markdown | Already available if needed, but text view is custom JSX, not markdown rendering |

**Installation:**
No new dependencies needed. Everything is already in the project.

## Architecture Patterns

### Recommended Project Structure
```
tools/wireframe-builder/
  lib/
    briefing-store.ts          # CRUD for briefing_configs (mirrors blueprint-store.ts)
    briefing-schema.ts         # Zod schema for BriefingConfig
    blueprint-text.ts          # Pure function: BlueprintConfig -> structured text data
    blueprint-export.ts        # Pure function: BlueprintConfig -> markdown string
  types/
    briefing.ts                # BriefingConfig TypeScript type
  components/
    editor/
      ShareModal.tsx           # Share link management modal
src/
  pages/
    clients/
      BriefingForm.tsx         # Structured briefing input form
      BlueprintTextView.tsx    # Read-only blueprint text view + export button
supabase/
  migrations/
    004_briefing_configs.sql   # New table migration
```

### Pattern 1: Supabase Table Pattern (briefing_configs)
**What:** Exact clone of blueprint_configs table structure
**When to use:** For the new briefing_configs table
**Example:**
```sql
-- Source: supabase/migrations/003_blueprint_configs.sql (existing pattern)
CREATE TABLE public.briefing_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug text NOT NULL UNIQUE,
  config jsonb NOT NULL,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.briefing_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_briefing_configs"
  ON briefing_configs FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_briefing_configs"
  ON briefing_configs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_briefing_configs"
  ON briefing_configs FOR UPDATE TO anon USING (true);

CREATE INDEX idx_briefing_configs_client_slug ON briefing_configs(client_slug);
```

### Pattern 2: Store Module Pattern (briefing-store.ts)
**What:** CRUD module matching blueprint-store.ts structure
**When to use:** For loading/saving briefing configs
**Example:**
```typescript
// Source: tools/wireframe-builder/lib/blueprint-store.ts (existing pattern)
import { supabase } from '@/lib/supabase'
import type { BriefingConfig } from '../types/briefing'
import { BriefingConfigSchema } from './briefing-schema'

export async function loadBriefing(
  clientSlug: string
): Promise<BriefingConfig | null> {
  const { data, error } = await supabase
    .from('briefing_configs')
    .select('config')
    .eq('client_slug', clientSlug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const result = BriefingConfigSchema.safeParse(data.config)
  if (!result.success) return null
  return result.data as BriefingConfig
}

export async function saveBriefing(
  clientSlug: string,
  config: BriefingConfig,
  updatedBy: string,
): Promise<void> {
  const validated = BriefingConfigSchema.parse(config)
  const { error } = await supabase
    .from('briefing_configs')
    .upsert(
      {
        client_slug: clientSlug,
        config: validated,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_slug' }
    )
  if (error) throw error
}
```

### Pattern 3: BriefingConfig Type Structure
**What:** TypeScript type for the briefing JSON stored in Supabase
**When to use:** Defines the shape of the briefing form data
**Example:**
```typescript
export type BriefingConfig = {
  companyInfo: {
    name: string
    segment: string
    size: string       // e.g., 'PME', 'Medio', 'Grande'
    description?: string
  }
  dataSources: {
    system: string      // e.g., 'Conta Azul', 'Excel'
    exportType: string  // e.g., 'CSV', 'XLSX', 'API'
    fields: string[]    // key fields available
  }[]
  modules: {
    name: string        // e.g., 'DRE Gerencial', 'Fluxo de Caixa'
    kpis: string[]      // e.g., ['Receita Total', 'Margem Bruta']
    businessRules?: string
  }[]
  targetAudience: string
  freeFormNotes: string  // markdown field for additional context
}
```

### Pattern 4: Blueprint Text View Data Extraction
**What:** Pure function that extracts display data from BlueprintConfig using SECTION_REGISTRY
**When to use:** For both the text view component and the markdown export
**Example:**
```typescript
// Source: tools/wireframe-builder/lib/section-registry.tsx (SECTION_REGISTRY has labels)
import { SECTION_REGISTRY } from './section-registry'
import type { BlueprintConfig, BlueprintSection } from '../types/blueprint'

type SectionSummary = {
  type: BlueprintSection['type']
  label: string          // from SECTION_REGISTRY
  title?: string         // section.title if exists
  keyFields: string[]    // extracted per section type
}

function extractKeyFields(section: BlueprintSection): string[] {
  switch (section.type) {
    case 'kpi-grid':
      return section.items.map(item => item.label)
    case 'bar-line-chart':
      return [`Tipo: ${section.chartType}`, section.title]
    case 'data-table':
      return section.columns.map(col => col.label)
    case 'donut-chart':
      return [section.title]
    // ... etc for each section type
    default:
      return []
  }
}
```

### Pattern 5: Browser File Download
**What:** Client-side file download using Blob + URL.createObjectURL
**When to use:** For the Markdown export button
**Example:**
```typescript
function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

### Pattern 6: AdminToolbar Extension for Share Button
**What:** Adding a new button + callback to AdminToolbar props
**When to use:** For BRFG-04 share link button
**Example:**
```typescript
// Extend AdminToolbar Props:
type Props = {
  // ...existing props
  onOpenShare: () => void  // new
}

// In WireframeViewer, add ShareModal state management alongside existing modals
```

### Anti-Patterns to Avoid
- **Building the briefing form inside the wireframe viewer:** The briefing form is a separate page within the Layout, not part of the wireframe chrome.
- **Storing briefing as .md file:** CONTEXT.md explicitly says "Persisted as JSON in Supabase" -- do not create client-side markdown files.
- **Using blueprint_configs table for briefings:** These are separate tables with separate schemas. Keep them independent.
- **Editing blueprint from text view:** It is explicitly read-only. Do not add edit capabilities.
- **Complex state management for share modal:** The modal is simple -- no need for context or stores. Local state in the modal component is sufficient.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token CRUD | New token API functions | Existing `tokens.ts` (createShareToken, getTokensForClient, revokeToken) | Already tested, production-proven |
| Section type labels | Manual type-to-label mapping | `SECTION_REGISTRY[type].label` and `SECTION_REGISTRY[type].catalogEntry` | 21 types already registered with labels, icons, categories |
| Clipboard API | Custom clipboard function | `navigator.clipboard.writeText()` | Standard browser API, fallback not needed for operator tool |
| Form validation | Manual validation logic | Zod schema `.safeParse()` | Consistent with blueprint-schema.ts pattern |
| Toast notifications | Custom notification system | `toast.success()` / `toast.error()` from sonner | Already used throughout the app |

**Key insight:** Every infrastructure piece (Supabase patterns, token CRUD, section metadata, UI components) already exists. This phase is pure assembly -- connecting existing pieces into new views.

## Common Pitfalls

### Pitfall 1: Share Token RLS After Clerk Migration
**What goes wrong:** share_tokens RLS was migrated to anon policies in 002_clerk_migration.sql. The original 001 migration had `authenticated` policies with `auth.jwt()` checks.
**Why it happens:** Developer looks at 001_comments_schema.sql and sees `authenticated` policies, not realizing they were replaced.
**How to avoid:** The current live policies are the anon ones from migration 002. tokens.ts already works correctly with the anon Supabase client. No changes needed to token infrastructure.
**Warning signs:** Getting "RLS policy violation" errors when creating/reading tokens.

### Pitfall 2: Briefing Store Without Optimistic Locking
**What goes wrong:** The briefing form uses simple upsert without the optimistic locking that blueprint-store.ts has.
**Why it happens:** Developer copies the full complexity of blueprint-store.ts including conflict detection.
**How to avoid:** Briefing is edited by a single operator at a time. Simple upsert with `onConflict: 'client_slug'` is sufficient. No polling, no conflict modal needed. Briefing is not a concurrent editing scenario (unlike the wireframe editor).
**Warning signs:** Over-engineering the briefing store with lastKnownUpdatedAt tracking.

### Pitfall 3: Route Organization Confusion
**What goes wrong:** New routes placed inside the Layout `<Route element={...}>` for views that should be full-screen, or vice versa.
**Why it happens:** The app has two distinct route trees -- inside Layout (briefing form) and outside Layout (wireframe viewer where share button lives).
**How to avoid:** Briefing form and blueprint text view go INSIDE the Layout (they are operator tools with sidebar). Share modal lives in AdminToolbar which is already in the wireframe viewer (outside Layout). Keep them in their correct trees.
**Warning signs:** Briefing form rendering without sidebar, or blueprint text view rendering inside wireframe chrome.

### Pitfall 4: Not Using useParams for Client Slug
**What goes wrong:** Hardcoding client slug or passing it via props through multiple layers.
**Why it happens:** Existing FinanceiroIndex page has hardcoded slugs.
**How to avoid:** Use parametric routes (`/clients/:clientSlug/briefing`, `/clients/:clientSlug/blueprint`) matching the pattern from Phase 9's WireframeViewer.
**Warning signs:** Multiple client-specific page components instead of one parametric component.

### Pitfall 5: Blueprint Markdown Export Missing Section Types
**What goes wrong:** The export function doesn't handle all 21 section types, producing incomplete or `[unknown type]` entries.
**Why it happens:** Developer handles a few common types and misses edge cases.
**How to avoid:** Use SECTION_REGISTRY as the source of truth. Iterate `Object.keys(SECTION_REGISTRY)` to ensure every type has extraction logic. Use a fallback that at minimum outputs the type label.
**Warning signs:** Markdown export has blank sections or "[TODO]" markers for certain section types.

### Pitfall 6: Clerk User ID for Share Token created_by
**What goes wrong:** Passing wrong user identifier to createShareToken.
**Why it happens:** Clerk user IDs are strings like 'user_xxx', and the column is `text` after migration 002.
**How to avoid:** Use `user.id` from `useUser()` hook (Clerk). This is already the pattern in WireframeViewer for saveBlueprint.
**Warning signs:** `created_by` column has `null` or wrong format values.

## Code Examples

Verified patterns from the existing codebase:

### Loading Data from Supabase (established pattern)
```typescript
// Source: tools/wireframe-builder/lib/blueprint-store.ts lines 25-72
const { data, error } = await supabase
  .from('briefing_configs')
  .select('config')
  .eq('client_slug', clientSlug)
  .maybeSingle()

if (error) throw error
if (!data) return null
```

### Using Existing Token Functions
```typescript
// Source: tools/wireframe-builder/lib/tokens.ts lines 19-63
import { createShareToken, getTokensForClient, revokeToken } from '@tools/wireframe-builder/lib/tokens'

// Create new token
const token = await createShareToken(clientSlug, user.id, 30)

// List active tokens
const tokens = await getTokensForClient(clientSlug)

// Revoke a token
await revokeToken(tokenId)
```

### Getting Section Labels from Registry
```typescript
// Source: tools/wireframe-builder/lib/section-registry.tsx lines 553-581
import { SECTION_REGISTRY, getSectionLabel } from '@tools/wireframe-builder/lib/section-registry'

// Get human-readable label for any section type
const label = getSectionLabel('kpi-grid')  // "KPI Grid"
const entry = SECTION_REGISTRY['bar-line-chart'].catalogEntry
// entry.label = "Grafico", entry.category = "Graficos"
```

### AdminToolbar Button Pattern
```typescript
// Source: tools/wireframe-builder/components/editor/AdminToolbar.tsx lines 42-51
<button
  type="button"
  onClick={onOpenShare}
  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
  style={{ color: 'var(--wf-muted)' }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = 'var(--wf-heading)'
    e.currentTarget.style.background = 'var(--wf-accent-muted)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = 'var(--wf-muted)'
    e.currentTarget.style.background = 'transparent'
  }}
>
  <Share2 className="h-3.5 w-3.5" />
  Compartilhar
</button>
```

### Toast Pattern
```typescript
// Source: src/pages/clients/WireframeViewer.tsx lines 336-338
import { toast } from 'sonner'

toast.success('Link copiado!')
toast.error('Erro ao gerar link', { description: error.message })
```

### Parametric Route Pattern
```typescript
// Source: src/App.tsx line 60-62, src/pages/clients/WireframeViewer.tsx lines 47-54
// Route definition:
<Route path="/clients/:clientSlug/briefing" element={<ProtectedRoute><BriefingForm /></ProtectedRoute>} />

// Inside component:
const { clientSlug } = useParams<{ clientSlug: string }>()
if (!clientSlug) return <Navigate to="/" replace />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-specific hardcoded pages | Parametric :clientSlug routes | Phase 9 (09-04) | New views must use parametric routes |
| blueprint.config.ts file | Supabase blueprint_configs table | Phase 7 (07-02) | Briefing follows same DB-first pattern |
| Supabase Auth policies | Anon RLS policies (Clerk external auth) | Migration 002 | All new tables use anon policies |
| Per-section switch statements | SECTION_REGISTRY pattern | Phase 9 (09-01) | Use registry for section metadata |

**Deprecated/outdated:**
- `clients/[slug]/wireframe/blueprint.config.ts`: Deleted in Phase 7. DB is sole source of truth.
- `authenticated` RLS policies: Replaced by `anon` policies in migration 002.
- Hardcoded FinanceiroWireframe page: Superseded by parametric WireframeViewer in Phase 9.

## Open Questions

1. **Route placement for briefing form and blueprint text view**
   - What we know: Both are operator tools that should be inside the Layout (with sidebar navigation). Routes like `/clients/:clientSlug/briefing` and `/clients/:clientSlug/blueprint` are natural.
   - What's unclear: Whether blueprint text view should be a standalone route OR a tab/mode within a combined view that also has a "visual wireframe" button.
   - Recommendation: Separate routes (`/briefing` and `/blueprint`) are simpler and match the existing docs table in FinanceiroIndex. Link from client index page.

2. **Existing briefing.md content migration**
   - What we know: `clients/financeiro-conta-azul/docs/briefing.md` exists with rich structured content. The new form stores JSON in Supabase.
   - What's unclear: Whether to pre-populate the Supabase briefing from the existing .md content.
   - Recommendation: Start with empty form. The existing .md file remains as reference documentation. The Supabase briefing is the "machine-readable" version. No migration of .md content to JSON needed for v1.

3. **Blueprint text view data source**
   - What we know: BlueprintConfig is loaded from Supabase via loadBlueprint(). The text view needs the same data.
   - What's unclear: Whether to re-fetch or share state with the wireframe viewer.
   - Recommendation: Blueprint text view is a separate route, so it fetches independently via loadBlueprint(). No shared state needed. This is simpler and avoids coupling.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.0.18 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose && npx tsc --noEmit` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRFG-01 | Briefing CRUD (load/save) | unit | `npx vitest run tools/wireframe-builder/lib/briefing-store.test.ts -x` | Wave 0 |
| BRFG-01 | Briefing Zod schema validation | unit | `npx vitest run tools/wireframe-builder/lib/briefing-schema.test.ts -x` | Wave 0 |
| BRFG-02 | Blueprint text extraction from config | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-text.test.ts -x` | Wave 0 |
| BRFG-03 | Blueprint markdown export generation | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-export.test.ts -x` | Wave 0 |
| BRFG-04 | Share modal uses existing tokens.ts | unit | Already covered by existing token tests | Existing |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose && npx tsc --noEmit`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tools/wireframe-builder/lib/briefing-store.test.ts` -- covers BRFG-01 (mirrors blueprint-store.test.ts pattern)
- [ ] `tools/wireframe-builder/lib/briefing-schema.test.ts` -- covers BRFG-01 (Zod validation)
- [ ] `tools/wireframe-builder/lib/blueprint-text.test.ts` -- covers BRFG-02 (section extraction logic)
- [ ] `tools/wireframe-builder/lib/blueprint-export.test.ts` -- covers BRFG-03 (markdown generation)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `supabase/migrations/003_blueprint_configs.sql` -- exact table pattern
- Existing codebase: `tools/wireframe-builder/lib/blueprint-store.ts` -- store CRUD pattern
- Existing codebase: `tools/wireframe-builder/lib/tokens.ts` -- complete share token CRUD
- Existing codebase: `tools/wireframe-builder/lib/section-registry.tsx` -- all 21 section types with labels
- Existing codebase: `tools/wireframe-builder/types/blueprint.ts` -- BlueprintConfig, BlueprintSection union
- Existing codebase: `src/pages/clients/WireframeViewer.tsx` -- AdminToolbar integration pattern
- Existing codebase: `src/App.tsx` -- current route structure
- Existing codebase: `supabase/migrations/002_clerk_migration.sql` -- anon RLS policy pattern

### Secondary (MEDIUM confidence)
- Blueprint text view section extraction: Derived from SECTION_REGISTRY metadata (all types documented in registry)
- Route organization: Follows parametric pattern established in Phase 9 (09-04)

### Tertiary (LOW confidence)
- None. All findings verified against existing codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - everything already in the project, zero new dependencies
- Architecture: HIGH - all patterns directly mirrored from existing codebase (blueprint-store, migrations, registry)
- Pitfalls: HIGH - identified from actual migration history and existing code patterns

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable -- no external dependencies changing)
