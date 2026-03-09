# Project Research Summary

**Project:** FXL Core v1.1 -- Wireframe Evolution
**Domain:** Internal BI platform -- wireframe editor expansion, design system, dynamic blueprints, AI-assisted generation
**Researched:** 2026-03-09
**Confidence:** HIGH

## Executive Summary

FXL Core v1.1 is an evolution of an existing, proven wireframe-to-blueprint system (15 section types, 1 pilot client, visual editor with drag-reorder, Supabase persistence, branding system) into a more capable platform with four expansion vectors: a wireframe-specific design system (white/black/gray/gold palette with dark/light modes), an expanded component library (settings pages, form inputs, navigation blocks), dynamic blueprint management (DB as sole source of truth, versioning, textual rendering), and AI-assisted blueprint generation from structured briefing input. The existing architecture is sound -- the discriminated union type system, JSONB blob storage pattern, and CSS variable layering all extend naturally. No architectural rewrites are needed.

The recommended approach is conservative expansion: add 4 npm packages (react-hook-form, zod, @hookform/resolvers, sonner), 10 shadcn/ui primitives, 2 Supabase tables (briefings, branding_configs), and 6+ new section types -- all following established patterns. The existing stack (React 18, TypeScript strict, Tailwind 3, Vite 5, recharts 2.x, dnd-kit, Supabase, Clerk) remains unchanged. Claude Code access to blueprint data is via Markdown export rather than MCP, matching FXL's minimal-infrastructure constraint.

The primary risks are concentrated in Phase 1: dual source of truth during the file-to-DB migration (the `.ts` config file must be frozen, not gradually faded), JSONB schema drift without versioning (add `schemaVersion` before any schema changes), and theme collision between the app's shadcn tokens, the new wireframe chrome tokens, and existing client branding tokens (establish `--wf-*` namespace before any visual work). AI generation (Phase 5) carries the highest uncertainty but is derisked by requiring runtime validation infrastructure and a human-review step before generated blueprints become live.

## Key Findings

### Recommended Stack

The v1.1 stack is additive -- zero existing packages change. Four runtime dependencies cover form handling (react-hook-form + zod + @hookform/resolvers for briefing input) and user feedback (sonner for toast notifications). Ten shadcn/ui primitives (form, checkbox, switch, tabs, radio-group, accordion, card, dropdown-menu, sonner, slider) are added via CLI and auto-manage their Radix dependencies.

**Core additions:**
- **react-hook-form ^7.71.2**: Briefing form state -- uncontrolled by default, minimal re-renders, shadcn Form component is built on it
- **zod ^3.24.0 (v3, NOT v4)**: Schema validation + TypeScript type inference -- single source of truth for briefing data shapes. v4 has documented type incompatibilities with @hookform/resolvers
- **sonner ^2.0.0**: Toast notifications for save/sync feedback -- shadcn recommended, promise-based toasts for async Supabase operations
- **Supabase MCP (deferred)**: Research recommends MD export over MCP for current scale. MCP adds infrastructure dependency and debugging opacity for marginal benefit at 1 client

**Explicitly not needed:** state management libraries (Redux/Zustand/Jotai), new chart libraries (recharts 2.x has all needed types), CSS-in-JS, rich text editors, form builder libraries, recharts 3.x upgrade, React 19, Tailwind v4.

### Expected Features

**Must have (table stakes):**
- Semantic color tokens (primitive -> semantic -> component) -- foundation for all visual work
- Neutral palette (white/black/gray) + gold accent system -- standard for internal tools
- Dark + light mode toggle in wireframes -- app already has dark mode, wireframes without it feel broken
- Blueprint as DB-only source of truth -- remove .ts file dependency, enable UI editing without redeploy
- Blueprint versioning (append-only history table) -- editing without undo/history is dangerous
- Expanded component library: settings blocks, form inputs, filter bar variations, navigation components
- Structured briefing form in UI -- replace manual markdown authoring with validated input
- Branding override layer integrated with design tokens

**Should have (differentiators):**
- AI blueprint generation from briefing + historical client data -- domain-specific, not generic wireframes
- Screen recipe intelligence (typed registry, not just markdown) -- no competitor maps business type to optimal screens
- Blueprint textual rendering in UI -- operators see structure alongside visual preview
- Business-type templates for common FXL verticals -- faster onboarding than AI generation for known types

**Defer to v1.2+:**
- Blueprint diff and merge (visual version comparison)
- Progressive blueprint refinement (regenerate individual screens)
- Page type templates beyond dashboards (detail, list, form pages)
- Real-time collaborative editing (CRDT complexity for 1-2 operators)
- Visual drag-and-drop Figma-like design tool
- Natural language editing ("make the chart bigger")
- Custom component creation via UI

### Architecture Approach

The architecture preserves the core invariant: `BlueprintConfig` TypeScript type is the contract boundary between storage and rendering. Whether data comes from file seed, JSONB blob, or AI generation, the object passed to `BlueprintRenderer` must conform to `BlueprintConfig`. The expansion uses five patterns: (1) keep JSONB blob as primary store (no normalization -- discriminated union + atomic reads/writes make relational modeling painful for zero benefit), (2) three-layer theme isolation (app tokens `--primary`, wireframe chrome `--wf-*`, client branding `--brand-*` -- never overlapping), (3) MD export for Claude Code access instead of MCP, (4) registry-based component expansion (extend existing discriminated union + switch dispatch), and (5) briefing storage as structured JSONB.

**Major components:**
1. **WireframeThemeProvider** -- new context wrapping wireframe viewer, manages `data-wf-theme="light|dark"` attribute, applies `--wf-*` CSS variables
2. **GenericWireframeViewer** -- parameterized by `:clientSlug` route param, replacing hardcoded per-client pages. Loads blueprint + branding + comments from DB dynamically
3. **BriefingForm** -- structured input UI using react-hook-form + zod, persists to `briefings` table in Supabase
4. **BlueprintTextView** -- read-only textual rendering of blueprint structure from DB
5. **blueprint-export** -- MD export function for Claude Code access to blueprint data
6. **Section registry expansion** -- 6+ new section types (settings-page, form-section, filter-config, stat-card, progress-bar, divider) following the 5-touchpoint pattern

### Critical Pitfalls

1. **Dual source of truth during file-to-DB migration** -- The `.ts` config file seeds DB on first load, then DB is used. During migration, developers may edit the stale file, or a fresh Supabase reset re-seeds and overwrites DB edits. Avoid by making a clean cutover: rename file to `.seed.ts`, add deprecation JSDoc, remove `seedFromFile` once DB is seeded.

2. **JSONB schema drift without versioning** -- Adding new section types to the TypeScript union does not update existing JSONB in the DB. `SectionRenderer` silently returns undefined for unknown types. The `as BlueprintConfig` cast suppresses all runtime type checking. Avoid by adding `schemaVersion` to stored JSON, writing migration functions per version bump, replacing the cast with zod `parse()`.

3. **Theme collision between three CSS variable namespaces** -- App tokens (`--primary`), wireframe chrome (`--wf-*`), and client branding (`--brand-*`) coexist on the same page. CSS custom properties inherit through DOM. If wireframe components import shadcn/ui directly, they get app theme tokens. Avoid by establishing strict namespace prefixes from day one and wrapping any shared UI components.

4. **Breaking existing wireframes when expanding schema** -- The pilot client has 10 screens with 50+ sections. Adding required fields to existing types or restructuring the `BlueprintSection` union breaks rendering. Avoid by making all new fields optional with defaults, and writing migration functions BEFORE changing types.

5. **AI generation producing invalid or inconsistent blueprints** -- LLM output is structurally valid JSON but semantically wrong (wrong section types, generic labels, colliding IDs). Avoid by generating in two passes (structure then detail), validating with zod before DB write, and requiring operator review before acceptance.

## Implications for Roadmap

Based on combined research, the dependency graph dictates a clear phase structure. The design system and dynamic blueprint infrastructure are independent foundations that can be parallelized. Component expansion requires the design system. AI generation requires both dynamic blueprints and briefing input.

### Phase 1: Foundation -- DB Migration + Schema Infrastructure

**Rationale:** Every subsequent feature depends on a single, clear source of truth for blueprints in the DB, runtime validation to catch schema mismatches, and the wireframe theme namespace. Four of seven critical pitfalls (dual source of truth, schema drift, breaking existing wireframes, sync conflicts) must be addressed here. This is the highest-risk phase because mistakes compound into every later phase.

**Delivers:**
- `blueprint.config.ts` frozen as `.seed.ts` with deprecation; `seedFromFile` removed from rendering paths
- `schemaVersion` field in all stored blueprint JSON; migration function infrastructure
- Runtime validation replacing `as BlueprintConfig` cast with zod `parse()`
- Optimistic locking on blueprint save (`updated_at` in WHERE clause)
- Supabase migration 004: `briefings` + `branding_configs` tables
- Branding loaded from DB (with .ts file as seed fallback only)

**Addresses features:** Blueprint as DB-only source of truth, blueprint versioning, schema validation
**Avoids pitfalls:** 1 (dual source of truth), 2 (schema drift), 5 (breaking existing wireframes), 7 (sync conflicts)

### Phase 2: Design System + Wireframe Theme

**Rationale:** Visual foundation for all subsequent component work. Independent of DB migration but logically follows because branding now loads from DB. The three-layer theme isolation (app / wireframe chrome / client branding) must be established before any new components are styled.

**Delivers:**
- `--wf-*` CSS variable namespace in `globals.css` or dedicated file
- `WireframeThemeProvider` context with dark/light toggle
- Semantic color tokens: neutral palette (10-step gray scale) + gold accent
- Branding override layer integrated with new token system
- Dark + light mode in wireframes via CSS class toggle

**Addresses features:** Semantic color tokens, neutral palette, accent color, dark/light mode, branding override layer
**Avoids pitfalls:** 4 (theme collision)
**Uses stack:** Existing CSS custom properties + Tailwind; no new libraries needed

### Phase 3: Component Library Expansion

**Rationale:** Requires design system tokens to style correctly. Should refactor to a component registry pattern BEFORE adding new types -- the current 6-touchpoint pattern is acceptable at 15 types but unacceptable at 25+. Adding new components to the old scattered architecture makes the refactor harder later.

**Delivers:**
- Component registry pattern replacing switch statements in SectionRenderer, PropertyPanel, defaults
- 6+ new section types: settings-page, form-section, filter-config, stat-card, progress-bar, divider
- New section renderers + property forms + ComponentPicker entries
- Expanded recharts usage: RadarChart, Treemap, FunnelChart, ScatterChart, AreaChart (all from existing recharts 2.x)
- GenericWireframeViewer parameterized by `:clientSlug` (replacing hardcoded per-client pages)

**Addresses features:** Settings blocks, form inputs, filter bar extensions, navigation blocks, page type expansion
**Avoids pitfalls:** 3 (component sprawl)
**Uses stack:** Existing recharts 2.x (new imports only); new shadcn/ui primitives (tabs, accordion, slider, dropdown-menu)

### Phase 4: Briefing Input + Blueprint Text View

**Rationale:** Depends on DB infrastructure from Phase 1 and form primitives installed during stack setup. This is the prerequisite for AI generation -- structured briefing data must exist in Supabase before AI can consume it. Blueprint text view also depends on working blueprint load from DB.

**Delivers:**
- BriefingForm UI using react-hook-form + zod + shadcn Form component
- Briefing persistence to `briefings` table (JSONB `content` column)
- BlueprintTextView page (read-only structured rendering of blueprint)
- Blueprint MD export function for Claude Code access
- CLI tool (`npm run export-blueprint -- --client [slug]`)

**Addresses features:** Structured briefing form, textual blueprint rendering, blueprint accessible to Claude Code
**Uses stack:** react-hook-form, zod, @hookform/resolvers, sonner (for save feedback), shadcn form/checkbox/radio-group

### Phase 5: AI-Assisted Blueprint Generation

**Rationale:** Depends on runtime validation (Phase 1), component registry (Phase 3), briefing data in DB (Phase 4), and MD export (Phase 4). This is the highest-complexity, highest-uncertainty phase. It is the core differentiator but must be built on solid infrastructure.

**Delivers:**
- Two-pass AI generation: structure pass (screen list, section types, layout) then detail pass (properties, labels, filters)
- Claude structured outputs with zod schema matching `BlueprintConfig`
- Operator review UI: textual diff of generated vs current blueprint, per-section accept/reject
- Screen recipe registry (typed, not markdown) providing AI generation context
- Business-type templates for common FXL verticals

**Addresses features:** AI blueprint generation from briefing, screen recipe intelligence, business-type templates
**Avoids pitfalls:** 6 (AI generation inconsistency)

### Phase Ordering Rationale

- **Phase 1 before everything:** Four of seven critical pitfalls must be addressed in the DB migration phase. Schema versioning and runtime validation are prerequisites for any schema changes in later phases.
- **Phase 2 before Phase 3:** Components need design tokens to style correctly. Building components on raw Tailwind and then retrofitting tokens doubles the work.
- **Phase 3 before Phase 5:** The component registry must be stable and complete before AI attempts to generate blueprints that reference section types. AI generation against an unstable registry produces invalid output.
- **Phase 4 parallel with Phase 3:** Briefing input has zero dependency on the component library. These can be developed simultaneously if team capacity allows.
- **Phase 5 last:** It depends on every preceding phase and carries the highest uncertainty. By Phase 5, the validation infrastructure, component registry, and briefing data are all in place -- reducing AI generation risk.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (DB Migration):** Research the `pg_jsonschema` extension behavior with existing non-conforming data. Verify `ALTER TABLE ... ADD CONSTRAINT ... NOT VALID` workflow on Supabase hosted. Research optimistic locking patterns with Supabase JS client (affected row count detection).
- **Phase 5 (AI Generation):** Research Claude structured outputs with deeply nested zod schemas (BlueprintConfig has screens -> rows -> sections -> items, 4 levels deep). Research prompt engineering for two-pass generation with cross-reference consistency. Research fallback strategies when generation fails validation.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Design System):** Well-documented CSS custom property patterns. The codebase already proves the approach works with `--brand-*`. Extend, do not reinvent.
- **Phase 3 (Component Expansion):** Established 5-touchpoint pattern with 15 prior examples. Registry refactor is a known pattern (React component registries are widely documented).
- **Phase 4 (Briefing Input):** Standard CRUD form with react-hook-form + zod. shadcn/ui has an official integration guide. No unknowns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified against npm with version compatibility. Zod v3/v4 incompatibility documented in GitHub issues. Recharts chart type availability confirmed in 2.x. |
| Features | HIGH | Grounded in competitive analysis (Elementor, Retool, Plasmic, Builder.io, Figma AI) and direct codebase architecture review. Feature dependencies mapped from actual code. |
| Architecture | HIGH | Based on direct analysis of 80+ files in the codebase. All patterns extend existing proven architecture (JSONB blob, discriminated union, CSS variable layering). No speculative designs. |
| Pitfalls | HIGH | Every pitfall traces to specific code lines (blueprint-store.ts line 16, SectionRenderer switch, WireframeViewer seedFromFile). Prevention strategies are concrete and testable. |

**Overall confidence:** HIGH

### Gaps to Address

- **pg_jsonschema on Supabase hosted:** Confirmed available as extension, but behavior when adding CHECK constraint to existing non-conforming data needs testing in the actual Supabase project. Handle during Phase 1 planning by testing on a staging project first.
- **Claude structured outputs with deep nesting:** BlueprintConfig is a complex nested schema (4 levels, 15+ union variants). Claude's reliability with schemas this complex at generation time is not empirically verified for FXL's specific types. Handle during Phase 5 by starting with a simplified schema (fewer section types) and expanding.
- **Supabase MCP vs MD export long-term:** Research chose MD export for v1.1 (simpler, safer). But at 5+ clients, managing per-client export files may become friction. Re-evaluate MCP at v1.2 planning.
- **Optimistic locking UX:** The conflict resolution UI (what the operator sees when `updated_at` mismatch occurs) needs UX design. Not a technical gap but a design gap. Address during Phase 1 planning with a simple modal: "Blueprint was modified since you loaded it. Reload or overwrite?"

## Sources

### Primary (HIGH confidence)
- FXL Core codebase: 80+ files analyzed in `tools/wireframe-builder/`, `src/pages/`, `supabase/migrations/`
- react-hook-form npm (v7.71.2), zod npm (v3.24.x), @hookform/resolvers npm (v5.2.2), sonner npm (v2.x)
- shadcn/ui official docs: forms integration, component list, sonner recommendation
- Supabase official docs: JSONB, pg_jsonschema, MCP, type generation, migrations
- recharts npm + wiki: v2.x chart types confirmed (Radar, Treemap, Funnel, Scatter, Area), v3.x migration guide reviewed

### Secondary (MEDIUM confidence)
- Competitive analysis: Elementor 3.33, Retool, Plasmic, Builder.io, Relume, Figma AI, Visily
- Design system patterns: 3-tier token architecture, Fluent 2 color system, semantic color naming for dark mode
- PostgreSQL JSONB migration patterns: version tracking, batched migration, transformation functions

### Tertiary (LOW confidence)
- AI code generation reproducibility (68.3% rate from arxiv study) -- applies broadly but FXL's specific schema complexity may differ
- Claude structured outputs with deeply nested schemas -- documented for simpler cases, needs empirical validation for BlueprintConfig depth

---
*Research completed: 2026-03-09*
*Ready for roadmap: yes*
