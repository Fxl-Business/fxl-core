---
title: Blocos Disponiveis
badge: Referencias
description: Componentes disponiveis para Blueprint
---

# Blocos Disponíveis — Wireframe FXL

> Este documento vive em `docs/referencias/`.
> Atualizado em 2026-03-05 com padrão de qualidade baseado no wireframe HTML de referência.

---

## Padrão de qualidade

O wireframe React deve ter qualidade equivalente ao wireframe HTML puro.
Antes de implementar qualquer tela, verificar se os componentes necessários já existem.
**Nunca criar componentes locais na pasta do cliente.**

---

## Componentes disponíveis (`tools/wireframe-builder/components/`)

### ✅ Disponíveis

| Componente | Descrição | Limitações conhecidas |
|---|---|---|
| `KpiCard` | Valor, rótulo, variação positiva/negativa | Sem sparkline, sem semáforo |
| `BarLineChart` | Gráfico de barras, linha ou barras+linha | — |
| `DataTable` | Tabela com colunas configuráveis | Sem drill-down, sem clickable-row |
| `InputsScreen` | Área de upload drag-and-drop | Sem feedback de validação |
| `WireframeSidebar` | Menu lateral de navegação | Fundo branco, sem ícones |
| `GlobalFilters` | Filtros de período, segmento etc. | — |
| `CommentOverlay` | Overlay flutuante de comentários | — |
| `WireframeHeader` | Header fixo com título à esquerda, navegador de período centralizado (setas ‹ ›) e espaço direito vazio. Prop `periodType`: 'mensal' (‹ Mês / AA ›) · 'anual' (‹ AAAA ›) · 'none' (sem seletor). | Sempre no WireframeViewer — não instanciar nas telas individuais |
| `WireframeFilterBar` | Barra de filtros flutuante (sticky) com labels inline, search opcional e switch "Comparar" no final. Nunca incluir filtro de período. | Props: `filters`, `showSearch?`, `showCompareSwitch?`, `compareMode?`, `onCompareModeChange?`, `comparePeriodType?`, `comparePeriod?`, `onComparePeriodChange?` |
| `WaterfallChart` | Gráfico waterfall/cascata com barras flutuantes. Cores: verde (positive), vermelho (negative), azul (subtotal). | Props: `title`, `bars: WaterfallBar[]`, `height?` |

### ❌ Pendentes — criar em `tools/wireframe-builder/components/` antes de usar

| Componente | Descrição | Quando usar |
|---|---|---|
| `KpiCardFull` | KpiCard com sparkline SVG embutido e semáforo opcional (verde/amarelo/vermelho) | Qualquer KPI com meta ou tendência |
| `DonutChart` | Gráfico donut com legenda lateral e valor total no centro | Distribuição percentual |
| `ParetoChart` | Barras decrescentes + linha de % acumulado em vermelho, eixo Y duplo | Concentração de despesas/receitas |
| `DrillDownTable` | Tabela com linhas pai expansíveis (▸/▾) e filhos ocultos por padrão | DRE, agrupamentos hierárquicos |
| `ClickableTable` | Tabela com `onRowClick` — hover destacado, cursor pointer | Qualquer tabela que abra modal |
| `WireframeModal` | Modal centralizado com overlay, seções internas e rodapé de totais | Drill-down de dia/mês |
| `UploadSection` | Drag-and-drop com feedback ✅/❌ por linha e histórico de importações | Tela de Upload |
| `ManualInputSection` | Formulário de ajuste manual com tabela CRUD inline (Editar/Remover) | Fluxo Anual, inputs manuais |
| `SaldoBancoInput` | Grid de campos de saldo por banco com total consolidado automático | Fluxo de Caixa Mensal |
| `ConfigTable` | Tabela com selects inline e ações por linha (Editar/Excluir) | Tela de Configurações |
| `CalculoCard` | Cascata de cálculo financeiro vertical. Cada linha tem: operador opcional (−/=), label, valor R$, % s/ faturamento. Linhas com `highlight: true` recebem fundo diferenciado (linhas de resultado). Modo comparação: adiciona coluna período anterior + Var. %. Props: `title?`, `rows: CalculoRow[]`, `compareMode?`, `comparePeriodLabel?`. Tipo `CalculoRow`: `{ operator?: '(-)' \| '(=)' \| '(+)'; label: string; value: string; pct?: string; highlight?: boolean; valueCompare?: string; variation?: string }`. Regra de cor invertida: linhas com operador `(-)` invertem a lógica do `variationPositive` — custo que sobe é vermelho, custo que desce é verde. Todas as linhas exibem comparação no modo comparativo, não apenas as linhas highlight. | Tela 1 DFC — Resumo do Resultado |

> ⚠️ Se uma tela exigir um componente pendente, criar primeiro em `tools/wireframe-builder/components/`.
> Nunca criar componente local na pasta do cliente.

---

## Blocos por objetivo de tela

### Padrão global de filtros
- O filtro de período é sempre controlado pelo `WireframeHeader` — nunca duplicar nas telas
- Usar `WireframeFilterBar` no lugar de `GlobalFilters` em todas as novas telas
- `GlobalFilters` permanece disponível para compatibilidade com telas v1, mas não deve ser usado em telas novas

### Padrão de comparação temporal

> Padrão completo em `tools/wireframe-builder/SKILL.md` (Padrão 3 — Switch "Comparar").

Resumo: nenhuma tela exibe comparativos por padrão. O switch "Comparar" na WireframeFilterBar
ativa variações nos KPIs, barras agrupadas nos gráficos e colunas extras nas tabelas.
Sparklines, semáforos e "Previsto vs Realizado" são sempre visíveis.
O modo comparativo NUNCA cria novos blocos — transforma os existentes via prop `compareMode`.


### DRE / Resultado mensal
- WireframeFilterBar (com switch Comparar) · 4× KpiCardFull (value=R$, sub=%, compareMode) · Layout empilhado: CalculoCard + WaterfallChart (ambos recebem compareMode, transformam internamente) · DetailViewSwitcher · DrillDownTable (colunas condicionais)

### Visão analítica (Receita / Despesas)
- GlobalFilters · 4× KpiCardFull · DonutChart + BarLineChart (grid 2 col) · BarLineChart (evolução) · 2× DataTable

### Centro de Custo / Margens
- GlobalFilters · 3× KpiCardFull · BarLineChart + DonutChart (grid 2 col) · DataTable

### Fluxo de Caixa Mensal
- SaldoBancoInput · 4× KpiCardFull · BarLineChart (linha diária) · ClickableTable + WireframeModal

### Fluxo de Caixa Anual
- ManualInputSection · 3× KpiCardFull · BarLineChart + BarLineChart (grid 2 col) · ClickableTable + WireframeModal

### Indicadores de Desempenho
- GlobalFilters · 6× KpiCardFull · BarLineChart + ParetoChart (grid 2 col) · 2× DataTable

### Upload / Inputs
- 2× UploadSection · DataTable (histórico)

### Configurações
- 4× ConfigTable

---

## Padrão de exibição do wireframe

> Padrão completo em `tools/wireframe-builder/SKILL.md` (Padrão 5 — Exibição do wireframe).

O wireframe não é renderizado dentro do Layout. A rota `/clients/[slug]/wireframe-view`
fica fora do `<Route element={<Layout />}>` e renderiza sidebar escura + área de conteúdo.

---

### DetailViewSwitcher (novo — proposto em 2026-03-05)
- Seletor pill/aba em linha para alternar a dimensão de detalhe de uma DrillDownTable
- Props: `options: string[]` · `activeOption: string` · `onChange: (option: string) => void`
- Não afeta totais — apenas a estrutura dos filhos exibidos ao expandir uma linha pai
- Posição padrão: acima da tabela, alinhado à direita
- Usar sempre que uma DrillDownTable admitir múltiplas dimensões de abertura
- Telas que utilizam: Tela 1 — Resultado Mensal (DFC)

---

## Critério de qualidade

Cada bloco deve responder a uma pergunta real do usuário final.
Sparklines, semáforos, drill-downs e modais não são opcionais quando o Blueprint os especifica.
