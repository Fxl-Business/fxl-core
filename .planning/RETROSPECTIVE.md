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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Plans | Key Change |
|-----------|----------|--------|-------|------------|
| v1.0 | 4 days | 9 | 27 | First milestone — established GSD workflow, decimal phases, audit process |
| v1.1 | 2 days | 5 | 15 | Parallel phase execution, TDD for engine, quick tasks for post-phase polish |
| v1.2 | 4 days | 5 | 7 | CSS-only milestone, sequential dependency chain, reference-driven design |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | Vitest (Phase 06) | spec-generator only | 3 (recharts, @supabase/supabase-js, @clerk/react) |
| v1.1 | 237 tests | generation engine + schemas + recipes | 1 (zod v4) |
| v1.2 | 237 tests | no new tests (CSS-only) | 3 (@fontsource-variable/inter, @fontsource-variable/jetbrains-mono, rehype-highlight) |

### Velocity

| Milestone | Plans | Total Execution | Avg/Plan |
|-----------|-------|-----------------|----------|
| v1.0 | 27 | ~95 min | ~3.5 min |
| v1.1 | 15 | ~51 min | ~3.4 min |
| v1.2 | 7 | ~105 min | ~15 min |

### Top Lessons (Verified Across Milestones)

1. Run `/gsd:audit-milestone` before completing — catches gaps that session-level verification misses (v1.0 proved it, v1.1 + v1.2 skipped it)
2. Traceability maintenance is as important as code execution — requirements checkboxes drifted in v1.0 and v1.2
3. Pure functions are the right default for data transformations — validated in Config Resolver (v1.0), generation engine (v1.1)
4. Registry/single-source-of-truth patterns scale well — semantic tokens (v1.0), section registry (v1.1)
5. Reference-driven design eliminates decision fatigue — v1.2 shipped faster per-plan because visual decisions were pre-made
6. CSS-only milestones are inherently safe — zero logic changes means zero regressions, zero test failures
