---
title: Fase 1 — Diagnostico Estrategico
badge: Processo
description: Coleta, mapeamento e formacao do Briefing
---

# Fase 1 — Diagnóstico

## Objetivo

Coletar todas as informações necessárias para definir o escopo do projeto antes de iniciar o wireframe. Um diagnóstico incompleto gera retrabalho em todas as fases subsequentes.

---

## Por tipo de projeto

### BI Personalizado

**Contexto:** Reunião com cliente para entender dores, sistemas e dados disponíveis.

**Fluxo:**
1. Comercial preenche o Formulário Comercial durante/após reunião
2. Equipe Funcional + Dev analisa e gera o Documento de Briefing
3. Cliente valida o briefing (confirma colunas, prioridades)
4. Critério de avanço atingido → Fase 2

#### Entradas

- Reunião realizada com cliente
- Acesso aos sistemas ou relatórios exportados
- Contato disponível para validação

#### Formulário Comercial

Preenchido pelo comercial. Respostas objetivas, sem necessidade de conhecimento técnico.

**Bloco 1 — Identificação**
| Campo | Tipo |
|-------|------|
| Nome da empresa | Texto |
| Segmento de atuação | Texto |
| Nome e cargo do contato principal | Texto |
| Data da reunião | Data |

**Bloco 2 — Contexto atual**
| Campo | Tipo |
|-------|------|
| Quais sistemas a empresa usa hoje? (ERP, planilhas, CRM, etc.) | Texto |
| A empresa já tem algum tipo de dashboard ou relatório estruturado? | Sim / Não |
| Com que frequência a liderança analisa dados hoje? | Nunca / Mensal / Semanal / Diária |

**Bloco 3 — Dores e objetivos**
| Campo | Tipo |
|-------|------|
| Qual a principal dor que motivou a busca por BI? | Texto (1-2 frases) |
| O que a empresa quer conseguir enxergar que não enxerga hoje? | Texto |
| Quem vai usar o dashboard no dia a dia? (perfis e quantidade) | Texto |

**Bloco 4 — Escopo inicial**
| Campo | Tipo |
|-------|------|
| Módulos de interesse | Comercial / Operacional / Financeiro / Outro |
| Para financeiro: já usa software como Conta Azul, Omie, etc.? | Sim / Não / Não se aplica |
| O cliente consegue exportar relatórios dos sistemas? | Sim / Não / Não sabe |
| O cliente pode enviar exemplo de relatório antes do próximo passo? | Sim / Não |

**Bloco 5 — Próximos passos**
| Campo | Tipo |
|-------|------|
| Data prevista para envio dos relatórios de exemplo | Data |
| Observações adicionais do comercial | Texto |

#### Documento de Briefing

Gerado pela equipe funcional a partir do Formulário Comercial + relatórios recebidos.

**Seção 1 — Resumo do cliente**
- Nome, segmento, contexto
- Maturidade analítica: Baixa / Média / Alta
- Perfis de usuário e quantidade

**Seção 2 — Sistemas e dados**
- Sistemas utilizados (lista)
- Relatórios recebidos: nome do arquivo + colunas confirmadas
- Frequência de atualização dos dados na origem
- Gaps identificados: dados desejados sem coluna confirmada

**Seção 3 — Módulos e KPIs**
- Módulos contratados
- KPIs prioritários declarados pelo cliente (em ordem)
- KPIs sugeridos pela FXL (cruzar com `docs/suporte/biblioteca_kpis.md`)
- KPIs bloqueados: desejados mas sem coluna de dados

**Seção 4 — Regras de negócio**
- Particularidades do segmento ou operação
- Exceções conhecidas
- Sazonalidades ou períodos atípicos

**Seção 5 — Decisões pendentes**
- Lista de perguntas que precisam ser validadas antes do wireframe
- Formato: pergunta + opções + impacto se não resolver

**Seção 6 — Critério de avanço**
- Checklist de validação
- Assinatura: "Briefing validado por [nome] em [data]"

#### Prompt — Gerar Documento de Briefing

```
Leia o Formulário Comercial e os relatórios abaixo. Gere o Documento de Briefing FXL completo.

Cruze os KPIs declarados com a Biblioteca de KPIs (docs/suporte/biblioteca_kpis.md).
Proponha KPIs adicionais relevantes para o segmento.
Sinalize gaps onde o KPI desejado não tem coluna de dados confirmada.
Liste todas as decisões pendentes que bloqueiam o avanço.

[COLE O FORMULÁRIO COMERCIAL AQUI]

[COLE OS RELATÓRIOS / LISTA DE COLUNAS AQUI]
```

#### Saída esperada

- Formulário Comercial preenchido
- Documento de Briefing completo e validado pelo cliente

#### Critério de avanço

✅ Cliente valida o Documento de Briefing. Todas as colunas de dados confirmadas para os KPIs prioritários. Nenhuma decisão bloqueante em aberto.

---

### Produto FXL

**Contexto:** Sessão interna para definir escopo do produto. Não há cliente externo nesta fase.

**Fluxo:**
1. Equipe define objetivo e público-alvo do produto
2. Mapeia fonte de dados (sistema externo ou inputs manuais)
3. Define MVP e visão de longo prazo
4. Documenta decisões de produto em aberto
5. Critério de avanço atingido → Fase 2

#### Entradas

- Ideia ou oportunidade identificada
- Conhecimento do segmento ou plataforma-alvo
- Exemplos de dados (relatórios exportados, estrutura de inputs)

#### Documento de Definição de Produto

**Seção 1 — Visão do produto**
- Nome do produto
- Objetivo em uma frase
- Problema que resolve
- Público-alvo (perfil, maturidade analítica, contexto de uso)

**Seção 2 — Fonte de dados**
- Tipo: Sistema externo (qual?) / Inputs manuais / Híbrido
- Para sistema externo: relatórios disponíveis + colunas
- Para inputs manuais: campos necessários + frequência de preenchimento
- Restrições técnicas conhecidas

**Seção 3 — Escopo do MVP**
- Módulos incluídos no MVP
- KPIs do MVP (lista com lógica de cálculo)
- Funcionalidades do MVP
- O que fica de fora do MVP (backlog)

**Seção 4 — Visão de longo prazo**
- Funcionalidades futuras planejadas
- Possibilidade de virar SaaS? (Sim / Não / A avaliar)
- Integrações futuras

**Seção 5 — Regras de negócio**
- Regras do segmento que o produto deve respeitar
- Exceções e casos especiais
- Nomenclaturas específicas do domínio

**Seção 6 — Decisões de produto**
- Lista de decisões em aberto marcadas como [DECISÃO DE PRODUTO]
- Formato: pergunta + opções + recomendação da equipe

**Seção 7 — Critério de avanço**
- Todas as [DECISÃO DE PRODUTO] resolvidas
- Documento validado internamente

#### Prompt — Gerar Documento de Definição de Produto

```
Vou descrever um produto FXL. Gere o Documento de Definição de Produto estruturado.

Organize as informações nas seções padrão.
Sinalize todas as [DECISÕES DE PRODUTO] em aberto.
Para cada decisão, apresente as opções e sua recomendação.
Identifique restrições técnicas ou gaps de informação.

[DESCREVA O PRODUTO AQUI]
```

#### Saída esperada

- Documento de Definição de Produto completo
- Todas as decisões de produto resolvidas

#### Critério de avanço

✅ Todas as [DECISÃO DE PRODUTO] resolvidas. Documento validado internamente pela equipe FXL.

---

## Checklist de validação MD ↔ React

- [ ] Todas as seções do MD estão representadas na página React correspondente
- [ ] Prompts usando componente PromptBlock com label descritiva
- [ ] PageHeader com badge, title, description, version e date
- [ ] InfoBlocks para critérios de avanço e avisos
- [ ] Tabelas seguem o padrão visual FXL
