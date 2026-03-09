# Phase 6: System Generation - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate a standalone BI dashboard from the merged configuration (BlueprintConfig + TechnicalConfig + BrandingConfig). The generated system is a Vite + React frontend with a NestJS backend, connected to Supabase via the backend. Includes data upload with BR format normalization, Clerk auth with 3 roles, and client branding applied automatically. Each client gets their own repo (frontend + backend), deployed independently.

</domain>

<decisions>
## Implementation Decisions

### Backend architecture
- Backend separado obrigatorio — NestJS como framework
- Frontend NUNCA conecta direto no Supabase — toda comunicacao passa pelo backend NestJS
- Toda logica de negocio vive no backend: aggregations, formulas, normalizacao de formatos BR, validacoes
- 1 backend por cliente — cada dashboard gerado tem seu proprio backend + frontend em repo separado
- Supabase e o database provider, mas acessado exclusivamente via backend

### Generated project stack
- Frontend: Vite + React (NAO Next.js — SSR apenas quando justificado, dashboards BI nao precisam)
- Backend: NestJS
- Database: Supabase (PostgreSQL)
- Auth: Clerk
- Cada tabela Supabase e tipada por report type (ex: tabela `contas_a_receber` com colunas tipadas, nao estrutura generica/EAV)

### Generation mechanism
- Template + product spec hibrido: um repo template base (Vite+React+NestJS scaffold) ja existe, e o product spec preenche as partes dinamicas
- Template repo vive como repo separado no GitHub, linkado como git submodule no fxl-core
- Repos de clientes gerados tambem ficam como submodules no fxl-core — permite Claude Code ter acesso e futura central de gerenciamento
- Semi-automatico com revisao: operador clona template, abre Claude Code, passa product spec. Claude gera, operador revisa e ajusta
- Fluxo: clone template → Claude Code le product spec → gera codigo → operador revisa

### Generation output (product spec)
- O output NAO e um unico SKILL.md monolitico que re-ensina como usar React/NestJS/Clerk
- Skills globais (Vite, Clerk, NestJS, shadcn, etc.) ja estao instalados no Claude Code do operador — nao precisa repetir instrucoes de ferramentas
- O output e um product spec: descreve O QUE gerar (telas, dados, regras de negocio, branding), nao COMO usar cada ferramenta
- Separado em multiplos arquivos para dar contexto organizado ao Claude Code (ex: product-spec.md, database-schema.md, etc.)
- Gerado automaticamente a partir do GenerationManifest (output do Config Resolver)
- O renderSkillMd() atual do Phase 5 precisa ser adaptado — Claude decide a melhor abordagem (refatorar, evoluir, ou substituir)

### Data upload & processing
- Upload de CSV/XLSX com preview no frontend + parsing real no backend
- Frontend: preview/validacao basica (mostrar colunas, detectar erros de formato)
- Backend: parsing definitivo, normalizacao de formatos BR (1.234,56 → number, dd/mm/yyyy → date), validacao contra schema, insert no Supabase
- Um arquivo por vez: usuario seleciona periodo (mes/ano), report type, faz upload de 1 arquivo
- Dados armazenados em tabelas Supabase por report type (colunas tipadas, SQL gerado no product spec)

### Auth for end-users
- Clerk como auth provider (mesmo do fxl-core)
- 3 roles: Admin (acesso total), Editor (upload + ajustes, sem settings), Viewer (read-only)
- Gestao de usuarios: operador FXL faz setup inicial, admin do cliente pode convidar/remover usuarios depois
- Tela de gerenciamento de usuarios necessaria no dashboard gerado

### System type detection
- O tipo de sistema (dashboard, landing page, etc.) ja e determinavel na etapa de Blueprint
- Blueprint define quais skills sao necessarias e qual stack usar (Vite vs Next, dependendo do tipo)
- Para v1, foco exclusivo em Dashboard BI

### Claude's Discretion
- Estrutura exata do product spec (quantos arquivos, nomes, formato)
- Como adaptar o renderSkillMd() do Phase 5 para o novo modelo de output
- Organizacao interna do template repo (folder structure, configs base)
- Estrategia de deploy (Vercel + Railway/Render, ou outra combinacao)
- State management no frontend gerado (Zustand, React Query, Context)
- Component library no frontend gerado (shadcn/ui, Tailwind puro)
- Routing no frontend gerado
- Como implementar formula calculations no backend NestJS

</decisions>

<specifics>
## Specific Ideas

- O fxl-core deve ser uma "central" de todos os sistemas gerados — via submodules, com visibilidade dos repos e (futuro) painel de gerenciamento
- Skills do Claude Code sao globais — nao embutir instrucoes de ferramentas no product spec
- O product spec e um "contrato" que descreve o produto, nao um tutorial de como programar
- O Blueprint ja sabe se e dashboard, landing page, etc. — essa informacao flui para a geracao
- Semi-automatico: o operador acompanha e revisa, nao e generation-and-forget
- Pilot client (financeiro-conta-azul) e o primeiro teste real

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/wireframe-builder/lib/config-resolver.ts`: resolveConfig() que merge 3 configs em GenerationManifest — base para gerar o product spec
- `tools/wireframe-builder/lib/skill-renderer.ts`: renderSkillMd() atual — precisa ser adaptado para o novo modelo multi-arquivo
- `tools/wireframe-builder/lib/config-validator.ts`: validateConfig() — deve rodar antes da geracao para garantir cobertura
- `tools/wireframe-builder/types/generation.ts`: GenerationManifest type — tipo de entrada para a geracao
- `tools/wireframe-builder/types/technical.ts`: TechnicalConfig com 23 tipos — schema completo de dados
- `clients/financeiro-conta-azul/wireframe/technical.config.ts`: pilot client config completo para teste

### Established Patterns
- Config-as-TypeScript: blueprint.config.ts, branding.config.ts, technical.config.ts — pattern consolidado
- Pure function pipeline: BlueprintConfig + TechnicalConfig + BrandingConfig → GenerationManifest → output
- SKILL.md como instrucao para Claude Code (tools/wireframe-builder/SKILL.md) — pattern existente a adaptar

### Integration Points
- `tools/wireframe-builder/lib/skill-renderer.ts` — ponto de refatoracao principal (output multi-arquivo)
- Git submodules — novo pattern para linkar template e repos de clientes no fxl-core
- Clerk — ja configurado no fxl-core, mesmo provider para dashboards gerados
- Supabase — ja usado no fxl-core, novo projeto Supabase por cliente

</code_context>

<deferred>
## Deferred Ideas

- Painel de gerenciamento no fxl-core para monitorar status/deploy/metricas de todos os sistemas gerados — fase futura
- Multi-tenant (1 backend servindo todos os clientes) — avaliar quando escalar
- Tipos de sistema alem de Dashboard BI (landing page, mobile app) — futuro, apos v1
- API-based data import (sem upload de arquivo) — mencionado em briefing como "API futura"
- Deploy automatizado via CI/CD para projetos gerados — avaliar apos pilot funcionar
- Visual editor para TechnicalConfig — fase futura (Phase 5 deferred)

</deferred>

---

*Phase: 06-system-generation*
*Context gathered: 2026-03-09*
