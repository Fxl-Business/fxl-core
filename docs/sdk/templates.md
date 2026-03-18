---
title: Templates
badge: SDK
description: Configs geradas para projetos spoke — TypeScript, ESLint, CI, deploy
scope: product
sort_order: 50
---

# Templates

O SDK fornece 8 templates de configuracao que sao **copiados** para cada spoke (nao importados como dependencia). Isso garante que cada projeto tenha controle total sobre suas configs, mantendo a padronizacao FXL como ponto de partida.

{% callout type="info" %}
Templates sao copiados, nao linkados. Apos copiar, o projeto e dono do arquivo e pode customiza-lo conforme necessidade — desde que as regras obrigatorias sejam mantidas.
{% /callout %}

## 1. CLAUDE.md.template

**Proposito:** Arquivo de contexto e regras para operacao com Claude Code.

**Placeholders para substituir:**
- `{{PROJECT_NAME}}` — nome legivel do projeto
- `{{PROJECT_SLUG}}` — slug do projeto (ex: `beach-houses`)
- `{{ENTITIES}}` — lista de entidades do dominio
- `{{DOMAIN}}` — nome do dominio (ex: `reservations`)

**Secoes geradas:**
- Natureza do projeto (spoke FXL, App ID, contract version)
- Stack (identica a padrao + extras do projeto)
- Estrutura de diretorios
- Entidades do dominio
- Convencoes de codigo (naming, imports, commits)
- Regras de seguranca (env vars, RLS, auth)
- Tabela de endpoints do contract
- Quality gates (`npx tsc --noEmit`, `fxl-doctor.sh`)
- Lista de "nunca fazer"

**Obrigatorio manter:** Todas as secoes. Adicionar regras especificas do projeto ao final.

## 2. tsconfig.json.template

**Proposito:** TypeScript strict mode com path aliases para Vite.

**Configuracoes-chave:**

| Config | Valor | Motivo |
|--------|-------|--------|
| `strict` | `true` | Todas as verificacoes de tipo habilitadas |
| `noUnusedLocals` | `true` | Nao permite variaveis locais nao usadas |
| `noUnusedParameters` | `true` | Nao permite parametros nao usados |
| `noFallthroughCasesInSwitch` | `true` | Exige break em cada case |
| `forceConsistentCasingInFileNames` | `true` | Previne problemas cross-platform |
| `moduleResolution` | `bundler` | Compativel com Vite |
| `isolatedModules` | `true` | Necessario para Vite |
| `target` | `ES2020` | Suporte a optional chaining, nullish coalescing |
| `paths` | `{ "@/*": ["./src/*"] }` | Path alias padrao |

**Customizacoes permitidas:**
- Adicionar path aliases extras (ex: `@/components/*`)
- Incluir pastas adicionais no `include`

**Nunca alterar:**
- `strict: true`
- `noUnusedLocals` e `noUnusedParameters`

## 3. eslint.config.js.template

**Proposito:** ESLint com flat config, regras TypeScript strict e plugins React.

**Plugins incluidos:**
- `@eslint/js` — regras base
- `typescript-eslint` — regras TypeScript
- `eslint-plugin-react-hooks` — validacao de hooks
- `eslint-plugin-react-refresh` — HMR com Vite

**Regras FXL (obrigatorias):**

| Regra | Nivel | Motivo |
|-------|-------|--------|
| `@typescript-eslint/no-explicit-any` | `error` | Proibe uso de `any` |
| `@typescript-eslint/no-unused-vars` | `error` | Variaveis nao usadas (ignora `_prefixed`) |
| `@typescript-eslint/consistent-type-imports` | `error` | Exige `import type` |
| `no-console` | `warn` | Permite `console.warn` e `console.error` |
| `prefer-const` | `error` | Usar `const` quando possivel |
| `eqeqeq` | `error` | Sempre `===`, nunca `==` |

**Customizacoes permitidas:**
- Adicionar regras de dominio (ex: naming conventions especificas)
- Ajustar nivel de `no-console` se necessario

## 4. prettier.config.js.template

**Proposito:** Formatacao automatica consistente.

**Configuracao:**

| Config | Valor |
|--------|-------|
| `semi` | `false` (sem ponto e virgula) |
| `singleQuote` | `true` |
| `trailingComma` | `es5` |
| `tabWidth` | `2` |
| `printWidth` | `100` |
| `bracketSpacing` | `true` |
| `arrowParens` | `avoid` |
| `endOfLine` | `lf` |

**Plugin obrigatorio:** `prettier-plugin-tailwindcss` (ordena classes Tailwind automaticamente).

## 5. tailwind.preset.js.template

**Proposito:** Preset Tailwind com tokens visuais da FXL (cores, tipografia, animacoes).

**Como usar:**

```typescript
// tailwind.config.ts do spoke
import fxlPreset from './tailwind.preset'

export default {
  presets: [fxlPreset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Adicionar cores do cliente aqui
}
```

**Tokens incluidos:**
- **Cores:** Sistema de cores via CSS variables (background, foreground, primary, secondary, destructive, muted, accent, popover, card, border, input, ring)
- **Tipografia:** Inter (sans), JetBrains Mono (mono)
- **Border radius:** Sistema de 3 niveis (lg, md, sm) via CSS variable `--radius`
- **Animacoes:** `fade-in`, `slide-up` (0.2s ease-out)
- **Font size extra:** `2xs` (0.625rem)

**Customizacoes permitidas:**
- Adicionar cores de branding do cliente
- Ajustar fontes se o cliente tem tipografia propria
- Adicionar animacoes customizadas

**Plugin obrigatorio:** `tailwindcss-animate`

## 6. vercel.json.template

**Proposito:** Configuracao de deploy Vercel com security headers e SPA routing.

**Security headers aplicados a todas as rotas `/(.*)`:**

| Header | Valor |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

**Cache de assets:**

Assets em `/assets/(.*)` recebem `Cache-Control: public, max-age=31536000, immutable` (Vite gera nomes com hash, entao cache imutavel e seguro).

**SPA Rewrite:**

```json
{ "source": "/((?!api/).*)", "destination": "/index.html" }
```

Todas as rotas exceto `/api/*` sao redirecionadas para `index.html`, permitindo roteamento client-side via React Router.

{% callout type="warning" %}
Nunca remover os security headers. O `fxl-doctor.sh` valida a presenca de `X-Frame-Options` e `X-Content-Type-Options`.
{% /callout %}

## 7. ci.yml.template

**Proposito:** Workflow do GitHub Actions para CI.

**Triggers:**
- Push para `main`
- Pull request targeting `main`

**Steps:**
1. Checkout do codigo
2. Setup Node.js 18 (com cache npm)
3. Install (`npm ci`)
4. FXL Doctor (`bash fxl-doctor.sh`)
5. Build (`npm run build`)

**Configuracoes:**
- `timeout-minutes: 10`
- `permissions: contents: read`

**Customizacoes permitidas:**
- Adicionar step de testes (`npm test`)
- Adicionar step de deploy preview
- Adicionar notificacoes (Slack, Discord)

## 8. fxl-doctor.sh.template

**Proposito:** Script de health check que roda no CI e pode ser executado localmente.

**5 verificacoes:**

| Check | Comando | Criterio |
|-------|---------|----------|
| TypeScript | `npx tsc --noEmit` | Zero erros |
| ESLint | `npx eslint .` | Zero erros |
| Prettier | `npx prettier --check .` | Todos os arquivos formatados |
| Security headers | Valida `vercel.json` | `X-Frame-Options` e `X-Content-Type-Options` presentes |
| Contract version | Valida `package.json` | `fxlContractVersion` >= `1.0` |

**Como rodar localmente:**

```bash
chmod +x fxl-doctor.sh
bash fxl-doctor.sh
```

**Saida:**
- Cada check exibe `PASS` ou `FAIL`
- Resumo final: `ALL CHECKS PASSED` ou `N CHECK(S) FAILED`
- Exit code 0 (sucesso) ou 1 (falha)

**Customizacoes permitidas:**
- Adicionar checks especificos do projeto apos os 5 checks padrao
- Exemplo: verificar existencia de migrations, buscar TODOs no codigo

{% callout type="info" %}
O fxl-doctor.sh e o gate principal de qualidade. Se ele passa, o spoke esta em conformidade com os padroes FXL.
{% /callout %}
