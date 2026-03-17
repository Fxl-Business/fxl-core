# Requirements: v4.1 Super Admin

**Defined:** 2026-03-17
**Milestone:** v4.1
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Design Spec:** `docs/superpowers/specs/2026-03-17-nexo-platform-evolution-design.md` (Section 4, v4.1)

## v4.1 Requirements

### Auth & Roles

- [ ] **AUTH-01**: Clerk JWT template inclui claim `super_admin` extraido de publicMetadata
- [ ] **AUTH-02**: Componente SuperAdminRoute redireciona usuarios sem claim super_admin
- [ ] **AUTH-03**: Todas as rotas /admin/* protegidas por SuperAdminRoute

### Admin Dashboard

- [ ] **ADMIN-01**: Pagina /admin com metricas agregadas (total tenants, total usuarios, modulos ativos)
- [ ] **ADMIN-02**: Sidebar/nav do admin com links para todas as sub-paginas

### Tenant Management

- [ ] **TENANT-01**: Pagina /admin/tenants lista todas as Clerk Organizations
- [ ] **TENANT-02**: Pagina /admin/tenants/:orgId mostra detalhes do tenant (modulos, metricas, connectors)
- [ ] **TENANT-03**: Super admin pode criar novo tenant (Clerk org) via painel

### Module Management

- [ ] **MOD-01**: Pagina /admin/modules evolui de localStorage para Supabase tenant_modules
- [ ] **MOD-02**: Super admin configura modulos habilitados por tenant (nao mais toggle local)
- [ ] **MOD-03**: Operador do tenant ve apenas modulos habilitados pelo super admin

### Platform Settings

- [ ] **SET-01**: Tabela platform_settings (key/value) no Supabase
- [ ] **SET-02**: Pagina /admin/settings para feature flags e configs globais

### RLS Updates

- [ ] **RLS-01**: Policies de todas as tabelas atualizadas com check super_admin no JWT
- [ ] **RLS-02**: Super admin pode ver dados de todos os tenants via RLS bypass

### Admin UX

- [ ] **UX-01**: Toggle admin/operator na topbar quando usuario tem claim super_admin
- [ ] **UX-02**: Modo operator funciona como tenant normal (FXL)

### MCP Integrations

- [ ] **MCP-01**: Supabase MCP server configurado em .claude/settings.json
- [ ] **MCP-02**: Clerk MCP server configurado em .claude/settings.json
- [ ] **MCP-03**: Operacoes de super admin documentadas (criar tenant, habilitar modulo, etc.)

### Verification

- [ ] **VERIF-01**: npx tsc --noEmit zero erros
- [ ] **VERIF-02**: npm run build sem erros

## Out of Scope

| Feature | Reason |
|---------|--------|
| Billing / payments | Future — no revenue model yet |
| Self-service module marketplace | Super admin controls modules manually |
| Product docs CRUD | v4.2 (placeholder page only in v4.1) |
| Tenant onboarding flow | v4.3 |
| Custom domains per tenant | Future |
| Tenant-level branding | Future |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 75 | Pending |
| AUTH-02 | Phase 75 | Pending |
| AUTH-03 | Phase 75 | Pending |
| RLS-01 | Phase 75 | Pending |
| RLS-02 | Phase 75 | Pending |
| ADMIN-01 | Phase 76 | Pending |
| ADMIN-02 | Phase 76 | Pending |
| UX-01 | Phase 76 | Pending |
| UX-02 | Phase 76 | Pending |
| TENANT-01 | Phase 77 | Pending |
| TENANT-02 | Phase 77 | Pending |
| TENANT-03 | Phase 77 | Pending |
| MOD-01 | Phase 78 | Pending |
| MOD-02 | Phase 78 | Pending |
| MOD-03 | Phase 78 | Pending |
| SET-01 | Phase 79 | Pending |
| SET-02 | Phase 79 | Pending |
| MCP-01 | Phase 79 | Pending |
| MCP-02 | Phase 79 | Pending |
| MCP-03 | Phase 79 | Pending |
| VERIF-01 | Phase 80 | Pending |
| VERIF-02 | Phase 80 | Pending |

**Coverage:**
- v4.1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-03-17*
*Traceability updated: 2026-03-17*
