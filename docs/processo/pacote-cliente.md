---
title: Pacote — Claude Project de Cliente
badge: Processo
description: Como configurar e usar um Claude Project de cliente
---

# Pacote — Claude Project de Cliente

> Este documento vive em `docs/processo/pacote_cliente.md`.
> É a referência operacional para configurar e usar um Claude Project de cliente.
> Suba este arquivo no knowledge do Claude Project do cliente.

---

## Identidade

Este é o Claude Project de um cliente ou produto FXL específico.
Sua função é acumular contexto, evoluir o knowledge base e gerar prompts
para o Claude Code atualizar a subpasta do cliente em `fxl`.

---

## Knowledge recomendado para o Claude Project do cliente

Todos os arquivos abaixo estão em `fxl/docs/`:

- `docs/wireframe/blocos_disponiveis.md` — referência de componentes disponíveis
- `docs/suporte/biblioteca_kpis.md` — KPIs disponíveis por módulo
- `docs/process/POP_BI_PERSONALIZADO.md` ou `POP_PRODUTO.md` — POP do tipo de projeto
- `CLAUDE.md` — regras do repositório

Do cliente específico (`clients/[client-slug]/`):
- `CLAUDE.md` — regras específicas do cliente
- `docs/briefing.md` — briefing original e histórico de decisões
- `docs/blueprint.md` — Blueprint textual atual
- `docs/branding.md` — identidade visual do cliente
- `docs/changelog.md` — evoluções registradas

> ⚠️ Não subir tudo automaticamente.
> Para gerar Blueprint: sobe o briefing + blocos_disponiveis + biblioteca_kpis.
> Para gerar wireframe: sobe o blueprint + branding.
> Para evolução incremental: sobe o blueprint e o changelog.

---

## Fluxo de trabalho padrão

1. Operador abre o Claude Project do cliente
2. Cola o **Prompt Master** (`docs/process/prompt_master.md`) como primeira mensagem, adaptando slug e tarefa
3. Claude confirma o contexto lido do knowledge
4. Operador descreve a tarefa — Claude discute, questiona e evolui a solicitação
5. Ao final, operador solicita: **"Gere o prompt para o Claude Code"**
6. Claude gera um arquivo `.md` completo e estruturado com todas as instruções
7. Operador cola o prompt no Claude Code apontado para `fxl`
8. Claude Code executa e atualiza os arquivos em `clients/[client-slug]/`
9. Operador faz commit: `[client-slug]: [o que mudou]`

> ⚠️ O repositório só é alterado na etapa 8.
> Nada é escrito durante a conversa no Claude Project — apenas o prompt final faz isso.

---

## Regras de geração de Blueprint

Para cada tela, especificar:
- Nome da tela
- Objetivo (o que o usuário resolve nesta tela)
- Filtros disponíveis (período, segmento, unidade, etc.)
- Cards de KPI (nome, lógica de cálculo, comparativo)
- Gráficos (tipo, eixos, dados esperados)
- Tabelas (colunas, ordenação padrão)
- Ações disponíveis (exportar, drill-down, etc.)

Telas obrigatórias (BI Personalizado):
- Dashboard principal (visão consolidada)
- Uma tela por módulo contratado
- Tela de Inputs (upload de dados)

Telas obrigatórias (Produto FXL):
- Dashboard principal + telas por módulo
- Tela de Inputs (se aplicável)
- UI deve ser autoexplicativa (sem onboarding personalizado)

---

## Regras de geração de wireframe (via Claude Code)

O prompt gerado para o Claude Code deve instruir:
1. Repositório alvo: `fxl`
2. Subpasta: `clients/[client-slug]/wireframe/screens/`
3. Um arquivo `.tsx` por tela
4. Importar exclusivamente de `tools/wireframe-builder/components/`
5. Usar dados fictícios coerentes com o segmento do cliente
6. Nunca criar componentes locais — sinalizar para adicionar ao módulo compartilhado
7. Nenhum wireframe deve incluir comparativos temporais hardcoded. Toda comparação deve ser controlada pelo switch "Comparar" da WireframeFilterBar. Sparklines e semáforos são exceções.
8. Gráficos de evolução multi-período (ex: "12 meses") só são permitidos em telas com Tipo de Período "Análise Anual" ou "Análise de Período". Telas de "Análise Mensal" e "Análise Diária" devem mostrar apenas dados do período selecionado.

---

## Prompt padrão de abertura — Claude Project de Cliente

O prompt padrão de abertura está documentado e versionado em:

`docs/process/prompt_master.md`

Sempre use o arquivo acima como referência. Não mantenha cópias avulsas do prompt master.

## Nomenclatura FXL

| Usar | Evitar |
|---|---|
| Dashboard | Painel, relatório visual, tela |
| KPI | Métrica (quando for indicador-chave) |
| Blueprint | Rascunho, esboço |
| Briefing | Levantamento, formulário inicial |
| Inputs | Uploads, importação de dados |
