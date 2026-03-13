# FXL Core — Nucleo FXL

## What This Is

Plataforma operacional interna da FXL (BI para PMEs). Combina documentacao de processo, knowledge de clientes, ferramentas AI-first (wireframe-builder com editor visual, design system semantico, 28 tipos de secao, briefing estruturado), pipeline completo Briefing → Blueprint → Wireframe → Spec Generation, base de conhecimento com full-text search, e gestao de tarefas por cliente com kanban board. Arquitetura modular com MODULE_REGISTRY tipado driving sidebar, routing e home page. Interface visual com paleta primary blue #1152d4 + slate, tipografia Inter/JetBrains Mono, dark sidebar, backdrop-blur filter bar, e group-hover effects em todos os componentes de wireframe. O objetivo e ter um processo capaz de entender qualquer negocio e, a partir de perguntas e respostas estruturadas, gerar qualquer produto digital de forma progressivamente automatizada.

## Core Value

O FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling vivem juntos para que o Claude Code tenha contexto completo ao executar qualquer tarefa.

## Requirements

### Validated

- ✓ Documentacao de processo renderizada via parser proprio (docs/) — existing
- ✓ Sistema de fases documentado (Fase 1 a 6) — existing
- ✓ Wireframe-builder com 20+ componentes reutilizaveis (KpiCard, charts, tables, inputs) — existing
- ✓ Arquitetura declarativa: BlueprintConfig → BlueprintRenderer pipeline — existing
- ✓ Blueprint.config.ts como fonte da verdade para wireframes — existing
- ✓ Visualizacao de wireframe full-screen fora do Layout — existing
- ✓ Modo comparacao temporal (switch ON/OFF) nos componentes — existing
- ✓ Section renderers com dispatch por tipo (15 tipos de secao) — existing
- ✓ Client knowledge layer (clients/[slug]/ com docs, wireframe, CLAUDE.md) — existing
- ✓ Busca global com cmdk (Cmd+K) sobre todos os docs — existing
- ✓ Deploy automatico via Vercel como SPA estatico — existing
- ✓ CommentOverlay basico para feedback por tela/bloco no wireframe — existing
- ✓ Sidebar reorganizada com 4 secoes (Processo, Padroes, Ferramentas, Clientes) — v1.0
- ✓ Conteudo dos docs revisado para processo atual com Claude Code + GSD — v1.0
- ✓ Pagina de onboarding para novos operadores — v1.0
- ✓ Comentarios persistentes por tela/bloco em Supabase com Clerk auth — v1.0
- ✓ Acesso externo via share link para clientes deixarem comentarios — v1.0
- ✓ Gerenciamento de comentarios com marcacao de resolvidos — v1.0
- ✓ 22 block specs como prompts detalhados para geracao de componentes — v1.0
- ✓ Galeria de componentes sincronizada com specs de blocos — v1.0
- ✓ Design system com semantic tokens, dark mode e paleta atualizada — v1.0
- ✓ Visual production-grade em todas as paginas da aplicacao — v1.0
- ✓ Editor visual de wireframe com drag-reorder, property panels e screen management — v1.0
- ✓ Sync bidirecional de edicoes visuais com Supabase blueprint config — v1.0
- ✓ Formato padrao parseavel para branding (cores, tipografia, logo) — v1.0
- ✓ Processo documentado de coleta de branding com template — v1.0
- ✓ Branding aplicado automaticamente no wireframe via CSS vars + chart colors — v1.0
- ✓ TechnicalConfig schema com data sources, formulas KPI e regras de negocio — v1.0
- ✓ Config Resolver merge Blueprint + TechnicalConfig + Branding → GenerationManifest — v1.0
- ✓ AI draft generation de TechnicalConfig a partir de briefing/blueprint — v1.0
- ✓ Validacao automatica de cobertura TechnicalConfig vs blueprint — v1.0
- ✓ Product spec generator com 6 arquivos para dashboard BI (Vite+React+NestJS) — v1.0
- ✓ Upload rules com normalizacao BR (1.234,56 / dd/mm/yyyy) — v1.0
- ✓ Auth spec com 3 roles (admin, editor, viewer) — v1.0
- ✓ Branding spec com CSS vars --brand-* e Google Fonts — v1.0
- ✓ Blueprint como dado dinamico no Supabase com Zod validation e schema migration — v1.1
- ✓ Optimistic locking para edicao concorrente de blueprint — v1.1
- ✓ Design system wireframe com --wf-* tokens (paleta neutra + dourado accent) — v1.1
- ✓ Dark/light mode toggle no wireframe viewer — v1.1
- ✓ Client branding overrides sobre wireframe tokens sem colisao com app theme — v1.1
- ✓ Section registry com 21 tipos (substituindo switch statements dispersos) — v1.1
- ✓ 6 novos block types (settings-page, form-section, filter-config, stat-card, progress-bar, divider) — v1.1
- ✓ 5 novos chart types (Radar, Treemap, Funnel, Scatter, Area) — v1.1
- ✓ Wireframe viewer generico parametrizado por :clientSlug — v1.1
- ✓ Briefing estruturado via formulario UI com Supabase persistence — v1.1
- ✓ Blueprint text view com collapsible screens e type badges — v1.1
- ✓ Blueprint exportavel como Markdown para Claude Code — v1.1
- ✓ Share link management via dialog (gerar/copiar/revogar) — v1.1
- ✓ AI generation: screen recipes tipadas para 10 contextos de negocio — v1.1
- ✓ AI generation: vertical templates (financeiro/varejo/servicos) — v1.1
- ✓ AI generation: engine pura BriefingConfig → BlueprintConfig + CLI bridge — v1.1
- ✓ Paleta slate + indigo com CSS vars e Inter/JetBrains Mono fonts — v1.2
- ✓ Frosted glass sticky header com brand identity e search integrado — v1.2
- ✓ Border-l rail sidebar nav com indigo active states e uppercase section headers — v1.2
- ✓ Doc rendering com breadcrumbs, badge pills, 4xl titles, prose typography hierarchy — v1.2
- ✓ Dark code blocks com rehype-highlight syntax highlighting e terminal dots — v1.2
- ✓ Right-side TOC com IntersectionObserver scroll tracking e border-l rail — v1.2
- ✓ Consistency pass: Home, client pages, auth pages, shared components em nova linguagem visual — v1.2
- ✓ Softer wireframe palette (no harsh blacks), --wf-border alias — v1.3
- ✓ Header full-width above sidebar, Gerenciar action in header — v1.3
- ✓ SidebarConfig and HeaderConfig at dashboard level in BlueprintConfig schema — v1.3
- ✓ FilterOption.filterType discriminator (date-range, multi-select, search, toggle, period presets) — v1.3
- ✓ Sidebar icons, grouped sections, collapse rail, badge counts, footer — v1.3
- ✓ Header logo/brand, period selector, user/role indicator, action buttons — v1.3
- ✓ 6 new chart variants (stacked-bar, stacked-area, horizontal-bar, bubble, gauge, composed) — v1.3
- ✓ Gallery reorganized into 6 thematic sections with all new components — v1.3
- ✓ Wireframe token palette: primary blue #1152d4, slate scale, branding override pipeline — v1.4
- ✓ Dark sidebar chrome with active/hover states, group labels, status footer — v1.4
- ✓ White header with 3-column layout (brand | search | actions), user chip — v1.4
- ✓ KPI cards with icon slot, group-hover color inversion, rounded-full trend badges — v1.4
- ✓ Table headers text-[10px] font-black uppercase tracking-widest, dark footer row — v1.4
- ✓ Filter bar with backdrop-blur-sm sticky container, vertical stacked labels — v1.4
- ✓ Chart palette blue-slate across 15 components, activeBar hover, CompositionBar — v1.4
- ✓ Module registry: ModuleManifest type + MODULE_REGISTRY driving sidebar, routing, home — v1.5
- ✓ Knowledge Base: 4 entry types, ADR template, full-text search (Portuguese), Cmd+K integration — v1.5
- ✓ Task Management: list, kanban, create/edit, DocumentarButton cross-module link to KB — v1.5
- ✓ Home page: MODULE_REGISTRY grid + activity feed cross-module — v1.5
- ✓ Supabase migrations: knowledge_entries (tsvector/GIN) + tasks (status/priority CHECK) — v1.5
- ✓ 7 chartType sub-variants (grouped-bar, bullet, step-line, lollipop, range-bar, bump, polar) — v1.6
- ✓ 4 standalone section types (pie-chart, progress-grid, heatmap, sparkline-grid) — v1.6
- ✓ Sankey diagram as standalone section type — v1.6
- ✓ ComponentGallery with all 28 section types and Brazilian Portuguese mock data — v1.6
- ✓ Section registry at 28 types (5-file checklist for standalone, 4-point sync for chartType) — v1.6
- ✓ ModuleDefinition extending ModuleManifest with extensions[], badge?, enabled, description — v2.0
- ✓ Zero-import module-ids.ts constants preventing circular imports — v2.0
- ✓ SlotComponentProps, SLOT_IDS, ExtensionSlot cross-module injection architecture — v2.0
- ✓ resolveExtensions() pure function + ExtensionProvider/ExtensionSlot React runtime — v2.0
- ✓ Home 2.0 control center with asymmetric layout, activity feed, module stats — v2.0
- ✓ Sidebar driven by enabled modules via useModuleEnabled context — v2.0
- ✓ /admin/modules panel with enable/disable toggles and extension visibility — v2.0
- ✓ 2 real cross-module extension widgets (RecentTasksWidget, RecentKBWidget) via slot injection — v2.0

- ✓ Supabase `documents` table with B-tree indexes and anon-permissive RLS — v2.1
- ✓ Seed script migrating all 62 docs from filesystem to Supabase with custom tag preservation — v2.1
- ✓ DocRenderer, sidebar nav, and search index consuming Supabase data (zero Vite glob dependency) — v2.1
- ✓ Bidirectional sync CLI: make sync-down (DB→.md) and make sync-up (.md→DB) — v2.1
- ✓ In-memory prefetch cache for instant doc navigation — v2.1
- ✓ SidebarWidget discriminated union (TypeScript + Zod) with backward-compatible .passthrough() schema — v2.2
- ✓ All HeaderConfig fields wired to conditional rendering (showPeriodSelector, showUserIndicator, actions.*) — v2.2
- ✓ Dashboard-level mutation helpers (updateWorkingConfig, updateWorkingSidebar, updateWorkingHeader) — v2.2
- ✓ HeaderConfigPanel with live preview: toggles, brandLabel, periodType (mensal/anual) — v2.2
- ✓ SIDEBAR_WIDGET_REGISTRY + WorkspaceSwitcher + UserMenu widgets with rail mode degradation — v2.2
- ✓ SidebarConfigPanel: footer text, group CRUD, screen assignment, widget picker — v2.2
- ✓ FilterBarEditor: per-screen FilterOption[] CRUD with 5 BI presets — v2.2
- ✓ Header inline editing: clickable zones (logo, period, user, actions) with per-element PropertyPanel forms — v2.3
- ✓ Sidebar inline editing: clickable groups, footer, widgets with SidebarPropertyPanel and 3 specialized forms — v2.3
- ✓ Filter inline editing: clickable chips with FilterPropertyPanel, "+" button with 5 BI preset picker — v2.3
- ✓ Five-way selection mutex across header, sidebar, filter, filter-bar-action, and content — v2.3
- ✓ Sheet panels removed (HeaderConfigPanel, SidebarConfigPanel, FilterBarEditor), Layout buttons removed — v2.3

### Active

### Out of Scope

- Mobile apps — foco web-first, mobile e futuro
- SaaS completo como output — comecar com Dashboard BI, expandir depois
- Geracao de sistemas sem revisao humana — sempre semi-automatico com revisao
- Backend proprio no FXL Core alem de comentarios — FXL Core e documentacao/tooling
- Drag-and-drop generico de dashboards — o Blueprint-driven process e o produto
- Global Skills do Claude Code via .claude/skills/ — deferido para v2 (GSKILL-01/02)
- Runtime execution de formulas KPI — v1 usa string literal specifications
- Compare mode temporal funcional nas telas geradas — v2 (AGEN-01)
- React Query hooks com loading/error states — v2 (AGEN-02)
- Deploy automatico na Vercel do sistema gerado — v2 (AGEN-03)
- Conectores universais de dados (APIs, bancos externos) — v2 (ADV-01)
- Real-time streaming de dados — v2 (ADV-02)
- Row Level Security em todas as tabelas Supabase — v2 (SEC-01)
- Multi-tenant no Supabase — v2 (SEC-02)
- Recharts 3.x upgrade — breaking changes, 2.x tem todos os 28 chart/section types necessarios
- React 19 / Tailwind v4 — estabilidade da stack, upgrade futuro
- Blueprint diff/merge visual — v2 (ADVW-01)
- Edicao colaborativa em tempo real (CRDT) — v2 (ADVW-03)
- Drag-and-drop visual estilo Figma — v2 (ADVW-04)
- Edicao por linguagem natural — v2 (ADVW-05)
- Dark mode fine-tuning — v1.2 focused on light mode, dark inherits tokens automatically
- Mobile responsive sidebar drawer — v2
- @tailwindcss/typography plugin — custom prose styles sufficient
- Copy button / language label on code blocks — future (ADOC-01/02/03)
- Mobile hamburger menu — future (ADOC-04)
- KB auto-capture via GSD hooks — v2 (KB-08)
- KB entry versioning/history — v2 (KB-09)
- AI summary generation de KB entries — v2 (KB-10)
- Kanban drag-and-drop via @dnd-kit — v2 (TASK-06)
- Task dependencies / blocking graph — v2 (TASK-07)
- Email notifications de task assignments — v2 (TASK-08)

## Current State

All 11 milestones shipped (v1.0 → v2.3). Planning next milestone.

## Context

Shipped v2.3 Inline Editing UX. All 11 milestones complete (v1.0-v2.3).
Tech stack: React 18, TypeScript strict, Tailwind CSS 3, Vite 5, Supabase, Clerk, Vercel.
~41,000 LOC TypeScript. 7 Supabase migrations (001-007). 5 active modules in MODULE_REGISTRY.
Modular architecture: ModuleDefinition registry, cross-module slot injection, runtime enable/disable, admin panel.
Dynamic data layer: docs content served from Supabase with bidirectional sync CLI for Claude Code workflow.

The platform covers the full operator workflow:
1. **Documentation** — 4-section taxonomy, onboarding, Claude Code + GSD workflow
2. **Wireframe feedback** — persistent comments, client share links, comment management
3. **Visual editing** — drag-reorder sections, property panels, screen management, Supabase sync
4. **Branding** — structured collection, automatic application via CSS vars and chart colors
5. **Config pipeline** — TechnicalConfig + Config Resolver → GenerationManifest
6. **System generation** — 6-file product spec ready for Claude Code to generate in separate repo
7. **Blueprint infrastructure** — DB-only storage, Zod validation (28 section types), schema migration, optimistic locking
8. **Design system** — Wireframe-specific --wf-* semantic tokens with professional financial dashboard aesthetic
9. **Component library** — Section registry with 28 types, 22 chart variants, generic parametric viewer
10. **Briefing & views** — Structured briefing form, blueprint text view, MD export, share link management
11. **AI generation** — Screen recipes + vertical templates + pure generation engine with CLI bridge
12. **Visual identity** — Primary blue #1152d4 + slate palette, dark sidebar, backdrop-blur filter bar, group-hover effects
13. **Modular architecture** — MODULE_REGISTRY with typed manifests, ESLint boundary enforcement
14. **Knowledge Base** — 4 entry types (bug/decision/pattern/lesson), ADR template, Portuguese FTS, Cmd+K integration
15. **Task Management** — List/kanban/form, optimistic updates, DocumentarButton cross-module KB link
16. **Home page** — Module hub grid + cross-module activity feed
17. **Inline editing** — Click-to-edit for header, sidebar, and filter bar with contextual PropertyPanel forms and five-way selection mutex

Pilot client: financeiro-conta-azul (10 screens, complete briefing + blueprint + branding + TechnicalConfig).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Docs primeiro, depois wireframe, depois Fase 3 | Fundacao organizada antes de features complexas | ✓ Good — clean progression |
| Supabase para comentarios interativos | Ja e padrao da FXL, integra bem com Vercel | ✓ Good — worked seamlessly |
| Edicao visual com sync bidirecional | Iteracao rapida sem editar config manualmente | ✓ Good — full CRUD via UI |
| Dashboard BI como primeiro tipo de projeto | Mais previsivel — blueprint ja define quase tudo | ✓ Good — 6 spec files cover all needs |
| Sistema de cliente em repo separado | Isolamento, deploy independente, stack variavel | ✓ Good — clean separation |
| Clerk em vez de Supabase Auth | Google OAuth, melhor DX, anon clients via localStorage UUID | ✓ Good — simplified auth |
| Decimal phase numbering (02.1, 02.2, 02.3) | Clear insertion semantics for urgent work | ✓ Good — 3 phases inserted cleanly |
| --brand-* CSS var prefix | Avoid collision with FXL Core app theme (--primary, --accent) | ✓ Good — no conflicts |
| String literal formulas (not runtime) | Simpler for v1, runtime eval in v2 | ✓ Good — sufficient for spec generation |
| Semantic design tokens with dark mode | Production-grade visual quality, theme flexibility | ✓ Good — clean light/dark switching |
| Config Resolver as pure function | Deterministic, testable, no I/O side effects | ✓ Good — easy to test |
| Product spec as 6 self-contained files | Each file standalone, no cross-file dependencies | ✓ Good — Claude Code can process independently |
| Zod v4 with z.ZodType for recursive types | Type inference for discriminated union of 21 section types | ✓ Good — runtime validation catches malformed data |
| DB as sole source of truth (delete .ts config) | Clean cutover, no dual-source confusion | ✓ Good — simplified data flow |
| Optimistic locking via updated_at conditional update | Conflict protection without server-side locking | ✓ Good — conflict modal works well |
| --wf-* tokens separate from app tokens | Wireframe identity independent of app theme | ✓ Good — no visual collision |
| color-mix(in srgb) for semi-transparent fills | Tailwind opacity modifiers don't work with CSS var hex | ✓ Good — consistent badge/chart fills |
| Section registry single source of truth | Replace 5+ switch statements with one registry | ✓ Good — adding types is now 1-file change |
| Generic parametric viewer (/clients/:clientSlug/wireframe) | Eliminate per-client hardcoded pages | ✓ Good — scales to any client |
| Pure function generateBlueprint() | Zero side effects, testable without Supabase | ✓ Good — 10 unit tests cover engine |
| CLI bridge with process.env (not import.meta.env) | Vite env vars incompatible with Node.js scripts | ✓ Good — npx tsx --env-file .env.local |
| Screen recipes with keyword scoring | Flexible matching: briefing module names → screen templates | ✓ Good — 10 recipes cover common BI contexts |
| Slate + indigo palette (not blue-gray + gold) | Matches reference HTML design, consistent with Inter font | ✓ Good — cohesive visual identity |
| rehype-highlight (not shiki/react-syntax-highlighter) | Lighter, integrates with existing react-markdown pipeline | ✓ Good — zero-config syntax highlighting |
| Page-owns-width pattern | Layout.tsx delegates max-w to each page | ✓ Good — flexible per-page layouts |
| Viewport-level scrolling | Remove nested overflow containers for proper sticky | ✓ Good — sidebar, header, TOC all stick correctly |
| CSS-only sidebar restyle (zero logic changes) | -ml-px border-l overlap trick for active indicator | ✓ Good — minimal risk, clean result |
| Explicit color tokens (not semantic) | text-indigo-600 instead of text-primary for active states | ✓ Good — clear intent, easy to audit |
| Primary blue #1152d4 replacing gold #d4a017 | Professional financial dashboard aesthetic from HTML reference | ✓ Good — cohesive wireframe identity |
| CompositionBar with pure HTML/CSS flex (no Recharts) | Simpler, no dependency for horizontal stacked bar | ✓ Good — lightweight component |
| MODULE_REGISTRY static typed constant | Predictable, tree-shakeable, no runtime overhead | ✓ Good — drives sidebar + routing + home |
| ESLint v9 flat config with boundaries plugin | Cross-module import violations caught at lint time | ✓ Good — enforced module isolation |
| tsvector 'portuguese' for KB FTS | Content is in Portuguese, needs proper stemming | ✓ Good — accurate search results |
| Anon-permissive RLS on new tables | Consistent with existing tables, Clerk auth at app layer | ✓ Good — simple, works |
| Optimistic kanban updates with local state | Immediate UI feedback, refetch rollback on error | ✓ Good — responsive kanban |
| DocumentarButton outside TaskCard | Cross-module navigation decoupled from card component | ✓ Good — clean separation |
| Polar as chartType sub-variant (not standalone) | Follows categories[]+chartColors[] contract, uses Extension Point A | ✓ Good — consistent with other chart variants |
| Pie Chart as new standalone (not donut variant) | Preserves discriminated union semantics, different data shape | ✓ Good — clean type separation |
| Range Bar with CSS-flex (not Recharts) | Consistent with ProgressBar and CompositionBar patterns | ✓ Good — no Recharts workarounds needed |
| Sankey: verify Recharts export before coding | Prevent wasted work if named export missing | ✓ Good — Boolean(r.Sankey) === true confirmed |
| module-ids.ts zero-import constants file | Prevent circular dependency when manifests reference IDs | ✓ Good — all manifests safely import |
| ModuleDefinition extends ModuleManifest | Backward compatible, incremental upgrade | ✓ Good — smooth migration |
| SlotComponentProps defined before any slot component | Prevent ComponentType<any> in extension chain | ✓ Good — zero any in entire slot pipeline |
| resolveExtensions() as pure function (zero React) | Unit-testable without jsdom | ✓ Good — clean data layer |
| Provider nesting: Router > ModuleEnabled > Extension > Routes | Single source of truth for enabled state | ✓ Good — no localStorage duplication |
| localStorage for module toggle (not Supabase) | Single-operator scale, no network overhead | ✓ Good — instant toggle UX |
| /admin/modules as static hardcoded route | Never in MODULE_REGISTRY or sidebar | ✓ Good — clean separation |
| Home 2.0 asymmetric 2/3+1/3 layout | Control center identity, not generic card grid | ✓ Good — professional feel |
| Extension constants inlined in widgets | No coupling to module internals | ✓ Good — self-contained components |
| Supabase as source of truth for docs/ content | docs/ becomes sync cache, not deleted | ✓ Good — Claude Code + app both have access |
| Bidirectional sync via make targets | process.env + npx tsx pattern consistent with existing CLI | ✓ Good — simple, reliable |
| Custom tags preserved as-is in body column | No parsing at DB level, rendered by react-markdown pipeline | ✓ Good — zero tag breakage |
| Lazy search index on Cmd+K open | Avoid blocking page load with full document fetch | ✓ Good — fast initial load |
| sync-down additive only (no file deletion) | Prevents accidental loss of local-only files | ✓ Good — safe default |
| In-memory prefetch cache for all docs | First navigation triggers full fetch, subsequent instant | ✓ Good — 62 docs small enough for memory |
| ZoneWrapper pattern for clickable edit zones | Reusable wrapper with hover/selected/placeholder states | ✓ Good — consistent UX across header elements |
| Per-element form extraction pattern | Each config panel section → standalone form + registry | ✓ Good — forms reusable in PropertyPanel sheets |
| Five-way selection mutex in WireframeViewer | Only one element type selected at a time | ✓ Good — clean, leak-free state management |
| Click-to-edit as only editing paradigm | No toolbar shortcuts, operators click directly on component | ✓ Good — intuitive, consistent with block editing |

## Constraints

- **Stack FXL Core**: React 18 + TypeScript strict + Tailwind + Vite + Vercel — nao muda
- **Zero `any`**: TypeScript strict com `tsc --noEmit` como gate de aceite
- **Sem backend pesado no Core**: Supabase apenas para features interativas (comentarios, blueprints, briefings, KB, tasks)
- **Blueprint prevalece**: Se blueprint e wireframe divergirem, blueprint e a fonte da verdade
- **Componentes compartilhados**: Nunca criar componentes locais em clients/ — tudo em tools/
- **Section registry**: All new section types must go through the registry (no direct switch statements)
- **Visual language**: Primary blue #1152d4 + slate palette, Inter body / JetBrains Mono code, dark sidebar chrome
- **Module boundaries**: Each module owns its pages, components, hooks, types — cross-module imports go through registry or shared lib/

---
*Last updated: 2026-03-13 after v2.3 milestone completion*
