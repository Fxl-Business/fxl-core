# FXL Core — Nucleo FXL

## What This Is

Monorepo central da FXL, empresa de BI para PMEs. Contem documentacao de processo, knowledge de clientes, ferramentas AI-first (wireframe-builder) e o app React que renderiza tudo. O objetivo e ter um processo capaz de entender qualquer negocio e, a partir de perguntas e respostas estruturadas, gerar qualquer produto digital de forma progressivamente automatizada.

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

### Active

- [ ] Reorganizar navegacao e estrutura dos docs para refletir melhor o processo
- [ ] Comentarios interativos no wireframe com persistencia em Supabase
- [ ] Edicao visual completa do wireframe (layout, componentes, telas) com sync para blueprint
- [ ] Processo de coleta de branding estruturado
- [ ] Configuracao Tecnica como nova etapa da Fase 2
- [ ] Geracao automatica de sistema (Dashboard BI) a partir do Blueprint + Config Tecnica

### Out of Scope

- Mobile apps — foco web-first, mobile e futuro
- SaaS completo como output da v1 — comecar com Dashboard BI, expandir depois
- Geracao de sistemas sem revisao humana — sempre semi-automatico com revisao
- Backend proprio no FXL Core para funcionalidades alem de comentarios — FXL Core e documentacao/tooling
- Drag-and-drop generico de dashboards — o Blueprint-driven process e o produto

## Context

O FXL Core tem tres areas que precisam de melhorias antes de avancar para geracao automatica de sistemas:

**1. Documentacao (docs/):** A navegacao na sidebar esta confusa e nao reflete bem a estrutura do processo. Precisam ser reorganizados para que novos operadores encontrem informacoes facilmente.

**2. Wireframe Builder (tools/wireframe-builder/):** Ja funciona com renderizacao declarativa via BlueprintConfig, mas precisa evoluir para permitir: (a) comentarios persistentes com Supabase para feedback de clientes, (b) edicao visual completa — mover secoes, alterar props de componentes, adicionar/remover telas — com sync bidirecional para o blueprint.config.ts.

**3. Processo de branding:** Nao tem fluxo claro de como coletar branding do cliente. Precisa de formato padrao parseavel e processo documentado.

**4. Fase 3 automatizada:** So faz sentido apos as melhorias acima. O sistema gerado vive em repo separado. O piloto e financeiro-conta-azul (10 telas, blueprint completo).

## Constraints

- **Stack FXL Core**: React 18 + TypeScript strict + Tailwind + Vite + Vercel — nao muda
- **Zero `any`**: TypeScript strict com `tsc --noEmit` como gate de aceite
- **Sem backend pesado no Core**: Supabase apenas para comentarios e features interativas. FXL Core e primariamente estatico.
- **Blueprint prevalece**: Se blueprint e wireframe divergirem, blueprint e a fonte da verdade
- **Componentes compartilhados**: Nunca criar componentes locais em clients/ — tudo em tools/

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Docs primeiro, depois wireframe, depois Fase 3 | Fundacao organizada antes de construir features complexas | — Pending |
| Supabase para comentarios interativos no wireframe | Ja e padrao da FXL para dados, integra bem com Vercel | — Pending |
| Edicao visual com sync bidirecional para blueprint | Permite iteracao rapida sem editar config manualmente | — Pending |
| Dashboard BI como primeiro tipo de projeto para Fase 3 | Mais previsivel — blueprint ja define quase tudo | — Pending |
| Sistema de cliente em repo separado | Isolamento, deploy independente, stack variavel por projeto | — Pending |

---
*Last updated: 2026-03-07 after scope revision*
