# FXL Core — Nucleo FXL

## What This Is

Monorepo central da FXL, empresa de BI para PMEs. Contem documentacao de processo, knowledge de clientes, ferramentas AI-first (wireframe-builder) e o app React que renderiza tudo. O objetivo e ter um processo capaz de entender qualquer negocio e, a partir de perguntas e respostas estruturadas, gerar qualquer produto digital de forma progressivamente automatizada.

## Core Value

Transformar wireframes aprovados em sistemas funcionais automaticamente — o Blueprint e a ponte entre o que o cliente quer e o que o sistema entrega.

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
- ✓ CommentOverlay para feedback por tela/bloco no wireframe — existing

### Active

- [ ] Configuracao Tecnica como nova etapa da Fase 2 (fonte de dados, logica de negocio, auth, design system)
- [ ] Geracao automatica de sistema a partir do Blueprint + Config Tecnica (Fase 3)
- [ ] Sistema gerado em repo separado por cliente
- [ ] Dashboard BI como primeiro tipo de projeto suportado na Fase 3
- [ ] Claude sugere Config Tecnica, operador revisa e ajusta (hibrido)
- [ ] Sistema gerado funcional com dados reais do cliente

### Out of Scope

- Mobile apps — foco web-first, mobile e futuro
- SaaS completo como output da v1 — comecar com Dashboard BI, expandir depois
- Geracao de sistemas sem revisao humana — sempre semi-automatico com revisao
- Backend proprio no FXL Core — FXL Core e documentacao/tooling, sistemas de clientes vivem em repos separados

## Context

O processo FXL hoje vai ate a Fase 2 (wireframe aprovado). A Fase 3 (desenvolvimento) existe como documentacao mas nunca foi executada de forma estruturada. O gap entre wireframe aprovado e sistema real e significativo — falta especificacao de fontes de dados, logica de negocio, auth/permissoes e design system.

A proposta e criar uma nova etapa na Fase 2 chamada "Configuracao Tecnica" que serve como contrato entre Fase 2 e Fase 3. O fluxo completo da Fase 2 ficaria: Briefing → Blueprint → Wireframe → Branding → Configuracao Tecnica.

Ja existe 1 cliente mapeado (financeiro-conta-azul) com briefing, blueprint, branding e wireframe completos — candidato natural para piloto da Fase 3.

A stack dos sistemas gerados varia por projeto (nao necessariamente React + Vite). O FXL Core mantem a documentacao e tooling; cada sistema de cliente vive em seu proprio repositorio.

## Constraints

- **Stack FXL Core**: React 18 + TypeScript strict + Tailwind + Vite + Vercel — nao muda
- **Zero `any`**: TypeScript strict com `tsc --noEmit` como gate de aceite
- **Sem backend no Core**: FXL Core e estatico, sem API routes ou serverless
- **Blueprint prevalece**: Se blueprint e wireframe divergirem, blueprint e a fonte da verdade
- **Componentes compartilhados**: Nunca criar componentes locais em clients/ — tudo em tools/

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dashboard BI como primeiro tipo de projeto para Fase 3 | Mais previsivel — blueprint ja define quase tudo, menor distancia entre wireframe e sistema real | — Pending |
| Config Tecnica como nova etapa da Fase 2 (nao fase separada) | Mantem o fluxo linear da Fase 2, config tecnica e parte da especificacao nao da execucao | — Pending |
| Geracao hibrida (Claude sugere, operador revisa) | Automacao total e arriscada, revisao humana garante qualidade | — Pending |
| Sistema de cliente em repo separado | Isolamento, deploy independente, stack variavel por projeto | — Pending |

---
*Last updated: 2026-03-07 after initialization*
