# Skill — Wireframe Builder

## Identidade

Ferramenta AI-first para geracao de wireframes navegaveis em React.
Os componentes vivem em `tools/wireframe-builder/components/`.

## Quando usar

- Na Fase 2 do processo FXL (Wireframe Estrategico)
- Quando o Claude Code precisa gerar telas de wireframe para um cliente
- Quando precisa adicionar ou evoluir componentes do modulo de wireframe

## Como usar

O Claude Code importa componentes desta skill nas telas de wireframe do cliente:

```tsx
import KpiCard from '@tools/wireframe-builder/components/KpiCard'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
```

## Componentes disponiveis

Todos os componentes usam dados ficticios por padrao, configuraveis via props.
Nenhum componente contem dados reais.

| Componente | Funcao |
|---|---|
| `KpiCard` | Valor, rotulo, variacao |
| `KpiCardFull` | KpiCard expandido com mais detalhes |
| `BarLineChart` | Grafico de barras/linha com dados ficticios |
| `DataTable` | Tabela com colunas configuraveis |
| `ClickableTable` | Tabela com linhas clicaveis |
| `DrillDownTable` | Tabela com drill-down hierarquico |
| `ConfigTable` | Tabela de configuracao editavel |
| `DonutChart` | Grafico de rosca |
| `ParetoChart` | Grafico de Pareto |
| `WaterfallChart` | Grafico de cascata |
| `CalculoCard` | Card com calculo/formula |
| `DetailViewSwitcher` | Alternador entre visoes de detalhe |
| `InputsScreen` | Tela de upload de dados |
| `UploadSection` | Secao de upload de arquivos |
| `ManualInputSection` | Secao de entrada manual de dados |
| `SaldoBancoInput` | Input especializado para saldo bancario |
| `WireframeSidebar` | Menu lateral de navegacao entre telas |
| `WireframeHeader` | Cabecalho do wireframe |
| `WireframeFilterBar` | Barra de filtros do wireframe |
| `WireframeModal` | Modal generico do wireframe |
| `GlobalFilters` | Filtros de periodo, segmento, etc. |
| `CommentOverlay` | Overlay flutuante de comentarios por tela/bloco |

## Regras

- Nunca criar componentes locais na pasta do cliente
- Se uma tela exigir componente ainda nao existente, sinalizar antes de prosseguir
- Todo componente novo adicionado ao modulo deve ser documentado neste SKILL.md
- Nenhum wireframe deve incluir comparativos temporais hardcoded
