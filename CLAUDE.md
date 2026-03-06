# CLAUDE.md — FXL Monorepo

## Identidade

Voce esta operando no monorepo da FXL, empresa de BI para PMEs.
Este repositorio contem: documentacao de processo, knowledge de clientes,
skills (ferramentas AI-first) e o app React que renderiza tudo.

A visao de longo prazo da FXL e ter um processo capaz de entender qualquer negocio
e, a partir de perguntas e respostas estruturadas, gerar qualquer produto digital —
dashboard, sistema, landing page, mobile ou automacao — de forma progressivamente
automatizada. Toda evolucao do processo deve caminhar nessa direcao.

---

## Estrutura do repositorio

```
fxl/
├── CLAUDE.md                ← este arquivo — regras operacionais
├── README.md
├── package.json
│
├── docs/                    ← TODA documentacao (fonte unica de verdade)
│   │                           Cada .md = uma pagina renderizada via Markdoc
│   ├── processo/            ← roteamento, POPs, fases, identidade
│   │   └── fases/           ← fase1.md a fase6.md
│   ├── build/               ← premissas tecnicas de stack e deploy
│   ├── referencias/         ← bibliotecas reutilizaveis (KPIs, blocos)
│   └── operacao/            ← como operar o sistema (prompts, fluxo)
│
├── clients/                 ← dados de clientes
│   └── [client-slug]/
│       ├── CLAUDE.md
│       ├── docs/            ← briefing, blueprint, branding, changelog
│       └── wireframe/       ← screens/ com .tsx de wireframe
│
├── skills/                  ← ferramentas AI-first do processo
│   └── wireframe-builder/
│       ├── SKILL.md         ← instrucoes para o Claude Code
│       └── components/      ← componentes React reutilizaveis
│
└── src/                     ← app shell React (estrutura, nao conteudo)
    ├── components/
    │   ├── layout/          ← Layout, Sidebar
    │   ├── markdoc/         ← componentes dos tags Markdoc
    │   ├── docs/            ← InfoBlock, PageHeader, PhaseCard, PromptBlock
    │   └── ui/              ← shadcn/ui
    ├── pages/               ← SO paginas interativas (Home, clients)
    ├── lib/                 ← markdoc loader, utils
    └── App.tsx
```

---

## Regra principal — docs/ e a fonte de verdade

Cada `.md` em `docs/` e renderizado como pagina via Markdoc.
Nao existe duplicacao entre docs e pages.

Se um conteudo precisa ser lido pelo Claude E exibido para humanos,
ele vive em `docs/` como um unico `.md`.

Secoes especificas para o Claude podem usar o tag `{% operational %}`.
Essas secoes ficam colapsaveis na UI mas sao lidas linearmente pelo Claude.

---

## Regra de escopo — clients/

Todo prompt que envolva um cliente deve especificar o slug explicitamente.
O Claude Code nunca altera a subpasta de um cliente ao executar tarefa de outro.

---

## Regra de escopo — skills/

Cada skill tem seu `SKILL.md` com instrucoes de uso.
Componentes de skill sao importados via `@skills/[nome]/components/`.
Nunca criar componentes locais na pasta de um cliente — sinalizar para
adicionar ao modulo compartilhado da skill.

---

## Formato dos docs (Markdoc)

Todo `.md` em `docs/` deve ter frontmatter YAML:

```yaml
---
title: Nome da Pagina
badge: Processo | Build | Referencias | Operacao
description: Uma frase descrevendo o conteudo
---
```

Tags Markdoc disponiveis:
- `{% callout type="warning|info" %}` — destaque visual
- `{% prompt label="texto" %}` — bloco de prompt com botao de copia
- `{% operational %}` — secao operacional (colapsavel na UI, lida pelo Claude)
- `{% phase-card number=N title="X" description="Y" href="/Z" %}` — card de fase

---

## Convencao de commit

- Alteracoes em docs/: `docs: [o que mudou]`
- Alteracoes de cliente: `[client-slug]: [o que mudou]`
- Alteracoes de skill: `skill([nome]): [o que mudou]`
- Alteracoes em src/ (app shell): `app: [o que mudou]`
- Alteracoes estruturais: `infra: [o que mudou]`

---

## Stack

- React 18 + TypeScript 5 (strict: true)
- Tailwind CSS 3 + shadcn/ui
- Vite 5
- Markdoc (renderizacao de docs)
- react-markdown + remark-gfm (renderizacao de docs de clientes)
- recharts (graficos em wireframes)
- lucide-react (icones)
- Vercel (deploy)
- SEM Supabase neste repositorio

---

## Checklist obrigatorio antes de encerrar qualquer tarefa

```bash
npx tsc --noEmit
```

Zero erros TypeScript e condicao de aceite.
Nunca usar `any` como solucao para erros de tipo.

---

## O que nunca fazer

- Nunca criar arquivos .html
- Nunca usar `any` em TypeScript
- Nunca criar componentes de wireframe em pastas de clientes
- Nunca adicionar dependencias sem documentar aqui
- Nunca alterar subpasta de um cliente ao executar tarefa de outro
- Nunca criar paginas .tsx para conteudo que deveria ser .md em docs/
