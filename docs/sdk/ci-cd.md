---
title: CI/CD e Deploy
badge: SDK
description: GitHub Actions, Vercel, fxl-doctor e configuracao de deploy
scope: product
sort_order: 70
---

# CI/CD e Deploy

Todo spoke FXL usa GitHub Actions para integracao continua e Vercel para deploy. O script `fxl-doctor.sh` e o gate principal de qualidade.

## GitHub Actions

### Workflow CI

O workflow roda automaticamente em:

- **Push** para `main`
- **Pull request** targeting `main`

```yaml
name: FXL Doctor CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  check:
    name: FXL Doctor
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run FXL Doctor
        run: bash fxl-doctor.sh

      - name: Build
        run: npm run build
```

### Detalhes dos Steps

| Step | Comando | Proposito |
|------|---------|----------|
| Checkout | `actions/checkout@v4` | Clona o repositorio |
| Setup Node | `actions/setup-node@v4` | Configura Node.js 18 com cache npm |
| Install | `npm ci` | Instala dependencias do lockfile (reprodutivel) |
| FXL Doctor | `bash fxl-doctor.sh` | Roda as 5 verificacoes de qualidade |
| Build | `npm run build` | Verifica que o build Vite produz output valido |

{% callout type="info" %}
Usar `npm ci` (nao `npm install`) no CI garante que as dependencias sao identicas ao lockfile. Isso previne "funciona na minha maquina" por versoes diferentes.
{% /callout %}

## fxl-doctor.sh

O script de health check que roda no CI e pode ser executado localmente.

### 5 Verificacoes

| # | Check | Comando | Criterio |
|---|-------|---------|----------|
| 1 | TypeScript | `npx tsc --noEmit` | Zero erros de tipo |
| 2 | ESLint | `npx eslint .` | Zero erros de lint |
| 3 | Prettier | `npx prettier --check .` | Todos os arquivos formatados |
| 4 | Security headers | Valida `vercel.json` | `X-Frame-Options` e `X-Content-Type-Options` presentes |
| 5 | Contract version | Valida `package.json` | `fxlContractVersion` presente e >= `1.0` |

### Rodando Localmente

```bash
chmod +x fxl-doctor.sh
bash fxl-doctor.sh
```

Saida exemplo:

```
============================================
  FXL Doctor — Conformance Check
============================================

[1/5] TypeScript type-check...
  PASS: TypeScript

[2/5] ESLint...
  PASS: ESLint

[3/5] Prettier formatting...
  PASS: Prettier

[4/5] Security headers...
  PASS: Security headers

[5/5] Contract version...
  PASS: Contract version 1.0

============================================
  FXL Doctor — ALL CHECKS PASSED
============================================
```

### Estendendo o Script

Checks customizados podem ser adicionados apos as 5 verificacoes padrao:

```bash
# Exemplo: verificar TODOs no codigo
echo "Checking for TODO comments..."
if grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules; then
  echo "WARNING: Found TODO comments (not blocking)"
fi

# Exemplo: verificar existencia de migrations
echo "Checking migrations..."
if [ ! -d "supabase/migrations" ] || [ -z "$(ls -A supabase/migrations)" ]; then
  echo "ERROR: No Supabase migrations found"
  exit 1
fi
```

## Branch Protection

Apos o CI estar rodando, configurar protecao de branch no GitHub:

1. Settings > Branches > Add rule
2. Branch name pattern: `main`
3. Habilitar:
   - **Require status checks to pass** antes de merge
   - Selecionar o check **FXL Doctor** como obrigatorio
   - **Require pull request reviews** (opcional para dev solo)

{% callout type="warning" %}
Sem branch protection, e possivel fazer push direto para main sem passar pelo CI. Configurar a protecao e altamente recomendado.
{% /callout %}

## Vercel Deploy

### Setup Inicial

**Via Dashboard:**
1. Acessar `vercel.com/new`
2. Importar repositorio Git
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

**Via CLI:**
```bash
npm i -g vercel
vercel link
```

### Configuracao do vercel.json

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

### Variaveis de Ambiente no Vercel

Configurar em Vercel Dashboard > Project > Settings > Environment Variables:

| Variavel | Ambientes | Notas |
|----------|----------|-------|
| `VITE_SUPABASE_URL` | Production, Preview, Development | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Development | Chave anon publica |
| `VITE_CLERK_PUBLISHABLE_KEY` | Production, Preview, Development | Chave publica Clerk |

**Nunca configurar no Vercel (server-side only):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_SECRET_KEY`

### Dominio

- **Producao:** `{project-slug}.fxl.app` (ex: `beach-houses.fxl.app`)
- **Preview:** Automatico — `{project-slug}-{branch}.vercel.app`

## Preview Deploys

Cada Pull Request recebe automaticamente uma URL de preview no Vercel. Isso permite:

- Testar mudancas visuais antes do merge
- Compartilhar link com stakeholders para review
- Validar que o build funciona no ambiente Vercel

Para variaveis de ambiente especificas de preview, usar o scope "Preview" no dashboard do Vercel.

## SPA Routing

A regra de rewrite no `vercel.json` garante que rotas client-side funcionem:

```json
{ "source": "/((?!api/).*)", "destination": "/index.html" }
```

Todas as rotas exceto `/api/*` sao redirecionadas para `index.html`, deixando o React Router resolver a rota.

{% callout type="info" %}
Se o spoke usa Vercel Serverless Functions (na pasta `api/`), elas sao excluidas do rewrite pelo pattern `(?!api/)`.
{% /callout %}

## API Routes (Serverless Functions)

Se o spoke implementa os endpoints do FXL Contract como Vercel Serverless Functions:

```
api/
  fxl/
    manifest.ts        -> GET /api/fxl/manifest
    health.ts          -> GET /api/fxl/health
    search.ts          -> GET /api/fxl/search
    entities/
      [type].ts        -> GET /api/fxl/entities/:type
      [type]/
        [id].ts        -> GET /api/fxl/entities/:type/:id
    widgets/
      [id]/
        data.ts        -> GET /api/fxl/widgets/:id/data
```

{% callout type="info" %}
Para SPAs simples, os endpoints do contract podem ser implementados client-side usando Supabase diretamente (RLS cuida da auth). Serverless functions sao necessarias apenas se ha processamento server-side.
{% /callout %}

## Build Optimization

### Chunking com Vite

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          clerk: ['@clerk/react'],
        },
      },
    },
  },
})
```

Separar vendors em chunks reduz o tamanho do bundle principal e melhora cache hits (vendors mudam com menos frequencia).

## Troubleshooting

### CI falha mas local funciona

- Verificar que a versao do Node.js e 18 (mesma do CI)
- Rodar `npm ci` localmente (nao `npm install`) para replicar o lockfile
- Verificar que `.env.local` nao e necessaria para type-check/build

### Erros de tipo apenas no CI

- Provavelmente uma dependencia de tipo ausente. Verificar `devDependencies` no `package.json`
- Rodar `npx tsc --noEmit` localmente com `node_modules/` limpo (deletar e reinstalar)

### Build falha no Vercel

- Verificar que todas as vars `VITE_*` estao configuradas no Vercel
- Vite build exige que todos os imports sejam resolvidos
- Usar `import.meta.env.VITE_*` (nao `process.env`)

### 404 ao atualizar pagina

- Verificar a regra de rewrite SPA no `vercel.json`
- O pattern `/((?!api/).*)` deve cobrir todas as rotas que nao sao API

### API routes retornam 404

- O arquivo deve estar na pasta `api/` na raiz do projeto (nao em `src/api/`)
- A funcao deve exportar default (`export default function handler`)
