# Phase 3: Wireframe Visual Editor - Research

**Researched:** 2026-03-08
**Domain:** Visual editor (Elementor-style) for blueprint-driven wireframes, with Supabase persistence and drag-and-drop
**Confidence:** HIGH

## Summary

Phase 3 transforms the wireframe viewer from a read-only renderer into an Elementor-style visual editor. The existing architecture is strongly favorable: `BlueprintConfig` is already a declarative JSON-serializable structure (15 section types as a discriminated union), `SectionWrapper` already wraps each section with controls (comments), and the viewer is already full-screen outside the Layout shell. The primary work domains are: (1) Supabase persistence layer for blueprint configs, (2) edit mode state management with toolbar UI, (3) section manipulation (add/remove/reorder with dnd-kit), (4) property panel forms for each section type, and (5) screen management in the sidebar.

The blueprint.config.ts for `financeiro-conta-azul` is ~54KB / 1158 lines with 8+ screens. As a JSON payload in Supabase jsonb, this is well within PostgreSQL's limits. The existing Supabase + Clerk patterns (anon RLS policies, `make migrate` workflow) provide a clear template for the new table.

**Primary recommendation:** Use `@dnd-kit/core` + `@dnd-kit/sortable` (stable v6/v10) for drag-and-drop, shadcn/ui Sheet for the property panel, and a single `blueprint_configs` Supabase table with jsonb column for the full BlueprintConfig per client slug.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Blueprint configs stored in Supabase as the source of truth for the editor
- Existing blueprint.config.ts files serve as seed/fallback -- on first editor open for a client, if no Supabase config exists, the system auto-imports from the TypeScript file
- After import, all edits happen in Supabase; the .ts file stays in the repo for dev/testing/initial state
- SharedWireframeView (client link) also loads from Supabase -- both operator and client always see the same version
- No version history in v1 -- only current state with `updated_at` and `updated_by` metadata
- Supabase table stores the full BlueprintConfig JSON per client slug
- "Editar" button in the admin toolbar toggles edit mode on/off
- When active: sections show dashed borders, add/remove/drag controls become visible
- Click on a component in edit mode opens a right-side property panel with a form specific to that section type
- "Salvar" button in toolbar persists current state to Supabase (only visible in edit mode)
- Exit edit mode without saving discards unsaved changes (with confirmation if changes exist)
- Screens are composed of rows, each row has a configurable grid layout
- Pre-defined grid layouts per row: 1 column, 2 columns (50/50), 3 columns (33/33/33), 2:1 ratio (66/33), 1:2 ratio (33/66)
- "+" button appears between rows and at the bottom of the screen in edit mode
- Component picker showing all 15 section types grouped by category
- New components added with sensible default props
- Drag handles on each section for reordering within the screen
- Trash icon on hover in edit mode with brief confirmation before removal
- Fixed toolbar at the top of the wireframe viewer with "Editar" toggle, "Comentarios" button, "Salvar" button, current screen name
- Only visible to authenticated operators (Clerk auth)
- Clients with share tokens see wireframe in read-only mode
- Screen management controls in the wireframe sidebar, visible in edit mode
- New screen: modal asking for title, icon (lucide icon picker), period type
- Delete screen: confirmation dialog showing section count

### Claude's Discretion
- Supabase table schema design (columns, indexes, RLS policies)
- Exact property panel form design for each section type
- Component picker UI/layout (modal, dropdown, or side panel)
- Grid layout picker visual design
- Drag-and-drop library choice and implementation
- Edit mode visual indicators (border styles, colors, animations)
- Default props for newly added components
- Toolbar styling and responsive behavior
- Error handling (save failures, concurrent edits)
- Loading states during Supabase reads/writes

### Deferred Ideas (OUT OF SCOPE)
- Version history / undo for blueprint configs
- Collaborative real-time editing (multiple operators)
- Template screens (pre-built screen templates to start from)
- Duplicate screen functionality
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WEDT-01 | Operador edita layout de secoes dentro de uma tela (mover, adicionar, remover) | dnd-kit for reordering, grid layout system, "+" button with component picker, trash icon with confirmation |
| WEDT-02 | Operador edita props de componentes via UI (titulo, tipo de grafico, colunas de tabela) | Right-side property panel (Sheet) with per-section-type forms, discriminated union dispatch |
| WEDT-03 | Operador adiciona e remove telas do wireframe via UI | Screen management controls in WireframeSidebar, modal for new screen, confirmation for delete |
| WEDT-04 | Todas as edicoes visuais sincronizam automaticamente com blueprint.config.ts | Supabase jsonb persistence, seed import from .ts file, "Salvar" button persists to Supabase |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | 6.3.1 | Drag-and-drop primitives (DndContext, sensors, collision detection) | Stable, 790K+ weekly npm downloads, supports grids + lists, accessibility built-in |
| @dnd-kit/sortable | 10.0.0 | Sortable list preset (SortableContext, useSortable, arrayMove) | Official sortable preset for dnd-kit, stable production release |
| @dnd-kit/utilities | latest | CSS transform helpers | Required companion for transform/transition styles |
| @supabase/supabase-js | 2.x (already installed) | Database persistence for blueprint configs | Already in stack, used for comments/tokens |
| @radix-ui/react-dialog | (already installed) | Confirmation dialogs, component picker modal | Already in stack via shadcn/ui |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Sheet | (uses @radix-ui/react-dialog) | Property panel slide-out from right side | Install via `npx shadcn-ui@latest add sheet` -- for section property editing |
| shadcn/ui Tabs | (radix) | Tab navigation within property panel forms | Install if needed for complex section type forms |
| shadcn/ui Select | (radix) | Dropdown selects in property forms (chart type, period type) | Install via `npx shadcn-ui@latest add select` |
| shadcn/ui Input | (radix) | Text inputs in property forms | Install via `npx shadcn-ui@latest add input` |
| shadcn/ui Label | (radix) | Form labels in property panel | Install via `npx shadcn-ui@latest add label` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/core + @dnd-kit/sortable | @hello-pangea/dnd | hello-pangea is simpler for lists but does NOT support grid layouts -- critical limitation for this phase |
| @dnd-kit/core + @dnd-kit/sortable | @dnd-kit/react (v0.3.2) | New API, still in beta (v0.3), not production-ready; legacy packages are stable |
| shadcn/ui Sheet | Custom slide panel | Sheet is standard Radix-based, accessible, animation built-in |
| Single jsonb column | Separate relational tables per entity | jsonb is simpler for this use case; the full config is <100KB and always read/written as a unit |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npx shadcn-ui@latest add sheet select input label popover
```

## Architecture Patterns

### Recommended Project Structure
```
tools/wireframe-builder/
  components/
    editor/                    # NEW -- all edit mode components
      AdminToolbar.tsx          # Fixed toolbar (Editar, Comentarios, Salvar)
      EditableSectionWrapper.tsx # Wraps sections with edit controls (drag, delete, click-to-edit)
      ComponentPicker.tsx       # Modal/panel showing 15 section types by category
      GridLayoutPicker.tsx      # Row grid layout selector (1col, 2col, 3col, 2:1, 1:2)
      PropertyPanel.tsx         # Right-side Sheet container
      property-forms/           # Per-section-type property forms
        KpiGridForm.tsx
        BarLineChartForm.tsx
        DonutChartForm.tsx
        WaterfallChartForm.tsx
        ParetoChartForm.tsx
        CalculoCardForm.tsx
        DataTableForm.tsx
        DrillDownTableForm.tsx
        ClickableTableForm.tsx
        SaldoBancoForm.tsx
        ManualInputForm.tsx
        UploadSectionForm.tsx
        ConfigTableForm.tsx
        InfoBlockForm.tsx
        ChartGridForm.tsx
      ScreenManager.tsx         # Screen add/delete/reorder controls for sidebar
      IconPicker.tsx            # Lucide icon picker for new screen modal
      AddSectionButton.tsx      # "+" button between rows
    BlueprintRenderer.tsx       # MODIFY -- accept editMode prop, grid rows
    SectionWrapper.tsx          # MODIFY -- extend with edit controls
    WireframeSidebar.tsx        # MODIFY -- not used in viewer currently (inline sidebar), but can be adapted
  lib/
    blueprint-store.ts          # NEW -- Supabase CRUD for blueprint configs
    defaults.ts                 # NEW -- default props for each section type
    grid-layouts.ts             # NEW -- grid layout type definitions
  types/
    blueprint.ts                # MODIFY -- add grid row wrapper, optional IDs
    editor.ts                   # NEW -- edit mode types (GridLayout, RowConfig)

src/pages/
  clients/FinanceiroContaAzul/
    WireframeViewer.tsx         # MODIFY -- add toolbar, edit mode state, Supabase data source
  SharedWireframeView.tsx       # MODIFY -- switch to Supabase data source

supabase/migrations/
  003_blueprint_configs.sql     # NEW -- blueprint_configs table
```

### Pattern 1: Edit Mode State Management
**What:** A React context that provides edit mode state to the entire wireframe viewer tree
**When to use:** Whenever any component needs to know whether edit mode is active

```typescript
// tools/wireframe-builder/types/editor.ts
export type GridLayout = '1' | '2' | '3' | '2-1' | '1-2'

export type RowConfig = {
  id: string            // unique row ID for drag-and-drop
  layout: GridLayout
  sections: BlueprintSection[]  // 1 per cell in the layout
}

export type EditModeState = {
  active: boolean
  dirty: boolean        // unsaved changes exist
  saving: boolean       // save in progress
  selectedSection: { rowIndex: number; cellIndex: number } | null
}
```

```typescript
// In WireframeViewer, NOT a separate context -- keep state local to avoid over-engineering
const [editMode, setEditMode] = useState<EditModeState>({
  active: false,
  dirty: false,
  saving: false,
  selectedSection: null,
})

// Working copy of config (edited in-memory, persisted on "Salvar")
const [workingConfig, setWorkingConfig] = useState<BlueprintConfig | null>(null)
```

### Pattern 2: Supabase Seed-on-First-Open
**What:** Auto-import from blueprint.config.ts if no Supabase record exists for the client
**When to use:** First time an operator opens the editor for a client

```typescript
// tools/wireframe-builder/lib/blueprint-store.ts
import { supabase } from '@/lib/supabase'
import type { BlueprintConfig } from '../types/blueprint'

export async function loadBlueprint(clientSlug: string): Promise<BlueprintConfig | null> {
  const { data, error } = await supabase
    .from('blueprint_configs')
    .select('config')
    .eq('client_slug', clientSlug)
    .single()

  if (error || !data) return null
  return data.config as BlueprintConfig
}

export async function saveBlueprint(
  clientSlug: string,
  config: BlueprintConfig,
  updatedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('blueprint_configs')
    .upsert({
      client_slug: clientSlug,
      config,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_slug' })

  if (error) throw error
}

export async function seedFromFile(
  clientSlug: string,
  config: BlueprintConfig,
  seededBy: string
): Promise<void> {
  // Only insert if no record exists
  const existing = await loadBlueprint(clientSlug)
  if (existing) return
  await saveBlueprint(clientSlug, config, seededBy)
}
```

### Pattern 3: Discriminated Union Dispatch for Property Forms
**What:** Map each section.type to its specific property form component
**When to use:** When operator clicks a section in edit mode

```typescript
// tools/wireframe-builder/components/editor/PropertyPanel.tsx
function getFormForSection(section: BlueprintSection) {
  switch (section.type) {
    case 'kpi-grid': return <KpiGridForm section={section} onChange={handleChange} />
    case 'bar-line-chart': return <BarLineChartForm section={section} onChange={handleChange} />
    case 'donut-chart': return <DonutChartForm section={section} onChange={handleChange} />
    // ... all 15 types
  }
}
```

### Pattern 4: Section Immutable Update
**What:** Deep-clone-free config updates using array spread + index replacement
**When to use:** When any section prop changes or sections are reordered

```typescript
function updateSection(
  config: BlueprintConfig,
  screenIndex: number,
  sectionIndex: number,
  updatedSection: BlueprintSection
): BlueprintConfig {
  return {
    ...config,
    screens: config.screens.map((screen, si) =>
      si === screenIndex
        ? {
            ...screen,
            sections: screen.sections.map((sec, secI) =>
              secI === sectionIndex ? updatedSection : sec
            ),
          }
        : screen
    ),
  }
}
```

### Pattern 5: Grid Row Augmentation
**What:** The existing BlueprintScreen.sections is a flat array. The grid layout system needs a row-based structure.
**When to use:** When transforming flat sections into grid rows for the editor

The existing BlueprintSection[] is flat. The grid layout system wraps sections in rows.
Two approaches:

**Option A (Recommended): Augment BlueprintConfig type with rows**
Add an optional `rows` field to BlueprintScreen that, when present, supersedes `sections`.
This preserves backward compatibility -- existing configs without `rows` render sections flat (one per row, full width).

```typescript
export type ScreenRow = {
  id: string
  layout: GridLayout
  sections: BlueprintSection[]  // length matches layout cell count
}

export type BlueprintScreen = {
  id: string
  title: string
  icon?: string
  periodType: PeriodType
  filters: FilterOption[]
  hasCompareSwitch: boolean
  sections: BlueprintSection[]     // kept for backward compat
  rows?: ScreenRow[]               // NEW: when present, rows are the source of truth
}
```

When migrating/seeding from the .ts file: auto-convert flat `sections` into single-column rows (one section per row).

### Anti-Patterns to Avoid
- **Global state library for edit mode:** Do NOT add Zustand or Redux for this. Edit mode state is local to the WireframeViewer component tree. React state + prop drilling (or a small context) is sufficient.
- **Real-time Supabase subscriptions:** The decision explicitly states no real-time collaborative editing. Use request/response pattern only.
- **Saving on every keystroke:** Batch saves via the explicit "Salvar" button. Working copy lives in React state.
- **Separate routes for edit mode:** Edit mode is a toggle within the existing wireframe viewer, not a separate page.
- **Putting editor components in src/:** Editor components belong in `tools/wireframe-builder/components/editor/` per the project's tool component convention.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop reordering | Custom mousedown/mousemove/mouseup handlers | @dnd-kit/core + @dnd-kit/sortable | Accessibility (keyboard, screen reader), collision detection, placeholder animation, edge scrolling |
| Slide-out property panel | Custom absolute-positioned div with transitions | shadcn/ui Sheet (right side) | Focus trap, overlay, close-on-escape, animation, mobile support |
| Confirmation dialogs | Custom modal with state management | shadcn/ui Dialog (AlertDialog) | Accessible, focus management, keyboard support |
| Array reordering on drag end | Manual splice/index math | @dnd-kit/sortable `arrayMove()` utility | Tested edge cases, immutable by default |
| Unique IDs for drag items | Math.random() or Date.now() | crypto.randomUUID() | Browser-native, collision-free, available in all modern browsers |

**Key insight:** The editor's complexity lies in state management and form design, not in building UI primitives. Every interactive primitive (drag, panel, dialog, form) has a battle-tested library solution.

## Common Pitfalls

### Pitfall 1: Stale Working Copy After Save
**What goes wrong:** Operator saves, then the working copy in React state is out of sync with what Supabase returns
**Why it happens:** Save uses `upsert` but the returned data might have server-side defaults (updated_at)
**How to avoid:** After successful save, update the working copy from the save response OR re-fetch from Supabase. Set `dirty: false` only after confirmed save.
**Warning signs:** "Salvar" button stays enabled after save, or re-entering edit mode shows old data

### Pitfall 2: Comment Target IDs Break After Section Reorder
**What goes wrong:** Comment target_id uses `section:screenId:sectionIndex`. If sections are reordered, existing comments point to wrong sections.
**Why it happens:** The current `toTargetId` uses integer index, which is positional not identity-based.
**How to avoid:** Add a persistent `id` field to each BlueprintSection when stored in Supabase. Use that ID for comment targeting instead of array index. During seed migration, generate IDs for each section.
**Warning signs:** Comments appearing on wrong sections after reorder

### Pitfall 3: Grid Layout Cell Count Mismatch
**What goes wrong:** Operator changes grid layout from 3-column to 2-column but row has 3 sections
**Why it happens:** Layout defines cell count, sections array must match
**How to avoid:** When layout changes: if new layout has fewer cells, move excess sections to a new row below. If more cells, add empty cells (show "+" to add section).
**Warning signs:** TypeScript errors on grid render, empty cells without add controls

### Pitfall 4: BlueprintConfig Type Backward Compatibility
**What goes wrong:** Adding `rows` to BlueprintScreen breaks existing .ts seed files that don't have it
**Why it happens:** TypeScript strict mode requires all fields
**How to avoid:** Make `rows` optional (`rows?: ScreenRow[]`). BlueprintRenderer checks: if `rows` exists, use rows; else, auto-wrap `sections` into single-column rows.
**Warning signs:** TypeScript compilation errors in client wireframe configs

### Pitfall 5: Unsaved Changes Lost on Navigation
**What goes wrong:** Operator edits sections, then clicks a different screen in the sidebar without saving
**Why it happens:** Screen change replaces the active screen, losing in-memory edits
**How to avoid:** Track `dirty` state. On screen switch while dirty: show confirmation dialog ("Voce tem alteracoes nao salvas. Deseja sair sem salvar?"). Same for exiting edit mode.
**Warning signs:** User reports losing work when switching screens

### Pitfall 6: Large JSON Payload Performance
**What goes wrong:** Saving the full BlueprintConfig (~54KB JSON) on every save feels slow
**Why it happens:** Full config upsert over network
**How to avoid:** The full config is ~54KB which is well within Supabase's limits and should save in <200ms. If it grows, consider saving only the active screen's changes. For v1, full config save is fine.
**Warning signs:** Save taking >1 second

### Pitfall 7: SharedWireframeView Seed Race Condition
**What goes wrong:** Client opens shared view before operator has ever opened the editor (no Supabase record exists)
**Why it happens:** SharedWireframeView needs to load from Supabase, but seed only happens on operator's first editor open
**How to avoid:** SharedWireframeView should also attempt seed-on-load: if no Supabase record, import from .ts file and save, then render. Use the same `seedFromFile` function.
**Warning signs:** Clients see empty wireframe or error page

## Code Examples

### Supabase Migration: blueprint_configs table
```sql
-- Source: follows existing comments/share_tokens pattern from 001/002 migrations

CREATE TABLE public.blueprint_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug text NOT NULL UNIQUE,
  config jsonb NOT NULL,
  updated_by text,                    -- Clerk user ID (text, not uuid)
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blueprint_configs ENABLE ROW LEVEL SECURITY;

-- Anon policies (consistent with 002_clerk_migration.sql pattern)
CREATE POLICY "anon_read_blueprint_configs"
  ON blueprint_configs FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_blueprint_configs"
  ON blueprint_configs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_blueprint_configs"
  ON blueprint_configs FOR UPDATE TO anon USING (true);

-- Index for fast lookup by client_slug (already UNIQUE but explicit for clarity)
CREATE INDEX idx_blueprint_configs_client_slug ON blueprint_configs(client_slug);
```

### dnd-kit Sortable Sections
```typescript
// Source: @dnd-kit/sortable official docs pattern adapted for blueprint sections
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragEndEvent } from '@dnd-kit/core'

function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style}>
      <div className="group relative">
        {/* Drag handle -- only visible in edit mode */}
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        {children}
      </div>
    </div>
  )
}
```

### Default Props for New Sections
```typescript
// tools/wireframe-builder/lib/defaults.ts
import type { BlueprintSection } from '../types/blueprint'

export function getDefaultSection(type: BlueprintSection['type']): BlueprintSection {
  switch (type) {
    case 'kpi-grid':
      return {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Novo KPI', value: 'R$ 0', sparkline: [0, 0, 0, 0, 0] },
        ],
      }
    case 'bar-line-chart':
      return { type: 'bar-line-chart', title: 'Novo Grafico', chartType: 'bar' }
    case 'donut-chart':
      return { type: 'donut-chart', title: 'Novo Grafico de Rosca' }
    case 'data-table':
      return {
        type: 'data-table',
        title: 'Nova Tabela',
        columns: [{ key: 'col1', label: 'Coluna 1' }],
        rowCount: 5,
      }
    case 'info-block':
      return { type: 'info-block', content: 'Novo bloco de informacao', variant: 'info' }
    // ... all 15 types with sensible defaults
    default:
      return { type: 'info-block', content: 'Secao adicionada', variant: 'info' }
  }
}
```

### Admin Toolbar Structure
```typescript
// tools/wireframe-builder/components/editor/AdminToolbar.tsx
type Props = {
  screenTitle: string
  editMode: boolean
  dirty: boolean
  saving: boolean
  onToggleEdit: () => void
  onSave: () => void
  onOpenComments: () => void
}

export default function AdminToolbar({
  screenTitle, editMode, dirty, saving,
  onToggleEdit, onSave, onOpenComments,
}: Props) {
  return (
    <div className="flex items-center gap-3 border-b bg-white px-6 py-2">
      <span className="text-sm font-medium text-gray-700">{screenTitle}</span>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={onOpenComments}>Comentarios</button>
        {editMode && dirty && (
          <button onClick={onSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        )}
        <button onClick={onToggleEdit}>
          {editMode ? 'Sair da Edicao' : 'Editar'}
        </button>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit (or @hello-pangea/dnd for lists) | 2022-2023 | react-beautiful-dnd deprecated by Atlassian; dnd-kit is the standard for new projects |
| @dnd-kit/core v5 | @dnd-kit/core v6 + @dnd-kit/sortable v10 | 2024 | Current stable release; v7/@dnd-kit/react is in beta |
| Supabase Auth for all users | Clerk for operators + Supabase anon for data | Phase 02 | RLS uses anon role, Clerk user ID stored as text |
| Blueprint rendered from .ts import | Blueprint loaded from Supabase jsonb | This phase | Enables visual editing persistence |

**Deprecated/outdated:**
- react-beautiful-dnd: Unmaintained since 2022. Do not use.
- @dnd-kit/react (v0.3.x): Still in beta. Use @dnd-kit/core + @dnd-kit/sortable instead.
- Supabase real-time for config sync: Out of scope per user decision. Simple request/response.

## Open Questions

1. **Section IDs for stable comment targeting**
   - What we know: Current comment target uses `section:screenId:sectionIndex` (positional). Reordering sections breaks comment references.
   - What's unclear: Whether to migrate existing comments or just start using IDs going forward.
   - Recommendation: Add `id: string` (crypto.randomUUID()) to each BlueprintSection in the Supabase config. During seed, generate IDs for all sections. Update `toTargetId` to use section.id when available. Existing comments with index-based targets become orphaned but this is acceptable for v1 (few comments exist in practice).

2. **Grid rows vs. flat sections backward compatibility**
   - What we know: Existing BlueprintConfig uses flat `sections: BlueprintSection[]`. Grid layout needs `rows: ScreenRow[]`.
   - What's unclear: Whether to keep both fields or fully migrate.
   - Recommendation: Add `rows` as optional. On seed migration, auto-convert flat sections to single-column rows. BlueprintRenderer detects which format and renders accordingly. After all clients are migrated, `sections` can be deprecated.

3. **Component picker UI pattern**
   - What we know: 15 section types, 5 categories (KPIs, Graficos, Tabelas, Inputs, Layout).
   - What's unclear: Best UI pattern -- modal, dropdown, or side panel.
   - Recommendation: Use a centered modal (shadcn/ui Dialog) with a grid of cards grouped by category. Modal provides sufficient space for 15 items and clear category headers. This matches Elementor's "add element" widget panel concept.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None -- no test infrastructure exists in this project |
| Config file | none -- see Wave 0 |
| Quick run command | `npx tsc --noEmit` (TypeScript compilation is the acceptance criterion per CLAUDE.md) |
| Full suite command | `npx tsc --noEmit` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WEDT-01 | Section reorder, add, remove | manual-only | `npx tsc --noEmit` | N/A |
| WEDT-02 | Component prop editing via UI | manual-only | `npx tsc --noEmit` | N/A |
| WEDT-03 | Screen add/delete via UI | manual-only | `npx tsc --noEmit` | N/A |
| WEDT-04 | Edits sync to Supabase config | manual-only | `npx tsc --noEmit` | N/A |

**Justification for manual-only:** This project has no test runner (no vitest, jest, or testing-library). Per CLAUDE.md, `npx tsc --noEmit` with zero errors is the acceptance criterion. All WEDT requirements involve interactive UI behaviors (drag, click, save) that require a running browser. Adding a test framework is orthogonal to this phase's scope. TypeScript strict mode verifies type correctness of all editor code.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit`
- **Phase gate:** `npx tsc --noEmit` zero errors + manual verification of all 4 WEDT requirements

### Wave 0 Gaps
None -- existing TypeScript compilation infrastructure covers all phase requirements at the currently established acceptance criterion. No test framework to install.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `tools/wireframe-builder/types/blueprint.ts` -- 15 section types, discriminated union, BlueprintConfig/Screen/Section structure
- Existing codebase: `tools/wireframe-builder/components/BlueprintRenderer.tsx` -- current rendering pipeline
- Existing codebase: `tools/wireframe-builder/components/SectionWrapper.tsx` -- section wrapping pattern for comments (extensible to edit controls)
- Existing codebase: `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` -- full viewer implementation with Clerk auth
- Existing codebase: `src/pages/SharedWireframeView.tsx` -- shared view with token validation and dynamic config loading
- Existing codebase: `supabase/migrations/002_clerk_migration.sql` -- anon RLS policy pattern
- Existing codebase: `tools/wireframe-builder/lib/comments.ts` -- Supabase CRUD pattern for this project
- Existing codebase: `clients/financeiro-conta-azul/wireframe/blueprint.config.ts` -- seed data (54KB, 1158 lines, 8+ screens)

### Secondary (MEDIUM confidence)
- @dnd-kit official docs (https://dndkit.com/presets/sortable) -- sortable preset API, DndContext/SortableContext/useSortable pattern
- Supabase official docs (https://supabase.com/docs/guides/database/json) -- jsonb column best practices
- shadcn/ui official docs (https://ui.shadcn.com/docs/components/radix/sheet) -- Sheet component API
- npm registry -- @dnd-kit/core v6.3.1, @dnd-kit/sortable v10.0.0 download counts and stability

### Tertiary (LOW confidence)
- Web search: React page builder architecture patterns -- general patterns, not specific to this codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - dnd-kit is the established React DnD library, Supabase jsonb is standard, existing patterns are clear
- Architecture: HIGH - existing codebase strongly guides the architecture (discriminated union, SectionWrapper, viewer pattern)
- Pitfalls: HIGH - identified from direct codebase analysis (comment targeting, grid mismatch, backward compat) and standard DnD pitfalls

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (30 days -- stable ecosystem, no fast-moving dependencies)
