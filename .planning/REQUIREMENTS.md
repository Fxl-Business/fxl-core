# Requirements: v4.0 Rebrand Nexo

**Defined:** 2026-03-17
**Milestone:** v4.0
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma
**Design Spec:** `docs/superpowers/specs/2026-03-17-nexo-platform-evolution-design.md`

## v4.0 Requirements

### UI Branding

- [ ] **BRAND-01**: Titulo da app mostra "Nexo" em vez de "Nucleo FXL"
- [ ] **BRAND-02**: Pagina de login mostra branding "Nexo"
- [ ] **BRAND-03**: Pagina de signup mostra branding "Nexo"
- [ ] **BRAND-04**: Tab title do browser mostra "Nexo"
- [ ] **BRAND-05**: Header/topbar mostra "Nexo" em vez de "Nucleo FXL"
- [ ] **BRAND-06**: Home page mostra identidade "Nexo"

### Meta & Config

- [ ] **META-01**: package.json name field atualizado para "nexo"
- [ ] **META-02**: index.html title e meta tags atualizados para "Nexo"

### Documentation

- [ ] **DOCS-01**: CLAUDE.md referencia o produto como "Nexo" (nao "FXL Core")
- [ ] **DOCS-02**: PROJECT.md atualizado com nome "Nexo"
- [ ] **DOCS-03**: Zero ocorrencias de "FXL Core" ou "Nucleo FXL" em src/ (exceto SDK)

### Verification

- [ ] **VERIF-01**: npx tsc --noEmit zero erros
- [ ] **VERIF-02**: npm run build sem erros

## Out of Scope

| Feature | Reason |
|---------|--------|
| Rename do repo no GitHub (fxl-core) | Repo name e infraestrutura, nao produto |
| Rename de MODULE_IDS/registry internals | Nomes internos nao sao visiveis ao usuario |
| Rename do FXL SDK skill | FXL e o nome da empresa, nao do produto |
| Rename de pastas no filesystem | Nao afeta UX, evita quebras de imports |
| Mudancas funcionais | v4.0 e puramente cosmetico |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRAND-01 | TBD | Pending |
| BRAND-02 | TBD | Pending |
| BRAND-03 | TBD | Pending |
| BRAND-04 | TBD | Pending |
| BRAND-05 | TBD | Pending |
| BRAND-06 | TBD | Pending |
| META-01 | TBD | Pending |
| META-02 | TBD | Pending |
| DOCS-01 | TBD | Pending |
| DOCS-02 | TBD | Pending |
| DOCS-03 | TBD | Pending |
| VERIF-01 | TBD | Pending |
| VERIF-02 | TBD | Pending |

**Coverage:**
- v4.0 requirements: 13 total
- Mapped to phases: 0
- Unmapped: 13

---
*Requirements defined: 2026-03-17*
