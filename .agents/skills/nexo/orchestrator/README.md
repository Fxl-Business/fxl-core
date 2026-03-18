# Agent Orchestrator — Guia Operacional

Orquestracao automatica de agentes paralelos. Detecta boundaries do projeto,
avalia potencial de paralelizacao e spawna agentes com escopo definido.
Funciona com GSD workflows e uso ad-hoc do Claude Code.

---

## Pre-requisitos

- tmux instalado (`brew install tmux`)
- Claude Code instalado e autenticado
- Projeto com 2+ boundaries detectaveis (modulos, packages, workspaces, ou diretorios com 5+ arquivos)
- Configurar `teammateMode` no Claude Code:

```json
// .claude/settings.json (projeto) ou ~/.claude/settings.json (global)
{
  "teammateMode": "tmux"
}
```

Sem `teammateMode: "tmux"`, a skill roda em modo sequencial (mesma logica, sem paralelismo).

---

## Fluxo GSD

### 1. Planejar uma fase

```
/gsd:plan-phase N
```

O planner automaticamente:
1. Gera tasks como sempre
2. **Detecta boundaries** do projeto (5 sinais em ordem de prioridade)
3. **Mapeia tasks para boundaries** e calcula ratio de paralelizacao
4. Se ratio >= 50% (2+ boundaries): estrutura plano em waves + contratos
5. Se ratio 30-50%: pergunta confirmacao ao usuario
6. Se ratio < 30% ou 1 boundary: plano normal (execucao solo)

Voce vera no PLAN.md:
```yaml
execution_mode: multi-agent
agents:
  - name: platform
    boundary: src/platform/
    tasks: [1, 2]
  - name: wireframe
    boundary: src/modules/wireframe/
    associated: [tools/wireframe-builder/]
    tasks: [3, 4]
  - name: clients
    boundary: src/modules/clients/
    tasks: [5, 6]
contracts:
  - from: platform
    to: [wireframe, clients]
    files: [src/platform/types/tenant.ts]
```

### 2. Executar a fase (multi-agent automatico)

```
/gsd:execute-phase N
```

O executor detecta `execution_mode: multi-agent` no plano e:

1. **Checkpoint 1** — Mostra waves + contratos, pede confirmacao
2. **Wave 1** — Spawna platform agent (cross-cutting tasks)
3. **Checkpoint 2** — Le types REAIS criados pelo platform agent, atualiza contratos
4. **Wave 2** — Spawna boundary agents em paralelo via tmux
   - Cada agente recebe contratos refreshed com TypeScript real
   - Comunicacao hub-and-spoke (decisoes via lead, sinais diretos)
5. **Checkpoint 3** — Lead roda verificacao integrada (tsc, build, imports, scope)

### 3. Verificar a fase

```
/gsd:verify-work
```

Alem das verificacoes padrao, se a fase usou multi-agent:
- Roda auditoria de imports cross-boundary
- Verifica scope compliance via commit tracers
- Appenda resultados em VERIFICATION.md

---

## Fluxo Ad-hoc

A skill ativa **fora do GSD** quando detecta trabalho paralelo no prompt do usuario.

### Como funciona

1. No inicio da conversa, Claude roda deteccao de boundaries
2. Quando recebe uma task, analisa se envolve 2+ boundaries
3. Se ratio >= 50%: apresenta plano de orquestracao e executa
4. Se ratio 30-50%: pergunta ao usuario antes de orquestrar
5. Se ratio < 30%: execucao normal com agente unico

### Exemplo

```
usuario: "Adiciona campo tenantId no WireframeContext e cria filtro
          por tenant na listagem de clientes"
```

Claude detecta:
- Task A → `src/modules/wireframe/` (boundary: wireframe)
- Task B → `src/modules/clients/` (boundary: clients)
- Ratio: 100% (2/2 tasks em boundaries distintos)
- Decisao: multi-agent automatico

Claude apresenta o plano e spawna agentes.

### Limitacoes do modo ad-hoc

- Sem recuperacao em caso de interrupcao (terminal fechado, queda de rede)
- Agentes podem ter commitado trabalho parcial — inspecione `git log`
- Sem STATE.md ou tracking persistente (a conversa e o estado)

---

## O que voce ve no tmux

**Wave 1** — platform agent roda sozinho (cross-cutting tasks):

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│    Lead Agent        │  Agent: platform     │
│    (orquestrador)    │  (src/platform/      │
│                      │   src/shared/)       │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

**Wave 2** — boundary agents entram em paralelo, platform agent em standby:

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│    Lead Agent        │  Agent: wireframe    │
│    (orquestrador)    │  (src/modules/       │
│                      │   wireframe/ +       │
│                      │   tools/wireframe-   │
│                      │   builder/)          │
├──────────────────────┼──────────────────────┤
│                      │                      │
│  Agent: platform     │  Agent: clients      │
│  (standby p/ scope   │  (src/modules/       │
│   escalation)        │   clients/)          │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

Cada agente trabalha no seu escopo. Mensagens entre agentes aparecem nos respectivos panes.

---

## Quando roda multi-agent vs solo

| Situacao | Modo | Razao |
|----------|------|-------|
| Task afeta 2+ boundaries, ratio >= 50% | Multi-agent automatico | Alta confianca |
| Task afeta 2+ boundaries, ratio 30-50% | Multi-agent com confirmacao | Confianca media |
| Task afeta 2+ boundaries, ratio < 30% | Solo | Pouco ganho |
| Task afeta 1 boundary | Solo | Nada a paralelizar |
| Tasks encadeadas (output → input) | Solo (override) | Anti-sinal |
| Schema migrations | Solo (override) | Deve ser sequencial |
| 3+ tasks no mesmo arquivo | Solo (override) | Hot shared file |
| Refactoring global (renames cross-boundary) | Solo (override) | Anti-sinal |
| Quick task (`/gsd:quick`) | Solo (sempre) | Escopo atomico |
| tmux nao disponivel | Solo (fallback) | Sem paralelismo |

A decisao e automatica. Anti-sinais fazem override mesmo com ratio alto.

---

## Regras de ownership

| Agente | Pode escrever | Paths associados (read-write) | Pode ler |
|--------|--------------|-------------------------------|----------|
| platform | `src/platform/**`, `src/shared/**` | — | Tudo |
| wireframe | `src/modules/wireframe/**` | `tools/wireframe-builder/**` | Tudo |
| clients | `src/modules/clients/**` | — | Tudo |
| docs | `src/modules/docs/**` | — | Tudo |
| tasks | `src/modules/tasks/**` | — | Tudo |

**Paths associados** sao diretorios fora da boundary principal que pertencem
logicamente ao mesmo dominio. Exemplo: `tools/wireframe-builder/` e associado
a boundary wireframe porque 80%+ dos consumidores dos seus componentes estao
em `src/modules/wireframe/`.

Se um agente precisa escrever fora do seu scope (ownership + associated), pede ao lead.

---

## Comunicacao entre agentes

Modelo hub-and-spoke: decisoes e mudancas passam pelo lead. Sinais simples podem ser diretos.

**Via lead (obrigatorio para decisoes):**
```
[wireframe → lead]: "Preciso de novo tipo em shared/types/.
  Posso criar ou prefere que platform agent faca?"
[lead → platform]: "Cria TenantFeatures em shared/types/tenant.ts"
[lead → wireframe]: "Platform agent vai criar. Aguarde signal."
```

**Direto entre agentes (apenas sinais informativos):**
```
[wireframe → clients]: "WireframeContext com tenantId exportado. Pode usar."
[platform → all]: "Wave 1 completa. TenantConfig e useTenant() disponiveis."
```

**Regras:**
- Se a mensagem pede ACAO ou MUDANCA → via lead
- Se e apenas INFORMACAO ou sinal de "pronto" → direto
- Agentes NUNCA negociam contratos entre si sem mediacao do lead

---

## Verificacao (3 niveis)

1. **Cada agente** valida seu boundary antes de reportar done:
   - Scope check via commit tracers (`git log --grep="[agent:{name}]"`)
   - Validacoes do CLAUDE.md do boundary (se existir)

2. **Lead** roda verificacao integrada:
   - `bunx tsc --noEmit` (type check global)
   - `bun run build` (build verification)
   - Auditoria de imports cross-boundary (so flagga internals)
   - Scope compliance via commit tracers

3. **GSD verify** (`/gsd:verify-work`) adicionalmente:
   - Checa que nenhum boundary importa internals de outro
   - Verifica que exports declarados nos contratos existem
   - Appenda em VERIFICATION.md sob "## Cross-Boundary Verification"

---

## Commit Tracers

Cada agente inclui `[agent:{name}]` em todas as mensagens de commit:

```bash
# Agente wireframe commita:
git commit -m "feat(wireframe): add component X [agent:wireframe]"

# Lead verifica scope por agente:
git log --format="%H" --grep="\[agent:wireframe\]" ${START}..HEAD | \
  xargs -I{} git diff-tree --no-commit-id --name-only -r {} | \
  grep -v "src/modules/wireframe/" | grep -v "tools/wireframe-builder/"
# Se retornar algo → violacao de scope
```

Tracers substituem o `git diff` global que produzia falsos positivos em execucao paralela.

---

## Portabilidade

### Instalar em projeto COM GSD

1. Copie a pasta `.agents/skills/nexo/orchestrator/` para o projeto
2. Adicione 3 referencias nos workflows GSD:

**Em `plan-phase.md`** (apos `</downstream_consumer>`):
```markdown
<parallel_execution>
Read .agents/skills/nexo/orchestrator/rules/boundary-detection.md
and .agents/skills/nexo/orchestrator/rules/task-analysis.md
After generating tasks, run boundary detection and task analysis.
If execution_mode resolves to multi-agent, add to PLAN.md frontmatter:
  execution_mode, agents[], contracts[]
</parallel_execution>
```

**Em `execute-phase.md`** (antes de spawnar agentes):
```markdown
<parallel_execution_check>
Read first incomplete plan's frontmatter. If execution_mode: multi-agent:
  Read .agents/skills/nexo/orchestrator/rules/orchestration.md
  Follow wave-based orchestration instead of standard sequential spawn.
</parallel_execution_check>
```

**Em `verify-phase.md`** (apos verificacoes padrao):
```markdown
<cross_boundary_check>
If phase plan has execution_mode: multi-agent:
  Read .agents/skills/nexo/orchestrator/rules/integration-check.md
  Run cross-boundary verification.
</cross_boundary_check>
```

3. Ambos os modos disponiveis (GSD + ad-hoc)

### Instalar em projeto SEM GSD

1. Copie a pasta `.agents/skills/nexo/orchestrator/` para o projeto
2. A skill funciona via SKILL.md — Claude Code le e aplica automaticamente
3. Apenas modo ad-hoc disponivel (deteccao por analise de prompt)
4. Nenhuma modificacao em workflows necessaria

---

## Troubleshooting

**"Os agentes nao estao se comunicando"**
- Verifique que `teammateMode: "tmux"` esta em `.claude/settings.json`
- Agentes precisam ser spawnados com nomes (ex: `wireframe`, `clients`)
- Sem tmux, `SendMessage` nao funciona — orquestracao e sequencial

**"Um agente escreveu fora do scope"**
- O lead detecta via commit tracers na verificacao
- Se recorrente, reforce as instrucoes no CLAUDE.md do boundary
- Commit tracers permitem identificar exatamente quais commits violaram

**"Fase tem pouca paralelizacao"**
- Se > 70% das tasks sao cross-cutting, o planner sugere execucao solo
- Fases de refactoring pesado tendem a ser mais sequenciais — normal
- Anti-sinais (tasks encadeadas, hot files) forcam modo solo

**"Quero forcar execucao solo"**
- Edite o PLAN.md mudando `execution_mode: single-agent`
- Ou nao use tmux — o fallback automatico roda solo

**"Boundary detection encontrou boundaries errados"**
- Verifique os 5 sinais de deteccao (CLAUDE.md > workspaces > package.json > convencao > heuristica)
- Diretorios com < 3 arquivos sao filtrados automaticamente
- Para forcar boundaries, crie CLAUDE.md nos diretorios desejados

---

## Resumo do fluxo

```
tmux new-session -s projeto
  └─ claude
       │
       ├─ [GSD] /gsd:plan-phase N
       │    ├─ detecta boundaries (5 sinais)
       │    ├─ mapeia tasks → boundaries
       │    ├─ calcula ratio → decide modo
       │    └─ gera waves + contratos (se multi-agent)
       │
       ├─ [GSD] /gsd:execute-phase N
       │    ├─ Checkpoint 1: mostra plano
       │    ├─ Wave 1: platform agent (cross-cutting)
       │    ├─ Checkpoint 2: refresh contratos com types reais
       │    ├─ Wave 2: boundary agents em paralelo
       │    └─ Checkpoint 3: verificacao integrada
       │
       ├─ [GSD] /gsd:verify-work
       │    └─ cross-boundary checks adicionais
       │
       ├─ [Ad-hoc] prompt com trabalho multi-boundary
       │    ├─ detecta boundaries
       │    ├─ decompoe prompt em sub-tasks
       │    ├─ calcula ratio → decide modo
       │    └─ orquestra waves (se threshold atingido)
       │
       └─ /gsd:quick "..."
            └─ sempre solo (escopo atomico)
```
