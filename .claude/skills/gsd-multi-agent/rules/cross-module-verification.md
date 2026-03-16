# Cross-Module Verification — Rules for gsd-verifier

When verifying a phase whose plan has `execution_mode: multi-agent`, perform
these additional checks after the standard verification.

## 1. Public API Boundary Check

For each module with a CLAUDE.md under `src/modules/`:
- Read the module's `## Public API` section
- Search for imports FROM this module in OTHER modules:
  ```bash
  grep -r "from.*modules/{name}" src/modules/ --include="*.ts" --include="*.tsx" \
    | grep -v "src/modules/{name}/"
  ```
- Verify all cross-module imports use only declared public API exports
- **Flag** any import reaching into module internals (e.g., `modules/wireframe/components/internal/`)

## 2. Contract Implementation Check

Read the plan's `## Contracts` section:
- For each contract, verify declared exports exist in specified files
- Verify TypeScript types match contract shapes (read the actual .ts files)
- **Flag** missing or mismatched exports as gaps

## 3. Module CLAUDE.md Freshness

For each module affected by this phase:
- Check if new exports created during the phase are listed in the module's CLAUDE.md Public API
- If not: add to gaps as "CLAUDE.md needs update for [new export]"

## 4. Scope Compliance

```bash
# Verify no module agent committed files outside its declared ownership
git log --format="%H %s" -- "src/modules/{module}/" | head -20
```
Flag any commits that modified files outside the declared module ownership.
