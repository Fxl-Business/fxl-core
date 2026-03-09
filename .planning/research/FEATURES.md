# Feature Landscape

**Domain:** Wireframe Evolution -- Design System, Expanded Components, Dynamic Blueprints, AI-Assisted Generation
**Researched:** 2026-03-09
**Milestone:** v1.1 Wireframe Evolution
**Confidence:** HIGH (grounded in existing codebase architecture + competitive landscape analysis)

## Table Stakes

Features users expect from a maturing wireframe-to-blueprint system. Missing = platform feels stagnant.

### 1. Wireframe Design System with Customizable Palettes

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Semantic color tokens (surface, text, border, accent) | Elementor 3.33, Plasmic, and every modern design tool use token-based theming. Raw hex values scattered across components are unmaintainable. | Medium | Existing `--brand-*` CSS vars in branding system | Current system already uses CSS vars for branding. Needs elevation to a proper 3-tier token system: primitive -> semantic -> component. |
| Neutral palette (white/black/gray scale) | Monochrome neutral grounding is standard in every design system (Fluent 2, Tailwind, shadcn). 90%+ of a dashboard UI is neutral tones. | Low | Tailwind CSS config + CSS vars | Define 10-step neutral scale (50-950). Map to semantic tokens `--surface-primary`, `--surface-secondary`, `--text-primary`, `--text-muted`, `--border-default`. |
| Single accent color system (gold) | Retool uses a single brand accent. Builder.io uses a single primary. One accent color with light/dark variants is the proven pattern for internal tools. | Low | Neutral palette must exist first | Gold accent mapped to `--accent`, `--accent-muted`, `--accent-foreground`. Used only for CTAs, active states, and emphasis. |
| Dark + light mode in wireframes | Retool (community demand since 2023), Figma, and Builder.io all support dark mode. FXL Core app already has dark mode -- wireframes without it feel inconsistent. | Medium | Semantic tokens must exist first | Implementation via CSS class toggle (`dark` on root). Semantic tokens swap values. No component code changes if tokens are correctly abstracted. |
| Branding override layer | Every page builder (Elementor, Plasmic, Builder.io) lets users override base theme with brand colors. FXL already does this partially. | Low | Semantic tokens + existing `--brand-*` vars | Current branding system applies via CSS vars. Needs to integrate with the new token layer so brand colors cascade correctly through semantic tokens. |

### 2. Expanded Component Library

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Settings/Config page blocks | Retool has 100+ components including config UIs. Any internal tool builder includes settings pages. FXL already has ConfigTable but needs more. | Medium | Existing ConfigTable, PropertyPanel patterns | New blocks needed: ToggleGroup (on/off settings), SelectGroup (dropdown settings), TextInputGroup (editable fields). These compose into settings screens. |
| Form input blocks | Appsmith, Budibase, and Retool all have rich form components (text inputs, selects, toggles, date pickers). FXL only has ManualInputSection and SaldoBancoInput -- both specialized. | Medium | Existing ManualInputSection pattern | New generic blocks: FormSection (label + input + validation), DatePickerSection, SelectSection, TextAreaSection. Follow the discriminated union pattern in `blueprint.ts`. |
| Filter bar variations | Retool filter components are configurable per data type. Current WireframeFilterBar is a single layout. Needs flexibility for different screen contexts. | Low | Existing WireframeFilterBar | Extend WireframeFilterBar config to support: search input, multi-select filters, date range pickers, toggle filters. Add these as `filterType` options in the FilterOption type. |
| Page type templates beyond dashboards | Every page builder (Elementor 1000+ templates, Relume 1000+ components) organizes by page purpose. FXL has only dashboard screens + config + upload. | Medium | New BlueprintSection types | New page types needed: Detail page (entity view with tabs), List page (searchable table with actions), Form page (multi-step wizard). Each requires 2-3 new section types. |
| Navigation components | Every internal tool (Retool, Appsmith) includes tabs, breadcrumbs, and step indicators. FXL only has WireframeSidebar and DetailViewSwitcher. | Low | Existing component architecture | New blocks: TabsSection (horizontal tab container), BreadcrumbSection (page hierarchy), StepIndicatorSection (multi-step flow). |

### 3. Dynamic Blueprint Storage

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Blueprint as JSONB in Supabase (not .ts file) | Builder.io, Plasmic, and every headless CMS store content as JSON in a database, not as code files. Current `.ts` file cannot be edited via UI or API without redeployment. | Medium | Existing `blueprint_configs` table + `blueprint-store.ts` | Already partially done -- `blueprint-store.ts` has `loadBlueprint()`/`saveBlueprint()` using `blueprint_configs` table. But `blueprint.config.ts` file still exists as seed/fallback. Need to make DB the single source of truth. |
| Blueprint versioning (history) | Builder.io, DatoCMS, and Payload CMS all version content. Editing a blueprint without undo/history is dangerous for production wireframes. | Medium | Blueprint in Supabase | Add `blueprint_versions` table: `id, client_slug, config JSONB, version INT, created_by TEXT, created_at TIMESTAMPTZ`. Insert on every save. Simple append-only pattern. |
| Schema validation at DB level | Supabase `pg_jsonschema` extension validates JSONB against JSON Schema on INSERT/UPDATE. Prevents corrupt blueprints from bad API calls or manual edits. | Low | `pg_jsonschema` extension enabled | Add CHECK constraint: `jsonb_matches_schema(blueprint_schema, config)`. Translate TypeScript `BlueprintConfig` type to JSON Schema. |
| Blueprint accessible to Claude Code | Claude Code operates on files, not database rows. If blueprint lives only in DB, Claude Code loses access during wireframe tasks. | Low | Blueprint in Supabase | Two solutions: (1) MD export endpoint that dumps blueprint as markdown -- simple `GET /api/blueprint/:slug` route. (2) Supabase MCP tool -- Claude Code reads DB directly. Option 1 is simpler and more portable. |
| Textual blueprint rendering in UI | Blueprint data should be human-readable in the FXL Core app, not just as a rendered wireframe. Operators need to see the structure, not just the visual output. | Medium | Blueprint in Supabase | Render blueprint as structured markdown/outline in the client page: screens, sections, properties. Similar to how Builder.io shows content structure alongside visual preview. |

### 4. Briefing Input via UI

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Structured briefing form in FXL Core | Every project management tool (Notion, Linear, Jira) has structured input forms. Currently briefing is a markdown doc manually written. | Medium | Supabase storage for briefing data | Form with sections matching the FXL briefing template: company info, pain points, data sources, desired screens, KPI definitions. Stored as JSONB in Supabase. |
| Briefing-to-blueprint generation trigger | Figma AI, Visily, and Google Stitch generate wireframes from text prompts. FXL's version: generate BlueprintConfig from structured briefing + historical patterns. | High | Briefing form + Claude API with structured outputs | Core differentiator. Use Claude structured outputs (Zod schema matching BlueprintConfig) to generate a blueprint draft from the briefing. Operator reviews and edits before accepting. |

## Differentiators

Features that set FXL apart. Not expected in a basic wireframe tool, but create real competitive advantage.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| AI blueprint generation from briefing + historico | Visily and Figma AI generate generic wireframes. FXL generates domain-specific BlueprintConfigs using historical client data (what screens worked, what KPIs matter for which business type). | High | Briefing in DB + existing client blueprints as training examples | Use Claude's structured outputs with Zod schema matching BlueprintConfig type. Prompt includes: briefing data + example blueprints from similar clients + screen recipes from `docs/ferramentas/blocos/index.md`. Output: complete BlueprintConfig JSON. |
| Screen recipe intelligence | No competing tool maps business type to optimal screen combinations. FXL's "Receitas de Tela" in `index.md` codifies which component combinations work for DRE, Cash Flow, Analytics, etc. | Medium | Existing recipes + new recipe registry | Formalize screen recipes as a typed registry (not just markdown). Each recipe: `{ pageType, sections[], suitableFor[] }`. Claude uses this as context when generating blueprints. |
| Blueprint diff and merge | Git-like visibility into what changed between blueprint versions. No page builder offers this for JSON content schemas. | Medium | Blueprint versioning | Compare two JSONB versions and show: added screens, removed sections, changed properties. Render as a visual diff in the UI. |
| Progressive blueprint refinement | Unlike Figma AI (one-shot generation), FXL lets operators iterate: generate draft -> edit visually -> regenerate specific screens -> refine sections. Loop between AI and human. | High | AI generation + visual editor + blueprint in DB | The visual editor already handles section editing. Add: "Regenerate this screen" button that sends current screen + briefing context to Claude for a refined version. |
| Business-type templates | Pre-built BlueprintConfigs for common FXL client types (financial services, SaaS metrics, e-commerce). Faster than generating from scratch. | Low | Blueprint schema stable | Store as JSON files in `tools/wireframe-builder/templates/`. Load via UI when creating a new client. Faster onboarding than AI generation for known business types. |

## Anti-Features

Features to explicitly NOT build for v1.1.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time collaborative editing | Google Docs-style multi-cursor editing is extremely complex (CRDTs, operational transforms). FXL has 1-2 operators per client. | Single-user editing with optimistic locking. Show "last edited by" timestamp. Warn if another user edited since load. |
| Visual drag-and-drop design tool (Figma-like) | FXL's value is blueprint-driven generation, not freeform design. Building a visual design tool is a multi-year effort that competes with Figma. | Keep the current approach: structured editor with property panels for each section type. Add component picker for adding new sections. |
| Custom component creation via UI | Plasmic and Builder.io let developers register custom components. FXL's components are pre-built by the development team. | Components live in `tools/wireframe-builder/components/`. New components are added by Claude Code via SKILL.md process. No user-facing component builder. |
| CSS/style overrides per component | Elementor allows per-element custom CSS. This creates unmaintainable one-offs that break theme consistency. | All styling flows through the design token system. If a component needs a different look, create a variant in the token system, not a CSS override. |
| Multi-tenant blueprint sharing | Sharing blueprints across clients violates the isolation rule. Each client's context is separate. | Templates (pre-built starters) serve the "reuse" need. Copy a template to create a new client, then customize. Never share live blueprints. |
| Runtime theme switching by end users | End users of generated dashboards don't need to pick themes. The branding is set by the operator in Phase 2. | Theme/branding applied at generation time. Dark/light mode toggle is acceptable (CSS only, no data changes), but color palette is fixed per client. |
| Natural language editing ("make the chart bigger") | AI-based visual editing via natural language is impressive but unreliable. Structured property panels are deterministic. | Keep property panels for visual editing. Use AI only for blueprint generation (structured output with Zod schema), not for incremental visual tweaks. |

## Feature Dependencies

```
DESIGN SYSTEM (foundation for everything visual):
  Semantic color tokens (primitive -> semantic -> component)
    -> Neutral palette (white/black/gray scale)
      -> Accent color system (gold)
        -> Dark + light mode toggle
          -> Branding override layer (--brand-* integrates with tokens)

EXPANDED COMPONENTS (builds on design system):
  New section types in blueprint.ts (discriminated union additions)
    -> Form input blocks (FormSection, DatePickerSection, SelectSection)
    -> Settings blocks (ToggleGroup, SelectGroup, TextInputGroup)
    -> Navigation blocks (TabsSection, BreadcrumbSection, StepIndicatorSection)
    -> Filter bar extensions (new FilterOption types)
      -> Page type templates (Detail, List, Form pages)
        -> Screen recipe registry (typed, not just markdown)

DYNAMIC BLUEPRINTS (independent of design system):
  Blueprint as DB-only source of truth (remove .ts file dependency)
    -> Schema validation via pg_jsonschema
    -> Blueprint versioning (append-only history table)
      -> Blueprint diff view
    -> Blueprint MD export for Claude Code access
    -> Textual blueprint rendering in UI

AI GENERATION (depends on dynamic blueprints + briefing):
  Briefing form in UI (structured input stored in Supabase)
    -> Claude structured outputs with Zod schema = BlueprintConfig
      -> AI blueprint generation from briefing + historico
        -> Progressive refinement (edit -> regenerate screen -> refine)
  Screen recipe registry (typed)
    -> Business-type templates
    -> Recipe intelligence in AI prompts

PARALLEL TRACKS:
  Design system <-> Dynamic blueprints (independent, can develop in parallel)
  Expanded components -> needs design system tokens to style correctly
  AI generation -> needs dynamic blueprints in DB + briefing form
```

## MVP Recommendation

### Phase 1: Design System + Dynamic Blueprints (parallel tracks)

Prioritize:
1. **Semantic color tokens** -- Foundation. Every subsequent visual feature depends on this. Refactor existing CSS vars into 3-tier token architecture (primitive -> semantic -> component). Uses Tailwind CSS config + CSS custom properties.
2. **Blueprint as DB-only source of truth** -- Already partially implemented. Remove reliance on `.ts` config files. Make `blueprint_configs` table the single source. Add MD export for Claude Code access.
3. **Neutral palette + gold accent** -- Quick win once tokens exist. Define the scale, apply to wireframe components.
4. **Blueprint versioning** -- Simple append-only table. Low effort, high safety value.
5. **Dark + light mode in wireframes** -- Token swap via CSS class. No component code changes if tokens are correct.

### Phase 2: Expanded Components + Briefing Input

Prioritize:
6. **Form input blocks** (FormSection, SelectSection, DatePickerSection) -- Unblock non-dashboard page types.
7. **Settings page blocks** (ToggleGroup, SelectGroup) -- Enrich config screen capabilities.
8. **Briefing form in UI** -- Structured input is prerequisite for AI generation.
9. **Filter bar extensions** -- Low effort, high utility.
10. **Navigation blocks** (TabsSection, BreadcrumbSection) -- Enable multi-section page layouts.

### Phase 3: AI-Assisted Generation

Prioritize:
11. **AI blueprint generation from briefing** -- Core differentiator. Claude structured outputs + Zod schema.
12. **Screen recipe registry** (typed, not markdown) -- Improves AI generation quality.
13. **Textual blueprint rendering in UI** -- Operators see structure alongside wireframe.
14. **Business-type templates** -- Fast onboarding for known verticals.

Defer to v1.2+:
- **Blueprint diff/merge** -- Valuable but not blocking. Can use simple "restore previous version" initially.
- **Progressive refinement** (regenerate individual screens) -- Requires stable AI generation first.
- **Page type templates** (Detail, List, Form) -- Expand after core dashboard patterns are solid.

## Complexity Assessment

| Feature Area | Effort | Risk | Rationale |
|--------------|--------|------|-----------|
| Design System tokens | 2-3 days | Low | Pattern well-established (Tailwind + CSS vars). Existing `--brand-*` system proves the approach works. |
| Dynamic blueprints | 3-4 days | Low | Already 70% done (store exists, table exists). Main work: remove .ts fallback, add versioning table, add pg_jsonschema validation. |
| Dark/light mode | 1-2 days | Low | CSS-only change if tokens are correct. Test each component once. |
| New component blocks | 5-8 days | Medium | Each block needs: type in discriminated union, component TSX, renderer, property form, spec doc, gallery entry. Established pattern but repetitive. |
| Briefing form | 2-3 days | Low | Standard CRUD form. Store as JSONB in Supabase. |
| AI blueprint generation | 5-7 days | High | Depends on Claude structured output reliability with complex nested schemas. BlueprintConfig has deep nesting (screens -> sections -> items). Need fallback for generation failures. |
| Textual blueprint view | 2-3 days | Low | Render JSON as structured outline. react-markdown can handle the output. |

## Sources

**Competitive analysis:**
- Elementor 3.33 CSS-first token architecture: elementor.com/blog/elementor-333-v4-variables-manager-custom-css
- Retool component library (100+ components, 35 rebuilt inputs): retool.com/blog/new-input-ui-component-library
- Plasmic component registration SDK: docs.plasmic.app/learn/registering-code-components
- Builder.io Visual Headless CMS JSON approach: builder.io/m/knowledge-center/visual-headless-cms
- Relume 1000+ component library for Figma/Webflow: relume.io

**Design system patterns:**
- 3-tier token architecture (primitive/semantic/component): medium.com/design-bootcamp/color-tokens-guide-to-light-and-dark-modes-in-design-systems
- Semantic color naming for light/dark modes: medium.com/eightshapes-llc/light-dark-9f8ea42c9081
- Fluent 2 color system (neutral + accent pattern): fluent2.microsoft.design/color
- Tailwind dark mode with design tokens: richinfante.com/2024/10/21/tailwind-dark-mode-design-tokens-themes-css

**Dynamic schema storage:**
- Supabase pg_jsonschema for JSONB validation: supabase.com/docs/guides/database/extensions/pg_jsonschema
- Supabase JSONB best practices: supabase.com/docs/guides/database/json
- JSON Schema 2025 stability roadmap: json-schema.org/blog/posts/future-of-json-schema

**AI generation:**
- Claude structured outputs (Zod/Pydantic schemas): platform.claude.com/docs/en/build-with-claude/structured-outputs
- LLM structured output for dashboard generation: medium.com/@sushmita_mishra18/ai-powered-dynamic-dashboards-using-flowise-and-llms
- OpenAI structured outputs pattern: developers.openai.com/api/docs/guides/structured-outputs
- AI SDK structured data generation: ai-sdk.dev/docs/ai-sdk-core/generating-structured-data

**AI wireframe tools:**
- Figma AI wireframe generator: figma.com/solutions/ai-wireframe-generator
- Visily prompt-based wireframing: visily.ai/blog/prompt-based-wireframing-tools
- UX Pilot Figma plugin: figma.com/community/plugin/1257688030051249633

**FXL internal:**
- `tools/wireframe-builder/types/blueprint.ts` -- 15 section types in discriminated union
- `tools/wireframe-builder/lib/blueprint-store.ts` -- existing Supabase load/save
- `tools/wireframe-builder/SKILL.md` -- wireframe architecture and patterns
- `docs/ferramentas/blocos/index.md` -- component catalog with screen recipes
- `.planning/PROJECT.md` -- v1.1 milestone definition and constraints

---
*Feature landscape for: v1.1 Wireframe Evolution*
*Researched: 2026-03-09*
