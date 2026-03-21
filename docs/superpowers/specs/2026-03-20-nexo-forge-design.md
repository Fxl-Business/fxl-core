# Nexo Forge — Design Spec

**Date:** 2026-03-20
**Status:** Draft
**Author:** Cauet Pinciara (CTO, FXL) + Claude

---

## 1. Visao Geral

O Nexo Forge e o toolkit operacional da FXL — um pacote independente que padroniza, bootstrapa e supervisiona todos os projetos criados pela empresa. Ele substitui o antigo FXL-SDK MCP (Cloudflare Worker + Supabase) por uma arquitetura de **distribuicao de conhecimento como codigo**, sem runtime externo.

### Problema que resolve

- O FXL-SDK MCP tinha custo de infra (Cloudflare Worker), superficie de ataque (endpoint publico com 178K req/24h suspeitas), e complexidade de configuracao (MCP + auth + Supabase)
- A Nexo Skill vivia dentro do app Nexo — acoplamento circular onde o produto continha as regras que deveria seguir
- Sem mecanismo de update — conhecimento novo nao propagava automaticamente entre projetos
- Sem padronizacao de setup — cada projeto novo exigia configuracao manual

### O que o Nexo Forge e

- Um pacote npm-like distribuido via GitHub (futuro: npm privado)
- Instalado globalmente no Claude Code (`~/.claude/nexo-forge/`)
- Cria dados por projeto em `.nexo/` no root (como GSD cria `.planning/`)
- Camada de orquestracao inteligente em cima do GSD
- Fonte unica de verdade para padroes, pitfalls e checklists da FXL

### O que o Nexo Forge NAO e

- Nao e um servidor MCP
- Nao e um aplicativo — o app Nexo e um produto separado que consome o Forge
- Nao e substituto do GSD — e uma camada acima que delega pra ele

---

## 2. Arquitetura

### Duas camadas de instalacao

| Camada | Localizacao | Conteudo | Quando instala |
|--------|------------|----------|----------------|
| **Global** | `~/.claude/nexo-forge/` | workflows, agents, hooks, VERSION, bin | `npx github:fxl-br/nexo-forge --claude` |
| **Projeto** | `.nexo/` no root do projeto | knowledge snapshot, checklists, manifest, config do projeto | `/nexo:setup` |

Os **commands** (`/nexo:*`) ficam em `~/.claude/commands/nexo/` — disponíveis em qualquer projeto sem instalar nada.

Analogia com GSD:
- GSD global: `~/.claude/get-shit-done/` → Nexo Forge global: `~/.claude/nexo-forge/`
- GSD projeto: `.planning/` → Nexo Forge projeto: `.nexo/`
- GSD commands: `.claude/commands/gsd/` → Nexo Forge commands: `.claude/commands/nexo/`

### Relacao com GSD

O GSD e uma **dependencia obrigatoria** do Nexo Forge. O Forge nao reimplementa o que o GSD ja faz — ele orquestra e extende:

```
Usuario
  └── /nexo:plan-all
        └── Nexo Forge (orquestra)
              ├── Agent 1 → /gsd:plan-phase (fase 1)
              ├── Agent 2 → /gsd:plan-phase (fase 2)
              └── Agent 3 → /gsd:plan-phase (fase 3)
```

### Coexistencia `.nexo/` e `.planning/`

Ambos diretorios coexistem no root do projeto com responsabilidades distintas:

| Diretorio | Dono | Conteudo | Quem escreve |
|-----------|------|----------|-------------|
| `.planning/` | GSD | STATE.md, ROADMAP.md, fases, planos, verificacoes | GSD (via `/gsd:*`) |
| `.nexo/` | Nexo Forge | config.json, knowledge, checklists, audits, dashboard | Nexo Forge (via `/nexo:*`) |

**Regra:** O Nexo Forge **le** `.planning/` para obter contexto (fase atual, progresso, roadmap) mas **nunca escreve** nele diretamente — sempre delega pro GSD. O GSD nao sabe que `.nexo/` existe e nao depende dele.

### Orquestracao de skills e MCPs externos

O Nexo Forge atua como **hub de orquestracao** para o ecossistema de ferramentas:

```
Nexo Forge (orquestrador)
  ├── GSD (workflow: plan/execute)
  ├── Clerk skills (auth: setup, custom-ui, orgs, testing)
  ├── Supabase MCP (database: migrations, SQL, edge functions)
  ├── shadcn skill (UI: components)
  └── Outros MCPs/skills conforme projeto
```

O `/nexo:setup` detecta quais ferramentas sao necessarias baseado nos modulos ativos e guia a instalacao. O `/nexo:status` mostra o estado de cada integracao.

---

## 3. Estrutura do Repositorio

```
nexo-forge/
├── bin/
│   └── install.cjs              # Installer script (multi-runtime)
├── VERSION                       # Semver (ex: 1.0.0)
├── CHANGELOG.md
├── package.json
│
├── knowledge/                    # Padroes por dominio (migrados do Supabase)
│   ├── stack/
│   │   ├── standards.md          # Padroes de tecnologia
│   │   └── pitfalls.md           # Erros comuns de stack
│   ├── security/
│   │   ├── standards.md
│   │   └── pitfalls.md
│   ├── database/
│   │   ├── standards.md
│   │   └── pitfalls.md
│   ├── frontend/
│   │   ├── standards.md
│   │   └── pitfalls.md
│   ├── api/
│   │   ├── standards.md
│   │   └── pitfalls.md
│   ├── infrastructure/
│   │   ├── standards.md
│   │   └── pitfalls.md
│   └── testing/
│       ├── standards.md
│       └── pitfalls.md
│
├── checklists/                   # Checklists de verificacao
│   ├── project-setup.md
│   ├── security-audit.md
│   ├── deploy-ready.md
│   ├── typescript.md
│   ├── rls.md
│   └── contract.md
│
├── commands/                     # Slash commands (copiados p/ ~/.claude/commands/nexo/)
│   └── nexo/
│       ├── setup.md
│       ├── audit.md
│       ├── plan-all.md
│       ├── auto-run.md
│       ├── scaffold.md
│       ├── update.md
│       ├── status.md
│       ├── learn.md
│       └── add.md
│
├── workflows/                    # Logica interna dos commands
│   ├── setup.md
│   ├── audit.md
│   ├── plan-all.md
│   ├── auto-run.md
│   ├── scaffold.md
│   ├── update.md
│   ├── status.md
│   ├── learn.md
│   └── add.md
│
├── agents/                       # Agent definitions
│   ├── nexo-planner.md           # Agente de planejamento paralelo
│   ├── nexo-auditor.md           # Agente de auditoria
│   └── nexo-scaffolder.md        # Agente de scaffold
│
├── hooks/                        # Hooks instalados globalmente
│   ├── nexo-check-update.js      # SessionStart: verifica updates via git ls-remote
│   └── nexo-statusline.js        # Statusline: mostra indicador de update
│
├── templates/                    # Templates copiados no scaffold
│   ├── claude.md.template        # CLAUDE.md padrao FXL
│   ├── tsconfig.json.template
│   ├── eslint.config.template
│   └── ...
│
└── deps/                         # Dependencias declaradas
    └── manifest.json             # GSD, MCPs (supabase, clerk), skills recomendadas
```

---

## 4. Knowledge — Organizacao por Dominio

### Migracao do Supabase

Os 101 standards e 30 pitfalls da tabela `sdk_standards` e `sdk_pitfalls` do Supabase serao extraidos e organizados em arquivos `.md` por dominio dentro de `knowledge/`.

**Formato de cada arquivo:**

```markdown
# Standards: [Dominio]

## STD-001: Nome do padrao
**Categoria:** stack | security | database | frontend | api | infrastructure | testing
**Severidade:** critical | high | medium

Descricao do padrao...

### Exemplos
- Bom: ...
- Ruim: ...

---

## STD-002: ...
```

**Formato de pitfalls:**

```markdown
# Pitfalls: [Dominio]

## PIT-001: Nome do pitfall
**Severidade:** critical | high | medium
**Contexto:** Quando isso acontece...

O que da errado e por que...

### Como evitar
- ...

---
```

### Ciclo de vida do knowledge

```
Projeto spoke descobre pattern/erro
  ↓
/nexo:learn (gera .md formatado)
  ↓
Cria branch + PR no repo nexo-forge
  ↓
Review humano (Cauet aprova)
  ↓
Merge → tag nova versao
  ↓
Outros projetos: SessionStart detecta update
  ↓
/nexo:update → knowledge atualizado localmente
```

---

## 5. Comandos

### `/nexo:setup`

**Proposito:** Bootstrapa um projeto novo ou existente com padroes FXL.

**Fluxo:**
1. Analisa o projeto atual (stack, estrutura, deps existentes)
2. Le `deps/manifest.json` — verifica dependencias
3. Instala GSD se nao presente (obrigatorio)
4. Sugere MCPs e skills recomendadas
5. Copia `knowledge/` e `checklists/` pra `.nexo/`
6. Gera `.nexo/config.json` com metadata do projeto
7. Aplica templates (CLAUDE.md, tsconfig, etc.) com confirmacao
8. Roda `gsd:map-codebase` por baixo
9. Gera `nexo-forge-manifest.json` com SHA256 de cada arquivo copiado

**GSD por baixo:** `gsd:new-project` + `gsd:map-codebase`

### `/nexo:audit`

**Proposito:** Avalia projeto contra todos os standards e pitfalls por dominio.

**Fluxo:**
1. Le `knowledge/` do `.nexo/` local
2. Analisa codebase contra cada standard
3. Gera relatorio com:
   - Standards cumpridos (✅)
   - Standards violados (❌) com localizacao
   - Pitfalls detectados (⚠️)
   - Score por dominio
4. Salva relatorio em `.nexo/audit-YYYY-MM-DD.md`
5. Opcionalmente gera fases no GSD para resolver gaps

**GSD por baixo:** Nenhum diretamente — mas pode gerar `/gsd:add-phase` para gaps

### `/nexo:plan-all`

**Proposito:** Planeja todas as fases pendentes do milestone em paralelo.

**Fluxo:**
1. Le `.planning/ROADMAP.md` — identifica fases sem PLAN.md
2. Spawna 1 agent por fase (paralelo)
3. Cada agent executa `gsd:discuss-phase --auto` + `gsd:plan-phase`
4. Aguarda todos completarem
5. Mostra resumo: fases planejadas, fases com erro

**GSD por baixo:** `gsd:discuss-phase` + `gsd:plan-phase` × N em paralelo

### `/nexo:auto-run`

**Proposito:** Executa todas as fases planejadas em waves respeitando dependencias.

**Fluxo:**
1. Verifica se todas as fases tem PLAN.md — se nao, roda `/nexo:plan-all` primeiro
2. Analisa dependencias entre fases
3. Agrupa em waves (fases independentes = mesma wave)
4. Executa wave por wave:
   - Spawna agents paralelos para fases da wave
   - Cada agent executa `gsd:execute-phase`
   - Aguarda wave completar antes da proxima
5. Apos cada wave: verificacao rapida de integridade (tsc, tests)

**GSD por baixo:** `gsd:execute-phase` × N em waves

### `/nexo:scaffold`

**Proposito:** Cria projeto novo do zero com stack FXL completa.

**Fluxo:**
1. Pergunta tipo de projeto (dashboard, landing, API, mobile, etc.)
2. Le templates relevantes
3. Gera estrutura de pastas + configs
4. Roda `/nexo:setup` automaticamente
5. Commit inicial

**GSD por baixo:** `gsd:new-project` + templates

### `/nexo:update`

**Proposito:** Atualiza Nexo Forge para ultima versao.

**Fluxo:**
1. Detecta versao instalada (global `VERSION`)
2. Compara com ultima tag no GitHub (`git ls-remote --tags`)
3. Se ja esta na ultima: exit
4. Mostra changelog entre versoes
5. Backup de arquivos modificados → `nexo-forge-patches/`
6. Puxa nova versao do GitHub
7. Re-executa installer (`bin/install.cjs`)
8. Limpa cache de update
9. Se tem projeto com `.nexo/`: sugere rodar `/nexo:setup` pra atualizar knowledge local

**Modelo:** Identico ao `gsd:update`

### `/nexo:add`

**Proposito:** Habilita um modulo no projeto (frontend, backend, mobile, shared, etc.).

**Fluxo:**
1. Recebe nome do modulo (ex: `mobile`)
2. Valida se o modulo e conhecido (lista em knowledge)
3. Scaffold da pasta com estrutura padrao (ex: `apps/mobile/` com React Native/Expo)
4. Atualiza `.nexo/config.json` — seta `modules.<nome>.enabled = true`
5. Ativa knowledge relevante (ex: knowledge de mobile passa a ser considerado em audits)
6. Sugere dependencias necessarias (ex: "Mobile precisa do MCP X")

**GSD por baixo:** Nenhum — fluxo proprio

### `/nexo:status`

**Proposito:** Visao consolidada do estado do projeto.

**Fluxo:**
1. Le `.planning/STATE.md` (via GSD)
2. Le `.nexo/config.json`
3. Mostra:
   - Modulos ativos/inativos
   - Fase atual e progresso (via GSD)
   - Health do knowledge (versao, ultima auditoria)
   - Dependencias: versao instalada vs validada (alerta se divergem)
   - Skills e MCPs ativos
4. Delega pra `gsd:progress` + `gsd:stats` para dados de workflow

**GSD por baixo:** `gsd:progress` + `gsd:stats`

### `/nexo:status --html` (Dashboard)

**Proposito:** Gera dashboard HTML estatico com visao global do projeto.

**Fluxo:**
1. Coleta todos os dados de `/nexo:status`
2. Gera `.nexo/dashboard.html` — arquivo HTML self-contained (CSS inline, zero deps externas)
3. Conteudo do dashboard:
   - **Mapa de modulos:** cards mostrando modulos ativos/inativos com path e framework
   - **Dependencias:** tabela com versao validada vs instalada, status (ok/desatualizado)
   - **Ultimo audit:** score por dominio, data, gaps pendentes
   - **Progresso GSD:** fase atual, % milestone, fases pendentes
   - **Skills/MCPs:** lista de ferramentas ativas com status
4. Abre automaticamente no browser (`open .nexo/dashboard.html`)

**Regeneracao:** O HTML e um snapshot — regenerado sob demanda com `/nexo:status --html`. Nao e reativo, nao tem server.

**Regra:** Este e o unico arquivo `.html` que o Nexo Forge gera. E um dashboard de diagnostico, nao um componente de aplicacao.

### `/nexo:learn`

**Proposito:** Captura aprendizado do projeto atual e gera PR pro repo nexo-forge.

**Fluxo:**
1. Pergunta o que foi aprendido (ou aceita descricao inline)
2. Classifica: standard novo, pitfall novo, ou melhoria de existente
3. Identifica dominio (stack, security, database, etc.)
4. Gera arquivo `.md` formatado no padrao do knowledge
5. Clona repo nexo-forge num worktree temporario
6. Adiciona arquivo no dominio correto
7. Cria branch `learn/descricao-curta`
8. Commit + push
9. Mostra diff e pergunta se quer abrir PR
10. Se sim: `gh pr create` com descricao formatada

**GSD por baixo:** Nenhum — fluxo proprio

---

## 6. Mecanismo de Update

### SessionStart Hook (`nexo-check-update.js`)

```
Session inicia
  ↓
Hook roda em background (nao bloqueia)
  ↓
git ls-remote --tags github.com/fxl-br/nexo-forge
  ↓
Compara ultima tag com VERSION local
  ↓
Escreve ~/.claude/cache/nexo-forge-update.json:
{
  "update_available": true/false,
  "installed": "1.0.0",
  "latest": "1.1.0",
  "checked": 1711000000
}
```

### Statusline Hook (`nexo-statusline.js`)

```
Statusline refresh
  ↓
Le cache nexo-forge-update.json
  ↓
Se update disponivel: mostra "⬆ /nexo:update"
```

### Manifest de Integridade

Cada instalacao gera `nexo-forge-manifest.json`:

```json
{
  "version": "1.0.0",
  "timestamp": "2026-03-20T...",
  "files": {
    "nexo-forge/workflows/setup.md": "sha256:abc123...",
    "commands/nexo/setup.md": "sha256:def456...",
    ...
  }
}
```

O updater detecta arquivos modificados localmente (hash diferente do manifest) e faz backup antes de sobrescrever.

---

## 7. Dependencias

### `deps/manifest.json`

```json
{
  "required": {
    "skills": [
      {
        "name": "get-shit-done-cc",
        "install": "npx -y get-shit-done-cc@latest --claude",
        "check": "~/.claude/get-shit-done/VERSION"
      }
    ],
    "mcps": []
  },
  "recommended": {
    "skills": [
      {
        "name": "shadcn",
        "description": "Componentes shadcn/ui — necessario para projetos frontend"
      }
    ],
    "mcps": [
      {
        "name": "supabase",
        "description": "MCP do Supabase — necessario para projetos com banco de dados",
        "setup_url": "https://supabase.com/docs/guides/getting-started/mcp"
      },
      {
        "name": "clerk",
        "description": "MCP do Clerk — necessario para projetos com autenticacao"
      }
    ]
  }
}
```

O `/nexo:setup` verifica required automaticamente e sugere recommended baseado no tipo de projeto.

---

## 8. Dados por Projeto (`.nexo/`)

```
.nexo/
├── config.json                # Metadata do projeto
├── knowledge/                 # Snapshot do knowledge (copiado do global)
│   ├── stack/
│   ├── security/
│   └── ...
├── checklists/                # Snapshot dos checklists
├── audits/                    # Relatorios de auditoria
│   └── 2026-03-20.md
└── manifest.json              # SHA256 dos arquivos copiados
```

**`config.json`:**

```json
{
  "project_name": "nexo",
  "project_type": "monorepo",
  "forge_version": "1.0.0",
  "setup_date": "2026-03-20",
  "modules": {
    "frontend": {
      "enabled": true,
      "path": "apps/web",
      "framework": "react",
      "stack": ["typescript", "tailwind", "shadcn"]
    },
    "backend": {
      "enabled": true,
      "path": "apps/api",
      "framework": "hono",
      "stack": ["typescript"]
    },
    "mobile": {
      "enabled": false
    },
    "shared": {
      "enabled": true,
      "path": "packages/shared"
    }
  },
  "active_mcps": ["supabase"],
  "active_skills": ["gsd", "shadcn"],
  "deps_versions": {
    "get-shit-done-cc": { "validated": "1.27.0", "installed": "1.27.0" },
    "supabase-mcp": { "validated": "1.0.0", "installed": "1.0.0" },
    "clerk-skill": { "validated": "2.1.0", "installed": "2.1.0" }
  }
}
```

### Modulos dinamicos

Os modulos representam as partes ativas do projeto. Cada modulo pode ser habilitado ou desabilitado, e o Nexo Forge ajusta seu comportamento de acordo:

- **Modulo desabilitado:** knowledge e checklists daquele dominio sao ignorados em audits e sugestoes
- **`/nexo:add <modulo>`:** Habilita um modulo — scaffold da pasta, atualiza config, ativa knowledge relevante
- **`/nexo:remove <modulo>`:** Desabilita um modulo — marca como `enabled: false`, nao deleta arquivos

Exemplo: `/nexo:add mobile` cria `apps/mobile/`, configura React Native/Expo, e passa a incluir knowledge de mobile nos audits.

### Tracking de versoes de dependencias

O campo `deps_versions` registra a versao de cada skill/MCP com a qual o Nexo Forge foi validado (`validated`) e a versao atualmente instalada (`installed`).

- `/nexo:status` compara ambas e avisa se divergem: "Supabase MCP esta em v1.2.0 mas Nexo Forge foi validado com v1.0.0 — revise changelog"
- O repo do Nexo Forge mantem em `deps/manifest.json` as versoes `validated` atuais
- Atualizacoes de knowledge para acompanhar deps novas sao feitas via `/nexo:learn` + PR

---

## 9. Migracao — O que acontece com o estado atual

### Componentes que migram pro Nexo Forge

| De (atual) | Para (Nexo Forge) |
|------------|-------------------|
| `.agents/skills/nexo/` | Repo `nexo-forge/` (commands, workflows, agents) |
| `.agents/skills/nexo/sdk/` | `nexo-forge/workflows/` |
| `.agents/skills/nexo/mcp-bridge/` | Eliminado — knowledge e local, sem MCP |
| `.agents/skills/nexo/methodology/` | `nexo-forge/workflows/` (integrado com GSD) |
| `.agents/skills/nexo/orchestrator/` | `nexo-forge/agents/` |
| `.agents/skills/nexo/checklists/` | `nexo-forge/checklists/` |
| `.agents/skills/nexo/templates/` | `nexo-forge/templates/` |
| `mcp/fxl-sdk/` (codigo do Worker) | Eliminado |
| Supabase `sdk_standards` (101 rows) | `nexo-forge/knowledge/*/standards.md` |
| Supabase `sdk_pitfalls` (30 rows) | `nexo-forge/knowledge/*/pitfalls.md` |
| `.mcp.json` (config fxl-sdk) | Eliminado |

### Componentes que ficam no app Nexo

- `src/` — codigo do aplicativo
- `docs/` — documentacao do produto
- `.planning/` — estado GSD do projeto
- `.claude/` — config do Claude Code (passa a consumir Nexo Forge como dependencia)

### O que e desligado

- Cloudflare Worker `fxl-sdk-mcp` — deletar no dashboard do Cloudflare
- Tabelas Supabase `sdk_standards`, `sdk_pitfalls`, `sdk_learnings`, `sdk_projects` — podem ser removidas apos migracao confirmada
- Config MCP em `.mcp.json` e `.claude/settings.json` — remover entradas `fxl-sdk`

---

## 10. Instalacao e Distribuicao

### Primeira instalacao (global)

```bash
npx github:fxl-br/nexo-forge --claude
```

O installer (`bin/install.cjs`):
1. Detecta runtime (claude, gemini, codex, opencode)
2. Copia arquivos pra diretorio global do runtime
3. Registra hooks no settings
4. Gera manifest
5. Verifica dependencias (GSD instalado?)

### Setup por projeto

```
/nexo:setup
```

Copia knowledge + checklists pra `.nexo/`, configura projeto.

### Update

```
/nexo:update
```

Puxa ultima tag do GitHub, re-executa installer, atualiza global.
Sugere rodar `/nexo:setup` no projeto atual pra atualizar `.nexo/`.

### Futuro: npm privado

Quando necessario, basta:
1. Adicionar `publishConfig` ao `package.json`
2. `npm publish --registry=https://npm.pkg.github.com`
3. Mudar install pra `npx @fxl/nexo-forge --claude`

---

## 11. Decisoes de Design

| Decisao | Escolha | Motivo |
|---------|---------|--------|
| Eliminar MCP | Sim | Custo, seguranca, complexidade desnecessaria para uso solo |
| Repo separado | Sim | Desacoplar toolkit do produto — app Nexo e consumidor, nao container |
| Organizacao por dominio | Sim | Mais natural pra curar e revisar que por tipo (standards/pitfalls) |
| GSD como dependencia | Sim | Nao reinventar workflow — Forge orquestra, GSD executa |
| Modelo de update do GSD | Sim | Provado, robusto, multi-runtime |
| GitHub direto (sem npm) | Sim | Suficiente agora, migravel pra npm privado depois |
| Global + projeto | Sim | Toolkit global, dados por projeto — mesmo padrao GSD |
| `/nexo:learn` via PR | Sim | Review humano antes de virar padrao — melhor que auto-insert no banco |
| Modulos dinamicos | Sim | Projetos crescem — mobile pode vir depois. Knowledge so ativa quando modulo ativa |
| Dashboard HTML estatico | Sim | Visao global rapida sem server. Unica excecao de .html no Forge |
| `.nexo/` + `.planning/` coexistem | Sim | Responsabilidades distintas — Forge le .planning/ mas nunca escreve |
| Tracking de versoes de deps | Sim | Detectar drift entre versao validada e instalada de skills/MCPs |
