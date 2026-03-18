---
title: Checklists de Qualidade
badge: SDK
description: 5 checklists de verificacao — seguranca, estrutura, TypeScript, RLS, contract
scope: product
sort_order: 60
---

# Checklists de Qualidade

O SDK fornece 5 checklists de verificacao que cobrem todas as dimensoes de qualidade de um spoke FXL. Cada item tem um nivel de severidade que define seu peso na avaliacao.

| Severidade | Peso | Significado |
|------------|------|-------------|
| Critical | 10 | Falha bloqueia deploy — corrigir imediatamente |
| Important | 5 | Deve ser corrigido antes do proximo release |
| Normal | 2 | Boa pratica — corrigir quando possivel |
| Info | 0 | Informativo — nao impacta score |

## 1. Checklist de Seguranca

Verifica a postura de seguranca do spoke. Use em audits e antes de deploy para producao.

### Autenticacao

- [ ] **[Critical]** Clerk configurado como provider de auth (`@clerk/react` nas dependencias)
- [ ] **[Critical]** `ClerkProvider` envolve toda a aplicacao com publishable key correta
- [ ] **[Critical]** Todas as rotas exceto publicas estao protegidas por auth guards
- [ ] **[Critical]** Endpoints de API validam JWT do Clerk em todo request
- [ ] **[Important]** Validacao de JWT usa JWKS (nao secret hardcoded)
- [ ] **[Important]** `org_id` extraido de JWT validado no servidor (nunca do body/query do client)

### Variaveis de Ambiente

- [ ] **[Critical]** `.env.local` esta no `.gitignore`
- [ ] **[Critical]** Nenhum secret (API keys, service role keys) no codigo fonte
- [ ] **[Critical]** `SUPABASE_SERVICE_ROLE_KEY` NAO tem prefixo `VITE_`
- [ ] **[Critical]** `CLERK_SECRET_KEY` NAO tem prefixo `VITE_`
- [ ] **[Important]** `.env.example` existe com valores placeholder para todas as vars
- [ ] **[Normal]** Apenas vars com prefixo `VITE_` sao usadas em codigo client-side

### Supabase RLS

- [ ] **[Critical]** RLS HABILITADO em toda tabela (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] **[Critical]** Toda tabela tem policy RLS filtrando por `org_id`
- [ ] **[Critical]** Nenhuma tabela tem policy permissiva `USING (true)` em producao
- [ ] **[Important]** Service role key NAO e usada em codigo client-side
- [ ] **[Important]** Anon key usada para queries client-side (RLS cuida do isolamento)
- [ ] **[Normal]** Policies RLS testadas com queries de diferentes contextos de org

### Security Headers

- [ ] **[Important]** `vercel.json` existe com security headers
- [ ] **[Important]** `X-Frame-Options: DENY` configurado
- [ ] **[Important]** `X-Content-Type-Options: nosniff` configurado
- [ ] **[Normal]** `X-XSS-Protection: 1; mode=block` configurado
- [ ] **[Normal]** `Referrer-Policy: strict-origin-when-cross-origin` configurado
- [ ] **[Normal]** `Permissions-Policy` restringe camera, microphone, geolocation

### Input Handling

- [ ] **[Important]** Input de usuario validado antes de operacoes no banco
- [ ] **[Important]** Paginacao com tamanho maximo (100 itens)
- [ ] **[Important]** Queries de busca parametrizadas (sem SQL injection via strings cruas)
- [ ] **[Normal]** Zod ou similar para validacao de schema de inputs complexos
- [ ] **[Normal]** Sem uso de `dangerouslySetInnerHTML` com conteudo de usuario

### Dependencias

- [ ] **[Important]** Sem dependencias com vulnerabilidades conhecidas (`npm audit`)
- [ ] **[Normal]** `package-lock.json` commitado
- [ ] **[Normal]** Dependencias atualizadas (sem major version atrasada)

---

## 2. Checklist de Estrutura

Verifica a organizacao de diretorios e arquivos contra os padroes FXL.

### Arquivos na Raiz

- [ ] **[Important]** `CLAUDE.md` existe com regras especificas do projeto
- [ ] **[Important]** `package.json` tem campo `fxlContractVersion`
- [ ] **[Important]** `package.json` tem campo `fxlAppId`
- [ ] **[Important]** `tsconfig.json` existe com `strict: true`
- [ ] **[Normal]** `eslint.config.js` existe (formato flat config)
- [ ] **[Normal]** `prettier.config.js` existe
- [ ] **[Normal]** `vercel.json` existe
- [ ] **[Normal]** `fxl-doctor.sh` existe e e executavel
- [ ] **[Normal]** `.env.example` existe
- [ ] **[Normal]** `.gitignore` inclui `.env.local`

### Layout de Diretorios

- [ ] **[Important]** `src/` e a raiz do codigo fonte
- [ ] **[Important]** `src/components/ui/` contem componentes shadcn/ui
- [ ] **[Important]** `src/components/layout/` contem componentes de shell
- [ ] **[Important]** `src/types/` contem definicoes de tipos compartilhados
- [ ] **[Important]** `src/types/fxl-contract.ts` contem types do contract
- [ ] **[Normal]** `src/pages/` contem paginas de rota
- [ ] **[Normal]** `src/hooks/` contem hooks customizados compartilhados
- [ ] **[Normal]** `src/lib/` contem utilitarios e modulos de servico
- [ ] **[Normal]** `src/styles/` contem estilos globais
- [ ] **[Normal]** `supabase/migrations/` contem migrations SQL

### Estrutura do Contract API

- [ ] **[Important]** Diretorio `src/api/fxl/` existe (ou `api/fxl/` para serverless Vercel)
- [ ] **[Important]** Endpoint manifest implementado
- [ ] **[Important]** Endpoint entity list implementado
- [ ] **[Important]** Endpoint entity detail implementado
- [ ] **[Important]** Endpoint widget data implementado
- [ ] **[Important]** Endpoint search implementado
- [ ] **[Important]** Endpoint health implementado

### CI/CD

- [ ] **[Important]** `.github/workflows/ci.yml` existe
- [ ] **[Normal]** Workflow roda em push para main e em PRs
- [ ] **[Normal]** Workflow roda `fxl-doctor.sh`
- [ ] **[Normal]** Workflow roda `npm run build`

### Convencoes de Naming

- [ ] **[Normal]** Componentes usam PascalCase (ex: `ReservationCard.tsx`)
- [ ] **[Normal]** Hooks usam camelCase com prefixo `use` (ex: `useReservations.ts`)
- [ ] **[Normal]** Servicos usam camelCase com sufixo `-service` (ex: `reservation-service.ts`)
- [ ] **[Normal]** Arquivos de tipo usam PascalCase (ex: `Reservation.ts`)
- [ ] **[Normal]** Sem default exports (apenas named exports)

### Padroes de Import

- [ ] **[Normal]** Path aliases configurados (`@/` mapeia para `src/`)
- [ ] **[Normal]** Path aliases usados consistentemente (sem `../../../` relativo)
- [ ] **[Normal]** Imports de tipo usam sintaxe `import type`
- [ ] **[Info]** Sem circular imports detectados

---

## 3. Checklist de TypeScript

Verifica configuracao e uso do TypeScript contra os padroes FXL.

### Configuracao

- [ ] **[Critical]** `strict: true` no tsconfig.json
- [ ] **[Important]** `noUnusedLocals: true` habilitado
- [ ] **[Important]** `noUnusedParameters: true` habilitado
- [ ] **[Important]** `noFallthroughCasesInSwitch: true` habilitado
- [ ] **[Important]** `forceConsistentCasingInFileNames: true` habilitado
- [ ] **[Normal]** `target: "ES2020"` ou mais recente
- [ ] **[Normal]** `moduleResolution: "bundler"` para projetos Vite
- [ ] **[Normal]** `isolatedModules: true` habilitado
- [ ] **[Normal]** Path aliases configurados em `paths`

### Seguranca de Tipos

- [ ] **[Critical]** Zero usos de tipo `any` no codigo fonte
- [ ] **[Critical]** Zero comentarios `@ts-ignore` no codigo fonte
- [ ] **[Critical]** Zero comentarios `@ts-nocheck` no codigo fonte
- [ ] **[Critical]** `npx tsc --noEmit` passa com zero erros
- [ ] **[Important]** Parametros de funcao tem anotacoes de tipo explicitas
- [ ] **[Important]** Tipos de retorno explicitos para funcoes exportadas
- [ ] **[Important]** Interfaces de props definidas para todos os componentes React
- [ ] **[Normal]** `unknown` usado ao inves de `any` quando tipo e desconhecido
- [ ] **[Normal]** Type guards usados para narrowing de tipos `unknown`

### Padroes de Tipo

- [ ] **[Important]** Resultados de queries Supabase tipados (sem cast para `any`)
- [ ] **[Important]** Types de resposta de API correspondem as definicoes do contract
- [ ] **[Important]** Types de state definidos para `useState` com state nao-trivial
- [ ] **[Normal]** `interface` para shapes de objeto, `type` para unions/intersections
- [ ] **[Normal]** `const` assertions para tipos literais quando apropriado
- [ ] **[Normal]** Discriminated unions para state machines (loading/success/error)

### Anti-Patterns

- [ ] **[Critical]** Sem type assertions `as any`
- [ ] **[Important]** Sem non-null assertions `!` sem justificativa
- [ ] **[Important]** Sem `@ts-expect-error` sem comentario explicativo
- [ ] **[Normal]** Sem tipos excessivamente amplos (`Record<string, any>`, `object`, `Function`)

### Como Encontrar Problemas

```bash
# Buscar uso de any
grep -rn "any" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules

# Buscar ts-ignore
grep -rn "@ts-ignore\|@ts-nocheck\|@ts-expect-error" src/ --include="*.ts" --include="*.tsx"

# Type check completo
npx tsc --noEmit
```

---

## 4. Checklist de RLS (Row Level Security)

Verifica a configuracao de Row Level Security do Supabase para isolamento de dados.

### Para CADA Tabela no Banco

- [ ] **[Critical]** RLS habilitado (`ALTER TABLE {tabela} ENABLE ROW LEVEL SECURITY`)
- [ ] **[Critical]** Tabela tem coluna `org_id text NOT NULL`
- [ ] **[Critical]** Pelo menos uma policy RLS existe para a tabela
- [ ] **[Critical]** Policy filtra por `org_id` extraido dos JWT claims

### Padrao de Policy

```sql
CREATE POLICY "{tabela}_org_access" ON {tabela}
  FOR ALL USING (
    org_id = COALESCE(
      (current_setting('request.jwt.claims', true)::jsonb->>'org_id'),
      org_id
    )
  );
```

- `current_setting('request.jwt.claims', true)` le os claims do JWT (retorna NULL se nao ha JWT)
- `->>'org_id'` extrai o org_id dos claims
- `COALESCE(..., org_id)` fallback para auto-referencia em modo anon/dev
- `FOR ALL` se aplica a SELECT, INSERT, UPDATE, DELETE

### Verificacao por Tabela

- [ ] **[Critical]** Policy usa `org_id` dos JWT claims (nao de parametros do request)
- [ ] **[Important]** Policy cobre todas as operacoes (FOR ALL ou policies separadas por operacao)
- [ ] **[Important]** Sem policy `USING (true)` em producao (bypass de isolamento)
- [ ] **[Normal]** Padrao COALESCE usado para fallback anon/dev

### Indices

- [ ] **[Important]** Indice existe em `org_id` para cada tabela: `CREATE INDEX idx_{tabela}_org_id ON {tabela}(org_id)`
- [ ] **[Normal]** Indices compostos para patterns de query comuns (ex: `org_id + created_at`)

### Verificacao SQL

```sql
-- Listar tabelas e status de RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Listar policies RLS
SELECT tablename, policyname, permissive, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Testar isolamento
SELECT set_config('request.jwt.claims', '{"org_id": "org_a"}', true);
SELECT * FROM {tabela};  -- deve retornar apenas dados do org_a
```

### Problemas Comuns

| Problema | Severidade | Solucao |
|----------|-----------|---------|
| RLS nao habilitado | Critical | `ALTER TABLE {tabela} ENABLE ROW LEVEL SECURITY` |
| Coluna org_id ausente | Critical | `ALTER TABLE {tabela} ADD COLUMN org_id text NOT NULL DEFAULT '{default}'` |
| Sem policy na tabela | Critical | Adicionar policy padrao (ver pattern acima) |
| Policy com `USING (true)` | Critical | Substituir por policy baseada em org_id |
| Indice org_id ausente | Important | `CREATE INDEX idx_{tabela}_org_id ON {tabela}(org_id)` |
| Policy cobre apenas SELECT | Important | Mudar para `FOR ALL` ou adicionar policies por operacao |

---

## 5. Checklist de Contract

Verifica a implementacao do FXL Contract para conectividade com o Hub.

### Configuracao do Package

- [ ] **[Critical]** `package.json` tem `"fxlContractVersion": "1.0"`
- [ ] **[Critical]** `package.json` tem `"fxlAppId": "{app-id}"`
- [ ] **[Important]** `src/types/fxl-contract.ts` existe com types copiados do SDK

### GET /api/fxl/manifest

- [ ] **[Critical]** Endpoint existe e retorna 200
- [ ] **[Critical]** Resposta corresponde a interface `FxlAppManifest`
- [ ] **[Critical]** `appId` corresponde ao `fxlAppId` no package.json
- [ ] **[Important]** Array `entities` nao esta vazio (pelo menos uma entidade)
- [ ] **[Important]** Cada entidade tem `type`, `label`, `labelPlural`, `icon`, `fields`, `defaultSort`
- [ ] **[Important]** Cada field tem `key`, `label`, `type` (apenas: string, number, date, boolean)
- [ ] **[Normal]** Array `dashboardWidgets` definido (pode estar vazio)
- [ ] **[Normal]** Campo `version` segue formato semver

### GET /api/fxl/entities/:type

- [ ] **[Critical]** Endpoint existe e retorna 200 para tipo valido
- [ ] **[Critical]** Retorna 404 para tipo de entidade desconhecido
- [ ] **[Critical]** Resposta corresponde a `FxlPaginatedResponse<T>`
- [ ] **[Critical]** Resultados filtrados por `org_id` dos JWT claims
- [ ] **[Important]** Suporta parametro `page` (default: 1)
- [ ] **[Important]** Suporta parametro `pageSize` (default: 20, max: 100)
- [ ] **[Important]** Retorna `total` para paginacao
- [ ] **[Normal]** Resultados ordenados pelo `defaultSort` da entidade
- [ ] **[Normal]** Resultado vazio retorna `{ data: [], total: 0, page: 1, pageSize: 20 }`

### GET /api/fxl/entities/:type/:id

- [ ] **[Critical]** Endpoint existe e retorna 200 para entidade valida
- [ ] **[Critical]** Retorna 404 para entidade inexistente
- [ ] **[Critical]** Valida `org_id` — nao permite acesso a entidade de outro org
- [ ] **[Important]** Resposta e um objeto unico (nao envolvido em array)

### GET /api/fxl/widgets/:id/data

- [ ] **[Critical]** Endpoint existe para todos os widgets definidos no manifest
- [ ] **[Critical]** Retorna 404 para widget ID desconhecido
- [ ] **[Critical]** Dados filtrados por `org_id` dos JWT claims
- [ ] **[Important]** Widgets KPI retornam `{ value, label }` (trend, prefix, suffix opcionais)
- [ ] **[Important]** Widgets Chart retornam `{ labels, datasets }` com arrays de tamanho igual
- [ ] **[Important]** Widgets Table retornam `{ columns, rows }` com chaves de coluna consistentes
- [ ] **[Important]** Widgets List retornam `{ items }` com `id` e `title` por item

### GET /api/fxl/search?q=

- [ ] **[Critical]** Endpoint existe e retorna 200
- [ ] **[Critical]** Resultados filtrados por `org_id` dos JWT claims
- [ ] **[Important]** Resposta corresponde a `FxlSearchResponse`
- [ ] **[Important]** Busca em todos os tipos de entidade com campos string
- [ ] **[Important]** Resultados limitados a maximo 20 itens
- [ ] **[Normal]** Query vazia retorna resultados vazios (nao um erro)
- [ ] **[Normal]** Cada resultado tem `entityType`, `entityId`, `title`, `matchField`

### GET /api/fxl/health

- [ ] **[Critical]** Endpoint existe e retorna 200
- [ ] **[Critical]** Resposta tem `status: "ok"`
- [ ] **[Critical]** Resposta tem `contractVersion` correspondendo ao `fxlContractVersion` do package.json
- [ ] **[Important]** Resposta tem campo `version` (versao do app)
- [ ] **[Normal]** Resposta tem campo `timestamp` (ISO 8601)
- [ ] **[Normal]** Endpoint NAO requer autenticacao (health check publico)

### Autenticacao do Contract

- [ ] **[Critical]** Todos os endpoints exceto `/health` e `/manifest` requerem API key valida
- [ ] **[Critical]** API key validada via header `X-FXL-API-Key`
- [ ] **[Critical]** `org_id` recebido como query parameter (confiavel apos validar API key)
- [ ] **[Important]** API key invalida/ausente retorna 401 com formato `FxlErrorResponse`
- [ ] **[Important]** `org_id` ausente retorna 403

### Tratamento de Erros

- [ ] **[Important]** Erros retornam formato `FxlErrorResponse`: `{ error, statusCode }`
- [ ] **[Important]** 404 para recursos desconhecidos (nao 500)
- [ ] **[Important]** 401 para auth invalida (nao 500)
- [ ] **[Normal]** 400 para parametros invalidos (page negativo, pageSize > 100)
- [ ] **[Normal]** Erros internos retornam 500 sem vazar stack traces
