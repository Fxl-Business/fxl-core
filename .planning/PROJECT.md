# FXL Core — Nucleo FXL

## What This Is

Plataforma operacional interna da FXL (BI para PMEs). Combina documentacao de processo, knowledge de clientes, ferramentas AI-first (wireframe-builder com editor visual, design system semantico, 21 tipos de secao, briefing estruturado) e pipeline completo Briefing → Blueprint → Wireframe → Spec Generation. Interface visual redesenhada com paleta slate + indigo, tipografia Inter/JetBrains Mono, e componentes consistentes (frosted glass header, border-l rail navigation, dark code blocks com syntax highlighting, TOC com scroll tracking). O objetivo e ter um processo capaz de entender qualquer negocio e, a partir de perguntas e respostas estruturadas, gerar qualquer produto digital de forma progressivamente automatizada.

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

### Active

(No active milestone — planning next)

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
- Recharts 3.x upgrade — breaking changes, 2.x tem todos os charts necessarios
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

## Context

Shipped v1.2 Visual Redesign with ~33,000 LOC TypeScript across ~240 files.
Tech stack: React 18, TypeScript strict, Tailwind CSS 3, Vite 5, Supabase, Clerk, Vercel.
3 new packages added in v1.2: @fontsource-variable/inter, @fontsource-variable/jetbrains-mono, rehype-highlight.
237 tests passing (vitest).

The platform covers the full operator workflow:
1. **Documentation** — 4-section taxonomy, onboarding, Claude Code + GSD workflow
2. **Wireframe feedback** — persistent comments, client share links, comment management
3. **Visual editing** — drag-reorder sections, property panels, screen management, Supabase sync
4. **Branding** — structured collection, automatic application via CSS vars and chart colors
5. **Config pipeline** — TechnicalConfig + Config Resolver → GenerationManifest
6. **System generation** — 6-file product spec ready for Claude Code to generate in separate repo
7. **Blueprint infrastructure** — DB-only storage, Zod validation (21 section types), schema migration, optimistic locking
8. **Design system** — Wireframe-specific --wf-* semantic tokens with dark/light mode and client branding overrides
9. **Component library** — Section registry with 21 types, 9 chart variants, generic parametric viewer
10. **Briefing & views** — Structured briefing form, blueprint text view, MD export, share link management
11. **AI generation** — Screen recipes + vertical templates + pure generation engine with CLI bridge
12. **Visual identity** — Slate + indigo palette, Inter/JetBrains Mono fonts, frosted glass header, border-l rail nav, dark code blocks with syntax highlighting, right-side TOC

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

## Constraints

- **Stack FXL Core**: React 18 + TypeScript strict + Tailwind + Vite + Vercel — nao muda
- **Zero `any`**: TypeScript strict com `tsc --noEmit` como gate de aceite
- **Sem backend pesado no Core**: Supabase apenas para features interativas (comentarios, blueprints, briefings)
- **Blueprint prevalece**: Se blueprint e wireframe divergirem, blueprint e a fonte da verdade
- **Componentes compartilhados**: Nunca criar componentes locais em clients/ — tudo em tools/
- **Section registry**: All new section types must go through the registry (no direct switch statements)
- **Visual language**: Slate + indigo palette, Inter body / JetBrains Mono code, border-l rail nav pattern

---
*Last updated: 2026-03-11 after v1.2 milestone*
