---
title: Fase 2 — Wireframe Estrategico
badge: Processo
description: Blueprint, geracao de wireframe e aprovacao
---

# Fase 2 — Wireframe Estrategico

Define a arquitetura completa do produto antes de qualquer linha de codigo.
O wireframe e aprovado antes do desenvolvimento — isso evita retrabalho caro.

---

## Operacao

### BI Personalizado

1. Partir do Documento de Briefing validado (Fase 1)
2. Consultar os [Blocos Disponiveis](/referencias/blocos-disponiveis)
3. Gerar o Blueprint tela a tela (usar prompt abaixo)
4. O wireframe e gerado via Claude Code usando o [Wireframe Builder](/ferramentas/wireframe-builder)
5. Claude Code gera os arquivos `.tsx` em `clients/[slug]/wireframe/screens/` usando componentes de `tools/wireframe-builder/components/`
6. Wireframe publicado via Vercel
7. Compartilhar link com o cliente
8. Cliente navega e usa overlay de comentarios por tela ou bloco
9. Iterar ate aprovacao formal escrita → Fase 3

{% prompt label="Gerar Blueprint (BI Personalizado)" %}
Analise o Documento de Briefing abaixo e gere o Blueprint completo.

Para cada tela: nome, objetivo, filtros, cards de KPI, graficos e tabelas.
Inclua a tela de Inputs com instrucoes de upload.
Siga os padroes de blocos disponiveis em /referencias/blocos-disponiveis.

Ao final, gere o Prompt de Wireframe pronto para o Claude Code.
O prompt deve instruir o Claude Code a gerar cada tela como arquivo .tsx,
importando componentes de tools/wireframe-builder/components/.

[COLE O DOCUMENTO DE BRIEFING AQUI]
{% /prompt %}

### Produto FXL

1. Partir do Documento de Definicao de Produto (Fase 1)
2. Fluxo identico ao BI Personalizado
3. Diferenca: **aprovacao e interna** (equipe FXL decide)
4. Aprovacao interna atingida → Fase 3

{% prompt label="Gerar Blueprint (Produto)" %}
Analise o Documento de Definicao de Produto abaixo e gere o Blueprint completo.

Para cada tela: nome, objetivo, filtros, cards de KPI, graficos e tabelas.
Inclua a tela de Inputs (se aplicavel).
Considere que e um produto para multiplos usuarios — UI autoexplicativa.

Ao final, gere o Prompt de Wireframe pronto para o Claude Code.
O prompt deve instruir o Claude Code a gerar cada tela como arquivo .tsx,
importando componentes de tools/wireframe-builder/components/.

[COLE O DOCUMENTO DE DEFINICAO AQUI]
{% /prompt %}

{% callout type="warning" %}
Nao inicie o desenvolvimento sem aprovacao formal do wireframe.
Para BI Personalizado: aprovacao do cliente. Para Produto: aprovacao da equipe FXL.
{% /callout %}

---

## Detalhes

### Ambientes envolvidos

| Ambiente | Funcao na Fase 2 |
|----------|------------------|
| Claude Code (`fxl`) | Gera os arquivos `.tsx` do wireframe usando componentes do modulo |
| `tools/wireframe-builder/components/` | Modulo oficial de componentes React reutilizaveis de wireframe |
| Nucleo FXL (Vercel) | Hospeda o app React com viewer de wireframe e overlay de comentarios |

### Modulo de componentes

O wireframe usa componentes React pre-montados de `tools/wireframe-builder/components/`:

- `KpiCard` — valor, rotulo, variacao
- `BarLineChart` — grafico de barras ou linha com dados ficticios
- `DataTable` — tabela com colunas configuraveis
- `InputsScreen` — tela de upload de dados
- `WireframeSidebar` — menu lateral de navegacao entre telas
- `GlobalFilters` — filtros de periodo, segmento e outros
- `CommentOverlay` — overlay flutuante de comentarios por tela/bloco

Se uma tela exigir componente ainda nao existente no modulo, o Claude Code
deve sinalizar antes de prosseguir — nunca criar componente local na pasta do cliente.

### Blueprint — estrutura por tela

Para cada tela, especificar:
- Nome da tela e objetivo
- Filtros disponiveis (periodo, segmento, unidade)
- Cards de KPI (nome, logica de calculo, comparativo)
- Graficos (tipo, eixos, dados)
- Tabelas (colunas, ordenacao padrao)
- Acoes disponiveis (exportar, drill-down)

**Telas obrigatorias:** Dashboard principal, uma tela por modulo, tela de Inputs.

### Por tipo de projeto

#### BI Personalizado

**Entradas:** Documento de Briefing validado, [Blocos Disponiveis](/referencias/blocos-disponiveis).

**Processo de revisao:** Wireframe publicado → cliente navega → comentarios por tela/bloco → ajustes → novo ciclo ate aprovacao formal.

**Saida:** Blueprint textual + wireframe React/TSX publicado + aprovacao formal do cliente.

#### Produto FXL

**Entradas:** Documento de Definicao de Produto, [Blocos Disponiveis](/referencias/blocos-disponiveis).

**Saida:** Blueprint textual + wireframe React/TSX publicado + aprovacao interna FXL.

### Criterio de avanco

**BI Personalizado:** Cliente visualiza o wireframe na plataforma e da aprovacao formal escrita. Sem aprovacao, a Fase 3 nao inicia.

**Produto FXL:** Equipe FXL aprova o wireframe internamente. Decisoes de UI resolvidas.
