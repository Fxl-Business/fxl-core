---
title: Fase 2 — Wireframe Estrategico
badge: Processo
description: Blueprint, geracao de wireframe e aprovacao
---

# Fase 2 — Wireframe Estratégico

## Objetivo

Definir a arquitetura completa do produto antes de qualquer linha de código. O wireframe é aprovado antes do desenvolvimento — isso evita retrabalho caro.

> ⚠️ Não inicie o desenvolvimento sem aprovação formal do wireframe. Para BI Personalizado, a aprovação precisa ser do cliente. Para Produto, da equipe FXL.

---

## Arquitetura do processo

### Ambientes envolvidos

| Ambiente | Função na Fase 2 |
|---|---|
| Claude Project do Cliente | Analisa o Briefing e gera o Blueprint + prompt para Claude Code |
| Claude Code (`fxl`) | Gera os arquivos `.tsx` do wireframe usando componentes do módulo |
| `tools/wireframe-builder/components/` | Módulo oficial de componentes React reutilizáveis de wireframe |
| Nucleo FXL (Vercel) | Hospeda o app React com viewer de wireframe, docs de processo e overlay de comentários |

### Fluxo geral

1. Operador abre o Claude Project do cliente
2. Cola o Documento de Briefing validado (Fase 1)
3. Claude Project analisa o Briefing e gera o Blueprint tela a tela
4. Blueprint sai como prompt pronto para o Claude Code
5. Operador cola o prompt no Claude Code (`fxl`)
6. Claude Code gera os arquivos `.tsx` em `clients/[client-slug]/wireframe/screens/`
   usando componentes de `tools/wireframe-builder/components/`
7. Wireframe é publicado automaticamente via Vercel
8. Operador compartilha o link com o cliente
9. Cliente navega e usa o overlay de comentários por tela ou por bloco
10. Iterações até aprovação formal → Fase 3

### Módulo de componentes

O wireframe não é mais gerado como HTML puro. O Claude Code importa componentes
React pré-montados de `tools/wireframe-builder/components/`, passando dados fictícios
coerentes com o segmento do cliente. Componentes disponíveis:

- `KpiCard` — valor, rótulo, variação
- `BarLineChart` — gráfico de barras ou linha com dados fictícios
- `DataTable` — tabela com colunas configuráveis
- `InputsScreen` — tela de upload de dados
- `WireframeSidebar` — menu lateral de navegação entre telas
- `GlobalFilters` — filtros de período, segmento e outros
- `CommentOverlay` — overlay flutuante de comentários por tela/bloco

Se uma tela exigir um componente ainda não existente no módulo, o Claude Code
deve sinalizar antes de prosseguir — nunca criar componente local na pasta do cliente.

---

## Por tipo de projeto

### BI Personalizado

**Contexto:** Blueprint gerado a partir do Documento de Briefing. Cliente aprova visualmente antes do desenvolvimento.

#### Entradas

- Documento de Briefing validado (Fase 1)
- Biblioteca de KPIs (`docs/suporte/biblioteca_kpis.md`)
- Padrões de blocos (`docs/build/wireframe/blocos_disponiveis.md`)

#### Blueprint

Documento textual que descreve cada tela do sistema. Gerado pelo Claude Project "FXL — Wireframe Builder" a partir do Briefing.

**Para cada tela, especificar:**
- Nome da tela
- Objetivo (o que o usuário resolve nesta tela)
- Filtros disponíveis (período, segmento, unidade, etc.)
- Cards de KPI (nome, lógica de cálculo, comparativo)
- Gráficos (tipo, eixos, dados)
- Tabelas (colunas, ordenação padrão)
- Ações disponíveis (exportar, drill-down, etc.)

**Telas obrigatórias:**
- Dashboard principal (visão consolidada)
- Uma tela por módulo contratado
- Tela de Inputs (upload de dados)

#### Prompt — Gerar Blueprint (no Wireframe Builder)

{% prompt label="Prompt — Gerar Blueprint (Wireframe Builder)" %}
Analise o Documento de Briefing abaixo e gere o Blueprint completo.

Para cada tela: nome, objetivo, filtros, cards de KPI, gráficos e tabelas.
Inclua a tela de Inputs com instruções de upload.
Siga os padrões de blocos disponíveis em docs/build/wireframe/blocos_disponiveis.md.

Ao final, gere o Prompt de Wireframe pronto para colar no Claude Code.
O prompt deve instruir o Claude Code a gerar cada tela como arquivo .tsx,
importando os componentes de tools/wireframe-builder/components/ no repositório fxl.

[COLE O DOCUMENTO DE BRIEFING AQUI]
{% /prompt %}

#### Processo de revisão

1. Wireframe publicado na plataforma
2. Operador envia convite por email ao cliente
3. Cliente navega tela a tela na plataforma
4. Comentários por tela (observações gerais) e por elemento (ajustes específicos)
5. Equipe FXL analisa comentários e implementa ajustes
6. Novo ciclo de revisão até aprovação formal

#### Saída esperada

- Blueprint textual completo
- Prompt de Wireframe para Claude Code
- Wireframe em React/TSX publicado via Vercel no Nucleo FXL
- Comentários do cliente resolvidos
- Aprovação formal do cliente (escrita)

#### Critério de avanço

✅ Cliente visualiza o wireframe na plataforma e dá aprovação formal escrita. Sem aprovação, a Fase 3 não inicia.

---

### Produto FXL

**Contexto:** Idêntico ao BI Personalizado, exceto que a aprovação é interna. Não há cliente externo para validar — a equipe FXL decide quando o wireframe está aprovado.

#### Entradas

- Documento de Definição de Produto validado (Fase 1)
- Biblioteca de KPIs
- Padrões de blocos

#### Prompt — Gerar Blueprint (Produto)

{% prompt label="Prompt — Gerar Blueprint (Produto)" %}
Analise o Documento de Definição de Produto abaixo e gere o Blueprint completo.

Para cada tela: nome, objetivo, filtros, cards de KPI, gráficos e tabelas.
Inclua a tela de Inputs (se aplicável).
Considere que este é um produto para múltiplos usuários — a UI deve ser autoexplicativa.

Ao final, gere o Prompt de Wireframe pronto para colar no Claude Code.
O prompt deve instruir o Claude Code a gerar cada tela como arquivo .tsx,
importando os componentes de tools/wireframe-builder/components/ no repositório fxl.

[COLE O DOCUMENTO DE DEFINIÇÃO AQUI]
{% /prompt %}

#### Saída esperada

- Blueprint textual completo
- Prompt de Wireframe para Claude Code
- Wireframe em React/TSX publicado via Vercel no Nucleo FXL
- Aprovação interna da equipe FXL

#### Critério de avanço

✅ Equipe FXL aprova o wireframe internamente. Decisões de UI resolvidas.

---

## Checklist de validação MD ↔ React

- [ ] Seções BI Personalizado e Produto claramente separadas
- [ ] Prompts em blocos destacados usando componente PromptBlock
- [ ] Critérios de avanço diferenciados (cliente vs interno)
- [ ] Referências aos arquivos de suporte corretas
- [ ] Nenhuma referência ao Whimsical ou a HTML+CSS+JS
- [ ] Nenhuma referência a fxl-wireframes (repo inexistente)
- [ ] Fluxo com ambientes documentado
- [ ] Processo de revisão via Nucleo FXL (Vercel) documentado
