# Skill — Wireframe Builder

## Identidade

Ferramenta AI-first para geracao de wireframes navegaveis em React.
Os componentes vivem em `tools/wireframe-builder/components/`.

## Quando usar

- Na Fase 2 do processo FXL (Wireframe Estrategico)
- Quando o Claude Code precisa gerar telas de wireframe para um cliente
- Quando precisa adicionar ou evoluir componentes do modulo de wireframe

## Como usar

O Claude Code importa componentes desta tool nas telas de wireframe do cliente:

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

---

## Padroes de construcao

### Padrao 1 — Blueprint como fonte da verdade

O Blueprint do cliente e a unica fonte de verdade do produto.
Nenhuma tela, componente ou comportamento pode existir no wireframe sem estar
previamente documentado no Blueprint.

**Fluxo obrigatorio para qualquer mudanca:**
1. Atualizar o Blueprint (`clients/[slug]/docs/blueprint.md`)
2. Atualizar o wireframe com base no Blueprint atualizado

Se o Blueprint e o wireframe divergirem, o Blueprint prevalece.
O wireframe deve sempre poder ser regenerado a partir do Blueprint sem surpresas.

### Padrao 2 — Qualidade visual obrigatoria

Todo wireframe deve seguir o padrao de qualidade abaixo:
- KpiCard com **sparkline embutido** (mini grafico de linha)
- KpiCard com **semaforo** (verde/amarelo/vermelho) quando o KPI tem meta
- Tabelas com **drill-down expansivel** (linhas pai/filho) onde aplicavel
- **Modal de detalhe** nas tabelas com `clickable-row`
- Graficos **donut** para distribuicoes percentuais
- Graficos **Pareto** (barra + linha acumulada) onde aplicavel
- Secoes de **input manual** dentro das telas (nao apenas tela dedicada)
- Sidebar do wireframe com fundo escuro (`#212121`) e itens com icone

Criar os componentes necessarios em `tools/wireframe-builder/components/` antes de implementar as telas.

### Padrao 3 — Comparacao temporal (Switch "Comparar")

**Principio:** nenhuma tela exibe comparativos por padrao. Todas as telas que
analisam um periodo possuem um switch "Comparar" na barra de filtros que,
quando ativado, expande a visualizacao com dados de um periodo de referencia.

**Modo padrao (switch OFF):**
- KPIs: valor + sparkline + semaforo (se houver meta). Sem variacao temporal.
- Graficos: dados exclusivamente do periodo selecionado no header.
- Tabelas: colunas do periodo atual apenas.

**Modo comparacao (switch ON):**
- Switch visivel no final da WireframeFilterBar.
- Ao ativar, aparece seletor de periodo de comparacao:
  - Telas mensais: seletor de mes/ano (default: mes anterior)
  - Telas anuais: seletor de ano (default: ano anterior)
- KPIs ganham linha de variacao (triangulo X% vs [periodo]).
- Graficos se adaptam com barras agrupadas (atual vs comparacao) ou linhas sobrepostas.
- Tabelas ganham colunas extras: periodo de comparacao + variacao %.

**Excecoes (sempre visiveis, independente do switch):**
- Sparklines nos KPIs: tendencia, nao comparacao.
- Semaforos nos KPIs: saude vs meta fixa, nao comparacao temporal.
- Comparacoes "Previsto vs Realizado" (ex: Fluxo de Caixa): intrinsecas ao mes.

**Regra global:** o modo comparativo NUNCA cria novos graficos ou cards.
Ele transforma internamente os blocos ja existentes, adicionando a dimensao
do periodo de comparacao dentro do mesmo componente. E proibido renderizar
condicionalmente um novo bloco exclusivamente quando `compareMode=true`.

### Padrao 4 — Tipo de Periodo Analisado

Toda tela que exibe KPIs deve declarar o campo **Tipo de Periodo Analisado**
no Blueprint do cliente. Este campo documenta o recorte temporal e orienta o wireframe.

Valores possiveis:
- **Analise Mensal** — exibe um unico mes por vez
- **Analise Acumulada (YTD)** — exibe do inicio do ano ate o mes selecionado
- **Analise de Periodo** — exibe um intervalo definido pelo usuario
- **Analise Diaria** — exibe dias dentro de um mes

### Padrao 5 — Exibicao do wireframe

O wireframe nao deve ser renderizado dentro do Layout da aplicacao.

1. A rota `/clients/[slug]/wireframe` (dentro do Layout) exibe apenas botao "Visualizar Wireframe"
2. O botao abre `/clients/[slug]/wireframe-view` em nova aba (`target="_blank"`)
3. A rota `/clients/[slug]/wireframe-view` fica fora do `<Route element={<Layout />}>` no `App.tsx`
4. O componente renderiza apenas: sidebar escura (`#212121`) + area de conteudo

---

## Invocacao como sub-agente

Quando Claude Code for invocado para tarefas de wireframe:
1. Ler este SKILL.md para regras e padroes
2. Ler `clients/[slug]/docs/blueprint.md` para dados do cliente
3. Ler `clients/[slug]/docs/branding.md` para identidade visual
4. Gerar/alterar arquivos em `clients/[slug]/wireframe/screens/`
5. Componentes: importar de `@tools/wireframe-builder/components/`

---

## Regras

- Nunca criar componentes locais na pasta do cliente
- Se uma tela exigir componente ainda nao existente, sinalizar antes de prosseguir
- Todo componente novo adicionado ao modulo deve ser documentado neste SKILL.md
- Nenhum wireframe deve incluir comparativos temporais hardcoded
