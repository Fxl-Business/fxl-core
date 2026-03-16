# GSD Multi-Agent: Module-Aware Parallel Execution

**Date:** 2026-03-16
**Status:** Draft
**Author:** Cauet + Claude

---

## 1. Problem Statement

O GSD hoje executa fases sequencialmente com um unico agente. Quando uma fase afeta multiplos modulos (ex: wireframe + clients + platform), um agente carrega todo o contexto e faz tudo sozinho. Isso e lento e desperdica a arquitetura modular.

O FXL Core ja tem (ou esta ganhando via v3.0) uma estrutura de modular monolith com boundaries claras. A skill `build-with-agent-team` ja prova que multiplos agentes via tmux funcionam. O que falta e integrar essas duas capacidades nativamente no GSD.

## 2. Goals

1. O GSD detecta automaticamente quais modulos uma fase afeta
2. Planos sao estruturados em waves (cross-cutting → modulos em paralelo → verificacao)
3. Execucao em waves: platform agent primeiro (cross-cutting), depois module agents em paralelo
4. Comunicacao hub-and-spoke: agentes falam com o lead, que redistribui. Sinais simples (dependency ready, status) podem ser diretos
5. Fallback gracioso: sem tmux, roda solo como hoje
6. `/gsd:new-milestone` usa brainstorming skill obrigatoriamente
7. Zero mudanca na interface dos comandos existentes — a inteligencia e interna

## 3. Non-Goals

- Reescrever o GSD do zero
- Suportar agentes em maquinas diferentes (tudo local via tmux)
- Resolver conflitos de merge automaticamente (agentes tem ownership exclusivo)
- Mudar o formato do ROADMAP.md ou STATE.md

## 4. Architecture

### 4.1 Module Registry

Cada modulo declara suas boundaries em `src/modules/[name]/CLAUDE.md`:

```markdown
# Module: [name]

## Ownership
- src/modules/[name]/**

## Public API
- types: [exported types]
- hooks: [exported hooks]
- components: [exported components]

## Dependencies
- shared: [what it uses from shared/]
- platform: [what it uses from platform/]
- modules/[other]: [what it uses, read-only]

## Validation
- [module-specific validation commands]
```

O planner le esses arquivos para entender o grafo de dependencias.

**Prerequisito:** CLAUDE.md deve existir para cada modulo antes da primeira execucao multi-agent. O GSD pode auto-gerar CLAUDE.md inicial via analise de exports/imports do modulo (scaffold), que o usuario refina depois.

**Modulos sao dinamicos** — a deteccao usa a estrutura de diretorios em `src/modules/`, nao uma lista hardcoded. Qualquer diretorio com `CLAUDE.md` em `src/modules/` e tratado como modulo.

### 4.2 Module Detection (Automatico)

Durante `/gsd:plan-phase`, o planner executa uma etapa adicional apos gerar tasks:

```
Para cada task:
  1. Identificar arquivos afetados (pela descricao + analise de impacto)
  2. Mapear arquivo → modulo owner:
     - src/modules/[name]/** → modulo [name] (dinamico, qualquer dir com CLAUDE.md)
     - src/platform/** → platform (cross-cutting)
     - src/shared/** → platform (cross-cutting)
     - docs/**, clients/**, tools/**, supabase/**, root configs → lead agent
  3. Classificar task como module-specific, cross-cutting, ou unmapped

Decisao de modo:
- Apenas 1 modulo afetado → Execution Mode: single-agent (como hoje)
- 2+ modulos afetados → Execution Mode: multi-agent
- Apenas cross-cutting (platform/shared) → single-agent (platform agent)
- Apenas unmapped (docs/, clients/, tools/) → single-agent (lead executa)
- Mix de modulos + unmapped → multi-agent, tasks unmapped vao pro lead
```

### 4.3 Plan Structure (Module-Aware)

Quando multi-agent e detectado, o PLAN.md ganha secoes adicionais:

```markdown
## Execution Mode: multi-agent (N agents)

### Wave 1: Platform (cross-cutting)
Agent: platform
Ownership: src/platform/**, src/shared/**
Tasks:
- [task-id]: [description]
Produces:
- [type/hook/component being created or modified]

### Wave 2: Parallel Modules

Dependencias intra-wave: Se o planner detecta que modulo A produz algo que modulo B
consome (ex: wireframe exporta WireframeContext que clients importa), ele organiza
sub-waves dentro da Wave 2:
- Sub-wave 2a: modulos produtores (wireframe)
- Sub-wave 2b: modulos consumidores (clients) — spawnados apos 2a sinalizar done
Se nao ha dependencias entre modulos, todos rodam em paralelo (uma unica sub-wave).

#### Agent: wireframe
Ownership: src/modules/wireframe/**
Read access: entire codebase
Write restriction: src/modules/wireframe/** only (request via lead for shared/)
Tasks:
- [task-id]: [description]

#### Agent: clients
Ownership: src/modules/clients/**
Read access: entire codebase
Write restriction: src/modules/clients/** only
Tasks:
- [task-id]: [description]

### Wave 3: Integration Verification
Lead validates cross-module integration

### Contracts

#### platform → wireframe
- Exports: TenantConfig { id: string, slug: string, modules: string[] }
- New hook: useTenant() → TenantConfig
- Location: src/shared/types/tenant.ts

#### platform → clients
- Exports: same TenantConfig
- New route pattern: /app/:tenantSlug/clients/*

#### wireframe → clients (if applicable)
- [specific interface changes]
```

**Contratos sao derivados do plano** (delta da fase), nao do codigo existente. O planner analisa o que vai mudar/criar e gera contratos com shapes exatas (JSON/TypeScript types), nao descricoes em prosa.

### 4.4 Execution Flow

```
/gsd:execute-phase [N]
  │
  ├─ Detecta "Execution Mode: multi-agent" no PLAN.md
  │
  ├─ CHECKPOINT 1: Mostra wave breakdown + contratos
  │   └─ Espera confirmacao do usuario
  │
  ├─ Wave 1: Spawna platform agent
  │   ├─ Recebe: tasks cross-cutting + contratos que produz
  │   ├─ Executa tasks
  │   ├─ Reporta done com lista de exports criados
  │   └─ Platform agent PERMANECE ativo durante Wave 2
  │       (disponivel para scope escalation requests dos module agents)
  │
  ├─ CHECKPOINT 2: Lead valida contratos + refresh
  │   ├─ Compara exports declarados vs implementados
  │   └─ EXTRAI types reais do codigo gerado pelo platform agent
  │       e ATUALIZA os contratos que module agents vao receber.
  │       Assim Wave 2 trabalha com types concretos, nao previsoes do planner.
  │
  ├─ Wave 2: Spawna module agents (sub-waves se houver dependencias)
  │   ├─ Cada agente recebe:
  │   │   ├─ CLAUDE.md do seu modulo
  │   │   ├─ Tasks do plano
  │   │   ├─ Contratos ATUALIZADOS (com types reais do Checkpoint 2)
  │   │   └─ Validation checklist
  │   ├─ Agentes trabalham em paralelo (dentro de cada sub-wave)
  │   ├─ Comunicacao hub-and-spoke: decisoes/mudancas → lead
  │   │   Sinais simples (dependency ready, status) → direto entre agentes
  │   └─ Cada agente roda validacao antes de reportar done
  │
  ├─ CHECKPOINT 3: Lead roda verificacao integrada
  │   ├─ tsc --noEmit (full project)
  │   ├─ npm run build
  │   ├─ Verifica imports cross-module (so public API)
  │   └─ Testa fluxos end-to-end afetados
  │
  └─ GSD state update (como hoje)
```

### 4.4.1 Error Recovery

Se um agente falha durante execucao (crash, rate limit, erro irrecuperavel):

1. **Lead detecta** que o agente parou de responder ou reportou erro
2. **Outros agentes continuam** — nao ha abort global
3. **Lead avalia o git diff** do agente falhado:
   - Identifica o que foi completado com sucesso vs incompleto
   - Faz commit do trabalho bom (se houver)
   - Reverte mudancas incompletas
4. **Re-spawn com tasks restantes** — lead spawna novo agente apenas com as tasks que faltam (nao tenta restaurar estado mental do agente anterior)
5. **Se outros agentes dependem do falhado** → envia signal de pausa aos dependentes ate o re-spawn completar
6. **Se re-spawn falha 2x:** lead assume as tasks restantes ele mesmo (break glass)

### 4.4.2 Scope Violation Detection

Apos cada agente reportar done (antes do Checkpoint 3), o lead roda:
```
git diff --name-only [commit-antes-da-wave] | filtrar por ownership do agente
```
Se um agente modificou arquivos fora do seu scope:
- Lead reverte as mudancas fora do scope (`git checkout -- [arquivo]`)
- Notifica o agente e pede que refaca usando o caminho correto (request ao lead/platform)

### 4.5 Agent Communication

**Modelo: hub-and-spoke com sinais diretos.**

Toda comunicacao que implique decisao, mudanca de contrato, ou escopo passa pelo lead.
Sinais simples (dependency ready, status broadcast) podem ser diretos entre agentes.

**Comunicacao via lead (obrigatoria):**

1. **Contract deviation request** — Agente detecta que precisa mudar um contrato:
   ```
   agente-wireframe → lead:
     "Task-4 precisa que TenantConfig tenha campo 'features: string[]'.
      Nao estava no contrato. Posso adicionar em shared/types?"
   ```
   Lead avalia, aprova/rejeita, notifica agentes afetados.

2. **Scope escalation** — Agente precisa modificar arquivo fora do seu scope:
   ```
   agente-clients → lead:
     "Preciso adicionar um export em shared/hooks/index.ts."
   ```
   O lead delega ao platform agent (que permanece ativo durante Wave 2 exatamente para isso).
   Se a mudanca e trivial (adicionar export, ajustar tipo), o lead pode autorizar o module agent a fazer diretamente.

3. **Blocker report** — Agente esta bloqueado por algo fora do seu controle:
   ```
   agente-clients → lead:
     "Task-5 precisa do hook useWireframeContext que wireframe ainda nao exportou."
   ```
   Lead coordena: pede ao agente wireframe que priorize o export, ou ajusta a ordem de tasks.

**Sinais diretos entre agentes (permitidos):**

4. **Dependency ready** — Agente avisa que algo que outro esperava esta pronto:
   ```
   agente-wireframe → agente-clients:
     "WireframeContext com tenantId exportado. Pode usar."
   ```

5. **Status broadcast** — Agente sinaliza progresso:
   ```
   agente-platform → [all]:
     "Wave 1 completa. TenantConfig e useTenant() disponiveis em shared/."
   ```

**Regra geral:** se a mensagem pede uma ACAO ou MUDANCA, vai pro lead. Se e apenas INFORMACAO, pode ser direta.

### 4.6 Soft Isolation Model

| Permissao | Escopo |
|-----------|--------|
| **Leitura** | Todo o codebase (para entender contexto) |
| **Escrita** | Apenas dentro do modulo owned |
| **Escrita em shared/** | Apenas via request ao lead ou platform agent |
| **Escrita em platform/** | Apenas o platform agent |
| **Escrita em outro modulo** | Nunca — reporta ao lead |

O enforcement e por instrucao no prompt do agente, nao por restricao tecnica do filesystem. Cada agente recebe regras claras de ownership no spawn prompt.

### 4.7 Verification (3 Niveis)

**Nivel 1 — Agent-level (cada agente antes de reportar done):**
- `git diff --name-only` para verificar que nao modificou arquivos fora do scope
- Validacoes especificas do modulo (declaradas no CLAUDE.md do modulo)
- NAO roda `tsc --noEmit` individual (outros agentes podem estar escrevendo simultaneamente, resultados seriam inconsistentes)

**Nivel 2 — Lead-level (apos todos agentes reportarem done):**
- `tsc --noEmit` (full project)
- `npm run build`
- Verificar que imports cross-module usam apenas public API
- Verificar que contratos declarados foram implementados corretamente

**Nivel 3 — GSD verify (padrao, expandido):**
- `/gsd:verify-work` como hoje
- Check adicional: nenhum modulo importa internals de outro
- Check adicional: CLAUDE.md de cada modulo esta atualizado com novos exports

### 4.8 Fallback Gracioso

Se tmux nao esta disponivel ou o usuario prefere execucao solo:

1. O plano continua sendo module-aware (util para contexto e scoping)
2. Waves sao executadas sequencialmente por um unico agente
3. Contratos servem como checklist de integracao
4. Zero quebra de compatibilidade com o GSD atual

Deteccao automatica:
```
if (tmux disponivel AND teammateMode === "tmux"):
  multi-agent execution
else:
  single-agent sequential execution (waves em sequencia)
```

## 5. Brainstorming Obrigatorio em Milestones

### 5.1 Mudanca no `/gsd:new-milestone`

Antes de criar o roadmap, o workflow invoca a skill `superpowers:brainstorming`:

```
/gsd:new-milestone
  │
  ├─ Coleta contexto do projeto (PROJECT.md, STATE.md)
  │
  ├─ NOVO: Invoca superpowers:brainstorming
  │   ├─ Explora contexto do projeto
  │   ├─ Faz perguntas clarificadoras (uma por vez)
  │   ├─ Propoe 2-3 abordagens
  │   ├─ Apresenta design por secoes
  │   └─ Escreve spec em docs/superpowers/specs/
  │
  ├─ Usa spec aprovada como input para o roadmapper
  │
  └─ Gera ROADMAP.md com fases derivadas da spec
```

### 5.2 Beneficio

Garante que cada milestone passa por exploracao estruturada de requisitos, alternativas e trade-offs antes de virar fases no roadmap. Evita o anti-pattern de "ja sei o que fazer, vou direto pro codigo".

## 6. Changes to GSD Components

| Componente | Arquivo | Mudanca |
|---|---|---|
| `gsd-planner` agent | `.claude/agents/gsd-planner.md` | Adicionar etapa de module detection, wave breakdown, contract generation |
| `execute-phase` workflow | `.claude/get-shit-done/workflows/execute-phase.md` | Detectar multi-agent no plano, orquestrar waves, spawnar agentes |
| `gsd-executor` agent | `.claude/agents/gsd-executor.md` | Nova variante module-scoped com comunicacao e soft isolation |
| `gsd-verifier` agent | `.claude/agents/gsd-verifier.md` | Adicionar checks cross-module (imports, public API, CLAUDE.md sync) |
| `new-milestone` workflow | `.claude/get-shit-done/workflows/new-milestone.md` | Invocar brainstorming skill antes de roadmapper |
| Templates | `.claude/get-shit-done/templates/` | Novo template `module-claude.md` |
| `build-with-agent-team` skill | `.claude/skills/build-with-agent-team/` | Absorvida pelo GSD — mantida como referencia/fallback para projetos fora do GSD |

## 7. Module CLAUDE.md Template

```markdown
# Module: {{module-name}}

## Purpose
{{one-line description}}

## Ownership
- src/modules/{{module-name}}/**

## Public API

### Types
- {{TypeName}}: {{brief description}} (src/modules/{{module-name}}/types/{{file}})

### Hooks
- {{useHookName}}: {{brief description}} (src/modules/{{module-name}}/hooks/{{file}})

### Components
- {{ComponentName}}: {{brief description}} (src/modules/{{module-name}}/components/{{file}})

## Dependencies

### From shared/
- {{what it imports from shared}}

### From platform/
- {{what it imports from platform}}

### From other modules
- modules/{{other}}: {{what it reads, always read-only}}

## Validation
- `tsc --noEmit` (full project)
- {{module-specific checks}}

## Conventions
- {{module-specific coding conventions if any}}
```

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Agentes escrevem fora do scope | Conflitos de arquivo, bugs | Soft isolation com instrucoes claras + verificacao pos-execucao |
| Contratos imprecisos | Integracao falha | Contratos com types exatos (TypeScript interfaces), nao prosa |
| Comunicacao excessiva entre agentes | Overhead, confusao | Hub-and-spoke: decisoes passam pelo lead, apenas sinais simples sao diretos |
| Fase com muitas dependencias cross-module | Pouca paralelizacao real | Planner conta tasks paralelizaveis (module-scoped em 2+ modulos) vs total. Se < 30%, sugere solo. Ex: 5 cross-cutting + 2 module-scoped = 2/7 = 28% → solo. 3 cross-cutting + 8 module-scoped em 3 modulos = 8/11 = 72% → multi-agent |
| tmux nao disponivel | Feature inacessivel | Fallback automatico para execucao sequencial |

## 9. Success Criteria

1. Uma fase que afeta 3 modulos executa com 3 agentes em paralelo + 1 platform
2. Tempo de execucao e menor que execucao sequencial equivalente
3. Zero conflitos de arquivo entre agentes
4. Contratos gerados automaticamente sao precisos o suficiente para integracao sem retrabalho
5. `/gsd:new-milestone` sempre passa por brainstorming antes de gerar roadmap
6. Fallback solo funciona identicamente ao GSD atual

## 10. Appendix: Quick Reference — How to Use

See `README-multi-agent.md` in this same directory for step-by-step operational guide.
