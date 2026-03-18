# Boundary Detection — Rules for Orchestrator

Detect project boundaries from multiple signals. Works for any project structure
(modules/, packages/, workspaces/, convention dirs, flat src/).

Run these steps after generating tasks (GSD planner) or when evaluating a complex
ad-hoc request (lead agent).

---

## Step 1: Discover Boundaries

Use the detection hierarchy below. Higher-priority signals take precedence — if a
directory matches via CLAUDE.md, it won't be re-detected by convention or heuristic.

### Detection Hierarchy (priority descending)

| Priority | Signal | Detection Method | Example |
|----------|--------|-----------------|---------|
| 1 | **Explicit CLAUDE.md** | Recursive search for CLAUDE.md in src/ | `src/modules/wireframe/CLAUDE.md` |
| 2 | **Monorepo workspaces** | `package.json` → `workspaces` field | `packages/api/`, `packages/web/` |
| 3 | **Package boundaries** | Directories with own `package.json` (not root, not node_modules) | `apps/dashboard/package.json` |
| 4 | **Convention directories** | Known patterns: `modules/`, `services/`, `apps/`, `packages/` | `src/services/auth/` |
| 5 | **Size heuristic** | Dirs with 5+ .ts/.tsx files and clear exports | `src/features/billing/` |

### Discovery Commands

```bash
# Signal 1: Explicit CLAUDE.md (highest priority)
find src/ -name "CLAUDE.md" -mindepth 2 -maxdepth 3 2>/dev/null

# Signal 2: Monorepo workspaces
cat package.json | jq -r '.workspaces[]? // empty' 2>/dev/null

# Signal 3: Package boundaries (own package.json)
find . -name "package.json" -mindepth 2 -maxdepth 3 -not -path "*/node_modules/*" 2>/dev/null

# Signal 4: Convention directories
ls -d src/modules/*/  src/services/*/  apps/*/  packages/*/ 2>/dev/null

# Signal 5: Size heuristic (5+ .ts/.tsx files with exports)
for dir in src/*/; do
  count=$(find "$dir" -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
  if [ "$count" -ge 5 ]; then echo "$dir"; fi
done
```

**Deduplication:** After running all signals, remove directories already matched by a
higher-priority signal. A directory matched by Signal 1 (CLAUDE.md) is never re-added
by Signal 4 (convention).

---

## Step 2: Filter Noise

Remove directories that match detection signals but should NOT be boundaries:

1. **Too small** — directories with < 3 files (likely scaffolding or stubs)
2. **Re-export only** — directories containing only `index.ts` re-exports with no logic
3. **Already nested** — directories already inside a detected boundary (child of another match)

```bash
# Check file count for each candidate
for dir in ${CANDIDATES}; do
  count=$(find "$dir" -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
  if [ "$count" -lt 3 ]; then
    echo "FILTER: $dir (only $count files)"
  fi
done

# Check for re-export-only dirs
for dir in ${CANDIDATES}; do
  total=$(find "$dir" -name "*.ts" -o -name "*.tsx" | wc -l)
  reexport=$(grep -rl "^export \* from\|^export { .* } from" "$dir" --include="*.ts" 2>/dev/null | wc -l)
  if [ "$total" -eq "$reexport" ]; then
    echo "FILTER: $dir (re-exports only)"
  fi
done
```

This prevents directories like `src/modules/ferramentas/` (1 file) or
`src/modules/hooks/` (empty) from being treated as valid boundaries.

---

## Step 3: Detect Associated Paths

Boundaries can have **associated paths** — directories outside the main boundary that
logically belong to the same domain but live elsewhere in the tree.

### Detection Methods

**Method A: Explicit declaration in CLAUDE.md**

Read each boundary's CLAUDE.md. Look for sections referencing external paths:
- "From tools/" sections listing external imports
- "Associated Paths" sections (if using the boundary template)
- Any explicit ownership claim over paths outside the boundary dir

**Method B: Import consumer analysis**

For directories not yet assigned to any boundary (e.g., `tools/wireframe-builder/`):

```bash
# Find who imports from this unassigned directory
grep -r "from.*tools/wireframe-builder" src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null

# Count imports per boundary
for boundary in ${BOUNDARIES}; do
  count=$(grep -r "from.*tools/wireframe-builder" "${boundary}/" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
  echo "$boundary: $count imports"
done
```

**80% threshold:** If 80%+ of a directory's consumers are in one boundary, that
boundary gets the directory as an associated path with `access: read-write`.

### Associated Path Record

```yaml
associated:
  - path: tools/wireframe-builder/
    access: read-write
    reason: "hybrid architecture — components shared across contexts"
```

This resolves the `tools/wireframe-builder/` ownership problem: the wireframe agent
gets read-write access to its associated paths without restructuring the codebase.

---

## Step 4: Resolve Overlaps

When two boundaries claim the same associated path (e.g., both `billing` and
`payments` import heavily from `src/shared/billing-utils/`):

| Condition | Resolution |
|-----------|-----------|
| One boundary has 80%+ of imports | That boundary gets `read-write`, others get `read-only` |
| Roughly equal (no clear owner) | Path goes to `cross_cutting` — owned by platform/lead agent, all boundary agents get `read-only` |
| CLAUDE.md explicitly declares the path | Explicit declaration wins over heuristic detection |

**Overlap is never silently ignored.** The boundary map must resolve every path to
exactly one owner (or `cross_cutting`).

---

## Step 5: Build Boundary Map

Output the boundary map as YAML. This structure is consumed by task-analysis.md and
embedded in PLAN.md frontmatter when `execution_mode: multi-agent`.

```yaml
boundaries:
  - name: wireframe
    path: src/modules/wireframe/
    source: claude-md          # which signal detected it
    has_manifest: true         # has CLAUDE.md with Public API
    file_count: 12
    associated:
      - path: tools/wireframe-builder/
        access: read-write
        reason: "hybrid architecture — components shared across contexts"

  - name: clients
    path: src/modules/clients/
    source: claude-md
    has_manifest: true
    file_count: 18

  - name: api
    path: packages/api/
    source: workspace
    has_manifest: false
    file_count: 45

cross_cutting:
  - path: src/platform/
  - path: src/shared/

unmapped:
  - path: docs/
  - path: supabase/
```

### Classification Rules

| Path pattern | Classification |
|-------------|---------------|
| Detected boundary | `boundaries[]` with name, path, source, metadata |
| `src/platform/**`, `src/shared/**` | `cross_cutting` — owned by platform/lead agent |
| `docs/**`, `clients/**`, `supabase/**`, root configs | `unmapped` — handled by lead agent |
| Paths matching an associated path | Part of their parent boundary |

### Single Boundary = Valid Outcome

Detecting exactly 1 boundary is expected and common (small projects, flat structures).
The skill stays inactive — task-analysis.md routes `any | 1` to `single-agent`.
No warning, no suggestion to restructure. The skill simply doesn't apply.

---

## Step 6: Auto-scaffold CLAUDE.md

If a boundary is detected (Signal 2-5) but has no CLAUDE.md:

1. Analyze its exports:
   ```bash
   grep -r "^export" ${BOUNDARY_PATH}/ --include="*.ts" --include="*.tsx" | head -20
   ```

2. Generate a scaffold using the template at:
   `.agents/skills/nexo/orchestrator/templates/boundary-claude.md`

3. Fill in: name, purpose (from directory name + exports), ownership path,
   public API (from export analysis), dependencies (from import analysis)

4. Write the CLAUDE.md to the boundary directory

5. Log warning:
   ```
   ⚠ Auto-generated CLAUDE.md for boundary {name} — review recommended
   ```

**Important:** Auto-scaffolded CLAUDE.md files are best-effort. They enable the
orchestrator to function but should be reviewed by the user for accuracy.
The `has_manifest: false` flag in the boundary map indicates auto-generated vs explicit.
