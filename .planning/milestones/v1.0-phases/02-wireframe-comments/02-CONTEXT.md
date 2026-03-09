# Phase 2: Wireframe Comments - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Persistent feedback conversations on wireframe screens and blocks, stored in Supabase. External clients access via shared link without a developer account. Operator manages all comments from within the wireframe viewer. Visual editing, branding, and system generation are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Comment placement
- Comments can be left at two levels: screen-level (general) and block/section-level (specific to a KPI grid, chart, table, etc.)
- Block-level comments initiated via hover + click icon — a small comment icon appears when hovering over a section
- Badge count on section corner shows unresolved comment count for that block
- Comment thread opens in right-side drawer (same pattern as existing CommentOverlay)
- Drawer shows comments for the selected context (screen or specific block)

### Client access model
- External clients access the wireframe via a shared link with a unique token (e.g., `/wireframe-view?token=abc123`)
- No login required for clients — token in URL grants access
- Tokens expire after a set period and can be revoked by the operator
- On first visit, client enters their name (stored in localStorage) — all their comments are attributed to that name

### Operator auth
- Operator accesses FXL Core with basic Supabase Auth (email/password login)
- This is the first introduction of auth in FXL Core — currently the app has no login
- Operator identity for comments comes from their Supabase auth profile name

### Comment management
- Management panel lives inside the wireframe viewer (not a separate page)
- Comments grouped by screen with expand/collapse headers
- Filter by status only: All, Open, Resolved
- One-click resolve — operator clicks a button and the comment is marked resolved immediately, no resolution note

### Comment identity and display
- Operator identified by Supabase auth profile name
- Client identified by the name they entered on first visit
- Small label tag ("Operador" / "Cliente") next to author name to distinguish roles
- Flat comment list, no threading or replies
- Resolved comments show "Resolvido" status with visual dimming — no info about who resolved

### Claude's Discretion
- Supabase table schema design (comments, tokens, auth)
- Exact drawer width and comment card styling
- Hover icon positioning and animation
- Token generation strategy and expiry duration
- Auth flow UX (login page, redirect behavior)
- Empty state messaging
- Error handling for expired/revoked tokens

</decisions>

<specifics>
## Specific Ideas

- Reuse the existing CommentOverlay drawer pattern — keep the right-side slide-in consistent
- The badge count on blocks should be subtle (small, corner-positioned) — not disruptive to the wireframe visual
- Client access should be zero-friction: open link, type name, start commenting

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CommentOverlay.tsx`: Existing drawer component with comment list, textarea, and add button. Currently local state only — needs Supabase integration. Has Comment type with id, author, text, timestamp, resolved fields.
- `WireframeViewer.tsx`: Full-screen wireframe viewer with sidebar navigation. Already renders CommentOverlay per screen via `screenName` prop. Integration point for the new comment system.
- `BlueprintRenderer.tsx`: Renders screens with SectionRenderer for each section. Section-level comment icons would wrap or augment SectionRenderer.
- `SectionRenderer.tsx`: Dispatches to specific renderers (KpiGridRenderer, ChartRenderer, etc.). Wrapping point for hover comment icons.
- `BlueprintScreen` type: Has `id` and `title` — useful for comment anchoring. Sections don't have IDs currently — may need section index or generated ID for block-level comments.

### Established Patterns
- Tailwind CSS for styling — all wireframe components use Tailwind
- lucide-react for icons (MessageSquare already used in CommentOverlay)
- No existing Supabase integration in FXL Core — this will be the first
- Path aliases: `@tools/wireframe-builder/components/` for shared components

### Integration Points
- `WireframeViewer.tsx` — main integration point for comment system
- `App.tsx` routes — new shared link route needed for client access
- `SectionRenderer.tsx` — wrapping point for block-level comment icons
- New Supabase client setup needed in `src/lib/` or `tools/wireframe-builder/lib/`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-wireframe-comments*
*Context gathered: 2026-03-07*
