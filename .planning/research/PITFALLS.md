# Domain Pitfalls

**Domain:** Automated BI dashboard generation from declarative BlueprintConfig specifications
**Researched:** 2026-03-07
**Confidence:** HIGH (grounded in codebase analysis + verified stack specifics)

## Critical Pitfalls

### Pitfall 1: Conflating Wireframe Shape with Data Shape

**What goes wrong:**
The existing BlueprintConfig contains hardcoded display values (`value: 'R$ 485.200'`, `variation: '8,3% vs Fev/2026'`). The generation system naively maps these static wireframe fields into generated code as if they were the data model. The result is a dashboard that renders once with dummy data but cannot compute real numbers from imported data.

**Why it happens:**
BlueprintConfig was designed for wireframe rendering. Its types (`KpiConfig`, `CalculoRow`) describe visual layout, not data semantics. A `KpiConfig.value` is a formatted string, not a reference to a query or calculation.

**Consequences:**
Generated dashboards display correctly with seed data but break when filters change. KPI values are hardcoded strings in components instead of computed from queries. Comparisons show identical values in both columns.

**Prevention:**
Create an explicit TechnicalConfig layer that maps each BlueprintConfig element to its data semantics. For every section: `dataSource`, `computation`, `periodBinding`, `formatSpec`. The TechnicalConfig is a separate type system that references BlueprintConfig sections but adds the data layer.

**Detection:**
- KPI values do not change when the period selector changes
- Compare mode shows the same numbers in both columns
- The word "R$" appears as a literal string in generated component files

---

### Pitfall 2: The "Compare Mode" Complexity Explosion

**What goes wrong:**
Compare mode is deeply embedded in 8 of 10 screens. In wireframes it is visual (show/hide a column). In a real system it means: fetch data for TWO periods, align by dimension, compute deltas, handle categories existing in one period but not the other, and apply inverted color logic for cost lines (Tela 1 blueprint: "lines with operator `(-)` use inverted color logic").

**Why it happens:**
Compare mode looks simple in the wireframe toggle. But the data logic is fundamentally different. The blueprint doc for Tela 1 alone has a multi-paragraph rule about color inversion for subtraction lines in CalculoCard. This domain-specific business logic cannot be inferred from types alone.

**Consequences:**
Comparisons show wrong signs (costs going up shown in green). Categories existing in period A but not B cause blank rows or crashes. Developer manually fixing compare logic in 8+ screens after generation.

**Prevention:**
1. Treat compare mode as first-class in TechnicalConfig. For each section: what is "period A", what is "period B", the alignment strategy, and delta computation rules including `invertedCostLines`.
2. Build `useCompareData()` as a shared hook in the generated project, not inline logic per component.
3. Encode business rules like cost-inversion in TechnicalConfig per section.

**Detection:**
- Toggle compare mode and check if cost reductions are shown in green (correct) vs red (wrong)
- Navigate to a period with fewer categories than the comparison period

---

### Pitfall 3: Generating Monolithic Components

**What goes wrong:**
The generator produces one large component per screen (500+ lines) with all KPIs, charts, tables, and data-fetching inline. This mirrors BlueprintConfig structure but produces unmaintainable code that violates FXL's 150-line component limit.

**Why it happens:**
BlueprintConfig is organized as `screens[].sections[]` -- a flat list per screen. The simplest generation strategy mirrors `BlueprintRenderer.tsx`. But the wireframe renderer has no data-fetching, no state management, no error handling. A real dashboard component is much more complex.

**Prevention:**
Generate a layered architecture per screen:
1. **Data layer**: custom hooks per data concern (`useResultadoMensal()`)
2. **Section components**: one per section type, receiving data via props
3. **Screen orchestrator**: thin page that composes hooks and sections
Follow the 150-line rule from `premissas-gerais.md`.

**Detection:**
Generated files exceeding 200 lines. Data-fetching logic mixed with rendering.

---

### Pitfall 4: Underestimating the Upload/ETL Pipeline

**What goes wrong:**
The generator treats Tela 9 (Upload) as a simple file upload form. In reality, it is the entire data foundation. Behind the simple config lies: parsing XLS/XLSX/CSV with varying column orders, validating columns, normalizing category names, handling Brazilian date formats, converting `R$ 1.234,56` to numbers, detecting duplicates, and structuring data for all dashboard queries.

**Why it happens:**
Dashboard screens are visually impressive. Upload screens are boring. The BlueprintConfig for upload is minimal (`type: 'upload-section'`). But all other screens depend on correctly ingested data.

**Consequences:**
Dashboard screens are "done" but show placeholder data. Upload works with the test file but fails on real Conta Azul exports. Category-to-group mapping has no data to map.

**Prevention:**
1. TechnicalConfig must include `dataIngestion` section specifying: expected columns, validation rules, normalization pipeline, target table, and conflict resolution.
2. Build upload as the FIRST functional piece, not the last.
3. Use Next.js Route Handlers for server-side parsing -- not client-side JavaScript. File parsing with xlsx in the browser is slow and fragile for large files.

**Detection:**
- Dashboard screens show "no data" after generation
- Upload works with the team's test file but fails on real exports

---

### Pitfall 5: Supabase Schema Without RLS from Day One

**What goes wrong:**
The generator creates Supabase migrations for tables but defers RLS policies to "later." Tables without RLS allow any authenticated user to see all data. Retrofitting RLS onto tables with existing queries is significantly harder because queries that worked without RLS may fail or return wrong results with RLS.

**Why it happens:**
RLS policies are security infrastructure with no visible UI impact. AI-assisted code generation is particularly prone to skipping RLS. The `seguranca.md` checklist warns about this explicitly.

**Prevention:**
1. Every migration template MUST include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and policies. Non-negotiable generator invariant.
2. TechnicalConfig declares access model (per-user, per-organization). Generator selects correct RLS template from existing patterns in `docs/build/techs/supabase.md`.
3. Add automated check: scan migrations, fail if any `CREATE TABLE` lacks corresponding RLS.

**Detection:**
- Generated migrations contain `CREATE TABLE` without `ENABLE ROW LEVEL SECURITY`
- "Everything works" during development with no test for cross-user isolation

---

### Pitfall 6: Generator Tightly Coupled to Pilot Client

**What goes wrong:**
The generator works for `financeiro-conta-azul` but fails for the next client. Templates are unconsciously tuned to the pilot's specific combination of sections, filters, and domain logic (DRE structure, margin calculations, Conta Azul formats).

**Why it happens:**
Building with one example makes it impossible to distinguish "how all BI dashboards work" from "how this specific financial dashboard works."

**Prevention:**
1. Design around the BlueprintConfig type system (15 section types), not the pilot's config.
2. Before building, write a minimal second BlueprintConfig for a hypothetical different client as a design validation exercise.
3. Separate domain logic (financial calculations) from structural generation (layout, navigation, filters).

**Detection:**
- Generator code contains `if (slug === 'financeiro-conta-azul')`
- Adding a new section type requires touching more than one file

---

### Pitfall 7: Configuracoes Screen Disconnected from Other Screens

**What goes wrong:**
Tela 10 (Configuracoes) is treated as "just another CRUD screen." But it controls business logic across ALL screens: expense groups determine DRE structure, bank mappings affect cash flow, semaphore thresholds control KPI colors, category-to-group bindings drive the financial model.

**Why it happens:**
In BlueprintConfig, Configuracoes is just another screen with `config-table` sections. No indication its data feeds other screens.

**Prevention:**
1. TechnicalConfig must declare cross-screen dependencies (`crossScreenDeps`).
2. Generated project uses shared `useAppConfig()` hook consumed by all dependent screens.
3. Config tables generate CRUD operations, not just display components.

**Detection:**
- Changing a semaphore threshold does not update KPI colors in other screens
- Adding an expense group does not appear in DRE drill-down options

---

### Pitfall 8: Next.js 16 Specifics Mishandled

**What goes wrong:**
The generator produces Next.js code using patterns from older versions. Specifically: Pages Router patterns instead of App Router, `getServerSideProps` instead of async Server Components, missing `await` on `params` in Route Handlers, or client-side Supabase auth instead of cookie-based `@supabase/ssr`.

**Why it happens:**
Most Next.js examples online and in training data are from v12-14 era. Next.js 16 has significant API changes: `context.params` is now a Promise (must be awaited), Turbopack is the default bundler, `next build` no longer runs linter, and the recommended auth pattern uses `@supabase/ssr` with middleware.

**Consequences:**
Generated Route Handlers fail at runtime because `params` is not awaited. Auth breaks because tokens are stored in localStorage instead of httpOnly cookies. Build warnings flood the console because Webpack patterns are used instead of Turbopack.

**Prevention:**
1. All generator templates must use Next.js 16 App Router patterns exclusively.
2. Route Handler templates must `await params` (verified in official docs: `const { team } = await params`).
3. Auth must use `@supabase/ssr` with middleware pattern, not client-side `onAuthStateChange`.
4. Templates must not reference `getServerSideProps`, `getStaticProps`, or `pages/` directory.

**Detection:**
- TypeScript errors about `Promise<{ slug: string }>` not assignable to `string`
- Auth state lost on page refresh (indicates localStorage, not cookies)
- `next build` produces warnings about deprecated patterns

---

## Moderate Pitfalls

### Pitfall 9: Brazilian Number/Date Format Handling

**What goes wrong:**
Data imported from Conta Azul uses Brazilian formats (`1.234,56` for numbers, `DD/MM/YYYY` for dates). The normalization pipeline either ignores this or handles it inconsistently, producing NaN values or incorrect dates.

**Prevention:**
1. Normalization rules in TechnicalConfig per column. Generate `parse-brl` and `parse-date-br` utilities in the output project's `lib/format.ts`.
2. Use `Intl.NumberFormat('pt-BR')` for formatting display values. Store raw numbers (not formatted strings) in Supabase.
3. Use `date-fns` with `pt-BR` locale for date operations.

### Pitfall 10: Recharts Version Mismatch

**What goes wrong:**
FXL Core uses recharts 2.13.3. Generated projects should use recharts 3.8.0 (current). The wireframe-builder component patterns may not work identically in recharts 3.x due to API changes between major versions.

**Prevention:**
1. Pin recharts@3.8.0 in generated `package.json`. Do NOT use semver ranges.
2. Test each chart type (bar, line, donut, waterfall, pareto) with recharts 3.x before using templates.
3. The wireframe-builder components are reference implementations, not copy-paste targets. Generated components should follow recharts 3.x API.

### Pitfall 11: Filter State Lost on Navigation

**What goes wrong:**
User configures period filter on DRE screen, navigates to Receita, period resets to default. User enables compare mode, navigates away, compare mode turns off.

**Prevention:**
1. Use nuqs@2.8.9 for URL-based filter state. Filters are part of the URL, preserved across navigation.
2. Compare mode state should also be URL-encoded.
3. Generate a shared filter context that nuqs hooks into.

### Pitfall 12: Empty State After Deployment

**What goes wrong:**
User opens the generated dashboard after setup. All 10 screens show blank. User thinks the dashboard is broken.

**Prevention:**
Generate an onboarding flow: detect zero-data state, show "Upload your first report" call-to-action on every empty screen. The EmptyState component should link directly to Tela 9 (Upload).

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| TechnicalConfig schema design | Conflating wireframe types with data types (Pitfall 1) | Separate type systems. TechnicalConfig references BlueprintConfig but adds data semantics. |
| Config Resolver implementation | Missing cross-reference validation | Validate every section->dataSource binding. Fail fast with clear errors. |
| Next.js scaffold generation | Using wrong Next.js patterns (Pitfall 8) | All templates verified against Next.js 16.1.6 docs. Route Handlers await params. App Router only. |
| Upload/ETL pipeline | Underestimating complexity (Pitfall 4) | Build upload FIRST. Server-side parsing via Route Handlers. Validate with real Conta Azul exports. |
| Dashboard screen generation | Monolithic components (Pitfall 3) | Enforce 150-line limit. Generate hooks, sections, and orchestrators separately. |
| Compare mode implementation | Complexity explosion (Pitfall 2) | Shared `useCompareData()` hook. Cost-inversion rules in TechnicalConfig. |
| Supabase migration generation | Missing RLS (Pitfall 5) | Automated check. Every CREATE TABLE has ENABLE ROW LEVEL SECURITY. |
| Configuracoes (Tela 10) generation | Disconnected from other screens (Pitfall 7) | Cross-screen deps in TechnicalConfig. Shared `useAppConfig()` hook. |
| Second client onboarding | Generator rigidity (Pitfall 6) | Synthetic second BlueprintConfig as design validation. Section-type dispatch. |

## "Looks Done But Isn't" Checklist

- [ ] **KPI Cards:** Sparklines update with real data, not static arrays from BlueprintConfig
- [ ] **Compare Mode:** Comparison shows actual calculated differences, not hardcoded variation strings
- [ ] **Compare Mode:** Cost-inversion colors are correct (cost decrease = green)
- [ ] **Drill-down Tables:** Expanding a parent row fetches real sub-rows
- [ ] **Upload Screen:** Missing columns show specific validation errors, not a generic crash
- [ ] **Filters:** Changing a filter re-fetches data from Supabase with new parameter
- [ ] **Config Tables:** CRUD persists to Supabase, not just local state
- [ ] **Semaphore Colors:** Read from Configuracoes table, not from BlueprintConfig
- [ ] **Period Selector:** Defaults to current month dynamically (`new Date()`)
- [ ] **Skeleton Loading:** Every data-dependent component shows skeleton during loading
- [ ] **Route Handlers:** `params` is awaited (Next.js 16 requirement)
- [ ] **Auth:** Cookie-based via `@supabase/ssr`, not localStorage tokens
- [ ] **RLS:** Every table has `ENABLE ROW LEVEL SECURITY` in migrations

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wireframe shape as data model | HIGH | New TechnicalConfig layer, rewrite all data hooks, possibly new schema |
| Compare mode broken | MEDIUM | Build shared `useCompareData` hook, refactor per screen |
| Monolithic components | MEDIUM | Extract hooks and sub-components (tedious but mechanical) |
| Upload/ETL skipped | HIGH | Entire data pipeline needs building; schema may need revision |
| RLS missing | HIGH | Audit every table, add RLS + policies, test every query |
| Generator too rigid | MEDIUM | Refactor to section-type dispatch; may need regeneration |
| Config screen disconnected | MEDIUM | Add shared config hooks and wire to consuming screens |
| Wrong Next.js patterns | MEDIUM | Find-and-replace Pages Router patterns. Route Handler param fixes are mechanical. |

## Sources

- FXL Core codebase: `tools/wireframe-builder/types/blueprint.ts`, `blueprint.config.ts` (1400+ lines with hardcoded display values)
- FXL Core codebase: `clients/financeiro-conta-azul/docs/blueprint.md` (business rules: cost-inversion, cross-screen deps)
- FXL Core codebase: `docs/build/seguranca.md` (AI-slop security warnings)
- FXL Core codebase: `docs/build/premissas-gerais.md` (150-line limit, folder structure)
- FXL Core codebase: `docs/build/techs/supabase.md` (RLS patterns, Edge Functions)
- Next.js 16.1.6 docs (verified 2026-03-07): Route Handlers must await params, Turbopack default, App Router required
- npm registry (verified 2026-03-07): recharts@3.8.0, @tanstack/react-query@5.90.21, nuqs@2.8.9

---
*Pitfalls research for: Automated BI dashboard generation from declarative BlueprintConfig*
*Researched: 2026-03-07*
