# Requirements: v3.1 Multi-tenancy

**Defined:** 2026-03-16
**Milestone:** v3.1
**Core Value:** FXL Core e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Design Spec:** `docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md` (Section 5)

## v3.1 Requirements

Requirements para milestone v3.1 Multi-tenancy. Derivados da Section 5 do design spec.

### Schema & Data (Supabase)

- [x] **SCHEMA-01**: Criar tabela `tenant_modules` com `org_id text`, `module_id text`, `enabled boolean`, `config jsonb`, primary key `(org_id, module_id)`
  - **Aceite:** Tabela existe no Supabase com RLS habilitado. Policy restringe acesso por `org_id` do JWT.
  - **Depende de:** Nada (primeira migracao do milestone)

- [x] **SCHEMA-02**: Adicionar coluna `org_id text` a todas as tabelas existentes: `comments`, `share_tokens`, `blueprint_configs`, `briefing_configs`, `tasks`, `documents`, `knowledge_entries`
  - **Aceite:** Todas as 7 tabelas possuem coluna `org_id` com default `'org_fxl_default'`. Backfill aplicado (nenhum row com `org_id IS NULL`).
  - **Depende de:** Nada

- [x] **SCHEMA-03**: Criar RLS policies por `org_id` em todas as tabelas existentes, substituindo as policies anon-permissivas atuais
  - **Aceite:** Cada tabela tem policy `FOR ALL USING (org_id = (current_setting('request.jwt.claims')::jsonb->>'org_id'))`. Policies anon anteriores removidas ou condicionadas ao auth mode.
  - **Depende de:** SCHEMA-02

- [x] **SCHEMA-04**: Criar index em `org_id` para todas as tabelas que recebem a coluna
  - **Aceite:** Index `idx_{table}_org_id` existe em cada tabela. Query plan de `SELECT WHERE org_id = X` usa index scan.
  - **Depende de:** SCHEMA-02

### Auth & Token Exchange

- [x] **AUTH-01**: Criar Supabase Edge Function `/auth/token-exchange` que valida Clerk JWT (via JWKS), extrai `org_id`, `user_id`, `role` e minta JWT customizado para Supabase
  - **Aceite:** Edge Function deployada. Recebe Clerk token, retorna Supabase JWT com claims `{ sub, org_id, role }`. Retorna 401 para token invalido.
  - **Depende de:** Nada

- [x] **AUTH-02**: Implementar `VITE_AUTH_MODE=anon|org` flag no frontend para fallback dev/staging
  - **Aceite:** Em modo `anon`, Supabase usa anon key (comportamento atual). Em modo `org`, Supabase usa JWT customizado do token exchange. Default: `anon`.
  - **Depende de:** AUTH-01

- [x] **AUTH-03**: Refatorar `src/platform/supabase.ts` para criar Supabase client com access token dinâmico baseado no auth mode
  - **Aceite:** Quando `VITE_AUTH_MODE=org`, o Supabase client usa `supabase.auth.setSession()` com o JWT do token exchange. Quando `anon`, comportamento atual mantido.
  - **Depende de:** AUTH-01, AUTH-02

### Clerk Organizations

- [x] **CLERK-01**: Integrar Clerk Organizations no frontend — `useActiveOrg` hook com `activeOrg`, `orgs`, `switchOrg`, `isLoading`
  - **Aceite:** Hook funciona com `@clerk/react` useOrganization/useOrganizationList. Retorna org ativa, lista de orgs, funcao de switch.
  - **Depende de:** Nada

- [x] **CLERK-02**: Implementar org picker UI no TopNav — mostra selector quando usuario tem 2+ orgs, auto-seleciona se so tem uma
  - **Aceite:** Org picker visivel no TopNav. Selecionando org diferente atualiza contexto global. Com 1 org, mostra badge sem dropdown.
  - **Depende de:** CLERK-01

- [x] **CLERK-03**: Configurar `ClerkProvider` com `organizationSyncOptions` para sincronizar org ativa com URL/session
  - **Aceite:** `ClerkProvider` no App.tsx configurado. Org ativa persiste entre page reloads.
  - **Depende de:** CLERK-01

### Module System Multi-tenancy

- [ ] **MOD-01**: Refatorar `useModuleEnabled` para ler de `tenant_modules` (Supabase) em vez de `localStorage`
  - **Aceite:** Em modo `org`, modulos habilitados vem de `tenant_modules WHERE org_id = activeOrg.id`. Em modo `anon`, fallback para localStorage (comportamento atual). Loading state enquanto fetch.
  - **Depende de:** SCHEMA-01, CLERK-01, AUTH-03

- [ ] **MOD-02**: Adicionar campo `tenantScoped?: boolean` ao `ModuleDefinition` — modulos com `tenantScoped: true` so aparecem se habilitados para a org ativa
  - **Aceite:** Interface `ModuleDefinition` possui campo `tenantScoped`. Sidebar e Home filtram modulos considerando `tenantScoped` + `tenant_modules`.
  - **Depende de:** MOD-01

- [ ] **MOD-03**: Atualizar Sidebar e Home para filtrar modulos pela org ativa
  - **Aceite:** Sidebar e Home mostram apenas modulos habilitados para a org ativa. Mudanca de org atualiza sidebar/home imediatamente.
  - **Depende de:** MOD-01, MOD-02

- [ ] **MOD-04**: Migrar toggles de localStorage para `tenant_modules` na primeira execucao (migracao one-time)
  - **Aceite:** Script de migracao le localStorage, grava em `tenant_modules` para org FXL default, e limpa localStorage. Executa apenas uma vez (flag de migracao).
  - **Depende de:** SCHEMA-01, MOD-01

### Integration & Verification

- [ ] **INT-01**: `tsc --noEmit` zero erros apos todas as mudancas
  - **Aceite:** Compilacao TypeScript sem erros.
  - **Depende de:** Todos os requirements acima

- [ ] **INT-02**: `npm run build` completa sem erros
  - **Aceite:** Build de producao gera output deployavel.
  - **Depende de:** INT-01

- [ ] **INT-03**: Login com 2+ orgs mostra org picker, modulos filtrados por org, RLS isolando dados
  - **Aceite:** Teste manual end-to-end: login, org picker, sidebar filtra, dados isolados por org.
  - **Depende de:** Todos os requirements acima

- [ ] **INT-04**: Modo `anon` (default) funciona identico ao comportamento pre-v3.1
  - **Aceite:** Com `VITE_AUTH_MODE=anon` (ou sem a flag), tudo funciona como antes. Zero regressao.
  - **Depende de:** AUTH-02

## Out of Scope

| Feature | Reason |
|---------|--------|
| Admin UI para gerenciar tenant_modules | v3.1 usa seed/migration. Admin UI e futuro |
| Billing / subscription por tenant | Futuro, apos validacao do modelo |
| Connector modules | v3.3 (milestone separado) |
| Multi-org simultâneo (ver dados de 2 orgs) | Complexidade desnecessaria para v1 multi-tenancy |
| Roles/permissions granulares alem de admin/member/viewer | Clerk roles suficientes para v3.1 |
| Real-time sync de tenant_modules | Fetch on org switch e suficiente |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHEMA-01 | Phase 64 | Complete |
| SCHEMA-02 | Phase 64 | Complete |
| SCHEMA-03 | Phase 64 | Complete |
| SCHEMA-04 | Phase 64 | Complete |
| AUTH-01 | Phase 65 | Complete |
| AUTH-02 | Phase 65 | Complete |
| AUTH-03 | Phase 65 | Complete |
| CLERK-01 | Phase 65 | Complete |
| CLERK-02 | Phase 65 | Complete |
| CLERK-03 | Phase 65 | Complete |
| MOD-01 | Phase 66 | Pending |
| MOD-02 | Phase 66 | Pending |
| MOD-03 | Phase 66 | Pending |
| MOD-04 | Phase 66 | Pending |
| INT-01 | Phase 67 | Pending |
| INT-02 | Phase 67 | Pending |
| INT-03 | Phase 67 | Pending |
| INT-04 | Phase 67 | Pending |

**Coverage:**
- v3.1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-16*
