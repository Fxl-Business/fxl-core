---
title: Fase 4 — Auditoria
badge: Processo
description: Revisao de dados, seguranca e aderencia ao Blueprint
---

# Fase 4 — Auditoria e Validacao

Verifica que o sistema funciona corretamente antes da entrega.
A auditoria e executada por um profissional FXL — nao pelo desenvolvedor que construiu.

---

## Operacao

1. Atribuir auditor (diferente do desenvolvedor)
2. Aplicar o checklist base completo (ver abaixo)
3. Para BI Personalizado: gerar checklist especifico a partir do briefing (usar prompt abaixo)
4. Para Produto FXL: aplicar itens adicionais de Produto
5. Registrar resultado da auditoria (data, responsavel, itens aprovados, ressalvas, bloqueantes)
6. Zero itens bloqueantes → Fase 5

{% prompt label="Gerar Checklist de Auditoria" %}
Com base no Documento de Briefing deste projeto, gere o Checklist de Auditoria completo.

Incluir:
- Checklist base (todos os itens padrao)
- Itens especificos para cada KPI contratado
- Verificacoes especificas do segmento
- Regras de negocio que precisam ser testadas

[COLE O DOCUMENTO DE BRIEFING AQUI]
{% /prompt %}

### Checklist base — obrigatorio em todos os projetos

**Validacao de dados:**
- Faturamento total bate com relatorio de origem (tolerancia: 0%)
- Ticket medio = Faturamento / Pedidos (verificar para periodo filtrado)
- Margem bruta calculada corretamente (se aplicavel)
- Top rankings ordenados corretamente (verificar 3 primeiros e 3 ultimos)
- Totais e subtotais consistentes entre cards e tabelas

**Filtros e interacoes:**
- Filtro de periodo funciona e atualiza todos os KPIs
- Filtro de segmento/unidade isola corretamente os dados
- Seletor de periodo: mes atual como padrao ao abrir
- Drill-down funciona onde especificado

**Tela de Inputs:**
- Upload funciona com arquivo no formato esperado
- Dados aparecem no dashboard apos upload
- Feedback de erro claro para arquivo invalido
- Historico de uploads visivel (se aplicavel)

**UI e UX:**
- Skeleton loading aparece antes dos dados ao recarregar
- Sem erros de console
- Sem telas quebradas ou elementos desalinhados
- Responsivo: verificar em desktop e mobile

**Completude:**
- Todos os KPIs do briefing/definicao estao presentes
- Todas as telas do Blueprint estao implementadas
- Nomenclaturas consistentes com o briefing

---

## Detalhes

### Por tipo de projeto

#### BI Personalizado

**Itens adicionais:**
- KPIs especificos do cliente calculados corretamente
- Regras de negocio do segmento respeitadas
- Dados do cliente (nao dados de teste) carregados

#### Produto FXL

**Itens adicionais:**
- Sistema funciona com dados de multiplos perfis sem cruzamento
- Nenhum dado hardcoded de contexto especifico
- UI autoexplicativa sem dependencia de onboarding
- Para BI de Plataforma: testado com arquivo real exportado do software de origem
- Para SaaS: isolamento de dados entre tenants verificado

### Registro de auditoria

Apos a auditoria, registrar:
- Data da auditoria
- Responsavel
- Itens aprovados
- Itens com ressalva (nao bloqueantes)
- Itens bloqueantes (se houver)

### Criterio de avanco

**BI Personalizado:** Zero itens bloqueantes. Melhorias menores podem ser registradas para correcao, mas nao bloqueiam a entrega.

**Produto FXL:** Zero itens bloqueantes. Validacao interna pela equipe FXL.
