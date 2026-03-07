# Requirements: FXL Core — Milestone v1

**Defined:** 2026-03-07
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Documentation

- [ ] **DOCS-01**: Sidebar reorganizada com navegacao que reflete a estrutura do processo (fases, build, referencias, operacao)
- [ ] **DOCS-02**: Conteudo dos docs revisado e atualizado para refletir processo atual
- [ ] **DOCS-03**: Pagina de onboarding que guia novos operadores pelo processo

### Wireframe Comments

- [ ] **WCMT-01**: Comentarios persistentes por tela/bloco salvos em Supabase
- [ ] **WCMT-02**: Usuario externo (cliente) acessa wireframe e deixa comentarios sem precisar de conta dev
- [ ] **WCMT-03**: Operador visualiza todos os comentarios e marca como resolvidos

### Wireframe Visual Editor

- [ ] **WEDT-01**: Operador edita layout de secoes dentro de uma tela (mover, adicionar, remover)
- [ ] **WEDT-02**: Operador edita props de componentes via UI (titulo, tipo de grafico, colunas de tabela)
- [ ] **WEDT-03**: Operador adiciona e remove telas do wireframe via UI
- [ ] **WEDT-04**: Todas as edicoes visuais sincronizam automaticamente com blueprint.config.ts

### Branding

- [ ] **BRND-01**: Formato padrao parseavel para branding do cliente (cores, tipografia, logo)
- [ ] **BRND-02**: Processo documentado de coleta de branding com template estruturado
- [ ] **BRND-03**: Branding aplicado automaticamente no wireframe (cores, fontes)

### Technical Configuration (Fase 3 prep)

- [ ] **TCONF-01**: TechnicalConfig schema TypeScript que define fonte de dados, formulas KPI e regras de negocio por secao
- [ ] **TCONF-02**: Config Resolver que merge Blueprint + TechnicalConfig + Branding em GenerationManifest
- [ ] **TCONF-03**: Claude sugere TechnicalConfig draft a partir do briefing/blueprint para operador revisar
- [ ] **TCONF-04**: Validacao automatica de que TechnicalConfig cobre todas as secoes do blueprint

### System Generation (Fase 3)

- [ ] **SGEN-01**: Scaffold de projeto Next.js 16 com Supabase, Tailwind, estrutura de pastas
- [ ] **SGEN-02**: Geracao de paginas com KPIs, graficos, tabelas a partir do blueprint com dados reais
- [ ] **SGEN-03**: Upload CSV/XLSX com normalizacao de formatos BR e storage em Supabase
- [ ] **SGEN-04**: Auth basico (email/senha) com roles (admin, viewer)
- [ ] **SGEN-05**: Branding do cliente aplicado automaticamente no sistema gerado

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Security

- **SEC-01**: Row Level Security em todas as tabelas Supabase
- **SEC-02**: Multi-tenant — multiplas empresas no mesmo Supabase

### Advanced Generation

- **AGEN-01**: Compare mode temporal funcional nas telas geradas
- **AGEN-02**: React Query hooks com loading/error states
- **AGEN-03**: Deploy automatico na Vercel do sistema gerado

### Advanced Features

- **ADV-01**: Conectores universais de dados (APIs, bancos externos)
- **ADV-02**: Real-time streaming de dados

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile apps | Foco web-first, mobile e futuro |
| Geracao sem revisao humana | Sempre semi-automatico com revisao do operador |
| SaaS completo como output | Comecar com Dashboard BI, expandir depois |
| Drag-and-drop generico | O Blueprint-driven process e o produto |
| Backend pesado no FXL Core | Supabase apenas para features interativas (comentarios) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOCS-01 | — | Pending |
| DOCS-02 | — | Pending |
| DOCS-03 | — | Pending |
| WCMT-01 | — | Pending |
| WCMT-02 | — | Pending |
| WCMT-03 | — | Pending |
| WEDT-01 | — | Pending |
| WEDT-02 | — | Pending |
| WEDT-03 | — | Pending |
| WEDT-04 | — | Pending |
| BRND-01 | — | Pending |
| BRND-02 | — | Pending |
| BRND-03 | — | Pending |
| TCONF-01 | — | Pending |
| TCONF-02 | — | Pending |
| TCONF-03 | — | Pending |
| TCONF-04 | — | Pending |
| SGEN-01 | — | Pending |
| SGEN-02 | — | Pending |
| SGEN-03 | — | Pending |
| SGEN-04 | — | Pending |
| SGEN-05 | — | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 0
- Unmapped: 22

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after scope revision*
