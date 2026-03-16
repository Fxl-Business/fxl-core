# Requirements: FXL Core

**Defined:** 2026-03-16
**Core Value:** FXL Core e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v3.0 Requirements

Requirements para milestone v3.0 Reorganizacao Modular. Cada um mapeia a fases do roadmap.

### Estrutura

- [x] **ESTR-01**: Criar `src/platform/` com subpastas layout/, auth/, tenants/, module-loader/, router/
- [ ] **ESTR-02**: Mover componentes de layout (Layout, Sidebar, TopNav) para `platform/layout/`
- [ ] **ESTR-03**: Mover auth (ProtectedRoute, Login, Profile) para `platform/auth/`
- [ ] **ESTR-04**: Mover module system (registry, module-ids, extension-registry, slots, hooks) para `platform/module-loader/`
- [x] **ESTR-05**: Extrair routing logic do App.tsx para `platform/router/AppRouter.tsx`
- [x] **ESTR-06**: Criar `src/shared/` com ui/ (shadcn), hooks/, types/, utils/

### Modulos

- [ ] **MOD-01**: Modulo docs autocontido com components/, pages/, services/, hooks/, types/, CLAUDE.md
- [ ] **MOD-02**: Modulo tasks autocontido (completar migracoes pendentes de pages/services)
- [ ] **MOD-03**: Modulo clients autocontido com pages/ e services/ migrados
- [ ] **MOD-04**: Modulo wireframe autocontido (manifest, pages, hybrid com @tools/)
- [ ] **MOD-05**: Cada modulo tem CLAUDE.md com instrucoes para agente scoped

### Remocoes

- [ ] **REM-01**: Remover modulo Knowledge Base (diretorio, servico, IDs, rotas)
- [ ] **REM-02**: Remover ProcessDocsViewer.tsx (codigo morto, 135 linhas)
- [ ] **REM-03**: Remover duplicados (PageHeader.tsx copia, PromptBlock.tsx copia)

### Integridade

- [ ] **INT-01**: `tsc --noEmit` zero erros apos reorganizacao
- [ ] **INT-02**: `npm run build` completa sem erros
- [ ] **INT-03**: Todas as paginas funcionam identico ao antes (checklist visual completo)

## Future Requirements (v3.1+)

### Multi-tenancy (v3.1)

- **TENANT-01**: Clerk Organizations integration com org picker
- **TENANT-02**: Supabase Edge Function JWT bridge (Clerk→Supabase)
- **TENANT-03**: tenant_modules table com RLS por org_id
- **TENANT-04**: Migracao de dados existentes (adicionar org_id a todas as tabelas)

### SDK Skill (v3.2)

- **SDK-01**: Repositorio fxl-sdk com SKILL.md e rules/
- **SDK-02**: Templates de configs (tsconfig, eslint, prettier, tailwind, vercel, CI)
- **SDK-03**: Contract types (FxlAppManifest, EntityDefinition, etc.)
- **SDK-04**: Checklists de auditoria (seguranca, estrutura, typescript, RLS)

### Connector (v3.3)

- **CONN-01**: Modulo connector generico que consome API de qualquer spoke
- **CONN-02**: UI generica para entidades (tabela, detail view)
- **CONN-03**: Widget injection no HOME_DASHBOARD

### Beach House (v3.4-v3.5)

- **BEACH-01**: Migrar codigo Lovable para infra propria
- **BEACH-02**: Implementar contrato FXL na spoke
- **BEACH-03**: Migrar Supabase
- **BEACH-04**: Integrar com FXL Core via connector

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mudancas funcionais no v3.0 | Refactor puro — nenhum comportamento novo |
| Code splitting / lazy loading | Pode entrar como bonus se trivial, mas nao e requirement |
| Testes automatizados | Divida tecnica reconhecida, sera milestone separado |
| CRM module | Milestone futuro apos v3.5 |
| IA runtime / vector DB | Milestone futuro apos v3.5 |
| Drag-and-drop no Wireframe Builder | Nao relacionado a reorganizacao |
| React 19 / Tailwind v4 | Estabilidade da stack |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ESTR-01 | Phase 60 | Complete |
| ESTR-02 | Phase 61 | Pending |
| ESTR-03 | Phase 61 | Pending |
| ESTR-04 | Phase 61 | Pending |
| ESTR-05 | Phase 61 | Complete |
| ESTR-06 | Phase 60 | Complete |
| MOD-01 | Phase 61 | Pending |
| MOD-02 | Phase 61 | Pending |
| MOD-03 | Phase 61 | Pending |
| MOD-04 | Phase 61 | Pending |
| MOD-05 | Phase 61 | Pending |
| REM-01 | Phase 62 | Pending |
| REM-02 | Phase 62 | Pending |
| REM-03 | Phase 62 | Pending |
| INT-01 | Phase 63 | Pending |
| INT-02 | Phase 63 | Pending |
| INT-03 | Phase 63 | Pending |

**Coverage:**
- v3.0 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 after roadmap creation*
