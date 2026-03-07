---
title: Visao Geral do Processo FXL
badge: Processo
description: Visao geral do processo FXL — tipos de projeto, roteamento e ciclo de vida
---

# Visao Geral do Processo FXL

O processo FXL converte informacao de negocio em produtos digitais funcionais.
Sao 6 fases sequenciais — do diagnostico ate o tutorial de uso — operadas via Claude Code com GSD.

---

## Tipos de projeto

A FXL trabalha com dois tipos de projeto. Cada tipo segue as mesmas 6 fases,
mas com diferencas no fluxo de aprovacao e no escopo.

| Tipo | Quando usar | Aprovacao |
|------|-------------|-----------|
| **BI Personalizado** | Cliente especifico, dados proprios, escopo sob demanda | Cliente externo |
| **Produto FXL** | Escopo interno, multi-tenant, SaaS ou sistema proprio | Equipe FXL |

Para detalhes completos de cada tipo, veja [Cliente vs Produto](/processo/cliente-vs-produto).

---

## Roteamento

Antes de iniciar qualquer projeto:

1. Classificar como **BI Personalizado** ou **Produto FXL**
2. Validar a fase atual e o criterio de avanco da fase anterior
3. Identificar quais documentos e arquivos serao afetados
4. Executar a fase correspondente

Se o projeto e para um cliente especifico com dados unicos -> BI Personalizado.
Se o escopo e definido internamente e pode atender multiplos usuarios -> Produto FXL.

---

## Ciclo de vida — 6 fases

| Fase | Nome | O que acontece |
|------|------|----------------|
| 1 | [Diagnostico](/processo/fases/fase1) | Coleta de informacoes, briefing e definicao de escopo |
| 2 | [Wireframe](/processo/fases/fase2) | Blueprint tela a tela e wireframe navegavel em React |
| 3 | [Desenvolvimento](/processo/fases/fase3) | Sprints de codigo seguindo o Blueprint aprovado |
| 4 | [Auditoria](/processo/fases/fase4) | Revisao de dados, seguranca e aderencia ao Blueprint |
| 5 | [Entrega](/processo/fases/fase5) | Handoff ao cliente ou lancamento do produto |
| 6 | [Tutorial](/processo/fases/fase6) | Material de adocao compativel com o usuario |

Cada fase tem criterio de avanco — sem cumpri-lo, a proxima fase nao inicia.

---

## Workflow operacional — Claude Code com GSD

O operador trabalha diretamente no Claude Code com o framework GSD (Get Shit Done).
A IA e tratada como equipe de desenvolvimento — Skills substituem bases de conhecimento,
Agents substituem instrucoes customizadas, e comandos GSD substituem construcao manual de prompts.

**Fluxo padrao:**

1. Abrir Claude Code na raiz do repositorio `fxl`
2. O Claude Code carrega `CLAUDE.md` automaticamente (regras do monorepo)
3. Para projetos de cliente: contexto em `clients/[slug]/CLAUDE.md`
4. Usar comandos GSD para planejar e executar tarefas:
   - `/gsd:plan-phase` — planejar uma fase de trabalho
   - `/gsd:execute-phase` — executar planos de uma fase
5. Commit seguindo a convencao do projeto

**Contexto de projeto:** Cada projeto tem seu `CLAUDE.md` que define identidade, stack, regras
e referencias. O Claude Code le esse arquivo automaticamente ao abrir o repositorio.
Nao e necessario copiar ou colar prompts — o contexto e injetado diretamente.

**Contexto de cliente:** Todo conhecimento do cliente vive em `clients/[slug]/` —
briefing, blueprint, branding e wireframe. O Claude Code le esses arquivos diretamente.

---

## Regra de evolucao do processo

Toda alteracao estrutural no processo deve verificar impacto em:
- `docs/processo/fases/` — detalhamento de cada fase
- `docs/processo/` — paginas de processo e roteamento
- Secao [Padroes](/padroes/index) — se a mudanca afeta padronizacao tecnica
