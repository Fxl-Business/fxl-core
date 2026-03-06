---
title: Padrao de Prompt — Claude Code
badge: Operacao
description: Estrutura obrigatoria de prompts para Claude Code
---

# Padrão de Prompt — Claude Code

## Quando aplicar

Este padrão define a estrutura obrigatória de todo prompt gerado no Claude Project
"FXL — Processo Padrão" para execução no Claude Code.

---

## ⚠️ Regra de entrega obrigatória

Toda resposta que contenha um prompt para o Claude Code deve incluir **obrigatoriamente**:

1. O prompt exibido na conversa (para leitura rápida)
2. Um arquivo `.md` pronto para download (para uso direto no Claude Code)
3. A mensagem de commit destacada ao final da resposta

**Nunca entregar um prompt apenas no corpo da conversa, sem o arquivo `.md` anexo.**

Nomenclatura do arquivo: `prompt_[escopo]_[acao].md`

| Exemplo de situação | Nome do arquivo |
|---|---|
| Migrar layout | `prompt_layout_migracao.md` |
| Atualizar fase 3 | `prompt_fase3_atualizacao.md` |
| Incluir novo KPI | `prompt_kpi_novo.md` |

---

## Estrutura obrigatória do prompt

Todo prompt para o Claude Code deve seguir esta estrutura:

```
# Prompt para Claude Code — [Título descritivo]

Olá. Vamos trabalhar na evolução do processo FXL.

Antes de começar, leia os arquivos de contexto dos repositórios relevantes:

- `CLAUDE.md` (raiz fxl/)
- `fxl/CLAUDE.md` (se o escopo tocar este repo)
- `fxl/CLAUDE.md` (se o escopo tocar este repo)
- [outros arquivos relevantes para o contexto]

---

## Objetivo desta sessão

[Descrição clara do que será feito]

---

## [Seções de conteúdo]

[Para cada arquivo a ser criado/alterado, especificar:]
- Caminho completo do arquivo
- Conteúdo completo (não parcial)
- Se é criação ou alteração

---

## Verificação em cascata

- [ ] [lista de arquivos verificados]

---

## Execução — ordem obrigatória

1. [Passo]
2. [Passo]
3. [Passo]

Ao concluir, informar:
✅ Etapa [N] concluída — [resumo]

---

## Mensagem de commit sugerida

Um commit por repositório afetado:

`docs: [o que mudou]` — para alterações em docs/
`[client-slug]: [o que mudou]` — para alterações de cliente
`skill([nome]): [o que mudou]` — para alterações de skill
`app: [o que mudou]` — para alterações em src/
```

---

## Regras do conteúdo

1. **Conteúdo completo, não parcial**
   - Nunca dizer "adicione X aqui". Sempre fornecer o conteúdo completo do arquivo ou da seção.

2. **Pares obrigatórios**
   - Se o prompt cria ou altera um `.md` em `docs/`, deve incluir a página React correspondente em `src/pages/`.

3. **Verificação em cascata obrigatória**
   - Sempre incluir a seção de verificação, mesmo que a conclusão seja "não impacta outros arquivos".

4. **Mensagem de commit descritiva**
   - Seguir o padrão: `[escopo]: [o que mudou]`
   - Máximo de 3 linhas, sem virar changelog
