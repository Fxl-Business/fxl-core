# FXL Core — Nucleo FXL

## What This Is

Plataforma operacional interna da FXL (BI para PMEs). Combina documentacao de processo, knowledge de clientes, ferramentas AI-first (wireframe-builder com editor visual, sistema de comentarios, branding automatico) e pipeline de geracao de specs para dashboards BI. O objetivo e ter um processo capaz de entender qualquer negocio e, a partir de perguntas e respostas estruturadas, gerar qualquer produto digital de forma progressivamente automatizada.

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

### Active

## Current Milestone: v1.1 Wireframe Evolution

**Goal:** Evoluir o sistema de wireframe para pipeline completo Briefing → Blueprint → Wireframe com dados dinamicos no Supabase, biblioteca de componentes expandida e design system moderno.

**Target features:**
- Redesign visual dos wireframes (paleta branco/preto/cinza/dourado, dark+light mode)
- Expansao da biblioteca de componentes (settings pages, inputs, filtros, novos blocos)
- Blueprint como dado dinamico no Supabase com renderizacao textual na UI
- Sync bidirecional blueprint ↔ wireframe mantido com blueprint no DB
- Blueprint acessivel ao Claude Code (MD export ou MCP Supabase)
- Geracao de blueprint via Claude Code a partir de briefing + historico
- Input de briefing diretamente pela UI
- Componentes dinamicos (page types, filtros configuráveis, input blocks)
- Bug fixes (share link, regra de no-removal)

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

## Context

Shipped v1.0 MVP with 16,808 LOC TypeScript across 136 files.
Tech stack: React 18, TypeScript strict, Tailwind CSS 3, Vite 5, Supabase, Clerk, Vercel.

The platform now covers the full operator workflow:
1. **Documentation** — 4-section taxonomy, onboarding, Claude Code + GSD workflow
2. **Wireframe feedback** — persistent comments, client share links, comment management
3. **Visual editing** — drag-reorder sections, property panels, screen management, Supabase sync
4. **Branding** — structured collection, automatic application via CSS vars and chart colors
5. **Config pipeline** — TechnicalConfig + Config Resolver → GenerationManifest
6. **System generation** — 6-file product spec ready for Claude Code to generate in separate repo

Pilot client: financeiro-conta-azul (10 screens, complete blueprint + branding + TechnicalConfig).

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

## Constraints

- **Stack FXL Core**: React 18 + TypeScript strict + Tailwind + Vite + Vercel — nao muda
- **Zero `any`**: TypeScript strict com `tsc --noEmit` como gate de aceite
- **Sem backend pesado no Core**: Supabase apenas para features interativas (comentarios, blueprints)
- **Blueprint prevalece**: Se blueprint e wireframe divergirem, blueprint e a fonte da verdade
- **Componentes compartilhados**: Nunca criar componentes locais em clients/ — tudo em tools/

---
*Last updated: 2026-03-09 after v1.1 milestone started*
