# Phase 127: CI/CD Pipeline - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

GitHub Actions CI pipeline that runs type-check (`tsc --noEmit`) and tests (`vitest run`) automatically on every PR, with branch protection blocking merges when CI fails. This phase delivers the workflow file, CI configuration, and branch protection rule -- nothing more.

</domain>

<decisions>
## Implementation Decisions

### Workflow trigger scope
- Trigger on `pull_request` targeting `main` branch only (opened, synchronize, reopened)
- No push trigger needed -- CI validates PRs, not individual commits

### Node/dependency caching strategy
- Use `actions/setup-node@v4` with built-in npm cache (`cache: 'npm'`)
- Node 20.x to match local development environment (currently v20.18.2)
- Standard `npm ci` for clean installs

### CI job structure
- Single job with sequential steps: checkout, setup-node, npm ci, tsc --noEmit, vitest run
- No need for parallel jobs -- the test suite is small (10 test files) and tsc is fast
- Job name should clearly indicate what it checks (e.g., `type-check-and-test`)

### Branch protection strictness
- Require status check to pass before merging -- no bypass for anyone
- The success criterion explicitly states "nao ha como fazer bypass sem desativar a protecao explicitamente"
- Configure via GitHub repo settings (Settings > Branches > Branch protection rules)
- Required status check: the CI job name from the workflow

### Claude's Discretion
- Exact workflow YAML formatting and step naming
- Whether to add a `concurrency` group to cancel in-progress runs on new pushes
- Whether to include a build step (`vite build`) in CI or just type-check + tests

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### CI/CD requirements
- `.planning/REQUIREMENTS.md` -- CI-01 (tsc on PR), CI-02 (vitest on PR), CI-03 (branch protection)
- `.planning/milestones/v9.0-ROADMAP.md` -- Phase 127 success criteria (3 acceptance tests)

### Existing test infrastructure
- `vitest.config.ts` -- Vitest configuration with jsdom, path aliases, test include patterns
- `src/test-setup.ts` -- Test setup with jest-dom matchers
- `package.json` -- Scripts: `test` (vitest run), `build` (tsc --noEmit && vite build), `lint` (eslint + tsc)

### Repository
- GitHub remote: `Fxl-Business/fxl-core` (branch protection must be configured here)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `vitest.config.ts`: Already configured with jsdom environment, path aliases (@platform, @shared, @modules, @tools, @clients), and test include patterns for `tools/**` and `src/**`
- `src/test-setup.ts`: Jest-dom matchers already set up
- `package.json` scripts: `npm run test` = `vitest run`, `npm run build` includes `tsc --noEmit`

### Established Patterns
- 10 existing test files across src/ and tools/ directories
- Path aliases must be available in CI (already in vitest.config.ts resolve)
- Build script already runs `tsc --noEmit` before `vite build` -- CI mirrors this

### Integration Points
- `.github/workflows/ci.yml` -- new file to create (no existing GitHub Actions)
- GitHub repo settings -- branch protection rule to add manually or via `gh api`
- No env vars needed for type-check or unit tests (tests mock Supabase/Clerk)

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- standard GitHub Actions CI pattern. The phase notes in STATE.md confirm: "CI-01/02/03 are one unit -- GitHub Actions workflow file, test runner config, and branch protection rule are all part of the same setup operation."

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 0127-ci-cd-pipeline*
*Context gathered: 2026-03-19*
