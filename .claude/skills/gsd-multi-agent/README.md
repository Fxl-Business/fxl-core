# GSD Multi-Agent — Guia Operacional

Como usar o GSD com multiplos agentes trabalhando em paralelo via tmux.

---

## Pre-requisitos

- tmux instalado (`brew install tmux`)
- Claude Code instalado e autenticado
- Projeto com estrutura modular (modules/, platform/, shared/)
- Cada modulo com seu `CLAUDE.md` declarando boundaries e public API

---

## Fluxo Completo

### 1. Iniciar sessao tmux

```bash
tmux new-session -s fxl
```

Isso cria a sessao tmux onde o lead agent e os module agents vao rodar.

### 2. Abrir Claude Code (lead agent)

```bash
claude
```

Este e o lead agent — ele orquestra tudo. Voce interage apenas com ele.

### 3. Criar um novo milestone (com brainstorming)

```
/gsd:new-milestone
```

O GSD automaticamente invoca a skill de brainstorming:
1. Faz perguntas clarificadoras sobre o que voce quer construir
2. Propoe 2-3 abordagens com trade-offs
3. Apresenta design por secoes para aprovacao
4. Escreve spec em `docs/superpowers/specs/`
5. Gera roadmap com fases derivadas da spec

### 4. Planejar uma fase

```
/gsd:plan-phase 65
```

O planner automaticamente:
1. Gera tasks como sempre
2. **Detecta quais modulos sao afetados** (analise de arquivos)
3. Se 2+ modulos: estrutura o plano em waves + gera contratos
4. Se 1 modulo: plano normal (execucao solo)

Voce vera no PLAN.md:
```markdown
## Execution Mode: multi-agent (3 agents)

### Wave 1: Platform (cross-cutting)
### Wave 2: Parallel Modules (wireframe, clients)
### Wave 3: Integration Verification
### Contracts: [...]
```

### 5. Executar a fase (multi-agent automatico)

```
/gsd:execute-phase 65
```

O executor detecta `multi-agent` no plano e:

1. **Checkpoint 1** — Mostra waves + contratos, pede confirmacao
2. **Wave 1** — Spawna platform agent (cross-cutting tasks)
3. **Checkpoint 2** — Valida contratos + refresh com types reais do codigo
4. **Wave 2** — Spawna module agents em paralelo via tmux
   - Cada agente aparece em seu proprio pane do tmux
   - Comunicacao hub-and-spoke (decisoes via lead, sinais diretos)
   - Voce pode acompanhar o progresso de cada um
5. **Checkpoint 3** — Lead roda verificacao integrada (tsc, build, imports)

### 6. Quick tasks (solo)

```
/gsd:quick "corrigir bug no componente KpiCard"
```

Quick tasks rodam com um unico agente como sempre. Multi-agent so se aplica a fases de milestone.

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

**Wave 2** — module agents entram em paralelo, platform agent permanece ativo (para scope escalation):

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│    Lead Agent        │  Agent: wireframe    │
│    (orquestrador)    │  (src/modules/       │
│                      │   wireframe/)        │
│                      │                      │
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

## Comunicacao entre agentes

Modelo hub-and-spoke: decisoes e mudancas passam pelo lead. Sinais simples (dependency ready, status) podem ser diretos.

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

**Regra:** se a mensagem pede ACAO ou MUDANCA → lead. Se e apenas INFORMACAO → direto.

---

## Quando roda multi-agent vs solo

| Situacao | Modo |
|----------|------|
| Fase afeta 2+ modulos | Multi-agent automatico |
| Fase afeta 1 modulo | Solo (como hoje) |
| Fase so cross-cutting | Solo (platform agent) |
| Quick task | Solo (sempre) |
| tmux nao disponivel | Solo (fallback) |

A decisao e 100% automatica. Voce nao precisa configurar nada.

---

## Regras de ownership

| Agente | Pode escrever | Pode ler |
|--------|--------------|----------|
| platform | `src/platform/**`, `src/shared/**` | Tudo |
| wireframe | `src/modules/wireframe/**` | Tudo |
| clients | `src/modules/clients/**` | Tudo |
| docs | `src/modules/docs/**` | Tudo |
| tasks | `src/modules/tasks/**` | Tudo |

Se um agente precisa escrever fora do seu scope, pede ao lead.

---

## Verificacao (3 niveis)

1. **Cada agente** valida seu modulo antes de reportar done (scope check via `git diff --name-only`, validacoes do CLAUDE.md do modulo)
2. **Lead** roda verificacao integrada (`tsc --noEmit`, `npm run build`, imports cross-module)
3. **GSD verify** (`/gsd:verify-work`) checa que nenhum modulo importa internals de outro

---

## Troubleshooting

**"Os agentes nao estao se comunicando"**
- Verifique que `teammateMode: "tmux"` esta configurado
- Agentes precisam ser spawnados com nomes (ex: `wireframe`, `clients`)

**"Um agente escreveu fora do scope"**
- O enforcement e por instrucao, nao tecnico
- O lead detecta na verificacao e pede correcao
- Se recorrente, reforce as instrucoes no CLAUDE.md do modulo

**"Fase tem pouca paralelizacao"**
- Se > 70% das tasks sao cross-cutting, o planner sugere execucao solo
- Fases de refactoring pesado tendem a ser mais sequenciais — normal

**"Quero forcar execucao solo"**
- Edite o PLAN.md mudando `Execution Mode: single-agent`
- Ou simplesmente nao use tmux — o fallback automatico roda solo

---

## Resumo do fluxo

```
tmux new-session -s fxl
  └─ claude
       ├─ /gsd:new-milestone        → brainstorming + roadmap
       ├─ /gsd:plan-phase N         → detecta modulos, gera waves + contratos
       ├─ /gsd:execute-phase N      → spawna agentes, checkpoints, verificacao
       ├─ /gsd:verify-work          → validacao final cross-module
       └─ /gsd:quick "..."          → tasks rapidas (sempre solo)
```
