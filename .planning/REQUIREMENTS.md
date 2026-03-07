# Requirements: FXL Core — Fase 3 Automatizada

**Defined:** 2026-03-07
**Core Value:** Transformar wireframes aprovados em sistemas funcionais automaticamente

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Technical Configuration

- [ ] **TCONF-01**: TechnicalConfig schema TypeScript que define fonte de dados, formulas KPI e regras de negocio por secao
- [ ] **TCONF-02**: Config Resolver que merge Blueprint + TechnicalConfig + Branding em GenerationManifest
- [ ] **TCONF-03**: Claude sugere TechnicalConfig draft a partir do briefing/blueprint para operador revisar
- [ ] **TCONF-04**: Validacao automatica de que TechnicalConfig cobre todas as secoes do blueprint

### Data Pipeline

- [ ] **DATA-01**: Tela de upload com parsing server-side de CSV/XLSX
- [ ] **DATA-02**: Normalizacao de formatos brasileiros (numeros, datas, status)
- [ ] **DATA-03**: Dados normalizados salvos em Supabase com schema gerado
- [ ] **DATA-04**: Feedback ao usuario sobre erros e inconsistencias no upload

### Code Generation

- [ ] **CGEN-01**: Scaffold de projeto Next.js 16 com Supabase, Tailwind, estrutura de pastas
- [ ] **CGEN-02**: Geracao de paginas com KPIs, graficos, tabelas a partir do blueprint
- [ ] **CGEN-03**: Compare mode temporal funcional nas telas geradas
- [ ] **CGEN-04**: React Query hooks conectando cada secao aos dados reais no Supabase

### Auth & Security

- [ ] **AUTH-01**: Login com email/senha via Supabase Auth
- [ ] **AUTH-02**: Roles e permissoes (admin, viewer)

### Design System

- [ ] **DSGN-01**: Cores, tipografia e logo do cliente aplicados automaticamente via branding
- [ ] **DSGN-02**: Layout com sidebar escura (#212121) seguindo padrao do wireframe
- [ ] **DSGN-03**: Dashboard responsivo para diferentes tamanhos de tela

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Security

- **SEC-01**: Row Level Security em todas as tabelas Supabase
- **SEC-02**: Multi-tenant — multiplas empresas no mesmo Supabase

### Advanced Features

- **ADV-01**: Conectores universais de dados (APIs, bancos externos)
- **ADV-02**: Real-time streaming de dados

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile apps | Foco web-first, mobile e futuro |
| Geracao sem revisao humana | Sempre semi-automatico com revisao do operador |
| SaaS completo como output | Comecar com Dashboard BI, expandir depois |
| Drag-and-drop de dashboards | O Blueprint-driven process e o produto — personalizar widgets contradiz o modelo |
| Backend proprio no FXL Core | FXL Core e documentacao/tooling, sistemas vivem em repos separados |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TCONF-01 | — | Pending |
| TCONF-02 | — | Pending |
| TCONF-03 | — | Pending |
| TCONF-04 | — | Pending |
| DATA-01 | — | Pending |
| DATA-02 | — | Pending |
| DATA-03 | — | Pending |
| DATA-04 | — | Pending |
| CGEN-01 | — | Pending |
| CGEN-02 | — | Pending |
| CGEN-03 | — | Pending |
| CGEN-04 | — | Pending |
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| DSGN-01 | — | Pending |
| DSGN-02 | — | Pending |
| DSGN-03 | — | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 0
- Unmapped: 17

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after initial definition*
