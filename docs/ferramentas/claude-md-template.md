---
title: CLAUDE.md — Template de Projeto
badge: Ferramentas
description: Template do CLAUDE.md para repositorios de projeto
---

# Template — CLAUDE.md para Projetos FXL

## Como usar

Copie este template para o `CLAUDE.md` do repositório do projeto. Substitua todos os campos `[PREENCHER]` antes de iniciar o desenvolvimento.

Substitua `[CAMINHO_ABSOLUTO]` pelo caminho real na máquina do operador.
Exemplo: `/Users/operador/projetos` → os arquivos ficam em `/Users/operador/projetos/docs/build/premissas_gerais.md`

---

## Template

```
# CLAUDE.md — [PREENCHER: Nome do Projeto]

## Identidade

- **Nome:** [PREENCHER: Nome do projeto]
- **Tipo:** [PREENCHER: BI Personalizado / Produto FXL]
- **Descrição:** [PREENCHER: Uma frase descrevendo o projeto e para quem é]
- **Cliente/Contexto:** [PREENCHER: Nome do cliente ou contexto interno]

---

## Knowledge técnico FXL

Antes de executar qualquer tarefa, leia os seguintes arquivos:

- [CAMINHO_ABSOLUTO]/docs/build/premissas_gerais.md
- [CAMINHO_ABSOLUTO]/docs/build/supabase.md
- [CAMINHO_ABSOLUTO]/docs/build/deploy_vercel.md
- [CAMINHO_ABSOLUTO]/docs/build/seguranca.md
- [CAMINHO_ABSOLUTO]/docs/build/testes.md

---

## Stack deste projeto

[PREENCHER: Selecionar e completar conforme o projeto]

**Opção A — Padrão (React + Vite):**
- React 18 + TypeScript 5 (strict: true)
- Tailwind CSS 3 + shadcn/ui
- Vite 5
- Supabase (PostgreSQL + Auth)
- Vercel

**Opção B — Next.js (apenas se justificado):**
- Next.js 14+ + TypeScript 5 (strict: true)
- Tailwind CSS 3 + shadcn/ui
- Supabase (PostgreSQL + Auth)
- Vercel
- **Justificativa:** [PREENCHER: motivo pelo qual Next.js foi escolhido]

---

## Estrutura do projeto

[PREENCHER: Atualizar conforme sprints avançam. Iniciar com a estrutura padrão de premissas_gerais.md]

```
[nome-do-projeto]/
├── CLAUDE.md
├── README.md
├── .env.example
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── types/
└── docs/
    ├── CHANGELOG.md
    ├── SPRINTS.md
    └── ARCHITECTURE.md
```

---

## Sprints

| Sprint | Escopo | Status |
|---|---|---|
| Sprint 1 | Setup + Auth | [PREENCHER: Pendente / Em andamento / Concluído] |
| Sprint 2 | [PREENCHER] | Pendente |
| Sprint N | [PREENCHER] | Pendente |

---

## Regras específicas deste projeto

[PREENCHER: Qualquer particularidade do projeto que o Claude Code deve conhecer]

Exemplos:
- Dados do cliente são sensíveis — nunca logar informações pessoais
- Dashboard principal sempre filtra pelo mês atual ao carregar
- Tabela de transações tem mais de 100k registros — otimizar queries com paginação

---

## Documentação

- [CHANGELOG.md](docs/CHANGELOG.md) — histórico de mudanças por sprint
- [SPRINTS.md](docs/SPRINTS.md) — decisões técnicas tomadas por sprint
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — visão geral da arquitetura do projeto
```

---

## Nota sobre caminho absoluto

O `[CAMINHO_ABSOLUTO]` funciona porque há um único operador na máquina. Para escalar no futuro (múltiplos operadores), migrar para git submodule ou variável de ambiente configurada por operador.

Exemplo de valor real: `/Users/cauet/projetos`
