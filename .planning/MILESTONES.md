# Milestones

## v1.1 Wireframe Evolution (Shipped: 2026-03-10)

**Phases:** 5 (7, 8, 9, 10, 11) | **Plans:** 15 | **Tasks:** ~30
**Timeline:** 2 days (2026-03-09 → 2026-03-10) | **Commits:** 90 | **LOC delta:** +10,716 / -2,192
**Git range:** 443e9e4 → HEAD

**Delivered:** Wireframe system evolved from static config files into a full DB-backed pipeline with semantic design tokens, 21 section types, structured briefing input, and AI-assisted blueprint generation from business context.

**Key accomplishments:**
1. Blueprint infrastructure: DB-only storage with Zod validation (21 section types), schema migration framework, and optimistic locking with conflict resolution
2. Wireframe design system: --wf-* semantic tokens (warm stone grays + gold accent), dark/light mode toggle, client branding overrides without app theme collision
3. Section registry pattern: single source of truth for 21 types replacing 5+ switch statements, with 6 new blocks and 5 new chart variants
4. Generic parametric wireframe viewer (/clients/:clientSlug/wireframe) replacing hardcoded per-client pages
5. Structured briefing form with Supabase persistence, blueprint text view with collapsible screens, and Markdown export for Claude Code
6. AI generation engine: pure function mapping BriefingConfig modules to screens via 10 typed recipes + 3 vertical templates, with CLI bridge for operator invocation

**Archive:** [v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md) | [v1.1-REQUIREMENTS.md](milestones/v1.1-REQUIREMENTS.md)

---

## v1.0 MVP (Shipped: 2026-03-09)

**Phases:** 9 (1, 2, 02.1, 02.2, 02.3, 3, 4, 5, 6) | **Plans:** 27 | **Tasks:** ~58
**Timeline:** 4 days (2026-03-06 → 2026-03-09) | **Commits:** 180 | **LOC:** 16,808 TypeScript
**Git range:** ad5ab8e → 91a6c68

**Delivered:** FXL Core evolved from static documentation renderer into full operational platform with interactive wireframe editing, client feedback, structured branding, config pipeline, and automated BI dashboard spec generation.

**Key accomplishments:**
1. Documentation reorganized with 4-section taxonomy (Processo, Padroes, Ferramentas, Clientes) and operator onboarding
2. Persistent wireframe comments with Supabase + Clerk auth + client share links
3. 22 block specs as detailed component-generation prompts with synchronized gallery
4. Production-grade visual redesign with semantic token system and dark mode
5. Full wireframe visual editor with property panels, screen management, and Supabase sync
6. Structured branding process with automatic CSS var + chart color application to wireframes
7. TechnicalConfig schema + Config Resolver merging Blueprint + TechnicalConfig + Branding into GenerationManifest
8. Product spec generator producing 6-file BI dashboard specs ready for Claude Code generation

### Known Gaps

- **GSKILL-01/GSKILL-02:** Global Skills for Claude Code (deferred to v2 — phase never materialized when 02.3 was repurposed)
- **BRND-01/02/03:** Missing VERIFICATION.md for Phase 04 (work confirmed via SUMMARYs, no independent verification)

**Archive:** [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) | [v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md) | [v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md)

---

