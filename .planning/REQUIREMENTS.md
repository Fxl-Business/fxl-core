# Requirements: Nexo

**Defined:** 2026-03-17
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v4.2 Requirements

Requirements for milestone v4.2 — Docs do Sistema + Tenant Onboarding.

### Docs — Scope & Data Model

- [x] **DOCS-01**: Coluna `scope` na tabela `documents` com valores `'tenant'` (default) e `'product'`
- [x] **DOCS-02**: Product docs (`scope = 'product'`) visíveis para todos os tenants, sem filtro `org_id`
- [x] **DOCS-03**: Enterprise docs (`scope = 'tenant'`) mantêm comportamento atual (filtrado por `org_id`)

### Docs — Management

- [x] **DOCS-04**: Super admin pode criar product docs via `/admin/product-docs`
- [x] **DOCS-05**: Super admin pode editar e deletar product docs
- [x] **DOCS-06**: Tenant admin cria/edita enterprise docs via interface normal de docs

### Docs — Sidebar & Navigation

- [x] **DOCS-07**: Sidebar mostra "Docs da Empresa" (tenant-scoped) e "Docs do Produto" (global) como seções separadas
- [x] **DOCS-08**: Product docs são read-only para operadores (não-super-admin)

### Docs — Migration

- [x] **DOCS-09**: Docs de processo FXL (`processo/`, `ferramentas/`, `padroes/`) migrados como enterprise docs do tenant FXL
- [x] **DOCS-10**: Docs de SDK/onboarding migrados como product docs (global)

### Onboarding — Org Creation

- [x] **ONB-01**: Novo usuário sem org vê tela "Criar Empresa"
- [x] **ONB-02**: Criar empresa cria Clerk Organization e atribui usuário como admin
- [x] **ONB-03**: Tenant sem módulos habilitados vê tela "Sem módulos" com mensagem clara

### Onboarding — FXL Migration

- [x] **ONB-04**: FXL migrada de `org_fxl_default` para org Clerk real
- [x] **ONB-05**: Todos os dados existentes (documents, tasks, etc.) recebem novo `org_id`
- [x] **ONB-06**: Flag `VITE_AUTH_MODE` removida do codebase
- [x] **ONB-07**: Fallback COALESCE anon removido de todas as RLS policies

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
| DOCS-01 | Phase 81 | Complete |
| DOCS-02 | Phase 81 | Complete |
| DOCS-03 | Phase 81 | Complete |
| DOCS-04 | Phase 82 | Complete |
| DOCS-05 | Phase 82 | Complete |
| DOCS-06 | Phase 82 | Complete |
| DOCS-07 | Phase 82 | Complete |
| DOCS-08 | Phase 82 | Complete |
| DOCS-09 | Phase 82 | Complete |
| DOCS-10 | Phase 82 | Complete |
| ONB-01 | Phase 83 | Complete |
| ONB-02 | Phase 83 | Complete |
| ONB-03 | Phase 83 | Complete |
| ONB-04 | Phase 84 | Complete |
| ONB-05 | Phase 84 | Complete |
| ONB-06 | Phase 84 | Complete |
| ONB-07 | Phase 84 | Complete |

**Coverage:**
- v4.2 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 -- all covered

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 — all 17 requirements complete; ONB-04/05 verified in production database*
