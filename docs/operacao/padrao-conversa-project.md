---
title: Padrao de Conversa — Claude Project
badge: Operacao
description: Como conduzir conversas no Claude Project
---

# Padrão de Conversa — Claude Project

## Quando aplicar

Este padrão se aplica a conversas no Claude Project "FXL — Processo Padrão" que têm como objetivo gerar um prompt para execução no Claude Code.

Não se aplica a conversas exploratórias, dúvidas rápidas ou discussões que não resultam em alteração no repositório.

---

## Regra principal

Toda resposta deve terminar com um bloco de **Estado da Conversa** que registra decisões, premissas e pendências. Isso evita perda de contexto em conversas longas.

---

## Estrutura do bloco de estado

```
---
## Estado da conversa

**Objetivo:** [o que estamos tentando alcançar nesta conversa]

**Decisões tomadas:**
- [decisão] — confirmada em [qual mensagem/momento]

**Premissas ativas:**
- [premissas do projeto ou do prompt inicial que devem ser mantidas]

**Pendências:**
- [perguntas ou decisões que ainda precisam de resposta]

**Próximo passo:** [o que faremos a seguir]
---
```

---

## Regras de condução

1. **Não avançar sem confirmar decisões estruturais**
   - Se uma decisão afeta a arquitetura (ex: estrutura de pastas, formato de arquivo), confirmar explicitamente antes de prosseguir.

2. **Referenciar decisões anteriores**
   - Ao retomar um ponto já discutido, mencionar: "Conforme decidido anteriormente, [decisão]."

3. **Sinalizar mudança de direção**
   - Se uma nova informação muda uma decisão anterior, sinalizar explicitamente: "Isso muda a decisão sobre [X]. Nova proposta: [Y]."

4. **Manter premissas do prompt inicial**
   - O prompt inicial do usuário geralmente contém premissas importantes. Mantê-las visíveis no bloco de estado.

5. **Objetivo final sempre visível**
   - Lembrar que o output final é um prompt para o Claude Code. Toda discussão deve caminhar nessa direção.

---

## Quando gerar o prompt final

O prompt para o Claude Code deve ser gerado quando:
- Todas as pendências estão resolvidas
- As decisões estruturais estão confirmadas
- O usuário solicita ou confirma que está pronto

Antes de gerar, revisar o bloco de estado para garantir que nenhuma decisão foi perdida.

---

## Checklist antes de gerar o prompt

- [ ] Todas as decisões tomadas estão refletidas no prompt?
- [ ] Nenhuma premissa do início foi contradita sem sinalização?
- [ ] O escopo está claro e fechado?
- [ ] A estrutura de arquivos está definida?
- [ ] A mensagem de commit está incluída?

## Prompt padrão de abertura — Claude Project FXL

Será utilizado o seguinte prompt padrão ao iniciar uma nova conversa neste Project:

---

Olá. Vamos trabalhar na evolução do processo FXL.

Antes de começar, leia os arquivos de contexto do repositório:

**Raiz:**
- CLAUDE.md
- README.md
- docs/processo/master.md

---

⚠️ REGRA INVIOLÁVEL ANTES DE QUALQUER AÇÃO

Os arquivos em /docs/ são a fonte da verdade operacional do processo FXL.
Eles SÓ devem ser alterados quando o objetivo da sessão for explicitamente
atualizar o conteúdo do processo.

Se a tarefa envolver estrutura, layout, navegação ou componentes visuais,
as alterações acontecem EXCLUSIVAMENTE em /src/ do repositório especificado.

Nunca inferir que uma mudança em /src/ implica mudança em /docs/.
Nunca inferir que uma mudança num repositório implica mudança no outro.

---

Meu objetivo nesta conversa é: [DESCREVA AQUI]

---
Ao final da nossa discussão, quero receber um prompt estruturado e completo
para colar no Claude Code, especificando exatamente quais arquivos serão
tocados, por quê, e com mensagem de commit para cada repositório afetado.

---

## Checklist de entrega (obrigatório ao finalizar)

- [ ] Prompt exibido no corpo da conversa
- [ ] Arquivo `.md` gerado para download, nomeado `prompt_[escopo]_[acao].md`
- [ ] Mensagem de commit destacada ao final da resposta

⚠️ A entrega só está completa quando os três itens acima estão marcados.

---

## Padrão para Claude Project de Cliente

### Diferença em relação ao Project FXL — Processo Padrão

O Project de cliente opera sobre um escopo fechado: um cliente específico,
com knowledge em `clients/[client-slug]/`.
O output padrão é sempre um prompt para o Claude Code atualizar essa subpasta.

### Bloco de estado adaptado para Project de cliente

```
---
## Estado da conversa

**Cliente:** [nome] | **Slug:** [client-slug]
**Objetivo:** [tarefa desta sessão]

**Decisões tomadas:**
- [decisão] — confirmada em [qual mensagem]

**Knowledge consultado:**
- [arquivo lido nesta sessão]

**Pendências:**
- [perguntas ou decisões abertas]

**Próximo passo:** [o que faremos a seguir]
---
```

### Regra de escopo obrigatória

Todo prompt gerado para o Claude Code deve conter o slug do cliente explicitamente.
O Claude Code nunca deve alterar arquivos fora de `clients/[client-slug]/`.

### Prompt padrão de abertura — Claude Project de Cliente

O prompt padrão de abertura para projetos de cliente está em:
`docs/processo/pacote_cliente.md`

Este arquivo é a fonte da verdade desse prompt e deve ser subido no knowledge do Claude Project de cada cliente. Não manter cópia inline aqui para evitar versões conflitantes.
