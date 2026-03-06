# Briefing — Financeiro Conta Azul

> Documento formalizado via sessão no Claude Project FXL.
> Gerado com base no Briefing Master e validação da estrutura dos Inputs reais do Conta Azul.

---

## Contexto do produto

- **Produto:** Financeiro Conta Azul
- **Tipo:** BI de Plataforma (Produto FXL)
- **Sistema de origem:** Conta Azul — software de gestão financeira para empresas
- **Objetivo:** Dashboard financeiro que lê os relatórios exportados do Conta Azul e entrega visão consolidada de DRE Gerencial, Fluxo de Caixa, Inadimplência e Margens por Centro de Custo.
- **Público-alvo:** Qualquer empresa que utilize o Conta Azul como sistema financeiro, independente de segmento ou porte.
- **Aprovação:** Interna FXL (produto próprio — não depende de aprovação de cliente externo).

---

## Premissa central

O produto é **agnóstico de segmento**. Os campos `Categoria` e `Centro de Custo` presentes nos exports do Conta Azul são genéricos e preenchidos pela própria empresa usuária. O Dashboard lê e organiza esses campos sem assumir nenhum tipo de negócio específico.

---

## Fonte de dados

- **Relatórios utilizados:** Visão Contas a Receber + Visão Contas a Pagar
- **Formato de importação:** Excel / CSV
- **Periodicidade:** Manual, por mês. A tela de Inputs permite subir dois arquivos por mês (a receber + a pagar) para qualquer mês do ano.
- **API futura:** Prevista, fora do escopo desta versão.

### Estrutura confirmada — Contas a Receber

| Campo | Uso no sistema |
|---|---|
| Nome do cliente | Ranking e filtro por cliente |
| Data de competência | Período de referência |
| Data de vencimento | Classificação de status (pago / a vencer / vencido) |
| Data do último pagamento | Confirmação de recebimento |
| Valor original da parcela (R$) | Receita prevista |
| Valor recebido da parcela (R$) | Receita recebida |
| Valor da parcela em aberto (R$) | Inadimplência / a vencer |
| Categoria 1 | Agrupamento de receita (definido pelo usuário) |
| Centro de Custo 1 | Unidade de negócio (definida pelo usuário) |

### Estrutura confirmada — Contas a Pagar

| Campo | Uso no sistema |
|---|---|
| Nome do fornecedor | Ranking e filtro por fornecedor |
| Data de competência | Período de referência |
| Data de vencimento | Classificação de status (pago / a vencer / vencido) |
| Data do último pagamento | Confirmação de pagamento |
| Valor original da parcela (R$) | Despesa prevista |
| Valor pago da parcela (R$) | Despesa realizada |
| Valor da parcela em aberto (R$) | Passivo em aberto |
| Categoria 1 | Natureza da despesa (definida pelo usuário) |
| Centro de Custo 1 | Unidade de negócio (definida pelo usuário) |

---

## Módulos do produto

### 1. Resultado Mensal (DRE Gerencial)
Estrutura obrigatória da DRE:

```
Receita Total
(-) Custos Operacionais Variáveis
= Margem de Contribuição
(-) Custos Fixos
= Resultado Operacional
(-) Despesas Financeiras
= Resultado Final / EBITDA
```

> Empréstimos fora do escopo v1. Despesas Financeiras = tarifas, IOF, juros, multas.

Exibição por KPI: valor absoluto, % sobre faturamento, comparativo com mês anterior, mesmo mês ano anterior e média anual.

### 2. Visão por Receita
Receita prevista, recebida, vencida e a vencer. Ranking por cliente e por categoria. Comparativos mensais e anuais.

### 3. Visão por Despesa
Total previsto, pago, vencido e a vencer. Filtro por grupo de despesa, categoria e centro de custo. Comparativos mensais e por média.

### 4. Visão por Centro de Custo
Resultado por unidade: receita, custos variáveis, margem, custos fixos, resultado final. Comparativo anual e trimestral.

### 5. Margens Reais da Operação
Visão simplificada de faturamento, custos e margens em % do faturamento. Evolução mensal e anual. Comparação com ano anterior.

### 6. Fluxo de Caixa Mensal (Diário)
Tabela dia a dia com saldo inicial, receitas e despesas previstas, saldo final projetado e semaforização.

- Saldo inicial do mês: **inserido manualmente pelo usuário**
- Saldo inicial de cada dia = saldo final do dia anterior
- Semaforização fixa: Verde ≥ R$ 10.000 / Amarelo entre R$ 0 e R$ 10.000 / Vermelho ≤ R$ 0

### 7. Fluxo de Caixa Anual Projetado
Projeção mensal com saldo inicial, receitas e despesas do Conta Azul + inputs manuais ilimitados. Simulação de cenários. Identificação automática de meses deficitários.

### 8. Indicadores de Desempenho
Painéis com semaforização para Receita, Despesa, Margem, EBITDA e Caixa. Comparativos: mês vs anterior, mês vs mesmo mês ano anterior, mês vs média anual, trimestre vs trimestre anterior.

### 9. Configurações
- Cadastro de grupos de despesa (Variável / Fixo / Financeiro) com vinculação de categorias
- Cadastro de Centros de Custo
- Cadastro de bancos (nome + status ativo/inativo) com input manual de saldo

---

## KPIs confirmados

> Todos validados com base nas colunas reais do export padrão do Conta Azul.

### Receita
- Receita Total Prevista
- Receita Recebida
- Receita Vencida (inadimplência)
- Receita a Vencer
- % Recebido sobre total previsto
- % Inadimplência

### Despesa
- Total Previsto
- Total Pago
- Total Vencido
- Total a Vencer

### DRE / Margens
- Margem de Contribuição (R$ e %)
- Resultado Operacional (R$ e %)
- Resultado Final / EBITDA (R$ e %)
- Custos Operacionais Variáveis (% sobre faturamento)
- Custos Fixos (% sobre faturamento)

### Caixa
- Saldo inicial (manual)
- Saldo projetado dia a dia
- Saldo final projetado
- Saldo consolidado multi-banco

---

## KPIs sugeridos (aguardando validação interna)

- Ticket médio por categoria de receita
- % de crescimento mensal da receita
- Receita por Centro de Custo

## KPIs bloqueados (desejados, sem campo disponível no export padrão)

- CMV — requer informação não presente no export do Conta Azul
- Margem por cliente — requer cruzamento não disponível no relatório padrão

---

## Classificação automática de status

| Condição | Status |
|---|---|
| Valor pago / recebido preenchido | **Pago / Recebido** |
| Não pago e vencimento > hoje | **A vencer** |
| Não pago e vencimento ≤ hoje | **Vencido** |

Aplicável a Contas a Receber e Contas a Pagar.

---

## Regras de negócio

- Um lançamento pertence a **um único Centro de Custo**
- A classificação das categorias como Variável / Fixo / Financeiro é feita pelo usuário nas Configurações
- Não há controle de acesso ou perfis de usuário nesta versão
- Semaforização do Fluxo de Caixa com limite fixo de R$ 10.000

---

## Próximos passos

1. ✅ Briefing formalizado
2. ⬜ Sessão de Branding — definir paleta, tipografia, logo
3. ⬜ Executar sessão de Blueprint com base neste Briefing
4. ⬜ Gerar wireframe via Claude Code

> Regra de processo estabelecida em 2026-03-05: Blueprint é fonte da verdade.
> Nenhuma mudança no wireframe sem prévia atualização do Blueprint.
