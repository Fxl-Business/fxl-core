# Codebase Concerns

**Analysis Date:** 2026-03-06

## Tech Debt

**Dead Code: ProcessDocsViewer.tsx**
- Issue: `src/pages/docs/ProcessDocsViewer.tsx` imports from paths that no longer exist (`docs/process/`, `docs/wireframe/`, `docs/suporte/`). These directories were reorganized into `docs/processo/`, `docs/referencias/`, etc., but this file was never updated. It is not imported by any route or component -- purely dead code.
- Files: `src/pages/docs/ProcessDocsViewer.tsx`
- Impact: Adds 135 lines of unused code to the bundle. The imports reference non-existent paths (`../../../docs/process/POP_BI_PERSONALIZADO.md`, `../../../docs/wireframe/blocos_disponiveis.md`, `../../../docs/suporte/biblioteca_kpis.md`) which only work because Vite does not fail on unused `?raw` imports at build time if the module is tree-shaken. If anything ever imports this file again, it will break the build.
- Fix approach: Delete `src/pages/docs/ProcessDocsViewer.tsx` entirely. All doc rendering is handled by `src/pages/DocRenderer.tsx` via the `docs-parser.ts` system.

**Duplicate PromptBlock Components**
- Issue: Two independent `PromptBlock` components exist with overlapping purpose and nearly identical UI.
- Files: `src/components/ui/PromptBlock.tsx`, `src/components/docs/PromptBlock.tsx`
- Impact: Consumers must choose between two components that look almost the same but have subtle differences (the `ui/` version handles `async` clipboard and accepts a `className` prop; the `docs/` version uses `Button` from shadcn and does not await clipboard). New code risks importing the wrong one.
- Fix approach: Consolidate into a single `src/components/docs/PromptBlock.tsx` (since it is a domain-specific component, not a generic UI primitive). Migrate `src/pages/clients/FinanceiroContaAzul/Index.tsx` and `src/pages/docs/ProcessDocsViewer.tsx` (dead code) to use the consolidated version.

**Duplicate PageHeader Components**
- Issue: `src/components/docs/PageHeader.tsx` is exported but never imported anywhere. `src/components/docs/DocPageHeader.tsx` is the active version used by `DocRenderer.tsx`.
- Files: `src/components/docs/PageHeader.tsx`, `src/components/docs/DocPageHeader.tsx`
- Impact: Unused dead code (33 lines). Confusing for anyone adding new pages -- unclear which header to use.
- Fix approach: Delete `src/components/docs/PageHeader.tsx`.

**Unused InfoBlock Component**
- Issue: `src/components/docs/InfoBlock.tsx` is defined but never imported or used anywhere in `src/`.
- Files: `src/components/docs/InfoBlock.tsx`
- Impact: Dead code (41 lines). Contributes to confusion about which callout/alert component to use (`Callout` is the active one used by `DocRenderer`).
- Fix approach: Delete if the `Callout` component covers all use cases. If a `success` variant is needed later, it can be added to `Callout`.

**Hardcoded Navigation Structure**
- Issue: The sidebar navigation in `src/components/layout/Sidebar.tsx` is a 110-line manually maintained `const navigation` array. Every new doc page or client requires a manual edit to this array.
- Files: `src/components/layout/Sidebar.tsx` (lines 13-111)
- Impact: Navigation falls out of sync with actual docs. Adding a client requires editing both `App.tsx` (routes) and `Sidebar.tsx` (nav tree) manually. This is a scaling bottleneck as the doc count grows.
- Fix approach: Generate the sidebar navigation from `getAllDocPaths()` combined with frontmatter metadata, or introduce a `nav.config.ts` manifest that both sidebar and router consume.

**Hardcoded Client Routes in App.tsx**
- Issue: Every client page requires hand-coded routes in `src/App.tsx` with explicit imports. Adding a second client means duplicating 5+ routes and imports.
- Files: `src/App.tsx` (lines 5-8, 28-36)
- Impact: Does not scale. Each new client needs changes to `App.tsx`, `Sidebar.tsx`, and dedicated page components in `src/pages/clients/[slug]/`.
- Fix approach: Create a dynamic client page system (similar to `DocRenderer`) that reads client metadata and renders dynamically, or use a route config file.

**Inline Styles in WireframeViewer**
- Issue: `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` uses extensive inline `style={}` objects (12+ occurrences) instead of Tailwind classes, contradicting the project convention.
- Files: `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` (lines 14-72)
- Impact: Styling inconsistency. Harder to maintain. Breaks the Tailwind-everywhere convention established in the rest of the codebase.
- Fix approach: Convert all inline styles to Tailwind utility classes.

**`React.ReactNode` in Serializable Type**
- Issue: The `ClickableTableSection` type in `tools/wireframe-builder/types/blueprint.ts` includes `modalFooter?: React.ReactNode` in what is otherwise a purely data-driven, serializable blueprint config type.
- Files: `tools/wireframe-builder/types/blueprint.ts` (line 132)
- Impact: Breaks the declarative nature of the blueprint config. `React.ReactNode` cannot be serialized to JSON, making it impossible to store blueprints externally or generate them from non-React contexts.
- Fix approach: Replace with a data-driven footer config type (e.g., `{ totalLabel?: string; totalValue?: string }`) and render the `ReactNode` in the component layer.

## Known Bugs

**Blob URL Memory Leak in DocPageHeader**
- Symptoms: Each click of "Exibir Markdown" creates a new `Blob` URL via `URL.createObjectURL()` that is never revoked.
- Files: `src/components/docs/DocPageHeader.tsx` (lines 14-17)
- Trigger: User clicks "Exibir Markdown" button multiple times.
- Workaround: None. The leaked blob URLs persist until the page is fully reloaded.
- Fix: Store the blob URL in a `useRef` and call `URL.revokeObjectURL()` on cleanup or before creating a new one.

**Comment State Lost on Screen Switch**
- Symptoms: Comments added in `CommentOverlay` are stored only in React local state. Switching between wireframe screens or refreshing the page loses all comments.
- Files: `tools/wireframe-builder/components/CommentOverlay.tsx` (line 19)
- Trigger: Add a comment, then switch wireframe screens or reload the page.
- Workaround: None currently.
- Fix: Persist comments to `localStorage` keyed by `screenName`, or implement a backend persistence layer.

## Security Considerations

**No Content Security Policy**
- Risk: The app is a Vite SPA deployed to Vercel with no CSP headers configured.
- Files: `vercel.json`, `index.html`
- Current mitigation: None.
- Recommendations: Add a `Content-Security-Policy` header in `vercel.json` to restrict script sources. This matters especially since the app renders user-authored markdown content.

**Markdown XSS Surface**
- Risk: `react-markdown` is used throughout to render `.md` files. While `react-markdown` strips HTML by default, `remark-gfm` can introduce edge cases. Client docs are loaded from `clients/` and rendered without sanitization.
- Files: `src/components/docs/MarkdownRenderer.tsx`, `src/pages/clients/FinanceiroContaAzul/DocViewer.tsx`
- Current mitigation: `react-markdown` does not render raw HTML by default (no `rehype-raw` plugin is installed, which is good).
- Recommendations: Explicitly configure `rehype-sanitize` as defense-in-depth. Document that `rehype-raw` must never be added without sanitization.

**No Authentication or Access Control**
- Risk: The entire app (including client data, wireframes, and internal process docs) is publicly accessible once deployed to Vercel.
- Files: `vercel.json` (no auth config)
- Current mitigation: None beyond the Vercel deployment URL not being widely shared.
- Recommendations: Add Vercel password protection (Vercel Pro feature) or implement authentication. This is noted as a known TODO in `TODO.md`.

## Performance Bottlenecks

**Eager Loading of All Docs**
- Problem: `src/lib/docs-parser.ts` uses `import.meta.glob` with `eager: true`, loading all 45 markdown files into memory at application startup.
- Files: `src/lib/docs-parser.ts` (line 3)
- Cause: The `eager: true` flag in `import.meta.glob('/docs/**/*.md', { query: '?raw', import: 'default', eager: true })` forces all docs to be bundled into the initial chunk.
- Improvement path: Remove `eager: true` to enable lazy loading. Change `getDoc()` to be async and load docs on demand. This is not critical at 45 docs but will matter as content grows.

**No Code Splitting**
- Problem: The entire app is a single bundle. `ComponentGallery.tsx` (619 lines) with all 22 wireframe component imports is loaded even when the user visits the home page.
- Files: `src/App.tsx` (all imports are static), `src/pages/tools/ComponentGallery.tsx`
- Cause: No `React.lazy()` or dynamic imports are used anywhere.
- Improvement path: Use `React.lazy()` for route-level components, especially `ComponentGallery` and `FinanceiroWireframeViewer` which are heavy pages.

**Search Index Rebuilt on Every Mount**
- Problem: `buildSearchIndex()` parses all 45 docs synchronously on every `SearchCommand` mount. The `useMemo` with `[]` dependency only prevents re-computation within the same mount cycle but the function runs on every page navigation since `SearchCommand` lives inside `Layout`.
- Files: `src/components/layout/SearchCommand.tsx` (line 18), `src/lib/search-index.ts`
- Cause: `useMemo` with `[]` does recompute if the component remounts, which happens if `Layout` remounts.
- Improvement path: Since `Layout` is stable across navigations (it wraps `<Outlet />`), this is likely fine in practice. However, moving the index to a module-level singleton or context would be more robust.

## Fragile Areas

**docs-parser.ts Custom Tag Parser**
- Files: `src/lib/docs-parser.ts` (lines 50-126)
- Why fragile: The custom tag parser uses a hand-written regex-based state machine to parse `{% tag %}` blocks. It does not handle nested tags of the same type, malformed closing tags silently drop content, and the regex `TAG_REGEX` uses `lastIndex` mutation with a global regex (a known source of subtle bugs in JavaScript).
- Safe modification: Always test with all existing doc files after changes. Add the missing test suite (none exists).
- Test coverage: Zero. No tests exist for `parseBody()`, `extractFrontmatter()`, or `extractHeadings()`.

**Blueprint Config (1158-line Data File)**
- Files: `clients/financeiro-conta-azul/wireframe/blueprint.config.ts` (1158 lines)
- Why fragile: This is a single massive TypeScript file containing all wireframe screen data for a client. Any typo in deeply nested config objects is caught only by TypeScript types, not runtime validation. Adding new screen sections requires understanding the `BlueprintSection` discriminated union in `tools/wireframe-builder/types/blueprint.ts`.
- Safe modification: Run `npx tsc --noEmit` after every change. Consider adding a runtime validation layer (e.g., Zod schema).
- Test coverage: Zero.

**Sidebar Navigation Array**
- Files: `src/components/layout/Sidebar.tsx` (lines 13-111)
- Why fragile: The navigation tree is a hand-maintained nested array. It is easy to add a doc page without updating the sidebar, or to have a sidebar link to a doc that does not exist. No validation exists to catch mismatches.
- Safe modification: Verify every `href` value exists as a valid route after edits.
- Test coverage: Zero.

## Scaling Limits

**Client System Architecture**
- Current capacity: 1 client (`financeiro-conta-azul`)
- Limit: Adding a second client requires: (1) new directory in `clients/`, (2) new dedicated pages in `src/pages/clients/[slug]/`, (3) new explicit routes in `src/App.tsx`, (4) new sidebar entries in `Sidebar.tsx`. Approximately 5-6 files to touch per client.
- Scaling path: Create a generic client page system with dynamic routing (e.g., `/clients/:slug/:doc`) and a client registry config file.

**Docs Volume**
- Current capacity: 45 markdown files loaded eagerly.
- Limit: At 200+ docs, the initial bundle size and search index build time will become noticeable.
- Scaling path: Switch `import.meta.glob` to lazy mode. Implement search indexing at build time rather than runtime.

## Dependencies at Risk

**No Lockfile Committed**
- Risk: `package-lock.json` is in `.gitignore`. This means every `npm install` (including CI/CD on Vercel) may resolve different dependency versions, leading to non-reproducible builds.
- Impact: Subtle, hard-to-debug inconsistencies between local and deployed builds. A patch update in any dependency could break production without any code change.
- Migration plan: Remove `package-lock.json` from `.gitignore` and commit it. This is standard practice for application repositories (as opposed to libraries).

**No Linter or Formatter Configured**
- Risk: There is no ESLint, Prettier, Biome, or any other code quality tool configured. The only check is `npx tsc --noEmit`.
- Impact: Code style drifts over time. No automated detection of common mistakes (unused imports, accessibility issues, React hook rule violations). Multiple contributors (human + AI) will produce inconsistent code.
- Migration plan: Add ESLint with `@typescript-eslint` and the React plugin. Add Prettier for formatting. Configure as a pre-commit check.

## Missing Critical Features

**No Error Boundaries**
- Problem: The app has no `ErrorBoundary` components. If any component throws during render (e.g., malformed markdown, missing blueprint config), the entire app crashes with a white screen.
- Blocks: Reliable usage in production. A single bad markdown file can take down the whole app.
- Fix: Add a root-level `ErrorBoundary` in `App.tsx` and route-level boundaries around `DocRenderer` and `BlueprintRenderer`.

**No Loading States**
- Problem: No `Suspense` boundaries, skeleton loaders, or loading indicators exist. Noted as a TODO in `TODO.md` ("Skeleton Loading"). Since all content is currently bundled eagerly, this is not visible yet but will be required when lazy loading or async data fetching is introduced.
- Blocks: Future code splitting and async data loading.

**No 404 Route**
- Problem: Navigating to an undefined route shows the `Layout` shell with an empty content area. There is no catch-all `*` route in `App.tsx`.
- Blocks: User experience for mistyped URLs.
- Fix: Add a `<Route path="*" element={<NotFound />} />` inside the `Layout` routes.

## Test Coverage Gaps

**Entire Codebase: Zero Tests**
- What's not tested: The project contains zero test files. No unit tests, integration tests, or e2e tests exist.
- Files: Every file in `src/`, `tools/`, `clients/`
- Risk: Any refactoring (e.g., consolidating duplicate components, changing the docs parser, modifying blueprint types) has no safety net. Regressions can only be caught manually.
- Priority: High. The most impactful first tests would cover:
  1. `src/lib/docs-parser.ts` -- the custom tag parser is complex hand-written logic
  2. `tools/wireframe-builder/components/sections/SectionRenderer.tsx` -- the discriminated union dispatch logic
  3. `src/lib/search-index.ts` -- index building from real docs

---

*Concerns audit: 2026-03-06*
