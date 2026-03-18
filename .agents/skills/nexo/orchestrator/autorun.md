# Nexo Autorun — Parallel Wave Execution

Analisa progresso do milestone, detecta fases paralelizaveis via grafo de dependencias,
e executa usando agentes paralelos em waves. Combina a inteligencia do `/gsd:progress`
com o paralelismo do Agent tool.

Diferente do `/gsd:autonomous` (que roda fases sequencialmente), o autorun agrupa fases
independentes em waves e lanca um agente por fase dentro de cada wave.

---

## Pre-requisitos

- Milestone ativo com ROADMAP.md, ou design specs em `docs/superpowers/specs/`
- GSD instalado globalmente (`~/.claude/get-shit-done/`)

---

## Processo

### 1. Inicializar

Parse `$ARGUMENTS` para flags opcionais:
- `--from N` — comecar a partir da fase N
- `--plan-only` — apenas planejar, nao executar
- `--execute-only` — apenas executar (assume planos existentes)

Bootstrap via milestone-level init:

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init milestone-op)
```

Parse JSON para: `milestone_version`, `milestone_name`, `phase_count`, `completed_phases`, `roadmap_exists`, `state_exists`.

**Se `roadmap_exists` e false:** Ir para descoberta de milestone (passo 1b).

### 1b. Descoberta de Milestone (apenas quando sem milestone ativo)

Buscar design specs pre-configuradas:

```bash
SPECS=$(find docs/superpowers/specs/ -name "*-design.md" -type f 2>/dev/null | sort)
```

**Se nenhum spec encontrado:** Erro — "No active milestone and no design specs found. Run `/gsd:new-milestone` first."

**Se specs encontrados:** Apresentar ao usuario para selecao. Para cada spec, ler e extrair:
- Primeiro heading `#` (titulo)
- Linha `**Escopo:**` ou `**Scope:**`
- Versoes de milestone mencionadas

Perguntar via AskUserQuestion qual spec ativar. Na selecao, rodar `/gsd:new-milestone` com contexto do spec. Depois, re-inicializar (passo 1).

Display banner de startup:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► AUTORUN (parallel)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Milestone: {milestone_version} — {milestone_name}
 Phases: {phase_count} total, {completed_phases} complete
 Mode: {plan-only | execute-only | full (plan + execute)}
```

### 2. Analisar Dependencias

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

Filtrar fases incompletas. Para cada fase, extrair campo `depends_on` do ROADMAP.md:
- "Phase 84" → depende da fase 84
- "Phase 84 (v4.2 complete)" → dependencia externa (verificar se milestone esta arquivado)
- "independent of phase 85" → explicitamente independente

Construir grafo de dependencias e classificar cada fase:
- **Ready:** Todas dependencias satisfeitas
- **Blocked:** Depende de fase incompleta dentro do milestone
- **Independent:** Sem dependencia em fase incompleta

### 3. Construir Waves

Agrupar fases em waves via topological sort:
- **Wave 1:** Fases com dependencias totalmente satisfeitas
- **Wave 2:** Fases que dependem apenas de Wave 1
- **Wave N:** Fases que dependem de Wave N-1

Cada wave tem sub-waves:
- **Sub-wave A (plan):** Agentes paralelos para discuss + plan
- **Sub-wave B (execute):** Agentes paralelos para executar

Se `--plan-only`: apenas sub-wave A. Se `--execute-only`: apenas sub-wave B.
Wave com 1 fase: plan + execute no mesmo agente.

Apresentar plano de waves ao usuario e pedir confirmacao via AskUserQuestion:
"Go" / "Adjust" / "Cancel"

### 4. Executar Waves

Para cada wave:

**4a. Sub-wave de Planejamento** (skip se --execute-only)

```bash
PHASE_STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op ${PHASE_NUM})
```

Verificar `has_plans` e `has_context`. Lancar agentes paralelos (Agent tool com `run_in_background: true`) para fases que precisam de planejamento: `/gsd:discuss-phase {N} --auto` + `/gsd:plan-phase {N}`.

**4b. Sub-wave de Execucao** (skip se --plan-only)

Lancar agentes paralelos para `/gsd:execute-phase {N}`.

**4c. Verificacao da Wave**

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
npx tsc --noEmit
```

Se TSC falhar, reportar e perguntar antes de prosseguir.

### 5. Conclusao

```bash
PROGRESS_BAR=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" progress bar --raw)
```

**Se fases pendentes:** Sugerir `/nexo:autorun --from {next_incomplete}`.
**Se todas completas:** Rodar audit + complete milestone automaticamente.

**5a. Audit:** Lancar agente para `/gsd:audit-milestone`.
- Gaps encontrados → perguntar: "Fix gaps" / "Accept as-is" / "Stop"

**5b. Complete:** Lancar agente para `/gsd:complete-milestone`.
- Arquivar milestone e atualizar estado.

### 6. Tratamento de Erros

- Verificar progresso parcial via git log e filesystem
- Relancar agentes com contexto do que ja foi feito
- Max 3 retries por fase
- Multiplas falhas na wave: "Retry all" / "Retry specific" / "Skip wave" / "Stop"

---

## Criterios de Sucesso

- Grafo de dependencias corretamente parseado do ROADMAP.md
- Fases independentes rodam em paralelo (Agent tool)
- Fases dependentes esperam suas dependencias completarem
- Plan + Execute separados em sub-waves para waves multi-fase
- Falhas detectadas e retried com awareness de progresso parcial
- TypeScript verificado entre waves
- Wave plan mostrado ao usuario antes da execucao
- Flags --plan-only, --execute-only, --from respeitados
- Apos todas fases, audit e complete rodam automaticamente
