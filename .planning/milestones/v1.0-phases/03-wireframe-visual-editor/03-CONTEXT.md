# Phase 3: Wireframe Visual Editor - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Operators can visually modify wireframe layout and components without touching code, with all changes synced to a Supabase-stored blueprint config. Covers: section reordering/adding/removing within screens, component prop editing via UI, screen management (add/rename/delete), and persistence in Supabase. Branding, system generation, and data integration are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Persistence model (Supabase)
- Blueprint configs stored in Supabase as the source of truth for the editor
- Existing blueprint.config.ts files serve as seed/fallback — on first editor open for a client, if no Supabase config exists, the system auto-imports from the TypeScript file
- After import, all edits happen in Supabase; the .ts file stays in the repo for dev/testing/initial state
- SharedWireframeView (client link) also loads from Supabase — both operator and client always see the same version
- No version history in v1 — only current state with `updated_at` and `updated_by` metadata
- Supabase table stores the full BlueprintConfig JSON per client slug

### Edit mode interaction (Elementor-style)
- "Editar" button in the admin toolbar toggles edit mode on/off
- When active: sections show dashed borders, add/remove/drag controls become visible
- Click on a component in edit mode opens a right-side property panel with a form specific to that section type (title, chart type, columns, row count, etc.)
- "Salvar" button in toolbar persists current state to Supabase (only visible in edit mode)
- Exit edit mode without saving discards unsaved changes (with confirmation if changes exist)

### Grid layout system
- Screens are composed of rows, each row has a configurable grid layout
- Pre-defined grid layouts per row:
  - 1 column (full width)
  - 2 columns (50/50)
  - 3 columns (33/33/33)
  - 2:1 ratio (66/33)
  - 1:2 ratio (33/66)
- Operator can change the grid layout of any row at any time via a layout picker
- Each cell in a grid row holds one section/component

### Section manipulation
- "+" button appears between rows and at the bottom of the screen in edit mode
- Clicking "+" opens a component picker showing all 15 section types grouped by category:
  - KPIs (kpi-grid)
  - Graficos (bar-line-chart, donut-chart, waterfall-chart, pareto-chart)
  - Tabelas (data-table, drill-down-table, clickable-table, config-table)
  - Inputs (saldo-banco, manual-input, upload-section)
  - Layout (chart-grid, info-block)
- New components added with sensible default props
- Drag handles on each section for reordering within the screen
- Trash icon appears on hover in edit mode — click requires brief confirmation before removal

### Admin toolbar
- Fixed toolbar at the top of the wireframe viewer (above content, below app header)
- Contains: "Editar" toggle, "Comentarios" button, "Salvar" button (edit mode only), current screen name
- Only visible to authenticated operators (Clerk auth)
- Clients with share tokens see wireframe in read-only mode (with comments as before)

### Screen management
- Controls in the wireframe sidebar, visible in edit mode:
  - "+" button at the bottom of the screen list to add a new screen
  - "..." menu on each screen with "Renomear" and "Excluir" options
  - Drag handles on screen items for reordering
- New screen: modal asking for title, icon (picker with lucide icons), period type (mensal/anual/none)
- Delete screen: confirmation dialog showing section count ("Esta tela tem X secoes. Deseja excluir?")

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

</decisions>

<specifics>
## Specific Ideas

- Elementor (WordPress) is the primary UX reference — the edit mode should feel familiar to someone who has used Elementor
- Grid rows with layout selection is how Elementor structures page building — adapt this pattern for the wireframe context
- The admin toolbar is a single entry point for all operator actions (edit mode, comments, save) — keeps the wireframe viewer clean when not editing
- The component picker should make it easy to discover what's available — categories help operators who don't know all 15 section types

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BlueprintConfig` type (tools/wireframe-builder/types/blueprint.ts): 15 section types in discriminated union — the picker and property panels map directly to these types
- `BlueprintRenderer.tsx`: Currently renders from in-memory BlueprintScreen — needs to accept Supabase-loaded config instead of imported file
- `SectionRenderer.tsx`: Dispatch logic for all 15 types — edit mode wraps this with editable controls
- `SectionWrapper.tsx`: Already wraps sections for comment targeting — can be extended for edit mode controls (drag handle, delete, click-to-edit)
- `WireframeSidebar.tsx`: Dark sidebar with screen navigation — extend with edit mode controls (add/delete/reorder screens)
- `WireframeFilterBar.tsx`: Filter bar already inside BlueprintRenderer — stays as-is, edit mode adds toolbar above it
- `CommentOverlay.tsx` + `CommentManager.tsx`: Comment system already built — "Comentarios" toolbar button opens this
- `blueprint.config.ts` (clients/financeiro-conta-azul/wireframe/): Seed data for Supabase import — 8+ screens with full section configs
- Supabase client already configured (`src/lib/supabase.ts`) with VITE_ env vars

### Established Patterns
- Clerk auth for operator identity — reuse for toolbar visibility and `updated_by` tracking
- Supabase for persistence — already used for comments, extend with blueprint config table
- Discriminated union dispatch (section.type switch) — each section type gets its own property form
- Full-screen viewer outside Layout — toolbar adds to this pattern without breaking existing layout
- SectionWrapper pattern — wrapping sections with additional UI (currently comments, now also edit controls)

### Integration Points
- `WireframeViewer.tsx` — primary integration point: add toolbar, switch data source to Supabase, manage edit mode state
- `SharedWireframeView.tsx` — switch data source to Supabase (no edit mode, read-only)
- `BlueprintRenderer.tsx` — accept edit mode props, render editable sections
- `SectionRenderer.tsx` — wrap with edit controls when in edit mode
- `WireframeSidebar.tsx` — add screen management controls in edit mode
- Supabase migration — new table for blueprint configs
- `App.tsx` routes — no new routes needed, existing viewer routes gain edit capability

</code_context>

<deferred>
## Deferred Ideas

- Version history / undo for blueprint configs — future enhancement
- Collaborative real-time editing (multiple operators) — future
- Template screens (pre-built screen templates to start from) — could be Phase 4+
- Duplicate screen functionality — nice-to-have, not in scope

</deferred>

---

*Phase: 03-wireframe-visual-editor*
*Context gathered: 2026-03-08*
