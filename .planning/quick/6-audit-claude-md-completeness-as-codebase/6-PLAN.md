---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [CLAUDE.md]
autonomous: true
requirements: [AUDIT-01]

must_haves:
  truths:
    - "Claude Code sessions without GSD have full awareness of .planning/, .claude/, .agents/ structure"
    - "CLAUDE.md tree diagram reflects actual current codebase (supabase/, .planning/, Makefile, all src/ subdirs)"
    - "Skills referenced in 'Regra de qualidade visual' have location documented (global vs project)"
    - "GSD workflow system is documented enough for Claude to understand its role"
  artifacts:
    - path: "CLAUDE.md"
      provides: "Complete codebase orchestrator document"
      contains: ".planning/"
  key_links:
    - from: "CLAUDE.md"
      to: ".planning/, .claude/, .agents/, supabase/"
      via: "explicit directory references and descriptions"
      pattern: "\\.planning/|\\.claude/|\\.agents/|supabase/"
---

<objective>
Audit CLAUDE.md for completeness as the primary codebase orchestrator document, then apply edits to fill all gaps found.

Purpose: Claude Code sessions that don't use GSD workflows still need full awareness of the codebase — .planning/ for project state, .claude/ for AI runtime, .agents/ for third-party skills, supabase/ for migrations, global skills for frontend quality. Currently CLAUDE.md mentions these only superficially or not at all.

Output: Updated CLAUDE.md with all gaps filled.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Audit CLAUDE.md against actual codebase and apply gap-closing edits</name>
  <files>CLAUDE.md</files>
  <action>
Read CLAUDE.md fully. Then explore the actual codebase structure by listing directories. Compare what CLAUDE.md documents against what actually exists. The following gaps have been pre-identified — verify each and apply edits to CLAUDE.md:

**GAP 1 — .planning/ directory completely undocumented.**
CLAUDE.md tree shows `.claude/` and `.agents/` as one-liners but `.planning/` is absent entirely.
Add `.planning/` to the tree diagram with its key contents:
```
.planning/               -- Planejamento e estado do projeto (GSD workflow)
  STATE.md               -- Estado atual do projeto (milestone, progresso, decisoes)
  ROADMAP.md             -- Roadmap de fases do milestone atual
  PROJECT.md             -- Contexto do projeto (stack, arquitetura, decisoes-chave)
  RETROSPECTIVE.md       -- Retrospectivas por milestone
  config.json            -- Configuracao do GSD (mode, granularity, models)
  phases/                -- Planos e sumarios por fase
  quick/                 -- Quick tasks (tarefas atomicas fora de milestone)
  milestones/            -- Roadmaps e fases arquivadas de milestones anteriores
  codebase/              -- Mapa automatico do codebase (ARCHITECTURE.md, STACK.md, etc.)
  research/              -- Pesquisa tecnica (stack, features, pitfalls)
```
Also add a new section `## Planejamento e estado — .planning/` AFTER the "Estrutura do repositorio" section explaining:
- `.planning/STATE.md` is the source of truth for project position (current milestone, progress, decisions, blockers)
- `.planning/ROADMAP.md` has the phase breakdown for the current milestone
- Quick tasks live in `.planning/quick/N-slug/`
- Past milestones archived in `.planning/milestones/`
- The GSD workflow system (`.claude/get-shit-done/`) uses these files for structured planning/execution

**GAP 2 — .claude/ directory documented as one-liner, missing actual structure.**
Currently: `.claude/  <-- Plataforma -- AI runtime (GSD, commands, hooks)`
Expand in the tree to show:
```
.claude/
  commands/gsd/          -- Slash commands (/gsd:*) — planning, execution, verification
  get-shit-done/         -- GSD workflow engine (agents, workflows, templates, bin)
  hooks/                 -- Session hooks (context monitor, status line, update checker)
  skills/                -- Symlinks to global skills (frontend-design, shadcn, etc.)
  agents/                -- Agent definitions (planner, executor, verifier, etc.)
  settings.json          -- Permissions, hooks config, status line
```

**GAP 3 — .agents/ directory documented as one-liner, missing actual structure.**
Currently: `.agents/  <-- Plataforma -- skills de terceiros (Clerk)`
Expand in the tree to show:
```
.agents/
  skills/                -- Third-party vendor skills
    clerk/               -- Core Clerk auth skill
    clerk-backend-api/   -- Clerk Backend API reference
    clerk-custom-ui/     -- Custom Clerk UI components
    clerk-setup/         -- Clerk project setup
    clerk-webhooks/      -- Clerk webhook handling
    clerk-testing/       -- Clerk testing patterns
    (+ clerk-orgs, clerk-swift, clerk-nextjs-patterns)
```

**GAP 4 — supabase/ directory missing from tree.**
Add to the tree diagram:
```
supabase/                -- Supabase CLI (migrations)
  migrations/            -- SQL migrations (001_ through 004_)
```

**GAP 5 — Makefile missing from tree.**
Add `Makefile` to the root level of the tree with comment `-- dev, build, lint, migrate`.

**GAP 6 — Skills location ambiguity.**
The "Regra de qualidade visual" section lists 6 skills but does not say WHERE they live. These are GLOBAL user-level skills at `~/.claude/skills/` (not project-level). The `.claude/skills/` directory in the project contains symlinks to some of them plus symlinks to `.agents/skills/`.
Add a new section `## Skills — localizacao` AFTER "Regra de qualidade visual" that documents:
- Global skills (user-level, `~/.claude/skills/`): frontend-design, composition-patterns, react-best-practices, ui-ux-pro-max, web-design-guidelines
- Global skills via symlink to `.agents/skills/`: shadcn, find-skills
- Project skills (`.agents/skills/`): clerk, clerk-backend-api, clerk-custom-ui, clerk-setup, clerk-webhooks, clerk-testing, clerk-orgs, clerk-swift, clerk-nextjs-patterns
- Project `.claude/skills/` contains symlinks to both global and .agents skills
- Tool skills (`tools/*/SKILL.md`): wireframe-builder

**GAP 7 — src/ tree is outdated.**
The tree shows `pages/` with only `(Home, clients)` but actual pages include: Home.tsx, Login.tsx, Profile.tsx, SharedWireframeView.tsx, DocRenderer.tsx, plus `clients/` and `docs/` and `tools/` subdirectories.
The `components/` section is also missing `ProtectedRoute.tsx`.
The `lib/` section is missing `search-index.ts` and `supabase.ts`.
Update the src/ subtree to match reality.

**GAP 8 — clients/ actual structure not detailed enough.**
The tree shows `docs/` and `wireframe/` inside client slug, but the actual structure for `financeiro-conta-azul` also follows that pattern. Confirm the tree is accurate. The tree IS correct for the general pattern (CLAUDE.md, docs/, wireframe/) — no change needed here.

**GAP 9 — tools/wireframe-builder/ actual structure more detailed than tree shows.**
Tree shows only `SKILL.md` and `components/`. Actual has: components/, lib/, scripts/, styles/, types/, SKILL.md.
Update the tree to reflect all subdirectories.

**GAP 10 — Convencao de commit missing .planning/ pattern.**
Add: `- Alteracoes em .planning/: `docs: [o que mudou]` (ou `infra:` se for config)`

**GAP 11 — Makefile targets not documented.**
Add a brief section or note after "Checklist obrigatorio" about Makefile targets: `make dev`, `make build`, `make lint`, `make migrate`.

When applying edits:
- Preserve all existing content that is accurate
- Add new sections in logical positions (see specific placement notes above)
- Keep the same Portuguese language style used throughout
- Do NOT restructure or rename existing sections — only ADD missing content and UPDATE outdated content
  </action>
  <verify>
    <automated>grep -c ".planning/" CLAUDE.md && grep -c "get-shit-done" CLAUDE.md && grep -c "supabase/" CLAUDE.md && grep -c "Skills.*localizacao" CLAUDE.md</automated>
  </verify>
  <done>CLAUDE.md tree diagram matches actual codebase structure. .planning/ directory and its purpose are documented. .claude/ internal structure is documented. .agents/ skills are listed. supabase/ and Makefile appear in tree. Skills location (global vs project) is explicit. src/ tree reflects actual pages, components, and lib files. Commit conventions cover .planning/. Makefile targets are documented.</done>
</task>

<task type="auto">
  <name>Task 2: Verify updated CLAUDE.md accuracy with automated checks</name>
  <files>CLAUDE.md</files>
  <action>
After Task 1 edits are applied, run verification:

1. Check that every top-level directory in the repo is mentioned in CLAUDE.md tree:
   - `ls -d */ .*/ 2>/dev/null | grep -v node_modules | grep -v .git` and verify each appears in CLAUDE.md
2. Check that key files mentioned in CLAUDE.md actually exist:
   - `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/PROJECT.md`
   - `.claude/settings.json`, `.claude/commands/gsd/`
   - `Makefile`, `supabase/migrations/`
3. Verify `npx tsc --noEmit` still passes (CLAUDE.md is not TypeScript but this is the project's mandatory check)
4. If any discrepancy is found between the updated CLAUDE.md and reality, fix it immediately

No structural or content changes beyond fixing verification failures.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>All directories mentioned in CLAUDE.md exist on disk. All files referenced in CLAUDE.md exist. TypeScript check passes. No phantom references.</done>
</task>

</tasks>

<verification>
1. `grep ".planning/" CLAUDE.md` returns multiple matches (STATE.md, ROADMAP.md, phases/, quick/, milestones/)
2. `grep "get-shit-done" CLAUDE.md` returns at least 1 match
3. `grep "supabase/" CLAUDE.md` returns at least 1 match (in tree + env vars section)
4. `grep "Makefile" CLAUDE.md` returns at least 1 match
5. `grep "Skills" CLAUDE.md` returns match for skills location section
6. `grep "Login.tsx\|Profile.tsx\|SharedWireframeView" CLAUDE.md` returns matches (updated src/ tree)
7. `npx tsc --noEmit` passes
</verification>

<success_criteria>
CLAUDE.md serves as a complete codebase orchestrator: any Claude Code session reading only CLAUDE.md knows where to find planning state, GSD workflows, agent skills, global frontend skills, migrations, and all source directories. No major codebase location is undocumented.
</success_criteria>

<output>
After completion, create `.planning/quick/6-audit-claude-md-completeness-as-codebase/6-SUMMARY.md`
</output>
