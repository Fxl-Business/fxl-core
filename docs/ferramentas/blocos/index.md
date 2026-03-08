---
title: Blocos Disponiveis
badge: Ferramentas
description: Especificacoes completas dos componentes do Wireframe Builder
---

# Blocos Disponiveis

Cada componente do Wireframe Builder tem uma spec dedicada descrevendo props, aparencia visual, estados condicionais e exemplo de uso no Blueprint. Use estas specs como prompt para criar ou recriar qualquer componente.

[Ver galeria de componentes](/ferramentas/wireframe-builder/galeria)

## Componentes

| Componente | Categoria | Descricao |
|---|---|---|
| [KpiCard](/ferramentas/blocos/kpi-card) | Cards | Card de indicador simples com valor, label e variacao |
| [KpiCardFull](/ferramentas/blocos/kpi-card-full) | Cards | Card de KPI expandido com sparkline, semaforo e modo comparacao |
| [CalculoCard](/ferramentas/blocos/calculo-card) | Cards | Cascata de calculo financeiro vertical com modo comparacao |
| [BarLineChart](/ferramentas/blocos/bar-line-chart) | Charts | Grafico de barras, linha ou barras+linha via recharts |
| [WaterfallChart](/ferramentas/blocos/waterfall-chart) | Charts | Grafico waterfall/cascata com barras flutuantes coloridas |
| [DonutChart](/ferramentas/blocos/donut-chart) | Charts | Grafico donut com legenda lateral e valor central |
| [ParetoChart](/ferramentas/blocos/pareto-chart) | Charts | Barras decrescentes com linha de % acumulado e eixo Y duplo |
| [DataTable](/ferramentas/blocos/data-table) | Tables | Tabela com colunas configuraveis e linhas placeholder |
| [DrillDownTable](/ferramentas/blocos/drill-down-table) | Tables | Tabela com linhas pai expansiveis e filhos ocultos |
| [ClickableTable](/ferramentas/blocos/clickable-table) | Tables | Tabela com onRowClick, hover destacado e cursor pointer |
| [ConfigTable](/ferramentas/blocos/config-table) | Tables | Tabela com selects inline, badges e acoes por linha |
| [WireframeSidebar](/ferramentas/blocos/wireframe-sidebar) | Layout | Menu lateral de navegacao entre telas |
| [WireframeHeader](/ferramentas/blocos/wireframe-header) | Layout | Header fixo com titulo e navegador de periodo |
| [WireframeFilterBar](/ferramentas/blocos/wireframe-filter-bar) | Layout | Barra de filtros sticky com switch Comparar |
| [GlobalFilters](/ferramentas/blocos/global-filters) | Layout | Filtros globais de periodo e segmento (legacy) |
| [WireframeModal](/ferramentas/blocos/wireframe-modal) | Layout | Modal centralizado com overlay e rodape |
| [DetailViewSwitcher](/ferramentas/blocos/detail-view-switcher) | Layout | Seletor pill/aba para alternar dimensao de detalhe |
| [CommentOverlay](/ferramentas/blocos/comment-overlay) | Layout | Overlay flutuante de comentarios por secao |
| [InputsScreen](/ferramentas/blocos/inputs-screen) | Inputs | Area de upload drag-and-drop (legacy) |
| [UploadSection](/ferramentas/blocos/upload-section) | Inputs | Drag-and-drop com feedback por linha e historico |
| [ManualInputSection](/ferramentas/blocos/manual-input-section) | Inputs | Formulario de ajuste manual com tabela CRUD inline |
| [SaldoBancoInput](/ferramentas/blocos/saldo-banco-input) | Inputs | Grid de campos de saldo por banco com total consolidado |

---

## Receitas de Tela

Combinacoes tipicas de blocos por objetivo de tela. Cada receita inclui dicas de layout (grid, empilhamento, posicionamento) para montar o Blueprint.

### DRE / Resultado Mensal

- WireframeFilterBar (showCompareSwitch=true, filters: segmento, unidade)
- 4x KpiCardFull in grid 4 col (value=R$, sub=%, compareMode, sparkline, semaforo)
- CalculoCard + WaterfallChart in grid 2 col 50/50 (both receive compareMode)
- DetailViewSwitcher above DrillDownTable (options: ["Por Grupo", "Por Categoria"])
- DrillDownTable (colunas condicionais: compareMode adiciona colunas periodo anterior + var%)

### Visao Analitica (Receita / Despesas)

- WireframeFilterBar (filters: segmento, unidade, centro de custo)
- 4x KpiCardFull in grid 4 col (value=R$, sub=%, sparkline)
- DonutChart + BarLineChart (type=bar) in grid 2 col 50/50
- BarLineChart (type=line) full width (evolucao temporal)
- 2x DataTable stacked full width

### Centro de Custo / Margens

- WireframeFilterBar (filters: segmento, unidade)
- 3x KpiCardFull in grid 3 col (value=R$, sub=%, sparkline)
- BarLineChart (type=bar) + DonutChart in grid 2 col 50/50
- DataTable full width

### Fluxo de Caixa Mensal

- SaldoBancoInput full width (saldo por banco com total)
- 4x KpiCardFull in grid 4 col (value=R$, sparkline)
- BarLineChart (type=line) full width (evolucao diaria)
- ClickableTable full width + WireframeModal (drill-down de dia)

### Fluxo de Caixa Anual

- ManualInputSection full width (ajustes manuais com CRUD)
- 3x KpiCardFull in grid 3 col (value=R$, sparkline)
- BarLineChart + BarLineChart in grid 2 col 50/50 (receita vs despesa)
- ClickableTable full width + WireframeModal (drill-down de mes)

### Indicadores de Desempenho

- WireframeFilterBar (filters: segmento, unidade, periodo)
- 6x KpiCardFull in grid 3 col, 2 rows (value com unidades variadas, sparkline)
- BarLineChart (type=bar) + ParetoChart in grid 2 col 50/50
- 2x DataTable stacked full width

### Upload / Inputs

- 2x UploadSection stacked full width (drag-and-drop com feedback por arquivo)
- DataTable full width (historico de importacoes)

### Configuracoes

- 4x ConfigTable stacked full width (cada uma com selects inline, badges e acoes Editar/Excluir)
