# Testing Patterns

**Analysis Date:** 2026-03-06

## Test Framework

**Runner:**
- No test runner is installed or configured
- No `jest`, `vitest`, `@testing-library/react`, or any other test dependency exists in `package.json`
- No test configuration files (`jest.config.*`, `vitest.config.*`, `playwright.config.*`) exist

**Assertion Library:**
- None installed

**Run Commands:**
```bash
# No test commands exist. The only validation is:
npx tsc --noEmit     # TypeScript type checking (the sole quality gate)
make lint            # Alias for tsc --noEmit
npm run build        # Runs tsc --noEmit then vite build
```

## Test File Organization

**Location:**
- No test files exist anywhere in the codebase
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files
- No `__tests__/` directories
- No `tests/` or `test/` top-level directory

**Naming:**
- Not applicable — no conventions established

## Test Structure

**No tests exist.** The project relies entirely on TypeScript strict mode (`strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`) as its only automated quality check.

## Mocking

**Framework:** None

**Patterns:**
- Mock data for component gallery previews exists at `src/pages/tools/galleryMockData.ts`
- This file contains exported constants used by `src/pages/tools/ComponentGallery.tsx` for visual demo purposes
- These are NOT test mocks — they are runtime preview data for the component gallery page
- Example pattern:

```typescript
// src/pages/tools/galleryMockData.ts
export const kpiCardMock = {
  label: 'Faturamento Bruto',
  value: 'R$ 1.250.000',
  variation: '+12,5%',
  variationPositive: true,
  description: 'Acumulado no periodo',
}
```

## Fixtures and Factories

**Test Data:**
- No test fixtures or factory patterns exist
- Client wireframe data lives in `clients/financeiro-conta-azul/wireframe/blueprint.config.ts` as a typed config object — this is production data, not test data

**Location:**
- Not applicable

## Coverage

**Requirements:** None enforced. No coverage tooling installed.

**View Coverage:**
```bash
# Not available — no test runner configured
```

## Test Types

**Unit Tests:**
- Not present. Key candidates for unit testing if introduced:
  - `src/lib/docs-parser.ts` — `extractFrontmatter()`, `parseBody()`, `extractHeadings()`, `getDoc()` are pure functions with clear inputs/outputs
  - `src/lib/search-index.ts` — `buildSearchIndex()` aggregates parsed docs
  - `src/lib/utils.ts` — `cn()` utility (though this is a trivial wrapper)

**Integration Tests:**
- Not present. Key candidates:
  - `src/pages/DocRenderer.tsx` — renders parsed markdown with custom tags
  - `tools/wireframe-builder/components/sections/SectionRenderer.tsx` — renders blueprint sections by type discriminant

**E2E Tests:**
- Not present. No Playwright, Cypress, or similar framework installed.

## Recommended Test Setup (If Introducing Tests)

Based on the existing stack (Vite 5 + React 18 + TypeScript 5), the natural fit would be:

**Framework:** Vitest (native Vite integration, same config structure)

**Config location:** `vitest.config.ts` at project root

**Test file placement:** Co-located with source files
- `src/lib/docs-parser.test.ts` alongside `src/lib/docs-parser.ts`
- `src/components/docs/Callout.test.tsx` alongside `src/components/docs/Callout.tsx`

**Naming convention:** `*.test.ts` / `*.test.tsx` (matching Vitest defaults)

**Dependencies to add:**
```json
{
  "devDependencies": {
    "vitest": "^2.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "jsdom": "^25.x"
  }
}
```

**Priority test targets:**
1. `src/lib/docs-parser.ts` — Core parsing logic, pure functions, high value
2. `tools/wireframe-builder/types/blueprint.ts` — Type-level validation only (no runtime to test, but type assertions useful)
3. `src/lib/search-index.ts` — Depends on docs-parser, good integration test candidate

## Current Quality Gates

The only automated quality mechanism is the TypeScript compiler:

```bash
npx tsc --noEmit
```

This catches:
- Type errors
- Unused variables and parameters
- Missing imports
- Incorrect prop usage on components
- Switch fallthrough cases

This does NOT catch:
- Runtime behavior correctness
- Edge cases in parsing logic (e.g., malformed frontmatter, nested custom tags)
- UI rendering correctness
- Regression bugs

---

*Testing analysis: 2026-03-06*
