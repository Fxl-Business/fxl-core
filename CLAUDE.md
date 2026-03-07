# CLAUDE.md — FXL Core (Nucleo FXL)

## Identidade

Voce esta operando no FXL Core (Nucleo FXL), monorepo central da FXL, empresa de BI para PMEs.
Este repositorio contem: documentacao de processo, knowledge de clientes,
tools (ferramentas AI-first) e o app React que renderiza tudo.

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
│   │                           Cada .md = uma pagina renderizada via parser proprio
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
├── tools/                   ← ferramentas AI-first do processo
│   └── wireframe-builder/
│       ├── SKILL.md         ← instrucoes para o Claude Code
│       └── components/      ← componentes React reutilizaveis
│
└── src/                     ← app shell React (estrutura, nao conteudo)
    ├── components/
    │   ├── layout/          ← Layout, Sidebar
    │   ├── docs/            ← Callout, Operational, PageHeader, PhaseCard, PromptBlock
    │   └── ui/              ← shadcn/ui
    ├── pages/               ← SO paginas interativas (Home, clients)
    ├── lib/                 ← docs-parser, utils
    └── App.tsx
```

---

## Regra principal — docs/ e a fonte de verdade

Cada `.md` em `docs/` e renderizado como pagina via parser proprio com react-markdown.
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

## Regra de escopo — tools/

Cada tool tem seu `SKILL.md` com instrucoes de uso.
Componentes de tool sao importados via `@tools/[nome]/components/`.
Nunca criar componentes locais na pasta de um cliente — sinalizar para
adicionar ao modulo compartilhado da tool.

---

## Formato dos docs

Todo `.md` em `docs/` deve ter frontmatter YAML:

```yaml
---
title: Nome da Pagina
badge: Processo | Build | Referencias | Operacao
description: Uma frase descrevendo o conteudo
---
```

Tags customizadas disponiveis (parseadas pelo docs-parser):
- `{% callout type="warning|info" %}` — destaque visual
- `{% prompt label="texto" %}` — bloco de prompt com botao de copia
- `{% operational %}` — secao operacional (colapsavel na UI, lida pelo Claude)
- `{% phase-card number=N title="X" description="Y" href="/Z" %}` — card de fase

---

## Convencao de commit

- Alteracoes em docs/: `docs: [o que mudou]`
- Alteracoes de cliente: `[client-slug]: [o que mudou]`
- Alteracoes de tool: `tool([nome]): [o que mudou]`
- Alteracoes em src/ (app shell): `app: [o que mudou]`
- Alteracoes estruturais: `infra: [o que mudou]`

---

## Stack

- React 18 + TypeScript 5 (strict: true)
- Tailwind CSS 3 + shadcn/ui
- Vite 5
- react-markdown + remark-gfm (renderizacao de docs e docs de clientes)
- recharts (graficos em wireframes)
- lucide-react (icones)
- @supabase/supabase-js 2.x (banco de dados para comentarios em wireframe)
- @clerk/react 6.x (autenticacao de operador — login, Google OAuth, perfil)
- Vercel (deploy)

### Environment Variables

- `VITE_SUPABASE_URL` — URL do projeto Supabase (Dashboard -> Settings -> API -> Project URL)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — chave anon publica (Dashboard -> Settings -> API -> anon public key)
- `VITE_CLERK_PUBLISHABLE_KEY` — chave publica do Clerk (Dashboard -> API Keys -> Publishable key)

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
