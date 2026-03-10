# Phase 10: Briefing & Blueprint Views - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Structured briefing input persisted in Supabase, read-only blueprint text view, Markdown export for Claude Code consumption, and share link button restored in the operator wireframe viewer. No new wireframe components or editor features — pure data views and sharing.

</domain>

<decisions>
## Implementation Decisions

### Briefing form format
- Hybrid: structured sections for essentials + free-form markdown field for additional context
- Structured sections: company info (name, segment, size), data sources (system, export type, fields), modules/KPIs (module name, KPI list, business rules), target audience
- Free-form field: markdown textarea for anything that doesn't fit the structured sections (edge cases, context, notes)
- Persisted as JSON in Supabase (new table `briefing_configs`, same pattern as `blueprint_configs`)
- Client slug as unique key, JSONB config column

### Blueprint text view
- Hierarchical outline: Tree structure Screen > Section > Properties
- Collapsible per screen (default: all expanded)
- Each section shows: type badge, title, key fields (e.g., KPI names for kpi-grid, column headers for data-table, chart type for charts)
- Read-only — no editing from this view
- Lives as a tab or route alongside the wireframe visual view

### Blueprint Markdown export
- Button in blueprint text view that generates a .md file download
- Markdown format readable by Claude Code for generation context
- Includes: client name, screen list with section details, property summaries
- Same hierarchical structure as the text view but as downloadable markdown

### Share link UX
- Button in AdminToolbar alongside Save/Theme toggle
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

</decisions>

<specifics>
## Specific Ideas

- Briefing form should capture enough structure for Claude Code to generate a blueprint programmatically (Phase 11 dependency)
- Blueprint text view is an "executive summary" of the wireframe — scannable, not raw JSON
- Share link system already works end-to-end (tokens.ts) — this is purely adding UI for operators
- Markdown export feeds directly into Phase 11 (AI-Assisted Generation) as context input

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tokens.ts` (tools/wireframe-builder/lib/tokens.ts): Full CRUD for share tokens — createShareToken, validateToken, getTokensForClient, revokeToken
- `SharedWireframeView.tsx` (src/pages/SharedWireframeView.tsx): Public view with name entry + comments — already functional
- `DocViewer.tsx` (src/pages/clients/FinanceiroContaAzul/DocViewer.tsx): Markdown rendering pattern via ?raw imports
- `MarkdownRenderer`: Existing component for rendering .md content
- `blueprint-store.ts` (tools/wireframe-builder/lib/blueprint-store.ts): loadBlueprint, saveBlueprint with optimistic locking
- `BlueprintConfig` type with 21 section types — all fields known for text view generation
- `AdminToolbar.tsx` (tools/wireframe-builder/components/editor/AdminToolbar.tsx): Where share button will live, already uses --wf-* tokens
- shadcn Dialog, Input, Button — available for share modal

### Established Patterns
- Supabase table pattern: client_slug as unique key, JSONB config column, anon RLS policies (blueprint_configs)
- Supabase migration files in supabase/migrations/ (001, 002, 003 existing)
- Wireframe tokens (--wf-*) for all wireframe UI elements
- Toast notifications via sonner for user feedback

### Integration Points
- AdminToolbar: Share button placement
- App.tsx routes: New routes for briefing form and blueprint text view
- Supabase: New briefing_configs table (migration 004)
- Client workspace: Navigation from client index to briefing/blueprint views
- Phase 11 dependency: Briefing JSON + Blueprint MD export = input for AI generation

</code_context>

<deferred>
## Deferred Ideas

- Briefing generation from pre-defined templates (Phase 11 — AIGE-03)
- AI-assisted briefing filling (future)
- Blueprint diff/compare between versions (v2 — ADVW-01)
- Real-time collaborative briefing editing (v2 — ADVW-03)

</deferred>

---

*Phase: 10-briefing-blueprint-views*
*Context gathered: 2026-03-10*
