# Requirements: Nexo — v5.3 UX Polish

**Defined:** 2026-03-18
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v5.3 Requirements

Requirements para UX Polish + Multi-tenancy data isolation.

### Isolamento de Dados

- [ ] **DATA-01**: Tarefas sao scoped por org_id — cada org ve apenas suas tarefas
- [ ] **DATA-02**: Clientes sao scoped por org_id — financeiro-conta-azul visivel apenas para a org que criou
- [ ] **DATA-03**: Wireframes/blueprints sao scoped por org_id — dados do cliente isolados por org
- [ ] **DATA-04**: Docs da org (processo, padroes) scoped por org_id na sidebar
- [ ] **DATA-05**: Dados existentes (tarefas, wireframes) recuperados ou re-associados a org correta

### Admin

- [ ] **ADMN-01**: Admin pode gerenciar membros de qualquer organizacao (add/remove usuarios)
- [ ] **ADMN-02**: Admin pode entrar na visao de qualquer organizacao (impersonate org)

### Header UX

- [ ] **HEAD-01**: Usuario pode ver icone/avatar no header com menu dropdown para logout
- [ ] **HEAD-02**: Header distingue visualmente admin vs operator
- [ ] **HEAD-03**: Header exibe "Nexo" como brand (nao "Fxl Core Fxl")

### Arquitetura Modular

- [ ] **ARCH-01**: Separacao clara entre funcionalidade do modulo (ferramenta) e dados do cliente (org-scoped)
- [ ] **ARCH-02**: Wireframe Builder como ferramenta global, wireframes de clientes como dados da org

## Future Requirements

None deferred.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time collaborative editing | Complexity — defer to v6+ |
| Self-service tenant signup | Admin-controlled for now |
| Per-org module customization (beyond enable/disable) | Current toggle system sufficient |
| Billing/subscription per org | Not needed yet |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | — | Pending |
| DATA-02 | — | Pending |
| DATA-03 | — | Pending |
| DATA-04 | — | Pending |
| DATA-05 | — | Pending |
| ADMN-01 | — | Pending |
| ADMN-02 | — | Pending |
| HEAD-01 | — | Pending |
| HEAD-02 | — | Pending |
| HEAD-03 | — | Pending |
| ARCH-01 | — | Pending |
| ARCH-02 | — | Pending |

**Coverage:**
- v5.3 requirements: 12 total
- Mapped to phases: 0
- Unmapped: 12 ⚠️

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 after initial definition*
