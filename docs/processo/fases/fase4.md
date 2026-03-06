---
title: Fase 4 — Auditoria
badge: Processo
description: Revisao de dados, seguranca e aderencia ao Blueprint
---

# Fase 4 — Auditoria e Validação

## Objetivo

Verificar que o sistema funciona corretamente antes da entrega. A auditoria é executada por um profissional FXL — não pelo desenvolvedor que construiu.

---

## Checklist base — obrigatório em todos os projetos

### Validação de dados
- [ ] Faturamento total bate com relatório de origem (tolerância: 0%)
- [ ] Ticket médio = Faturamento ÷ Pedidos (verificar para período filtrado)
- [ ] Margem bruta calculada corretamente (se aplicável)
- [ ] Top rankings ordenados corretamente (verificar 3 primeiros e 3 últimos)
- [ ] Totais e subtotais consistentes entre cards e tabelas

### Filtros e interações
- [ ] Filtro de período funciona e atualiza todos os KPIs
- [ ] Filtro de segmento/unidade isola corretamente os dados
- [ ] Seletor de período: mês atual como padrão ao abrir
- [ ] Drill-down funciona onde especificado

### Tela de Inputs
- [ ] Upload funciona com arquivo no formato esperado
- [ ] Dados aparecem no dashboard após upload
- [ ] Feedback de erro claro para arquivo inválido
- [ ] Histórico de uploads visível (se aplicável)

### UI e UX
- [ ] Skeleton loading aparece antes dos dados ao recarregar
- [ ] Sem erros de console
- [ ] Sem telas quebradas ou elementos desalinhados
- [ ] Responsivo: verificar em desktop e mobile

### Completude
- [ ] Todos os KPIs do briefing/definição estão presentes
- [ ] Todas as telas do Blueprint estão implementadas
- [ ] Nomenclaturas consistentes com o briefing

---

## Por tipo de projeto

### BI Personalizado

#### Itens adicionais
- [ ] KPIs específicos do cliente calculados corretamente
- [ ] Regras de negócio do segmento respeitadas
- [ ] Dados do cliente (não dados de teste) carregados

#### Prompt — Gerar Checklist Específico

```
Com base no Documento de Briefing deste projeto, gere o Checklist de Auditoria completo.

Incluir:
- Checklist base (todos os itens padrão)
- Itens específicos para cada KPI contratado
- Verificações específicas do segmento
- Regras de negócio que precisam ser testadas

[COLE O DOCUMENTO DE BRIEFING AQUI]
```

#### Critério de avanço

✅ Zero itens bloqueantes. Melhorias menores podem ser registradas para correção, mas não bloqueiam a entrega.

---

### Produto FXL

#### Itens adicionais
- [ ] Sistema funciona com dados de múltiplos perfis sem cruzamento
- [ ] Nenhum dado hardcoded de contexto específico
- [ ] UI autoexplicativa sem dependência de onboarding
- [ ] Para BI de Plataforma: testado com arquivo real exportado do software de origem
- [ ] Para SaaS: isolamento de dados entre tenants verificado

#### Critério de avanço

✅ Zero itens bloqueantes. Validação interna pela equipe FXL.

---

## Registro de auditoria

Após a auditoria, registrar:
- Data da auditoria
- Responsável
- Itens aprovados
- Itens com ressalva (não bloqueantes)
- Itens bloqueantes (se houver)

---

## Checklist de validação MD ↔ HTML

- [ ] Checklist base completo e formatado
- [ ] Itens específicos por tipo claramente separados
- [ ] Prompt para geração de checklist específico
