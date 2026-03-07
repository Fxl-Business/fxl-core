# Blueprint — Financeiro Conta Azul

> Status: **Aprovado — Revisão v2 em 2026-03-05**
> Revisão baseada no wireframe HTML de referência aprovado internamente.
>
> **Fonte da verdade:** `wireframe/blueprint.config.ts` — o wireframe é gerado dinamicamente a partir deste arquivo.
> Este documento serve como referência narrativa da arquitetura de telas.

---

## Visão Geral

| Campo | Valor |
|---|---|
| Slug | `financeiro-conta-azul` |
| Tipo | BI Personalizado |
| Fonte de dados | Exportações XLS/XLSX/CSV do Conta Azul (Contas a Receber + Contas a Pagar) |
| Telas planejadas | 10 |
| Módulos | DRE · Receita · Despesas · Centro de Custo · Margens · Fluxo Mensal · Fluxo Anual · Indicadores · Upload · Configurações |

---

## Comparação temporal por tela

> Padrão detalhado em `tools/wireframe-builder/SKILL.md` (Padrão 3 — Switch "Comparar").

| Tela | Tipo | Switch |
|---|---|---|
| 1 — DFC | Mensal | Comparar com mês X |
| 2 — Receita | Mensal | Comparar com mês X |
| 3 — Despesas | Mensal | Comparar com mês X |
| 4 — Centro de Custo | Mensal | Comparar com mês X |
| 5 — Margens | Mensal | Comparar com mês X |
| 6 — Fluxo Mensal | Mensal | Comparar com mês X |
| 7 — Fluxo Anual | Anual | Comparar com ano X |
| 8 — Indicadores | Mensal | Comparar com mês X |
| 9 — Upload | — | Sem switch |
| 10 — Configurações | — | Sem switch |

---

## Tela 1 — Resultado Mensal (DFC)

**Objetivo:** Visão do resultado gerencial estruturada com drill-down por linha,
com capacidade de alternar a dimensão de detalhe sem alterar os totais.

**Tipo de Período Analisado:** Análise Mensal — exibe um único mês por vez.

### Filtros

- Centro de Custo · Switch "Comparar" (padrão: OFF)

### KPIs (com sparkline)

| KPI | Valor primário | Valor secundário | Comparação (switch ON) | Lógica |
|---|---|---|---|---|
| Receita Total | R$ (valor absoluto) | — | ▲/▼ X,X% vs Período | Soma de entradas |
| Margem de Contribuição | R$ (valor absoluto) | % s/ receita | ▲/▼ X,X% vs Período | Receita − Custos Variáveis |
| Resultado Operacional | R$ (valor absoluto) | % s/ receita | ▲/▼ X,X% vs Período | MC − Custos Fixos |
| Resultado Final / EBITDA | R$ (valor absoluto) | % s/ receita | ▲/▼ X,X% vs Período | RO − Despesas Financeiras |

Regra: o número em destaque no card é sempre o valor financeiro (R$).
A percentagem aparece como subtexto secundário abaixo do valor.
Nenhum KPI desta tela usa semáforo. A comparação temporal (▲/▼ % vs Período) aparece apenas com switch "Comparar" ativado.

### Gráficos

**Layout empilhado (1 bloco por linha) — sempre visível (modo padrão e modo comparação):**

- Linha 1: `CalculoCard` — Resumo do Resultado (cascata de cálculo) — largura total
- Linha 2: `WaterfallChart` — Resultado do Mês (cascata visual) — largura total

**Modo padrão (switch OFF):**

- `CalculoCard`: exibe apenas colunas "Linha" e "Mês Atual (R$)" e "% s/ Faturamento"
- `WaterfallChart`: barras simples por item (comportamento atual)

**Modo comparação (switch ON):**

- `CalculoCard`: adiciona colunas "Período Comparado (R$)" e "Var. %" — sem criar novo componente

> **Regra de inversão de cor para itens de subtração no CalculoCard:**
> Linhas com operador `(-)` (custos e despesas) usam lógica de cor invertida no Var. %:
> - Verde quando o custo diminui (▼) — favorável ao resultado
> - Vermelho quando o custo aumenta (▲) — desfavorável ao resultado
> Linhas de resultado `(=)` e de receita usam lógica normal:
> - Verde quando sobe (▲), vermelho quando desce (▼)
>
> No modo comparação, TODAS as linhas do CalculoCard exibem comparação (Período Anterior + Var. %),
> não apenas as linhas de resultado (highlight). Os itens Faturamento, Custos Variáveis,
> Custos Fixos e Despesas Financeiras também mostram seus valores comparados.
- `WaterfallChart`: cada barra se desdobra em duas colunas agrupadas (atual: cor saturada / comparação: cor dessaturada) — sem criar novo componente ao lado

> ⚠️ Regra global de comparação: o modo comparativo NUNCA cria novos gráficos ou cards.
> Ele transforma internamente os blocos já existentes, adicionando a dimensão do período
> de comparação dentro do mesmo componente. Qualquer gráfico ou card que apareça
> exclusivamente no modo comparativo viola este padrão.

### Seletor de Visualização do Detalhe (DetailViewSwitcher)

- Posição: acima da tabela, alinhado à direita
- Opções: `Grupo de Despesa` · `Centro de Custo` · `Categoria` · `Forma de Pagamento`
- Os totais de cada linha pai não se alteram ao trocar a visualização
- Apenas os filhos (linhas expandidas) mudam de agrupamento

### Tabela — DFC Gerencial com drill-down expansível

- Linhas pai (clicáveis): Receita Total · Custos Variáveis · Margem de Contribuição
  · Custos Fixos · Resultado Operacional · Despesas Financeiras · Resultado Final
- Linhas filho: agrupadas conforme o DetailViewSwitcher ativo
- Colunas modo padrão: Linha · Mês Atual (R$) · % s/ Receita
- Colunas modo comparação: + Período comparado · Var. %
- Linhas de total em negrito com fundo diferenciado

> ⚠️ Empréstimos estão fora do escopo desta versão. A linha "Despesas Financeiras" contempla apenas tarifas bancárias, IOF, juros e multas.

---

## Tela 2 — Visão por Receita

**Objetivo:** Análise detalhada de entradas — distribuição, evolução e top clientes.

**Tipo de Período Analisado:** Análise Mensal — exibe valores do mês selecionado. Comparativos históricos (mês anterior, média 3M, 6M, ano ant.) são exibidos nas tabelas como contexto de análise.

### Filtros

- Período · Categoria · Centro de Custo · Cliente

### KPIs (com sparkline onde aplicável)

| KPI | Detalhe |
|---|---|
| Receita Total Prevista | variação vs anterior |
| Receitas Recebidas | % recebido |
| Receitas a Vencer | nº de títulos |
| Receitas Vencidas | % inadimplência + semáforo |

### Gráficos

**Modo padrão:**

- Donut: Distribuição por Status (Recebida / A Vencer / Vencida)
- Barras: Receita por Categoria

**Modo comparação:**

- Donut: mantém
- Barras agrupadas: Receita por Categoria — atual vs comparação
- Barras agrupadas: Receita por Status — atual vs comparação

### Tabelas

- Top Clientes por Receita — # · Cliente · Prevista · Recebida · Em Aberto · Status · % s/ Total
- Receita por Categoria — Categoria · Atual · % s/ Total | + Anterior · Var. % (modo comparação)

---

## Tela 3 — Visão por Despesas

**Objetivo:** Análise detalhada de saídas por grupo, categoria e evolução.

**Tipo de Período Analisado:** Análise Mensal — exibe valores do mês selecionado. Comparativos históricos são exibidos nas tabelas como contexto de análise.

### Filtros

- Período · Grupo de Despesa (Variáveis / Fixos / Financeiros) · Centro de Custo

### KPIs (com sparkline)

| KPI | Detalhe |
|---|---|
| Despesa Total Prevista | % sobre faturamento |
| Despesas Pagas | % do total pago |
| Despesas a Vencer | nº de títulos |
| Despesas Vencidas | % do total + semáforo |

### Gráficos

**Modo padrão:**

- Donut: Participação por Grupo (Variáveis / Fixos / Financeiros)
- Barras: Despesa por Grupo

**Modo comparação:**

- Donut: mantém
- Barras agrupadas: Despesa por Grupo — atual vs comparação
- Barras agrupadas: Despesa por Status — atual vs comparação

### Tabela

- Análise por Categoria — Categoria · Grupo · Tipo · Atual · % s/ Receita | + Anterior · Var. % (modo comparação)

---

## Tela 4 — Visão por Centro de Custo

**Objetivo:** Comparar performance financeira entre unidades/centros de custo.

**Tipo de Período Analisado:** Análise Mensal — exibe a DRE por Centro de Custo do mês selecionado.

### Filtros

- Período · Centro de Custo

### KPIs

- Receita Total (CCs) · Custo Total Alocado · Resultado Consolidado

### Gráficos

- Barras agrupadas: Receita × Custo × Resultado por CC
- Donut: % Participação de cada CC na Receita Total

### Tabela

- DRE por Centro de Custo — CC · Receita · C. Variáveis · M. Contribuição · % Margem · C. Fixos · Result. Operac. · % · D. Financeiras · Result. Final · % Partic.
- Linha de total consolidado em negrito

---

## Tela 5 — Margens Reais da Operação

**Objetivo:** Monitorar evolução e saúde das três margens com semáforos configuráveis.

**Tipo de Período Analisado:** Análise Mensal — os KPIs exibem as margens (%) do mês selecionado. O gráfico de linha de 12 meses e o comparativo YoY são visualizações de contexto, não alteram o recorte dos KPIs.

### Filtros

- Período

### KPIs (obrigatoriamente com semáforo)

| KPI | Verde | Amarelo | Vermelho |
|---|---|---|---|
| % Margem de Contribuição | ≥ 40% | 20%–39% | < 20% |
| % Resultado Operacional | ≥ 15% | 5%–14% | < 5% |
| % Resultado Final / EBITDA | ≥ 10% | 3%–9% | < 3% |

> Metas configuráveis pela Tela 10 — Configurações.

### Gráficos

**Modo padrão:**

- Barras empilhadas: Composição do Resultado (% sobre Faturamento)

**Modo comparação:**

- Barras empilhadas: mantém
- Barras agrupadas: Margens atuais vs período de comparação (MC%, RO%, RF%)

---

## Tela 6 — Fluxo de Caixa Mensal

**Objetivo:** Projetar saldo diário com base nos títulos e saldo bancário informado.

**Tipo de Período Analisado:** Análise Mensal — os KPIs exibem totais do mês selecionado (saldo inicial, receitas previstas, despesas previstas, saldo final projetado). O gráfico de linha diária é uma visualização interna do mês e não altera o recorte dos KPIs.

### Seção de Input Manual (topo)

- Campo por banco: Saldo atual (Sicoob, Itaú, Caixa Físico...)
- Total calculado automaticamente = Saldo Inicial do Período

### KPIs

| KPI | Detalhe |
|---|---|
| Saldo Inicial Consolidado | data de referência |
| Total Receitas Previstas | nº de títulos |
| Total Despesas Previstas | nº de títulos |
| Saldo Final Projetado | semáforo + contagem de dias críticos + menor saldo do mês |

### Gráfico

- Linha: Saldo Diário Projetado — dia a dia do mês
- Linha de zero em destaque vermelho
- Círculos nos dias com saldo negativo

### Tabela com drill-down (modal)

- Fluxo Diário — Data · Entradas · Saídas · Saldo do Dia · Saldo Acumulado · Status
- Clicar abre Modal com lançamentos de entrada e saída do dia, totais e saldo

---

## Tela 7 — Fluxo de Caixa Anual Projetado

**Objetivo:** Projeção mensal do ano com títulos do Conta Azul + ajustes manuais.

**Tipo de Período Analisado:** Análise Anual — os KPIs exibem totais do ano selecionado (Jan–Dez). O seletor de período no header exibe apenas o ano.

### Seção de Input Manual

- Saldo Inicial do Período (campo único)
- Formulário Receita Manual: Valor · Mês · Categoria · Centro de Custo · Descrição
- Formulário Despesa Manual: Valor · Mês · Grupo · Categoria · Centro de Custo · Descrição
- Tabela de ajustes cadastrados com Editar / Remover

### KPIs

- Total Receitas no Período (média mensal) · Total Despesas no Período · Saldo Final Projetado (com sparkline)

### Gráficos

- Barras agrupadas: Receitas vs Despesas por mês
- Linha: Saldo Acumulado Projetado por mês

### Tabela com drill-down (modal)

- Projeção Mensal — Mês · Saldo Inicial · Rec. Conta Azul · Rec. Manuais · Desp. Conta Azul · Desp. Manuais · Resultado · Saldo Final · Status
- Clicar abre Modal com: títulos a receber, títulos a pagar, ajustes manuais, top categorias

---

## Tela 8 — Indicadores de Desempenho

**Objetivo:** Painel consolidado de todos os KPIs com semáforos, sparklines e comparativos YoY.

**Tipo de Período Analisado:** Análise Mensal — os KPIs exibem valores do mês selecionado. Os comparativos (mês anterior, mesmo mês ano ant., média anual, trimestre vs trimestre anterior) são o contexto de análise exibido em cada card.

### Filtros

- Período · Centro de Custo

### KPIs (todos com sparkline + semáforo)

- Receita do Mês · Despesas do Mês · % Margem de Contribuição · % Resultado Operacional · % Inadimplência · % Despesas Vencidas

### Gráficos

**Modo padrão:**

- Pareto: Top categorias de despesa (barras + linha acumulada em vermelho)

**Modo comparação:**

- Barras agrupadas: KPIs do Mês vs período de comparação
- Pareto: mantém

### Tabela

- Painel de KPIs — Indicador · Valor Atual · Meta · Status · Tendência | + Mês Ant. · Ano Ant. (modo comparação)

---

## Tela 9 — Upload de Relatórios

**Objetivo:** Importar exportações do Conta Azul com validação automática de estrutura.

### Uploads (um por tipo)

- Contas a Receber — drag-and-drop (XLS, XLSX, CSV)
- Contas a Pagar — drag-and-drop (XLS, XLSX, CSV)

### Feedback de validação

- ✅ Sucesso: registros + período + botão Confirmar Import
- ❌ Erro: lista de erros por linha com descrição
- Validações exibidas: Colunas obrigatórias · Formato de datas · Valores numéricos · Trim em categorias · Valores negativos

### Tabela

- Histórico de Importações — Data · Tipo · Período · Registros · Status · Ações (Ver detalhes / Remover)

---

## Tela 10 — Configurações

**Objetivo:** Parametrizar grupos de despesa, bancos, semáforos e vínculos de categorias.

### Seções

1. Grupos de Despesa — CRUD: Nome · Tipo (Variável/Fixo/Financeiro) · Categorias Vinculadas
2. Mapeamento de Bancos — CRUD: Cód. Conta Azul · Nome · Apelido · Tipo · Ativo
3. Semáforos por Indicador — Editar limites Verde/Amarelo/Vermelho por KPI
4. Vínculo Categoria → Grupo — Select inline: cada categoria do Conta Azul vinculada a um grupo

