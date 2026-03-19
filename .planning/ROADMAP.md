# Roadmap: Nexo

## Milestones

- **v1.0 MVP** - Phases 1-6 (shipped 2026-03-09) -- see milestones/v1.0-ROADMAP.md
- **v1.1 Wireframe Evolution** - Phases 7-11 (shipped 2026-03-10) -- see milestones/v1.1-ROADMAP.md
- **v1.2 Visual Redesign** - Phases 12-16 (shipped 2026-03-11) -- see milestones/v1.2-ROADMAP.md
- **v1.3 Builder & Components** - Phases 17-21 (shipped 2026-03-11) -- see milestones/v1.3-ROADMAP.md
- **v1.4 Wireframe Visual Redesign** - Phases 22-28 (shipped 2026-03-13) -- see milestones/v1.4-ROADMAP.md
- **v1.5 Modular Foundation & Knowledge Base** - Phases 29-33 (shipped 2026-03-13) -- see milestones/v1.5-ROADMAP.md
- **v1.6 12 Novos Graficos** - Phases 34-37 (shipped 2026-03-13) -- see milestones/v1.6-ROADMAP.md
- **v2.0 Framework Shell + Arquitetura Modular** - Phases 38-42 (shipped 2026-03-13) -- see milestones/v2.0-ROADMAP.md
- **v2.1 Dynamic Data Layer** - Phases 43-46 (shipped 2026-03-13) -- see milestones/v2.1-ROADMAP.md
- **v2.2 Wireframe Builder -- Configurable Layout Components** - Phases 47-53 (shipped 2026-03-13) -- see milestones/v2.2-ROADMAP.md
- **v2.3 Inline Editing UX** - Phases 54-57 (shipped 2026-03-13) -- see milestones/v2.3-ROADMAP.md
- **v2.4 Component Picker Preview Mode** - Phases 58-59 (shipped 2026-03-14) -- see milestones/v2.4-ROADMAP.md
- **v3.0 Reorganizacao Modular** - Phases 60-63 (shipped 2026-03-17) -- see milestones/v3.0-ROADMAP.md
- **v3.1 Multi-tenancy** - Phases 64-67 (shipped 2026-03-17) -- see milestones/v3.1-ROADMAP.md
- **v3.2 FXL SDK Skill** - Phases 68-69 (shipped 2026-03-17) -- see milestones/v3.2-ROADMAP.md
- **v3.3 Generic Connector Module** - Phases 70-72 (shipped 2026-03-17) -- see milestones/v3.3-ROADMAP.md
- **v4.0 Rebrand Nexo** - Phases 73-74 (shipped 2026-03-17) -- see milestones/v4.0-ROADMAP.md
- **v4.1 Super Admin** - Phases 75-80 (shipped 2026-03-17) -- see milestones/v4.1-ROADMAP.md
- **v4.2 Docs do Sistema + Tenant Onboarding** - Phases 81-84 (shipped 2026-03-17) -- see milestones/v4.2-ROADMAP.md
- **v4.3 Admin Polish & Custom Auth** - Phases 85-88 (shipped 2026-03-17) -- see milestones/v4.3-ROADMAP.md
- **v5.0 SDK Docs** - Phases 89-93 (shipped 2026-03-17) -- see milestones/v5.0-ROADMAP.md
- **v5.1 MCP Server** - Phases 94-98 (shipped 2026-03-18) -- see milestones/v5.1-ROADMAP.md
- **v5.2 Nexo Skill** - Phases 99-104 (shipped 2026-03-18) -- see milestones/v5.2-ROADMAP.md
- **v5.3 UX Polish** - Phases 105-111 (shipped 2026-03-18) -- see milestones/v5.3-ROADMAP.md
- **v6.0 Reestruturação de Módulos** - Phases 112-116 (shipped 2026-03-18) -- see milestones/v6.0-ROADMAP.md
- **v7.0 Admin-Only Org Management** - Phases 117-120 (shipped 2026-03-18) -- see milestones/v7.0-ROADMAP.md
- **v8.0 Estabilidade Multi-Tenant** - Phases 121-124 (shipped 2026-03-19) -- see milestones/v8.0-ROADMAP.md
- **v9.0 Resiliencia de Plataforma** - Phases 125-128 (active) -- see milestones/v9.0-ROADMAP.md

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v9.0 Resiliencia de Plataforma (Phases 125-128) — ACTIVE

- [ ] **Phase 125: Error Boundaries + Sentry** - Isolar crashes de modulo e capturar erros de runtime em producao via Sentry
- [ ] **Phase 126: Token Management Context** - Migrar token de org para React Context com abort de requests in-flight no org switch
- [ ] **Phase 127: CI/CD Pipeline** - GitHub Actions com type-check e testes automaticos bloqueando merges com CI quebrado
- [ ] **Phase 128: Retry & Resilience** - Retry com backoff exponencial no token exchange e wrapper reutilizavel para chamadas criticas

See: milestones/v9.0-ROADMAP.md

### Phase 125: Error Boundaries + Sentry
**Goal**: A plataforma captura e isola falhas de runtime — crashes em modulos nao derrubam o app e todos os erros chegam ao Sentry com contexto acionavel
**Depends on**: Nothing (independent)
**Requirements**: ISO-01, OBS-01, OBS-02
**Success Criteria** (what must be TRUE):
  1. Um crash em qualquer modulo (docs, tasks, wireframe, connector) exibe fallback UI do modulo sem derrubar o header, sidebar ou outros modulos
  2. Erros de runtime capturados pelo error boundary aparecem no Sentry dashboard com stack trace, nome do modulo e org_id do usuario
  3. Erros de rede (fetch failures) capturados proativamente pelo Sentry no frontend com contexto de URL e status code
  4. O restante da plataforma permanece navegavel e funcional enquanto o modulo com erro exibe seu fallback

### Phase 126: Token Management Context
**Goal**: O token de org e gerenciado por React Context — nao ha variavel global mutavel, e requests in-flight de org anterior sao cancelados atomicamente no momento do switch
**Depends on**: Nothing (independent)
**Requirements**: ISO-02, ISO-03
**Success Criteria** (what must be TRUE):
  1. Ao trocar de org, nenhum request iniciado com o token da org anterior completa e popula a UI — todos sao cancelados via AbortController
  2. O token de org nao existe como variavel global mutavel — e acessado exclusivamente via React Context
  3. Componentes consumindo o token via Context recebem o valor atualizado automaticamente apos org switch sem necessidade de refresh manual

### Phase 127: CI/CD Pipeline
**Goal**: Todo PR tem type-check e testes rodando automaticamente e nao pode ser merged se CI falhar — zero regressoes silenciosas chegam a main
**Depends on**: Nothing (independent)
**Requirements**: CI-01, CI-02, CI-03
**Success Criteria** (what must be TRUE):
  1. Ao abrir ou atualizar qualquer PR, GitHub Actions dispara automaticamente um job com `tsc --noEmit` e reporta sucesso/falha no PR
  2. O mesmo job roda `vitest run` e exibe contagem de testes passados/falhados diretamente no PR
  3. O merge de um PR com CI falhando e bloqueado por branch protection rule — nao ha como fazer bypass sem desativar a protecao explicitamente

### Phase 128: Retry & Resilience
**Goal**: Falhas transitorias de rede nao causam falha permanente no token exchange nem em chamadas criticas — retry automatico com backoff exponencial absorve instabilidades
**Depends on**: Nothing (independent)
**Requirements**: RES-01, RES-02
**Success Criteria** (what must be TRUE):
  1. Uma falha de rede no token exchange dispara retry automatico ate 3 vezes com intervalo exponencial antes de propagar erro para o usuario
  2. admin-service e tenant-service usam o mesmo retry wrapper sem duplicar logica de backoff
  3. O retry wrapper e reutilizavel por qualquer chamada critica futura com configuracao de tentativas e delays via parametros

---

<details>
<summary>✅ v8.0 Estabilidade Multi-Tenant (Phases 121-124) — SHIPPED 2026-03-19</summary>

- [x] Phase 121: Auth & Token Exchange (4/4 plans) — completed 2026-03-19
- [x] Phase 122: Document Scoping & RLS (2/2 plans) — completed 2026-03-19
- [x] Phase 123: Modules & Org Lifecycle (2/2 plans) — completed 2026-03-19
- [x] Phase 124: Regression Guard (1/1 plan) — completed 2026-03-19

See: milestones/v8.0-ROADMAP.md

</details>

---

<details>
<summary>✅ v7.0 Admin-Only Org Management (Phases 117-120) — SHIPPED 2026-03-18</summary>

- [x] Phase 117: Access Control Lockdown (2/2 plans) — completed 2026-03-18
- [x] Phase 118: Admin User Management (2/2 plans) — completed 2026-03-18
- [x] Phase 119: Tenant Archival (3/3 plans) — completed 2026-03-18
- [x] Phase 120: Admin Dashboard Improvements (1/1 plan) — completed 2026-03-18

See: milestones/v7.0-ROADMAP.md

</details>

---

<details>
<summary>✅ v6.0 Reestruturação de Módulos (Phases 112-116) — SHIPPED 2026-03-18</summary>

- [x] Phase 112: DB Migration (1/1 plan) — completed 2026-03-18
- [x] Phase 113: Code Restructure — completed 2026-03-18
- [x] Phase 114: Projetos Module — completed 2026-03-18
- [x] Phase 115: Clientes Module — completed 2026-03-18
- [x] Phase 116: Sidebar Workspace — completed 2026-03-18

See: milestones/v6.0-ROADMAP.md

</details>

---

<details>
<summary>✅ v5.3 UX Polish (Phases 105-111) — SHIPPED 2026-03-18</summary>

- [x] Phase 105: Data Isolation (4/4 plans) — completed 2026-03-18
- [x] Phase 106: Data Recovery (1/1 plan) — completed 2026-03-18
- [x] Phase 107: Header UX (1/1 plan) — completed 2026-03-18
- [x] Phase 108: Admin Enhancements (4/4 plans) — completed 2026-03-18
- [x] Phase 109: Blueprint RLS (1/1 plan) — completed 2026-03-18
- [x] Phase 110: Phase 108 Verification (1/1 plan) — completed 2026-03-18
- [x] Phase 111: Audit Closure (1/1 plan) — completed 2026-03-18

See: milestones/v5.3-ROADMAP.md

</details>
