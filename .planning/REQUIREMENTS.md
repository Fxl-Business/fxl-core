# Requirements: Nexo v8.0 Estabilidade Multi-Tenant

**Defined:** 2026-03-19
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v8.0 Requirements

### Auth & Token Exchange

- [ ] **AUTH-01**: Token exchange produz JWT com org_id correto para a org ativa do usuario
- [ ] **AUTH-02**: Quando token exchange falha, usuario ve mensagem de erro clara (nao sidebar vazia silenciosa)
- [ ] **AUTH-03**: Ao trocar de org, novo token e obtido automaticamente e Supabase client e atualizado
- [ ] **AUTH-04**: Super admin com JWT super_admin=true acessa dados de qualquer org via RLS bypass

### Document Scoping & RLS

- [ ] **DOCS-01**: Tenant docs (scope='tenant') visiveis apenas para membros da org dona
- [ ] **DOCS-02**: Product docs (scope='product') visiveis para super admins de qualquer org
- [ ] **DOCS-03**: Sidebar de docs popula corretamente apos login e apos org switch
- [ ] **DOCS-04**: Cache de docs e invalidado ao trocar de org, sem dados stale da org anterior

### Modules & Org Lifecycle

- [x] **MORG-01**: Org sem tenant_modules = todos os modulos habilitados por padrao
- [x] **MORG-02**: Admin impersonando org vee dados daquela org (docs, clients, tasks, projects)
- [x] **MORG-03**: Trocar org via OrgPicker recarrega todos os dados da nova org sem reload manual
- [x] **MORG-04**: Org sem dados mostra empty states claros (nao sidebar vazia sem explicacao)

### Test Suite

- [ ] **TEST-01**: Unit tests para useOrgTokenExchange, useActiveOrg, token-exchange service
- [ ] **TEST-02**: Integration tests executando queries SQL com JWTs de diferentes orgs, validando isolamento
- [x] **TEST-03**: Tests validando que dados mudam corretamente ao trocar de org (cache, sidebar, modules)
- [x] **TEST-04**: Smoke test login -> org ativa -> sidebar com docs -> troca org -> sidebar atualiza

## Future Requirements

(none deferred)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Migracao automatica de dados entre orgs | Operacao admin manual, nao self-service |
| E2E browser tests (Playwright/Cypress) | Complexidade de setup, unit/integration suficiente para v8.0 |
| Test coverage para wireframe/blueprint | Foco em multi-tenant pipeline, wireframe e estavel |
| Performance testing | Foco em corretude, nao performance |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 121 | Pending |
| AUTH-02 | Phase 121 | Pending |
| AUTH-03 | Phase 121 | Pending |
| AUTH-04 | Phase 121 | Pending |
| DOCS-01 | Phase 122 | Pending |
| DOCS-02 | Phase 122 | Pending |
| DOCS-03 | Phase 122 | Pending |
| DOCS-04 | Phase 122 | Pending |
| MORG-01 | Phase 123 | Verified |
| MORG-02 | Phase 123 | Verified |
| MORG-03 | Phase 123 | Verified |
| MORG-04 | Phase 123 | Verified |
| TEST-01 | Phase 121 | Pending |
| TEST-02 | Phase 122 | Pending |
| TEST-03 | Phase 123 | Verified |
| TEST-04 | Phase 124 | Verified |

**Coverage:**
- v8.0 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
