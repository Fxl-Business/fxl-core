---
title: "Fase 3 - Configuracao Tecnica"
badge: Processo
description: "Como definir a configuracao tecnica que conecta wireframe a dados reais"
---

# Fase 3 - Configuracao Tecnica

A Configuracao Tecnica e o passo que conecta o wireframe visual a dados reais.
Ela define quais relatorios o cliente exporta, como cada coluna e mapeada,
quais formulas calculam os KPIs, e como cada secao do wireframe se liga aos dados.

O resultado desse passo e um **SKILL.md** -- um arquivo Markdown autocontido
que outra instancia do Claude Code consome para gerar o sistema funcional (Fase 6).

**Posicao no fluxo:**

Blueprint (Fase 2) + Branding (Fase 4) -> **Configuracao Tecnica** -> SKILL.md -> Geracao do Sistema (Fase 6)

---

## Operacao

### Fluxo do Processo

1. **Revisar briefing e blueprint do cliente**
   - Ler `clients/[slug]/docs/briefing.md` para entender fontes de dados, KPIs e regras de negocio
   - Ler `clients/[slug]/wireframe/blueprint.config.ts` para entender a estrutura de telas e secoes

2. **Gerar draft do TechnicalConfig com Claude Code**
   - Usar o prompt template abaixo para gerar um draft inicial
   - O draft cobre reportTypes, fields, formulas, manualInputs, settings, classifications, thresholds e bindings

3. **Revisar e ajustar o draft**
   - Verificar mapeamento de colunas (sourceColumn deve corresponder ao export real do cliente)
   - Verificar expressoes de formulas (referencias corretas, logica de calculo)
   - Verificar bindings (cada secao do blueprint deve ter um binding correspondente)

4. **Validar a configuracao**
   - Rodar `npx tsc --noEmit` para garantir zero erros de tipo
   - Rodar o validator para verificar cobertura e integridade de referencias

5. **Gerar SKILL.md via Config Resolver**
   - Usar `resolveConfig()` + `renderSkillMd()` para produzir o SKILL.md
   - O SKILL.md contera SQL, data layer, screens, branding e regras de implementacao

6. **Revisar SKILL.md e avancar para geracao**
   - Conferir que CREATE TABLE statements estao corretos
   - Conferir que todas as telas e secoes estao presentes
   - Usar o SKILL.md como entrada para a Fase 6 (Geracao do Sistema)

{% callout type="warning" %}
Sempre rode a validacao antes de gerar o SKILL.md. Erros de referencia ou bindings faltantes resultam em um sistema incompleto.
{% /callout %}

---

{% operational %}
### Prompt para Gerar Draft do TechnicalConfig

Use este prompt no Claude Code para gerar o draft da configuracao tecnica de um novo cliente.
Substitua `[slug]` pelo slug real do cliente.

{% prompt label="Gerar TechnicalConfig Draft" %}
Preciso criar a configuracao tecnica para o cliente [slug].

Antes de comecar, leia estes arquivos na ordem:

1. `clients/[slug]/docs/briefing.md` -- entenda as fontes de dados, KPIs, regras de negocio e metricas do cliente
2. `clients/[slug]/wireframe/blueprint.config.ts` -- entenda a estrutura de telas (screenId, sectionIndex, sectionType de cada secao)
3. `tools/wireframe-builder/types/technical.ts` -- o schema TypeScript que o arquivo deve seguir
4. `clients/financeiro-conta-azul/wireframe/technical.config.ts` -- exemplo completo de referencia

Com base no briefing e no blueprint, crie o arquivo:
`clients/[slug]/wireframe/technical.config.ts`

O arquivo deve:
- Exportar um `TechnicalConfig` como default
- Usar o mesmo slug do blueprint
- Definir `reportTypes` com mapeamento de colunas baseado nos exports reais do cliente
- Definir `fields` com agregacoes nomeadas para cada metrica mencionada no briefing
- Definir `formulas` para KPIs calculados (DRE, margens, percentuais)
- Definir `manualInputs` para entradas manuais do operador
- Definir `settings` para tabelas de configuracao editaveis
- Definir `classifications` para regras de categorizacao
- Definir `thresholds` para semaforizacao de KPIs
- Definir `bindings` para CADA secao do blueprint (um binding por secao, usando screenId + sectionIndex)

Apos criar, rode `npx tsc --noEmit` para garantir zero erros.
{% /prompt %}
{% /operational %}

{% operational %}
### Validacao do TechnicalConfig

Apos gerar ou editar um TechnicalConfig, valide usando:

**1. TypeScript check:**
```bash
npx tsc --noEmit
```
Deve retornar zero erros. Erros comuns:
- Tipo de `sectionType` incorreto no binding (deve corresponder ao tipo da secao no blueprint)
- Campo faltante em um binding (ex: `items` faltando em KpiGridBinding)
- Formato invalido em FormulaDefinition (deve ser `'currency' | 'percentage' | 'number'`)

**2. Config Validator:**

O validator (`tools/wireframe-builder/lib/config-validator.ts`) verifica:

| Check | O que valida | Como corrigir |
|---|---|---|
| Slug match | blueprint.slug === technical.slug | Corrigir o slug no TechnicalConfig |
| Missing binding | Cada secao do blueprint tem um binding | Adicionar binding com screenId + sectionIndex corretos |
| Invalid reference | Campos/formulas referenciados existem | Verificar IDs nos fields/formulas |
| Circular formula | Sem dependencias circulares entre formulas | Reorganizar cadeia de referencias |
| Orphan binding | Binding nao aponta para secao inexistente | Remover binding ou corrigir screenId/sectionIndex |
| Coverage | Porcentagem de secoes com binding | Meta: 100% (exceto info-blocks) |

**Resultado esperado:** `valid: true`, `coverage.percentage: 100`, zero erros.

Info blocks geram warnings (nao erros) quando sem binding -- isso e esperado para conteudo estatico.
{% /operational %}

---

## Estrutura do TechnicalConfig

Cada TechnicalConfig tem 3 camadas + bindings:

| Secao | O que define | Exemplo |
|---|---|---|
| `reportTypes` | Relatorios que o cliente exporta, com mapeamento de colunas | Contas a Receber, Contas a Pagar |
| `fields` | Agregacoes nomeadas sobre os dados importados | `receita_total = SUM(valorOriginal)` |
| `formulas` | Calculos derivados de fields e outras formulas | `margem = receita - custos` |
| `manualInputs` | Entradas manuais do operador (saldo inicial, ajustes) | Saldo Inicial do Mes |
| `settings` | Tabelas de configuracao editaveis | Categorias Financeiras, Contas Bancarias |
| `classifications` | Regras de categorizacao automatica | Tipo de Despesa (variavel/fixo/financeiro) |
| `thresholds` | Regras de semaforizacao (verde/amarelo/vermelho) | Margem >= 40% = verde |
| `bindings` | Ligacao de cada secao do blueprint a dados | screenId + sectionIndex -> fieldOrFormula |

### Bindings

Os bindings usam **enderecamento posicional**: cada binding tem um `screenId` e `sectionIndex`
que correspondem exatamente a posicao da secao no array `screens[].sections[]` do blueprint.

Existem 15 tipos de binding, um para cada tipo de secao do blueprint:
`kpi-grid`, `calculo-card`, `bar-line-chart`, `donut-chart`, `waterfall-chart`, `pareto-chart`,
`data-table`, `drill-down-table`, `clickable-table`, `saldo-banco`, `manual-input`,
`upload-section`, `config-table`, `info-block`, `chart-grid`.

---

## Exemplo

O cliente piloto possui uma configuracao tecnica completa:

**`clients/financeiro-conta-azul/wireframe/technical.config.ts`**

- 3 report types (Contas a Receber, Contas a Pagar, Extrato Bancario)
- 19 fields, 15 formulas
- 3 manual inputs, 4 settings tables
- 1 classification rule, 5 thresholds
- Bindings para todas as ~50 secoes em 10 telas

Use este arquivo como referencia ao criar TechnicalConfigs para novos clientes.
