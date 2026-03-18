# TypeScript Checklist

Verify TypeScript configuration and usage against FXL standards.

## Configuration

- [ ] **[Critical]** `strict: true` in tsconfig.json
- [ ] **[Important]** `noUnusedLocals: true` enabled
- [ ] **[Important]** `noUnusedParameters: true` enabled
- [ ] **[Important]** `noFallthroughCasesInSwitch: true` enabled
- [ ] **[Important]** `forceConsistentCasingInFileNames: true` enabled
- [ ] **[Normal]** `target: "ES2020"` or newer
- [ ] **[Normal]** `moduleResolution: "bundler"` for Vite projects
- [ ] **[Normal]** `isolatedModules: true` enabled
- [ ] **[Normal]** Path aliases configured in `paths`

## Type Safety

- [ ] **[Critical]** Zero uses of `any` type in source code
- [ ] **[Critical]** Zero `@ts-ignore` comments in source code
- [ ] **[Critical]** Zero `@ts-nocheck` comments in source code
- [ ] **[Critical]** `bunx tsc --noEmit` passes with zero errors
- [ ] **[Important]** Function parameters have explicit type annotations
- [ ] **[Important]** Return types are explicit for exported functions
- [ ] **[Important]** Props interfaces defined for all React components
- [ ] **[Normal]** `unknown` is used instead of `any` where type is truly unknown
- [ ] **[Normal]** Type guards are used to narrow `unknown` types

## Type Patterns

- [ ] **[Important]** Supabase query results are properly typed (not cast to `any`)
- [ ] **[Important]** API response types match contract definitions
- [ ] **[Important]** State types defined for `useState` with non-trivial state
- [ ] **[Normal]** Interface used for object shapes, type for unions/intersections
- [ ] **[Normal]** `const` assertions used for literal types where appropriate
- [ ] **[Normal]** Discriminated unions used for state machines (loading/success/error)

## Import Style

- [ ] **[Normal]** Type-only imports use `import type` syntax
- [ ] **[Normal]** Types are exported from dedicated `types/` files (not inline in components)
- [ ] **[Info]** Generic types are well-documented with JSDoc comments

## Common Anti-Patterns to Check For

- [ ] **[Critical]** No `as any` type assertions
- [ ] **[Important]** No `!` non-null assertions without justification
- [ ] **[Important]** No `// @ts-expect-error` without explanation comment
- [ ] **[Normal]** No overly broad types (`Record<string, any>`, `object`, `Function`)
- [ ] **[Normal]** No implicit `any` from missing type annotations

## How to Find Issues

```bash
# Find any usage
grep -rn "any" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "// any"

# Find ts-ignore
grep -rn "@ts-ignore\|@ts-nocheck\|@ts-expect-error" src/ --include="*.ts" --include="*.tsx"

# Find non-null assertions
grep -rn "!\\." src/ --include="*.ts" --include="*.tsx" | grep -v "!=" | grep -v "node_modules"

# Full type check
bunx tsc --noEmit
```

## Scoring

| Severity | Weight |
|----------|--------|
| Critical | 10 |
| Important | 5 |
| Normal | 2 |
| Info | 0 |
