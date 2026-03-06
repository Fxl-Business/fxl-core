---
title: Prompt de Abertura — Project FXL
badge: Operacao
description: Prompt padrao para iniciar qualquer conversa no Claude Project FXL — Processo Padrao
---

# Prompt de Abertura — Claude Project FXL

> Cole este prompt como primeira mensagem de qualquer nova conversa
> no Claude Project "FXL — Processo Padrão".
> Substitua apenas o campo entre colchetes.

---

{% prompt label="Prompt de Abertura — copie, cole e adapte o campo final" %}
Olá. Vamos trabalhar na evolução do processo FXL.

Antes de começar, leia os arquivos de contexto do repositório:

- CLAUDE.md
- docs/processo/master.md

⚠️ REGRA INVIOLÁVEL ANTES DE QUALQUER AÇÃO

Os arquivos em /docs/ são a fonte da verdade operacional do processo FXL.
Eles SÓ devem ser alterados quando o objetivo da sessão for explicitamente
atualizar o conteúdo do processo.

Se a tarefa envolver estrutura, layout, navegação ou componentes visuais,
as alterações acontecem EXCLUSIVAMENTE em /src/.

Nunca inferir que uma mudança em /src/ implica mudança em /docs/.

Meu objetivo nesta conversa é: [DESCREVA AQUI]

Ao final da nossa discussão, quero receber um prompt estruturado e completo
para colar no Claude Code, especificando exatamente quais arquivos serão
tocados, por quê, e com mensagem de commit.
{% /prompt %}

---

## Como funciona a partir daqui

Após colar o prompt e descrever o objetivo, o Claude irá:

1. Confirmar o contexto lido do repositório
2. Fazer perguntas para entender o problema antes de propor solução
3. Conduzir a conversa mantendo um **bloco de Estado da Conversa** ao final de cada resposta
4. Gerar o prompt final para o Claude Code somente quando todas as decisões estiverem confirmadas

Para entender a estrutura completa do padrão de conversa, consulte:
`/operacao/padrao-conversa-project`
