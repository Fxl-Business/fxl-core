# Onboarding — First Session in a Spoke Project

## When to Use

When Claude Code is opened in a spoke project directory for the first time in a session.
This document defines the orientation protocol: what Claude reads, what it loads from MCP,
and how it presents the project state to the user.

This is NOT a one-time setup — run it at the start of every new Claude Code session in a spoke.

---

## Trigger Phrases

Activate this protocol when the user says:
- "let's start", "vamos começar", "o que temos aqui"
- "what's the state of the project", "qual o estado do projeto"
- "orient yourself", "se oriente"
- "continue from where we left off", "continua de onde paramos"
- Or opens a new session without context (empty first message)

---

## Protocol

### Step 1: Read Project Identity

Read `CLAUDE.md` at project root. Extract:
- Project name and slug
- Stack (auth provider, framework)
- Active entities
- Quality gates
- What NEVER to do

If `CLAUDE.md` does not exist:
> "This project does not have a CLAUDE.md. It may not be an FXL spoke yet. Do you want to run the refactor flow (`sdk/refactor-flow.md`) to bring it into compliance?"

Stop and wait for user response.

### Step 2: Check MCP Connection

Verify `.mcp.json` exists and points to the Nexo SDK MCP Server.

```
mcp__fxl-sdk__get_project_config(slug: "{project_slug from CLAUDE.md}")
```

**If MCP responds with project config:** Load it. Note the `stack_choices` for context.

**If MCP returns empty / project not registered:**
> "This project is not yet registered in the Nexo SDK knowledge base. Run `/nexo scaffold-flow` or `/nexo refactor-flow` to register it."

**If MCP is unreachable:**
> "[MCP unavailable] Working with local CLAUDE.md rules only. Standards and pitfalls from MCP will not be loaded this session."
Continue — MCP is an enhancement, not a blocker.

### Step 3: Load MCP Context

```
mcp__fxl-sdk__get_pitfalls()
mcp__fxl-sdk__get_standards(category: "stack")
mcp__fxl-sdk__get_standards(category: "security")
```

Store results internally. Apply them as constraints throughout the session.
Do not mention "MCP" or "knowledge base" to the user — just apply the knowledge naturally.

### Step 4: Assess Project State

Determine which of the following states the project is in:

| State | Signals | What to do |
|-------|---------|------------|
| **Fresh scaffold** | No `src/pages/`, minimal `src/`, no GSD `.planning/` | Inform user: "Project is freshly scaffolded. Ready to start feature development." |
| **Mid-refactor** | `FXL-AUDIT.md` exists, `REFACTOR-PLAN.md` exists or GSD phases incomplete | Report pending refactor phases |
| **Active development** | `.planning/STATE.md` exists with active phase | Report current GSD phase and status |
| **Clean / maintenance** | No pending work signals | Report project is ready, offer options |

#### For GSD projects (`.planning/` exists):

Read `.planning/STATE.md` to determine current milestone, phase, and status.
Read `.planning/ROADMAP.md` to understand upcoming phases.

Summarize:
```
Current phase: {N} — {phase title}
Status: {not started / in progress / complete}
Next phase: {N+1} — {phase title}
```

#### For non-GSD projects (no `.planning/`):

Check for `FXL-AUDIT.md` and `REFACTOR-PLAN.md`.
If found, summarize pending work from those files.

### Step 5: Run Quick Health Check (Optional)

If the user says "check health" or "checar saúde" during onboarding, run:

```bash
bunx tsc --noEmit 2>&1 | tail -5
```

Report result:
- Zero errors → "TypeScript is clean."
- Errors found → "TypeScript has {N} errors. Run `bunx tsc --noEmit` to see them."

Do not run `fxl-doctor.sh` automatically — it is slower and better suited for end-of-task verification.

---

## Ready Signal

After completing Steps 1–4, present a concise orientation summary to the user:

```
--- {project_name} ({project_slug}) ---

Stack: React 18 + TypeScript strict | Supabase | Clerk | Vite | Vercel
Auth: {Clerk / Supabase Auth}
Contract: v{version} | {N} entities: {entity list}

State: {Fresh scaffold / Mid-refactor: N phases remaining / Phase N in progress / Ready}

{If mid-refactor}
  Pending: {list of incomplete refactor phases}

{If active GSD phase}
  Current phase: {N} — {title} ({status})
  Next: {N+1} — {title}

What would you like to work on?
```

---

## First Session Template (Copy-Paste)

This is the recommended first message when opening Claude Code in a new spoke:

```
Você está num projeto FXL spoke chamado {project_name}.

Leia o CLAUDE.md, carregue o contexto do projeto via MCP, e me dê um resumo do
estado atual: stack, entidades principais, e o que está pendente de trabalho.

Após a orientação, aguarde instruções.
```

**Portuguese version (recommended for Brazilian projects):**
```
Você está num projeto FXL spoke. Leia o CLAUDE.md, carregue o contexto MCP,
e me oriente sobre o estado atual do projeto antes de começarmos a trabalhar.
```

**English version:**
```
You are in an FXL spoke project. Read CLAUDE.md, load MCP context,
and orient me on the current project state before we start working.
```

---

## Session Rules (Active Throughout Session)

Once onboarding is complete, these rules apply for the entire session:

1. **Quality gate before every task completion:**
   ```bash
   bunx tsc --noEmit
   ```
   Zero errors is the acceptance criterion. Never close a task with TypeScript errors.

2. **Never use `any`** — use `unknown` + type guards.

3. **Never commit `.env.local`** — it must exist only locally.

4. **MCP lookup before improvising** — if unsure about a pattern, call
   `mcp__fxl-sdk__search_knowledge(query: "{pattern description}")` before inventing a solution.

5. **Capture after completing** — after any significant task, evaluate if new learnings
   or pitfalls should be recorded via `mcp-bridge/post-operation.md`.

6. **Follow `sdk/refactor.md` step order** — if refactoring, do not skip steps or reorder.
   TypeScript must be fixed before component quality, security before contract.

---

## Integration Points

| Step | Rule Used |
|------|-----------|
| Step 2 (MCP check) | `mcp-bridge/pre-operation.md` |
| Step 3 (context load) | `mcp-bridge/pre-operation.md` |
| Step 4 (state assessment) | `methodology/workflow.md` |
| Session rules (MCP lookup) | `mcp-bridge/pre-operation.md` |
| Session rules (capture after task) | `mcp-bridge/post-operation.md` |

---

## Relationship to Other Rules

- **`sdk/scaffold-flow.md`** — Use when the project does not yet exist. Onboarding runs after scaffold.
- **`sdk/refactor-flow.md`** — Use when the project exists but is not FXL-compliant. Onboarding runs after refactor, or detects mid-refactor state.
- **`methodology/workflow.md`** — Onboarding is the entry point to every work session. The methodology's Discuss/Plan/Execute cycle starts after onboarding is complete.
- **`CLAUDE.md` (project file)** — The primary source of truth for project rules. Onboarding reads it first.
