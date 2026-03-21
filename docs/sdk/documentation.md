---
title: Documentacao
badge: SDK
description: Processos obrigatorios de documentacao para projetos spoke
scope: product
sort_order: 140
---

# Documentacao

Todo projeto spoke FXL deve manter documentacao padronizada. A documentacao serve dois consumidores igualmente importantes: **humanos** (desenvolvedores que vao manter o projeto) e **IA** (Claude Code que opera o projeto via CLAUDE.md).

{% callout type="warning" %}
Documentacao nao e opcional — e requisito de qualidade. Um spoke sem README e CLAUDE.md atualizados nao passa no `fxl-doctor.sh`.
{% /callout %}

---

## README.md Obrigatorio

Todo spoke deve ter um `README.md` na raiz com as secoes abaixo. O objetivo e que um novo desenvolvedor consiga rodar o projeto em menos de 10 minutos.

### Secoes obrigatorias

| Secao | Conteudo |
|-------|---------|
| `# Nome do Projeto` | Nome legivel do projeto |
| `## Sobre` | Natureza do projeto (1-2 frases), App ID, FXL Contract version |
| `## Stack` | Tabela de tecnologias com versoes |
| `## Setup` | Passo a passo para rodar localmente |
| `## Variaveis de Ambiente` | Tabela com cada var, descricao e onde obter |
| `## Scripts` | Tabela com cada script npm e descricao |
| `## Deploy` | Como deployar (Vercel, branch strategy) |
| `## Estrutura` | Arvore de diretorios resumida |

### Exemplo de README minimo

```markdown
# Beach Houses Dashboard

## Sobre

Dashboard BI para gestao de reservas da Beach Houses.
**App ID:** `beach-houses` | **Contract:** v1.0

## Stack

| Tecnologia | Versao |
|-----------|--------|
| React | 18.x |
| TypeScript | 5.x (strict) |
| Tailwind CSS | 3.x |
| Vite | 5.x |
| Supabase | @supabase/supabase-js 2.x |
| Clerk | @clerk/react 6.x |

## Setup

1. Clone o repositorio
2. `npm install`
3. Copie `.env.example` para `.env.local` e preencha as variaveis
4. `npm run dev`
5. Acesse `http://localhost:5173`

## Variaveis de Ambiente

| Variavel | Descricao | Onde obter |
|----------|-----------|-----------|
| `VITE_SUPABASE_URL` | URL do Supabase | Dashboard Supabase > Settings > API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publica do Supabase | Dashboard Supabase > Settings > API |
| `VITE_CLERK_PUBLISHABLE_KEY` | Chave publica Clerk | Dashboard Clerk > API Keys |

## Scripts

| Script | Descricao |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run preview` | Preview do build local |
| `npx tsc --noEmit` | Verificacao de tipos |

## Deploy

Deploy automatico via Vercel.
- Push para `main` → deploy em producao
- Pull request → deploy de preview

## Estrutura

\`\`\`
src/
  api/fxl/          <- endpoints do FXL Contract
  components/       <- componentes React
  pages/            <- paginas de rota
  hooks/            <- hooks customizados
  lib/services/     <- services de acesso a dados
  types/            <- definicoes de tipos
supabase/
  migrations/       <- SQL migrations
\`\`\`
```

{% callout type="info" %}
O README deve ser autocontido — nao depender de documentos externos para que alguem consiga rodar o projeto. Se precisar de contexto adicional, use links para paginas do SDK.
{% /callout %}

---

## CLAUDE.md por Projeto

O `CLAUDE.md` e o arquivo mais importante para operacao com IA. Ele define o que o Claude Code sabe sobre o projeto — sem ele, o agente opera sem contexto e comete erros evitaveis.

### Proposito

O CLAUDE.md funciona como um contrato entre o desenvolvedor e o Claude Code:
- Define as regras que o agente deve seguir
- Descreve a estrutura do projeto
- Lista as entidades do dominio
- Especifica quality gates obrigatorios
- Documenta anti-patterns a evitar

### Secoes obrigatorias

| Secao | Conteudo | Exemplo |
|-------|---------|---------|
| Natureza do projeto | O que e, App ID, contract version | "Dashboard BI para Beach Houses, App ID: beach-houses" |
| Stack | Tecnologias usadas (mesma do README) | React 18, TypeScript strict, Tailwind, Vite |
| Estrutura do projeto | Arvore de diretorios atualizada | src/api/, src/components/, src/pages/ |
| Entidades do dominio | Lista com campos principais | Reservation (id, guestName, checkIn, status) |
| Convencoes de codigo | Naming, imports, commits | PascalCase para componentes, `import type` |
| Regras de seguranca | Env vars, RLS, auth | VITE_ prefix, org_id RLS, Clerk JWT |
| Contract endpoints | Tabela dos 6 endpoints | GET /api/fxl/manifest, entities, widgets... |
| Quality gates | Comandos de validacao | `npx tsc --noEmit`, `fxl-doctor.sh` |
| O que nunca fazer | Anti-patterns | Nunca usar `any`, nunca commitar .env.local |

### Exemplo de CLAUDE.md

```markdown
# Beach Houses Dashboard

## Natureza do Projeto

Dashboard BI para gestao de reservas da Beach Houses.
Spoke FXL conectado ao Hub Nexo via FXL Contract v1.0.
App ID: `beach-houses`

## Stack

- React 18 + TypeScript 5 (strict: true)
- Tailwind CSS 3 + shadcn/ui
- Vite 5
- @supabase/supabase-js 2.x
- @clerk/react 6.x
- Vercel (deploy)

## Entidades

### Reservation
- id: uuid
- guestName: string
- checkIn: date
- checkOut: date
- status: 'confirmed' | 'pending' | 'cancelled'
- totalAmount: number

## Convencoes

- Componentes: PascalCase, named exports, Props interface
- Hooks: prefixo `use`, retorno tipado
- Services: sufixo `-service`, funcoes puras
- Commits: `tipo(escopo): mensagem`
- Imports: React > libs > internos > tipos

## Quality Gates

npx tsc --noEmit  # zero erros
npx eslint .      # zero erros

## O que nunca fazer

- Nunca usar `any` em TypeScript
- Nunca commitar `.env.local`
- Nunca criar componentes fora de `src/components/`
- Nunca acessar campos de API sem fallback (?? [])
```

{% callout type="warning" %}
Manter o CLAUDE.md atualizado apos cada mudanca estrutural — e a fonte de verdade para o Claude Code. Se o CLAUDE.md diz uma coisa e o codigo outra, o agente segue o CLAUDE.md.
{% /callout %}

### Relacao com templates.md

O `CLAUDE.md` de um spoke e gerado a partir do `CLAUDE.md.template` do SDK com placeholders substituidos. Para detalhes sobre o template e seus placeholders, consulte a pagina [Templates](/sdk/templates).

---

## Changelog

O changelog registra o historico de mudancas do projeto. Para spokes FXL, o changelog segue a convencao de commits do projeto.

### Convencao de commits

Todo commit segue o formato `tipo(escopo): mensagem`:

| Tipo | Quando usar |
|------|------------|
| `docs` | Alteracoes em documentacao |
| `app` | Alteracoes no codigo da aplicacao |
| `infra` | Infraestrutura, CI, configs |
| `fix` | Correcao de bugs |
| `test` | Adicao/alteracao de testes |

### CHANGELOG.md (opcional)

Para projetos que mantém um changelog formal, usar o formato:

```markdown
# Changelog

## 2026-03-19 — Dashboard v1.2

### Added
- Filtro por periodo no dashboard principal
- Exportacao de relatorios em CSV

### Changed
- Grafico de receita usa area chart em vez de bar chart

### Fixed
- Corrigido calculo de taxa de ocupacao para periodos parciais
```

{% callout type="info" %}
Para projetos que usam o workflow GSD, o historico de milestones e phases em `.planning/` substitui o CHANGELOG.md tradicional. O historico fica documentado em ROADMAP.md e nos SUMMARY.md de cada phase.
{% /callout %}

---

## Documentacao de API

Todo spoke que implementa o FXL Contract deve documentar seus endpoints. A documentacao cobre os 6 endpoints padrao e quaisquer endpoints customizados.

### Formato de documentacao por endpoint

Cada endpoint deve ter:

1. **Metodo + Rota** — `GET /api/fxl/entities/:type`
2. **Descricao** — O que o endpoint faz
3. **Parametros** — Path params, query params, body (quando aplicavel)
4. **Response** — Schema de resposta com exemplo
5. **Erros** — Codigos de erro possiveis

### Exemplo de documentacao de endpoint

```markdown
### GET /api/fxl/entities/:type

Retorna lista paginada de entidades de um tipo especifico.

**Path Params:**
- `:type` — Tipo da entidade (ex: `reservations`, `guests`)

**Query Params:**
| Param | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| `limit` | number | 50 | Limite de resultados |
| `offset` | number | 0 | Offset para paginacao |
| `search` | string | — | Filtro de busca textual |

**Response (200):**

{
  "data": [
    {
      "id": "uuid-123",
      "guestName": "Maria Silva",
      "checkIn": "2026-04-01",
      "status": "confirmed"
    }
  ],
  "pagination": {
    "total": 142,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}

**Erros:**
| Status | Descricao |
|--------|-----------|
| 401 | API key invalida ou ausente |
| 404 | Tipo de entidade nao encontrado |
| 500 | Erro interno do servidor |
```

### O que documentar

- **Endpoints do FXL Contract** — Os 6 endpoints padrao (manifest, entities, widgets, search, health, mais o de dados de widget)
- **Endpoints customizados** — Qualquer endpoint adicional especifico do spoke
- **Webhooks** — Se o spoke recebe webhooks, documentar o payload esperado

{% callout type="info" %}
Para detalhes completos do FXL Contract (tipos, schemas, regras), consulte a pagina [Contract API](/sdk/contract). A documentacao do spoke deve focar nos detalhes especificos da implementacao, nao re-documentar o contract inteiro.
{% /callout %}

---

## Diagramas de Arquitetura

Diagramas ajudam a comunicar fluxos complexos, mas nao sao obrigatorios para todo spoke. Use-os quando adicionarem valor real.

### Quando criar

- Ao adicionar uma integracao nova (ex: webhook de terceiros)
- Ao mudar o fluxo de dados principal
- Ao criar um modulo com logica complexa
- Ao documentar a arquitetura geral para onboarding

### Formato recomendado

Usar Mermaid syntax para diagramas inline em markdown. A maioria dos renderers (GitHub, VS Code, Nexo) suporta Mermaid:

```
graph LR
    A[Spoke API] -->|FXL Contract| B[Nexo Hub]
    B -->|Widget Data| C[Dashboard]
    A -->|Supabase| D[(Database)]
    A -->|Clerk JWT| E[Auth]
```

{% callout type="info" %}
Diagramas sao opcionais — priorize documentacao textual clara. Um paragrafo bem escrito vale mais que um diagrama confuso.
{% /callout %}

---

## Checklist de Documentacao

Use este checklist para validar que o spoke tem documentacao completa antes de considerar o projeto "pronto":

- [ ] **README.md** com todas as secoes obrigatorias (Sobre, Stack, Setup, Env vars, Scripts, Deploy, Estrutura)
- [ ] **CLAUDE.md** atualizado com estrutura, entidades, convencoes, quality gates e anti-patterns
- [ ] **Endpoints do FXL Contract** documentados com params, response e erros
- [ ] **Variaveis de ambiente** documentadas em `.env.example` com descricoes
- [ ] **Scripts npm** documentados no README com descricao de cada um
- [ ] **Convencoes de commit** seguidas consistentemente no historico
- [ ] **Migrations** nomeadas sequencialmente (`001_initial.sql`, `002_add_index.sql`)

{% callout type="warning" %}
O `fxl-doctor.sh` valida a presenca de README.md e CLAUDE.md automaticamente. Projetos sem esses arquivos falham no health check.
{% /callout %}
