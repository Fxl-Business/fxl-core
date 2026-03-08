---
title: Fase 1 — Diagnostico Estrategico
badge: Processo
description: Coleta, mapeamento e formacao do Briefing
---

# Fase 1 — Diagnostico

Coleta todas as informacoes necessarias para definir o escopo do projeto.
Um diagnostico incompleto gera retrabalho em todas as fases seguintes.

---

## Operacao

### BI Personalizado

1. Comercial realiza reuniao com cliente
2. Preencher o Formulario Comercial durante ou apos a reuniao
3. Equipe Funcional + Dev analisa formulario e relatorios recebidos
4. Gerar o Documento de Briefing (usar prompt abaixo)
5. Cruzar KPIs com os [Blocos Disponiveis](/ferramentas/blocos/index)
6. Cliente valida o briefing (confirma colunas, prioridades)
7. Criterio de avanco atingido -> Fase 2

{% prompt label="Gerar Documento de Briefing" %}
Leia o Formulario Comercial e os relatorios abaixo. Gere o Documento de Briefing FXL completo.

Cruze os KPIs declarados com os Blocos Disponiveis (/ferramentas/blocos/index).
Proponha KPIs adicionais relevantes para o segmento.
Sinalize gaps onde o KPI desejado nao tem coluna de dados confirmada.
Liste todas as decisoes pendentes que bloqueiam o avanco.

[COLE O FORMULARIO COMERCIAL AQUI]

[COLE OS RELATORIOS / LISTA DE COLUNAS AQUI]
{% /prompt %}

### Produto FXL

1. Equipe define objetivo e publico-alvo do produto
2. Mapear fonte de dados (sistema externo ou inputs manuais)
3. Definir MVP e visao de longo prazo
4. Documentar decisoes de produto em aberto como [DECISAO DE PRODUTO]
5. Resolver todas as decisoes antes de avancar
6. Criterio de avanco atingido → Fase 2

{% prompt label="Gerar Documento de Definicao de Produto" %}
Vou descrever um produto FXL. Gere o Documento de Definicao de Produto estruturado.

Organize as informacoes nas secoes padrao.
Sinalize todas as [DECISOES DE PRODUTO] em aberto.
Para cada decisao, apresente as opcoes e sua recomendacao.
Identifique restricoes tecnicas ou gaps de informacao.

[DESCREVA O PRODUTO AQUI]
{% /prompt %}

---

## Detalhes

### Por tipo de projeto

#### BI Personalizado

**Entradas:**
- Reuniao realizada com cliente
- Acesso aos sistemas ou relatorios exportados
- Contato disponivel para validacao

**Formulario Comercial** — preenchido pelo comercial, respostas objetivas:

| Bloco | Campos |
|-------|--------|
| Identificacao | Nome da empresa, segmento, contato principal, data da reuniao |
| Contexto atual | Sistemas em uso, dashboards existentes, frequencia de analise de dados |
| Dores e objetivos | Principal dor, o que quer enxergar, quem vai usar o dashboard |
| Escopo inicial | Modulos de interesse, software financeiro, capacidade de exportar relatorios |
| Proximos passos | Data prevista para envio de relatorios, observacoes |

**Documento de Briefing** — gerado pela equipe funcional:

| Secao | Conteudo |
|-------|----------|
| Resumo do cliente | Nome, segmento, maturidade analitica, perfis de usuario |
| Sistemas e dados | Sistemas, relatorios recebidos, frequencia, gaps identificados |
| Modulos e KPIs | Modulos contratados, KPIs prioritarios, KPIs sugeridos, KPIs bloqueados |
| Regras de negocio | Particularidades do segmento, excecoes, sazonalidades |
| Decisoes pendentes | Perguntas com opcoes e impacto se nao resolvidas |
| Criterio de avanco | Checklist de validacao + assinatura |

**Saida:** Formulario Comercial preenchido + Documento de Briefing validado pelo cliente.

#### Produto FXL

**Entradas:**
- Ideia ou oportunidade identificada
- Conhecimento do segmento ou plataforma-alvo
- Exemplos de dados

**Documento de Definicao de Produto:**

| Secao | Conteudo |
|-------|----------|
| Visao do produto | Nome, objetivo, problema, publico-alvo |
| Fonte de dados | Tipo (externo/manual/hibrido), relatorios, campos, restricoes |
| Escopo do MVP | Modulos, KPIs, funcionalidades, backlog |
| Visao de longo prazo | Funcionalidades futuras, possibilidade de SaaS, integracoes |
| Regras de negocio | Regras do segmento, excecoes, nomenclaturas |
| Decisoes de produto | Lista de [DECISAO DE PRODUTO] com opcoes e recomendacao |
| Criterio de avanco | Todas as decisoes resolvidas, documento validado internamente |

**Saida:** Documento de Definicao de Produto completo com todas as decisoes resolvidas.

### Criterio de avanco

**BI Personalizado:** Cliente valida o Documento de Briefing. Todas as colunas de dados confirmadas para os KPIs prioritarios. Nenhuma decisao bloqueante em aberto.

**Produto FXL:** Todas as [DECISAO DE PRODUTO] resolvidas. Documento validado internamente pela equipe FXL.
