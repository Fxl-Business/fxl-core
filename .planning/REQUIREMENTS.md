# Requirements: Nexo

**Defined:** 2026-03-19
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v1 Requirements

Requirements for v10.0 Nexo Stack. Each maps to roadmap phases.

### Estrutura

- [ ] **ESTR-01**: Secao "Nexo Stack" existe no Product Docs com sidebar navigation propria
- [ ] **ESTR-02**: Pagina index (stack/) com visao geral da arquitetura do Nexo
- [ ] **ESTR-03**: Arquivos .md sincronizados em docs/stack/ no repositorio

### Conceitos

- [ ] **CONC-01**: Pagina explicando os 7 modulos do Nexo (docs, tasks, projects, clients, wireframe, connector, admin)
- [ ] **CONC-02**: Pagina explicando o modelo multi-tenant (orgs, tenants, scoping, impersonation)
- [ ] **CONC-03**: Pagina explicando os fluxos do operador (briefing → blueprint → wireframe → geracao)

### Arquitetura

- [ ] **ARQ-01**: Pagina documentando Supabase (tabelas, RLS policies, edge functions, migrations)
- [ ] **ARQ-02**: Pagina documentando Clerk (JWT bridge, org switch, token exchange, super admin)
- [ ] **ARQ-03**: Pagina documentando CI/CD (GitHub Actions, fxl-doctor, Vercel deploy, branch protection)
- [ ] **ARQ-04**: Pagina documentando resiliencia (error boundaries, Sentry, retry, AbortController)
- [ ] **ARQ-05**: Pagina documentando padroes de codigo (module boundaries, path aliases, providers, design tokens)

## v2 Requirements

(none — scope is complete for this milestone)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Conteudo dinamico (status CI, lista de migrations live) | Complexidade desnecessaria, docs estaticos no Supabase sao suficientes |
| Documentacao do SDK (spokes) | Ja existe em docs/sdk/, escopo separado |
| Diagramas interativos de arquitetura | Futuro, markdown com tabelas e listas e suficiente |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ESTR-01 | — | Pending |
| ESTR-02 | — | Pending |
| ESTR-03 | — | Pending |
| CONC-01 | — | Pending |
| CONC-02 | — | Pending |
| CONC-03 | — | Pending |
| ARQ-01 | — | Pending |
| ARQ-02 | — | Pending |
| ARQ-03 | — | Pending |
| ARQ-04 | — | Pending |
| ARQ-05 | — | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 0
- Unmapped: 11

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after initial definition*
