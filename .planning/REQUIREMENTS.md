# Requirements: FXL Core — Milestone v1

**Defined:** 2026-03-07
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Documentation

- [x] **DOCS-01**: Sidebar reorganizada com navegacao que reflete a estrutura do processo (fases, build, referencias, operacao)
- [x] **DOCS-02**: Conteudo dos docs revisado e atualizado para refletir processo atual
- [x] **DOCS-03**: Pagina de onboarding que guia novos operadores pelo processo

### Wireframe Comments

- [x] **WCMT-01**: Comentarios persistentes por tela/bloco salvos em Supabase
- [x] **WCMT-02**: Usuario externo (cliente) acessa wireframe e deixa comentarios sem precisar de conta dev
- [x] **WCMT-03**: Operador visualiza todos os comentarios e marca como resolvidos

### Domain Reorganization (Phase 02.1)

- [ ] **REORG-01**: Sidebar com 4 secoes top-level (Processo, Padroes, Ferramentas, Clientes)
- [ ] **REORG-02**: Tech Radar + techs + Premissas + Seguranca + Testes agrupados sob Padroes
- [ ] **REORG-03**: Landing pages para Fases e Padroes com navegacao por cards
- [x] **REORG-04**: Docs de processo reescritos para Claude Code + GSD (sem Claude Project)
- [x] **REORG-05**: CLAUDE.md e README refletem taxonomia Padroes
- [x] **REORG-06**: Roadmap inclui fases 02.2, 02.3, 02.4

### Blocos Disponiveis Evolution (Phase 02.2)

- [ ] **BLKSPEC-01**: Blocos Disponiveis como spec detalhada que serve de prompt para criar componentes
- [ ] **BLKSPEC-02**: Galeria de componentes sincronizada com specs de blocos

### Global Skills (Phase 02.3)

- [ ] **GSKILL-01**: Premissas/Seguranca/Testes como Skills globais do Claude Code
- [ ] **GSKILL-02**: Skills acessiveis via .claude/skills/ ou .agents/skills/

### Visual Overhaul (Phase 02.4)

- [ ] **VISUAL-01**: Design system atualizado com paleta, tipografia e componentes revisados
- [ ] **VISUAL-02**: Todas as paginas da aplicacao com visual production-grade

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
| DOCS-01 | Phase 1 | Complete |
| DOCS-02 | Phase 1 | Complete |
| DOCS-03 | Phase 1 | Complete |
| WCMT-01 | Phase 2 | Complete |
| WCMT-02 | Phase 2 | Complete |
| WCMT-03 | Phase 2 | Complete |
| REORG-01 | Phase 02.1 | Pending |
| REORG-02 | Phase 02.1 | Pending |
| REORG-03 | Phase 02.1 | Pending |
| REORG-04 | Phase 02.1 | Complete |
| REORG-05 | Phase 02.1 | Complete |
| REORG-06 | Phase 02.1 | Complete |
| BLKSPEC-01 | Phase 02.2 | Pending |
| BLKSPEC-02 | Phase 02.2 | Pending |
| GSKILL-01 | Phase 02.3 | Pending |
| GSKILL-02 | Phase 02.3 | Pending |
| VISUAL-01 | Phase 02.4 | Pending |
| VISUAL-02 | Phase 02.4 | Pending |
| WEDT-01 | Phase 3 | Pending |
| WEDT-02 | Phase 3 | Pending |
| WEDT-03 | Phase 3 | Pending |
| WEDT-04 | Phase 3 | Pending |
| BRND-01 | Phase 4 | Pending |
| BRND-02 | Phase 4 | Pending |
| BRND-03 | Phase 4 | Pending |
| TCONF-01 | Phase 5 | Pending |
| TCONF-02 | Phase 5 | Pending |
| TCONF-03 | Phase 5 | Pending |
| TCONF-04 | Phase 5 | Pending |
| SGEN-01 | Phase 6 | Pending |
| SGEN-02 | Phase 6 | Pending |
| SGEN-03 | Phase 6 | Pending |
| SGEN-04 | Phase 6 | Pending |
| SGEN-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 — traceability updated after roadmap revision*
