# Requirements: Nexo

**Defined:** 2026-03-17
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v4.3 Requirements

Requirements for v4.3 Admin Polish & Custom Auth. Each maps to roadmap phases.

### Auth Flow

- [ ] **AUTH-01**: Usuario deslogado acessando rota protegida ve a tela de login (nao loading infinito)
- [ ] **AUTH-02**: Tela de login mostra branding "Nexo" com botao Google OAuth e form email/senha
- [ ] **AUTH-03**: Login via Google OAuth funciona end-to-end (click → Google → redirect → autenticado)
- [ ] **AUTH-04**: Login via email/senha funciona end-to-end
- [ ] **AUTH-05**: Tela de login segue design system Nexo (Inter, indigo/slate, dark mode)
- [ ] **AUTH-06**: Link "Nao tem conta?" navega para signup

### Admin Data

- [ ] **ADM-01**: TenantsPage mostra member count correto por organizacao (match com Clerk)
- [ ] **ADM-02**: AdminDashboard metrica "Tenants" mostra total de TODAS as orgs do Clerk
- [ ] **ADM-03**: AdminDashboard metrica "Usuarios" mostra total de TODOS os usuarios do Clerk
- [ ] **ADM-04**: TenantDetailPage mostra member count correto

### Admin Users

- [ ] **USR-01**: Pagina /admin/users lista todos os usuarios do Clerk com nome, email, orgs, datas
- [ ] **USR-02**: Cada usuario mostra quais organizacoes pertence
- [ ] **USR-03**: TenantDetailPage mostra secao "Membros" com lista de membros e role badges
- [ ] **USR-04**: Dados de usuarios e membros vem via edge functions (nao hooks Clerk client-side)

### General

- [ ] **GEN-01**: `npx tsc --noEmit` zero errors
- [ ] **GEN-02**: Todas as paginas admin acessiveis apenas para super_admin

## Future Requirements

None for this milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| User CRUD (criar/deletar usuarios) | Future — admin apenas visualiza por agora |
| Add/remove membros de tenant | Future — gerenciado via Clerk Dashboard |
| User detail page | Future — list view suficiente para v4.3 |
| Signup page redesign | Low priority — wrapper atual e aceitavel |
| Password reset flow custom | Handled by Clerk, sem custom UI necessaria |
| MFA setup custom | Handled by Clerk account portal |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| AUTH-05 | — | Pending |
| AUTH-06 | — | Pending |
| ADM-01 | — | Pending |
| ADM-02 | — | Pending |
| ADM-03 | — | Pending |
| ADM-04 | — | Pending |
| USR-01 | — | Pending |
| USR-02 | — | Pending |
| USR-03 | — | Pending |
| USR-04 | — | Pending |
| GEN-01 | — | Pending |
| GEN-02 | — | Pending |

**Coverage:**
- v4.3 requirements: 16 total
- Mapped to phases: 0
- Unmapped: 16

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after initial definition*
