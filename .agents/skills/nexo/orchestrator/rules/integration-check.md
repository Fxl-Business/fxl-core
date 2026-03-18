# Integration Check — Post-execution verification

After all agents complete (Wave 3), the lead runs these checks to verify the combined
output is correct and consistent. Works in both GSD and ad-hoc contexts.

---

## Automatic Checks (always run)

These 4 checks run after every multi-agent execution, regardless of context.

### 1. Global Type Check

```bash
npx tsc --noEmit
```

- Must exit with 0 errors
- If fails: identify which boundary's files cause the error (read error paths)
- Cross-boundary type mismatches are the most common failure here

### 2. Build Verification

```bash
npm run build
```

- Must complete successfully
- If fails: check for missing imports, circular dependencies, or bundle errors
- Build errors often indicate a contract mismatch between boundaries

### 3. Cross-Boundary Import Audit

Flag only INTERNAL imports — cross-boundary imports via public API are legitimate.

```bash
for BOUNDARY in {boundary-names}; do
  BOUNDARY_PATH="{boundary path}"

  # Find all imports FROM this boundary in OTHER boundaries
  VIOLATIONS=$(
    grep -r "from.*${BOUNDARY}/" src/ --include="*.ts" --include="*.tsx" \
      | grep -v "${BOUNDARY_PATH}/"             `# exclude self-imports` \
      | grep -v "/manifest"                     `# manifests are public API` \
      | grep -v "${BOUNDARY}/types/index"       `# type re-exports are public` \
      | grep -v "${BOUNDARY}/hooks/use"         `# exported hooks are public` \
      | grep -v "node_modules/"                 `# exclude dependencies`
  )

  if [[ -n "$VIOLATIONS" ]]; then
    echo "⚠ Internal import violations into ${BOUNDARY}:"
    echo "$VIOLATIONS"
  fi
done
```

**What is NOT a violation:**
- Importing from `{boundary}/manifest.ts` — this is the public API re-export
- Importing from `{boundary}/types/index.ts` — type definitions are public
- Importing from `{boundary}/hooks/use*.ts` — exported hooks are public API
- Importing from shared/ or platform/ — these are cross-cutting by design

**What IS a violation:**
- Importing from `{boundary}/components/internal/*`
- Importing from `{boundary}/services/private/*`
- Importing from `{boundary}/lib/*` (unless explicitly in Public API)
- Any deep path that bypasses the boundary's declared public API

### 4. Scope Compliance via Commit Tracers

Verify each agent stayed within its declared ownership:

```bash
for AGENT in {boundary-names}; do
  OUT_OF_SCOPE=$(
    git log --format="%H" --grep="\[agent:${AGENT}\]" ${BASELINE_COMMIT}..HEAD | \
      xargs -I{} git diff-tree --no-commit-id --name-only -r {} | \
      sort -u | \
      grep -v "${AGENT_OWNERSHIP}" | \
      grep -v "${AGENT_ASSOCIATED}"
  )

  if [[ -n "$OUT_OF_SCOPE" ]]; then
    echo "⚠ Agent ${AGENT} has scope violations: ${OUT_OF_SCOPE}"
  fi
done
```

If scope violations were already handled in the orchestration Scope Violation Check step,
include those results here for completeness.

---

## Conditional Checks

Run these additional checks when the condition applies:

| Condition | Check | Command |
|-----------|-------|---------|
| Project has test suite | Run tests | `npm test` or `npx vitest run` |
| Boundary has CLAUDE.md | Verify new exports in Public API | Read CLAUDE.md, compare with actual new exports |
| Contracts defined in plan | Verify declared exports exist | Read contract files, check exports match |
| Project has lint config | Run linter | `npm run lint` |

### Test Suite Check

```bash
# Detect test runner
if [[ -f "vitest.config.ts" ]] || grep -q "vitest" package.json 2>/dev/null; then
  npx vitest run
elif grep -q '"test"' package.json 2>/dev/null; then
  npm test
fi
```

### CLAUDE.md Public API Freshness

For each boundary affected by this execution:

```bash
# Get new exports created during this execution
NEW_EXPORTS=$(
  git diff ${BASELINE_COMMIT}..HEAD -- "${BOUNDARY_PATH}" \
    | grep "^+export" | grep -v "^+++"
)

# Check if they're documented in the boundary's CLAUDE.md
for EXPORT in $NEW_EXPORTS; do
  EXPORT_NAME=$(echo "$EXPORT" | grep -oP '(?:function|const|class|interface|type|enum)\s+\K\w+')
  if ! grep -q "$EXPORT_NAME" "${BOUNDARY_PATH}/CLAUDE.md" 2>/dev/null; then
    echo "⚠ ${BOUNDARY}: New export '${EXPORT_NAME}' not documented in CLAUDE.md Public API"
  fi
done
```

### Contract Verification

For each contract defined in the plan:

```bash
# Verify each declared export actually exists
for CONTRACT_FILE in {contract files}; do
  if [[ ! -f "$CONTRACT_FILE" ]]; then
    echo "⚠ Contract file missing: ${CONTRACT_FILE}"
    continue
  fi

  for EXPORT_NAME in {expected exports}; do
    if ! grep -q "export.*${EXPORT_NAME}" "$CONTRACT_FILE"; then
      echo "⚠ Missing export: ${EXPORT_NAME} in ${CONTRACT_FILE}"
    fi
  done
done
```

---

## Failure Recovery

When a check fails, the recovery strategy depends on the check type:

### tsc or build failure

1. Read error output to identify which boundary caused the failure
2. Re-spawn that boundary's agent with the specific error:
   ```
   Agent(
     name="{boundary-name}",
     prompt="Fix TypeScript/build error in your boundary:
       Error: {error message}
       File: {file path}
       Your ownership: {paths}
       Read: .agents/skills/nexo/orchestrator/rules/scoped-agent.md"
   )
   ```
3. After fix, re-run the failed check
4. **Limit: 2 fix attempts per agent.** If still failing after 2 retries, lead fixes directly.

### Import audit violation

- Usually a single wrong import path — lead fixes directly
- Common fix: change deep import to use boundary's manifest or public API

### Scope violation

1. Revert out-of-scope files: `git checkout ${BASELINE_COMMIT} -- {files}`
2. Re-spawn agent with only the tasks that needed out-of-scope changes
3. Lead handles the out-of-scope change directly or delegates to platform agent

### Contract mismatch

- Lead reads actual exports vs declared contract
- If producer is wrong: re-spawn producer agent to fix exports
- If consumer is wrong: re-spawn consumer agent with corrected contract
- If contract spec was wrong: lead fixes contract and notifies both sides

---

## Output

### GSD Context

Append results to VERIFICATION.md under a dedicated section:

```markdown
## Cross-Boundary Verification

**Execution:** multi-agent ({N} agents, {W} waves)
**Baseline commit:** {hash}

### Automatic Checks

| Check | Result | Details |
|-------|--------|---------|
| TypeScript (`tsc --noEmit`) | ✓ PASS | 0 errors |
| Build (`npm run build`) | ✓ PASS | Bundle: {size} |
| Cross-boundary imports | ✓ PASS | No internal imports detected |
| Scope compliance | ✓ PASS | All agents within ownership |

### Conditional Checks

| Check | Result | Details |
|-------|--------|---------|
| Tests | ✓ PASS | {N} tests, 0 failures |
| CLAUDE.md freshness | ⚠ 2 gaps | {boundary}: {exports} not documented |
| Contract verification | ✓ PASS | All exports match |

### Scope Violations

None detected.
(or: Agent {name} wrote to {file} — reverted and re-assigned.)

### Recovery Actions

None needed.
(or: Re-spawned {agent} to fix {error}. Resolved in {N} attempts.)
```

### Ad-hoc Context

Report summary directly to user:

```
Parallel execution complete ({N} agents, {W} waves).
✓ TypeScript: 0 errors
✓ Build: OK
✓ Cross-boundary imports: clean
✓ Scope compliance: all agents in-bounds
✓ Tests: {N} passed
⚠ CLAUDE.md: 2 boundaries need Public API updates

Commits:
- {hash}: {message} [agent:{name}]
- {hash}: {message} [agent:{name}]
```
