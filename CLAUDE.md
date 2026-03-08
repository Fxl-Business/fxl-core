# CLAUDE.md — FXL Core (Nucleo FXL)

## Natureza do Projeto

O FXL Core e a plataforma operacional interna da FXL, empresa de BI para PMEs.
Nao e um site de documentacao — e uma plataforma que usa documentacao
como interface primaria, ao lado de ferramentas executaveis,
workspaces de cliente e operacao assistida por IA.

O que o FXL Core NAO e:
- Nao e documentacao publica de produto (como docs do Supabase)
- Nao e apenas um repositorio de .md renderizados
- Nao e um monolito onde tudo se mistura sem fronteiras

A visao de longo prazo da FXL e ter um processo capaz de entender qualquer negocio
e, a partir de perguntas e respostas estruturadas, gerar qualquer produto digital —
dashboard, sistema, landing page, mobile ou automacao — de forma progressivamente
automatizada. Toda evolucao do processo deve caminhar nessa direcao.

---

## Taxonomia

O repositorio e organizado em 5 camadas conceituais.
Todo novo conteudo deve ser classificado em uma delas.

| Camada | O que contem | Pasta | Quem consome |
|--------|-------------|-------|-------------|
| Processo | Regras normativas, fases, identidade, fluxos | docs/processo/ | Claude + Humanos |
| Padroes | Regras base, stack aprovada, padroes tecnicos | docs/ferramentas/ + docs/padroes/ | Claude + Humanos |
| Ferramentas | Wireframe Builder, blocos, galeria de componentes | docs/ferramentas/ + tools/ | Claude + Humanos |
| Clientes | Contexto por cliente (briefing, blueprint, wireframe) | clients/[slug]/ | Claude + Humanos |
| Plataforma | App React, AI runtime, auth, banco | src/ + .claude/ + .agents/ | Sistema |

### Como classificar novos conteudos

1. Define o que algo E ou quais sao as regras? → Processo
2. E uma regra base, padrao tecnico ou stack decision? → Padroes
3. Diz COMO fazer algo ou fornece template? → Ferramentas
4. E especifico de um cliente? → Clientes
5. E codigo, config ou AI tooling? → Plataforma

### Limites entre Knowledge, Tools e Client Workspaces

- Spec/catalogo de blocos = Ferramentas (docs/ferramentas/blocos/index.md)
- Componentes .tsx dos blocos = Ferramentas (tools/wireframe-builder/components/)
- Uso dos blocos em um cliente = Clientes (clients/[slug]/wireframe/)
- Nunca misturar spec com implementation no mesmo arquivo
- Nunca colocar conhecimento transversal dentro de pasta de cliente

---

## Estrutura do repositorio

```
fxl/
├── CLAUDE.md                ← este arquivo — regras operacionais
├── README.md
├── package.json
│
├── docs/                    ← Conteudo renderizado (fonte unica de verdade)
│   │                           Cada .md = uma pagina via parser proprio
│   ├── processo/            ← Processo — regras, fases, identidade
│   │   └── fases/           ← fase1.md a fase6.md
│   ├── ferramentas/         ← Ferramentas + Padroes — tools, premissas, seguranca, testes
│   │   └── techs/           ← Padroes — catalogo de tecnologias (badge: Padroes)
│   ├── padroes/             ← Padroes — landing page da secao
│   └── referencias/         ← Ferramentas (legacy)
│
├── clients/                 ← Clientes — contexto isolado por cliente
│   └── [client-slug]/
│       ├── CLAUDE.md
│       ├── docs/            ← briefing, blueprint, branding, changelog
│       └── wireframe/       ← blueprint config e artefatos
│
├── tools/                   ← Ferramentas — codigo executavel das tools
│   └── wireframe-builder/
│       ├── SKILL.md         ← instrucoes para o Claude Code
│       └── components/      ← componentes React reutilizaveis
│
├── src/                     ← Plataforma — app shell React
│   ├── components/
│   │   ├── layout/          ← Layout, Sidebar
│   │   ├── docs/            ← Callout, Operational, PageHeader, PhaseCard, PromptBlock
│   │   └── ui/              ← shadcn/ui
│   ├── pages/               ← SO paginas interativas (Home, clients)
│   ├── lib/                 ← docs-parser, utils
│   └── App.tsx
│
├── .claude/                 ← Plataforma — AI runtime (GSD, commands, hooks)
└── .agents/                 ← Plataforma — skills de terceiros (Clerk)
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

## Regra de qualidade visual

Antes de qualquer alteracao em componentes visuais (src/components/, tools/*/components/,
clients/*/wireframe/), invocar as seguintes skills para guiar a implementacao:

- frontend-design — interfaces production-grade com alto design quality
- shadcn — gerenciamento e uso correto de componentes shadcn/ui
- react-best-practices — performance patterns React
- composition-patterns — compound components, render props, context providers
- ui-ux-pro-max — decisoes de design (paletas, tipografia, estilos)
- web-design-guidelines — audit de acessibilidade e boas praticas de UI

---

## Formato dos docs

Todo `.md` em `docs/` deve ter frontmatter YAML:

```yaml
---
title: Nome da Pagina
badge: Processo | Ferramentas | Padroes
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
- Nunca misturar spec/catalogo com implementation guidance no mesmo arquivo
