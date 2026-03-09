---
title: "Fase 3 - Geracao de Sistema"
badge: Processo
description: "Gerar dashboard BI a partir do Blueprint + TechnicalConfig + Branding"
---

# Fase 3 - Geracao de Sistema

A Geracao de Sistema transforma a configuracao completa do cliente (Blueprint + TechnicalConfig + Branding)
em um dashboard BI funcional e deployavel. O output e um repositorio separado com frontend (Vite + React)
e backend (NestJS), conectado ao Supabase via backend e autenticado com Clerk.

O processo e semi-automatico: o operador acompanha e revisa, Claude Code gera o codigo
a partir de um product spec estruturado.

**Posicao no fluxo:**

Blueprint (Fase 2) + TechnicalConfig (Fase 3 Config) + Branding (Fase 4) -> **Geracao de Sistema** -> Repo do cliente funcional

---

## Pre-requisitos

Antes de iniciar a geracao, todos os itens abaixo devem estar completos:

- Blueprint completo (`clients/[slug]/wireframe/blueprint.config.ts`) com todas as telas definidas
- TechnicalConfig completo (`clients/[slug]/wireframe/technical.config.ts`) com bindings para todas as secoes
- BrandingConfig preenchido (`clients/[slug]/wireframe/branding.config.ts`) com cores, fontes e logo
- Validacao passando: `validateConfig()` retorna `valid: true` com zero erros

{% callout type="warning" %}
Nunca inicie a geracao sem rodar a validacao. Erros de referencia ou bindings faltantes resultam em um sistema incompleto.
{% /callout %}

---

## Fluxo de Geracao

### Step 1: Gerar Product Spec

Usar `writeProductSpec()` de `tools/wireframe-builder/lib/spec-writer.ts` para gerar os 6 arquivos
de product spec a partir das configuracoes do cliente.

O pipeline executa automaticamente:
1. **Validacao** -- verifica slug match, cobertura de bindings, integridade de referencias
2. **Resolucao** -- merge Blueprint + TechnicalConfig + Branding em GenerationManifest
3. **Geracao** -- produz 6 arquivos de spec autocontidos
4. **Escrita** -- grava os arquivos no diretorio de output

**Output:** diretorio `.product-spec/` com 6 arquivos:
- `product-spec.md` -- visao geral, navegacao, roles, endpoints
- `database-schema.sql` -- SQL completo (tables, indexes, RLS)
- `data-layer.md` -- campos, formulas, agregacoes, thresholds
- `screens.md` -- telas com secoes e data bindings
- `branding.md` -- cores, fontes, CSS vars, Tailwind config
- `upload-rules.md` -- mapeamento de colunas, formatos BR, validacao

### Step 2: Preparar Repositorio do Cliente

1. Clonar o template repo do dashboard:
   ```bash
   git clone {template-repo-url} clients/{slug}-dashboard
   ```

2. Copiar os arquivos de product spec para o repo clonado:
   ```bash
   cp -r .product-spec/ clients/{slug}-dashboard/.product-spec/
   ```

3. Instalar dependencias do frontend e backend:
   ```bash
   cd clients/{slug}-dashboard/frontend && npm install
   cd clients/{slug}-dashboard/backend && npm install
   ```

### Step 3: Configurar Servicos Externos

1. **Supabase:** Criar um novo projeto Supabase para o cliente
   - Acessar [supabase.com/dashboard](https://supabase.com/dashboard) e criar projeto
   - Copiar Project URL e anon key

2. **Database:** Aplicar o schema SQL gerado
   - Abrir SQL Editor no dashboard do Supabase
   - Colar e executar o conteudo de `database-schema.sql`

3. **Clerk:** Configurar aplicacao de auth para o cliente
   - Criar nova application no [Clerk Dashboard](https://dashboard.clerk.com)
   - Configurar Google OAuth e email/password
   - Copiar Publishable Key e Secret Key

4. **Environment:** Preencher `.env` do frontend e backend com as chaves obtidas

### Step 4: Gerar Sistema com Claude Code

1. Abrir Claude Code no repositorio do cliente
2. Claude Code le os 6 arquivos em `.product-spec/` e gera o sistema completo
3. O operador revisa cada parte gerada e ajusta conforme necessario

### Step 5: Testar e Validar

1. Iniciar frontend e backend:
   ```bash
   cd frontend && npm run dev
   cd backend && npm run start:dev
   ```

2. Testar funcionalidades:
   - Upload de arquivo CSV/XLSX e verificar parsing com formatos BR
   - Verificar dashboards com dados reais (KPIs, graficos, tabelas)
   - Testar autenticacao com os 3 roles (admin, editor, viewer)
   - Verificar branding aplicado (cores, fontes, logo)

3. Validar completude:
   - Todas as telas do blueprint estao presentes
   - Todos os KPIs e graficos carregam dados corretamente
   - Upload funciona com normalizacao de formatos BR

### Step 6: Linkar como Submodule

Adicionar o repositorio do cliente como submodule no fxl-core para acesso centralizado:

```bash
git submodule add {repo-url} clients/{slug}-dashboard
git commit -m "infra: link {slug}-dashboard as submodule"
```

{% callout type="info" %}
Cada cliente tem seu proprio repositorio com frontend + backend independentes.
O fxl-core e a central que referencia todos os sistemas gerados via submodules.
{% /callout %}

---

{% operational %}
### Prompts para Operacao

Use estes prompts no Claude Code para executar o fluxo de geracao.

{% prompt label="Gerar Product Spec" %}
Leia o blueprint.config.ts, technical.config.ts e branding.config.ts do cliente {slug}.
Use writeProductSpec() de @tools/wireframe-builder/lib/spec-writer.ts para gerar
os arquivos de product spec em clients/{slug}-dashboard/.product-spec/.
{% /prompt %}

{% prompt label="Gerar Sistema no Repo do Cliente" %}
Leia todos os arquivos em .product-spec/ e gere o sistema completo:
- Frontend: paginas, componentes, hooks, providers conforme screens.md e product-spec.md
- Backend: controllers, services, guards conforme product-spec.md e data-layer.md
- Database: execute database-schema.sql no Supabase
- Branding: aplique tokens de branding.md
- Upload: implemente regras de upload-rules.md
{% /prompt %}
{% /operational %}

---

## Arquivos de Product Spec

Referencia do que cada arquivo contem e quem consome:

| Arquivo | Conteudo | Consumido por |
|---------|----------|---------------|
| product-spec.md | Visao geral, navegacao, roles, endpoints | Claude Code (backend + frontend) |
| database-schema.sql | SQL completo para Supabase | Supabase SQL Editor |
| data-layer.md | Campos, formulas, agregacoes | Claude Code (backend) |
| screens.md | Telas com secoes e bindings | Claude Code (frontend) |
| branding.md | Cores, fontes, CSS vars | Claude Code (frontend) |
| upload-rules.md | Mapeamento de colunas, formatos BR | Claude Code (backend) |

---

## Stack do Sistema Gerado

Cada dashboard gerado usa a seguinte stack:

**Frontend:**
- Vite + React + TypeScript
- TanStack Query (data fetching)
- react-router-dom (routing)
- recharts (graficos)
- shadcn/ui + Tailwind CSS (componentes visuais)
- Clerk React SDK (autenticacao)

**Backend:**
- NestJS + TypeScript
- Supabase client (database access)
- SheetJS (parsing de CSV/XLSX)
- Clerk backend SDK (validacao de tokens)

**Infraestrutura:**
- Supabase (PostgreSQL + RLS)
- Clerk (auth provider com 3 roles)
- Cada cliente tem seu proprio repo com `frontend/` e `backend/`
