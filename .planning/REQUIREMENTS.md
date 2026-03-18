# Requirements: Nexo — v5.3 UX Polish

**Defined:** 2026-03-18
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v5.3 Requirements

Requirements para UX Polish + Multi-tenancy data isolation.

### Isolamento de Dados

- [x] **DATA-01**: Tarefas sao scoped por org_id — cada org ve apenas suas tarefas
- [x] **DATA-02**: Clientes sao scoped por org_id — financeiro-conta-azul visivel apenas para a org que criou
- [x] **DATA-03**: Wireframes/blueprints sao scoped por org_id — dados do cliente isolados por org
- [ ] **DATA-04**: Docs da org (processo, padroes) scoped por org_id na sidebar
- [x] **DATA-05**: Dados existentes (tarefas, wireframes) recuperados ou re-associados a org correta

### Admin

- [x] **ADMN-01**: Admin pode gerenciar membros de qualquer organizacao (add/remove usuarios)
- [x] **ADMN-02**: Admin pode entrar na visao de qualquer organizacao (impersonate org)
<!-- gap closure: Phase 110 will produce VERIFICATION.md and mark these done -->

### Header UX

- [x] **HEAD-01**: Usuario pode ver icone/avatar no header com menu dropdown para logout
- [x] **HEAD-02**: Header distingue visualmente admin vs operator
- [x] **HEAD-03**: Header exibe "Nexo" como brand (nao "Fxl Core Fxl")

### Arquitetura Modular

- [ ] **ARCH-01**: Separacao clara entre funcionalidade do modulo (ferramenta) e dados do cliente (org-scoped)
- [ ] **ARCH-02**: Wireframe Builder como ferramenta global, wireframes de clientes como dados da org
<!-- gap closure: Phase 111 will explicitly verify and mark these done -->

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
| DATA-01 | Phase 105 | Done |
| DATA-02 | Phase 105 | Done |
| DATA-03 | Phase 109 (gap closure) | Done |
| DATA-04 | Phase 111 (gap closure) | Pending |
| DATA-05 | Phase 106 | Done |
| ADMN-01 | Phase 110 (gap closure) | Done |
| ADMN-02 | Phase 110 (gap closure) | Done |
| HEAD-01 | Phase 107 | Done |
| HEAD-02 | Phase 107 | Done |
| HEAD-03 | Phase 107 | Done |
| ARCH-01 | Phase 111 (gap closure) | Pending |
| ARCH-02 | Phase 111 (gap closure) | Pending |

**Coverage:**
- v5.3 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0
- Done: 9 (DATA-01, DATA-02, DATA-03, DATA-05, HEAD-01, HEAD-02, HEAD-03, ADMN-01, ADMN-02)
- Pending gap closure: 3 (DATA-04, ARCH-01, ARCH-02)

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 — traceability populated after roadmap creation*
