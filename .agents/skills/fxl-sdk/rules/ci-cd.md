# GitHub Actions CI/CD Setup

## When to Use

Setting up continuous integration for an FXL spoke project. This rule covers GitHub Actions workflow configuration and the `fxl-doctor.sh` health check script.

## Files to Create

### 1. fxl-doctor.sh

The health check script that runs in CI and can be run locally. Copy from `templates/fxl-doctor.sh.template`.

This script checks:
- TypeScript compilation (`npx tsc --noEmit`)
- ESLint (`npx eslint .`)
- Prettier formatting (`npx prettier --check .`)
- Security headers in `vercel.json`
- Contract version in `package.json`

Make it executable:
```bash
chmod +x fxl-doctor.sh
```

### 2. .github/workflows/ci.yml

Copy from `templates/ci.yml.template`. The workflow runs on:
- Every push to `main`
- Every pull request targeting `main`

Steps:
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Run `fxl-doctor.sh`
5. Run build (`npm run build`)

### 3. Branch Protection (Manual)

After CI is running, configure branch protection on GitHub:
1. Go to Settings > Branches > Add rule
2. Branch name pattern: `main`
3. Enable:
   - Require status checks to pass before merging
   - Require the CI check to pass
   - Require pull request reviews (optional for solo dev)

## CI Workflow Details

```yaml
name: FXL Doctor CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run FXL Doctor
        run: bash fxl-doctor.sh

      - name: Build
        run: npm run build
```

## What fxl-doctor.sh Checks

### Type Check
```bash
npx tsc --noEmit
```
Zero TypeScript errors. This is the primary gate.

### Lint
```bash
npx eslint .
```
Zero ESLint errors. Warnings are allowed but should be addressed.

### Formatting
```bash
npx prettier --check .
```
All files formatted correctly. Run `npx prettier --write .` to fix.

### Security Headers
Validates that `vercel.json` contains required security headers:
- `X-Frame-Options`
- `X-Content-Type-Options`

### Contract Version
Validates that `package.json` contains `fxlContractVersion` field with minimum version `1.0`.

## Adding Custom Checks

To add project-specific checks, extend `fxl-doctor.sh`:

```bash
# Add after the standard checks

# Example: check for TODO comments
echo "Checking for TODO comments..."
if grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules; then
  echo "WARNING: Found TODO comments (not blocking)"
fi

# Example: check migration files exist
echo "Checking migrations..."
if [ ! -d "supabase/migrations" ] || [ -z "$(ls -A supabase/migrations)" ]; then
  echo "ERROR: No Supabase migrations found"
  exit 1
fi
```

## Troubleshooting

### CI fails but local passes
- Check Node.js version matches (18)
- Run `npm ci` locally (not `npm install`) to match CI lockfile behavior
- Check that `.env.local` values are not required for type-check/build

### Type errors in CI only
- Likely a missing type dependency. Check `devDependencies` in `package.json`
- Run `npx tsc --noEmit` locally with a clean `node_modules/` (delete and reinstall)

### Build fails in CI
- Vite build requires all imports to resolve
- Check for dynamic imports that depend on runtime env vars
- Use `import.meta.env.VITE_*` pattern (not `process.env`)
