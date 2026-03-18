# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-09
**Phases:** 9 | **Plans:** 27 | **Timeline:** 4 days

### What Was Built
- Documentation platform with 4-section taxonomy and operator onboarding
- Wireframe comment system with Supabase persistence, Clerk auth, and client share links
- 22 block specs as detailed prompts for component generation
- Production-grade visual redesign with semantic tokens and dark mode
- Full wireframe visual editor with drag-reorder, property panels, screen management
- Structured branding process with automatic CSS var and chart color application
- TechnicalConfig schema + Config Resolver → GenerationManifest pipeline
- Product spec generator producing 6 files for BI dashboard generation

### What Worked
- **Rapid iteration:** 27 plans across 9 phases completed in 4 days (~3.5 min avg per plan)
- **Decimal phase insertion:** 02.1, 02.2, 02.3 inserted cleanly without disrupting existing numbering
- **Blueprint-driven architecture:** BlueprintConfig as single source of truth enabled clean editor, branding, and generation pipelines
- **Pure function pattern:** Config Resolver as deterministic pure function made testing trivial
- **Semantic token system:** One migration (Phase 02.3) enabled dark mode across entire app
- **GSD workflow:** Phase → Plan → Execute → Verify cycle kept work focused and traceable

### What Was Inefficient
- **GSKILL requirements orphaned:** Phase 02.3 was repurposed from "Global Skills" to "Reformulacao Visual" but GSKILL-01/02 requirements were not moved to v2 until audit caught it
- **Traceability table drift:** REQUIREMENTS.md traceability table had wrong phase mappings (VISUAL-01/02 mapped to non-existent Phase 02.4) — discovered only during audit
- **Phase 04 missing VERIFICATION.md:** Only phase without independent verification, caught during audit
- **Performance metrics in STATE.md grew unwieldy:** Two separate table formats accumulated, formatting inconsistent

### Patterns Established
- `--brand-*` CSS variable prefix for client branding (avoids collision with app theme)
- `getChartPalette()` returns hex array (recharts SVG doesn't support CSS vars)
- `maybeSingle()` pattern for Supabase queries that may return null
- Spec template: Props table + Visual Description + Conditional States + Sizing Rules
- Screen recipes with layout hints in block spec index
- Spec-gallery sync convention: component changes must update both spec and gallery

### Key Lessons
1. **Run audit before milestone completion** — the audit caught 2 orphaned requirements and 1 missing verification that would have been silently accepted
2. **Update traceability when repurposing phases** — when a phase scope changes, immediately update REQUIREMENTS.md traceability table
3. **Decimal phases work well for urgent insertions** — 3 phases inserted without renumbering, but require careful traceability maintenance
4. **Pure functions for data pipelines** — resolveConfig as pure function was the right call; easy to test and reason about
5. **Verification per phase is non-negotiable** — Phase 04 skipped it and was the only gap flagged

### Cost Observations
- Model mix: ~70% opus, ~30% sonnet (balanced profile)
- Sessions: multiple (context resets between phases)
- Notable: Average plan execution ~3.5 min; total milestone in 4 calendar days

---

## Milestone: v1.1 — Wireframe Evolution

**Shipped:** 2026-03-10
**Phases:** 5 | **Plans:** 15 | **Timeline:** 2 days

### What Was Built
- Blueprint infrastructure: DB-only storage with Zod validation (21 section discriminated union), schema migration framework, optimistic locking with conflict modal
- Wireframe design system: --wf-* semantic tokens (warm stone grays + gold accent), dark/light mode toggle, client branding overrides isolated from app theme
- Component library expansion: section registry pattern as single source of truth, 6 new block types (settings-page, form-section, filter-config, stat-card, progress-bar, divider), 5 new chart variants (Radar, Treemap, Funnel, Scatter, Area)
- Generic parametric wireframe viewer replacing hardcoded per-client pages
- Structured briefing form with Supabase persistence, blueprint text view with collapsible screens, Markdown export for Claude Code
- AI generation engine: 10 typed screen recipes, 3 vertical templates (financeiro/varejo/servicos), pure function BriefingConfig → BlueprintConfig with CLI bridge

### What Worked
- **Pure function pattern reuse:** generateBlueprint() with zero side effects enabled unit testing without Supabase — same pattern as Config Resolver from v1.0
- **Registry pattern:** Single source of truth for 21 section types replaced 5+ scattered switch statements, making new type addition a 1-file change
- **Wave-based execution:** Phases 9 and 10 ran in parallel (independent dependencies), Phase 11 followed cleanly
- **TDD for generation engine:** Failing tests first → implement → green cycle worked well for screen recipes and generation engine
- **Quick tasks post-milestone:** BriefingConfig evolution and view/edit mode toggle fit naturally as /gsd:quick tasks after phase 11 completed
- **Design system isolation:** --wf-* tokens for wireframes, --brand-* for clients, app tokens for shell — zero collision across 3 layers

### What Was Inefficient
- **No milestone audit:** Skipped /gsd:audit-milestone for v1.1, relying on phase-level verification only
- **Quick task scope:** Quick task 4 (BriefingConfig evolution) was borderline too large for /gsd:quick — 5 new types across 3 files + seed script
- **ROADMAP.md Phase 11 plan checkboxes:** Plans showed as [ ] unchecked in roadmap even though they were complete (cosmetic only)

### Patterns Established
- `color-mix(in srgb)` for semi-transparent backgrounds when Tailwind opacity modifiers don't work with CSS var hex values
- Section registry: type → { renderer, form, defaults, schema, label, category } mapping
- CLI scripts use `process.env` + `npx tsx --env-file .env.local` to avoid Vite `import.meta.env` incompatibility
- `findBestRecipe()` keyword scoring: 5 pts partial, 10 pts exact, 2 pts category bonus
- Vertical templates use inline section data (not recipe composition) for guaranteed Zod compliance
- Briefing view/edit mode: `isEditing` state with ViewField/ViewList helper components for read-only rendering

### Key Lessons
1. **Pure functions are the right default** — every data transformation (generation engine, config resolver, blueprint text extraction) worked well as pure function
2. **Registry pattern scales** — 21 types through one registry is maintainable; should be the pattern for any future discriminated union extensibility
3. **CLI bridge pattern for local AI tools** — standalone Supabase client with process.env is the way to connect CLI scripts to the same DB
4. **Milestone audit recommended even at 100%** — v1.0 audit caught gaps; v1.1 skipped it, which means no independent cross-phase integration check
5. **Quick tasks work well for post-milestone polish** — small improvements that don't warrant a full phase cycle

### Cost Observations
- Model mix: ~80% opus, ~20% sonnet (quality profile)
- Sessions: 1 main session (phases 7-11 + quick tasks + milestone completion)
- Notable: 15 plans in 2 calendar days (~51 min total execution, 3.4 min avg per plan)

---

## Milestone: v1.2 — Visual Redesign

**Shipped:** 2026-03-11
**Phases:** 5 | **Plans:** 7 | **Timeline:** 4 days

### What Was Built
- Design foundation: slate + indigo CSS palette, Inter/JetBrains Mono fonts via @fontsource-variable, 6px scrollbar styling, wireframe --wf-* token isolation verified
- Layout shell: frosted glass sticky header with backdrop-blur, viewport-level scrolling (removed nested overflow containers), input-styled search trigger with Cmd+K badge
- Sidebar navigation: border-l rail with -ml-px overlap trick for indigo-600 active indicator, uppercase section headers, container-level sub-item indentation
- Doc rendering: ChevronRight breadcrumbs, indigo badge pills, text-4xl/5xl titles, dark code blocks with rehype-highlight syntax highlighting and terminal dots, prose typography hierarchy (h2 2xl bold, h3 xl semibold, p base relaxed)
- Right-side TOC: "NESTA PAGINA" heading, IntersectionObserver scroll tracking, border-l rail matching sidebar pattern, sticky top-24 positioning
- Consistency pass: Home page slate+indigo cards, Callout/PromptBlock/InfoBlock switched from blue to indigo palette, client pages breadcrumb nav, auth pages slate-50 backgrounds with brand presence

### What Worked
- **CSS-only approach:** v1.2 was entirely Tailwind class changes — zero component logic modifications, zero new components, zero new hooks
- **Sequential dependency chain:** Phases 12→13→14→15→16 built on each other (palette → layout → sidebar → docs → consistency), preventing rework
- **Parallel plan execution:** Phase 15 (2 plans) and Phase 16 (2 plans) ran plans in parallel within each phase
- **Reference-driven design:** External HTML reference file gave clear target, eliminating design decision overhead
- **Pattern reuse:** border-l rail pattern from Phase 14 sidebar reused in Phase 15 TOC — consistency by design
- **3 packages only:** @fontsource-variable/inter, @fontsource-variable/jetbrains-mono, rehype-highlight — minimal dependency growth

### What Was Inefficient
- **No milestone audit:** Skipped /gsd:audit-milestone for v1.2, same pattern as v1.1
- **Requirements bookkeeping lag:** Phases 12 and 15 completed without checking off their requirements in REQUIREMENTS.md (16/30 unchecked at milestone close)
- **ROADMAP.md plan checkbox drift:** Plans 15-01, 15-02, 16-02 showed as [ ] unchecked in roadmap despite being complete (executor agents didn't update roadmap)
- **Progress table formatting:** ROADMAP.md progress table had column misalignment for phases 13-16 (cosmetic but accumulated)

### Patterns Established
- `page-owns-width`: Layout.tsx delegates max-w to each page instead of wrapping centrally
- Viewport-level scrolling: remove overflow-hidden/overflow-y-auto from Layout containers for proper sticky positioning
- `-ml-px border-l-2` overlap trick: active indicator overlaps container border-l for clean single-pixel transition
- Explicit color tokens: `text-indigo-600` / `border-indigo-600` instead of semantic tokens for active states
- Terminal dots pre wrapper: outer div owns bg + rounded corners, inner pre scrolls
- `.hljs { background: transparent }` override: wrapper div controls code block background, not highlight.js
- Inline code scoping: `.prose :not(pre) > code` avoids styling code inside syntax-highlighted blocks

### Key Lessons
1. **CSS-only milestones are fast** — 7 plans in 4 days with zero logic changes, zero test failures, zero type errors
2. **Sequential phase chains prevent rework** — each phase built cleanly on the previous, no backtracking needed
3. **Requirements checkboxes need automation** — manual checkbox maintenance drifts; consider executor agents updating REQUIREMENTS.md on plan completion
4. **Reference-driven design eliminates decision fatigue** — external HTML target meant zero time debating colors, fonts, or spacing
5. **Border-l rail is the universal nav pattern** — works for sidebar, TOC, and potentially future navigation elements

### Cost Observations
- Model mix: ~60% opus, ~40% sonnet (balanced profile, sonnet for executors)
- Sessions: 2 main sessions (phases 12-14 + 15-16 with planning/execution)
- Notable: 7 plans in ~4 days; fastest milestone per-plan (~15 min avg including planning overhead)

---

## Milestone: v1.3 — Builder & Components

**Shipped:** 2026-03-11
**Phases:** 5 | **Plans:** 14 | **Timeline:** 1 day

### What Was Built
- Schema foundation: SidebarConfig/HeaderConfig at dashboard level in BlueprintConfig, FilterOption.filterType discriminator
- Configurable sidebar: collapse rail, grouped sections with icons, badge counts, footer driven by config
- Configurable header: logo/brand slot, period selector, user/role indicator, action buttons
- Filter bar expansion: 5 filter sub-components (Select, DateRange, MultiSelect, Search, Toggle)
- Chart type expansion: 6 new variants (stacked-bar, stacked-area, horizontal-bar, bubble, gauge, composed)
- Gallery reorganized into 6 thematic sections with all new component previews

### What Worked
- **Schema-first approach:** Defining types and Zod schemas before UI components prevented rework
- **Discriminated union for filters:** filterType dispatch cleanly separates 5 filter behaviors
- **GaugeChart creative solution:** PieChart arcs for zones + absolute SVG needle — avoided custom SVG path math
- **Gallery as validation:** Reorganized gallery served as visual smoke test for all new components

### What Was Inefficient
- **No formal REQUIREMENTS.md:** Requirements tracked inline in ROADMAP phase goals, no traceability table
- **No milestone audit:** Third consecutive milestone without audit
- **14 plans in 1 day:** Very fast execution but no verification pause between phases

### Patterns Established
- `filterType` discriminator pattern: union type → dispatch → specialized sub-component
- Zod `.passthrough()` for forward-compatible schema evolution
- Gallery sections as visual validation surface for new components

### Key Lessons
1. **Schema-first pays off** — v1.3 was the fastest milestone (14 plans, 1 day) because types were defined first
2. **Discriminated unions scale** — filterType + section type registries both follow the same pattern
3. **Gallery is a validation tool** — reorganizing the gallery caught visual issues before shipping

### Cost Observations
- Model mix: ~60% opus, ~40% sonnet (balanced profile)
- Sessions: 1 main session
- Notable: 14 plans in 1 day — fastest milestone by calendar time

---

## Milestone: v1.4 — Wireframe Visual Redesign

**Shipped:** 2026-03-13
**Phases:** 7 | **Plans:** 12 | **Timeline:** 2 days

### What Was Built
- Token foundation: slate + blue palette replacing stone/gold, --wf-primary as canonical accent, branding override pipeline with WireframeThemeProvider
- Dark sidebar chrome with active/hover states, group labels, status footer
- White 3-column header with search, notifications, and user chip
- KPI cards with icon slot, group-hover color inversion, rounded-full trend badges
- Table headers with text-[10px] font-black uppercase tracking-widest, dark footer totals row
- Filter bar with backdrop-blur-sm sticky container, vertical stacked labels, action button hierarchy
- Chart palette blue-slate across all 15 components, activeBar opacity hover, CompositionBar

### What Worked
- **Token cascade:** Changing ~20 CSS tokens in Phase 22 propagated to ~55 components automatically
- **Independent phases:** Phases 23-27 all depended only on Phase 22, enabling parallel planning
- **HTML reference:** Same reference-driven approach as v1.2, eliminating visual design decisions
- **CompositionBar as pure HTML/CSS:** No Recharts dependency for horizontal stacked bar — simpler, lighter
- **Gallery validation as milestone gate:** Phase 28 visual check + TS audit confirmed everything before v1.5

### What Was Inefficient
- **No formal REQUIREMENTS.md:** Like v1.3, requirements inline in ROADMAP success criteria only
- **ROADMAP plan checkbox drift continued:** Some plans showed [ ] unchecked despite being complete
- **No milestone audit:** Fourth consecutive skip

### Patterns Established
- `brandingToWfOverrides()` → `WireframeThemeProvider wfOverrides` — clean injection point for client branding
- `color-mix(in srgb, var(--wf-token), transparent)` for all semi-transparent fills
- Dark sidebar always (`#0f172a` in both light and dark themes)
- `group-hover` for card icon color inversion (primary/10 → solid primary)

### Key Lessons
1. **Token cascade is powerful** — investing in Phase 22 foundation made Phases 23-27 almost mechanical
2. **Independent phases enable fast parallel execution** — 5 phases sharing only Phase 22 dependency
3. **Gallery-as-gate works** — Phase 28 visual validation caught no issues, but the confidence it provides justifies the phase

### Cost Observations
- Model mix: ~60% opus, ~40% sonnet (balanced profile)
- Sessions: 2 sessions
- Notable: 12 plans in 2 days, token cascade approach saved significant per-component effort

---

## Milestone: v1.5 — Modular Foundation & Knowledge Base

**Shipped:** 2026-03-13
**Phases:** 5 | **Plans:** 14 | **Timeline:** 1 day

### What Was Built
- Module registry: ModuleManifest type + MODULE_REGISTRY driving sidebar, routing, and home page — eliminated 126-line hardcoded nav array
- Supabase migrations: knowledge_entries (tsvector/GIN FTS, Portuguese) and tasks (status/priority CHECK)
- Knowledge Base module: list/detail/form/search pages, 4 entry types, ADR template for decisions, Cmd+K integration
- Task Management module: list/kanban/form, optimistic status updates, DocumentarButton cross-module KB link
- Home page rewrite: MODULE_REGISTRY grid + useActivityFeed hook with parallel Supabase queries

### What Worked
- **Module manifest pattern:** Static typed constant scales cleanly — sidebar, routing, home all read from one source
- **Migration-first approach:** Phases 30 (DB) → 31/32 (UI) ensured stable data layer before building UI
- **Service layer isolation:** Each module uses its own service file — no cross-module Supabase imports
- **Cross-module linking:** DocumentarButton (tasks → KB) and Conhecimento section (client → KB) work via URL navigation, not component imports
- **Wave 0 test stubs:** Establishing test structure before implementation kept testing top-of-mind
- **Formal REQUIREMENTS.md:** First milestone since v1.2 with proper requirements doc — 19/19 tracked and shipped

### What Was Inefficient
- **No milestone audit:** Fifth consecutive skip — at this point it's a conscious tradeoff (speed vs verification)
- **Service file placement:** Files placed in src/lib/ in Phase 30, moved to module folders in Phases 31/32 — could have placed correctly from start
- **vi.hoisted() discovery:** Required investigation; should be documented for future vitest mock patterns

### Patterns Established
- `ModuleManifest` type: { id, label, icon, route, navChildren, status }
- Service layer per module: `src/lib/[name]-service.ts` with typed CRUD exports
- Optimistic updates: local useState synced from hook, immediate update, refetch on error
- Cross-module navigation via URL params (not component imports)
- `it.todo()` wave 0 stubs for early test structure

### Key Lessons
1. **Module registry eliminates hardcoded nav** — single source of truth for 5 modules scales to N
2. **Migration-first is correct for new features** — v1.5 had zero data layer bugs because DB was proven before UI
3. **Formal REQUIREMENTS.md matters** — 19/19 requirements tracked made milestone completion unambiguous
4. **Cross-module links via URL** — decoupled modules can reference each other without import dependencies

### Cost Observations
- Model mix: ~50% opus, ~50% sonnet (balanced profile, more sonnet for executor agents)
- Sessions: 1 main session
- Notable: 14 plans in 1 day — matched v1.3's pace but with formal requirements and more complex features

---

## Milestone: v1.6 — 12 Novos Graficos

**Shipped:** 2026-03-13
**Phases:** 4 | **Plans:** 7 | **Timeline:** 1 day

### What Was Built
- 7 chartType sub-variants via Extension Point A: Grouped Bar, Bullet, Step Line, Lollipop, Range Bar, Bump, Polar
- 4 standalone section types via Extension Point B: Pie Chart, Progress Grid, Heatmap, Sparkline Grid
- Sankey diagram as 28th standalone section type with Recharts Sankey export verification
- ComponentGallery updated with all 12 new types and realistic Brazilian Portuguese mock data
- Visual validation of all 12 types in light/dark mode

### What Worked
- **Extension Point A/B pattern:** Clear distinction between chartType sub-variants (4-point sync) and standalone sections (5-file checklist) enabled parallel agent execution
- **Wave-based grouping:** Waves 1-3 organized by complexity and dependency, enabling clean sequential execution
- **Recharts export verification:** Verifying Sankey named export before writing component prevented wasted effort
- **Registry count as gate:** section-registry.test.ts count assertion (23→28) served as automatic verification
- **CSS-flex for Range Bar:** Avoided Recharts workaround for non-zero-start bars, consistent with existing CompositionBar pattern
- **Formal REQUIREMENTS.md:** 18/18 requirements tracked with traceability table

### What Was Inefficient
- **SUMMARY.md files not created during execution:** All 7 plans executed successfully but no SUMMARY.md files were written — had to be backfilled during milestone completion
- **No milestone audit:** Sixth consecutive skip
- **STATE.md / ROADMAP.md already marked complete but GSD tooling showed 0%:** Disconnect between manual status updates and GSD's file-based completion detection (summaries)

### Patterns Established
- Extension Point A: 4-point atomic sync (type union, Zod enum, ChartRenderer case, leaf component)
- Extension Point B: 5-file checklist (type, Zod schema, renderer, property form, registry entry)
- Recharts export verification before component implementation
- CSS-flex for chart-like components that don't fit Recharts paradigm (Range Bar, CompositionBar, Progress Grid)

### Key Lessons
1. **SUMMARY.md is the completion signal** — GSD tooling uses SUMMARY.md existence to track progress, not ROADMAP.md checkboxes or STATE.md fields
2. **Extension Point patterns reduce cognitive load** — once established, adding a new chart is mechanical (follow the checklist)
3. **CSS-flex is valid for non-standard charts** — Range Bar and Progress Grid work better without Recharts overhead
4. **Mock data quality matters** — Brazilian Portuguese financial data in the gallery makes components feel real and production-ready

### Cost Observations
- Model mix: ~50% opus, ~50% sonnet (balanced profile)
- Sessions: 1 main session
- Notable: 7 plans, 12 new chart/section types, 2,363 lines added in 1 day

---

## Milestone: v2.0 — Framework Shell + Arquitetura Modular

**Shipped:** 2026-03-13
**Phases:** 5 | **Plans:** 8 | **Timeline:** 1 session

### What Was Built
- Module Registry Foundation: zero-import module-ids.ts constants, ModuleDefinition type extending ModuleManifest, useModuleEnabled hook with localStorage persistence
- Slot Architecture: SlotComponentProps, SLOT_IDS, resolveExtensions() pure function, ExtensionProvider/ExtensionSlot React runtime
- Routing Refactor: sidebar driven by enabled modules via useModuleEnabled context, Home NavLink end prop exact-match fix
- Home 2.0: asymmetric 2/3+1/3 layout with featured module card, FXL identity card, Supabase-backed activity feed and module stats
- Contract Population: RecentTasksWidget and RecentKBWidget rendering via slot injection end-to-end
- Admin Panel: /admin/modules with enable/disable toggles, extension visibility, and toast feedback

### What Worked
- **Zero-import constants pattern:** module-ids.ts with zero import statements prevents circular dependency — all manifests safely import MODULE_IDS
- **Type-first approach:** SlotComponentProps defined before any extension widget prevented ComponentType<any> in entire slot pipeline
- **Pure function reuse:** resolveExtensions() follows same pattern as Config Resolver (v1.0), generateBlueprint (v1.1) — zero React runtime, fully testable
- **Provider nesting order:** BrowserRouter > ModuleEnabledProvider > ExtensionProvider > Routes — single source of truth, no localStorage duplication
- **Parallel execution of plans 42-01 and 42-02:** Independent file sets (widgets vs admin panel) ran in parallel without conflicts
- **All 5 phase verifications passed:** 38 (7/7), 39 (8/8), 40 (5/5), 41 (10/10), 42 (8/8) — 38/38 must-haves verified

### What Was Inefficient
- **No milestone audit:** Seventh consecutive skip, but all phase-level verifications passed
- **STATE.md drift during parallel execution:** STATE.md showed 75% while all phases were actually complete — parallel agents updated concurrently
- **Summary one_liner fields missing:** summary-extract couldn't find one_liners because executor agents used different summary format

### Patterns Established
- Zero-import constants file for preventing circular dependencies in registry architectures
- Provider nesting order for React context chains: outermost = router, then state, then derived state
- ExtensionSlot returning null (not empty fragment) when no extensions registered — allows conditional layout
- Static admin routes outside MODULE_REGISTRY for internal tooling pages
- localStorage synchronous initializer in useState for zero-flash module toggle state

### Key Lessons
1. **Type contracts before implementations** — defining SlotComponentProps and ModuleExtension types before building widgets ensured zero any in the entire extension pipeline
2. **Pure function pattern confirmed for 4th time** — resolveExtensions, Config Resolver, generateBlueprint, mergeAndSort all benefit from zero side effects
3. **Provider nesting order matters** — getting it right once (Phase 39) avoided refactoring in Phases 40-42
4. **Parallel plan execution works when file sets are independent** — 42-01 (widgets + manifests) and 42-02 (admin page + App.tsx) ran clean
5. **Phase-level verification is sufficient** — 38/38 must-haves verified across 5 phases without a formal milestone audit

### Cost Observations
- Model mix: ~30% opus (orchestrator), ~70% sonnet (executors + verifiers)
- Sessions: 1 session, all 5 phases executed sequentially with auto-continue
- Notable: 8 plans, 26 commits, 3,089 LOC added in single continuous session (~52 min)

---

## Milestone: v2.1 — Dynamic Data Layer

**Shipped:** 2026-03-13
**Phases:** 4 | **Plans:** 8 | **Timeline:** 1 session

### What Was Built
- Supabase `documents` table (migration 007) with B-tree indexes on parent_path/sort_order and anon-permissive RLS
- Seed script migrating all 62 docs from filesystem to Supabase with YAML frontmatter extraction, custom tag preservation, and 15-point automated verification
- DocRenderer + sidebar nav + search index all consuming Supabase data — zero Vite glob dependency remaining
- Bidirectional sync CLI: `make sync-down` (DB→.md) and `make sync-up` (.md→DB) with YAML frontmatter reconstruction
- In-memory prefetch cache (quick-14) for instant doc navigation after first load

### What Worked
- **Migration-first pattern continued:** Phase 43 (schema) → 44 (data) → 45 (UI) → 46 (CLI) — same pattern as v1.5, zero data layer bugs
- **Verification scripts:** 15-point automated verification in verify-seed.ts replaced manual Supabase Dashboard checking
- **Data access layer pattern:** docs-service.ts + useDoc hook + DocRenderer page — clean separation of concerns
- **Formal REQUIREMENTS.md:** 15/15 requirements tracked with traceability table from roadmap creation
- **Lazy search index:** Loading on first Cmd+K open avoided blocking page load
- **Quick task for optimization:** Prefetch cache as quick-14 fit naturally after milestone phases completed

### What Was Inefficient
- **No milestone audit:** Eighth consecutive skip — all phase verifications passed but no cross-phase integration check
- **Requirements traceability table never updated to Complete:** All 15 requirements show "Pending" despite all phases being complete — same drift pattern as v1.0/v1.2
- **STATE.md showed 0% despite 100% completion:** GSD tooling calculated 0% because STATE.md progress wasn't updated during execution

### Patterns Established
- `docs-service.ts` + `useDoc.ts` hook — data access layer for Supabase-backed content
- `useDocsNav.ts` — dynamic sidebar navigation override per module
- `sync-down` additive-only approach (doesn't delete local files absent from DB)
- `lineWidth: 0` in YAML stringify for consistent frontmatter output
- In-memory prefetch cache for small, stable datasets (~62 docs)

### Key Lessons
1. **Migration-first is confirmed as the right approach** — 3rd time (v1.5, v2.0, v2.1) following schema→data→UI→tooling sequence with zero data layer issues
2. **Requirements traceability needs automation** — 3 milestones now (v1.0, v1.2, v2.1) with unchecked requirements despite completion
3. **Verification scripts > manual checks** — 15-point automated verification is more reliable and reproducible than Dashboard screenshots
4. **Sync CLI is a reusable pattern** — DB→filesystem export + filesystem→DB upsert pattern applies to any Supabase-backed content
5. **Quick tasks complement milestones** — prefetch cache (quick-14) was the right scope for post-milestone optimization

### Cost Observations
- Model mix: ~40% opus (orchestrator), ~60% sonnet (executors)
- Sessions: 1 session, all 4 phases executed sequentially
- Notable: 8 plans, 25 commits, 1,024 LOC added in single session; smallest LOC delta milestone but highest impact (data layer migration)

---

## Milestone: v2.2 — Wireframe Builder — Configurable Layout Components

**Shipped:** 2026-03-13
**Phases:** 7 | **Plans:** 7 | **Timeline:** 1 session

### What Was Built
- SidebarWidget discriminated union (TypeScript + Zod) with backward-compatible schema extension
- All HeaderConfig fields wired to conditional rendering in WireframeHeader across 4 call sites
- Dashboard-level mutation infrastructure: updateWorkingConfig() + AdminToolbar Layout button group
- HeaderConfigPanel with live preview: toggles, brandLabel input, periodType select (mensal/anual)
- SIDEBAR_WIDGET_REGISTRY + WorkspaceSwitcher + UserMenu widgets with rail mode degradation
- SidebarConfigPanel: footer text, group CRUD, screen assignment, widget picker
- FilterBarEditor: per-screen FilterOption[] CRUD with 5 BI presets

### What Worked
- **Schema-first confirmed again:** Phase 47 (types + Zod) enabled all downstream phases to compile against real types from day one
- **1-plan-per-phase simplicity:** 7 phases × 1 plan each = clean sequential execution, zero wave complexity
- **updateWorkingConfig pattern:** Reusing the same functional-update + dirty-flag pattern from updateWorkingScreen made all panels consistent
- **Formal REQUIREMENTS.md:** 19/19 requirements tracked from roadmap creation, all traceability rows marked Complete
- **Sequential execution with auto-continue:** 7 phases executed in one session without manual intervention

### What Was Inefficient
- **Sheet panel UX mismatch:** Built 3 Sheet panels (Header, Sidebar, Filters) that break the existing click-to-edit pattern — user feedback says inline editing is the right UX. These panels will be replaced in v2.3.
- **AdminToolbar Layout buttons unnecessary:** Adding Sidebar/Header/Filtros buttons created a second interaction model when the codebase already has click-to-select
- **No milestone audit:** Ninth consecutive skip — phase-level verification sufficient but cross-phase integration untested
- **SUMMARY.md one_liner field missing:** summary-extract returned null for all 7 plans — executor agents used different summary format

### Patterns Established
- `updateWorkingConfig()` for dashboard-level mutations (sidebar, header) vs `updateWorkingScreen()` for screen-level (filters, rows)
- `SIDEBAR_WIDGET_REGISTRY` with zone/icon/defaultProps() for extensible widget system
- Functional updater pattern `onUpdate((prev) => ({...prev, field: value}))` for nested config mutations
- `.passthrough()` on Zod schemas for forward-compatible config objects

### Key Lessons
1. **UX consistency beats feature completeness** — Sheet panels work functionally but break the click-to-edit pattern established for content blocks. v2.3 will replace them with inline editing.
2. **Schema-first is now a verified pattern for 5th time** — Phase 47 types → all other phases compiled cleanly
3. **1-plan-per-phase is optimal for sequential execution** — zero wave complexity, clean dependency chain
4. **User feedback should come before building config UI** — the Sheet panel approach was architecturally clean but UX-wrong; should have validated the interaction model with the user first

### Cost Observations
- Model mix: ~20% opus (orchestrator), ~80% sonnet (executors + verifiers)
- Sessions: 1 session, all 7 phases executed sequentially with auto-continue
- Notable: 7 plans, 28 commits, 3,398 LOC added; ~43 min total execution across 7 phases

---

## Milestone: v2.3 — Inline Editing UX

**Shipped:** 2026-03-13
**Phases:** 4 | **Plans:** 7 | **Timeline:** 1 session

### What Was Built
- Header inline editing: 4 clickable zones (logo, period, user, actions) with ZoneWrapper pattern and per-element PropertyPanel forms via header form registry
- Sidebar inline editing: clickable groups, footer, widgets with SidebarPropertyPanel routing to 3 specialized forms (SidebarGroupForm, SidebarFooterForm, SidebarWidgetForm)
- Filter inline editing: clickable filter chips with FilterPropertyPanel, "+" button with 5 BI preset picker, delete buttons on chips
- Five-way selection mutex: header, sidebar, filter, filter-bar-action, and content block selections are mutually exclusive
- Cleanup: deleted HeaderConfigPanel, SidebarConfigPanel, FilterBarEditor (903 lines), removed AdminToolbar Layout buttons and layoutPanel state

### What Worked
- **Per-element form extraction pattern:** Each section of the old Sheet panel became a standalone form component → registry lookup → PropertyPanel renders the right form. Clean, extensible, reusable.
- **Selection mutex progression:** Two-way (54) → three-way (55) → four-way (56) → five-way (final). Each phase extended the mutex without breaking previous selections.
- **Cleanup as final phase:** Phase 57 was pure deletion — no new features, just removing the old code that was replaced. Clean separation of "build new" and "remove old."
- **Formal REQUIREMENTS.md:** 14/14 requirements tracked with traceability table — all mapped, all checked, zero orphans.
- **First milestone audit:** First time running `/gsd:audit-milestone` since v1.0. Integration checker verified cross-phase wiring and selection mutex completeness.

### What Was Inefficient
- **No VERIFICATION.md files:** All 4 phases lacked VERIFICATION.md — verified via SUMMARY + tsc only. Process gap.
- **Phase 56 SUMMARY frontmatter incomplete:** `requirements-completed` field missing from 56-01 and 56-02 SUMMARY files.
- **FILT-10 visual gap:** selectedFilterIndex not passed to WireframeFilterBar — filter chips lack selection ring when editing. Functional but inconsistent with header/sidebar patterns.
- **Quick task 15 scope creep:** Post-milestone quick task (sidebar editor groups/context menus/pin support) was large enough to be a phase — 4 commits, 3 rounds of user feedback.

### Patterns Established
- `ZoneWrapper` component: reusable clickable zone with hover/selected/placeholder states for edit mode
- Per-element form registry: `Record<ElementType, { form, label }>` with `getForm()` and `getLabel()` lookups
- Selection mutex pattern: each new selection type clears all others, with screen navigation clearing all
- Click-to-edit as only editing paradigm: no toolbar shortcuts, operators click directly on components
- `SidebarElementSelection` discriminated union: `{ type: 'group' | 'footer' | 'widget', ...}` for sidebar element targeting

### Key Lessons
1. **Build new before removing old** — Phases 54-56 built inline editing alongside existing Sheet panels; Phase 57 removed old code only after new code was proven. Safe migration path.
2. **Selection mutex is manageable at 5-way** — five independent selection types with symmetric clearing handlers works cleanly. Beyond 5 might need a different approach.
3. **Audit milestone catches gaps** — the integration checker found the FILT-10 visual gap and the orphaned HEADER_ELEMENT_TYPES export that would have been missed otherwise.
4. **Quick tasks can exceed scope** — Quick task 15 (sidebar editor improvements) was really a mini-phase; should have been planned as a phase or at least used `--full` flag.
5. **Dual-state rendering is a must** — sidebar changes must work in both edit mode AND view mode. Bug found where pinned-bottom screens only showed in edit mode. Saved as feedback memory for future conversations.

### Cost Observations
- Model mix: ~30% opus (orchestrator), ~70% sonnet (executors)
- Sessions: 1 session, all 4 phases executed sequentially with auto-continue + 1 quick task session
- Notable: 7 plans, 11 commits, 2,557 LOC added / 1,218 removed; 19 min total execution (~2.7 min avg per plan — fastest milestone)

---

## Milestone: v2.4 — Component Picker Preview Mode

**Shipped:** 2026-03-14
**Phases:** 2 | **Plans:** 4 | **Timeline:** 1 session

### What Was Built
- Hardened defaultProps for all 28 section types with complete, Zod-valid sample data for visual rendering (6 previously empty types enriched, 17 renderability tests)
- SectionPreview component rendering any section type as scaled-down mini-preview using registry defaultProps + WireframeThemeProvider
- SectionPreviewCard with 25% CSS scale mini-previews, error boundary isolation, and usePickerMode hook with sessionStorage persistence
- ComponentPicker dual-mode: preview grid (2-3 columns, max-w-4xl) + compact list toggle with category separators preserved

### What Worked
- **Registry defaultProps as single source of preview data:** Each section type's defaultProps() already provided Zod-valid sample data — enriching 6 types was sufficient for all 28 to render
- **CSS scale-transform for faithful mini-previews:** Rendering at full width then scaling down (0.25x/0.35x) preserves exact layout rather than responsive re-layout
- **Error boundary per preview card:** Class component ErrorBoundary isolates any section render failure to its card without crashing the picker dialog
- **Mode-conditional rendering within shared category loop:** DRY approach — one catalog.map loop with ternary for preview vs compact rendering
- **First milestone with audit before completion:** Integration checker traced complete E2E flow and confirmed all 8 requirements wired

### What Was Inefficient
- **SectionPreview.tsx orphaned:** Phase 58-02 created SectionPreview as its primary deliverable, but Phase 59-01's SectionPreviewCard reimplemented the same pattern directly rather than wrapping it. Dead asset in production.
- **No VERIFICATION.md or VALIDATION.md files:** Both phases lack formal verification artifacts — requirements confirmed via SUMMARY + integration tracing as compensating evidence
- **Visual verification pending:** Plan 59-02 Task 2 (human checkpoint for visual verification) noted as needing manual verification but not formally completed

### Patterns Established
- Scale-transform preview: render at full width (800px/540px) and scale via CSS transform/zoom for faithful miniature rendering
- External theme isolation: `WireframeThemeProvider externalTheme` prop for contexts that should not read/write localStorage
- sessionStorage persistence for transient UI state (picker mode) that should survive dialog close but not browser restart
- Class component ErrorBoundary for preview isolation — lightweight, no React 19 dependency

### Key Lessons
1. **Audit before completion is validated again** — integration checker found the SectionPreview orphan and confirmed all E2E wiring that wouldn't have been verified otherwise
2. **Delegate to existing infrastructure when possible** — SectionPreviewCard should have wrapped SectionPreview instead of reimplementing, avoiding dead code
3. **defaultProps as preview data source is elegant** — no new data fixtures needed, registry already has the data
4. **CSS scale-transform is the right approach for mini-previews** — responsive re-layout would change component appearance

### Cost Observations
- Model mix: ~30% opus (orchestrator + audit), ~70% sonnet (executors + integration checker)
- Sessions: 1 session (all 4 plans + audit + milestone completion)
- Notable: 4 plans, 4 commits, 514 LOC added in ~29 min total execution (~7 min avg per plan)

---

## Milestone: v4.3 — Admin Polish & Custom Auth

**Shipped:** 2026-03-17
**Phases:** 4 | **Plans:** 8 | **Timeline:** 1 day

### What Was Built
- Custom Nexo login page with Google OAuth + email/password (replacing default Clerk SignIn)
- ProtectedRoute fix eliminating infinite loading for unauthenticated users
- admin-tenants edge function fix (include_members_count=true for accurate org counts)
- New admin-users edge function proxying Clerk Users API with super_admin auth
- AdminDashboard refactored from Clerk hooks to edge function data (shows ALL orgs/users)
- /admin/users page with user list, org membership badges, and date display
- TenantDetailPage "Membros" section with role badges via edge function

### What Worked
- **Parallel tracks:** AUTH (Phase 85) and ADMIN (86-87) executed independently as designed
- **Edge function pattern reuse:** Phase 86 established patterns cleanly reused in Phase 87 (members endpoint, expanded user data)
- **Autorun workflow:** First use of /gsd:autorun correctly identified parallelizable phases and wave structure
- **Prior session work detected:** Autorun/executor agents correctly detected already-completed work instead of re-executing

### What Was Inefficient
- **Bookkeeping gaps:** REQUIREMENTS.md checkboxes never updated during execution (14/16 unchecked despite all work done)
- **Missing VERIFICATION.md:** Phases 85-87 had no formal verification files — work verified via code evidence during audit
- **SUMMARY frontmatter incomplete:** No `requirements_completed` tags in any summary — convention not enforced during this milestone
- **Roadmap staleness:** Phase 85 was complete on disk but roadmap checkbox was unchecked — autorun had to detect and fix

### Patterns Established
- admin-service.ts as separate service from tenant-service.ts for clean user vs tenant separation
- Edge function members endpoint grouped under admin-tenants (org-scoped, not user-scoped)
- useSignIn from @clerk/react/legacy for custom auth flows in Clerk v6 Core 2

### Key Lessons
- **Autorun detects stale state:** /gsd:autorun correctly identified Phase 85 as already done and Phase 86 as the only remaining work
- **Formal verification matters:** Audit had to use code evidence because VERIFICATION.md was missing — adds overhead to audit step
- **Bookkeeping automation needed:** Manual checkbox updates in REQUIREMENTS.md and ROADMAP.md are unreliable — should be automated by executor

### Post-Ship Bugs (corrigidos em sessao de debug)

7 bugs encontrados e corrigidos apos o deploy do v4.3. Todos documentados em `.planning/PITFALLS.md` com regras derivadas:

1. **Promise.all mascarando falhas** — Dashboard mostrava 0/0/0 porque `Promise.all` falhava inteiro quando `admin-users` nao estava deployada
2. **Edge function nao deployada** — `admin-users` existia no repo mas nunca foi deployada; CORS error era o sintoma
3. **Formato Clerk API inconsistente** — `/v1/users` retorna array plano, codigo esperava `{ data: [] }`
4. **Clerk /v1/users sem org memberships** — campo nao vem por padrao; reescrita para fetch separado por org
5. **Sub-path removido pelo gateway Supabase** — `/admin-tenants/{orgId}/members` roteava para `handleGetOrg`; fix: query param `?include=members`
6. **Null safety ausente** — `data.members` undefined causava tela branca; fix: `?? []`
7. **Card de contagem desatualizado** — `tenant.membersCount` mostrava 0 enquanto lista mostrava membros; fix: usar `members.length` quando carregado

### Cost Observations
- Model mix: ~80% sonnet (agents), ~20% opus (orchestrator)
- Sessions: 1 (autorun + audit + complete in single session)
- Notable: Most v4.3 code was already written in prior sessions; this session was primarily verification and archival

## Milestone: v5.3 — UX Polish

**Shipped:** 2026-03-18
**Phases:** 7 | **Plans:** 13

### What Was Built
- Multi-tenancy data isolation: tasks, clients, blueprints scoped by org_id with RLS
- Data recovery migration (017) idempotently re-associating existing rows from placeholder org to real FXL org
- Header UX overhaul: UserMenu with avatar/dropdown/logout, ADMIN amber badge, "Nexo" brand (FXL-CORE removed)
- Admin member management: add/remove org members via TenantDetailPage + admin-tenants edge function
- Admin org impersonation: ImpersonationContext + ImpersonationBanner (amber banner with exit)
- Gap closure audit: Phases 109-111 formally verified DATA-03/DATA-04/ADMN-01/ADMN-02/ARCH-01/ARCH-02

### What Worked
- **Gap closure phase pattern:** Phases 109-111 were lightweight verification-only phases that closed audit gaps without reopening completed work — clean, traceable pattern
- **Blueprint RLS already correct:** Phase 109 discovered DATA-03 was satisfied since migration 013 — audit found the evidence, no code change needed
- **ImpersonationContext pattern:** State-based impersonation via React context + amber banner is clear UX — no URL pollution, easy to exit
- **13 plans across 7 phases shipped cleanly:** tsc --noEmit 0 errors throughout the entire milestone

### What Was Inefficient
- **Initial audit found 6 unsatisfied requirements:** Verification documentation was not produced during Phase 108 execution — VERIFICATION.md and REQUIREMENTS.md checkbox updates were deferred, creating audit debt
- **Three extra phases for audit closure:** Phases 109, 110, 111 were entirely documentation/audit work. If verification artifacts had been produced during execution, the milestone would have been 4 phases, not 7
- **REQUIREMENTS.md checkboxes unchecked throughout:** All 12 requirements remained `[ ]` until Phase 111 — checkboxes should be updated in the same commit as the verification artifact

### Patterns Established
- **Verification artifact = delivery gate:** Phase must produce VERIFICATION.md + update REQUIREMENTS.md traceability at completion, not retroactively
- **Audit = discovery, not creation:** Audit phase should find evidence already documented in VERIFICATION.md, not create new evidence
- **RLS audit as verification:** When RLS policy is claimed to be in place, the verification artifact should include `pg_policies` query output as evidence

### Key Lessons
1. **Complete VERIFICATION.md in the same session as execution** — retrofitting verification creates 1-3 extra phases of audit debt
2. **Mark REQUIREMENTS.md checkboxes in the same commit as VERIFICATION.md** — leaving them unchecked signals work is incomplete when it isn't
3. **Database policies should be re-audited, not assumed** — Phase 109 discovered the policy was already correct from migration 013; earlier auditing would have avoided the deferred gap
4. **Gap closure phases have predictable structure:** audit SQL + tsc + VERIFICATION.md + REQUIREMENTS.md update = 1 plan, ~30 min each

### Cost Observations
- Model mix: ~100% sonnet (all phases including orchestration)
- Sessions: 1 (phases 105-111 + audit + complete in sequence)
- Notable: 3 of 7 phases were audit/documentation work that could have been eliminated with better verification hygiene during execution phases

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Plans | Key Change |
|-----------|----------|--------|-------|------------|
| v1.0 | 4 days | 9 | 27 | First milestone — established GSD workflow, decimal phases, audit process |
| v1.1 | 2 days | 5 | 15 | Parallel phase execution, TDD for engine, quick tasks for post-phase polish |
| v1.2 | 4 days | 5 | 7 | CSS-only milestone, sequential dependency chain, reference-driven design |
| v1.3 | 1 day | 5 | 14 | Schema-first approach, filterType discriminator, gallery as validation |
| v1.4 | 2 days | 7 | 12 | Token cascade, independent phases, HTML reference-driven |
| v1.5 | 1 day | 5 | 14 | Module registry, migration-first, formal REQUIREMENTS.md return |
| v1.6 | 1 day | 4 | 7 | Extension Point A/B patterns, wave-based grouping, 12 new types |
| v2.0 | 1 session | 5 | 8 | Framework shell, slot architecture, cross-module extensions, admin panel |
| v2.1 | 1 session | 4 | 8 | Dynamic data layer, Supabase-backed docs, bidirectional sync CLI |
| v2.2 | 1 session | 7 | 7 | Configurable layout components, widget system, Sheet panels (to be replaced by inline editing) |
| v2.3 | 1 session | 4 | 7 | Inline click-to-edit replacing Sheet panels, five-way selection mutex, per-element form registry |
| v2.4 | 1 session | 2 | 4 | Component Picker dual-mode preview, scale-transform mini-renders, defaultProps as preview data |
| v4.3 | 1 day | 4 | 8 | Custom auth, edge function data layer, autorun parallel execution, admin users management |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | Vitest (Phase 06) | spec-generator only | 3 (recharts, @supabase/supabase-js, @clerk/react) |
| v1.1 | 237 tests | generation engine + schemas + recipes | 1 (zod v4) |
| v1.2 | 237 tests | no new tests (CSS-only) | 3 (@fontsource-variable/inter, @fontsource-variable/jetbrains-mono, rehype-highlight) |
| v1.3 | 237 tests | no new tests (schema + UI) | 0 |
| v1.4 | 237 tests | no new tests (CSS + visual) | 0 |
| v1.5 | ~270 tests | KB hooks, home merge/sort, search cmd | 0 |
| v1.6 | ~270 tests | section-registry count assertion (28) | 0 |
| v2.0 | ~270 tests | no new tests (types + UI) | 0 |
| v2.1 | ~270 tests | no new tests (data layer + CLI) | 0 |
| v2.2 | ~283 tests | 13 new schema tests (SidebarWidget Zod) | 1 (@radix-ui/react-checkbox via shadcn) |
| v2.3 | ~283 tests | no new tests (UI refactor) | 1 (@radix-ui/react-context-menu via shadcn) |
| v2.4 | ~316 tests | 33 new (SectionPreview 33 + renderability 17) | 0 |
| v4.3 | ~316 tests | no new tests (edge functions + UI) | 0 |

### Velocity

| Milestone | Plans | Total Execution | Avg/Plan |
|-----------|-------|-----------------|----------|
| v1.0 | 27 | ~95 min | ~3.5 min |
| v1.1 | 15 | ~51 min | ~3.4 min |
| v1.2 | 7 | ~105 min | ~15 min |
| v1.3 | 14 | ~210 min | ~15 min |
| v1.4 | 12 | ~180 min | ~15 min |
| v1.5 | 14 | ~210 min | ~15 min |
| v1.6 | 7 | ~60 min | ~8.5 min |
| v2.0 | 8 | ~52 min | ~6.5 min |
| v2.1 | 8 | ~45 min | ~5.5 min |
| v2.2 | 7 | ~43 min | ~6.1 min |
| v2.3 | 7 | ~19 min | ~2.7 min |
| v2.4 | 4 | ~29 min | ~7.3 min |
| v4.3 | 8 | ~5 min | ~0.6 min |

### Top Lessons (Verified Across Milestones)

1. Run `/gsd:audit-milestone` before completing — catches gaps that session-level verification misses (v1.0 proved it, v1.1-v1.5 skipped it)
2. Traceability maintenance is as important as code execution — requirements checkboxes drifted in v1.0 and v1.2; formal REQUIREMENTS.md in v1.5 was unambiguous
3. Pure functions are the right default for data transformations — validated in Config Resolver (v1.0), generation engine (v1.1), activity feed merge (v1.5)
4. Registry/single-source-of-truth patterns scale well — semantic tokens (v1.0), section registry (v1.1), filterType (v1.3), MODULE_REGISTRY (v1.5)
5. Reference-driven design eliminates decision fatigue — v1.2 and v1.4 shipped faster because visual decisions were pre-made
6. CSS-only milestones are inherently safe — zero logic changes means zero regressions (v1.2, v1.4 token cascade)
7. Schema-first / migration-first approach prevents rework — v1.3 (types first) and v1.5 (DB first) both shipped cleanly
8. Token cascade is the most efficient visual migration — ~20 token changes propagate to ~55 components (v1.4)
9. Migration-first (schema→data→UI→tooling) is the safest data layer approach — validated in v1.5, v2.0, v2.1 with zero data bugs
10. Automated verification scripts beat manual checks — 15-point verify-seed.ts (v2.1) is reproducible, reliable, and fast
11. UX consistency beats feature completeness — validate interaction model with user before building config UI (v2.2 Sheet panels replaced by inline editing in v2.3)
12. Build new before removing old — safe migration: v2.3 built inline editing alongside Sheet panels, then removed old code in cleanup phase
13. Run milestone audit at least once — v2.3 was first audit since v1.0; integration checker found visual gap and orphaned export missed by phase-level verification
