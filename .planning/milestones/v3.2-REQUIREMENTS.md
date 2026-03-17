# Requirements: v3.2 FXL SDK Skill

**Defined:** 2026-03-17
**Milestone:** v3.2
**Core Value:** Skill do Claude Code que padroniza projetos spoke FXL com rules, templates, contract types e checklists
**Design Spec:** `docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md` (Sections 6, 7)

## v3.2 Requirements

Requirements para milestone v3.2 FXL SDK Skill. Derivados das Sections 6 e 7 do design spec.

### Skill Structure

- [x] **SDK-01**: Criar `SKILL.md` como entry point da skill com indice de rules, cenarios de uso, e navegacao rapida
  - **Aceite:** SKILL.md existe em `.agents/skills/fxl-sdk/`, segue formato de ~130 linhas, lista todas as rules com descricao de quando usar cada uma.
  - **Depende de:** Nada

- [x] **SDK-02**: Criar `rules/standards.md` com padroes de codigo, seguranca, e estrutura para projetos spoke
  - **Aceite:** Arquivo contem stack aprovada (React 18, TypeScript strict, Tailwind, shadcn/ui, Supabase), convencoes de codigo, regras de seguranca, estrutura de pastas padrao.
  - **Depende de:** Nada

- [x] **SDK-03**: Criar `rules/new-project.md` com instrucoes completas para scaffold de projeto novo
  - **Aceite:** Arquivo contem passo-a-passo para criar projeto spoke do zero: init, configs, estrutura, CLAUDE.md, contrato, CI/CD.
  - **Depende de:** SDK-02

- [x] **SDK-04**: Criar `rules/new-project-from-blueprint.md` para scaffold a partir de export do Wireframe Builder
  - **Aceite:** Arquivo contem instrucoes para ler `blueprint-export.json`, gerar paginas, componentes, entidades, e endpoints do contrato.
  - **Depende de:** SDK-03

- [x] **SDK-05**: Criar `rules/audit.md` com instrucoes para auditoria de projetos existentes
  - **Aceite:** Arquivo contem checklist de auditoria, formato do `FXL-AUDIT.md` gerado, scoring system, categorias (critico, importante, normal).
  - **Depende de:** SDK-02

- [x] **SDK-06**: Criar `rules/connect.md` com instrucoes para adicionar contrato FXL a projeto existente
  - **Aceite:** Arquivo contem passo-a-passo para adicionar endpoints obrigatorios, tipos do contrato, e configuracao de auth Clerk.
  - **Depende de:** SDK-02

- [x] **SDK-07**: Criar `rules/refactor.md` com padroes de refatoracao
  - **Aceite:** Arquivo contem padroes para migrar projetos Lovable/existentes para padroes FXL.
  - **Depende de:** SDK-02, SDK-05

- [x] **SDK-08**: Criar `rules/ci-cd.md` com instrucoes de setup GitHub Actions
  - **Aceite:** Arquivo contem setup completo de CI: workflow file, fxl-doctor.sh, branch protection.
  - **Depende de:** SDK-02

- [x] **SDK-09**: Criar `rules/deploy.md` com padroes de deploy Vercel
  - **Aceite:** Arquivo contem configuracao Vercel, env vars, headers de seguranca, preview deploys.
  - **Depende de:** SDK-02

### Contract Types

- [x] **SDK-10**: Criar `contract/types.ts` com tipos TypeScript completos do contrato Hub <-> Spoke
  - **Aceite:** Arquivo contem todas as interfaces (FxlAppManifest, EntityDefinition, FieldDefinition, WidgetDefinition, response types). v1 field types: string, number, date, boolean apenas.
  - **Depende de:** Nada

### Templates

- [x] **SDK-11**: Criar `templates/CLAUDE.md.template` com CLAUDE.md padrao para projetos spoke
  - **Aceite:** Template contem stack, convencoes, regras de escopo, checklist obrigatorio, adaptado para spoke.
  - **Depende de:** SDK-02

- [x] **SDK-12**: Criar templates de configuracao: `tsconfig.json.template`, `eslint.config.js.template`, `prettier.config.js.template`, `tailwind.preset.js.template`
  - **Aceite:** Templates sao production-quality, com strict mode, rules consistentes com padroes FXL.
  - **Depende de:** SDK-02

- [x] **SDK-13**: Criar templates de infra: `vercel.json.template`, `ci.yml.template`, `fxl-doctor.sh.template`
  - **Aceite:** vercel.json com security headers, ci.yml com GitHub Actions workflow, fxl-doctor.sh com todos os checks.
  - **Depende de:** SDK-08, SDK-09

### Checklists

- [x] **SDK-14**: Criar checklists de qualidade: `security-checklist.md`, `structure-checklist.md`, `typescript-checklist.md`
  - **Aceite:** Cada checklist contem items acionaveis com descricao, exemplo de conformidade, e severidade.
  - **Depende de:** SDK-02

- [x] **SDK-15**: Criar checklists de contrato: `rls-checklist.md`, `contract-checklist.md`
  - **Aceite:** RLS checklist cobre todas as tabelas com verificacao de policies. Contract checklist verifica todos os endpoints obrigatorios.
  - **Depende de:** SDK-10

## Out of Scope

| Feature | Reason |
|---------|--------|
| npm package / CLI (`npx fxl`) | Skill substitui CLI — configs gerados como arquivos |
| Connector module no Hub | v3.3 (milestone separado) |
| Beach House migration | v3.4 (milestone separado) |
| Contract v2 (enum, relation types) | Futuro, apos validacao com v1 |
| POST/PUT/DELETE endpoints | v1 e read-only |
| Blueprint export do Wireframe Builder | v3.4+ (Wireframe Builder precisa de feature de export) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SDK-01 | Phase 68 | Complete |
| SDK-02 | Phase 68 | Complete |
| SDK-03 | Phase 68 | Complete |
| SDK-04 | Phase 68 | Complete |
| SDK-05 | Phase 68 | Complete |
| SDK-06 | Phase 68 | Complete |
| SDK-07 | Phase 68 | Complete |
| SDK-08 | Phase 68 | Complete |
| SDK-09 | Phase 68 | Complete |
| SDK-10 | Phase 68 | Complete |
| SDK-11 | Phase 69 | Complete |
| SDK-12 | Phase 69 | Complete |
| SDK-13 | Phase 69 | Complete |
| SDK-14 | Phase 69 | Complete |
| SDK-15 | Phase 69 | Complete |

**Coverage:**
- v3.2 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-03-17*
