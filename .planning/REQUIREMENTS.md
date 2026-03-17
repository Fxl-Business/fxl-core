# Requirements: Nexo

**Defined:** 2026-03-17
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v4.2 Requirements

Requirements for milestone v4.2 — Docs do Sistema + Tenant Onboarding.

### Docs — Scope & Data Model

- [ ] **DOCS-01**: Coluna `scope` na tabela `documents` com valores `'tenant'` (default) e `'product'`
- [ ] **DOCS-02**: Product docs (`scope = 'product'`) visíveis para todos os tenants, sem filtro `org_id`
- [ ] **DOCS-03**: Enterprise docs (`scope = 'tenant'`) mantêm comportamento atual (filtrado por `org_id`)

### Docs — Management

- [ ] **DOCS-04**: Super admin pode criar product docs via `/admin/product-docs`
- [ ] **DOCS-05**: Super admin pode editar e deletar product docs
- [ ] **DOCS-06**: Tenant admin cria/edita enterprise docs via interface normal de docs

### Docs — Sidebar & Navigation

- [ ] **DOCS-07**: Sidebar mostra "Docs da Empresa" (tenant-scoped) e "Docs do Produto" (global) como seções separadas
- [ ] **DOCS-08**: Product docs são read-only para operadores (não-super-admin)

### Docs — Migration

- [ ] **DOCS-09**: Docs de processo FXL (`processo/`, `ferramentas/`, `padroes/`) migrados como enterprise docs do tenant FXL
- [ ] **DOCS-10**: Docs de SDK/onboarding migrados como product docs (global)

### Onboarding — Org Creation

- [ ] **ONB-01**: Novo usuário sem org vê tela "Criar Empresa"
- [ ] **ONB-02**: Criar empresa cria Clerk Organization e atribui usuário como admin
- [ ] **ONB-03**: Tenant sem módulos habilitados vê tela "Sem módulos" com mensagem clara

### Onboarding — FXL Migration

- [ ] **ONB-04**: FXL migrada de `org_fxl_default` para org Clerk real
- [ ] **ONB-05**: Todos os dados existentes (documents, tasks, etc.) recebem novo `org_id`
- [ ] **ONB-06**: Flag `VITE_AUTH_MODE` removida do codebase
- [ ] **ONB-07**: Fallback COALESCE anon removido de todas as RLS policies

## Future Requirements

### Docs — Advanced

- **DOCS-F01**: Versionamento de product docs com histórico
- **DOCS-F02**: Preview de product docs antes de publicar
- **DOCS-F03**: Busca full-text em product docs

### Onboarding — Advanced

- **ONB-F01**: Self-service module marketplace (tenant escolhe módulos)
- **ONB-F02**: Custom domains por tenant
- **ONB-F03**: Billing/payments integration

## Out of Scope

| Feature | Reason |
|---------|--------|
| Drag-and-drop docs editor | Future — markdown sufficient for v4.2 |
| Custom branding per tenant | Future — Nexo has one visual identity |
| Self-service module selection | Super admin controls modules manually |
| Billing / payments | No revenue model yet |
| Mobile app | Web-first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOCS-01 | Phase 81 | Pending |
| DOCS-02 | Phase 81 | Pending |
| DOCS-03 | Phase 81 | Pending |
| DOCS-04 | Phase 82 | Pending |
| DOCS-05 | Phase 82 | Pending |
| DOCS-06 | Phase 82 | Pending |
| DOCS-07 | Phase 82 | Pending |
| DOCS-08 | Phase 82 | Pending |
| DOCS-09 | Phase 82 | Pending |
| DOCS-10 | Phase 82 | Pending |
| ONB-01 | Phase 83 | Pending |
| ONB-02 | Phase 83 | Pending |
| ONB-03 | Phase 83 | Pending |
| ONB-04 | Phase 84 | Pending |
| ONB-05 | Phase 84 | Pending |
| ONB-06 | Phase 84 | Pending |
| ONB-07 | Phase 84 | Pending |

**Coverage:**
- v4.2 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 -- all covered

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after roadmap creation (phases 81-84 assigned)*
