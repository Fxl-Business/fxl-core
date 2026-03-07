# Coding Conventions

**Analysis Date:** 2026-03-06

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` (e.g., `KpiCard.tsx`, `DocBreadcrumb.tsx`, `BlueprintRenderer.tsx`)
- Utility/library modules: camelCase `.ts` (e.g., `docs-parser.ts`, `search-index.ts`, `utils.ts`)
- shadcn/ui primitives: kebab-case `.tsx` (e.g., `button.tsx`, `badge.tsx`, `scroll-area.tsx`)
- Type definition files: camelCase `.ts` (e.g., `blueprint.ts`)
- CSS: kebab-case (e.g., `globals.css`)
- Config files: kebab-case with dot-prefix where conventional (e.g., `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`)
- Mock data files: camelCase `.ts` (e.g., `galleryMockData.ts`)
- Client blueprint configs: kebab-case `.ts` (e.g., `blueprint.config.ts`)

**Functions:**
- Use camelCase for all functions: `extractFrontmatter`, `parseBody`, `handleCopy`, `buildSearchIndex`
- React components use PascalCase function names: `export default function KpiCard()`
- Event handlers prefix with `handle`: `handleCopy`, `handleAdd`, `handleSelect`
- State-setter callbacks use `set` prefix: `setOpen`, `setDraft`, `setActiveIndex`
- Boolean checkers prefix with `has`/`is`: `hasActiveChild`, `hasCompareOnly`

**Variables:**
- camelCase for all variables: `activeCount`, `comparePeriod`, `docFiles`
- Constants use UPPER_SNAKE_CASE only for static lookup maps: `STATUS_COLORS`, `MESES`, `TAG_REGEX`
- Inline config objects use camelCase: `quickActions`, `navigation`, `categories`
- Boolean state: descriptive adjective or verb — `open`, `copied`, `expanded`

**Types:**
- Use PascalCase for all type aliases and interfaces: `DocFrontmatter`, `BlueprintScreen`, `NavItem`
- Props types use either `Props` (when component-local) or `{ComponentName}Props` when exported: `PhaseCardProps`, `ButtonProps`, `BadgeProps`
- Discriminated unions use a `type` field as discriminant: `DocSection`, `BlueprintSection`
- Prefer `type` over `interface` for component props; use `interface` only for extending HTML element attributes (shadcn/ui pattern)

## Code Style

**Formatting:**
- No Prettier or ESLint configured at project level
- Consistent 2-space indentation throughout
- Single quotes for string literals in TypeScript (e.g., `'react-router-dom'`)
- Double quotes only in shadcn/ui generated components (e.g., `"inline-flex items-center..."`)
- No semicolons at end of statements in app code
- Semicolons present in shadcn/ui generated code — do not normalize, leave as-is
- Trailing commas in multi-line arrays, objects, and function parameters
- Max line length is not enforced, but lines rarely exceed ~120 characters

**Linting:**
- TypeScript compiler is the only linting tool: `npx tsc --noEmit`
- `strict: true` is enforced in `tsconfig.json`
- `noUnusedLocals: true` and `noUnusedParameters: true` are enforced
- `noFallthroughCasesInSwitch: true` is enforced
- Never use `any` — this is an explicit project rule in `CLAUDE.md`
- Zero TypeScript errors is the acceptance condition for any task

**Validation command:**
```bash
npx tsc --noEmit     # Must produce zero errors
make lint            # Alias for the same
```

## Import Organization

**Order:**
1. React core imports (`import { useState } from 'react'`, `import type { ReactNode } from 'react'`)
2. Third-party library imports (`react-router-dom`, `react-markdown`, `lucide-react`, `yaml`, `class-variance-authority`)
3. Path-aliased internal imports (`@/components/...`, `@/lib/...`, `@tools/...`, `@clients/...`)
4. Relative imports (used sparingly, mainly in deeply nested tool components)
5. Raw file imports for markdown (`import briefingRaw from '...briefing.md?raw'`)

**Path Aliases:**
- `@/*` maps to `src/*` — use for all src-internal imports
- `@tools/*` maps to `tools/*` — use for wireframe-builder and future tools
- `@clients/*` maps to `clients/*` — use for client-specific data/configs
- Defined in both `tsconfig.json` and `vite.config.ts`

**Type-only imports:**
- Use `import type { ... }` for type-only imports: `import type { DocSection } from '@/lib/docs-parser'`
- Use `import type { ReactNode } from 'react'` instead of `import { type ReactNode } from 'react'`

**Example (canonical import block):**
```typescript
import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { DocHeading } from '@/lib/docs-parser'
```

## Component Patterns

**Export style:**
- Use `export default function ComponentName()` for all components
- One component per file (except small private helpers within the same file)
- shadcn/ui components use named exports: `export { Button, buttonVariants }`

**Props pattern:**
- Define a `type Props = { ... }` above the component for local props
- Destructure props in the function signature: `function Callout({ type = 'info', content }: Props)`
- Provide default values via destructuring, not via `defaultProps`
- Accept `className?: string` on components that wrap styled elements
- Use `children: ReactNode` for wrapper components

**Example (canonical component):**
```typescript
import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: string
  variation?: string
  variationPositive?: boolean
}

export default function KpiCard({ label, value, variation, variationPositive = true }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
      {variation && (
        <span className={cn(
          'mt-1.5 inline-block rounded px-1.5 py-0.5 text-xs font-medium',
          variationPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
        )}>
          {variation}
        </span>
      )}
    </div>
  )
}
```

**Discriminated union rendering:**
- Use `switch` statements on the `type` field for rendering section types
- Pattern used in `src/pages/DocRenderer.tsx` (SectionRenderer) and `tools/wireframe-builder/components/sections/SectionRenderer.tsx`

```typescript
function SectionRenderer({ section }: { section: DocSection }) {
  switch (section.type) {
    case 'markdown':
      return <MarkdownRenderer content={section.content} />
    case 'prompt':
      return <PromptBlock label={section.label} prompt={section.content} />
    case 'callout':
      return <Callout type={section.variant} content={section.content} />
    default:
      return null
  }
}
```

## Styling Conventions

**Approach:**
- Tailwind CSS utility classes are the primary styling mechanism
- Use `cn()` helper from `@/lib/utils` for conditional class merging (wraps `clsx` + `tailwind-merge`)
- shadcn/ui uses `class-variance-authority` (cva) for variant-based styling
- Custom CSS tokens defined as HSL CSS variables in `src/styles/globals.css`
- Brand colors under `fxl.*` namespace: `fxl-navy`, `fxl-navy-light`, `fxl-navy-dark`, `fxl-blue`, `fxl-blue-muted`
- Wireframe tool components (`tools/wireframe-builder/`) use inline `style={{}}` objects instead of Tailwind — this is intentional for wireframe fidelity

**Color palette usage:**
- `text-fxl-navy` / `bg-fxl-navy` for primary brand elements (headers, active nav, badges)
- `text-muted-foreground` for secondary text
- `text-foreground` for primary text
- `border-border` for standard borders
- `bg-muted` for subtle backgrounds
- Semantic colors: `text-green-700`, `text-red-700`, `text-amber-700` for status indicators

**Tailwind class ordering:**
- Layout first (`flex`, `items-center`, `gap-*`, `w-*`, `h-*`)
- Spacing (`px-*`, `py-*`, `p-*`, `m-*`)
- Typography (`text-*`, `font-*`, `tracking-*`, `leading-*`)
- Decoration (`rounded-*`, `border-*`, `bg-*`, `shadow-*`)
- State/transitions (`transition-*`, `hover:*`)

**Font sizing:**
- Component text defaults to `text-xs` (12px) throughout the app
- Headings: `text-2xl` for page titles, `text-xl` for section titles, `text-sm`/`text-base` for subtitles
- Labels/badges: `text-[10px]` or `text-xs`

## Error Handling

**Patterns:**
- Null-check rendering: components return fallback UI when data is missing (not exceptions)
- Pattern in `src/pages/DocRenderer.tsx`: check `if (!doc)` and render a "not found" message
- Pattern in `src/pages/clients/FinanceiroContaAzul/DocViewer.tsx`: check `if (!entry)` and render error text
- No try/catch blocks exist in the codebase — this is a React rendering app with no async data fetching
- Clipboard API calls (`navigator.clipboard.writeText`) are fire-and-forget with no error boundary

**Null coalescing:**
- Use `??` for fallback defaults: `entry.badge || 'Outros'`, `(attrs.label as string) || ''`
- Non-null assertion (`!`) used sparingly: only for root element (`document.getElementById('root')!`) and known-present nav items (`homeItem.href!`)

## Logging

**Framework:** None

**Patterns:**
- No console.log, console.warn, or console.error calls exist in the codebase
- No logging library is installed
- No error tracking or monitoring service is integrated

## Comments

**When to Comment:**
- Block comments (`//`) for section dividers in JSX: `{/* Home */}`, `{/* Main content */}`, `{/* Right TOC */}`
- Single-line comments for navigation structure context: `// Leaf node (no children, has href)`
- Separator comments in data config files: `// --- Section types (discriminated union) ---`
- Migration notes in index files: `// Migrado para Blueprint declarativo em 2026-03-06`
- Comments are in Portuguese for business context, English for technical annotations

**JSDoc/TSDoc:**
- Not used anywhere in the codebase
- Type annotations on functions serve as self-documentation

## Function Design

**Size:** Functions are short. Most component functions are under 50 lines of JSX. Utility functions in `src/lib/docs-parser.ts` are the longest at ~30 lines each.

**Parameters:** Props are passed as a single object, destructured in the function signature. Utility functions take explicit positional parameters.

**Return Values:** Components always return JSX (or `null` for conditional rendering). Utility functions return typed values. No callbacks with error-first pattern.

## Module Design

**Exports:**
- One default export per component file
- Named exports for shadcn/ui components that also export their variant config: `export { Button, buttonVariants }`
- Utility files export multiple named functions: `export function getDoc()`, `export function getAllDocPaths()`
- Type exports are co-located with their related functions

**Barrel Files:**
- Minimal barrel file usage: only `tools/wireframe-builder/components/sections/index.ts` re-exports `SectionRenderer`
- Client wireframe index re-exports the blueprint config: `clients/financeiro-conta-azul/wireframe/index.tsx`
- No barrel files in `src/components/` — import each component directly

## Commit Convention

Per `CLAUDE.md`, follow this commit message pattern:
- `docs: [description]` for changes in `docs/`
- `[client-slug]: [description]` for client changes (e.g., `financeiro-conta-azul: add wireframe screen`)
- `tool([name]): [description]` for tool changes (e.g., `tool(wireframe-builder): add KpiCardFull`)
- `app: [description]` for `src/` changes
- `infra: [description]` for structural/config changes

## Language

- UI text is in Portuguese (Brazilian): "Pesquisar docs...", "Nenhum resultado encontrado", "Copiado"
- Code identifiers (variables, functions, types) are in English: `handleCopy`, `buildSearchIndex`, `ParsedDoc`
- Comments mix Portuguese (business context) and English (technical)
- File and directory names are in English, except where they mirror Portuguese business terms

---

*Convention analysis: 2026-03-06*
